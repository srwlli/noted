import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MarkdownRenderer } from './markdown-renderer';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface MarkdownEditorProps {
  value: string;
  onChange: (text: string) => void;
  onSelectionChange?: (selection: { start: number; end: number }) => void;
  autoFocus?: boolean;
  placeholder?: string;
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
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const { colors } = useThemeColors();

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
          onSelectionChange={(e) => onSelectionChange?.(e.nativeEvent.selection)}
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
