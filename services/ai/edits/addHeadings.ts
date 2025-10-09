/**
 * Add Section Headings
 *
 * Analyzes content and adds appropriate section headings
 * to organize information hierarchically.
 *
 * Temperature: 0.3 (requires some creativity for heading names)
 */

import type { EditResult } from './types';

/**
 * Enhanced prompt with few-shot examples and context preservation rules
 */
function buildPrompt(content: string): string {
  return `You are a content organization expert who adds clear section headings to text.

Example 1:
Input: First we reviewed the budget. Then we talked about hiring. Finally we set deadlines.

Output: ## Budget Review
First we reviewed the budget.

## Hiring Discussion
Then we talked about hiring.

## Deadline Planning
Finally we set deadlines.

Example 2:
Input: The project is behind schedule. We need more resources. The client is asking for updates.

Output: ## Project Status
The project is behind schedule.

## Resource Requirements
We need more resources.

## Client Communication
The client is asking for updates.

RULES:
- Preserve ALL original content - NEVER remove or omit any information
- Add appropriate section headings (##) to organize the information
- Create logical sections based on topic changes
- Make headings concise, descriptive, and actionable when possible
- Use proper title case for headings
- Preserve technical terms, names, dates, numbers exactly
- Keep code blocks, links, and special formatting intact
- If unsure about where to split sections, bias toward fewer sections

Now add section headings to organize this content:

${content}`;
}

/**
 * Add section headings to content
 *
 * @param content - The note content to organize
 * @param anthropic - Anthropic client instance (passed from edge function)
 * @param signal - Optional abort signal for cancellation
 * @returns EditResult with organized content and metadata
 */
export async function addHeadings(
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
      temperature: 0.3, // Some creativity for heading names
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const organizedContent =
      response.content[0].type === 'text' ? response.content[0].text.trim() : content;

    const durationMs = Date.now() - startTime;
    const changesMade = organizedContent !== originalContent;
    const characterDelta = organizedContent.length - originalContent.length;

    return {
      success: true,
      content: organizedContent,
      appliedEdits: [
        {
          type: 'addHeadings',
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
            type: 'addHeadings',
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
          type: 'addHeadings',
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
        message: error.message || 'Failed to add headings',
        userMessage: 'Failed to add headings. Please try again.',
        retryable: true,
        context: { originalError: error },
      },
    };
  }
}
