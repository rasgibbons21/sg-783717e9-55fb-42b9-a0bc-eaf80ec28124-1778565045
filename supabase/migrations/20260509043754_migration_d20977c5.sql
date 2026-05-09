-- Create users table with investment preferences
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro')),
  risk_tolerance TEXT CHECK (risk_tolerance IN ('Conservative', 'Moderate', 'Aggressive')),
  investment_goals TEXT[],
  experience_level TEXT CHECK (experience_level IN ('Beginner', 'Intermediate', 'Advanced')),
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  paypal_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create broker_clicks tracking table
CREATE TABLE broker_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  broker_name TEXT NOT NULL,
  is_affiliate BOOLEAN DEFAULT false,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create watchlist table
CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('stock', 'etf', 'mutual_fund')),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ticker)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users (T1 - Private user data)
CREATE POLICY "select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own" ON users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for subscriptions (T1 - Private user data)
CREATE POLICY "select_own" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for broker_clicks (users can insert their own clicks)
CREATE POLICY "insert_own" ON broker_clicks FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "select_own" ON broker_clicks FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for watchlist (T1 - Private user data)
CREATE POLICY "select_own" ON watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own" ON watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own" ON watchlist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own" ON watchlist FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for auto-creating user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email) VALUES (NEW.id, NEW.email) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();