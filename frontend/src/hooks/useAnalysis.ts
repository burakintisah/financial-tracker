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
  isGeneratingAll: boolean;
  currentGeneratingTicker: string | null;
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
  generateAllAnalyses: () => Promise<void>;
}

export function useAnalysis(market: Market): UseAnalysisReturn {
  const [state, setState] = useState<UseAnalysisState>({
    stocks: [],
    analyses: new Map(),
    isLoadingStocks: true,
    isLoadingAnalysis: false,
    isGeneratingAll: false,
    currentGeneratingTicker: null,
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

  // Generate analysis for all stocks that don't have one today
  const generateAllAnalyses = useCallback(async () => {
    const stocksWithoutAnalysis = state.stocks.filter((s) => !s.hasAnalysisToday);

    if (stocksWithoutAnalysis.length === 0) return;

    setState((prev) => ({ ...prev, isGeneratingAll: true, error: null }));

    for (const stock of stocksWithoutAnalysis) {
      setState((prev) => ({ ...prev, currentGeneratingTicker: stock.ticker }));

      try {
        const { analysis } = await analysisApi.getAnalysis(market, stock.ticker, DEFAULT_TIMEFRAME);

        setState((prev) => {
          const newAnalyses = new Map(prev.analyses);
          newAnalyses.set(stock.ticker, analysis);

          const updatedStocks = prev.stocks.map((s) =>
            s.ticker === stock.ticker
              ? { ...s, hasAnalysisToday: true, analysis }
              : s
          );

          return {
            ...prev,
            stocks: updatedStocks,
            analyses: newAnalyses,
            analysisCount: prev.analysisCount + 1,
          };
        });
      } catch (error) {
        console.error(`Failed to generate analysis for ${stock.ticker}:`, error);
        // Continue with next stock even if one fails
      }

      // Small delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setState((prev) => ({
      ...prev,
      isGeneratingAll: false,
      currentGeneratingTicker: null,
    }));
  }, [market, state.stocks]);

  return {
    ...state,
    fetchAnalysis,
    selectStock,
    clearSelection,
    refetch,
    generateAllAnalyses,
  };
}

export default useAnalysis;
