-- Create lesson_progress table to track user completion
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "select_own_progress" ON lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own_progress" ON lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_progress" ON lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_own_progress" ON lesson_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS lesson_progress_user_id_idx ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS lesson_progress_lesson_id_idx ON lesson_progress(lesson_id);