-- Add time_horizon column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS time_horizon TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_contribution NUMERIC(10,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_age INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS retirement_age INTEGER;

-- Add CHECK constraint for time_horizon
DO $$ BEGIN
  ALTER TABLE users ADD CONSTRAINT users_time_horizon_check 
    CHECK (time_horizon IN ('Short-term (0-3 years)', 'Medium-term (3-10 years)', 'Long-term (10+ years)'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON COLUMN users.time_horizon IS 'Investment time horizon for goal planning';
COMMENT ON COLUMN users.monthly_contribution IS 'Monthly investment contribution amount for projections';
COMMENT ON COLUMN users.current_age IS 'User current age for retirement planning';
COMMENT ON COLUMN users.retirement_age IS 'Target retirement age for projections';