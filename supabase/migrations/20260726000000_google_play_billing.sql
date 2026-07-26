-- Add Google Play Billing columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS entitlement_source text DEFAULT 'web',
ADD COLUMN IF NOT EXISTS google_play_purchase_token text,
ADD COLUMN IF NOT EXISTS google_play_product_id text,
ADD COLUMN IF NOT EXISTS google_play_base_plan_id text,
ADD COLUMN IF NOT EXISTS google_play_acknowledged boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_verification_time timestamptz;

-- Index for looking up users by purchase token (prevents duplicate assignment)
CREATE INDEX IF NOT EXISTS idx_profiles_google_play_token
  ON profiles (google_play_purchase_token) WHERE google_play_purchase_token IS NOT NULL;
