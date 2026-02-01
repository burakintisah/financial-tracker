/**
 * Stock Analysis Service
 * Handles caching and database operations for stock analyses
 * In demo mode, caching is disabled and all analyses are fresh
 */

import { env } from '../config/env';
import { analyzeStock } from './claude-ai.service';
import {
  IStockAnalysis,
  IStockAnalysisDB,
  Market,
  Timeframe,
  analysisToDbRow,
  dbRowToAnalysis,
  IClaudeAnalysisResponse,
} from '../types/analysis.types';

// Check if Supabase is configured
const isSupabaseConfigured = !!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);

// Lazy load Supabase client only if configured
let supabaseClient: ReturnType<typeof import('../config/supabase').default> | null = null;

async function getSupabaseClient() {
  if (!isSupabaseConfigured) return null;
  if (!supabaseClient) {
    const { default: client } = await import('../config/supabase');
    supabaseClient = client;
  }
  return supabaseClient;
}

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
  const client = await getSupabaseClient();
  if (!client) return null; // Demo mode - no caching

  const cacheKey = generateCacheKey(market, ticker, timeframe);

  try {
    const { data: cacheEntry, error: cacheError } = await client
      .from('analysis_cache')
      .select('*, stock_analyses(*)')
      .eq('cache_key', cacheKey)
      .single();

    if (cacheError || !cacheEntry) {
      return null;
    }

    if (isCacheExpired(cacheEntry.expires_at)) {
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
  const client = await getSupabaseClient();
  if (!client) return null; // Demo mode - no saving

  try {
    const dbRow = analysisToDbRow(analysis, rawResponse);

    const { data: insertedAnalysis, error: insertError } = await client
      .from('stock_analyses')
      .insert(dbRow)
      .select()
      .single();

    if (insertError || !insertedAnalysis) {
      console.error('[StockAnalysisService] Error inserting analysis:', insertError);
      return null;
    }

    const cacheKey = generateCacheKey(analysis.market, analysis.ticker, analysis.timeframe);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + env.CACHE_TTL_HOURS);

    const { error: cacheError } = await client
      .from('analysis_cache')
      .upsert(
        {
          cache_key: cacheKey,
          last_analysis_id: insertedAnalysis.id,
          expires_at: expiresAt.toISOString(),
        },
        { onConflict: 'cache_key' }
      );

    if (cacheError) {
      console.error('[StockAnalysisService] Error updating cache:', cacheError);
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
  const client = await getSupabaseClient();
  if (!client) return; // Demo mode

  try {
    let query = client.from('analysis_cache').delete();

    if (timeframe) {
      const cacheKey = generateCacheKey(market, ticker, timeframe);
      query = query.eq('cache_key', cacheKey);
    } else {
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
 * Gets or creates an analysis for a stock
 * In demo mode, always returns fresh mock data
 */
export async function getOrCreateAnalysis(
  market: Market,
  ticker: string,
  timeframe: Timeframe
): Promise<{ analysis: IStockAnalysis; cached: boolean; demoMode: boolean }> {
  // Try to get from cache first (if Supabase is configured)
  if (isSupabaseConfigured) {
    const cachedAnalysis = await getCachedAnalysis(market, ticker, timeframe);
    if (cachedAnalysis) {
      return { analysis: cachedAnalysis, cached: true, demoMode: false };
    }
  }

  // Fetch fresh analysis (AI or mock in demo mode)
  const freshAnalysis = await analyzeStock(ticker, market, timeframe);

  // Save to database if Supabase is configured (don't wait)
  if (isSupabaseConfigured) {
    saveAnalysis(freshAnalysis, freshAnalysis as IClaudeAnalysisResponse).catch((error) => {
      console.error('[StockAnalysisService] Background save failed:', error);
    });
  }

  return {
    analysis: freshAnalysis,
    cached: false,
    demoMode: env.DEMO_MODE
  };
}

/**
 * Gets the most recent analyses for a market
 */
export async function getRecentAnalyses(
  market: Market,
  limit: number = 10
): Promise<IStockAnalysis[]> {
  const client = await getSupabaseClient();
  if (!client) return []; // Demo mode

  try {
    const { data, error } = await client
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
  demoMode: boolean;
}> {
  const client = await getSupabaseClient();

  if (!client) {
    return {
      totalAnalyses: 0,
      cachedEntries: 0,
      expiredEntries: 0,
      demoMode: true,
    };
  }

  try {
    const now = new Date().toISOString();

    const [analysesResult, cacheResult, expiredResult] = await Promise.all([
      client.from('stock_analyses').select('id', { count: 'exact', head: true }),
      client.from('analysis_cache').select('id', { count: 'exact', head: true }),
      client.from('analysis_cache').select('id', { count: 'exact', head: true }).lt('expires_at', now),
    ]);

    return {
      totalAnalyses: analysesResult.count || 0,
      cachedEntries: cacheResult.count || 0,
      expiredEntries: expiredResult.count || 0,
      demoMode: false,
    };
  } catch (error) {
    console.error('[StockAnalysisService] Error getting stats:', error);
    return {
      totalAnalyses: 0,
      cachedEntries: 0,
      expiredEntries: 0,
      demoMode: env.DEMO_MODE,
    };
  }
}

export default {
  getCachedAnalysis,
  saveAnalysis,
  invalidateCache,
  getOrCreateAnalysis,
  getRecentAnalyses,
  getAnalysisStats,
};
