-- Daily streaks: one row per user, updated each day they engage
create table if not exists daily_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_active_date date not null default current_date,
  total_active_days integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table daily_streaks enable row level security;
create policy "Users can read own streak" on daily_streaks for select using (auth.uid() = user_id);

-- Daily challenges: one challenge per day, globally shared
create table if not exists daily_challenges (
  id uuid primary key default gen_random_uuid(),
  challenge_date date not null unique default current_date,
  challenge_type text not null, -- 'trade', 'learn', 'research', 'journal'
  title text not null,
  description text not null,
  reward_xp integer not null default 25,
  reward_gems integer not null default 5,
  criteria jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table daily_challenges enable row level security;
create policy "Anyone can read challenges" on daily_challenges for select using (true);

-- Daily challenge completions: tracks which users completed which challenges
create table if not exists daily_challenge_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id uuid not null references daily_challenges(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique(user_id, challenge_id)
);

alter table daily_challenge_completions enable row level security;
create policy "Users can read own completions" on daily_challenge_completions for select using (auth.uid() = user_id);

-- Activity log: records daily engagements for streak calculation
create table if not exists daily_activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null default current_date,
  activity_type text not null, -- 'lesson', 'trade', 'challenge', 'journal', 'login'
  reference_id text, -- optional: lesson slug, trade id, etc.
  created_at timestamptz not null default now(),
  unique(user_id, activity_date, activity_type, reference_id)
);

alter table daily_activity_log enable row level security;
create policy "Users can read own activity" on daily_activity_log for select using (auth.uid() = user_id);

-- Index for fast streak lookups
create index if not exists idx_daily_activity_user_date on daily_activity_log(user_id, activity_date desc);
create index if not exists idx_daily_streaks_streak on daily_streaks(current_streak desc);
