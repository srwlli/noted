import React, { useState, useEffect, useRef } from 'react';
import { View, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { MarkdownEditor } from '@/components/markdown/markdown-editor';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { notesService } from '@/services/notes';
import { extractTitle } from '@/utils/note-parser';
import { toast } from 'sonner-native';

/**
 * Test route for creating new notes with markdown editor
 * Phase 1: Editor with edit/preview toggle and auto-save
 */
export default function NewNoteScreen() {
  const [content, setContent] = useState('');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [noteId, setNoteId] = useState<string | null>(null);
  const { colors } = useThemeColors();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save with debounce (1000ms)
  useEffect(() => {
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

        if (noteId) {
          // Update existing note
          await notesService.updateNote(noteId, title, content);
        } else {
          // Create new note
          const newNote = await notesService.createNote(title, content);
          setNoteId(newNote.id);
          toast.success('Note created');
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        toast.error('Failed to save note');
      }
    }, 1000);

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, noteId]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New Note',
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
          autoFocus={true}
          placeholder="# New Note\n\nStart typing..."
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
