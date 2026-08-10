-- Add referral columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by text,
ADD COLUMN IF NOT EXISTS referral_reward_days integer DEFAULT 0;

-- Create referrals tracking table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id),
  referred_id uuid NOT NULL REFERENCES auth.users(id),
  referral_code text NOT NULL,
  reward_applied boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view their own referrals"
    ON referrals FOR SELECT
    USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
