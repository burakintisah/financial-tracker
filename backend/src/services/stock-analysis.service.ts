/**
 * Stock Analysis Service
 * Handles caching and database operations for stock analyses
 */

import supabaseClient from '../config/supabase';
import { env } from '../config/env';
import { analyzeStock } from './claude-ai.service';
import {
  IStockAnalysis,
  IStockAnalysisDB,
  IAnalysisCache,
  Market,
  Timeframe,
  analysisToDbRow,
  dbRowToAnalysis,
  IClaudeAnalysisResponse,
} from '../types/analysis.types';

/**
 * Generates a cache key for a stock analysis
 */
function generateCacheKey(market: Market, ticker: string, timeframe: Timeframe): string {
  return `${market}:${ticker}:${timeframe}`;
}

/**
 * Checks if a cache entry has expired
 */
function isCacheExpired(expiresAt: string): boolean {
  return new Date(expiresAt) <= new Date();
}

/**
 * Gets a cached analysis if it exists and is not expired
 */
export async function getCachedAnalysis(
  market: Market,
  ticker: string,
  timeframe: Timeframe
): Promise<IStockAnalysis | null> {
  const cacheKey = generateCacheKey(market, ticker, timeframe);

  try {
    // Query cache with join to get the analysis
    const { data: cacheEntry, error: cacheError } = await supabaseClient
      .from('analysis_cache')
      .select('*, stock_analyses(*)')
      .eq('cache_key', cacheKey)
      .single();

    if (cacheError || !cacheEntry) {
      return null;
    }

    // Check if cache has expired
    if (isCacheExpired(cacheEntry.expires_at)) {
      // Optionally clean up expired cache
      await invalidateCache(market, ticker, timeframe);
      return null;
    }

    const analysisRow = cacheEntry.stock_analyses as IStockAnalysisDB;
    if (!analysisRow) {
      return null;
    }

    return dbRowToAnalysis(analysisRow);
  } catch (error) {
    console.error('[StockAnalysisService] Error fetching cached analysis:', error);
    return null;
  }
}

/**
 * Saves an analysis to the database and updates the cache
 */
export async function saveAnalysis(
  analysis: IStockAnalysis,
  rawResponse: IClaudeAnalysisResponse
): Promise<IStockAnalysisDB | null> {
  try {
    const dbRow = analysisToDbRow(analysis, rawResponse);

    // Insert the analysis
    const { data: insertedAnalysis, error: insertError } = await supabaseClient
      .from('stock_analyses')
      .insert(dbRow)
      .select()
      .single();

    if (insertError || !insertedAnalysis) {
      console.error('[StockAnalysisService] Error inserting analysis:', insertError);
      return null;
    }

    // Update or create cache entry
    const cacheKey = generateCacheKey(analysis.market, analysis.ticker, analysis.timeframe);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + env.CACHE_TTL_HOURS);

    const { error: cacheError } = await supabaseClient
      .from('analysis_cache')
      .upsert(
        {
          cache_key: cacheKey,
          last_analysis_id: insertedAnalysis.id,
          expires_at: expiresAt.toISOString(),
        },
        {
          onConflict: 'cache_key',
        }
      );

    if (cacheError) {
      console.error('[StockAnalysisService] Error updating cache:', cacheError);
      // Don't fail the whole operation if cache update fails
    }

    return insertedAnalysis as IStockAnalysisDB;
  } catch (error) {
    console.error('[StockAnalysisService] Error saving analysis:', error);
    return null;
  }
}

/**
 * Invalidates a cache entry
 */
export async function invalidateCache(
  market: Market,
  ticker: string,
  timeframe?: Timeframe
): Promise<void> {
  try {
    let query = supabaseClient.from('analysis_cache').delete();

    if (timeframe) {
      const cacheKey = generateCacheKey(market, ticker, timeframe);
      query = query.eq('cache_key', cacheKey);
    } else {
      // Invalidate all timeframes for this stock
      query = query.like('cache_key', `${market}:${ticker}:%`);
    }

    const { error } = await query;

    if (error) {
      console.error('[StockAnalysisService] Error invalidating cache:', error);
    }
  } catch (error) {
    console.error('[StockAnalysisService] Error invalidating cache:', error);
  }
}

/**
 * Cleans up all expired cache entries
 */
export async function cleanupExpiredCache(): Promise<number> {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabaseClient
      .from('analysis_cache')
      .delete()
      .lt('expires_at', now)
      .select('id');

    if (error) {
      console.error('[StockAnalysisService] Error cleaning up expired cache:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('[StockAnalysisService] Error cleaning up expired cache:', error);
    return 0;
  }
}

/**
 * Gets or creates an analysis for a stock
 * Checks cache first, then fetches from AI if needed
 */
export async function getOrCreateAnalysis(
  market: Market,
  ticker: string,
  timeframe: Timeframe
): Promise<{ analysis: IStockAnalysis; cached: boolean }> {
  // Try to get from cache first
  const cachedAnalysis = await getCachedAnalysis(market, ticker, timeframe);

  if (cachedAnalysis) {
    return { analysis: cachedAnalysis, cached: true };
  }

  // Fetch fresh analysis from AI
  const freshAnalysis = await analyzeStock(ticker, market, timeframe);

  // Save to database (don't wait for it to complete)
  saveAnalysis(freshAnalysis, freshAnalysis as IClaudeAnalysisResponse).catch((error) => {
    console.error('[StockAnalysisService] Background save failed:', error);
  });

  return { analysis: freshAnalysis, cached: false };
}

/**
 * Gets the most recent analyses for a market
 */
export async function getRecentAnalyses(
  market: Market,
  limit: number = 10
): Promise<IStockAnalysis[]> {
  try {
    const { data, error } = await supabaseClient
      .from('stock_analyses')
      .select('*')
      .eq('market', market)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      console.error('[StockAnalysisService] Error fetching recent analyses:', error);
      return [];
    }

    return data.map((row) => dbRowToAnalysis(row as IStockAnalysisDB));
  } catch (error) {
    console.error('[StockAnalysisService] Error fetching recent analyses:', error);
    return [];
  }
}

/**
 * Gets analysis statistics
 */
export async function getAnalysisStats(): Promise<{
  totalAnalyses: number;
  cachedEntries: number;
  expiredEntries: number;
}> {
  try {
    const now = new Date().toISOString();

    const [analysesResult, cacheResult, expiredResult] = await Promise.all([
      supabaseClient.from('stock_analyses').select('id', { count: 'exact', head: true }),
      supabaseClient.from('analysis_cache').select('id', { count: 'exact', head: true }),
      supabaseClient
        .from('analysis_cache')
        .select('id', { count: 'exact', head: true })
        .lt('expires_at', now),
    ]);

    return {
      totalAnalyses: analysesResult.count || 0,
      cachedEntries: cacheResult.count || 0,
      expiredEntries: expiredResult.count || 0,
    };
  } catch (error) {
    console.error('[StockAnalysisService] Error getting stats:', error);
    return {
      totalAnalyses: 0,
      cachedEntries: 0,
      expiredEntries: 0,
    };
  }
}

export default {
  getCachedAnalysis,
  saveAnalysis,
  invalidateCache,
  cleanupExpiredCache,
  getOrCreateAnalysis,
  getRecentAnalyses,
  getAnalysisStats,
};
