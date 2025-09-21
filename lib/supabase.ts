import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ikovzegiuzjkubymwvjz.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlrb3Z6ZWdpdXpqa3VieW13dmp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NTQzMDEsImV4cCI6MjA3MzUzMDMwMX0.9MR79hAeOXn1SUZzMsnbnIVwsPKgGqWX1l5b7un121Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);