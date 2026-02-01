/**
 * Claude AI Service
 * Handles AI-powered stock analysis using Anthropic's Claude API
 * Supports demo mode with realistic mock data when API key is not available
 */

import { env } from '../config/env';
import { getStockInfo } from '../config/stocks';
import {
  IStockAnalysis,
  IClaudeAnalysisResponse,
  Market,
  Timeframe,
} from '../types/analysis.types';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Demo mode mock data generator
const MOCK_DATA: Record<string, Partial<IStockAnalysis>> = {
  // US Stocks
  'AAPL': {
    prediction: { direction: 'bullish', probability: 72, price_target_low: 185, price_target_high: 210, current_price: 178 },
    metrics: { rsi: 58, macd: 'positive', pe_ratio: 28.5, volume_trend: 'increasing' },
    risk_level: 'medium', confidence: 'high',
    summary: 'Apple continues to show strong momentum driven by iPhone sales and services growth. AI integration in upcoming products could be a major catalyst.',
    key_factors: ['Strong iPhone 15 sales', 'Services revenue growth', 'AI features in iOS 18', 'Stock buyback program']
  },
  'MSFT': {
    prediction: { direction: 'bullish', probability: 78, price_target_low: 420, price_target_high: 480, current_price: 415 },
    metrics: { rsi: 62, macd: 'positive', pe_ratio: 35.2, volume_trend: 'stable' },
    risk_level: 'low', confidence: 'high',
    summary: 'Microsoft benefits from Azure cloud growth and Copilot AI integration across products. Enterprise demand remains strong.',
    key_factors: ['Azure cloud growth 29%', 'Copilot AI adoption', 'Office 365 expansion', 'Gaming division growth']
  },
  'NVDA': {
    prediction: { direction: 'bullish', probability: 68, price_target_low: 800, price_target_high: 950, current_price: 875 },
    metrics: { rsi: 71, macd: 'positive', pe_ratio: 65.3, volume_trend: 'increasing' },
    risk_level: 'high', confidence: 'medium',
    summary: 'NVIDIA dominates AI chip market but high valuation brings volatility risk. Data center demand continues to exceed supply.',
    key_factors: ['AI chip demand surge', 'Data center revenue growth', 'High valuation concerns', 'Competition from AMD']
  },
  'GOOGL': {
    prediction: { direction: 'bullish', probability: 65, price_target_low: 155, price_target_high: 180, current_price: 152 },
    metrics: { rsi: 52, macd: 'neutral', pe_ratio: 24.8, volume_trend: 'stable' },
    risk_level: 'medium', confidence: 'medium',
    summary: 'Google faces AI competition but maintains strong search dominance. Cloud growth and YouTube ads provide diversification.',
    key_factors: ['Search market dominance', 'Gemini AI development', 'YouTube ad recovery', 'Antitrust concerns']
  },
  'TSLA': {
    prediction: { direction: 'neutral', probability: 50, price_target_low: 180, price_target_high: 250, current_price: 215 },
    metrics: { rsi: 45, macd: 'negative', pe_ratio: 58.7, volume_trend: 'decreasing' },
    risk_level: 'high', confidence: 'low',
    summary: 'Tesla faces margin pressure from price cuts and increased competition. FSD and energy storage offer long-term potential.',
    key_factors: ['EV price competition', 'Margin compression', 'FSD progress', 'Energy storage growth']
  },
  // BIST Stocks
  'ASELS.IS': {
    prediction: { direction: 'bullish', probability: 70, price_target_low: 85, price_target_high: 105, current_price: 82 },
    metrics: { rsi: 55, macd: 'positive', pe_ratio: 18.5, volume_trend: 'increasing' },
    risk_level: 'medium', confidence: 'high',
    summary: 'ASELSAN benefits from increased defense spending and new export contracts. Strong order backlog supports growth outlook.',
    key_factors: ['New defense contracts', 'Export market expansion', 'R&D investments', 'Government support']
  },
  'THYAO.IS': {
    prediction: { direction: 'bullish', probability: 68, price_target_low: 280, price_target_high: 340, current_price: 275 },
    metrics: { rsi: 58, macd: 'positive', pe_ratio: 5.2, volume_trend: 'stable' },
    risk_level: 'medium', confidence: 'medium',
    summary: 'Turkish Airlines shows strong passenger growth and cargo demand. New fleet deliveries and hub expansion drive capacity.',
    key_factors: ['Passenger traffic growth', 'Cargo revenue increase', 'Fleet expansion', 'Istanbul hub advantage']
  },
  'GARAN.IS': {
    prediction: { direction: 'neutral', probability: 55, price_target_low: 95, price_target_high: 120, current_price: 105 },
    metrics: { rsi: 48, macd: 'neutral', pe_ratio: 3.8, volume_trend: 'stable' },
    risk_level: 'medium', confidence: 'medium',
    summary: 'Garanti BBVA maintains solid fundamentals but faces macro uncertainty. Interest rate environment impacts net interest margin.',
    key_factors: ['Interest rate sensitivity', 'Asset quality stable', 'Digital banking growth', 'Currency volatility']
  },
};

