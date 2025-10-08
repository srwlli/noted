import yaml from 'js-yaml';
import { saveOrShareFile, sanitizeFilename } from './export-utils';

interface NoteMetadata {
  created_at?: string;
  updated_at?: string;
  folder_name?: string;
  is_favorite?: boolean;
}

/**
 * Export note as Markdown with YAML frontmatter
 */
export async function exportAsMarkdown(
  noteTitle: string,
  noteContent: string,
  metadata?: NoteMetadata
): Promise<void> {
  // Check file size
  const sizeKB = new Blob([noteContent]).size / 1024;
  if (sizeKB > 51200) {
    // 50MB
    throw new Error('file_too_large');
  }

  // Generate YAML frontmatter using js-yaml for safe escaping
  let frontmatter = '';
  if (metadata) {
    const frontmatterData: Record<string, any> = {
      title: noteTitle,
    };

    // Add optional metadata fields
    if (metadata.created_at) {
      frontmatterData.created = metadata.created_at;
    }
    if (metadata.updated_at) {
      frontmatterData.updated = metadata.updated_at;
    }
    if (metadata.folder_name) {
      frontmatterData.folder = metadata.folder_name;
    }
    if (metadata.is_favorite) {
      frontmatterData.favorite = true;
    }

    // Use js-yaml to safely serialize (handles colons, quotes, etc.)
    frontmatter = '---\n' + yaml.dump(frontmatterData) + '---\n\n';
  }

  // Combine frontmatter and content
  const markdownContent = frontmatter + noteContent;
  const filename = sanitizeFilename(noteTitle) + '.md';

  // Save or share the file
  await saveOrShareFile(markdownContent, filename, 'text/markdown');
}
