-- Add is_favorite column to notes table for Dashboard favorites feature
-- This enables users to mark notes for quick access on the Dashboard

-- Add is_favorite boolean column with default false
ALTER TABLE public.notes
  ADD COLUMN is_favorite BOOLEAN NOT NULL DEFAULT false;

-- Create partial index for efficient favorite queries
-- Only indexes rows where is_favorite = true (most notes won't be favorited)
CREATE INDEX idx_notes_user_favorite
  ON public.notes(user_id, is_favorite)
  WHERE is_favorite = true;

-- Create index for Last 3 recent non-favorite notes query
-- Optimizes getRecentNonFavoriteNotes() query performance
CREATE INDEX idx_notes_user_recent
  ON public.notes(user_id, updated_at DESC)
  WHERE is_favorite = false;

-- Add comment for documentation
COMMENT ON COLUMN public.notes.is_favorite IS 'Marks note as favorite for Dashboard quick access';
