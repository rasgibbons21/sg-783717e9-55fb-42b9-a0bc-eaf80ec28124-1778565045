-- Bloom Practice Trader tables
-- Educational simulator only — no real trades, no real money.
-- Idempotent: safe to run multiple times.

-- ── 1. Virtual account (one per user) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS practice_account (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cash_balance    NUMERIC(14,2) NOT NULL DEFAULT 10000.00,
  initial_balance NUMERIC(14,2) NOT NULL DEFAULT 10000.00,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

ALTER TABLE practice_account ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "practice_account_self" ON practice_account;
CREATE POLICY "practice_account_self"
  ON practice_account
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 2. Practice trades ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS practice_trades (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id   UUID        NOT NULL REFERENCES practice_account(id) ON DELETE CASCADE,
  ticker       TEXT        NOT NULL,
  direction    TEXT        NOT NULL CHECK (direction IN ('long','short')),
  shares       NUMERIC(14,4) NOT NULL,
  entry_price  NUMERIC(14,4) NOT NULL,
  exit_price   NUMERIC(14,4),
  stop_price   NUMERIC(14,4),
  target_price NUMERIC(14,4),
  pnl          NUMERIC(14,2),
  pnl_pct      NUMERIC(8,4),
  risk_amount  NUMERIC(14,2),
  thesis       TEXT,
  exit_reason  TEXT,
  status       TEXT        NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  entry_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  exit_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE practice_trades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "practice_trades_self" ON practice_trades;
CREATE POLICY "practice_trades_self"
  ON practice_trades
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_practice_trades_user ON practice_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_trades_status ON practice_trades(user_id, status);

-- ── 3. Practice journal ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS practice_journal (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_id   UUID        REFERENCES practice_trades(id) ON DELETE SET NULL,
  entry      TEXT        NOT NULL,
  mood       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE practice_journal ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "practice_journal_self" ON practice_journal;
CREATE POLICY "practice_journal_self"
  ON practice_journal
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_practice_journal_user ON practice_journal(user_id);
