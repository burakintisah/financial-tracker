/**
 * useAnalysis Custom Hook
 * Manages stock analysis data fetching and state
 */

import { useState, useEffect, useCallback } from 'react';
import { analysisApi } from '../services/analysis.api';
import {
  Market,
  IStockAnalysis,
  IStockWithAnalysis,
} from '../types/analysis.types';

const DEFAULT_TIMEFRAME = '3M' as const;

interface UseAnalysisState {
  stocks: IStockWithAnalysis[];
  analyses: Map<string, IStockAnalysis>;
  isLoadingStocks: boolean;
  isLoadingAnalysis: boolean;
  error: string | null;
  selectedAnalysis: IStockAnalysis | null;
  selectedStock: IStockWithAnalysis | null;
  analysisCount: number;
}

interface UseAnalysisReturn extends UseAnalysisState {
  fetchAnalysis: (ticker: string) => Promise<void>;
  selectStock: (stock: IStockWithAnalysis) => void;
  clearSelection: () => void;
  refetch: () => void;
}

export function useAnalysis(market: Market): UseAnalysisReturn {
  const [state, setState] = useState<UseAnalysisState>({
    stocks: [],
    analyses: new Map(),
    isLoadingStocks: true,
    isLoadingAnalysis: false,
    error: null,
    selectedAnalysis: null,
    selectedStock: null,
    analysisCount: 0,
  });

  // Fetch trending stocks with today's analysis status
  const fetchStocks = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoadingStocks: true, error: null }));

    try {
      const { stocks, analysisCount } = await analysisApi.getTrendingStocks(market);

      // Pre-populate analyses map with today's data
      const analysesMap = new Map<string, IStockAnalysis>();
      for (const stock of stocks) {
        if (stock.analysis) {
          analysesMap.set(stock.ticker, stock.analysis);
        }
      }

      setState((prev) => ({
        ...prev,
        stocks,
        analyses: analysesMap,
        isLoadingStocks: false,
        analysisCount,
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

  // Fetch analysis for a specific stock (only if not already available)
  const fetchAnalysis = useCallback(
    async (ticker: string) => {
      const stock = state.stocks.find((s) => s.ticker === ticker);
      if (!stock) return;

      // If we already have today's analysis, use it
      if (stock.hasAnalysisToday && stock.analysis) {
        setState((prev) => ({
          ...prev,
          selectedStock: stock,
          selectedAnalysis: stock.analysis,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isLoadingAnalysis: true,
        error: null,
        selectedStock: stock,
        selectedAnalysis: prev.analyses.get(ticker) || null,
      }));

      try {
        const { analysis } = await analysisApi.getAnalysis(market, ticker, DEFAULT_TIMEFRAME);

        setState((prev) => {
          const newAnalyses = new Map(prev.analyses);
          newAnalyses.set(ticker, analysis);

          // Update the stock's analysis status
          const updatedStocks = prev.stocks.map((s) =>
            s.ticker === ticker
              ? { ...s, hasAnalysisToday: true, analysis }
              : s
          );

          return {
            ...prev,
            stocks: updatedStocks,
            analyses: newAnalyses,
            selectedAnalysis: analysis,
            isLoadingAnalysis: false,
            analysisCount: prev.analysisCount + 1,
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
    [market, state.stocks]
  );

  // Select a stock for viewing
  const selectStock = useCallback(
    (stock: IStockWithAnalysis) => {
      // If stock already has today's analysis, show it directly
      if (stock.hasAnalysisToday && stock.analysis) {
        setState((prev) => ({
          ...prev,
          selectedStock: stock,
          selectedAnalysis: stock.analysis,
        }));
      } else {
        // Otherwise fetch new analysis
        setState((prev) => ({
          ...prev,
          selectedStock: stock,
          selectedAnalysis: null,
        }));
        fetchAnalysis(stock.ticker);
      }
    },
    [fetchAnalysis]
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
