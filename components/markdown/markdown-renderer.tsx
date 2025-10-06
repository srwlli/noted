import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface MarkdownRendererProps {
  markdown: string;
  scrollable?: boolean;
}

/**
 * Renders markdown text as styled native components
 * Used in preview mode and note list previews
 */
export function MarkdownRenderer({ markdown, scrollable = true }: MarkdownRendererProps) {
  const { colors } = useThemeColors();

  const markdownStyles = StyleSheet.create({
    body: {
      color: colors.text,
      fontSize: 16,
      lineHeight: 24,
    },
    heading1: {
      color: colors.text,
      fontSize: 32,
      fontWeight: '700',
      marginTop: 24,
      marginBottom: 16,
    },
    heading2: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '600',
      marginTop: 20,
      marginBottom: 12,
    },
    heading3: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 8,
    },
    heading4: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
      marginTop: 12,
      marginBottom: 8,
    },
    heading5: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginTop: 12,
      marginBottom: 8,
    },
    heading6: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 12,
      marginBottom: 8,
    },
    paragraph: {
      color: colors.text,
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 12,
    },
    strong: {
      fontWeight: '700',
    },
    em: {
      fontStyle: 'italic',
    },
    code_inline: {
      backgroundColor: colors.surface,
      color: colors.tint,
      fontFamily: 'monospace',
      fontSize: 14,
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
    },
    code_block: {
      backgroundColor: colors.surface,
      color: colors.text,
      fontFamily: 'monospace',
      fontSize: 14,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    fence: {
      backgroundColor: colors.surface,
      color: colors.text,
      fontFamily: 'monospace',
      fontSize: 14,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    blockquote: {
      backgroundColor: colors.surface,
      borderLeftColor: colors.tint,
      borderLeftWidth: 4,
      paddingLeft: 12,
      paddingVertical: 8,
      marginBottom: 12,
    },
    bullet_list: {
      marginBottom: 12,
    },
    ordered_list: {
      marginBottom: 12,
    },
    list_item: {
      color: colors.text,
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 4,
    },
    table: {
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: 12,
    },
    th: {
      backgroundColor: colors.surface,
      color: colors.text,
      fontWeight: '600',
      padding: 8,
      borderColor: colors.border,
    },
    td: {
      color: colors.text,
      padding: 8,
      borderColor: colors.border,
    },
    hr: {
      backgroundColor: colors.border,
      height: 1,
      marginVertical: 16,
    },
    link: {
      color: colors.tint,
      textDecorationLine: 'underline',
    },
    image: {
      maxWidth: '100%',
      borderRadius: 8,
      marginBottom: 12,
    },
  });

  const content = (
    <Markdown
      style={markdownStyles}
      allowedImageHandlers={['data', 'http', 'https']}
    >
      {markdown || ''}
    </Markdown>
  );

  if (scrollable) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {content}
      </ScrollView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
});
