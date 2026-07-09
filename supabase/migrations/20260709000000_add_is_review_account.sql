ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_review_account boolean NOT NULL DEFAULT false;
