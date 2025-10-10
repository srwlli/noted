/**
 * Adjust Content Length
 *
 * Provides two functions:
 * 1. makeConcise - Condenses content while preserving key information
 * 2. expandContent - Adds detail and context, elaborates on key points
 *
 * Temperature: 0.2 for concise (focused), 0.5 for expand (creative)
 */

import type { EditResult } from '../types.ts';

/**
 * Build prompt for making content more concise
 */
function buildConcisePrompt(content: string): string {
  return `You are an expert editor who makes content more concise while preserving ALL key information.

Example 1:
Input: During our meeting, we had a very lengthy discussion about the quarterly budget allocation and we ultimately came to the conclusion that we should increase our spending in the marketing department by approximately 10 percent.

Output: We decided to increase marketing spending by 10% this quarter.

Example 2:
Input: The team has been working really hard and putting in a lot of effort on this particular project, and I think they've done an absolutely excellent job overall, although there have been a few minor delays here and there along the way.

Output: The team has done excellent work on this project, despite some minor delays.

RULES:
- Preserve ALL key information and meaning
- Remove redundancy, tighten prose, eliminate unnecessary words
- Keep essential facts, numbers, names, dates
- Maintain the original tone and style
- Preserve technical terms exactly
- Keep code blocks, links, and special formatting intact
- Do NOT remove important context or details
- If unsure, bias toward preserving information

Now make this content more concise:

${content}`;
}

/**
 * Build prompt for expanding content
 */
function buildExpandPrompt(content: string): string {
  return `You are an expert writer who expands content with more detail and context.

Example 1:
Input: - Budget approved
- Timeline extended
- New hires needed

Output: ## Budget Approval
The quarterly budget was reviewed and approved by the team. We agreed to allocate additional resources to the marketing department to support our Q2 campaigns.

## Timeline Extension
Due to unforeseen challenges, we've extended the project timeline by two weeks to ensure quality deliverables.

## Staffing Needs
We've identified the need for two new hires: a senior developer and a product designer to join the team next month.

Example 2:
Input: Met with client. Discussed progress. Set new deadlines.

Output: ## Client Meeting Summary
We met with the client to discuss project progress and review our current status. The conversation was productive and helped align expectations.

## Progress Discussion
We walked through the completed milestones and demonstrated the key features that have been implemented so far.

## Deadline Planning
Based on the client's feedback, we collaboratively set new deadlines that account for the additional requirements and ensure we have sufficient time for quality assurance.

RULES:
- Expand bullet points into full paragraphs
- Elaborate on key points with additional explanation
- Add context and detail while staying on topic
- Preserve ALL original information
- Maintain the original tone and style
- Preserve technical terms, names, dates, numbers exactly
- Keep code blocks, links, and special formatting intact
- Do NOT invent facts or information not implied in the original
- If unsure, bias toward preserving the original meaning

Now expand this content with more detail:

${content}`;
}

/**
 * Make content more concise
 *
 * @param content - The note content to condense
 * @param anthropic - Anthropic client instance (passed from edge function)
 * @param signal - Optional abort signal for cancellation
 * @returns EditResult with condensed content and metadata
 */
export async function makeConcise(
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

    const prompt = buildConcisePrompt(content);

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4096,
      temperature: 0.2, // Focused condensation
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const conciseContent =
      response.content[0].type === 'text' ? response.content[0].text.trim() : content;

    const durationMs = Date.now() - startTime;
    const changesMade = conciseContent !== originalContent;
    const characterDelta = conciseContent.length - originalContent.length;

    return {
      success: true,
      content: conciseContent,
      appliedEdits: [
        {
          type: 'makeConcise',
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
            type: 'makeConcise',
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
          type: 'makeConcise',
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
        message: error.message || 'Failed to make content concise',
        userMessage: 'Failed to make content concise. Please try again.',
        retryable: true,
        context: { originalError: error },
      },
    };
  }
}

/**
 * Expand content with more detail
 *
 * @param content - The note content to expand
 * @param anthropic - Anthropic client instance (passed from edge function)
 * @param signal - Optional abort signal for cancellation
 * @returns EditResult with expanded content and metadata
 */
export async function expandContent(
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

    const prompt = buildExpandPrompt(content);

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4096,
      temperature: 0.5, // Higher creativity for elaboration
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const expandedContent =
      response.content[0].type === 'text' ? response.content[0].text.trim() : content;

    const durationMs = Date.now() - startTime;
    const changesMade = expandedContent !== originalContent;
    const characterDelta = expandedContent.length - originalContent.length;

    return {
      success: true,
      content: expandedContent,
      appliedEdits: [
        {
          type: 'expandContent',
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
            type: 'expandContent',
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
          type: 'expandContent',
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
        message: error.message || 'Failed to expand content',
        userMessage: 'Failed to expand content. Please try again.',
        retryable: true,
        context: { originalError: error },
      },
    };
  }
}
