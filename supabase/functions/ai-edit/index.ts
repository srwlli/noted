import { createClient } from 'jsr:@supabase/supabase-js@2';
import Anthropic from 'npm:@anthropic-ai/sdk@0.32.1';

// Import the orchestrator and edit functions
// Note: In Deno, we'll need to use relative imports
import { applyAIEdits } from './orchestrator.ts';
import type { EditOptions } from './types.ts';

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
  CONTENT_SHORT: { code: 'CONTENT_TOO_SHORT', status: 400 },
  CONTENT_LONG: { code: 'CONTENT_TOO_LONG', status: 400 },
  NO_OPTIONS: { code: 'NO_OPTIONS_SELECTED', status: 400 },
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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', code: 'INVALID_TOKEN' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse request body
    const { content, options } = await req.json();

    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Note content is required', code: 'MISSING_CONTENT' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!options || typeof options !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Edit options are required', code: 'MISSING_OPTIONS' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Server-side validation
    if (content.trim().length < 10) {
      return new Response(
        JSON.stringify({
          error: 'Content too short',
          code: AI_ERRORS.CONTENT_SHORT.code,
        }),
        {
          status: AI_ERRORS.CONTENT_SHORT.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (content.length > 50000) {
      return new Response(
        JSON.stringify({
          error: 'Content too long',
          code: AI_ERRORS.CONTENT_LONG.code,
        }),
        {
          status: AI_ERRORS.CONTENT_LONG.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 4. Fetch user's API key using service role (bypasses RLS)
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
          code: AI_ERRORS.NO_KEY.code,
        }),
        {
          status: AI_ERRORS.NO_KEY.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 5. Call Anthropic API using user's key
    const anthropic = new Anthropic({ apiKey: keysData.anthropic_key });

    // 6. Apply AI edits using orchestrator
    console.log('[index] Starting AI edits with options:', options);
    console.log('[index] Content length:', content.length);
    console.log('[index] Anthropic client initialized:', !!anthropic);

    const editOptions: EditOptions = {
      formatMarkdown: options.formatMarkdown,
      fixGrammar: options.fixGrammar,
      addHeadings: options.addHeadings,
      improveStructure: options.improveStructure,
      lengthAdjustment: options.lengthAdjustment,
      tone: options.tone || null,
    };

    // Create AbortController for timeout (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      console.log('[index] Calling applyAIEdits...');
      const result = await applyAIEdits(content, editOptions, anthropic, controller.signal);
      console.log('[index] applyAIEdits completed:', { success: result.success });

      clearTimeout(timeoutId);

      // Return the result
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('[index] Error in applyAIEdits:', error);

      if (error.name === 'AbortError') {
        return new Response(
          JSON.stringify({
            error: 'Request timeout',
            code: AI_ERRORS.TIMEOUT.code,
          }),
          {
            status: AI_ERRORS.TIMEOUT.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error('Error in ai-edit:', error);

    // Handle Anthropic API errors
    if (error.status === 401) {
      return new Response(
        JSON.stringify({
          error: 'Invalid API key',
          code: AI_ERRORS.INVALID_KEY.code,
        }),
        {
          status: AI_ERRORS.INVALID_KEY.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (error.status === 429) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          code: AI_ERRORS.RATE_LIMIT.code,
        }),
        {
          status: AI_ERRORS.RATE_LIMIT.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (error.status === 503) {
      return new Response(
        JSON.stringify({
          error: 'Service unavailable',
          code: AI_ERRORS.SERVICE_DOWN.code,
        }),
        {
          status: AI_ERRORS.SERVICE_DOWN.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generic error
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
