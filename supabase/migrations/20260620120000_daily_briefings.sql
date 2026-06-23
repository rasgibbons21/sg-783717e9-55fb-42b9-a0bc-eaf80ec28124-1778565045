CREATE TABLE IF NOT EXISTS daily_briefings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  briefing_date DATE NOT NULL,
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT daily_briefings_date_unique UNIQUE (briefing_date)
);

ALTER TABLE daily_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "briefings_select_authenticated"
  ON daily_briefings FOR SELECT
  USING (auth.role() = 'authenticated');
