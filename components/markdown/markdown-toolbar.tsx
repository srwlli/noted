import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface MarkdownToolbarProps {
  onInsert: (before: string, after: string) => void;
}

/**
 * Formatting toolbar for markdown editor
 * Provides quick access to common markdown formatting
 */
export function MarkdownToolbar({ onInsert }: MarkdownToolbarProps) {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.toolbar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {/* Bold */}
      <ToolbarButton
        text="B"
        bold
        onPress={() => onInsert('**', '**')}
        colors={colors}
      />

      {/* Italic */}
      <ToolbarButton
        text="I"
        italic
        onPress={() => onInsert('*', '*')}
        colors={colors}
      />

      {/* Heading 1 */}
      <ToolbarButton
        text="H1"
        onPress={() => onInsert('# ', '')}
        colors={colors}
      />

      {/* Heading 2 */}
      <ToolbarButton
        text="H2"
        onPress={() => onInsert('## ', '')}
        colors={colors}
      />

      {/* List */}
      <ToolbarButton
        icon="format-list-bulleted"
        onPress={() => onInsert('- ', '')}
        colors={colors}
      />

      {/* Code */}
      <ToolbarButton
        text="`"
        monospace
        onPress={() => onInsert('`', '`')}
        colors={colors}
      />
    </View>
  );
}

interface ToolbarButtonProps {
  text?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  bold?: boolean;
  italic?: boolean;
  monospace?: boolean;
  onPress: () => void;
  colors: any;
}

function ToolbarButton({ text, icon, bold, italic, monospace, onPress, colors }: ToolbarButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.background }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon ? (
        <MaterialIcons name={icon} size={20} color={colors.text} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            { color: colors.text },
            bold && styles.boldText,
            italic && styles.italicText,
            monospace && styles.monospaceText,
          ]}
        >
          {text}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
    justifyContent: 'space-around',
  },
  button: {
    width: 44,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
  boldText: {
    fontWeight: '700',
  },
  italicText: {
    fontStyle: 'italic',
  },
  monospaceText: {
    fontFamily: 'monospace',
  },
});
