-- Update trigger function to use hardcoded secrets
-- This is necessary because we don't have permission to set database-level parameters

CREATE OR REPLACE FUNCTION trigger_agent_chat_response()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
  response_id INT;
  agent_response_count_old INT;
  agent_response_count_new INT;
BEGIN
  -- Only trigger if note is marked as agent chat
  IF NEW.is_agent_chat = true AND OLD.content != NEW.content THEN

    -- Prevent infinite loops: Check if this update added an agent response
    -- Count how many "**Agent**:" markers exist in old vs new content
    agent_response_count_old := array_length(string_to_array(OLD.content, '**Agent**:'), 1) - 1;
    agent_response_count_new := array_length(string_to_array(NEW.content, '**Agent**:'), 1) - 1;

    -- Only trigger if user added content (not agent)
    -- If agent_response_count increased, that means agent just responded, don't trigger again
    IF agent_response_count_new <= agent_response_count_old THEN

      -- Hardcoded Supabase URL (already public in client code)
      webhook_url := 'https://ikovzegiuzjkubymwvjz.supabase.co/functions/v1/agent-chat-respond';

      -- Call Edge Function via HTTP (requires pg_net extension)
      -- Secrets are hardcoded here since we can't set database-level parameters
      SELECT net.http_post(
        url := webhook_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlrb3Z6ZWdpdXpqa3VieW13dmp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzk1NDMwMSwiZXhwIjoyMDczNTMwMzAxfQ.PZVQ1X3rG-wk9KNApDV6uef8ZRk9uBoQiYqlwFzdHds',
          'X-Webhook-Secret', 'wShnUwKbKXumCuACOzk9HIRjjgGzhAq0MUtwFsIyMXE='
        ),
        body := jsonb_build_object(
          'note_id', NEW.id,
          'user_id', NEW.user_id,
          'content', NEW.content
        )
      ) INTO response_id;

      -- Log for debugging (optional)
      RAISE LOG 'Agent chat trigger fired for note_id=% user_id=% response_id=%', NEW.id, NEW.user_id, response_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION trigger_agent_chat_response() IS
  'Triggers AI agent response generation when user updates an agent chat note.
  Prevents infinite loops by checking if agent just responded.
  Uses hardcoded secrets for webhook authentication and database access.';
