/**
 * Improve Structure/Flow
 *
 * Reorganizes content for better logical flow,
 * groups related ideas, and improves transitions between sections.
 *
 * Temperature: 0.4 (moderate creativity for reorganization)
 */

import type { EditResult } from './types';

/**
 * Enhanced prompt with context preservation rules
 */
function buildPrompt(content: string): string {
  return `You are a content structure expert who reorganizes text for better logical flow.

Your task is to improve the structure and flow of the content while preserving ALL information.

RULES:
- Preserve ALL original content - NEVER remove or omit any information
- Reorganize paragraphs and sections for better logical progression
- Group related ideas together
- Improve transitions between sections for smooth reading
- Reorder bullet points or list items when it improves flow
- Preserve technical terms, names, dates, numbers exactly
- Keep code blocks, links, and special formatting intact
- Maintain the original tone and style
- If the structure is already good, make minimal changes

Now improve the structure and flow of this content:

${content}`;
}

/**
 * Improve content structure and flow
 *
 * @param content - The note content to restructure
 * @param anthropic - Anthropic client instance (passed from edge function)
 * @param signal - Optional abort signal for cancellation
 * @returns EditResult with restructured content and metadata
 */
export async function improveStructure(
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
      temperature: 0.4, // Moderate creativity for reorganization
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const restructuredContent =
      response.content[0].type === 'text' ? response.content[0].text.trim() : content;

    const durationMs = Date.now() - startTime;
    const changesMade = restructuredContent !== originalContent;
    const characterDelta = restructuredContent.length - originalContent.length;

    return {
      success: true,
      content: restructuredContent,
      appliedEdits: [
        {
          type: 'improveStructure',
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
            type: 'improveStructure',
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
          type: 'improveStructure',
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
        message: error.message || 'Failed to improve structure',
        userMessage: 'Failed to improve structure. Please try again.',
        retryable: true,
        context: { originalError: error },
      },
    };
  }
}
