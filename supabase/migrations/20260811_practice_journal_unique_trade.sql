-- Ensure practice_journal table exists with v2 schema and unique trade_id constraint.
-- The v2 migration may not have been run on the current Supabase project.
-- This migration is idempotent — safe to re-run.

-- Create the table if it doesn't exist (v2 full schema)
CREATE TABLE IF NOT EXISTS practice_journal (
  id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_id                UUID          REFERENCES practice_trades(id) ON DELETE SET NULL,

  -- Trade snapshot (auto-populated on close)
  ticker                  TEXT          NOT NULL DEFAULT '',
  direction               TEXT,
  entry_price             NUMERIC(14,4),
  exit_price              NUMERIC(14,4),
  stop_price              NUMERIC(14,4),
  target_price            NUMERIC(14,4),
  shares                  NUMERIC(14,4),
  pnl                     NUMERIC(14,2),
  pnl_pct                 NUMERIC(8,4),
  risk_amount             NUMERIC(14,2),
  duration_minutes        INTEGER,
  thesis                  TEXT,
  exit_reason             TEXT,
  closed_at               TIMESTAMPTZ,

  -- AI-generated review
  score_pl                INTEGER,
  score_rr                INTEGER,
  score_entry             INTEGER,
  score_exit              INTEGER,
  score_discipline        INTEGER,
  overall_grade           TEXT,
  what_went_well          TEXT,
  what_to_improve         TEXT,
  followed_plan           TEXT,
  remember_next           TEXT,

  -- User-editable journal fields
  chart_pattern           TEXT,
  candlestick_confirmation TEXT,
  indicator_used          TEXT,
  market_trend            TEXT,
  emotion_before          TEXT,
  emotion_during          TEXT,
  emotion_after           TEXT,
  related_lesson          TEXT,
  what_i_learned          TEXT,
  personal_notes          TEXT,

  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Add columns that might be missing if the table existed with old v1 schema
DO $$
BEGIN
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS ticker TEXT NOT NULL DEFAULT '';
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS direction TEXT;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS entry_price NUMERIC(14,4);
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS exit_price NUMERIC(14,4);
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS stop_price NUMERIC(14,4);
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS target_price NUMERIC(14,4);
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS shares NUMERIC(14,4);
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS pnl NUMERIC(14,2);
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS pnl_pct NUMERIC(8,4);
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS risk_amount NUMERIC(14,2);
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS thesis TEXT;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS exit_reason TEXT;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS score_pl INTEGER;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS score_rr INTEGER;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS score_entry INTEGER;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS score_exit INTEGER;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS score_discipline INTEGER;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS overall_grade TEXT;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS what_went_well TEXT;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS what_to_improve TEXT;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS followed_plan TEXT;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS remember_next TEXT;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS chart_pattern TEXT;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS candlestick_confirmation TEXT;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS indicator_used TEXT;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS market_trend TEXT;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS emotion_before TEXT;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS emotion_during TEXT;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS emotion_after TEXT;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS related_lesson TEXT;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS what_i_learned TEXT;
  ALTER TABLE practice_journal ADD COLUMN IF NOT EXISTS personal_notes TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Add unique constraint on trade_id (required for upsert)
CREATE UNIQUE INDEX IF NOT EXISTS idx_pj_trade_unique ON practice_journal(trade_id) WHERE trade_id IS NOT NULL;

-- Enable RLS
ALTER TABLE practice_journal ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "practice_journal_self" ON practice_journal;
CREATE POLICY "practice_journal_self"
  ON practice_journal
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pj_user        ON practice_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_pj_ticker      ON practice_journal(user_id, ticker);
CREATE INDEX IF NOT EXISTS idx_pj_grade       ON practice_journal(user_id, overall_grade);
CREATE INDEX IF NOT EXISTS idx_pj_created     ON practice_journal(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pj_direction   ON practice_journal(user_id, direction);
