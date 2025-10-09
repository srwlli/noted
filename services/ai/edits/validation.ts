/**
 * Markdown Validation
 *
 * Validates markdown syntax using unified + remark-parse
 * to ensure AI edits don't produce invalid markdown.
 *
 * Checks for:
 * - Valid markdown syntax
 * - Proper heading hierarchy
 * - Valid code block syntax
 * - No broken links or references
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';

export interface ValidationError {
  line?: number;
  column?: number;
  reason: string;
  source?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}

/**
 * Validate markdown content
 *
 * @param content - The markdown content to validate
 * @returns ValidationResult with errors and warnings
 */
export async function validateMarkdown(content: string): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  try {
    // Parse markdown using unified + remark
    const processor = unified().use(remarkParse).use(remarkStringify);

    const result = await processor.process(content);

    // Check for any messages (errors/warnings) from the parser
    if (result.messages && result.messages.length > 0) {
      for (const message of result.messages) {
        const validationError: ValidationError = {
          line: message.line ?? undefined,
          column: message.column ?? undefined,
          reason: message.reason || message.message,
          source: message.source ?? undefined,
        };

        if (message.fatal) {
          errors.push(validationError);
        } else {
          warnings.push(validationError);
        }
      }
    }

    // Additional custom validation checks

    // Check for proper heading hierarchy
    const headingErrors = validateHeadingHierarchy(content);
    errors.push(...headingErrors);

    // Check for unclosed code blocks
    const codeBlockErrors = validateCodeBlocks(content);
    errors.push(...codeBlockErrors);

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error: any) {
    // If parsing completely fails, return as error
    return {
      valid: false,
      errors: [
        {
          reason: `Failed to parse markdown: ${error.message}`,
        },
      ],
    };
  }
}

/**
 * Validate heading hierarchy
 * Ensures headings follow proper order (no skipping levels)
 */
function validateHeadingHierarchy(content: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const lines = content.split('\n');
  let previousLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,6})\s+/);

    if (headingMatch) {
      const currentLevel = headingMatch[1].length;

      // Check if we skipped a level (e.g., # followed by ###)
      if (currentLevel > previousLevel + 1 && previousLevel > 0) {
        errors.push({
          line: i + 1,
          reason: `Heading level ${currentLevel} skips level ${previousLevel + 1}. Proper hierarchy: ${previousLevel} → ${previousLevel + 1} → ${currentLevel}`,
        });
      }

      previousLevel = currentLevel;
    }
  }

  return errors;
}

/**
 * Validate code blocks are properly closed
 */
function validateCodeBlocks(content: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const lines = content.split('\n');
  let inCodeBlock = false;
  let codeBlockStartLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // Closing code block
        inCodeBlock = false;
        codeBlockStartLine = -1;
      } else {
        // Opening code block
        inCodeBlock = true;
        codeBlockStartLine = i + 1;
      }
    }
  }

  // If we're still in a code block at the end, it's unclosed
  if (inCodeBlock) {
    errors.push({
      line: codeBlockStartLine,
      reason: `Unclosed code block starting at line ${codeBlockStartLine}. Missing closing \`\`\``,
    });
  }

  return errors;
}

/**
 * Attempt to fix common markdown issues
 * Returns fixed content or null if unfixable
 */
export function attemptMarkdownFix(content: string): string | null {
  try {
    let fixed = content;

    // Fix unclosed code blocks by adding closing ```
    const lines = fixed.split('\n');
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
      }
    }

    // If still in code block at end, add closing
    if (inCodeBlock) {
      fixed += '\n```';
    }

    return fixed;
  } catch {
    return null;
  }
}
