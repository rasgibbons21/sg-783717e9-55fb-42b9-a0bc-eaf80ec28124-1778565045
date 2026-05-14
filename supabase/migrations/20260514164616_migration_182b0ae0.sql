-- Create price_alerts table for tracking user notification preferences
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_change', 'target_price', 'volume_spike')),
  threshold NUMERIC NOT NULL,
  enabled BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ticker, alert_type)
);

-- Create notification_tokens table for storing push notification subscriptions
CREATE TABLE IF NOT EXISTS notification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for price_alerts
CREATE POLICY "Users can view own alerts" ON price_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own alerts" ON price_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON price_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own alerts" ON price_alerts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for notification_tokens
CREATE POLICY "Users can view own tokens" ON notification_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tokens" ON notification_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own tokens" ON notification_tokens FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS price_alerts_user_id_idx ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS notification_tokens_user_id_idx ON notification_tokens(user_id);