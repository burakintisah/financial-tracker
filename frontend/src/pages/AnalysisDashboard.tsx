/**
 * AnalysisDashboard Page
 * Main dashboard for AI-powered stock analysis
 */

import { useState } from 'react';
import { Market, Timeframe } from '../types/analysis.types';
import { useAnalysis } from '../hooks/useAnalysis';
import { TimeframeSelector } from '../components/TimeframeSelector';
import { MarketTabs } from '../components/MarketTabs';
import { StockAnalysisCard } from '../components/StockAnalysisCard';
import { AnalysisModal } from '../components/AnalysisModal';

export function AnalysisDashboard() {
  const [market, setMarket] = useState<Market>('US');
  const [timeframe, setTimeframe] = useState<Timeframe>('3M');

  const {
    stocks,
    analyses,
    isLoadingStocks,
    isLoadingAnalysis,
    error,
    selectedAnalysis,
    selectedStock,
    selectStock,
    clearSelection,
    refetch,
  } = useAnalysis(market, timeframe);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            AI-Powered Stock Analysis
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            Get comprehensive stock analysis powered by Claude AI. Select a market and
            timeframe to view predictions, technical metrics, and key factors affecting
            your investments.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <TimeframeSelector selected={timeframe} onChange={setTimeframe} />
          <button
            onClick={refetch}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Market Tabs */}
        <div className="mb-8">
          <MarketTabs
            selected={market}
            onChange={setMarket}
            stockCounts={{
              BIST: market === 'BIST' ? stocks.length : 15,
              US: market === 'US' ? stocks.length : 15,
            }}
          />
        </div>

        {/* Error State */}
        {error && !selectedStock && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-medium">Error loading stocks</p>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={refetch}
              className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stock Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingStocks
            ? Array.from({ length: 6 }).map((_, i) => (
                <StockAnalysisCard
                  key={i}
                  stockInfo={{ ticker: '', name: '', sector: '' }}
                  isLoading
                />
              ))
            : stocks.map((stock) => (
                <StockAnalysisCard
                  key={stock.ticker}
                  stockInfo={stock}
                  analysis={analyses.get(stock.ticker)}
                  onViewDetails={() => selectStock(stock)}
                />
              ))}
        </div>

        {/* Empty State */}
        {!isLoadingStocks && stocks.length === 0 && !error && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No stocks available</h3>
            <p className="text-gray-500">Check back later for stock analysis</p>
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-800 mb-2">
            About AI Stock Analysis
          </h3>
          <p className="text-blue-700 text-sm leading-relaxed">
            Our AI-powered analysis uses Claude to evaluate technical indicators, fundamental
            factors, and macro conditions to provide actionable insights. Analysis results are
            cached for 24 hours to ensure quick access. Remember that all predictions are based
            on historical data and should not be considered as financial advice.
          </p>
        </div>
      </div>

      {/* Analysis Modal */}
      <AnalysisModal
        isOpen={!!selectedStock}
        onClose={clearSelection}
        analysis={selectedAnalysis}
        stockInfo={selectedStock}
        isLoading={isLoadingAnalysis}
        error={error}
      />
    </div>
  );
}

export default AnalysisDashboard;
