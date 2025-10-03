import React, { useState, useEffect, useRef } from 'react';
import { View, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { MarkdownEditor } from '@/components/markdown/markdown-editor';
import { MarkdownErrorBoundary } from '@/components/markdown/markdown-error-boundary';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { notesService } from '@/services/notes';
import { extractTitle } from '@/utils/note-parser';
import { toast } from 'sonner-native';

/**
 * Route for editing existing notes with markdown editor
 * Wrapped with error boundary for graceful error handling
 */
function EditNoteScreenContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [content, setContent] = useState('');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useThemeColors();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialContentRef = useRef<string>('');

  // Load note content
  useEffect(() => {
    async function loadNote() {
      if (!id) {
        setError('No note ID provided');
        setLoading(false);
        return;
      }

      try {
        const note = await notesService.getNote(id);
        const noteContent = note.content || '';
        setContent(noteContent);
        initialContentRef.current = noteContent;
        setError(null);
      } catch (err) {
        console.error('Failed to load note:', err);
        setError('Failed to load note');
      } finally {
        setLoading(false);
      }
    }

    loadNote();
  }, [id]);

  // Auto-save with debounce (1000ms)
  useEffect(() => {
    // Don't save while loading or if there's an error
    if (loading || error || !id) return;

    // Don't save if content hasn't changed from initial load
    if (content === initialContentRef.current) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Don't save if content is empty
    if (!content.trim()) return;

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const title = extractTitle(content);
        await notesService.updateNote(id, title, content);
        initialContentRef.current = content;
      } catch (err) {
        console.error('Auto-save failed:', err);
        toast.error('Failed to save note');
      }
    }, 1000);

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, id, loading, error]);

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Loading...',
            headerStyle: {
              backgroundColor: colors.surface,
            },
            headerTintColor: colors.text,
          }}
        />
        <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Error',
            headerStyle: {
              backgroundColor: colors.surface,
            },
            headerTintColor: colors.text,
          }}
        />
        <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Note',
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
          onSelectionChange={setSelection}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
});

export default function EditNoteScreen() {
  return (
    <MarkdownErrorBoundary>
      <EditNoteScreenContent />
    </MarkdownErrorBoundary>
  );
}
