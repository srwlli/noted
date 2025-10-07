import { createClient } from 'jsr:@supabase/supabase-js@2';
import Anthropic from 'npm:@anthropic-ai/sdk@0.32.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Error codes matching client-side constants
const AI_ERRORS = {
  NO_KEY: { code: 'NO_API_KEY_CONFIGURED', status: 400 },
  INVALID_KEY: { code: 'INVALID_API_KEY', status: 401 },
  RATE_LIMIT: { code: 'API_RATE_LIMIT_EXCEEDED', status: 429 },
  TIMEOUT: { code: 'API_REQUEST_TIMEOUT', status: 504 },
  SERVICE_DOWN: { code: 'SERVICE_UNAVAILABLE', status: 503 },
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Extract user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', code: 'MISSING_AUTH' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client for auth
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', code: 'INVALID_TOKEN' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse request body
    const { content } = await req.json();

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Note content is required', code: 'MISSING_CONTENT' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Fetch user's API key using service role (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: keysData, error: keysError } = await supabaseAdmin
      .from('user_ai_keys')
      .select('anthropic_key')
      .eq('user_id', user.id)
      .single();

    if (keysError || !keysData?.anthropic_key) {
      return new Response(
        JSON.stringify({
          error: 'No API key configured',
          code: AI_ERRORS.NO_KEY.code
        }),
        { status: AI_ERRORS.NO_KEY.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Call Anthropic API using user's key
    const anthropic = new Anthropic({ apiKey: keysData.anthropic_key });

    // Limit content to first 2000 chars for title generation
    const truncatedContent = content.substring(0, 2000);

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 50,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: `Generate a concise, descriptive title (max 50 characters) for this note. Return ONLY the title, no quotes or extra text:\n\n${truncatedContent}`
      }]
    });

    const title = response.content[0].type === 'text'
      ? response.content[0].text.trim()
      : 'Untitled Note';

    // Ensure title is max 50 chars
    const finalTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;

    return new Response(
      JSON.stringify({ title: finalTitle }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-generate-title:', error);

    // Handle Anthropic API errors
    if (error.status === 401) {
      return new Response(
        JSON.stringify({
          error: 'Invalid API key',
          code: AI_ERRORS.INVALID_KEY.code
        }),
        { status: AI_ERRORS.INVALID_KEY.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (error.status === 429) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          code: AI_ERRORS.RATE_LIMIT.code
        }),
        { status: AI_ERRORS.RATE_LIMIT.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (error.status === 503) {
      return new Response(
        JSON.stringify({
          error: 'Service unavailable',
          code: AI_ERRORS.SERVICE_DOWN.code
        }),
        { status: AI_ERRORS.SERVICE_DOWN.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generic error
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
