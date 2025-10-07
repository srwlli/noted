import React, { useRef, useCallback, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { MarkdownRenderer } from './markdown-renderer';
import { MarkdownToolbarDropdown } from './markdown-toolbar-dropdown';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface MarkdownEditorProps {
  value: string;
  onChange: (text: string) => void;
  onSelectionChange?: (selection: { start: number; end: number }) => void;
  onUndoRedoChange?: (canUndo: boolean, canRedo: boolean) => void;
  autoFocus?: boolean;
  placeholder?: string;
  showToolbarDropdown?: boolean;
  onCloseToolbarDropdown?: () => void;
  mode?: 'edit' | 'preview';
  onExport?: () => void;
  onGenerateTitle?: () => void;
}

export interface MarkdownEditorRef {
  undo: () => void;
  redo: () => void;
}

/**
 * Main markdown editor component with edit/preview toggle
 * - Edit mode: Plain TextInput for markdown syntax
 * - Preview mode: Rendered markdown display
 */
export const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(function MarkdownEditor({
  value,
  onChange,
  onSelectionChange,
  onUndoRedoChange,
  autoFocus = true,
  placeholder = 'Start typing...',
  showToolbarDropdown = false,
  onCloseToolbarDropdown,
  mode = 'edit',
  onExport,
  onGenerateTitle,
}, ref) {
  const { colors } = useThemeColors();
  const selectionRef = useRef({ start: 0, end: 0 });
  const inputRef = useRef<TextInput>(null);

  // History state for undo/redo
  const [history, setHistory] = useState<Array<{content: string, selection: {start: number, end: number}}>>(() => [
    {content: value || '', selection: {start: 0, end: 0}}
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Computed values for undo/redo availability
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  /**
   * Restore focus and cursor position to the editor
   * - Uses InteractionManager to wait for animations to complete
   * - Restores both focus and cursor position
   */
  const restoreFocus = useCallback(() => {
    // Wait for all interactions/animations to complete
    const handle = setTimeout(() => {
      inputRef.current?.focus();
      // Use setSelection if available, fallback to setNativeProps
      if (inputRef.current?.setSelection) {
        inputRef.current.setSelection(
          selectionRef.current.start,
          selectionRef.current.end
        );
      } else {
        inputRef.current?.setNativeProps({
          selection: selectionRef.current
        });
      }
    }, 200); // Increased delay for iOS

    return () => clearTimeout(handle);
  }, []);

  /**
   * Add content to history for undo/redo
   * - skipDebounce: true for toolbar actions, false for typing
   */
  const addToHistory = useCallback((newContent: string, newSelection: {start: number, end: number}, skipDebounce = false) => {
    if (isUndoRedoAction) return;

    const doAddHistory = () => {
      setHistory(prev => {
        // Remove any future states if we're not at the end
        const newHistory = prev.slice(0, historyIndex + 1);
        // Add new state
        newHistory.push({content: newContent, selection: newSelection});
        // Limit history to 50 entries
        if (newHistory.length > 50) {
          newHistory.shift();
          return newHistory;
        }
        return newHistory;
      });
      setHistoryIndex(prev => Math.min(prev + 1, 49));
    };

    if (skipDebounce) {
      // Immediate for toolbar actions
      doAddHistory();
    } else {
      // Debounced for typing
      if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = setTimeout(doAddHistory, 500);
    }
  }, [historyIndex, isUndoRedoAction]);

  /**
   * Undo to previous state
   */
  const handleUndo = useCallback(() => {
    if (historyIndex === 0 || isUndoRedoAction) return;

    setIsUndoRedoAction(true);
    const prevState = history[historyIndex - 1];
    onChange(prevState.content);
    selectionRef.current = prevState.selection;
    restoreFocus();
    setHistoryIndex(prev => prev - 1);

    // Reset flag after React finishes rendering
    queueMicrotask(() => setIsUndoRedoAction(false));
  }, [history, historyIndex, onChange, restoreFocus, isUndoRedoAction]);

  /**
   * Redo to next state
   */
  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1 || isUndoRedoAction) return;

    setIsUndoRedoAction(true);
    const nextState = history[historyIndex + 1];
    onChange(nextState.content);
    selectionRef.current = nextState.selection;
    restoreFocus();
    setHistoryIndex(prev => prev + 1);

    // Reset flag after React finishes rendering
    queueMicrotask(() => setIsUndoRedoAction(false));
  }, [history, historyIndex, onChange, restoreFocus, isUndoRedoAction]);

  // Track value changes and add to history with debounce
  useEffect(() => {
    // Don't add to history during undo/redo actions
    if (isUndoRedoAction) return;

    // Don't add empty initial state
    if (value === '' && history.length === 1) return;

    // Add to history with debounce (500ms)
    addToHistory(value, selectionRef.current);

    // Cleanup timeout on unmount
    return () => {
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
    };
  }, [value, isUndoRedoAction, addToHistory]);

  // Notify parent of undo/redo availability changes
  useEffect(() => {
    onUndoRedoChange?.(canUndo, canRedo);
  }, [canUndo, canRedo, onUndoRedoChange]);

  // Expose undo/redo methods to parent via ref
  useImperativeHandle(ref, () => ({
    undo: handleUndo,
    redo: handleRedo,
  }), [handleUndo, handleRedo]);

  // Keyboard shortcuts (web only)
  useEffect(() => {
    // Only add keyboard listeners on web platform
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== 'undefined' && navigator.platform?.toUpperCase().includes('MAC');
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((ctrlKey && e.key === 'y') || (ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        handleRedo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

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

    // Immediate history entry for toolbar actions (skipDebounce = true)
    addToHistory(newContent, selectionRef.current, true);

    // Restore focus and cursor position
    restoreFocus();
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

    // Immediate history entry for toolbar actions (skipDebounce = true)
    addToHistory(newContent, selectionRef.current, true);

    // Restore focus and cursor position
    restoreFocus();
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
          ref={inputRef}
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
          onGenerateTitle={onGenerateTitle}
        />
      )}
    </View>
  );
});

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
