-- Strategy Lab tables for Bloom University
-- Idempotent: safe to run multiple times

-- 1. Strategy progress (one row per user per strategy)
CREATE TABLE IF NOT EXISTS strategy_progress (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_slug   TEXT        NOT NULL,
  category        TEXT        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'not_started'
                    CHECK (status IN ('not_started','learning','practicing','mastered')),
  lessons_completed INTEGER  NOT NULL DEFAULT 0,
  practice_score    INTEGER,
  practice_attempts INTEGER  NOT NULL DEFAULT 0,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, strategy_slug)
);

ALTER TABLE strategy_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "strategy_progress_self" ON strategy_progress;
CREATE POLICY "strategy_progress_self"
  ON strategy_progress TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Strategy toolbelt (saved strategies with personal notes)
CREATE TABLE IF NOT EXISTS strategy_toolbelt (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_slug   TEXT        NOT NULL,
  personal_notes  TEXT,
  biggest_mistake TEXT,
  added_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, strategy_slug)
);

ALTER TABLE strategy_toolbelt ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "strategy_toolbelt_self" ON strategy_toolbelt;
CREATE POLICY "strategy_toolbelt_self"
  ON strategy_toolbelt TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Strategy practice attempts (chart exercises, spot the setup, build the trade)
CREATE TABLE IF NOT EXISTS strategy_practice_attempts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_slug   TEXT        NOT NULL,
  exercise_type   TEXT        NOT NULL
                    CHECK (exercise_type IN ('quiz','spot_setup','build_trade','good_vs_bad','scorecard','challenge')),
  score           INTEGER,
  total           INTEGER,
  answers         JSONB       NOT NULL DEFAULT '[]',
  attempted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE strategy_practice_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "strategy_practice_self" ON strategy_practice_attempts;
CREATE POLICY "strategy_practice_self"
  ON strategy_practice_attempts TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Strategy challenge scores (final 10-chart challenge)
CREATE TABLE IF NOT EXISTS strategy_scores (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_recognition INTEGER NOT NULL DEFAULT 0,
  risk_awareness     INTEGER NOT NULL DEFAULT 0,
  chart_reading      INTEGER NOT NULL DEFAULT 0,
  strategy_selection INTEGER NOT NULL DEFAULT 0,
  discipline         INTEGER NOT NULL DEFAULT 0,
  total_score        INTEGER NOT NULL DEFAULT 0,
  charts_completed   INTEGER NOT NULL DEFAULT 0,
  no_trade_correct   INTEGER NOT NULL DEFAULT 0,
  details            JSONB   NOT NULL DEFAULT '[]',
  attempted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE strategy_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "strategy_scores_self" ON strategy_scores;
CREATE POLICY "strategy_scores_self"
  ON strategy_scores TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_strat_progress_user ON strategy_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_strat_toolbelt_user ON strategy_toolbelt (user_id);
CREATE INDEX IF NOT EXISTS idx_strat_practice_user ON strategy_practice_attempts (user_id, strategy_slug);
CREATE INDEX IF NOT EXISTS idx_strat_scores_user   ON strategy_scores (user_id);
