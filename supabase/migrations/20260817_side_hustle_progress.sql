-- Side hustle journey progress tracking
CREATE TABLE IF NOT EXISTS side_hustle_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hustle_type TEXT NOT NULL,
  completed_steps INTEGER[] DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, hustle_type)
);

ALTER TABLE side_hustle_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own hustle progress"
  ON side_hustle_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own hustle progress"
  ON side_hustle_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own hustle progress"
  ON side_hustle_progress FOR UPDATE
  USING (auth.uid() = user_id);
