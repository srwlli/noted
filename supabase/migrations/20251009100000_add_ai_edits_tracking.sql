-- Add AI Edits tracking columns to notes table
--
-- This migration adds support for tracking AI-powered content edits:
-- - last_ai_edits_applied: Array of edit types that were last applied
-- - last_ai_edit_at: Timestamp of when edits were last applied
--
-- These columns enable the checkmark behavior in the AI Actions Modal
-- (showing "Edited" with checkmark after first use, matching Title/Summarize pattern)

ALTER TABLE notes ADD COLUMN IF NOT EXISTS last_ai_edits_applied TEXT[] DEFAULT NULL;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS last_ai_edit_at TIMESTAMP DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN notes.last_ai_edits_applied IS 'Array of edit types last applied (e.g., ["formatMarkdown", "fixGrammar", "makeConcise"])';
COMMENT ON COLUMN notes.last_ai_edit_at IS 'Timestamp when AI edits were last applied to this note';

-- No new RLS policies needed - columns inherit from notes table RLS
