-- AI API Keys table for BYOK (Bring Your Own Key) module
-- Users store their own API keys for Anthropic Claude and Perplexity APIs
-- Keys are stored in plain text with RLS (Row Level Security) for single-user Phase 1
-- Future: Upgrade to Supabase Vault or server-side encryption for multi-user production

CREATE TABLE user_ai_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anthropic_key TEXT,
  perplexity_key TEXT,
  keys_verified BOOLEAN DEFAULT false,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for fast user_id lookups
CREATE INDEX idx_user_ai_keys_user_id ON user_ai_keys(user_id);

-- Enable Row Level Security
ALTER TABLE user_ai_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own keys
CREATE POLICY "Users can view own keys"
  ON user_ai_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own keys"
  ON user_ai_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own keys"
  ON user_ai_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own keys"
  ON user_ai_keys FOR DELETE
  USING (auth.uid() = user_id);
