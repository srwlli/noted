-- Migration: Add Supabase Storage for note images
-- Created: 2025-10-06
-- Purpose: Enable users to upload images from their device and store in Supabase Storage

-- Create storage bucket for note images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'note-images',
  'note-images',
  true, -- Public bucket with RLS policies (users can only access their own images)
  5242880, -- 5MB max file size
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Users can upload to their own folder
CREATE POLICY "Users can upload images to their own folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'note-images' AND
  SPLIT_PART(name, '/', 1) = auth.uid()::text
);

-- RLS Policy: Users can view their own images
CREATE POLICY "Users can view their own images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'note-images' AND
  SPLIT_PART(name, '/', 1) = auth.uid()::text
);

-- RLS Policy: Users can delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'note-images' AND
  SPLIT_PART(name, '/', 1) = auth.uid()::text
);