/**
 * Generates realistic mock analysis for demo mode
 */
function generateMockAnalysis(
  ticker: string,
  market: Market,
  timeframe: Timeframe
): IStockAnalysis {
  const today = new Date().toISOString().split('T')[0];
  const stockInfo = getStockInfo(market, ticker);

  // Get predefined mock data or generate random
  const mockData = MOCK_DATA[ticker] || generateRandomMockData(ticker, stockInfo?.sector);

  // Adjust probability based on timeframe (longer = more uncertainty)
  const timeframeAdjustment = timeframe === '1M' ? 5 : timeframe === '3M' ? 0 : -5;
  const adjustedProbability = Math.min(95, Math.max(30,
    (mockData.prediction?.probability || 60) + timeframeAdjustment
  ));

  return {
    ticker,
    market,
    timeframe,
    analysis_date: today,
    prediction: {
      direction: mockData.prediction?.direction || 'neutral',
      probability: adjustedProbability,
      price_target_low: mockData.prediction?.price_target_low || 100,
      price_target_high: mockData.prediction?.price_target_high || 120,
      current_price: mockData.prediction?.current_price || 110,
    },
    metrics: {
      rsi: mockData.metrics?.rsi || 50,
      macd: mockData.metrics?.macd || 'neutral',
      pe_ratio: mockData.metrics?.pe_ratio || 15,
      volume_trend: mockData.metrics?.volume_trend || 'stable',
    },
    risk_level: mockData.risk_level || 'medium',
    summary: mockData.summary || `${ticker} analysis is currently in demo mode. Connect Anthropic API for real AI-powered insights.`,
    key_factors: mockData.key_factors || ['Demo mode active', 'Connect API for real analysis', 'Market data simulated'],
    confidence: mockData.confidence || 'medium',
  };
}

/**
 * Generates random mock data for stocks not in predefined list
 */
function generateRandomMockData(ticker: string, sector?: string): Partial<IStockAnalysis> {
  const directions: Array<'bullish' | 'bearish' | 'neutral'> = ['bullish', 'bearish', 'neutral'];
  const direction = directions[Math.floor(Math.random() * 3)];
  const basePrice = 50 + Math.random() * 200;

  return {
    prediction: {
      direction,
      probability: 45 + Math.floor(Math.random() * 30),
      price_target_low: Math.round(basePrice * 0.9 * 100) / 100,
      price_target_high: Math.round(basePrice * 1.15 * 100) / 100,
      current_price: Math.round(basePrice * 100) / 100,
    },
    metrics: {
      rsi: 30 + Math.floor(Math.random() * 40),
      macd: direction === 'bullish' ? 'positive' : direction === 'bearish' ? 'negative' : 'neutral',
      pe_ratio: Math.round((10 + Math.random() * 30) * 10) / 10,
      volume_trend: (['increasing', 'decreasing', 'stable'] as const)[Math.floor(Math.random() * 3)],
    },
    risk_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
    confidence: 'low',
    summary: `${ticker} in ${sector || 'unknown'} sector. This is demo data - connect Anthropic API for real AI analysis.`,
    key_factors: ['Demo mode', 'Simulated metrics', 'API not connected'],
  };
}

