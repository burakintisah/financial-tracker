-- Auth & Finance Schema Migration
-- Creates tables for user authentication and personal finance tracking

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    google_id TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ACCOUNTS TABLE
-- User's financial accounts (banks, brokerages, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('bank', 'brokerage', 'crypto', 'pension', 'other')),
    institution TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- ============================================
-- SNAPSHOTS TABLE
-- Financial snapshot by date
-- ============================================
CREATE TABLE IF NOT EXISTS snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, snapshot_date)
);

-- ============================================
-- ACCOUNT BALANCES TABLE
-- TRY/USD/EUR/GBP amounts per account per snapshot
-- ============================================
CREATE TABLE IF NOT EXISTS account_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_id UUID NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    amount_try NUMERIC(15, 2) DEFAULT 0,
    amount_usd NUMERIC(15, 2) DEFAULT 0,
    amount_eur NUMERIC(15, 2) DEFAULT 0,
    amount_gbp NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(snapshot_id, account_id)
);

-- ============================================
-- GOLD HOLDINGS TABLE
-- Gold amounts by type per snapshot
-- ============================================
CREATE TABLE IF NOT EXISTS gold_holdings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_id UUID NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
    gold_type TEXT NOT NULL CHECK (gold_type IN ('gram', 'quarter', 'half', 'full', 'republic', 'other')),
    quantity NUMERIC(10, 4) NOT NULL,
    weight_grams NUMERIC(10, 4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(snapshot_id, gold_type)
);

-- ============================================
-- INVESTMENTS TABLE
-- Funds, BIST, Nasdaq with principal and P&L
-- ============================================
CREATE TABLE IF NOT EXISTS investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_id UUID NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
    investment_type TEXT NOT NULL CHECK (investment_type IN ('fund', 'bist', 'nasdaq', 'crypto', 'pension', 'other')),
    name TEXT NOT NULL,
    ticker TEXT,
    principal NUMERIC(15, 2) DEFAULT 0,
    current_value NUMERIC(15, 2) DEFAULT 0,
    pnl NUMERIC(15, 2) DEFAULT 0,
    currency TEXT DEFAULT 'TRY' CHECK (currency IN ('TRY', 'USD', 'EUR', 'GBP')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SNAPSHOT TOTALS TABLE
-- Calculated totals per snapshot
-- ============================================
CREATE TABLE IF NOT EXISTS snapshot_totals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_id UUID UNIQUE NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,

    -- Cash totals
    total_cash_try NUMERIC(15, 2) DEFAULT 0,
    total_cash_usd NUMERIC(15, 2) DEFAULT 0,
    total_cash_eur NUMERIC(15, 2) DEFAULT 0,
    total_cash_gbp NUMERIC(15, 2) DEFAULT 0,

    -- Gold totals
    total_gold_grams NUMERIC(10, 4) DEFAULT 0,
    total_gold_value_try NUMERIC(15, 2) DEFAULT 0,

    -- Investment totals
    total_investments_try NUMERIC(15, 2) DEFAULT 0,
    total_investments_usd NUMERIC(15, 2) DEFAULT 0,

    -- Grand totals (everything converted to single currency)
    grand_total_try NUMERIC(15, 2) DEFAULT 0,
    grand_total_usd NUMERIC(15, 2) DEFAULT 0,

    -- Exchange rates used for conversion
    exchange_rates JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_user_id ON snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_date ON snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_account_balances_snapshot_id ON account_balances(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_gold_holdings_snapshot_id ON gold_holdings(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_investments_snapshot_id ON investments(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_snapshot_totals_snapshot_id ON snapshot_totals(snapshot_id);

-- ============================================
-- UPDATE TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_snapshots_updated_at ON snapshots;
CREATE TRIGGER update_snapshots_updated_at
    BEFORE UPDATE ON snapshots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_snapshot_totals_updated_at ON snapshot_totals;
CREATE TRIGGER update_snapshot_totals_updated_at
    BEFORE UPDATE ON snapshot_totals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_totals ENABLE ROW LEVEL SECURITY;

-- Users policies: Users can only access their own data
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Service role full access to users"
    ON users FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Accounts policies
CREATE POLICY "Users can view own accounts"
    ON accounts FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage own accounts"
    ON accounts FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role full access to accounts"
    ON accounts FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Snapshots policies
CREATE POLICY "Users can view own snapshots"
    ON snapshots FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage own snapshots"
    ON snapshots FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role full access to snapshots"
    ON snapshots FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Account balances policies
CREATE POLICY "Users can view own account balances"
    ON account_balances FOR SELECT
    USING (snapshot_id IN (SELECT id FROM snapshots WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own account balances"
    ON account_balances FOR ALL
    USING (snapshot_id IN (SELECT id FROM snapshots WHERE user_id = auth.uid()))
    WITH CHECK (snapshot_id IN (SELECT id FROM snapshots WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access to account_balances"
    ON account_balances FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Gold holdings policies
CREATE POLICY "Users can view own gold holdings"
    ON gold_holdings FOR SELECT
    USING (snapshot_id IN (SELECT id FROM snapshots WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own gold holdings"
    ON gold_holdings FOR ALL
    USING (snapshot_id IN (SELECT id FROM snapshots WHERE user_id = auth.uid()))
    WITH CHECK (snapshot_id IN (SELECT id FROM snapshots WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access to gold_holdings"
    ON gold_holdings FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Investments policies
CREATE POLICY "Users can view own investments"
    ON investments FOR SELECT
    USING (snapshot_id IN (SELECT id FROM snapshots WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own investments"
    ON investments FOR ALL
    USING (snapshot_id IN (SELECT id FROM snapshots WHERE user_id = auth.uid()))
    WITH CHECK (snapshot_id IN (SELECT id FROM snapshots WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access to investments"
    ON investments FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Snapshot totals policies
CREATE POLICY "Users can view own snapshot totals"
    ON snapshot_totals FOR SELECT
    USING (snapshot_id IN (SELECT id FROM snapshots WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own snapshot totals"
    ON snapshot_totals FOR ALL
    USING (snapshot_id IN (SELECT id FROM snapshots WHERE user_id = auth.uid()))
    WITH CHECK (snapshot_id IN (SELECT id FROM snapshots WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access to snapshot_totals"
    ON snapshot_totals FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE users IS 'User accounts authenticated via Google OAuth';
COMMENT ON TABLE accounts IS 'Financial accounts belonging to users (banks, brokerages, etc.)';
COMMENT ON TABLE snapshots IS 'Point-in-time financial snapshots for a user';
COMMENT ON TABLE account_balances IS 'Multi-currency balances for each account in a snapshot';
COMMENT ON TABLE gold_holdings IS 'Gold holdings by type in a snapshot';
COMMENT ON TABLE investments IS 'Investment positions (stocks, funds, crypto) in a snapshot';
COMMENT ON TABLE snapshot_totals IS 'Aggregated totals for each snapshot';
