/**
 * Stock Analysis Types for Frontend
 */

export type Market = 'BIST' | 'US';
export type Timeframe = '1M' | '3M' | '6M';
export type PredictionDirection = 'bullish' | 'bearish' | 'neutral';
export type RiskLevel = 'low' | 'medium' | 'high';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface IPrediction {
  direction: PredictionDirection;
  probability: number;
  price_target_low: number;
  price_target_high: number;
  current_price: number;
}

export interface IMetrics {
  rsi: number;
  macd: string;
  pe_ratio: number;
  volume_trend: string;
}

export interface IStockAnalysis {
  ticker: string;
  market: Market;
  timeframe: Timeframe;
  analysis_date: string;
  prediction: IPrediction;
  metrics: IMetrics;
  risk_level: RiskLevel;
  summary: string;
  key_factors: string[];
  confidence: ConfidenceLevel;
}

export interface IStockInfo {
  ticker: string;
  name: string;
  sector: string;
}

export interface IAnalysisResponse {
  success: boolean;
  data?: IStockAnalysis;
  cached?: boolean;
  error?: string;
}

export interface ITrendingResponse {
  success: boolean;
  data?: IStockInfo[];
  market?: Market;
  error?: string;
}

export interface IHealthResponse {
  success: boolean;
  status: string;
  timestamp: string;
  stats?: {
    totalAnalyses: number;
    cachedEntries: number;
    expiredEntries: number;
  };
}
