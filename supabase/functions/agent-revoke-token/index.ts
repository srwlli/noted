// supabase/functions/agent-revoke-token/index.ts
// Allows user to revoke an agent authentication token
// SECURITY: Requires user JWT, validates token ownership

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' }),
      { status: 405, headers: { ...corsHeaders, 'Allow': 'POST' } }
    );
  }

  try {
    // 1. Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', code: 'UNAUTHORIZED' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Create service_role client for token revocation
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify user JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.log('❌ Auth verification failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', code: 'UNAUTHORIZED' }),
        { status: 401, headers: corsHeaders }
      );
    }

    console.log(`✅ User authenticated: ${user.id}`);

    // 2. Parse request body
    const body = await req.json();
    const { token_id } = body;

    if (!token_id) {
      return new Response(
        JSON.stringify({ error: 'Missing token_id parameter', code: 'MISSING_TOKEN_ID' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Fetch token to verify ownership
    const { data: token, error: tokenError } = await supabase
      .from('agent_tokens')
      .select('id, user_id, revoked_at')
      .eq('id', token_id)
      .single();

    if (tokenError || !token) {
      console.log(`❌ Token not found: ${token_id}`);
      return new Response(
        JSON.stringify({ error: 'Token not found', code: 'TOKEN_NOT_FOUND' }),
        { status: 404, headers: corsHeaders }
      );
    }

    // 4. Verify user owns this token
    if (token.user_id !== user.id) {
      console.log(`❌ Unauthorized: User ${user.id} tried to revoke token owned by ${token.user_id}`);
      return new Response(
        JSON.stringify({ error: 'You don\'t have permission to revoke this token', code: 'UNAUTHORIZED_TOKEN' }),
        { status: 403, headers: corsHeaders }
      );
    }

    // 5. Check if already revoked
    if (token.revoked_at) {
      console.log(`⚠️ Token already revoked: ${token_id}`);
      return new Response(
        JSON.stringify({
          message: 'Token already revoked',
          token_id: token.id,
          revoked_at: token.revoked_at
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    console.log(`✅ Token ownership verified: ${token_id}`);

    // 6. Revoke token by setting revoked_at timestamp
    const now = new Date();
    const { data: revokedToken, error: revokeError } = await supabase
      .from('agent_tokens')
      .update({ revoked_at: now.toISOString() })
      .eq('id', token_id)
      .select('id, revoked_at')
      .single();

    if (revokeError) {
      console.error('❌ Database update error:', revokeError);
      return new Response(
        JSON.stringify({ error: 'Failed to revoke token', code: 'DATABASE_ERROR' }),
        { status: 500, headers: corsHeaders }
      );
    }

    console.log(`✅ Token revoked: ${revokedToken.id}`);

    // 7. Return success response
    return new Response(
      JSON.stringify({
        message: 'Token revoked successfully',
        token_id: revokedToken.id,
        revoked_at: revokedToken.revoked_at
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
