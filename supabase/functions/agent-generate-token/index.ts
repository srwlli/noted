// supabase/functions/agent-generate-token/index.ts
// Generates new agent authentication token for user
// SECURITY: Requires user JWT, returns plaintext token ONCE with Cache-Control: no-store

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { generateSecureToken, hashToken } from '../_shared/agent-auth.ts';

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'no-store', // SECURITY: Prevent caching of token response
  'X-Content-Type-Options': 'nosniff'
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

    // Create service_role client for token generation
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

    // 2. Parse request body (optional name parameter)
    let tokenName: string | null = null;
    try {
      const body = await req.json();
      tokenName = body.name || null;
    } catch {
      // Body is optional, continue without name
    }

    // 3. Generate secure random token (64 chars)
    // Format: agent_[12_random_chars]_[52_random_chars]
    const plainToken = generateSecureToken();
    const tokenPrefix = plainToken.substring(0, 17); // First 17 chars for UI display

    console.log(`🔐 Generated token with prefix: ${tokenPrefix}`);

    // 4. Hash token with bcrypt (10 salt rounds)
    const tokenHash = await hashToken(plainToken);

    // 5. Set expiry to 90 days from now
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90 days

    // 6. Insert token into database
    const { data: tokenData, error: insertError } = await supabase
      .from('agent_tokens')
      .insert({
        user_id: user.id,
        token_hash: tokenHash,
        token_prefix: tokenPrefix,
        name: tokenName,
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        requests_count: 0,
        rate_limit_reset_at: now.toISOString(),
        failed_attempts: 0
      })
      .select('id, created_at, expires_at')
      .single();

    if (insertError) {
      console.error('❌ Database insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate token', code: 'DATABASE_ERROR' }),
        { status: 500, headers: corsHeaders }
      );
    }

    console.log(`✅ Token created: ${tokenData.id}`);

    // 7. Return plaintext token (ONLY TIME IT'S SHOWN)
    return new Response(
      JSON.stringify({
        token: plainToken, // Full 64-char plaintext token
        token_id: tokenData.id,
        token_prefix: tokenPrefix,
        expires_at: expiresAt.toISOString(),
        warning: 'Save this token securely. It will not be shown again.'
      }),
      {
        status: 200,
        headers: corsHeaders // Includes Cache-Control: no-store
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: corsHeaders }
    );
  }
});