/**
 * Sleep utility for retry logic
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Analyzes a stock using Claude AI (or mock data in demo mode)
 */
export async function analyzeStock(
  ticker: string,
  market: Market,
  timeframe: Timeframe
): Promise<IStockAnalysis> {
  // Return mock data in demo mode
  if (env.DEMO_MODE) {
    // Simulate API delay for realistic feel
    await sleep(500 + Math.random() * 1000);
    return generateMockAnalysis(ticker, market, timeframe);
  }

  // Real API call
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const anthropicClient = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const today = new Date().toISOString().split('T')[0];
  const prompt = generateAnalysisPrompt(ticker, market, timeframe, today);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const message = await anthropicClient.messages.create({
        model: env.ANTHROPIC_MODEL,
        max_tokens: env.ANTHROPIC_MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }],
      });

      const textContent = message.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in AI response');
      }

      const parsed = parseAIResponse(textContent.text);

      return {
        ticker: parsed.ticker,
        market: parsed.market,
        timeframe: parsed.timeframe,
        analysis_date: parsed.analysis_date,
        prediction: parsed.prediction,
        metrics: parsed.metrics,
        risk_level: parsed.risk_level,
        summary: parsed.summary,
        key_factors: parsed.key_factors,
        confidence: parsed.confidence,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[ClaudeAI] Attempt ${attempt}/${MAX_RETRIES} failed:`, lastError.message);

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError || new Error('Failed to analyze stock after all retries');
}

/**
 * Generates the analysis prompt for Claude
 */
function generateAnalysisPrompt(ticker: string, market: Market, timeframe: Timeframe, today: string): string {
  return `You are a financial analyst. Analyze the following stock for a ${timeframe} outlook.

### Stock Details:
- **Market:** ${market}
- **Ticker:** ${ticker}
- **Timeframe:** ${timeframe}
- **Analysis Date:** ${today}

### Response Format (JSON ONLY):
\`\`\`json
{
  "ticker": "${ticker}",
  "market": "${market}",
  "timeframe": "${timeframe}",
  "analysis_date": "${today}",
  "prediction": { "direction": "bullish|bearish|neutral", "probability": 0-100, "price_target_low": 0, "price_target_high": 0, "current_price": 0 },
  "metrics": { "rsi": 0-100, "macd": "positive|negative|neutral", "pe_ratio": 0, "volume_trend": "increasing|decreasing|stable" },
  "risk_level": "low|medium|high",
  "summary": "2-3 sentence summary",
  "key_factors": ["factor1", "factor2", "factor3"],
  "confidence": "low|medium|high"
}
\`\`\`

Return ONLY valid JSON.`;
}

/**
 * Parses and validates the AI response
 */
function parseAIResponse(responseText: string): IClaudeAnalysisResponse {
  let jsonStr = responseText.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) jsonStr = jsonMatch[1].trim();

  const parsed = JSON.parse(jsonStr);
  return parsed as IClaudeAnalysisResponse;
}

/**
 * Test the AI service
 */
export async function testAIService(): Promise<{
  success: boolean;
  responseTime: number;
  demoMode: boolean;
  analysis?: IStockAnalysis;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    const analysis = await analyzeStock('AAPL', 'US', '3M');
    return {
      success: true,
      responseTime: Date.now() - startTime,
      demoMode: env.DEMO_MODE,
      analysis,
    };
  } catch (error) {
    return {
      success: false,
      responseTime: Date.now() - startTime,
      demoMode: env.DEMO_MODE,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default { analyzeStock, testAIService };
