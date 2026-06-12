-- Add has_seen_pro_welcome column to profiles table
alter table profiles add column if not exists has_seen_pro_welcome boolean default false;

-- Create index for faster lookups
create index if not exists idx_profiles_pro_welcome on profiles(id, has_seen_pro_welcome);