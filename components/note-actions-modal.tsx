import React from 'react';
import { View, Modal, TouchableOpacity, ScrollView, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { PrimaryActionRow } from '@/components/note-actions/primary-action-row';

interface NoteActionsModalProps {
  visible: boolean;
  onClose: () => void;
  noteId: string;
  noteTitle: string;
  noteContent: string;
  onDelete?: () => void;
}

export function NoteActionsModal({ visible, onClose, noteId, noteTitle, noteContent, onDelete }: NoteActionsModalProps) {
  const { colors } = useThemeColors();

  const handleEdit = () => {
    onClose();
    router.push(`/note-editor/${noteId}`);
  };

  const handlePreview = () => {
    onClose();
    router.push(`/note-editor/${noteId}?mode=preview`);
  };

  const handleDelete = () => {
    onClose();
    onDelete?.();
  };

  // Actions
  const actions = [
    { icon: 'edit' as const, label: 'Edit', onPress: handleEdit, disabled: false },
    { icon: 'visibility' as const, label: 'Preview', onPress: handlePreview, disabled: false },
    { icon: 'delete' as const, label: 'Delete', onPress: handleDelete, disabled: false, destructive: true },
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

          {/* Header with Title */}
          <View style={styles.header}>
            <TextInput
              style={[styles.titleInput, { color: colors.text, borderColor: colors.border }]}
              value={noteTitle}
              editable={false}
              placeholder="Note title"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
            {/* Actions Row */}
            <PrimaryActionRow actions={actions} />
          </ScrollView>
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
    maxHeight: '80%',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  content: {
    maxHeight: 600,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
