import React, { useState, useEffect, useRef } from 'react';
import { View, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, Share, Text } from 'react-native';
import { Stack, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { MarkdownEditor } from '@/components/markdown/markdown-editor';
import { MarkdownErrorBoundary } from '@/components/markdown/markdown-error-boundary';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { notesService } from '@/services/notes';
import { extractTitle } from '@/utils/note-parser';
import { markdownService } from '@/services/markdown-service';
import { toast } from 'sonner-native';

/**
 * Route for creating new notes with markdown editor
 * Wrapped with error boundary for graceful error handling
 */
function NewNoteScreenContent() {
  const [content, setContent] = useState('');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [noteId, setNoteId] = useState<string | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
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

  const handleExport = async () => {
    try {
      const title = extractTitle(content) || 'Note';
      const htmlContent = markdownService.renderToDocument(title, content);

      if (Platform.OS === 'web') {
        // Web: Download as file
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title}.html`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('HTML exported successfully');
      } else {
        // Mobile: Share sheet
        await Share.share({
          message: htmlContent,
          title: `${title}.html`,
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export HTML');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New Note',
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginRight: 16 }}>
              {mode === 'edit' && (
                <TouchableOpacity
                  onPress={() => setShowToolbar(!showToolbar)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="text-format" size={24} color={colors.text} />
                </TouchableOpacity>
              )}
              {mode === 'preview' && (
                <TouchableOpacity
                  onPress={handleExport}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="file-download" size={24} color={colors.tint} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
                style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.surface, borderRadius: 6 }}
                activeOpacity={0.7}
              >
                <Text style={{ color: colors.tint, fontSize: 14, fontWeight: '600' }}>
                  {mode === 'edit' ? 'Preview' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>
          ),
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
          showToolbarDropdown={showToolbar}
          onCloseToolbarDropdown={() => setShowToolbar(false)}
          mode={mode}
          onExport={handleExport}
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

export default function NewNoteScreen() {
  return (
    <MarkdownErrorBoundary>
      <NewNoteScreenContent />
    </MarkdownErrorBoundary>
  );
}
