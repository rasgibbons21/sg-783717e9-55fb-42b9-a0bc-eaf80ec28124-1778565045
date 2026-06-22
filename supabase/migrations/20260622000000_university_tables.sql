-- University progress tables for Bloom University Pro
-- Idempotent: safe to run multiple times

-- 1. Lesson progress (one row per user per lesson)
CREATE TABLE IF NOT EXISTS university_lesson_progress (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_slug     TEXT        NOT NULL,
  lesson_slug     TEXT        NOT NULL,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, module_slug, lesson_slug)
);

ALTER TABLE university_lesson_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "university_lesson_progress_self" ON university_lesson_progress;
CREATE POLICY "university_lesson_progress_self"
  ON university_lesson_progress
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Quiz results (multiple attempts allowed)
CREATE TABLE IF NOT EXISTS university_quiz_results (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_slug  TEXT        NOT NULL,
  lesson_slug  TEXT        NOT NULL,
  score        INTEGER     NOT NULL,
  total        INTEGER     NOT NULL,
  answers      JSONB       NOT NULL DEFAULT '[]',
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE university_quiz_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "university_quiz_results_self" ON university_quiz_results;
CREATE POLICY "university_quiz_results_self"
  ON university_quiz_results
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Bookmarks (one row per user per lesson)
CREATE TABLE IF NOT EXISTS university_bookmarks (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_slug  TEXT        NOT NULL,
  lesson_slug  TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, module_slug, lesson_slug)
);

ALTER TABLE university_bookmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "university_bookmarks_self" ON university_bookmarks;
CREATE POLICY "university_bookmarks_self"
  ON university_bookmarks
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Achievements (module complete, perfect quiz, first lesson, etc.)
CREATE TABLE IF NOT EXISTS university_achievements (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT        NOT NULL,
  module_slug      TEXT,
  earned_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, achievement_type, module_slug)
);

ALTER TABLE university_achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "university_achievements_self" ON university_achievements;
CREATE POLICY "university_achievements_self"
  ON university_achievements
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for fast per-user queries
CREATE INDEX IF NOT EXISTS idx_uni_progress_user  ON university_lesson_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_uni_quiz_user       ON university_quiz_results    (user_id, module_slug, lesson_slug);
CREATE INDEX IF NOT EXISTS idx_uni_bookmarks_user  ON university_bookmarks        (user_id);
CREATE INDEX IF NOT EXISTS idx_uni_achievements_user ON university_achievements   (user_id);
