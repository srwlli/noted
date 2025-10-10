-- Migration: Create published_notes and publish_rate_limits tables
-- Purpose: Enable users to publish notes as public web pages with rate limiting
-- Author: Claude Code
-- Date: 2025-10-10

-- ============================================================================
-- PART 0: ENABLE REQUIRED EXTENSIONS
-- ============================================================================

-- Enable uuid-ossp extension for uuid_generate_v4() function
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PART 1: CREATE TRIGGER FUNCTION (reusable for updated_at columns)
-- ============================================================================

-- Create or replace trigger function for updating updated_at timestamp
-- This may already exist from previous migrations, so we use CREATE OR REPLACE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 2: CREATE published_notes TABLE
-- ============================================================================

-- Table to track which notes are publicly accessible and their slugs
CREATE TABLE IF NOT EXISTS published_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference to the note being published (one-to-one relationship)
  note_id UUID NOT NULL UNIQUE REFERENCES notes(id) ON DELETE CASCADE,

  -- Owner of the published note
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- URL-safe slug for public access (e.g., "my-note-title")
  -- CONSTRAINT: Must start with lowercase letter, contain only a-z, 0-9, hyphens
  -- Length: 1-60 characters
  slug TEXT NOT NULL UNIQUE CHECK (
    slug ~ '^[a-z]([a-z0-9-]*[a-z0-9])?$'
    AND LENGTH(slug) >= 1
    AND LENGTH(slug) <= 60
  ),

  -- Timestamp when note was first published (preserved on republish)
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Timestamp when metadata was last updated (auto-updated by trigger)
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_published_notes_slug ON published_notes(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_published_notes_note_id ON published_notes(note_id);
CREATE INDEX IF NOT EXISTS idx_published_notes_user_id ON published_notes(user_id);

-- Add trigger to auto-update updated_at timestamp
CREATE TRIGGER update_published_notes_updated_at
  BEFORE UPDATE ON published_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 3: CREATE publish_rate_limits TABLE
-- ============================================================================

-- Table to enforce rate limiting (50 publishes per day per user)
CREATE TABLE IF NOT EXISTS publish_rate_limits (
  -- One row per user (primary key)
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Timestamp of most recent publish attempt
  last_publish_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Number of publishes today (0-50)
  -- CONSTRAINT: Must be between 0 and 50
  publish_count_today INTEGER NOT NULL DEFAULT 1 CHECK (
    publish_count_today >= 0 AND publish_count_today <= 50
  ),

  -- Timestamp when counter resets (midnight UTC next day)
  -- Formula: date_trunc('day', NOW() AT TIME ZONE 'UTC') + INTERVAL '1 day'
  reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (
    date_trunc('day', NOW() AT TIME ZONE 'UTC') + INTERVAL '1 day'
  )
);

-- Create index for reset_at lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON publish_rate_limits(reset_at);

-- ============================================================================
-- PART 4: CREATE RLS POLICIES FOR published_notes TABLE
-- ============================================================================

-- Enable Row Level Security on published_notes
ALTER TABLE published_notes ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone (including anonymous users) can view published notes metadata
CREATE POLICY "Anyone can view published notes metadata"
  ON published_notes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy 2: Authenticated users can publish their own notes
CREATE POLICY "Users can publish their own notes"
  ON published_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can unpublish their own notes
CREATE POLICY "Users can unpublish their own notes"
  ON published_notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 4: Users can update their published notes (change slug)
CREATE POLICY "Users can update their published notes"
  ON published_notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- PART 5: CREATE RLS POLICY FOR notes TABLE (public access)
-- ============================================================================

-- Policy: Public can view published note content
-- This allows anonymous users to read note content if the note is published
CREATE POLICY "Public can view published note content"
  ON notes
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM published_notes
      WHERE published_notes.note_id = notes.id
    )
  );

-- ============================================================================
-- PART 6: CREATE RLS POLICIES FOR publish_rate_limits TABLE
-- ============================================================================

-- Enable Row Level Security on publish_rate_limits
ALTER TABLE publish_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own rate limits
CREATE POLICY "Users can view their own rate limits"
  ON publish_rate_limits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Edge Functions (service_role) can manage rate limits
-- Note: Only Edge Functions should use service_role key (never exposed to client)
CREATE POLICY "Edge function can manage rate limits"
  ON publish_rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Tables created:
--   1. published_notes (with indexes and trigger)
--   2. publish_rate_limits (with index)
--
-- RLS Policies created:
--   - published_notes: 4 policies (SELECT for public, INSERT/UPDATE/DELETE for owners)
--   - notes: 1 policy (SELECT for published notes by public)
--   - publish_rate_limits: 2 policies (SELECT for users, ALL for service_role)
--
-- Next steps:
--   1. Deploy Edge Function (supabase/functions/publish-note/)
--   2. Set BASE_URL environment variable in Supabase dashboard
--   3. Test migration: npx supabase db reset
