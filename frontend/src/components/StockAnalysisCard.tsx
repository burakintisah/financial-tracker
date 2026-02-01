/**
 * StockAnalysisCard Component
 * Displays stock analysis information in a card format
 */

import { IStockAnalysis, IStockInfo } from '../types/analysis.types';

interface StockAnalysisCardProps {
  analysis?: IStockAnalysis;
  stockInfo: IStockInfo;
  isLoading?: boolean;
  onViewDetails?: () => void;
}

function PredictionBadge({ direction }: { direction: string }) {
  const config = {
    bullish: { color: 'bg-green-100 text-green-800', icon: '🟢', label: 'Bullish' },
    bearish: { color: 'bg-red-100 text-red-800', icon: '🔴', label: 'Bearish' },
    neutral: { color: 'bg-gray-100 text-gray-800', icon: '🟡', label: 'Neutral' },
  };

  const { color, icon, label } = config[direction as keyof typeof config] || config.neutral;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium ${color}`}>
      {icon} {label}
    </span>
  );
}

function RiskBadge({ level }: { level: string }) {
  const config = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const color = config[level as keyof typeof config] || config.medium;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${color}`}>
      {level} Risk
    </span>
  );
}

function ProbabilityBar({ probability }: { probability: number }) {
  const color =
    probability >= 70 ? 'bg-green-500' :
    probability >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">Probability</span>
        <span className="font-medium">{probability}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${probability}%` }}
        />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-8 bg-gray-200 rounded w-full mt-4"></div>
      </div>
    </div>
  );
}

export function StockAnalysisCard({
  analysis,
  stockInfo,
  isLoading,
  onViewDetails,
}: StockAnalysisCardProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 font-mono">{stockInfo.ticker}</h3>
          <p className="text-sm text-gray-600">{stockInfo.name}</p>
          <p className="text-xs text-gray-400">{stockInfo.sector}</p>
        </div>
        {analysis && <PredictionBadge direction={analysis.prediction.direction} />}
      </div>

      {analysis ? (
        <>
          <ProbabilityBar probability={analysis.prediction.probability} />

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Target Low</span>
              <p className="font-medium text-gray-800">
                ${analysis.prediction.price_target_low.toFixed(2)}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Target High</span>
              <p className="font-medium text-gray-800">
                ${analysis.prediction.price_target_high.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <RiskBadge level={analysis.risk_level} />
            <span className="text-xs text-gray-400">
              Confidence: {analysis.confidence}
            </span>
          </div>

          <p className="mt-4 text-sm text-gray-600 line-clamp-2">{analysis.summary}</p>

          <button
            onClick={onViewDetails}
            className="mt-4 w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
          >
            View Details
          </button>
        </>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-4">No analysis available yet</p>
          <button
            onClick={onViewDetails}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Generate Analysis
          </button>
        </div>
      )}
    </div>
  );
}

export default StockAnalysisCard;
