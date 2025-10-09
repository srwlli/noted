/**
 * AI Edits - TypeScript Type Definitions
 *
 * Comprehensive type definitions for the AI Edits feature,
 * including edit options, results, progress callbacks, and error handling.
 */

/**
 * All possible edit types that can be applied to note content
 */
export type EditType =
  | 'formatMarkdown'
  | 'fixGrammar'
  | 'addHeadings'
  | 'improveStructure'
  | 'makeConcise'
  | 'expandContent'
  | 'changeTone';

/**
 * Standard error codes for AI edit operations
 */
export type ErrorCode =
  | 'API_FAILURE'
  | 'NETWORK_ERROR'
  | 'CONTENT_TOO_SHORT'
  | 'CONTENT_TOO_LONG'
  | 'NO_OPTIONS_SELECTED'
  | 'NO_CHANGES_MADE'
  | 'USER_CANCELLED'
  | 'MARKDOWN_VALIDATION_FAILED';

/**
 * User's selected edit options
 *
 * Represents the configuration for which AI edits to apply.
 * Phase 1 includes formatting and structural edits.
 * Phase 2 adds tone transformation options.
 */
export interface EditOptions {
  /** Format markdown with proper headings, lists, and spacing */
  formatMarkdown?: boolean;

  /** Fix grammar, spelling, and punctuation errors */
  fixGrammar?: boolean;

  /** Add section headings to organize content hierarchically */
  addHeadings?: boolean;

  /** Reorganize content for better logical flow */
  improveStructure?: boolean;

  /** Adjust content length (mutually exclusive options) */
  lengthAdjustment?: 'keep' | 'concise' | 'expand';

  /** Change tone/style (Phase 2, mutually exclusive options) */
  tone?: 'professional' | 'technical' | 'clear' | null;
}

/**
 * Metadata about a successfully applied edit
 */
export interface AppliedEdit {
  /** Type of edit that was applied */
  type: EditType;

  /** Status indicator (always 'success' for AppliedEdit) */
  status: 'success';

  /** Time taken to complete this edit in milliseconds */
  durationMs: number;

  /** Whether this edit actually modified the content */
  changesMade: boolean;

  /** Change in character count (positive = added, negative = removed) */
  characterDelta: number;
}

/**
 * Metadata about a failed edit (for partial failure handling)
 */
export interface FailedEdit {
  /** Type of edit that failed */
  type: EditType;

  /** Status indicator (always 'failed' for FailedEdit) */
  status: 'failed';

  /** Error message describing what went wrong */
  error: string;

  /** Whether the user can retry this edit */
  recoverable: boolean;
}

/**
 * Structured error information
 */
export interface EditError {
  /** Standard error code for programmatic handling */
  code: ErrorCode;

  /** Technical error message for logging */
  message: string;

  /** User-friendly error message for display */
  userMessage: string;

  /** Whether the operation can be retried */
  retryable: boolean;

  /** Additional context about the error */
  context?: Record<string, any>;
}

/**
 * Comprehensive result from applyAIEdits orchestrator
 */
export interface EditResult {
  /** Whether the overall edit operation succeeded */
  success: boolean;

  /** Final edited content (or original if all edits failed) */
  content: string;

  /** List of edits that were successfully applied */
  appliedEdits: AppliedEdit[];

  /** List of edits that failed (if any) */
  failedEdits?: FailedEdit[];

  /** Original content before any edits */
  originalContent: string;

  /** Percentage of content that changed (0-100) */
  changePercentage: number;

  /** Total time taken for all edits in milliseconds */
  processingTimeMs: number;

  /** Error information if the operation failed */
  error?: EditError;
}

/**
 * Callback for realtime progress updates to UI
 *
 * Called by the orchestrator for each edit state change.
 * UI components can use this to show step-by-step progress.
 *
 * @param edit - The edit type being updated
 * @param status - Current status of the edit
 * @param durationMs - Time taken (only provided when status is 'completed' or 'failed')
 */
export type ProgressCallback = (
  edit: EditType,
  status: 'pending' | 'in_progress' | 'completed' | 'failed',
  durationMs?: number
) => void;
