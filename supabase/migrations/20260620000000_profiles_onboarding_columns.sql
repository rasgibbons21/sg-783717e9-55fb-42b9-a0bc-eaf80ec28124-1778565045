ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS experience_level    TEXT,
  ADD COLUMN IF NOT EXISTS investment_goals    TEXT[],
  ADD COLUMN IF NOT EXISTS risk_tolerance      TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS current_age         INTEGER,
  ADD COLUMN IF NOT EXISTS bookmarked_lessons  TEXT[] DEFAULT '{}';
