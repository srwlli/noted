// supabase/functions/publish-note/index.ts
// PRODUCTION-READY VERSION - All security and logic bugs fixed
// v2.4 fixes: Rate limit timing, published_at preservation, CORS, method validation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for web app compatibility
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // FIX #4: Request method validation
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { ...corsHeaders, 'Allow': 'POST' }
    });
  }

  try {
    // 1. Get JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('❌ No Authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'UNAUTHORIZED' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. Create service_role client
    // SECURITY: service_role key bypasses RLS - only use in Edge Functions, never expose to client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 3. Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.log('❌ Auth verification failed:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'UNAUTHORIZED' }),
        { status: 401, headers: corsHeaders }
      );
    }

    console.log(`✅ User authenticated: ${user.id}`);

    // 4. Parse body
    const { noteId, noteTitle, noteContent } = await req.json();
    console.log(`📝 Publishing note ${noteId} with title: ${noteTitle}`);

    // 5. FIX #1 (Security): Validate note ownership
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('user_id')
      .eq('id', noteId)
      .single();

    if (noteError || !note) {
      console.log('❌ Note not found:', noteId);
      return new Response(
        JSON.stringify({ success: false, error: 'NOTE_NOT_FOUND' }),
        { status: 404, headers: corsHeaders }
      );
    }

    if (note.user_id !== user.id) {
      console.log(`❌ Unauthorized: User ${user.id} tried to publish note ${noteId} owned by ${note.user_id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'UNAUTHORIZED' }),
        { status: 401, headers: corsHeaders }
      );
    }

    console.log('✅ Note ownership verified');

    // 6. Validate inputs
    if (!noteContent || noteContent.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'NOTE_EMPTY' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (noteContent.length > 100000) {
      return new Response(
        JSON.stringify({ success: false, error: 'NOTE_TOO_LARGE' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 7. FIX #1 (Logic): Check rate limit (but DON'T increment yet)
    const { data: rateLimit } = await supabase
      .from('publish_rate_limits')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const now = new Date();
    const nextMidnight = new Date();
    nextMidnight.setUTCHours(24, 0, 0, 0);

    let currentCount = 0;
    let needsReset = false;

    if (rateLimit) {
      const resetAt = new Date(rateLimit.reset_at);
      needsReset = now >= resetAt;

      if (!needsReset) {
        currentCount = rateLimit.publish_count_today;

        // Check limit BEFORE publishing
        if (currentCount >= 50) {
          console.log(`❌ Rate limit exceeded: ${currentCount}/50`);
          return new Response(
            JSON.stringify({ success: false, error: 'RATE_LIMIT_EXCEEDED' }),
            { status: 429, headers: corsHeaders }
          );
        }
      }
    }

    console.log(`📊 Current rate limit: ${currentCount}/50 (needsReset: ${needsReset})`);

    // 8. Generate slug (title validation + generation)
    const effectiveTitle = (noteTitle && noteTitle.trim() && noteTitle.toLowerCase() !== 'untitled')
      ? noteTitle
      : noteContent.split('\n').find(line => line.trim().length > 0)?.substring(0, 60) || 'untitled-note';

    let baseSlug = generateSlug(effectiveTitle);
    console.log(`🔗 Generated base slug: ${baseSlug}`);

    // 9. FIX #2 (Security): Proper 5-retry slug collision logic
    let finalSlug = baseSlug;
    let attempts = 0;
    const MAX_ATTEMPTS = 5;

    while (attempts < MAX_ATTEMPTS) {
      const { data: existingSlug } = await supabase
        .from('published_notes')
        .select('slug, note_id')
        .eq('slug', finalSlug)
        .maybeSingle();

      // If no collision, or collision is with same note (republish), use this slug
      if (!existingSlug || existingSlug.note_id === noteId) {
        console.log(`✅ Slug available: ${finalSlug}`);
        break;
      }

      // Collision detected, try with suffix
      finalSlug = `${baseSlug}-${randomSuffix()}`;
      attempts++;
      console.log(`⚠️ Slug collision (attempt ${attempts}/${MAX_ATTEMPTS}): Trying ${finalSlug}`);
    }

    if (attempts === MAX_ATTEMPTS) {
      // UUID fallback
      finalSlug = `note-${crypto.randomUUID().substring(0, 8)}`;
      console.log(`🆔 UUID fallback: ${finalSlug}`);
    }

    // 10. FIX #2 (Logic): Check if already published (to preserve published_at)
    const { data: existingPublish } = await supabase
      .from('published_notes')
      .select('id, published_at')
      .eq('note_id', noteId)
      .maybeSingle();

    // 11. Insert or update (preserving original published_at)
    if (existingPublish) {
      // Republish - UPDATE only slug (keep original published_at)
      const { error: updateError } = await supabase
        .from('published_notes')
        .update({ slug: finalSlug }) // updated_at handled by trigger
        .eq('note_id', noteId);

      if (updateError) {
        console.error('❌ Database update error:', updateError);
        return new Response(
          JSON.stringify({ success: false, error: 'DATABASE_ERROR' }),
          { status: 500, headers: corsHeaders }
        );
      }

      console.log(`✅ Note republished (preserved published_at: ${existingPublish.published_at})`);
    } else {
      // First publish - INSERT with new published_at
      const { error: insertError } = await supabase
        .from('published_notes')
        .insert({
          note_id: noteId,
          user_id: user.id,
          slug: finalSlug,
          published_at: now.toISOString()
        });

      if (insertError) {
        console.error('❌ Database insert error:', insertError);
        return new Response(
          JSON.stringify({ success: false, error: 'DATABASE_ERROR' }),
          { status: 500, headers: corsHeaders }
        );
      }

      console.log(`✅ Note published for first time (published_at: ${now.toISOString()})`);
    }

    // 12. FIX #1 (Logic): NOW increment rate limit (only AFTER successful publish)
    if (!rateLimit) {
      // First publish ever - create row
      console.log('📊 Creating rate limit row (first publish)');
      await supabase.from('publish_rate_limits').insert({
        user_id: user.id,
        publish_count_today: 1,
        last_publish_at: now.toISOString(),
        reset_at: nextMidnight.toISOString()
      });
    } else if (needsReset) {
      // Reset counter
      console.log('🔄 Resetting rate limit counter (new day)');
      await supabase.from('publish_rate_limits').update({
        publish_count_today: 1,
        last_publish_at: now.toISOString(),
        reset_at: nextMidnight.toISOString()
      }).eq('user_id', user.id);
    } else {
      // Increment counter
      await supabase.from('publish_rate_limits').update({
        publish_count_today: currentCount + 1,
        last_publish_at: now.toISOString()
      }).eq('user_id', user.id);
      console.log(`📊 Rate limit: ${currentCount + 1}/50`);
    }

    // 13. Return success
    const baseUrl = Deno.env.get('BASE_URL');
    if (!baseUrl) {
      console.error('❌ BASE_URL environment variable not set!');
      console.error('   Set it in Supabase Dashboard → Settings → Edge Functions → Secrets');
      return new Response(
        JSON.stringify({ success: false, error: 'DATABASE_ERROR' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const publicUrl = `${baseUrl}/p/${finalSlug}`;
    console.log(`✅ Note published: ${publicUrl}`);

    return new Response(
      JSON.stringify({ success: true, slug: finalSlug, publicUrl }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'DATABASE_ERROR' }),
      { status: 500, headers: corsHeaders }
    );
  }
});

// Helper functions
function generateSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);

  // Prevent leading numbers
  if (/^\d/.test(slug)) {
    return `note-${slug}`;
  }

  return slug || 'untitled-note';
}

function randomSuffix(): string {
  return Math.random().toString(36).substring(2, 8);
}
