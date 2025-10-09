ALTER TABLE notes ADD COLUMN IF NOT EXISTS ai_title_generated_at TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_notes_ai_title ON notes(user_id) WHERE ai_title_generated_at IS NOT NULL;
