-- Best first-try test score per lesson, shown on Profile.
ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS test_score SMALLINT, ADD COLUMN IF NOT EXISTS test_total SMALLINT;
