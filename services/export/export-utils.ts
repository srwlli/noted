import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Download file on web or share on mobile
 */
export async function saveOrShareFile(
  content: string,
  filename: string,
  mimeType: string
): Promise<void> {
  if (Platform.OS === 'web') {
    // Web: Download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  } else {
    // Mobile: Share
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, content);
    await Sharing.shareAsync(fileUri, {
      mimeType,
      dialogTitle: `Export ${filename}`,
    });
  }
}

/**
 * Sanitize filename for filesystem
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || filename.trim().length === 0) {
    return 'untitled';
  }

  return filename
    // Remove OS-illegal chars: < > : " / \ | ? *
    .replace(/[<>:"/\\|?*]/g, '-')
    // Replace whitespace with hyphens
    .replace(/\s+/g, '-')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Trim hyphens from ends
    .replace(/^-+|-+$/g, '')
    // Lowercase for consistency
    .toLowerCase()
    // Limit length (filesystem limits ~255, use 60 for safety)
    .substring(0, 60)
    // Final fallback
    || 'untitled';
}
