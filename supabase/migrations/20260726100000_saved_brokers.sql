-- Saved brokers: lets signed-in users bookmark brokers for later comparison
CREATE TABLE IF NOT EXISTS saved_brokers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  broker_id text NOT NULL,
  saved_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, broker_id)
);

ALTER TABLE saved_brokers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved brokers"
  ON saved_brokers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save brokers"
  ON saved_brokers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave brokers"
  ON saved_brokers FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_saved_brokers_user ON saved_brokers (user_id);
