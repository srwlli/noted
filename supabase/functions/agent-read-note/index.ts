// supabase/functions/agent-read-note/index.ts
// Allows agent to read note content using authentication token
// SECURITY: Validates token, checks ownership, enforces rate limits

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateAgentToken, checkAndUpdateRateLimit } from '../_shared/agent-auth.ts';

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  // Handle OPTIONS for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' }),
      { status: 405, headers: { ...corsHeaders, 'Allow': 'GET' } }
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

    // 4. Get note_id from query parameters
    const url = new URL(req.url);
    const noteId = url.searchParams.get('note_id');

    if (!noteId) {
      return new Response(
        JSON.stringify({ error: 'Missing note_id parameter', code: 'MISSING_NOTE_ID' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 5. Fetch note from database
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('id, user_id, title, content, created_at, updated_at')
      .eq('id', noteId)
      .single();

    if (noteError || !note) {
      console.log(`❌ Note not found: ${noteId}`);
      return new Response(
        JSON.stringify({ error: 'Note not found', code: 'NOTE_NOT_FOUND' }),
        { status: 404, headers: corsHeaders }
      );
    }

    // 6. Verify note ownership (token's user_id must match note's user_id)
    if (note.user_id !== token.user_id) {
      console.log(`❌ Unauthorized: Token user ${token.user_id} tried to read note owned by ${note.user_id}`);
      return new Response(
        JSON.stringify({ error: 'You don\'t have permission to access this note', code: 'UNAUTHORIZED_NOTE' }),
        { status: 403, headers: corsHeaders }
      );
    }

    console.log(`✅ Note ownership verified: ${noteId}`);

    // 7. Return note data
    return new Response(
      JSON.stringify({
        note_id: note.id,
        title: note.title,
        content: note.content,
        created_at: note.created_at,
        updated_at: note.updated_at
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
