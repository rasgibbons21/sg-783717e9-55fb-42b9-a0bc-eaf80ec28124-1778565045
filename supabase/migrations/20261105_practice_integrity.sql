-- Practice money and lesson progress change only through Bloom's server, so the
-- leaderboards can't be edited from a browser. Members can still read their own rows.

-- Atomic balance changes, so two devices can't overwrite each other.
CREATE OR REPLACE FUNCTION practice_reserve_cash(p_account_id UUID, p_amount NUMERIC)
RETURNS NUMERIC
LANGUAGE sql
AS $$
  UPDATE practice_account
     SET cash_balance = cash_balance - p_amount, updated_at = NOW()
   WHERE id = p_account_id AND cash_balance >= p_amount
  RETURNING cash_balance;
$$;

CREATE OR REPLACE FUNCTION practice_release_cash(p_account_id UUID, p_delta NUMERIC)
RETURNS NUMERIC
LANGUAGE sql
AS $$
  UPDATE practice_account
     SET cash_balance = GREATEST(cash_balance + p_delta, 0), updated_at = NOW()
   WHERE id = p_account_id
  RETURNING cash_balance;
$$;

REVOKE ALL ON FUNCTION practice_reserve_cash(UUID, NUMERIC) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION practice_release_cash(UUID, NUMERIC) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION practice_reserve_cash(UUID, NUMERIC) TO service_role;
GRANT EXECUTE ON FUNCTION practice_release_cash(UUID, NUMERIC) TO service_role;

-- Practice tables become read-only for members.
DROP POLICY IF EXISTS "practice_account_self" ON practice_account;
CREATE POLICY "practice_account_read_own"
  ON practice_account FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "practice_trades_self" ON practice_trades;
CREATE POLICY "practice_trades_read_own"
  ON practice_trades FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Lesson progress becomes read-only for members. Completions go through /api/lessons/complete.
DROP POLICY IF EXISTS "insert_own_progress" ON lesson_progress;
DROP POLICY IF EXISTS "update_own_progress" ON lesson_progress;
DROP POLICY IF EXISTS "delete_own_progress" ON lesson_progress;
