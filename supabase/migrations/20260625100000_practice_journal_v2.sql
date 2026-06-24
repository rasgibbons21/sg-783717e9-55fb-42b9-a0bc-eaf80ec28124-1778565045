-- Phase 7: Expand practice_journal into a comprehensive trade review + journal table.
-- Drops the previous minimal journal (id, user_id, trade_id, entry, mood) and
-- replaces it with a full review + metadata schema.
-- Idempotent: safe to re-run.

DROP TABLE IF EXISTS practice_journal CASCADE;

CREATE TABLE practice_journal (
  id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_id                UUID          REFERENCES practice_trades(id) ON DELETE SET NULL,

  -- ── Trade snapshot (auto-populated on close) ───────────────────────────────
  ticker                  TEXT          NOT NULL,
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

  -- ── AI-generated review (Pansy) ───────────────────────────────────────────
  score_pl                INTEGER,       -- 0–100: P/L vs stated risk/target
  score_rr                INTEGER,       -- 0–100: quality of R/R setup
  score_entry             INTEGER,       -- 0–100: entry discipline / plan
  score_exit              INTEGER,       -- 0–100: exit discipline / planned levels
  score_discipline        INTEGER,       -- 0–100: overall process
  overall_grade           TEXT,          -- A / B / C / D / F
  what_went_well          TEXT,
  what_to_improve         TEXT,
  followed_plan           TEXT,
  remember_next           TEXT,

  -- ── User-editable journal fields ──────────────────────────────────────────
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

ALTER TABLE practice_journal ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "practice_journal_self" ON practice_journal;
CREATE POLICY "practice_journal_self"
  ON practice_journal
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_pj_user        ON practice_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_pj_ticker      ON practice_journal(user_id, ticker);
CREATE INDEX IF NOT EXISTS idx_pj_grade       ON practice_journal(user_id, overall_grade);
CREATE INDEX IF NOT EXISTS idx_pj_created     ON practice_journal(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pj_direction   ON practice_journal(user_id, direction);
