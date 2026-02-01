/**
 * Stock Analysis Types
 * TypeScript interfaces for the AI-powered stock analysis feature
 */

export type Market = 'BIST' | 'US';
export type Timeframe = '1M' | '3M' | '6M';
export type PredictionDirection = 'bullish' | 'bearish' | 'neutral';
export type RiskLevel = 'low' | 'medium' | 'high';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type MacdSignal = 'positive' | 'negative' | 'neutral';
export type VolumeTrend = 'increasing' | 'decreasing' | 'stable';

export interface IPrediction {
  direction: PredictionDirection;
  probability: number;
  price_target_low: number;
  price_target_high: number;
  current_price: number;
}

export interface IMetrics {
  rsi: number;
  macd: MacdSignal;
  pe_ratio: number;
  volume_trend: VolumeTrend;
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

export interface IStockAnalysisDB extends Omit<IStockAnalysis, 'prediction' | 'metrics'> {
  id: string;
  prediction_direction: PredictionDirection;
  probability: number;
  price_target_low: number;
  price_target_high: number;
  current_price: number;
  rsi: number;
  macd: string;
  pe_ratio: number;
  volume_trend: string;
  raw_response: IClaudeAnalysisResponse | null;
  created_at: string;
  updated_at: string;
}

export interface IAnalysisCache {
  id: string;
  cache_key: string;
  last_analysis_id: string;
  expires_at: string;
  created_at: string;
}

export interface IClaudeAnalysisResponse {
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

export interface IAnalysisRequest {
  market: Market;
  ticker: string;
  timeframe: Timeframe;
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

export interface IBulkAnalysisRequest {
  tickers: Array<{
    market: Market;
    ticker: string;
    timeframe: Timeframe;
  }>;
}

export interface IBulkAnalysisResponse {
  success: boolean;
  data?: IStockAnalysis[];
  errors?: Array<{
    ticker: string;
    error: string;
  }>;
}

// Database row to API response transformer
export function dbRowToAnalysis(row: IStockAnalysisDB): IStockAnalysis {
  return {
    ticker: row.ticker,
    market: row.market,
    timeframe: row.timeframe,
    analysis_date: row.analysis_date,
    prediction: {
      direction: row.prediction_direction,
      probability: row.probability,
      price_target_low: row.price_target_low,
      price_target_high: row.price_target_high,
      current_price: row.current_price,
    },
    metrics: {
      rsi: row.rsi,
      macd: row.macd as MacdSignal,
      pe_ratio: row.pe_ratio,
      volume_trend: row.volume_trend as VolumeTrend,
    },
    risk_level: row.risk_level,
    summary: row.summary,
    key_factors: row.key_factors,
    confidence: row.confidence,
  };
}

// API response to database row transformer
export function analysisToDbRow(
  analysis: IStockAnalysis,
  rawResponse: IClaudeAnalysisResponse
): Omit<IStockAnalysisDB, 'id' | 'created_at' | 'updated_at'> {
  return {
    ticker: analysis.ticker,
    market: analysis.market,
    timeframe: analysis.timeframe,
    analysis_date: analysis.analysis_date,
    prediction_direction: analysis.prediction.direction,
    probability: analysis.prediction.probability,
    price_target_low: analysis.prediction.price_target_low,
    price_target_high: analysis.prediction.price_target_high,
    current_price: analysis.prediction.current_price,
    rsi: analysis.metrics.rsi,
    macd: analysis.metrics.macd,
    pe_ratio: analysis.metrics.pe_ratio,
    volume_trend: analysis.metrics.volume_trend,
    risk_level: analysis.risk_level,
    summary: analysis.summary,
    key_factors: analysis.key_factors,
    confidence: analysis.confidence,
    raw_response: rawResponse,
  };
}
