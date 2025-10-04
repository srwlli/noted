import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { LinkDialogModal } from './link-dialog-modal';
import { TableGeneratorModal } from './table-generator-modal';

interface MarkdownToolbarDropdownProps {
  visible: boolean;
  onClose: () => void;
  onInsert: (before: string, after: string) => void;
  onInsertText?: (text: string) => void;
  selectedText?: string;
  anchorPosition?: { x: number; y: number };
}

/**
 * Horizontal dropdown toolbar for markdown formatting
 * Triggered from header icon, displays tools in a horizontal layout
 */
export function MarkdownToolbarDropdown({
  visible,
  onClose,
  onInsert,
  onInsertText,
  selectedText = '',
}: MarkdownToolbarDropdownProps) {
  const { colors } = useThemeColors();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);

  const handleInsert = (before: string, after: string) => {
    onInsert(before, after);
    onClose();
  };

  const handleInsertLink = (text: string, url: string) => {
    const markdownLink = `[${text}](${url})`;
    onInsertText?.(markdownLink);
    setShowLinkModal(false);
    onClose();
  };

  const handleInsertTable = (table: string) => {
    onInsertText?.(table);
    setShowTableModal(false);
    onClose();
  };

  if (!visible) return null;

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Bold */}
              <ToolbarButton
                text="B"
                bold
                onPress={() => handleInsert('**', '**')}
                colors={colors}
              />

              {/* Italic */}
              <ToolbarButton
                text="I"
                italic
                onPress={() => handleInsert('*', '*')}
                colors={colors}
              />

              {/* Heading 1 */}
              <ToolbarButton
                text="H1"
                onPress={() => handleInsert('# ', '')}
                colors={colors}
              />

              {/* Heading 2 */}
              <ToolbarButton
                text="H2"
                onPress={() => handleInsert('## ', '')}
                colors={colors}
              />

              {/* List */}
              <ToolbarButton
                icon="format-list-bulleted"
                onPress={() => handleInsert('- ', '')}
                colors={colors}
              />

              {/* Code */}
              <ToolbarButton
                text="`"
                monospace
                onPress={() => handleInsert('`', '`')}
                colors={colors}
              />

              {/* Link */}
              <ToolbarButton
                icon="link"
                onPress={() => setShowLinkModal(true)}
                colors={colors}
              />

              {/* Table */}
              <ToolbarButton
                icon="table-chart"
                onPress={() => setShowTableModal(true)}
                colors={colors}
              />
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modals */}
      <LinkDialogModal
        visible={showLinkModal}
        selectedText={selectedText}
        onInsert={handleInsertLink}
        onCancel={() => setShowLinkModal(false)}
      />

      <TableGeneratorModal
        visible={showTableModal}
        onGenerate={handleInsertTable}
        onCancel={() => setShowTableModal(false)}
      />
    </>
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    paddingTop: 60, // Below header
  },
  dropdown: {
    marginHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
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
