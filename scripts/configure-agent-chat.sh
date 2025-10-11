#!/bin/bash

# Configure Agent Chat Database Settings
# This script sets the required PostgreSQL settings for the agent chat trigger

echo "🤖 Configuring Agent Chat Database Settings..."

# Get Supabase URL from .env
SUPABASE_URL="https://ikovzegiuzjkubymwvjz.supabase.co"

# Check if service role key is provided
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY not set"
  echo "   Please set it: export SUPABASE_SERVICE_ROLE_KEY='your-key-here'"
  echo "   You can find it in: Supabase Dashboard → Settings → API → service_role key"
  exit 1
fi

# Check if webhook secret is provided
if [ -z "$AGENT_CHAT_WEBHOOK_SECRET" ]; then
  echo "❌ Error: AGENT_CHAT_WEBHOOK_SECRET not set"
  echo "   Please set it: export AGENT_CHAT_WEBHOOK_SECRET='your-secret-here'"
  echo "   Generate one with: openssl rand -base64 32"
  exit 1
fi

echo "📝 Setting database configuration..."

# Set PostgreSQL runtime settings
npx supabase db execute --sql "ALTER DATABASE postgres SET app.supabase_url = '$SUPABASE_URL';"
npx supabase db execute --sql "ALTER DATABASE postgres SET app.supabase_service_role_key = '$SUPABASE_SERVICE_ROLE_KEY';"
npx supabase db execute --sql "ALTER DATABASE postgres SET app.agent_chat_webhook_secret = '$AGENT_CHAT_WEBHOOK_SECRET';"

echo "✅ Database settings configured!"
echo ""
echo "📋 Next Steps:"
echo "   1. Verify settings with: npx supabase db execute --sql \"SELECT name, setting FROM pg_settings WHERE name LIKE 'app.%';\""
echo "   2. Set Edge Function secrets in Supabase Dashboard:"
echo "      - AGENT_CHAT_WEBHOOK_SECRET=$AGENT_CHAT_WEBHOOK_SECRET"
echo "      - ANTHROPIC_API_KEY=<from .env>"
echo "      - SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY"
echo "   3. Deploy Edge Function: npx supabase functions deploy agent-chat-respond"
echo "   4. Test the flow by editing the 🤖 Agent Chat note"
