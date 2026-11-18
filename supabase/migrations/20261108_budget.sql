-- Budget & Savings with Pansy: her save-first plan, her daily entries, her savings plan sheets,
-- and the milestones she has reached. Every row belongs to one member, only she can read or change it,
-- and it is deleted with her account. Safe to run more than once.

-- An earlier budget tracker (2026-08) created budget_entries with different columns (amount, date).
-- Keeping it would make every save fail, so it is moved aside, with its rows kept, before the new table is made.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'budget_entries')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'budget_entries' AND column_name = 'kind') THEN
    ALTER TABLE public.budget_entries RENAME TO budget_entries_legacy;
    ALTER INDEX IF EXISTS public.idx_budget_entries_user_date RENAME TO idx_budget_entries_legacy_user_date;
  END IF;
END $$;

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
  categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  savings_days TEXT NOT NULL DEFAULT 'payday' CHECK (savings_days IN ('payday','fridays','sundays','daily','twice_monthly')),
  notify BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (jsonb_array_length(bills) <= 15),
  CHECK (jsonb_array_length(categories) <= 20)
);

CREATE TABLE IF NOT EXISTS budget_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('expense','saving','withdrawal','income','sweep')),
  amount_cents BIGINT NOT NULL CHECK (amount_cents >= 0 AND amount_cents <= 100000000000),
  category TEXT NOT NULL CHECK (char_length(category) <= 40),
  note TEXT CHECK (note IS NULL OR char_length(note) <= 140),
  occurred_on DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS budget_entries_user_day ON budget_entries (user_id, occurred_on DESC);

CREATE TABLE IF NOT EXISTS budget_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template TEXT NOT NULL CHECK (template IN ('week52','sprint30','envelope100','custom')),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 60),
  slots JSONB NOT NULL CHECK (jsonb_typeof(slots) = 'array' AND jsonb_array_length(slots) BETWEEN 1 AND 366),
  completed JSONB NOT NULL DEFAULT '{}'::jsonb,
  swept_cents BIGINT NOT NULL DEFAULT 0 CHECK (swept_cents >= 0),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS budget_challenges_user ON budget_challenges (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS budget_milestones (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents BIGINT NOT NULL,
  reached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  seen_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, amount_cents)
);

ALTER TABLE budget_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_challenges ENABLE ROW LEVEL SECURITY;
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

DROP POLICY IF EXISTS "budget_challenges owner select" ON budget_challenges;
DROP POLICY IF EXISTS "budget_challenges owner insert" ON budget_challenges;
DROP POLICY IF EXISTS "budget_challenges owner update" ON budget_challenges;
DROP POLICY IF EXISTS "budget_challenges owner delete" ON budget_challenges;
CREATE POLICY "budget_challenges owner select" ON budget_challenges FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "budget_challenges owner insert" ON budget_challenges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "budget_challenges owner update" ON budget_challenges FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "budget_challenges owner delete" ON budget_challenges FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "budget_milestones owner select" ON budget_milestones;
DROP POLICY IF EXISTS "budget_milestones owner insert" ON budget_milestones;
DROP POLICY IF EXISTS "budget_milestones owner update" ON budget_milestones;
DROP POLICY IF EXISTS "budget_milestones owner delete" ON budget_milestones;
CREATE POLICY "budget_milestones owner select" ON budget_milestones FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "budget_milestones owner insert" ON budget_milestones FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "budget_milestones owner update" ON budget_milestones FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "budget_milestones owner delete" ON budget_milestones FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Her savings balance: money saved, less withdrawals and sweeps to investing. Only her own rows (RLS still applies).
CREATE OR REPLACE FUNCTION budget_balance() RETURNS BIGINT
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT COALESCE(SUM(CASE kind WHEN 'saving' THEN amount_cents WHEN 'withdrawal' THEN -amount_cents WHEN 'sweep' THEN -amount_cents ELSE 0 END), 0)::BIGINT
  FROM budget_entries
  WHERE user_id = auth.uid()
$$;
REVOKE ALL ON FUNCTION budget_balance() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION budget_balance() TO authenticated;

-- What she has swept from savings into her investing goal. Bloom only records it; she moves the money herself.
CREATE OR REPLACE FUNCTION budget_invested() RETURNS BIGINT
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT COALESCE(SUM(amount_cents), 0)::BIGINT FROM budget_entries WHERE user_id = auth.uid() AND kind = 'sweep'
$$;
REVOKE ALL ON FUNCTION budget_invested() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION budget_invested() TO authenticated;
