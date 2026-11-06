-- Records the plan behind each practice trade, for the process score.
ALTER TABLE practice_trades
  ADD COLUMN IF NOT EXISTS setup_type TEXT,
  ADD COLUMN IF NOT EXISTS timeframe TEXT,
  ADD COLUMN IF NOT EXISTS risk_pct NUMERIC(6,2);
