-- Scanner results history — tracks how scanner picks performed over time.
-- Used by the strategy performance tracker (backtest page).
-- Populated by the signal-alerts cron; outcomes checked next trading session.

CREATE TABLE IF NOT EXISTS scanner_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  strategy_id TEXT NOT NULL,
  strategy_name TEXT NOT NULL,
  signal_state TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,

  -- Snapshot at scan time
  price_at_signal NUMERIC NOT NULL,
  change_pct NUMERIC,
  volume BIGINT,
  rvol NUMERIC,
  catalyst TEXT,

  -- Strategy levels (parsed from signal entry/stop/target text)
  entry_price NUMERIC,
  stop_price NUMERIC,
  target1_price NUMERIC,
  target2_price NUMERIC,

  -- Outcome tracking (filled by the cron after market close)
  outcome TEXT CHECK (outcome IN ('win_t1', 'win_t2', 'stopped', 'expired', 'pending')),
  outcome_price NUMERIC,
  outcome_pnl_pct NUMERIC,
  outcome_checked_at TIMESTAMPTZ,

  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  scanned_date DATE DEFAULT CURRENT_DATE
);

-- No RLS needed — this is a public read-only stats table, written by cron (service role)
ALTER TABLE scanner_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read scanner results"
  ON scanner_results FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_scanner_results_date
  ON scanner_results(scanned_date DESC);
CREATE INDEX IF NOT EXISTS idx_scanner_results_strategy
  ON scanner_results(strategy_id, scanned_date DESC);
CREATE INDEX IF NOT EXISTS idx_scanner_results_outcome
  ON scanner_results(outcome) WHERE outcome = 'pending';
CREATE INDEX IF NOT EXISTS idx_scanner_results_symbol_date
  ON scanner_results(symbol, scanned_date DESC);
