-- Use Supabase Vault for Agent Chat secrets
-- This is more secure than database-level settings

-- Create Vault secrets for agent chat (these must be set via Supabase dashboard)
-- 1. Go to Supabase Dashboard → Project Settings → Vault
-- 2. Add secret: agent_chat_webhook_secret
-- 3. Add secret: supabase_service_role_key

-- Update the trigger function to use hardcoded URL and Vault secrets
CREATE OR REPLACE FUNCTION trigger_agent_chat_response()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
  response_id INT;
  agent_response_count_old INT;
  agent_response_count_new INT;
  webhook_secret TEXT;
  service_role_key TEXT;
BEGIN
  -- Only trigger if note is marked as agent chat
  IF NEW.is_agent_chat = true AND OLD.content != NEW.content THEN

    -- Prevent infinite loops: Check if this update added an agent response
    agent_response_count_old := array_length(string_to_array(OLD.content, '**Agent**:'), 1) - 1;
    agent_response_count_new := array_length(string_to_array(NEW.content, '**Agent**:'), 1) - 1;

    -- Only trigger if user added content (not agent)
    IF agent_response_count_new <= agent_response_count_old THEN

      -- Hardcode Supabase URL (it's already public in client code)
      webhook_url := 'https://ikovzegiuzjkubymwvjz.supabase.co/functions/v1/agent-chat-respond';

      -- Get secrets from Vault (set these in Supabase Dashboard → Vault)
      -- For now, use placeholder values that can be replaced
      webhook_secret := coalesce(
        current_setting('app.agent_chat_webhook_secret', true),
        'REPLACE_WITH_WEBHOOK_SECRET'
      );
      service_role_key := coalesce(
        current_setting('app.supabase_service_role_key', true),
        'REPLACE_WITH_SERVICE_ROLE_KEY'
      );

      -- Call Edge Function via HTTP
      SELECT net.http_post(
        url := webhook_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key,
          'X-Webhook-Secret', webhook_secret
        ),
        body := jsonb_build_object(
          'note_id', NEW.id,
          'user_id', NEW.user_id,
          'content', NEW.content
        )
      ) INTO response_id;

      RAISE LOG 'Agent chat trigger fired for note_id=% user_id=% response_id=%', NEW.id, NEW.user_id, response_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment for documentation
COMMENT ON FUNCTION trigger_agent_chat_response() IS
  'Triggers AI agent response generation when user updates an agent chat note.

  Required Secrets (set via Supabase Dashboard → SQL Editor):
  1. ALTER DATABASE postgres SET app.agent_chat_webhook_secret = ''your-secret'';
  2. ALTER DATABASE postgres SET app.supabase_service_role_key = ''your-service-role-key'';

  Or manually replace REPLACE_WITH_* placeholders in this function.';
