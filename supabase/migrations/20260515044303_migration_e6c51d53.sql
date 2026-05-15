-- Add quiz_score column to lesson_progress table
ALTER TABLE lesson_progress 
ADD COLUMN IF NOT EXISTS quiz_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quiz_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quiz_completed BOOLEAN DEFAULT false;