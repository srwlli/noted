-- Add input validation constraints to notes table
-- This prevents database corruption and protects against malicious input

-- Step 1: Add VARCHAR length limit to title (currently unlimited TEXT)
-- Limits title to 200 characters (reasonable for note titles)
ALTER TABLE notes
  ALTER COLUMN title TYPE VARCHAR(200);

-- Step 2: Ensure title is never null
ALTER TABLE notes
  ALTER COLUMN title SET NOT NULL;

-- Step 3: Prevent empty titles (just whitespace)
-- This ensures every note has a meaningful title
ALTER TABLE notes
  ADD CONSTRAINT title_not_empty
  CHECK (LENGTH(TRIM(title)) > 0);

-- Step 4: Limit content to 50,000 characters (~10 pages of text)
-- Prevents users from storing huge amounts of data per note
ALTER TABLE notes
  ADD CONSTRAINT content_max_length
  CHECK (LENGTH(content) <= 50000);

-- Note: These constraints will fail gracefully if existing data violates them
-- The migration will rollback and preserve existing data
