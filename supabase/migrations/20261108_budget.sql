-- Budget & Savings with Pansy: her save-first plan, her daily entries, and the milestones she has reached.
-- Every row belongs to one member, only she can read or change it, and it is deleted with her account.

CREATE TABLE IF NOT EXISTS budget_plans (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  currency TEXT NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  pay_cents BIGINT NOT NULL CHECK (pay_cents > 0 AND pay_cents <= 100000000000),
  pay_frequency TEXT NOT NULL CHECK (pay_frequency IN ('weekly','biweekly','semimonthly','monthly')),
  next_payday DATE NOT NULL,
  bills JSONB NOT NULL DEFAULT '[]'::jsonb,
  save_pct SMALLINT NOT NULL CHECK (save_pct BETWEEN 1 AND 50),
  goal_cents BIGINT CHECK (goal_cents IS NULL OR goal_cents > 0),
  interest_pct NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (interest_pct BETWEEN 0 AND 15),
  time_zone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('expense','saving','withdrawal')),
  amount_cents BIGINT NOT NULL CHECK (amount_cents >= 0 AND amount_cents <= 100000000000),
  category TEXT NOT NULL CHECK (char_length(category) <= 40),
  note TEXT CHECK (note IS NULL OR char_length(note) <= 140),
  occurred_on DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS budget_entries_user_day ON budget_entries (user_id, occurred_on DESC);

CREATE TABLE IF NOT EXISTS budget_milestones (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents BIGINT NOT NULL,
  reached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  seen_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, amount_cents)
);

ALTER TABLE budget_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "budget_plans owner select" ON budget_plans;
DROP POLICY IF EXISTS "budget_plans owner insert" ON budget_plans;
DROP POLICY IF EXISTS "budget_plans owner update" ON budget_plans;
DROP POLICY IF EXISTS "budget_plans owner delete" ON budget_plans;
CREATE POLICY "budget_plans owner select" ON budget_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "budget_plans owner insert" ON budget_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "budget_plans owner update" ON budget_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "budget_plans owner delete" ON budget_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "budget_entries owner select" ON budget_entries;
DROP POLICY IF EXISTS "budget_entries owner insert" ON budget_entries;
DROP POLICY IF EXISTS "budget_entries owner update" ON budget_entries;
DROP POLICY IF EXISTS "budget_entries owner delete" ON budget_entries;
CREATE POLICY "budget_entries owner select" ON budget_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "budget_entries owner insert" ON budget_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "budget_entries owner update" ON budget_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "budget_entries owner delete" ON budget_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "budget_milestones owner select" ON budget_milestones;
DROP POLICY IF EXISTS "budget_milestones owner insert" ON budget_milestones;
DROP POLICY IF EXISTS "budget_milestones owner update" ON budget_milestones;
DROP POLICY IF EXISTS "budget_milestones owner delete" ON budget_milestones;
CREATE POLICY "budget_milestones owner select" ON budget_milestones FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "budget_milestones owner insert" ON budget_milestones FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "budget_milestones owner update" ON budget_milestones FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "budget_milestones owner delete" ON budget_milestones FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Her savings balance, worked out over only her own rows (row level security still applies).
CREATE OR REPLACE FUNCTION budget_balance() RETURNS BIGINT
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT COALESCE(SUM(CASE kind WHEN 'saving' THEN amount_cents WHEN 'withdrawal' THEN -amount_cents ELSE 0 END), 0)::BIGINT
  FROM budget_entries
  WHERE user_id = auth.uid()
$$;
REVOKE ALL ON FUNCTION budget_balance() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION budget_balance() TO authenticated;
