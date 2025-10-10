/**
 * AI Edits Orchestrator (Deno/Edge Function version)
 *
 * Coordinates the application of multiple AI edits with:
 * - Sequential execution for reliable results
 * - AbortController support for cancellation
 * - Partial failure handling (continue on error)
 */

import type { EditOptions, EditResult, AppliedEdit, FailedEdit } from './types.ts';
import { formatMarkdown } from './edits/formatMarkdown.ts';
import { fixGrammar } from './edits/fixGrammar.ts';
import { addHeadings } from './edits/addHeadings.ts';
import { improveStructure } from './edits/improveStructure.ts';
import { makeConcise, expandContent } from './edits/adjustLength.ts';

/**
 * Apply AI edits to note content
 *
 * @param content - The note content to edit
 * @param options - Selected edit options
 * @param anthropic - Anthropic client instance
 * @param signal - Optional abort signal for cancellation
 * @returns Comprehensive EditResult with all metadata
 */
export async function applyAIEdits(
  content: string,
  options: EditOptions,
  anthropic: any,
  signal?: AbortSignal
): Promise<EditResult> {
  console.log('[orchestrator] applyAIEdits called');
  console.log('[orchestrator] options:', JSON.stringify(options));
  console.log('[orchestrator] content length:', content.length);

  const startTime = Date.now();
  const originalContent = content;
  const appliedEdits: AppliedEdit[] = [];
  const failedEdits: FailedEdit[] = [];

  try {
    console.log('[orchestrator] Starting validation...');
    // Validate input
    if (!content || content.trim().length < 10) {
      return {
        success: false,
        content: originalContent,
        appliedEdits: [],
        failedEdits: [],
        originalContent,
        changePercentage: 0,
        processingTimeMs: Date.now() - startTime,
        error: {
          code: 'CONTENT_TOO_SHORT',
          message: 'Content must be at least 10 characters',
          userMessage: 'Note must have at least 10 characters to edit',
          retryable: false,
        },
      };
    }

    if (content.length > 50000) {
      return {
        success: false,
        content: originalContent,
        appliedEdits: [],
        failedEdits: [],
        originalContent,
        changePercentage: 0,
        processingTimeMs: Date.now() - startTime,
        error: {
          code: 'CONTENT_TOO_LONG',
          message: 'Content exceeds 50,000 character limit',
          userMessage: 'Note too long for AI editing (max 50,000 characters)',
          retryable: false,
        },
      };
    }

    // Check if any options are selected
    const hasOptions =
      options.formatMarkdown ||
      options.fixGrammar ||
      options.addHeadings ||
      options.improveStructure ||
      (options.lengthAdjustment && options.lengthAdjustment !== 'keep');

    if (!hasOptions) {
      return {
        success: false,
        content: originalContent,
        appliedEdits: [],
        failedEdits: [],
        originalContent,
        changePercentage: 0,
        processingTimeMs: Date.now() - startTime,
        error: {
          code: 'NO_OPTIONS_SELECTED',
          message: 'No edit options selected',
          userMessage: 'Please select at least one edit option',
          retryable: false,
        },
      };
    }

    let currentContent = content;

    // BATCH 1: Format Markdown (sequential for now)
    if (options.formatMarkdown) {
      console.log('[orchestrator] Starting formatMarkdown...');
      try {
        const result = await formatMarkdown(currentContent, anthropic, signal);
        console.log('[orchestrator] formatMarkdown result:', { success: result.success, editsCount: result.appliedEdits.length });
        if (result.success) {
          currentContent = result.content;
          appliedEdits.push(...result.appliedEdits);
        } else {
          if (result.failedEdits) {
            failedEdits.push(...result.failedEdits);
          }
        }
      } catch (error) {
        console.error('[orchestrator] formatMarkdown error:', error);
        throw error;
      }
    }

    // Fix Grammar (sequential)
    if (options.fixGrammar) {
      const result = await fixGrammar(currentContent, anthropic, signal);
      if (result.success) {
        currentContent = result.content;
        appliedEdits.push(...result.appliedEdits);
      } else {
        if (result.failedEdits) {
          failedEdits.push(...result.failedEdits);
        }
      }
    }

    // BATCH 2: Add Headings (sequential)
    if (options.addHeadings) {
      const result = await addHeadings(currentContent, anthropic, signal);
      if (result.success) {
        currentContent = result.content;
        appliedEdits.push(...result.appliedEdits);
      } else {
        if (result.failedEdits) {
          failedEdits.push(...result.failedEdits);
        }
      }
    }

    // Improve Structure (sequential)
    if (options.improveStructure) {
      const result = await improveStructure(currentContent, anthropic, signal);
      if (result.success) {
        currentContent = result.content;
        appliedEdits.push(...result.appliedEdits);
      } else {
        if (result.failedEdits) {
          failedEdits.push(...result.failedEdits);
        }
      }
    }

    // BATCH 3: Adjust Length (sequential)
    if (options.lengthAdjustment === 'concise') {
      const result = await makeConcise(currentContent, anthropic, signal);

      if (result.success) {
        currentContent = result.content;
        appliedEdits.push(...result.appliedEdits);
      } else {
        if (result.failedEdits) {
          failedEdits.push(...result.failedEdits);
        }
      }
    } else if (options.lengthAdjustment === 'expand') {
      const result = await expandContent(currentContent, anthropic, signal);

      if (result.success) {
        currentContent = result.content;
        appliedEdits.push(...result.appliedEdits);
      } else {
        if (result.failedEdits) {
          failedEdits.push(...result.failedEdits);
        }
      }
    }

    // Calculate final metrics
    const processingTimeMs = Date.now() - startTime;
    const characterDelta = currentContent.length - originalContent.length;
    const changePercentage = Math.abs(characterDelta / originalContent.length) * 100;

    const success = appliedEdits.length > 0;

    return {
      success,
      content: success ? currentContent : originalContent,
      appliedEdits,
      failedEdits: failedEdits.length > 0 ? failedEdits : undefined,
      originalContent,
      changePercentage,
      processingTimeMs,
    };
  } catch (error: any) {
    const processingTimeMs = Date.now() - startTime;

    if (signal?.aborted || error.message === 'Operation cancelled') {
      return {
        success: false,
        content: originalContent,
        appliedEdits,
        failedEdits,
        originalContent,
        changePercentage: 0,
        processingTimeMs,
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
      appliedEdits,
      failedEdits,
      originalContent,
      changePercentage: 0,
      processingTimeMs,
      error: {
        code: 'API_FAILURE',
        message: error.message || 'Unknown error occurred',
        userMessage: 'AI service unavailable. Please try again.',
        retryable: true,
        context: { originalError: error },
      },
    };
  }
}
