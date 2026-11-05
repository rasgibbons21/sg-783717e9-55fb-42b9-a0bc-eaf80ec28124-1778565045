-- Lets members choose whether they appear on the leaderboards.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_on_leaderboard BOOLEAN NOT NULL DEFAULT true;
