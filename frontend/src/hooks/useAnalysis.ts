/**
 * useAnalysis Custom Hook
 * Manages stock analysis data fetching and state
 */

import { useState, useEffect, useCallback } from 'react';
import { analysisApi } from '../services/analysis.api';
import {
  Market,
  Timeframe,
  IStockAnalysis,
  IStockInfo,
} from '../types/analysis.types';

interface UseAnalysisState {
  stocks: IStockInfo[];
  analyses: Map<string, IStockAnalysis>;
  isLoadingStocks: boolean;
  isLoadingAnalysis: boolean;
  error: string | null;
  selectedAnalysis: IStockAnalysis | null;
  selectedStock: IStockInfo | null;
}

interface UseAnalysisReturn extends UseAnalysisState {
  fetchAnalysis: (ticker: string) => Promise<void>;
  selectStock: (stock: IStockInfo) => void;
  clearSelection: () => void;
  refetch: () => void;
}

export function useAnalysis(market: Market, timeframe: Timeframe): UseAnalysisReturn {
  const [state, setState] = useState<UseAnalysisState>({
    stocks: [],
    analyses: new Map(),
    isLoadingStocks: true,
    isLoadingAnalysis: false,
    error: null,
    selectedAnalysis: null,
    selectedStock: null,
  });

  // Fetch trending stocks when market changes
  const fetchStocks = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoadingStocks: true, error: null }));

    try {
      const stocks = await analysisApi.getTrendingStocks(market);
      setState((prev) => ({
        ...prev,
        stocks,
        isLoadingStocks: false,
        analyses: new Map(), // Clear analyses when market changes
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoadingStocks: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stocks',
      }));
    }
  }, [market]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  // Clear analyses when timeframe changes
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      analyses: new Map(),
      selectedAnalysis: null,
    }));
  }, [timeframe]);

  // Fetch analysis for a specific stock
  const fetchAnalysis = useCallback(
    async (ticker: string) => {
      // Find the stock info
      const stock = state.stocks.find((s) => s.ticker === ticker);
      if (!stock) return;

      setState((prev) => ({
        ...prev,
        isLoadingAnalysis: true,
        error: null,
        selectedStock: stock,
        selectedAnalysis: prev.analyses.get(ticker) || null,
      }));

      try {
        const { analysis } = await analysisApi.getAnalysis(market, ticker, timeframe);

        setState((prev) => {
          const newAnalyses = new Map(prev.analyses);
          newAnalyses.set(ticker, analysis);

          return {
            ...prev,
            analyses: newAnalyses,
            selectedAnalysis: analysis,
            isLoadingAnalysis: false,
          };
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoadingAnalysis: false,
          error: error instanceof Error ? error.message : 'Failed to fetch analysis',
        }));
      }
    },
    [market, timeframe, state.stocks]
  );

  // Select a stock for viewing
  const selectStock = useCallback(
    (stock: IStockInfo) => {
      const existingAnalysis = state.analyses.get(stock.ticker);

      setState((prev) => ({
        ...prev,
        selectedStock: stock,
        selectedAnalysis: existingAnalysis || null,
      }));

      // Fetch analysis if not already loaded
      if (!existingAnalysis) {
        fetchAnalysis(stock.ticker);
      }
    },
    [state.analyses, fetchAnalysis]
  );

  // Clear selection
  const clearSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedStock: null,
      selectedAnalysis: null,
      error: null,
    }));
  }, []);

  // Refetch stocks
  const refetch = useCallback(() => {
    fetchStocks();
  }, [fetchStocks]);

  return {
    ...state,
    fetchAnalysis,
    selectStock,
    clearSelection,
    refetch,
  };
}

export default useAnalysis;
