-- Scanner & Alert tables
-- Creates the 4 missing tables the diagnostic flagged, plus scanner_alerts for alert history.
-- All use auth.users(id) as FK so they work with Supabase Auth regardless of profiles table.

-- ═══════════════════════════════════════════════════════════════════
-- 1. notification_tokens — web push subscription storage
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE notification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tokens"
  ON notification_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tokens"
  ON notification_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tokens"
  ON notification_tokens FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tokens"
  ON notification_tokens FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notification_tokens_user
  ON notification_tokens(user_id);

-- ═══════════════════════════════════════════════════════════════════
-- 2. price_alerts — user-configured ticker price/volume alerts
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_above', 'price_below', 'percent_change', 'volume_spike')),
  threshold NUMERIC NOT NULL,
  enabled BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ticker, alert_type)
);

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts"
  ON price_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own alerts"
  ON price_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts"
  ON price_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own alerts"
  ON price_alerts FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_price_alerts_user
  ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_ticker
  ON price_alerts(ticker) WHERE enabled = true;

-- ═══════════════════════════════════════════════════════════════════
-- 3. subscriptions — payment/plan tracking
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'starter', 'pro', 'lifetime')),
  status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'cancelled', 'expired', 'past_due')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  payment_method TEXT,
  paypal_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own subscriptions"
  ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user
  ON subscriptions(user_id);

-- ═══════════════════════════════════════════════════════════════════
-- 4. watchlist — user ticker watchlist
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'stock' CHECK (asset_type IN ('stock', 'etf', 'crypto')),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ticker)
);

ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watchlist"
  ON watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to own watchlist"
  ON watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own watchlist"
  ON watchlist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove from own watchlist"
  ON watchlist FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_watchlist_user
  ON watchlist(user_id);

-- ═══════════════════════════════════════════════════════════════════
-- 5. scanner_alerts — persisted alert history from scanner runs
--    This is what populates the "Alerts" section on the home page.
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS scanner_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  strategy TEXT NOT NULL,
  signal_state TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  price NUMERIC,
  change_pct NUMERIC,
  entry_zone TEXT,
  stop_level TEXT,
  target TEXT,
  reason TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scanner_alerts ENABLE ROW LEVEL SECURITY;

-- Alerts with null user_id are global (visible to all authenticated users)
CREATE POLICY "Users can view own or global alerts"
  ON scanner_alerts FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can mark own alerts read"
  ON scanner_alerts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Server-side inserts use service_role key, no INSERT policy needed for anon

CREATE INDEX IF NOT EXISTS idx_scanner_alerts_user
  ON scanner_alerts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scanner_alerts_created
  ON scanner_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scanner_alerts_symbol
  ON scanner_alerts(symbol);
