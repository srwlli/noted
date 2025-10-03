import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MarkdownRenderer } from './markdown-renderer';
import { MarkdownToolbar } from './markdown-toolbar';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface MarkdownEditorProps {
  value: string;
  onChange: (text: string) => void;
  onSelectionChange?: (selection: { start: number; end: number }) => void;
  autoFocus?: boolean;
  placeholder?: string;
  showToolbar?: boolean;
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
  showToolbar = false,
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

  return (
    <View style={styles.container}>
      {/* Toggle Button */}
      <View style={[styles.toggleContainer, { borderBottomColor: colors.border }]}>
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

      {/* Toolbar (only in edit mode) */}
      {showToolbar && mode === 'edit' && (
        <MarkdownToolbar onInsert={handleInsert} />
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
    justifyContent: 'flex-end',
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
  textInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
});
