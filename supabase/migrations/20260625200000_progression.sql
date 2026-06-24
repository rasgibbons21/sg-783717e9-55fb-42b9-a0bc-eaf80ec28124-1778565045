-- Phase 8: Discipline Score, Missions, Progression
-- Adds user_xp, user_xp_log, user_missions tables + atomic XP increment function.
-- Idempotent: safe to re-run.

-- ── 1. User XP total ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_xp (
  user_id    UUID     PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp   INTEGER  NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_xp_self" ON user_xp;
CREATE POLICY "user_xp_self" ON user_xp TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 2. XP audit log ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_xp_log (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_earned    INTEGER     NOT NULL,
  reason       TEXT        NOT NULL,
  reference_id TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_xp_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_xp_log_self" ON user_xp_log;
CREATE POLICY "user_xp_log_self" ON user_xp_log TO authenticated
  USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_xp_log_user ON user_xp_log(user_id, created_at DESC);

-- ── 3. User missions ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_missions (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_key          TEXT        NOT NULL,
  status               TEXT        NOT NULL DEFAULT 'unlocked'
                                   CHECK (status IN ('unlocked', 'completed')),
  unlocked_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at         TIMESTAMPTZ,
  completing_trade_id  TEXT,
  UNIQUE(user_id, mission_key)
);

ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_missions_self" ON user_missions;
CREATE POLICY "user_missions_self" ON user_missions TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_missions_user ON user_missions(user_id, status);

-- ── 4. Atomic XP increment (avoids race conditions) ──────────────────────────
CREATE OR REPLACE FUNCTION increment_user_xp(p_user_id UUID, p_amount INTEGER)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_xp (user_id, total_xp, updated_at)
  VALUES (p_user_id, p_amount, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_xp   = user_xp.total_xp + p_amount,
    updated_at = NOW();
END;
$$;
