/**
 * Analysis Controller
 * Handles HTTP requests for stock analysis endpoints
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { getOrCreateAnalysis, getAnalysisStats, getTodayAnalyses } from '../services/stock-analysis.service';
import { testAIService } from '../services/claude-ai.service';
import { getStocksByMarket, isValidTicker } from '../config/stocks';
import { Market, Timeframe } from '../types/analysis.types';

// Request validation schemas
const marketSchema = z.enum(['BIST', 'US']);
const timeframeSchema = z.enum(['1M', '3M', '6M']);

const analysisParamsSchema = z.object({
  market: marketSchema,
  ticker: z.string().min(1).max(20),
  timeframe: timeframeSchema,
});

const bulkAnalysisSchema = z.object({
  tickers: z.array(
    z.object({
      market: marketSchema,
      ticker: z.string().min(1).max(20),
      timeframe: timeframeSchema,
    })
  ).min(1).max(10),
});

/**
 * Get analysis for a single stock
 * GET /api/analysis/:market/:ticker/:timeframe
 */
export async function getAnalysis(req: Request, res: Response): Promise<void> {
  try {
    // Validate request parameters
    const parseResult = analysisParamsSchema.safeParse({
      market: req.params.market?.toUpperCase(),
      ticker: req.params.ticker?.toUpperCase(),
      timeframe: req.params.timeframe?.toUpperCase(),
    });

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid request parameters',
        details: parseResult.error.flatten(),
      });
      return;
    }

    const { market, ticker, timeframe } = parseResult.data;

    // Validate ticker exists in our stock list
    if (!isValidTicker(market as Market, ticker)) {
      res.status(400).json({
        success: false,
        error: `Invalid ticker '${ticker}' for market '${market}'`,
      });
      return;
    }

    // Get or create analysis
    const { analysis, cached, demoMode } = await getOrCreateAnalysis(
      market as Market,
      ticker,
      timeframe as Timeframe
    );

    res.json({
      success: true,
      data: analysis,
      cached,
      demoMode,
    });
  } catch (error) {
    console.error('[AnalysisController] Error getting analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stock analysis',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get trending/popular stocks for a market
 * GET /api/analysis/trending/:market?timeframe=3M
 * Returns stocks with their analysis if available for today
 */
export async function getTrendingStocks(req: Request, res: Response): Promise<void> {
  try {
    const marketParam = req.params.market?.toUpperCase();
    const timeframeParam = (req.query.timeframe as string)?.toUpperCase() || '3M';

    const marketResult = marketSchema.safeParse(marketParam);
    const timeframeResult = timeframeSchema.safeParse(timeframeParam);

    if (!marketResult.success) {
      res.status(400).json({
        success: false,
        error: `Invalid market '${marketParam}'. Must be 'BIST' or 'US'`,
      });
      return;
    }

    if (!timeframeResult.success) {
      res.status(400).json({
        success: false,
        error: `Invalid timeframe '${timeframeParam}'. Must be '1M', '3M', or '6M'`,
      });
      return;
    }

    const market = marketResult.data as Market;
    const timeframe = timeframeResult.data as Timeframe;
    const stocks = getStocksByMarket(market);

    // Get today's analyses for this market/timeframe
    const todayAnalyses = await getTodayAnalyses(market, timeframe);

    // Enhance stocks with analysis data if available
    const stocksWithAnalysis = stocks.map((stock) => {
      const analysis = todayAnalyses.get(stock.ticker);
      return {
        ...stock,
        hasAnalysisToday: !!analysis,
        analysis: analysis || null,
      };
    });

    res.json({
      success: true,
      data: stocksWithAnalysis,
      market,
      timeframe,
      analysisCount: todayAnalyses.size,
    });
  } catch (error) {
    console.error('[AnalysisController] Error getting trending stocks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get trending stocks',
    });
  }
}

/**
 * Bulk analysis for multiple stocks
 * POST /api/analysis/bulk
 */
export async function getBulkAnalysis(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = bulkAnalysisSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: parseResult.error.flatten(),
      });
      return;
    }

    const { tickers } = parseResult.data;
    const results: Array<{ ticker: string; market: string; success: boolean; data?: unknown; error?: string }> = [];

    // Process sequentially to avoid overwhelming the AI API
    for (const item of tickers) {
      try {
        if (!isValidTicker(item.market as Market, item.ticker)) {
          results.push({
            ticker: item.ticker,
            market: item.market,
            success: false,
            error: `Invalid ticker '${item.ticker}' for market '${item.market}'`,
          });
          continue;
        }

        const { analysis, cached } = await getOrCreateAnalysis(
          item.market as Market,
          item.ticker,
          item.timeframe as Timeframe
        );

        results.push({
          ticker: item.ticker,
          market: item.market,
          success: true,
          data: { ...analysis, cached },
        });
      } catch (error) {
        results.push({
          ticker: item.ticker,
          market: item.market,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    res.json({
      success: successCount > 0,
      total: tickers.length,
      successful: successCount,
      failed: tickers.length - successCount,
      results,
    });
  } catch (error) {
    console.error('[AnalysisController] Error in bulk analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process bulk analysis',
    });
  }
}

/**
 * Test AI service endpoint
 * GET /api/analysis/test
 */
export async function testAnalysis(req: Request, res: Response): Promise<void> {
  try {
    const result = await testAIService();

    res.json({
      success: result.success,
      responseTime: result.responseTime,
      cached: false,
      demoMode: result.demoMode,
      analysis: result.analysis,
      error: result.error,
    });
  } catch (error) {
    console.error('[AnalysisController] Error testing AI service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test AI service',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Health check for analysis service
 * GET /api/health/analysis
 */
export async function getAnalysisHealth(req: Request, res: Response): Promise<void> {
  try {
    const stats = await getAnalysisStats();

    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      stats,
    });
  } catch (error) {
    console.error('[AnalysisController] Error getting health:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default {
  getAnalysis,
  getTrendingStocks,
  getBulkAnalysis,
  testAnalysis,
  getAnalysisHealth,
};
