-- Add AI summary columns to notes table
ALTER TABLE notes ADD COLUMN ai_summary TEXT;
ALTER TABLE notes ADD COLUMN summary_generated_at TIMESTAMP;

-- Create partial index for notes with summaries (faster queries)
CREATE INDEX idx_notes_ai_summary ON notes(user_id) WHERE ai_summary IS NOT NULL;
