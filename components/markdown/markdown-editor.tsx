import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform, Share } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MarkdownRenderer } from './markdown-renderer';
import { MarkdownToolbarDropdown } from './markdown-toolbar-dropdown';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { markdownService } from '@/services/markdown-service';
import { extractTitle } from '@/utils/note-parser';
import { toast } from 'sonner-native';

interface MarkdownEditorProps {
  value: string;
  onChange: (text: string) => void;
  onSelectionChange?: (selection: { start: number; end: number }) => void;
  autoFocus?: boolean;
  placeholder?: string;
  showToolbarDropdown?: boolean;
  onCloseToolbarDropdown?: () => void;
}

/**
 * Main markdown editor component with edit/preview toggle
 * - Edit mode: Plain TextInput for markdown syntax
 * - Preview mode: Rendered markdown display
 */
export function MarkdownEditor({
  value,
  onChange,
  onSelectionChange,
  autoFocus = true,
  placeholder = 'Start typing...',
  showToolbarDropdown = false,
  onCloseToolbarDropdown,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const { colors } = useThemeColors();
  const selectionRef = useRef({ start: 0, end: 0 });

  /**
   * Handle markdown syntax insertion from toolbar
   * - If text selected: wrap selection with before/after
   * - If no selection: insert before+after at cursor position
   */
  const handleInsert = (before: string, after: string) => {
    const { start, end } = selectionRef.current;
    const selectedText = value.substring(start, end);

    let newContent: string;
    let newCursorPos: number;

    if (start !== end) {
      // Text is selected - wrap it
      newContent = value.substring(0, start) + before + selectedText + after + value.substring(end);
      newCursorPos = start + before.length + selectedText.length + after.length;
    } else {
      // No selection - insert at cursor
      newContent = value.substring(0, start) + before + after + value.substring(start);
      newCursorPos = start + before.length;
    }

    onChange(newContent);

    // Update selection ref for next insertion
    selectionRef.current = { start: newCursorPos, end: newCursorPos };
  };

  const handleSelectionChange = (selection: { start: number; end: number }) => {
    selectionRef.current = selection;
    onSelectionChange?.(selection);
  };

  /**
   * Handle text insertion (for link, table, etc)
   * Inserts text at cursor position
   */
  const handleInsertText = (text: string) => {
    const { start } = selectionRef.current;
    const newContent = value.substring(0, start) + text + value.substring(start);
    onChange(newContent);

    // Update selection ref for next insertion
    const newCursorPos = start + text.length;
    selectionRef.current = { start: newCursorPos, end: newCursorPos };
  };

  // Get selected text for link modal
  const getSelectedText = () => {
    const { start, end } = selectionRef.current;
    return value.substring(start, end);
  };

  /**
   * Export markdown as HTML document
   */
  const handleExport = async () => {
    try {
      const title = extractTitle(value) || 'Note';
      const htmlContent = markdownService.renderToDocument(title, value);

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
    <View style={styles.container}>
      {/* Toggle Button & Export */}
      <View style={[styles.toggleContainer, { borderBottomColor: colors.border }]}>
        {mode === 'preview' && (
          <TouchableOpacity
            onPress={handleExport}
            style={[styles.exportButton, { backgroundColor: colors.surface }]}
            activeOpacity={0.7}
          >
            <MaterialIcons name="file-download" size={20} color={colors.tint} />
            <Text style={[styles.exportText, { color: colors.tint }]}>Export HTML</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
          style={[styles.toggleButton, { backgroundColor: colors.surface }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, { color: colors.tint }]}>
            {mode === 'edit' ? 'Preview' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Edit Mode */}
      {mode === 'edit' && (
        <TextInput
          value={value}
          onChangeText={onChange}
          onSelectionChange={(e) => handleSelectionChange(e.nativeEvent.selection)}
          multiline
          autoFocus={autoFocus}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.textInput,
            {
              color: colors.text,
              backgroundColor: colors.background,
            },
          ]}
        />
      )}

      {/* Preview Mode */}
      {mode === 'preview' && (
        <MarkdownRenderer markdown={value} scrollable={true} />
      )}

      {/* Toolbar Dropdown (only in edit mode) */}
      {mode === 'edit' && (
        <MarkdownToolbarDropdown
          visible={showToolbarDropdown}
          onClose={onCloseToolbarDropdown || (() => {})}
          onInsert={handleInsert}
          onInsertText={handleInsertText}
          selectedText={getSelectedText()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportText: {
    fontSize: 14,
    fontWeight: '600',
  },
  textInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
});
