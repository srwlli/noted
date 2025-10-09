ALTER TABLE notes ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS summary_generated_at TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_notes_ai_summary ON notes(user_id) WHERE ai_summary IS NOT NULL;
