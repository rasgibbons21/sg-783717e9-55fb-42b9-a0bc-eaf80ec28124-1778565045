-- Achievement badges earned by users
create table if not exists user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_key text not null,
  earned_at timestamptz not null default now(),
  unique(user_id, achievement_key)
);

alter table user_achievements enable row level security;
create policy "Users can read own achievements" on user_achievements for select using (auth.uid() = user_id);
create index if not exists idx_user_achievements_user on user_achievements(user_id);

-- Push notification subscriptions
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz not null default now(),
  unique(user_id, endpoint)
);

alter table push_subscriptions enable row level security;
create policy "Users can read own push subs" on push_subscriptions for select using (auth.uid() = user_id);

-- Notification log to avoid duplicate sends
create table if not exists notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_type text not null,
  sent_at timestamptz not null default now(),
  metadata jsonb default '{}'
);

alter table notification_log enable row level security;
create policy "Users can read own notifications" on notification_log for select using (auth.uid() = user_id);
create index if not exists idx_notification_log_user_type on notification_log(user_id, notification_type, sent_at desc);
