-- Add is_favorite column to folders table for Dashboard folder favorites feature
-- This enables users to mark folders for quick access on the Dashboard

-- Add is_favorite boolean column with default false
ALTER TABLE public.folders
  ADD COLUMN is_favorite BOOLEAN NOT NULL DEFAULT false;

-- Create partial index for efficient favorite folder queries
-- Only indexes rows where is_favorite = true (most folders won't be favorited)
CREATE INDEX idx_folders_user_favorite
  ON public.folders(user_id, is_favorite)
  WHERE is_favorite = true;

-- Add comment for documentation
COMMENT ON COLUMN public.folders.is_favorite IS 'Marks folder as favorite for Dashboard quick access';
