/**
 * AnalysisDashboard Page
 * Main dashboard for AI-powered stock analysis
 */

import { useState } from 'react';
import { Market, IStockWithAnalysis } from '../types/analysis.types';
import { useAnalysis } from '../hooks/useAnalysis';
import { MarketTabs } from '../components/MarketTabs';
import { StockAnalysisCard } from '../components/StockAnalysisCard';
import { AnalysisModal } from '../components/AnalysisModal';

export function AnalysisDashboard() {
  const [market, setMarket] = useState<Market>('US');

  const {
    stocks,
    isLoadingStocks,
    isLoadingAnalysis,
    isGeneratingAll,
    currentGeneratingTicker,
    error,
    selectedAnalysis,
    selectedStock,
    selectStock,
    clearSelection,
    refetch,
    analysisCount,
    generateAllAnalyses,
  } = useAnalysis(market);

  const pendingCount = stocks.filter((s) => !s.hasAnalysisToday).length;

  // Create a placeholder stock for loading skeleton
  const placeholderStock: IStockWithAnalysis = {
    ticker: '',
    name: '',
    sector: '',
    hasAnalysisToday: false,
    analysis: null,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            AI-Powered Stock Analysis
          </h1>
          <p className="text-navy-300 text-lg max-w-2xl">
            Get comprehensive stock analysis powered by Gemini AI. Select a market to
            view predictions, technical metrics, and key factors affecting your investments.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          {/* Generate All Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={generateAllAnalyses}
              disabled={isGeneratingAll || pendingCount === 0 || isLoadingStocks}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isGeneratingAll || pendingCount === 0 || isLoadingStocks
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-navy-800 text-white hover:bg-navy-700'
              }`}
            >
              {isGeneratingAll ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating... ({currentGeneratingTicker})
                </span>
              ) : pendingCount === 0 ? (
                'All Analyzed'
              ) : (
                `Generate All (${pendingCount})`
              )}
            </button>
          </div>

          {/* Status & Refresh */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              {analysisCount} / {stocks.length} analyzed today
            </span>
            <button
              onClick={refetch}
              disabled={isGeneratingAll}
              className="px-4 py-2 text-sm text-navy-600 hover:text-navy-800 hover:bg-navy-50 rounded-lg transition-colors disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
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
                  stockInfo={placeholderStock}
                  isLoading
                />
              ))
            : stocks.map((stock) => (
                <StockAnalysisCard
                  key={stock.ticker}
                  stockInfo={stock}
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
        <div className="mt-12 bg-navy-50 border border-navy-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-navy-800 mb-2">
            About AI Stock Analysis
          </h3>
          <p className="text-navy-600 text-sm leading-relaxed">
            Our AI-powered analysis uses Gemini to evaluate technical indicators, fundamental
            factors, and macro conditions to provide actionable insights. Analysis is generated
            once per day per stock. Use "Generate All" to analyze all stocks at once, or click
            individual stocks to generate their analysis.
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
