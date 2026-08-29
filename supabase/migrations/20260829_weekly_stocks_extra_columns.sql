-- Add analysis columns for AI-generated weekly picks
ALTER TABLE public.weekly_stocks
  ADD COLUMN IF NOT EXISTS technical_brief TEXT,
  ADD COLUMN IF NOT EXISTS fundamental_brief TEXT,
  ADD COLUMN IF NOT EXISTS timeframe TEXT;
