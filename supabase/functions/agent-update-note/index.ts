// supabase/functions/agent-update-note/index.ts
// Allows agent to update note content using authentication token
// SECURITY: Validates token, checks ownership, enforces rate limits, XSS prevention
// FEATURES: Supports replace/append modes, optimistic locking, audit logging

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateAgentToken, checkAndUpdateRateLimit, validateContent } from '../_shared/agent-auth.ts';

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

/**
 * Generates SHA-256 hash of content for audit logging
 */
async function generateContentHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `sha256:${hashHex}`;
}

serve(async (req) => {
  // Handle OPTIONS for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' }),
      { status: 405, headers: { ...corsHeaders, 'Allow': 'POST' } }
    );
  }

  try {
    // 1. Create service_role client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 2. Validate agent token
    const authHeader = req.headers.get('Authorization');
    const tokenResult = await validateAgentToken(supabase, authHeader);

    if (!tokenResult.success || !tokenResult.token) {
      console.log('❌ Token validation failed:', tokenResult.error);
      return new Response(
        JSON.stringify({ error: tokenResult.error, code: tokenResult.errorCode }),
        { status: tokenResult.status || 401, headers: corsHeaders }
      );
    }

    const token = tokenResult.token;
    console.log(`✅ Token validated for user: ${token.user_id}`);

    // 3. Check and update rate limit
    const rateLimitResult = await checkAndUpdateRateLimit(supabase, token.id);

    if (!rateLimitResult.success) {
      console.log('❌ Rate limit exceeded');
      const headers: Record<string, string> = { ...corsHeaders };
      if (rateLimitResult.retryAfter) {
        headers['Retry-After'] = rateLimitResult.retryAfter.toString();
      }

      return new Response(
        JSON.stringify({
          error: rateLimitResult.error,
          code: rateLimitResult.errorCode,
          retry_after: rateLimitResult.retryAfter
        }),
        { status: rateLimitResult.status || 429, headers }
      );
    }

    console.log(`📊 Rate limit: ${rateLimitResult.remaining} requests remaining`);

    // 4. Parse request body
    const body = await req.json();
    const { note_id, content, append = false, expected_version } = body;

    if (!note_id) {
      return new Response(
        JSON.stringify({ error: 'Missing note_id parameter', code: 'MISSING_NOTE_ID' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Missing content parameter', code: 'MISSING_CONTENT' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 5. Validate content (size limit, XSS prevention)
    const contentValidation = validateContent(content);
    if (!contentValidation.valid) {
      console.log(`❌ Content validation failed: ${contentValidation.error}`);
      return new Response(
        JSON.stringify({
          error: contentValidation.error,
          code: 'CONTENT_TOO_LARGE',
          max_size_bytes: 10240
        }),
        { status: 413, headers: corsHeaders }
      );
    }

    console.log(`✅ Content validated (${content.length} chars)`);

    // 6. Fetch existing note
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('id, user_id, content, updated_at')
      .eq('id', note_id)
      .single();

    if (noteError || !note) {
      console.log(`❌ Note not found: ${note_id}`);
      return new Response(
        JSON.stringify({ error: 'Note not found', code: 'NOTE_NOT_FOUND' }),
        { status: 404, headers: corsHeaders }
      );
    }

    // 7. Verify note ownership (token's user_id must match note's user_id)
    if (note.user_id !== token.user_id) {
      console.log(`❌ Unauthorized: Token user ${token.user_id} tried to update note owned by ${note.user_id}`);
      return new Response(
        JSON.stringify({ error: 'You don\'t have permission to update this note', code: 'UNAUTHORIZED_NOTE' }),
        { status: 403, headers: corsHeaders }
      );
    }

    console.log(`✅ Note ownership verified: ${note_id}`);

    // 8. Optimistic locking check (if expected_version provided)
    // REQUIRED for append mode, OPTIONAL for replace mode
    if (append && !expected_version) {
      return new Response(
        JSON.stringify({
          error: 'expected_version is required when append=true',
          code: 'MISSING_EXPECTED_VERSION',
          current_version: note.updated_at
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (expected_version) {
      // Check if note was modified since expected_version
      const expectedVersionDate = new Date(expected_version);
      const currentVersionDate = new Date(note.updated_at);

      if (currentVersionDate.getTime() !== expectedVersionDate.getTime()) {
        console.log(`❌ Version conflict: expected ${expected_version}, current ${note.updated_at}`);
        return new Response(
          JSON.stringify({
            error: 'Note was modified by another process. Retry with latest version.',
            code: 'VERSION_CONFLICT',
            current_version: note.updated_at
          }),
          { status: 409, headers: corsHeaders }
        );
      }

      console.log(`✅ Optimistic lock passed`);
    }

    // 9. Determine final content (replace vs append)
    let finalContent: string;
    let operationType: 'replace' | 'append';

    if (append) {
      finalContent = note.content + '\n\n' + content;
      operationType = 'append';
      console.log(`📝 Appending ${content.length} chars to existing ${note.content.length} chars`);
    } else {
      finalContent = content;
      operationType = 'replace';
      console.log(`📝 Replacing content (${note.content.length} → ${content.length} chars)`);
    }

    // 10. Update note in database
    const now = new Date();
    const { data: updatedNote, error: updateError } = await supabase
      .from('notes')
      .update({
        content: finalContent,
        updated_at: now.toISOString()
      })
      .eq('id', note_id)
      .select('id, updated_at')
      .single();

    if (updateError) {
      console.error('❌ Database update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update note', code: 'DATABASE_ERROR' }),
        { status: 500, headers: corsHeaders }
      );
    }

    console.log(`✅ Note updated: ${updatedNote.id}`);

    // 11. Generate content hash for audit log
    const contentHash = await generateContentHash(finalContent);

    // 12. Insert audit log entry
    const { error: logError } = await supabase
      .from('agent_write_log')
      .insert({
        token_id: token.id,
        note_id: note.id,
        content_hash: contentHash,
        content_length: finalContent.length,
        written_at: now.toISOString(),
        operation_type: operationType
      });

    if (logError) {
      console.error('⚠️ Failed to write audit log:', logError);
      // Don't fail the request, audit log is best-effort
    } else {
      console.log(`✅ Audit log entry created`);
    }

    // 13. Return success response
    return new Response(
      JSON.stringify({
        note_id: updatedNote.id,
        updated_at: updatedNote.updated_at,
        content_hash: contentHash,
        message: 'Note updated successfully'
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: corsHeaders }
    );
  }
});
