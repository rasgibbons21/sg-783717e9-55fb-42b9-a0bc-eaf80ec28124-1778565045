CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'delivered',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for email logs" ON email_logs
  FOR SELECT USING (true);
  
CREATE POLICY "Public insert for email logs" ON email_logs
  FOR INSERT WITH CHECK (true);