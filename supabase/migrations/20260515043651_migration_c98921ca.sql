ALTER TABLE users ADD COLUMN IF NOT EXISTS bookmarked_lessons TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS users_bookmarked_lessons_idx ON users USING GIN (bookmarked_lessons);

DROP POLICY IF EXISTS "users_update_own_bookmarks" ON users;
CREATE POLICY "users_update_own_bookmarks" ON users
  FOR UPDATE
  USING (auth.uid() = id);