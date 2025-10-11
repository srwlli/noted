import { createClient } from 'jsr:@supabase/supabase-js@2';
import Anthropic from 'npm:@anthropic-ai/sdk@0.32.1';

const WEBHOOK_SECRET = Deno.env.get('AGENT_CHAT_WEBHOOK_SECRET')!;
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

Deno.serve(async (req) => {
  try {
    // 1. Validate webhook secret
    const secret = req.headers.get('X-Webhook-Secret');
    if (secret !== WEBHOOK_SECRET) {
      console.error('Invalid webhook secret');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Parse request
    const { note_id, user_id, content } = await req.json();
    if (!note_id || !user_id || !content) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`Agent chat trigger for note_id=${note_id} user_id=${user_id}`);

    // 3. Parse conversation from note content
    // Split by agent responses to find user messages
    const conversationHistory: Message[] = [];

    // Split by double newline to get message blocks
    const blocks = content.split(/\n\n+/);

    for (const block of blocks) {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) continue;

      if (trimmedBlock.startsWith('**Agent**:')) {
        // Agent message
        conversationHistory.push({
          role: 'assistant',
          content: trimmedBlock.replace(/^\*\*Agent\*\*:\s*/, '').trim()
        });
      } else if (trimmedBlock.startsWith('User:')) {
        // Explicit user message
        conversationHistory.push({
          role: 'user',
          content: trimmedBlock.replace(/^User:\s*/, '').trim()
        });
      } else {
        // Implicit user message (no prefix)
        conversationHistory.push({
          role: 'user',
          content: trimmedBlock
        });
      }
    }

    // If no messages parsed or last message is from agent, don't respond
    if (conversationHistory.length === 0) {
      console.log('No messages found in note content');
      return new Response(JSON.stringify({
        status: 'ok',
        message: 'No messages to respond to'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const lastMessage = conversationHistory[conversationHistory.length - 1];
    if (lastMessage.role === 'assistant') {
      console.log('Last message is from assistant, not responding');
      return new Response(JSON.stringify({
        status: 'ok',
        message: 'Last message is from agent, not responding'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Limit to last 20 messages for context
    const recentHistory = conversationHistory.slice(-20);

    console.log(`Calling Claude API with ${recentHistory.length} messages`);

    // 4. Call Claude API
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000,
      temperature: 0.7,
      system: 'You are a helpful AI assistant embedded in a note-taking app called Noted. Provide concise, helpful, and friendly responses. You can help with questions, brainstorming, writing, and general assistance.',
      messages: recentHistory
    });

    const agentResponse = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Error: Could not generate response';

    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

    console.log(`Claude API response: ${tokensUsed} tokens used`);

    // 5. Append response to note using service role
    const formattedResponse = `\n\n**Agent**: ${agentResponse}`;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { error: updateError } = await supabase
      .from('notes')
      .update({
        content: content + formattedResponse,
        updated_at: new Date().toISOString()
      })
      .eq('id', note_id);

    if (updateError) {
      console.error('Failed to update note:', updateError);
      throw new Error(`Failed to update note: ${updateError.message}`);
    }

    console.log(`Successfully appended agent response to note_id=${note_id}`);

    return new Response(
      JSON.stringify({
        status: 'ok',
        message: 'Agent response appended',
        tokens_used: tokensUsed,
        note_id: note_id
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Agent chat error:', error);

    // Check if it's an Anthropic API error
    if (error.status) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: `Claude API error: ${error.message}`,
          code: 'CLAUDE_API_ERROR'
        }),
        {
          status: error.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message || 'Unknown error occurred',
        code: 'AGENT_CHAT_FAILED'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
