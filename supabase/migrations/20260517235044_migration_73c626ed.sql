-- Create pansy_analysis_logs table to track AI analysis requests
CREATE TABLE IF NOT EXISTS pansy_analysis_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticker TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create broadcast_messages table for admin announcements
CREATE TABLE IF NOT EXISTS broadcast_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  created_by TEXT DEFAULT 'admin',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE pansy_analysis_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_messages ENABLE ROW LEVEL SECURITY;

-- Policies for pansy_analysis_logs
CREATE POLICY "Users can insert their own logs" ON pansy_analysis_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own logs" ON pansy_analysis_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Policies for broadcast_messages (public read)
CREATE POLICY "Everyone can read active broadcasts" ON broadcast_messages
  FOR SELECT USING (active = true);

CREATE POLICY "Only service role can insert broadcasts" ON broadcast_messages
  FOR INSERT WITH CHECK (false);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pansy_logs_user_id ON pansy_analysis_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_pansy_logs_ticker ON pansy_analysis_logs(ticker);
CREATE INDEX IF NOT EXISTS idx_pansy_logs_created_at ON pansy_analysis_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_broadcast_active ON broadcast_messages(active) WHERE active = true;