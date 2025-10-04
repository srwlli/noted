import React, { useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { MarkdownRenderer } from './markdown-renderer';
import { MarkdownToolbarDropdown } from './markdown-toolbar-dropdown';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface MarkdownEditorProps {
  value: string;
  onChange: (text: string) => void;
  onSelectionChange?: (selection: { start: number; end: number }) => void;
  autoFocus?: boolean;
  placeholder?: string;
  showToolbarDropdown?: boolean;
  onCloseToolbarDropdown?: () => void;
  mode?: 'edit' | 'preview';
  onExport?: () => void;
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
  mode = 'edit',
  onExport,
}: MarkdownEditorProps) {
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

  return (
    <View style={styles.container}>
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
  textInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
});
