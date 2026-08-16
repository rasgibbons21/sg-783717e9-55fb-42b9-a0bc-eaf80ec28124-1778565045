-- Budget Tracker: expense tracking with Pansy's guidance
CREATE TABLE IF NOT EXISTS public.budget_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  note TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_budget_entries_user_date ON public.budget_entries(user_id, date DESC);

ALTER TABLE public.budget_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_budget" ON public.budget_entries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_budget" ON public.budget_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_delete_own_budget" ON public.budget_entries
  FOR DELETE USING (user_id = auth.uid());
