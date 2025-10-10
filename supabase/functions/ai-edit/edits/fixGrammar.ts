/**
 * Fix Grammar & Spelling
 *
 * Corrects spelling errors, grammar mistakes, and punctuation issues
 * while preserving original meaning and tone.
 *
 * Temperature: 0.1 (highly deterministic corrections)
 */

import type { EditResult } from '../types.ts';

/**
 * Enhanced prompt with few-shot examples and context preservation rules
 */
function buildPrompt(content: string): string {
  return `You are a grammar and spelling correction expert.

Example 1:
Input: We discussed the quaterly budjet and decieded to increase spendign by 10%.
Output: We discussed the quarterly budget and decided to increase spending by 10%.

Example 2:
Input: The team preformed excellant work on the projct, but their was some delays.
Output: The team performed excellent work on the project, but there were some delays.

RULES:
- Fix ALL grammar, spelling, and punctuation errors
- Preserve the original meaning, tone, and style EXACTLY
- Only correct errors - do NOT rewrite or rephrase
- Preserve technical terms, names, dates, numbers exactly
- Maintain original formatting (headings, lists, code blocks, links)
- Keep the same sentence structure and word choice
- If unsure, bias toward preserving original

Now fix all errors in this content:

${content}`;
}

/**
 * Fix grammar and spelling errors
 *
 * @param content - The note content to correct
 * @param anthropic - Anthropic client instance (passed from edge function)
 * @param signal - Optional abort signal for cancellation
 * @returns EditResult with corrected content and metadata
 */
export async function fixGrammar(
  content: string,
  anthropic: any,
  signal?: AbortSignal
): Promise<EditResult> {
  const startTime = Date.now();
  const originalContent = content;

  try {
    if (signal?.aborted) {
      throw new Error('Operation cancelled');
    }

    const prompt = buildPrompt(content);

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4096,
      temperature: 0.1, // Highly deterministic for grammar corrections
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const correctedContent =
      response.content[0].type === 'text' ? response.content[0].text.trim() : content;

    const durationMs = Date.now() - startTime;
    const changesMade = correctedContent !== originalContent;
    const characterDelta = correctedContent.length - originalContent.length;

    return {
      success: true,
      content: correctedContent,
      appliedEdits: [
        {
          type: 'fixGrammar',
          status: 'success',
          durationMs,
          changesMade,
          characterDelta,
        },
      ],
      failedEdits: [],
      originalContent,
      changePercentage: changesMade ? Math.abs(characterDelta / originalContent.length) * 100 : 0,
      processingTimeMs: durationMs,
    };
  } catch (error: any) {
    const durationMs = Date.now() - startTime;

    if (signal?.aborted || error.message === 'Operation cancelled') {
      return {
        success: false,
        content: originalContent,
        appliedEdits: [],
        failedEdits: [
          {
            type: 'fixGrammar',
            status: 'failed',
            error: 'Operation cancelled by user',
            recoverable: false,
          },
        ],
        originalContent,
        changePercentage: 0,
        processingTimeMs: durationMs,
        error: {
          code: 'USER_CANCELLED',
          message: 'User cancelled the operation',
          userMessage: 'Operation cancelled',
          retryable: false,
        },
      };
    }

    return {
      success: false,
      content: originalContent,
      appliedEdits: [],
      failedEdits: [
        {
          type: 'fixGrammar',
          status: 'failed',
          error: error.message || 'Unknown error',
          recoverable: true,
        },
      ],
      originalContent,
      changePercentage: 0,
      processingTimeMs: durationMs,
      error: {
        code: 'API_FAILURE',
        message: error.message || 'Failed to fix grammar',
        userMessage: 'Failed to fix grammar. Please try again.',
        retryable: true,
        context: { originalError: error },
      },
    };
  }
}
