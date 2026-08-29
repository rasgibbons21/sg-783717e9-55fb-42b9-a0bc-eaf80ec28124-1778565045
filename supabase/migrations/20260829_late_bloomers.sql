-- Late Bloomers newsletter list
CREATE TABLE IF NOT EXISTS public.late_bloomers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  signup_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.late_bloomers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON public.late_bloomers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.late_bloomers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.late_bloomers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access late_bloomers"
  ON public.late_bloomers FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX idx_late_bloomers_active ON public.late_bloomers(active);

-- Weekly stock picks (admin-managed content)
CREATE TABLE IF NOT EXISTS public.weekly_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_of DATE NOT NULL,
  symbol TEXT NOT NULL,
  price DECIMAL(10, 2),
  why TEXT,
  entry_zone TEXT,
  risk TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.weekly_stocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read weekly stocks"
  ON public.weekly_stocks FOR SELECT
  USING (true);

CREATE POLICY "Service role full access weekly_stocks"
  ON public.weekly_stocks FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX idx_weekly_stocks_week ON public.weekly_stocks(week_of DESC);
