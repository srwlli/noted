import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { MarkdownEditor } from '@/components/markdown/markdown-editor';
import { useThemeColors } from '@/hooks/use-theme-colors';

/**
 * Test route for markdown editor
 * Isolated from main app - for testing only
 */
export default function MarkdownEditorTest() {
  const [content, setContent] = useState('# Markdown Editor Test\n\nTry editing this text and toggle to **Preview** mode!\n\n## Features\n- **Bold** and *italic* text\n- Lists and headings\n- `Code blocks`\n- And more!\n\n> This is a quote\n\n```\nCode block example\n```');
  const { colors } = useThemeColors();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Markdown Editor Test',
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
        }}
      />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <MarkdownEditor
          value={content}
          onChange={setContent}
          autoFocus={false}
          placeholder="Start typing..."
          showToolbar={true}
        />
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
