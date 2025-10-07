import React from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { PrimaryActionRow } from '@/components/note-actions/primary-action-row';

interface AIActionsModalProps {
  visible: boolean;
  onClose: () => void;
  onGenerateTitle: () => void;
}

/**
 * Bottom sheet modal for AI-powered actions
 * Initially contains Generate Title action
 */
export function AIActionsModal({ visible, onClose, onGenerateTitle }: AIActionsModalProps) {
  const { colors } = useThemeColors();

  const handleGenerateTitle = () => {
    onClose();
    onGenerateTitle();
  };

  const aiActions = [
    { icon: 'title' as const, label: 'Generate Title', onPress: handleGenerateTitle, disabled: false },
    { icon: 'summarize' as const, label: 'Summarize', onPress: () => {}, disabled: true },
    { icon: 'search' as const, label: 'Extract Tags', onPress: () => {}, disabled: true },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Bottom Sheet */}
        <TouchableOpacity
          style={[styles.bottomSheet, { backgroundColor: colors.elevatedSurface }]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <MaterialIcons name="auto-awesome" size={24} color={colors.tint} />
            <Text style={[styles.title, { color: colors.text }]}>AI Actions</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <PrimaryActionRow actions={aiActions} />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    maxHeight: '60%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
