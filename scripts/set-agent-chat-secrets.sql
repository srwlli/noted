-- Configure Agent Chat Secrets
-- Run this in Supabase Dashboard → SQL Editor

-- STEP 1: Get your Service Role Key
-- 1. Go to Supabase Dashboard → Settings → API
-- 2. Find "service_role" key (starts with eyJ...)
-- 3. Copy the key
-- 4. Replace YOUR_SERVICE_ROLE_KEY_HERE below with the copied value

-- STEP 2: Run these commands

-- Set webhook secret (already generated and set in Edge Function)
ALTER DATABASE postgres SET app.agent_chat_webhook_secret = 'wShnUwKbKXumCuACOzk9HIRjjgGzhAq0MUtwFsIyMXE=';

-- Set service role key (REPLACE WITH YOUR ACTUAL KEY!)
ALTER DATABASE postgres SET app.supabase_service_role_key = 'YOUR_SERVICE_ROLE_KEY_HERE';

-- STEP 3: Verify settings were applied
SELECT name, setting FROM pg_settings WHERE name LIKE 'app.%';

-- You should see:
-- app.agent_chat_webhook_secret | wShnUwKbKXumCuACOzk9HIRjjgGzhAq0MUtwFsIyMXE=
-- app.supabase_service_role_key | eyJ... (your service role key)

-- STEP 4: Test the system
-- 1. Open the Noted app
-- 2. Find the "🤖 Agent Chat" note at the top
-- 3. Type a message and save
-- 4. Wait 2-5 seconds for AI response
