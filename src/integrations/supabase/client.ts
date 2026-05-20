import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://cmaphczdwujcdmuycdsf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtYXBoY3pkd3VqY2RtdXljZHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTk5NTYsImV4cCI6MjA5Mzc3NTk1Nn0.mMwweMrVuwW92yLfj8PvmlVYYXDuq7G1kmQSay3QY_s';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});