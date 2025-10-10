-- Agent Communication Feature
-- Enables AI agents (like Claude Code) to read/write notes via secure token authentication
-- Created: 2025-10-10
-- Plan version: 2.1.0

-- =====================================================
-- 1. Create agent_tokens table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.agent_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Token authentication
    token_hash TEXT NOT NULL, -- bcrypt hash of full token
    token_prefix TEXT NOT NULL, -- First 17 chars for UI display (e.g., 'agent_abc123def4')
    name TEXT, -- Optional user-friendly label (e.g., 'Claude Code - Desktop')

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '90 days'),
    revoked_at TIMESTAMP WITH TIME ZONE NULL,
    last_used_at TIMESTAMP WITH TIME ZONE NULL,

    -- Rate limiting (atomic SQL updates, no race conditions)
    requests_count INTEGER NOT NULL DEFAULT 0,
    rate_limit_reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Failed authentication tracking (auto-revoke after 10 failures)
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    last_failed_at TIMESTAMP WITH TIME ZONE NULL
);

-- Add comment to table
COMMENT ON TABLE public.agent_tokens IS 'Authentication tokens for AI agents to access notes. Tokens are bcrypt-hashed and rate-limited to 100 requests/hour.';

-- =====================================================
-- 2. Create agent_write_log table (audit trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.agent_write_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID NOT NULL REFERENCES public.agent_tokens(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,

    -- Audit information
    content_hash TEXT NOT NULL, -- SHA-256 hash of content written
    content_length INTEGER NOT NULL, -- Size in bytes
    operation_type TEXT NOT NULL CHECK (operation_type IN ('replace', 'append')),
    written_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE public.agent_write_log IS 'Audit log of all agent write operations for security and debugging.';

-- =====================================================
-- 3. Create indexes for performance
-- =====================================================

-- agent_tokens indexes
CREATE INDEX IF NOT EXISTS idx_agent_tokens_user_id ON public.agent_tokens(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_tokens_hash ON public.agent_tokens(token_hash); -- Fast token lookup
CREATE INDEX IF NOT EXISTS idx_agent_tokens_expiry ON public.agent_tokens(expires_at, revoked_at)
    WHERE revoked_at IS NULL; -- Find active tokens

-- agent_write_log indexes
CREATE INDEX IF NOT EXISTS idx_agent_write_log_note_id ON public.agent_write_log(note_id, written_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_write_log_token_id ON public.agent_write_log(token_id, written_at DESC);

-- =====================================================
-- 4. Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on both tables
ALTER TABLE public.agent_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_write_log ENABLE ROW LEVEL SECURITY;

-- agent_tokens policies
-- Users can view their own tokens
CREATE POLICY "Users can view own agent tokens"
    ON public.agent_tokens
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own tokens (for revocation via app UI)
CREATE POLICY "Users can update own agent tokens"
    ON public.agent_tokens
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Service role can insert tokens (via agent-generate-token Edge Function)
CREATE POLICY "Service role can insert agent tokens"
    ON public.agent_tokens
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Service role can delete tokens (via agent-revoke-token Edge Function)
CREATE POLICY "Service role can delete agent tokens"
    ON public.agent_tokens
    FOR DELETE
    USING (auth.role() = 'service_role');

-- Service role can select all tokens (needed for token validation in Edge Functions)
CREATE POLICY "Service role can select all agent tokens"
    ON public.agent_tokens
    FOR SELECT
    USING (auth.role() = 'service_role');

-- agent_write_log policies
-- Users can view logs for their own tokens
CREATE POLICY "Users can view own agent write logs"
    ON public.agent_write_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.agent_tokens
            WHERE agent_tokens.id = agent_write_log.token_id
            AND agent_tokens.user_id = auth.uid()
        )
    );

-- Service role can insert logs (via agent-update-note Edge Function)
CREATE POLICY "Service role can insert agent write logs"
    ON public.agent_write_log
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Service role can select all logs (for debugging)
CREATE POLICY "Service role can select all agent write logs"
    ON public.agent_write_log
    FOR SELECT
    USING (auth.role() = 'service_role');

-- =====================================================
-- 5. Grant permissions
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, UPDATE ON public.agent_tokens TO authenticated;
GRANT SELECT ON public.agent_write_log TO authenticated;

-- Grant full permissions to service role (Edge Functions)
GRANT ALL ON public.agent_tokens TO service_role;
GRANT ALL ON public.agent_write_log TO service_role;

-- =====================================================
-- Migration complete
-- =====================================================
-- Next steps:
-- 1. Deploy Edge Functions: agent-generate-token, agent-read-note, agent-update-note, agent-revoke-token
-- 2. Create UI for token management in app/settings/agent-tokens.tsx
-- 3. Test token generation and agent communication
