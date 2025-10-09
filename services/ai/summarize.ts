import { supabase } from '@/lib/supabase';
import { AI_ERROR_CODES, AI_ERROR_MESSAGES } from './generate-title';

export interface SummarizeNoteResult {
  summary: string;
  success: true;
}

export interface SummarizeNoteError {
  error: string;
  code: keyof typeof AI_ERROR_CODES;
  success: false;
}

/**
 * Generate an AI summary for note content using the user's Anthropic API key.
 * Calls the ai-summarize Edge Function which uses Claude 3.5 Haiku.
 *
 * @param content - The note content to summarize
 * @returns Promise with either summary or error
 */
export async function summarizeNote(
  content: string
): Promise<SummarizeNoteResult | SummarizeNoteError> {
  try {
    // Get the current user's session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return {
        error: AI_ERROR_MESSAGES[AI_ERROR_CODES.NO_KEY],
        code: 'NO_KEY',
        success: false,
      };
    }

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('ai-summarize', {
      body: { content },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Edge Function error:', error);

      // Map error codes to user-friendly messages
      if (error.context?.code) {
        const code = error.context.code as keyof typeof AI_ERROR_CODES;
        return {
          error: AI_ERROR_MESSAGES[code] || error.message,
          code,
          success: false,
        };
      }

      // Network or timeout errors
      return {
        error: AI_ERROR_MESSAGES[AI_ERROR_CODES.NETWORK],
        code: 'NETWORK',
        success: false,
      };
    }

    if (data?.summary) {
      return {
        summary: data.summary,
        success: true,
      };
    }

    // Unexpected response format
    return {
      error: 'Unexpected response from AI service',
      code: 'NETWORK',
      success: false,
    };
  } catch (err: any) {
    console.error('Summarize note error:', err);

    return {
      error: AI_ERROR_MESSAGES[AI_ERROR_CODES.NETWORK],
      code: 'NETWORK',
      success: false,
    };
  }
}
