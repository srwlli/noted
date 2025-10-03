import { marked } from 'marked';

/**
 * Markdown service for converting markdown to HTML
 * Component rendering is handled by components/markdown/markdown-renderer.tsx
 */
export const markdownService = {
  /**
   * Convert markdown to HTML string
   * @param markdown - Raw markdown text
   * @returns HTML string
   */
  renderToHtml(markdown: string): string {
    return marked(markdown) as string;
  },

  /**
   * Convert markdown to full HTML document with styling
   * @param title - Document title
   * @param markdown - Raw markdown text
   * @returns Complete HTML document
   */
  renderToDocument(title: string, markdown: string): string {
    const htmlContent = marked(markdown) as string;
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  line-height: 1.6;
  color: #333;
}
h1, h2, h3, h4, h5, h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
}
code {
  background-color: #f6f8fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Courier New', monospace;
}
pre {
  background-color: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
}
blockquote {
  border-left: 4px solid #dfe2e5;
  padding-left: 16px;
  color: #6a737d;
  margin-left: 0;
}
table {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}
th, td {
  border: 1px solid #dfe2e5;
  padding: 8px 12px;
  text-align: left;
}
th {
  background-color: #f6f8fa;
  font-weight: 600;
}
</style>
</head>
<body>
${htmlContent}
</body>
</html>`;
  }
};
