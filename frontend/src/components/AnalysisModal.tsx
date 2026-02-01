/**
 * AnalysisModal Component
 * Displays detailed stock analysis in a modal
 */

import { useEffect } from 'react';
import { IStockAnalysis, IStockWithAnalysis } from '../types/analysis.types';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: IStockAnalysis | null;
  stockInfo: IStockWithAnalysis | null;
  isLoading?: boolean;
  error?: string | null;
}

function MetricCard({ label, value, subtext }: { label: string; value: string | number; subtext?: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
      {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
    </div>
  );
}

function DirectionIndicator({ direction }: { direction: string }) {
  const config = {
    bullish: { color: 'text-green-600', bg: 'bg-green-100', label: 'Bullish' },
    bearish: { color: 'text-red-600', bg: 'bg-red-100', label: 'Bearish' },
    neutral: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Neutral' },
  };

  const { color, bg, label } = config[direction as keyof typeof config] || config.neutral;

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${bg}`}>
      <span className={`text-2xl font-bold ${color}`}>{label}</span>
    </div>
  );
}

export function AnalysisModal({
  isOpen,
  onClose,
  analysis,
  stockInfo,
  isLoading,
  error,
}: AnalysisModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-800 font-mono">
                  {stockInfo?.ticker || 'Loading...'}
                </h2>
                <p className="text-sm text-gray-600">{stockInfo?.name}</p>
                <p className="text-xs text-gray-400">{stockInfo?.sector}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600">Generating AI analysis...</p>
                <p className="text-sm text-gray-400">This may take a moment</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {analysis && !isLoading && (
              <>
                {/* Prediction */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Prediction
                  </h3>
                  <div className="flex items-center justify-between">
                    <DirectionIndicator direction={analysis.prediction.direction} />
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-800">
                        {analysis.prediction.probability}%
                      </p>
                      <p className="text-sm text-gray-500">Probability</p>
                    </div>
                  </div>
                </div>

                {/* Price Targets */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Price Targets
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <MetricCard
                      label="Current Price"
                      value={`$${analysis.prediction.current_price.toFixed(2)}`}
                    />
                    <MetricCard
                      label="Target Low"
                      value={`$${analysis.prediction.price_target_low.toFixed(2)}`}
                    />
                    <MetricCard
                      label="Target High"
                      value={`$${analysis.prediction.price_target_high.toFixed(2)}`}
                    />
                  </div>
                </div>

                {/* Technical Metrics */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Technical Metrics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard label="RSI" value={analysis.metrics.rsi} subtext={
                      analysis.metrics.rsi > 70 ? 'Overbought' :
                      analysis.metrics.rsi < 30 ? 'Oversold' : 'Neutral'
                    } />
                    <MetricCard label="MACD" value={analysis.metrics.macd} />
                    <MetricCard label="P/E Ratio" value={analysis.metrics.pe_ratio.toFixed(2)} />
                    <MetricCard label="Volume Trend" value={analysis.metrics.volume_trend} />
                  </div>
                </div>

                {/* Risk & Confidence */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Risk Assessment
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${
                      analysis.risk_level === 'low' ? 'bg-green-50' :
                      analysis.risk_level === 'medium' ? 'bg-yellow-50' : 'bg-red-50'
                    }`}>
                      <p className="text-sm text-gray-500">Risk Level</p>
                      <p className={`text-lg font-semibold capitalize ${
                        analysis.risk_level === 'low' ? 'text-green-700' :
                        analysis.risk_level === 'medium' ? 'text-yellow-700' : 'text-red-700'
                      }`}>
                        {analysis.risk_level}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${
                      analysis.confidence === 'high' ? 'bg-green-50' :
                      analysis.confidence === 'medium' ? 'bg-yellow-50' : 'bg-gray-50'
                    }`}>
                      <p className="text-sm text-gray-500">Confidence</p>
                      <p className={`text-lg font-semibold capitalize ${
                        analysis.confidence === 'high' ? 'text-green-700' :
                        analysis.confidence === 'medium' ? 'text-yellow-700' : 'text-gray-700'
                      }`}>
                        {analysis.confidence}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Factors */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Key Factors
                  </h3>
                  <ul className="space-y-2">
                    {analysis.key_factors.map((factor, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span className="text-gray-700">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Summary */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Summary
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
                </div>

                {/* Analysis Date */}
                <div className="text-xs text-gray-400 text-center">
                  Analysis Date: {analysis.analysis_date} | Timeframe: {analysis.timeframe}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalysisModal;
