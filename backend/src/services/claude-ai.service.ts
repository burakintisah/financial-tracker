/**
 * Claude AI Service
 * Handles AI-powered stock analysis using Anthropic's Claude API
 */

import anthropicClient, { claudeConfig } from '../config/claude';
import { getStockInfo } from '../config/stocks';
import {
  IStockAnalysis,
  IClaudeAnalysisResponse,
  Market,
  Timeframe,
} from '../types/analysis.types';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Generates the analysis prompt for Claude
 */
function generateAnalysisPrompt(
  ticker: string,
  market: Market,
  timeframe: Timeframe,
  today: string
): string {
  return `You are a financial analyst. Analyze the following stock for a ${timeframe} outlook.

### Stock Details:
- **Market:** ${market} (${market === 'BIST' ? 'Istanbul Stock Exchange' : 'US Stock Market'})
- **Ticker:** ${ticker}
- **Timeframe:** ${timeframe} (${timeframe === '1M' ? '1 Month' : timeframe === '3M' ? '3 Months' : '6 Months'})
- **Analysis Date:** ${today}

### Your Task:

1. **Technical Analysis Metrics:**
   - RSI (Relative Strength Index)
   - MACD
   - Moving Averages (50-day, 200-day)
   - Support/Resistance levels
   - Volume trends

2. **Fundamental Factors:**
   - P/E Ratio
   - Sector performance
   - Recent quarterly results
   - Major news/developments

3. **Macro Factors:**
   - Overall market trend
   - Interest rates
   - Currency impacts (important for BIST)
   - Global economic conditions

4. **Prediction & Recommendation:**
   - Expected price range in ${timeframe}
   - Upside probability (%)
   - Risk level (Low/Medium/High)
   - Brief summary (2-3 sentences)

### Response Format (JSON ONLY):
\`\`\`json
{
  "ticker": "${ticker}",
  "market": "${market}",
  "timeframe": "${timeframe}",
  "analysis_date": "${today}",
  "prediction": {
    "direction": "bullish",
    "probability": 75,
    "price_target_low": 85.5,
    "price_target_high": 95.0,
    "current_price": 80.0
  },
  "metrics": {
    "rsi": 58,
    "macd": "positive",
    "pe_ratio": 12.5,
    "volume_trend": "increasing"
  },
  "risk_level": "medium",
  "summary": "Brief 2-3 sentence analysis summary here.",
  "key_factors": [
    "Factor 1",
    "Factor 2",
    "Factor 3"
  ],
  "confidence": "high"
}
\`\`\`

**IMPORTANT:** Return ONLY the JSON response, no additional explanation. Ensure all numeric values are realistic based on current market conditions.`;
}

/**
 * Parses and validates the AI response
 */
function parseAIResponse(responseText: string): IClaudeAnalysisResponse {
  // Extract JSON from the response (handle potential markdown code blocks)
  let jsonStr = responseText.trim();

  // Remove markdown code blocks if present
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);

    // Validate required fields
    const requiredFields = [
      'ticker',
      'market',
      'timeframe',
      'analysis_date',
      'prediction',
      'metrics',
      'risk_level',
      'summary',
      'key_factors',
      'confidence',
    ];

    for (const field of requiredFields) {
      if (!(field in parsed)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate prediction object
    const predictionFields = [
      'direction',
      'probability',
      'price_target_low',
      'price_target_high',
      'current_price',
    ];
    for (const field of predictionFields) {
      if (!(field in parsed.prediction)) {
        throw new Error(`Missing prediction field: ${field}`);
      }
    }

    // Validate metrics object
    const metricsFields = ['rsi', 'macd', 'pe_ratio', 'volume_trend'];
    for (const field of metricsFields) {
      if (!(field in parsed.metrics)) {
        throw new Error(`Missing metrics field: ${field}`);
      }
    }

    // Validate enum values
    const validDirections = ['bullish', 'bearish', 'neutral'];
    if (!validDirections.includes(parsed.prediction.direction)) {
      throw new Error(`Invalid prediction direction: ${parsed.prediction.direction}`);
    }

    const validRiskLevels = ['low', 'medium', 'high'];
    if (!validRiskLevels.includes(parsed.risk_level)) {
      throw new Error(`Invalid risk level: ${parsed.risk_level}`);
    }

    const validConfidenceLevels = ['low', 'medium', 'high'];
    if (!validConfidenceLevels.includes(parsed.confidence)) {
      throw new Error(`Invalid confidence level: ${parsed.confidence}`);
    }

    // Validate numeric ranges
    if (parsed.prediction.probability < 0 || parsed.prediction.probability > 100) {
      throw new Error('Probability must be between 0 and 100');
    }

    if (parsed.metrics.rsi < 0 || parsed.metrics.rsi > 100) {
      throw new Error('RSI must be between 0 and 100');
    }

    return parsed as IClaudeAnalysisResponse;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse AI response as JSON: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Sleep utility for retry logic
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Analyzes a stock using Claude AI
 */
export async function analyzeStock(
  ticker: string,
  market: Market,
  timeframe: Timeframe
): Promise<IStockAnalysis> {
  const today = new Date().toISOString().split('T')[0];
  const prompt = generateAnalysisPrompt(ticker, market, timeframe, today);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const message = await anthropicClient.messages.create({
        model: claudeConfig.model,
        max_tokens: claudeConfig.maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract text content from the response
      const textContent = message.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in AI response');
      }

      const parsed = parseAIResponse(textContent.text);

      // Enhance with stock info if available
      const stockInfo = getStockInfo(market, ticker);

      const analysis: IStockAnalysis = {
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

      return analysis;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Log error without exposing sensitive data
      console.error(
        `[ClaudeAI] Attempt ${attempt}/${MAX_RETRIES} failed for ${ticker}:`,
        lastError.message
      );

      // Don't retry on validation errors
      if (
        lastError.message.includes('Missing required field') ||
        lastError.message.includes('Invalid prediction') ||
        lastError.message.includes('Invalid risk level') ||
        lastError.message.includes('Invalid confidence')
      ) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError || new Error('Failed to analyze stock after all retries');
}

/**
 * Test the AI service with a sample stock
 */
export async function testAIService(): Promise<{
  success: boolean;
  responseTime: number;
  analysis?: IStockAnalysis;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    const analysis = await analyzeStock('AAPL', 'US', '3M');
    const responseTime = Date.now() - startTime;

    return {
      success: true,
      responseTime,
      analysis,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      success: false,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default {
  analyzeStock,
  testAIService,
};
