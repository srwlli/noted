# Agent Chat Setup Guide

This document describes how to configure the Agent Communication system for the Noted app.

## Overview

The Agent Chat feature allows users to interact with an AI assistant directly in a special note. The system uses:
- Database triggers (PostgreSQL) to detect user messages
- Edge Functions (Deno) to process AI requests
- Supabase Realtime to sync responses back to the client

## Prerequisites

- Supabase project configured
- Anthropic API key (Claude)
- Supabase CLI installed

## Setup Steps

### 1. Deploy Migrations

All migrations are already deployed:
- ✅ `20251010000005_add_agent_chat_flag.sql` - Adds is_agent_chat column
- ✅ `20251010000006_agent_chat_trigger.sql` - Creates database trigger
- ✅ `20251010000007_agent_chat_vault_secrets.sql` - Updates trigger with secrets

### 2. Configure Edge Function Secrets

Edge Function secrets are already configured:
- ✅ `ANTHROPIC_API_KEY` - Claude API key
- ✅ `SUPABASE_URL` - Supabase project URL
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database access
- ✅ `AGENT_CHAT_WEBHOOK_SECRET` - Webhook authentication secret

Generated webhook secret: `wShnUwKbKXumCuACOzk9HIRjjgGzhAq0MUtwFsIyMXE=`

### 3. Configure Database Settings

**IMPORTANT**: You must configure PostgreSQL settings for the database trigger to work.

Run this SQL in **Supabase Dashboard → SQL Editor**:

```sql
-- Set webhook secret (must match Edge Function secret)
ALTER DATABASE postgres SET app.agent_chat_webhook_secret = 'wShnUwKbKXumCuACOzk9HIRjjgGzhAq0MUtwFsIyMXE=';

-- Set service role key (get from Supabase Dashboard → Settings → API)
ALTER DATABASE postgres SET app.supabase_service_role_key = 'YOUR_SERVICE_ROLE_KEY_HERE';

-- Verify settings
SELECT name, setting FROM pg_settings WHERE name LIKE 'app.%';
```

**To get your Service Role Key:**
1. Go to Supabase Dashboard
2. Navigate to Settings → API
3. Copy the `service_role` key (starts with `eyJ...`)
4. Replace `YOUR_SERVICE_ROLE_KEY_HERE` in the SQL above

### 4. Deploy Edge Function

The Edge Function is already deployed:

```bash
npx supabase functions deploy agent-chat-respond
```

### 5. Test the System

1. Open the Noted app
2. The "🤖 Agent Chat" note should auto-create at the top of your notes list
3. Open the note and type a message
4. Save the note
5. The AI should respond within 2-5 seconds

## Architecture

```
User types in note
    ↓
Supabase Realtime syncs to database
    ↓
Database UPDATE trigger fires
    ↓
Trigger calls agent-chat-respond Edge Function
    ↓
Edge Function calls Claude API
    ↓
Edge Function appends response to note
    ↓
Supabase Realtime syncs response to client
    ↓
User sees AI response
```

## Troubleshooting

### Agent not responding

1. **Check database logs** in Supabase Dashboard → Database → Logs
   - Look for "Agent chat trigger fired" messages
   - Check for HTTP errors

2. **Check Edge Function logs** in Supabase Dashboard → Edge Functions → agent-chat-respond
   - Look for authentication errors
   - Check for API rate limits

3. **Verify secrets are set correctly**:
   ```sql
   SELECT name, setting FROM pg_settings WHERE name LIKE 'app.%';
   ```

4. **Check Edge Function secrets**:
   ```bash
   npx supabase secrets list
   ```

### Infinite loop detection

The trigger prevents infinite loops by counting `**Agent**:` markers in the note content. If the count increases, it means the agent just responded, so it won't trigger again.

### Response format

User messages: Plain text (no prefix required)
Agent responses: `**Agent**: [message]`

## Cost Estimates

- Model: Claude 3.5 Haiku
- Cost per message: ~$0.0001-0.0003
- Typical usage: 50 messages/day = $0.50-1.50/month per user

## Security

- Webhook secret authenticates trigger → Edge Function calls
- Service role key allows Edge Function to update notes
- Row Level Security (RLS) ensures users only access their own notes
- All secrets stored securely (Edge Function env vars + database settings)

## Next Steps

After setup is complete:
1. Test the basic flow (send message → receive response)
2. Test edge cases (rapid messages, long conversations, errors)
3. Monitor costs via Anthropic dashboard
4. Collect user feedback
5. Iterate on prompt and response quality
