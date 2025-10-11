-- Database trigger for Agent Communication via Shared Note
-- Fires when an agent chat note is updated, calls Edge Function to generate AI response
-- See improvements/chat-ui-with-live-sync.json for full architecture

-- Function to call Edge Function when agent chat note is updated
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

      -- Get Edge Function URL
      -- Format: https://ikovzegiuzjkubymwvjz.supabase.co/functions/v1/agent-chat-respond
      webhook_url := current_setting('app.supabase_url', true) || '/functions/v1/agent-chat-respond';

      -- Call Edge Function via HTTP (requires pg_net extension)
      -- The Edge Function will handle the AI response generation
      SELECT net.http_post(
        url := webhook_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key', true),
          'X-Webhook-Secret', current_setting('app.agent_chat_webhook_secret', true)
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

-- Create trigger on notes table
DROP TRIGGER IF EXISTS agent_chat_response_trigger ON notes;
CREATE TRIGGER agent_chat_response_trigger
  AFTER UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_agent_chat_response();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION trigger_agent_chat_response() TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_agent_chat_response() TO service_role;

-- Add comments for documentation
COMMENT ON FUNCTION trigger_agent_chat_response() IS
  'Triggers AI agent response generation when user updates an agent chat note. Prevents infinite loops by checking if agent just responded.';

COMMENT ON TRIGGER agent_chat_response_trigger ON notes IS
  'Fires after note update to generate AI agent responses for agent chat notes (is_agent_chat=true).';
