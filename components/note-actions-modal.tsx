import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { PrimaryActionRow } from '@/components/note-actions/primary-action-row';
import { toast } from 'sonner-native';

interface NoteActionsModalProps {
  visible: boolean;
  onClose: () => void;
  noteId: string;
  noteTitle: string;
  noteContent: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function NoteActionsModal({ visible, onClose, noteId, noteTitle, noteContent, isFavorite, onToggleFavorite }: NoteActionsModalProps) {
  const { colors } = useThemeColors();
  const [title, setTitle] = useState(noteTitle);

  const showComingSoon = () => {
    toast.info('Coming Soon', { position: 'top-center' });
  };

  // Primary actions
  const favoriteIcon = (isFavorite ? 'star' : 'star-border') as 'star' | 'star-border';
  const primaryActions = [
    { icon: 'edit' as const, label: 'Edit', onPress: showComingSoon, disabled: false },
    { icon: favoriteIcon, label: isFavorite ? 'Unfavorite' : 'Favorite', onPress: onToggleFavorite, disabled: false },
    { icon: 'share' as const, label: 'Share', onPress: showComingSoon, disabled: false },
    { icon: 'content-copy' as const, label: 'Duplicate', onPress: showComingSoon, disabled: false },
  ];

  // Secondary actions
  const secondaryActions = [
    { icon: 'auto-awesome' as const, label: 'AI Actions', onPress: showComingSoon, disabled: false },
    { icon: 'file-download' as const, label: 'Export', onPress: showComingSoon, disabled: false },
    { icon: 'folder-open' as const, label: 'Organization', onPress: showComingSoon, disabled: false },
  ];

  // Tertiary actions
  const tertiaryActions = [
    { icon: 'content-copy' as const, label: 'Copy', onPress: showComingSoon, disabled: false, destructive: false },
    { icon: 'delete' as const, label: 'Delete', onPress: showComingSoon, disabled: false, destructive: true },
    { icon: 'download' as const, label: 'Download', onPress: showComingSoon, disabled: false, destructive: false },
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

          {/* Header with Title Input */}
          <View style={styles.header}>
            <TextInput
              style={[styles.titleInput, { color: colors.text, borderColor: colors.border }]}
              value={title}
              onChangeText={setTitle}
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
            {/* Section 1: Primary Actions Row */}
            <PrimaryActionRow actions={primaryActions} />

            {/* Section 2: Secondary Actions Row */}
            <PrimaryActionRow actions={secondaryActions} />

            {/* Section 3: Tertiary Actions Row */}
            <PrimaryActionRow actions={tertiaryActions} />
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
