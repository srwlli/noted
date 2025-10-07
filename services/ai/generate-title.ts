import { supabase } from '@/lib/supabase';

// Error codes matching Edge Function
export const AI_ERROR_CODES = {
  NO_KEY: 'NO_API_KEY_CONFIGURED',
  INVALID_KEY: 'INVALID_API_KEY',
  RATE_LIMIT: 'API_RATE_LIMIT_EXCEEDED',
  TIMEOUT: 'API_REQUEST_TIMEOUT',
  SERVICE_DOWN: 'SERVICE_UNAVAILABLE',
  NETWORK: 'NETWORK_ERROR',
} as const;

export const AI_ERROR_MESSAGES = {
  [AI_ERROR_CODES.NO_KEY]: 'To use AI features, add your API keys in Settings → AI Features',
  [AI_ERROR_CODES.INVALID_KEY]: 'Your API key is invalid. Please check Settings → AI Features',
  [AI_ERROR_CODES.RATE_LIMIT]: "You've reached your API rate limit. Try again in a few minutes.",
  [AI_ERROR_CODES.TIMEOUT]: 'AI service is taking too long to respond. Please try again.',
  [AI_ERROR_CODES.SERVICE_DOWN]: 'AI service is currently unavailable. Please try again later.',
  [AI_ERROR_CODES.NETWORK]: 'Unable to connect to AI service. Check your internet connection.',
} as const;

export interface GenerateTitleResult {
  title: string;
  success: true;
}

export interface GenerateTitleError {
  error: string;
  code: keyof typeof AI_ERROR_CODES;
  success: false;
}

/**
 * Generate an AI title for note content using the user's Anthropic API key.
 * Calls the ai-generate-title Edge Function which uses Claude 3.5 Haiku.
 *
 * @param content - The note content to generate a title from
 * @returns Promise with either title or error
 */
export async function generateTitle(
  content: string
): Promise<GenerateTitleResult | GenerateTitleError> {
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
    const { data, error } = await supabase.functions.invoke('ai-generate-title', {
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

    if (data?.title) {
      return {
        title: data.title,
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
    console.error('Generate title error:', err);

    return {
      error: AI_ERROR_MESSAGES[AI_ERROR_CODES.NETWORK],
      code: 'NETWORK',
      success: false,
    };
  }
}
