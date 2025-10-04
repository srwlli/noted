import React, { useState, useEffect, useRef } from 'react';
import { View, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Share } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { MarkdownEditor, MarkdownEditorRef } from '@/components/markdown/markdown-editor';
import { MarkdownErrorBoundary } from '@/components/markdown/markdown-error-boundary';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { notesService } from '@/services/notes';
import { extractTitle } from '@/utils/note-parser';
import { markdownService } from '@/services/markdown-service';
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
  const [showToolbar, setShowToolbar] = useState(false);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const { colors } = useThemeColors();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialContentRef = useRef<string>('');
  const editorRef = useRef<MarkdownEditorRef>(null);

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
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <MaterialIcons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            ),
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
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <MaterialIcons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            ),
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
                <>
                  <TouchableOpacity
                    onPress={() => editorRef.current?.undo()}
                    disabled={!canUndo}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="undo" size={24} color={canUndo ? colors.text : colors.disabled} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => editorRef.current?.redo()}
                    disabled={!canRedo}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="redo" size={24} color={canRedo ? colors.text : colors.disabled} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowToolbar(!showToolbar)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="text-format" size={24} color={colors.text} />
                  </TouchableOpacity>
                </>
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
          ref={editorRef}
          value={content}
          onChange={setContent}
          onSelectionChange={setSelection}
          onUndoRedoChange={(canUndo, canRedo) => {
            setCanUndo(canUndo);
            setCanRedo(canRedo);
          }}
          autoFocus={false}
          placeholder="Start typing..."
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
