-- Stock Analysis Schema Migration
-- Creates tables for AI-powered stock analysis with caching

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stock Analyses Table
-- Stores all AI-generated stock analysis results
CREATE TABLE IF NOT EXISTS stock_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticker TEXT NOT NULL,
    market TEXT NOT NULL CHECK (market IN ('BIST', 'US')),
    timeframe TEXT NOT NULL CHECK (timeframe IN ('1M', '3M', '6M')),
    analysis_date DATE NOT NULL,

    -- Prediction fields
    prediction_direction TEXT NOT NULL CHECK (prediction_direction IN ('bullish', 'bearish', 'neutral')),
    probability INTEGER NOT NULL CHECK (probability >= 0 AND probability <= 100),
    price_target_low NUMERIC(12, 2),
    price_target_high NUMERIC(12, 2),
    current_price NUMERIC(12, 2),

    -- Technical metrics
    rsi INTEGER CHECK (rsi >= 0 AND rsi <= 100),
    macd TEXT,
    pe_ratio NUMERIC(10, 2),
    volume_trend TEXT,

    -- Analysis metadata
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    summary TEXT NOT NULL,
    key_factors JSONB DEFAULT '[]'::jsonb,
    confidence TEXT NOT NULL CHECK (confidence IN ('low', 'medium', 'high')),

    -- Full AI response for debugging
    raw_response JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis Cache Table
-- Manages cache entries for stock analyses with TTL
CREATE TABLE IF NOT EXISTS analysis_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key TEXT UNIQUE NOT NULL,
    last_analysis_id UUID NOT NULL REFERENCES stock_analyses(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_analyses_ticker_market ON stock_analyses(ticker, market);
CREATE INDEX IF NOT EXISTS idx_stock_analyses_created_at ON stock_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_cache_key ON analysis_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_expires_at ON analysis_cache(expires_at);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_stock_analyses_updated_at ON stock_analyses;
CREATE TRIGGER update_stock_analyses_updated_at
    BEFORE UPDATE ON stock_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (Row Level Security)
-- Enable RLS on tables
ALTER TABLE stock_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous read access to stock analyses
CREATE POLICY "Allow anonymous read access to stock_analyses"
    ON stock_analyses
    FOR SELECT
    TO anon
    USING (true);

-- Policy: Allow service role full access to stock analyses
CREATE POLICY "Allow service role full access to stock_analyses"
    ON stock_analyses
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Allow anonymous read access to analysis cache
CREATE POLICY "Allow anonymous read access to analysis_cache"
    ON analysis_cache
    FOR SELECT
    TO anon
    USING (true);

-- Policy: Allow service role full access to analysis cache
CREATE POLICY "Allow service role full access to analysis_cache"
    ON analysis_cache
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE stock_analyses IS 'Stores AI-generated stock analysis results';
COMMENT ON TABLE analysis_cache IS 'Cache entries for stock analyses with TTL';
COMMENT ON COLUMN stock_analyses.cache_key IS 'Format: {market}:{ticker}:{timeframe}';
COMMENT ON COLUMN stock_analyses.key_factors IS 'JSON array of key factors affecting the stock';
COMMENT ON COLUMN stock_analyses.raw_response IS 'Full AI response for debugging purposes';
