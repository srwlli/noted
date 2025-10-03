/**
 * Utility functions for parsing markdown notes
 */

/**
 * Extract title from markdown content
 * - If first line is a heading (starts with #), use that
 * - Otherwise use first line
 * - Fallback to timestamp if empty
 * @param markdown - Raw markdown text
 * @returns Extracted title (max 500 chars)
 */
export function extractTitle(markdown: string): string {
  const lines = markdown.trim().split('\n');
  const firstLine = lines[0]?.trim() || '';

  // If first line is a heading, remove # symbols
  if (firstLine.startsWith('#')) {
    return firstLine.replace(/^#+\s*/, ''); // Remove # symbols
  }

  // Use first line if available
  if (firstLine) {
    return firstLine.substring(0, 500); // Limit to VARCHAR(500)
  }

  // Fallback to timestamp
  return `Note ${new Date().toLocaleString()}`;
}

/**
 * Parse markdown note into title and content
 * @param markdown - Raw markdown text
 * @returns Object with title and content
 */
export function parseNote(markdown: string) {
  return {
    title: extractTitle(markdown),
    content: markdown
  };
}

/**
 * Get preview text from markdown (excluding title line)
 * @param markdown - Raw markdown text
 * @param maxLength - Maximum length of preview text
 * @returns Preview excerpt
 */
export function getPreviewText(markdown: string, maxLength = 100): string {
  const lines = markdown.split('\n');
  const contentLines = lines.slice(1); // Skip title line
  return contentLines.join(' ').substring(0, maxLength);
}
