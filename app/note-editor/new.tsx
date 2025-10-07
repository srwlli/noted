import React, { useState, useEffect, useRef } from 'react';
import { View, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, Share, Text, ActivityIndicator } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { MarkdownEditor, MarkdownEditorRef } from '@/components/markdown/markdown-editor';
import { MarkdownErrorBoundary } from '@/components/markdown/markdown-error-boundary';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { notesService } from '@/services/notes';
import { extractTitle } from '@/utils/note-parser';
import { markdownService } from '@/services/markdown-service';
import { generateTitle } from '@/services/ai/generate-title';
import { toast } from 'sonner-native';

/**
 * Route for creating new notes with markdown editor
 * Wrapped with error boundary for graceful error handling
 */
function NewNoteScreenContent() {
  const params = useLocalSearchParams();
  const folderId = typeof params.folderId === 'string' ? params.folderId : null;
  const [content, setContent] = useState('');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [noteId, setNoteId] = useState<string | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const { colors } = useThemeColors();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<MarkdownEditorRef>(null);

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
          // Create new note (with folder if specified)
          const newNote = await notesService.createNote(title, content, folderId);
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
  }, [content, noteId, folderId]);

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

  const handleGenerateTitle = async () => {
    if (!content || content.trim().length === 0) {
      toast.error('Please add some content to your note first');
      return;
    }

    setGeneratingTitle(true);

    try {
      const result = await generateTitle(content);

      if (result.success) {
        // Prepend title to content (if it doesn't start with a heading)
        const hasHeading = content.trim().startsWith('#');
        let newContent: string;

        if (hasHeading) {
          // Replace first line with new title
          const lines = content.split('\n');
          lines[0] = `# ${result.title}`;
          newContent = lines.join('\n');
        } else {
          // Add title at the beginning
          newContent = `# ${result.title}\n\n${content}`;
        }

        setContent(newContent);
        toast.success('Title generated successfully');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Generate title error:', error);
      toast.error('Failed to generate title');
    } finally {
      setGeneratingTitle(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New Note',
          headerStyle: {
            backgroundColor: colors.surface,
            height: 52,
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
              {mode === 'edit' && (
                <TouchableOpacity
                  onPress={handleGenerateTitle}
                  disabled={generatingTitle}
                  activeOpacity={0.7}
                >
                  {generatingTitle ? (
                    <ActivityIndicator size="small" color={colors.tint} />
                  ) : (
                    <MaterialIcons name="auto-awesome" size={24} color={colors.tint} />
                  )}
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
          ref={editorRef}
          value={content}
          onChange={setContent}
          onSelectionChange={setSelection}
          onUndoRedoChange={(canUndo, canRedo) => {
            setCanUndo(canUndo);
            setCanRedo(canRedo);
          }}
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
