/**
 * Format Markdown Properly
 *
 * Scans existing markdown and adds proper structure:
 * - Headings (#, ##, ###)
 * - Bullet lists (-)
 * - Numbered lists (1.)
 * - Code blocks
 * - Proper spacing
 *
 * Temperature: 0.1 (highly deterministic formatting rules)
 */

import type { EditResult } from './types';

/**
 * Enhanced prompt with few-shot examples and context preservation rules
 */
function buildPrompt(content: string): string {
  return `You are a markdown formatting expert.

Example 1:
Input: meeting notes

topics:
budget
timeline

action items
- send report
schedule followup

Output: # Meeting Notes

## Topics
- Budget
- Timeline

## Action Items
- Send report
- Schedule followup call

Example 2:
Input: project planning

goals
increase revenue
improve ux

timeline
q1 research
q2 design

Output: # Project Planning

## Goals
- Increase revenue
- Improve UX

## Timeline
- Q1: Research
- Q2: Design

RULES:
- Preserve ALL original content - NEVER remove or omit any information
- Only fix formatting, never rewrite content
- Use ## for main sections, ### for subsections
- Ensure proper list syntax (- for bullets, 1. for numbered)
- Add blank lines between sections for readability
- Preserve technical terms, names, dates, numbers exactly
- Keep code blocks, links, and special formatting intact
- If unsure, bias toward preserving original

Now format this content following the same pattern:

${content}`;
}

/**
 * Format markdown content properly
 *
 * @param content - The note content to format
 * @param anthropic - Anthropic client instance (passed from edge function)
 * @param signal - Optional abort signal for cancellation
 * @returns EditResult with formatted content and metadata
 */
export async function formatMarkdown(
  content: string,
  anthropic: any,
  signal?: AbortSignal
): Promise<EditResult> {
  const startTime = Date.now();
  const originalContent = content;

  try {
    // Check if aborted before starting
    if (signal?.aborted) {
      throw new Error('Operation cancelled');
    }

    const prompt = buildPrompt(content);

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4096,
      temperature: 0.1, // Highly deterministic for formatting
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const formattedContent =
      response.content[0].type === 'text' ? response.content[0].text.trim() : content;

    const durationMs = Date.now() - startTime;
    const changesMade = formattedContent !== originalContent;
    const characterDelta = formattedContent.length - originalContent.length;

    return {
      success: true,
      content: formattedContent,
      appliedEdits: [
        {
          type: 'formatMarkdown',
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

    // Handle user cancellation
    if (signal?.aborted || error.message === 'Operation cancelled') {
      return {
        success: false,
        content: originalContent,
        appliedEdits: [],
        failedEdits: [
          {
            type: 'formatMarkdown',
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

    // Handle API failures
    return {
      success: false,
      content: originalContent,
      appliedEdits: [],
      failedEdits: [
        {
          type: 'formatMarkdown',
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
        message: error.message || 'Failed to format markdown',
        userMessage: 'Failed to format markdown. Please try again.',
        retryable: true,
        context: { originalError: error },
      },
    };
  }
}
