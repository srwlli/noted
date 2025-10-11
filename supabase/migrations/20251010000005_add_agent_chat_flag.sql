-- Add is_agent_chat flag to notes table for Agent Communication feature
-- This column marks notes that should trigger automatic AI agent responses

-- Add is_agent_chat column
ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_agent_chat BOOLEAN DEFAULT false;

-- Create index for efficient querying of agent chat notes
CREATE INDEX IF NOT EXISTS idx_notes_agent_chat
  ON notes(user_id, is_agent_chat)
  WHERE is_agent_chat = true;

-- Add comment for documentation
COMMENT ON COLUMN notes.is_agent_chat IS
  'Marks notes that trigger automatic AI agent responses via database trigger. See improvements/chat-ui-with-live-sync.json for details.';
