import React, { useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity, ScrollView, StyleSheet, TextInput, Share, Platform, Text } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { PrimaryActionRow } from '@/components/note-actions/primary-action-row';
import { AIActionsModal } from '@/components/ai-actions-modal';
import { FolderPickerModal } from '@/components/folder-picker-modal';
import { notesService, Note } from '@/services/notes';
import { summarizeNote } from '@/services/ai/summarize';
import { toast } from 'sonner-native';

interface NoteActionsModalProps {
  visible: boolean;
  onClose: () => void;
  noteId: string;
  noteTitle: string;
  noteContent: string;
  folderId: string | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onFolderChanged?: () => void;
  onNoteUpdated?: () => void;
  onDelete?: () => void;
  note: Note;
}

export function NoteActionsModal({ visible, onClose, noteId, noteTitle, noteContent, folderId, isFavorite, onToggleFavorite, onFolderChanged, onNoteUpdated, onDelete, note }: NoteActionsModalProps) {
  const { colors } = useThemeColors();
  const [title, setTitle] = useState(noteTitle);
  const [showAIActionsModal, setShowAIActionsModal] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Sync local title state with prop when it changes (e.g., after AI title generation)
  useEffect(() => {
    setTitle(noteTitle);
  }, [noteTitle]);

  const showComingSoon = () => {
    toast.info('Coming Soon', { position: 'top-center' });
  };

  const handleTitleBlur = async () => {
    if (title.trim() !== noteTitle.trim()) {
      try {
        await notesService.updateNote(noteId, title.trim(), noteContent);
        onNoteUpdated?.();
      } catch (error) {
        console.error('Failed to update title:', error);
        toast.error('Failed to update title', { position: 'top-center' });
        setTitle(noteTitle); // Revert on error
      }
    }
  };

  const handleEdit = () => {
    onClose();
    router.push(`/note-editor/${noteId}`);
  };

  const handlePreview = () => {
    onClose();
    router.push(`/note-editor/${noteId}?mode=preview`);
  };

  const handleShare = async () => {
    try {
      const title = noteTitle || 'Note';
      const message = noteContent || '';

      if (Platform.OS === 'web') {
        // Web: Try Web Share API first (supports email, SMS, etc.)
        if (navigator.share) {
          await navigator.share({
            title: title,
            text: message,
          });
        } else {
          // Fallback: Copy to clipboard if Web Share API not available
          await Clipboard.setStringAsync(message);
          toast.success('Note content copied to clipboard', { position: 'top-center' });
        }
      } else {
        // Mobile: Native share sheet
        await Share.share({
          title: title,
          message: message,
        });
        // Note: Share.share resolves on dismiss, no success toast needed
      }
    } catch (error) {
      // User cancelled share or error occurred
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Share failed:', error);
        toast.error('Failed to share note', { position: 'top-center' });
      }
    }
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(noteContent);
      toast.success('Note content copied to clipboard', { position: 'top-center' });
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy content', { position: 'top-center' });
    }
  };

  // Primary actions
  const favoriteIcon = (isFavorite ? 'star' : 'star-border') as 'star' | 'star-border';
  const primaryActions = [
    { icon: 'edit' as const, label: 'Edit', onPress: handleEdit, disabled: false },
    { icon: favoriteIcon, label: isFavorite ? 'Unfavorite' : 'Favorite', onPress: onToggleFavorite, disabled: false },
    { icon: 'share' as const, label: 'Share', onPress: handleShare, disabled: false },
    { icon: 'visibility' as const, label: 'Preview', onPress: handlePreview, disabled: false },
  ];

  const handleAIActions = () => {
    setShowAIActionsModal(true);
  };

  const handleOrganization = () => {
    setShowFolderPicker(true);
  };

  const handleSummarize = async () => {
    if (isGeneratingSummary) return;

    setIsGeneratingSummary(true);
    const loadingToast = toast.loading('Generating summary...', { position: 'top-center' });

    try {
      const result = await summarizeNote(noteContent);

      if (!result.success) {
        toast.error(result.error, { id: loadingToast, position: 'top-center' });
        return;
      }

      // Save to database
      await notesService.updateNoteSummary(noteId, result.summary);

      // Update local state (trigger re-render)
      onNoteUpdated?.();

      toast.success('Summary generated!', { id: loadingToast, position: 'top-center' });
    } catch (error) {
      console.error('Summary failed:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate summary';
      toast.error(message, { id: loadingToast, position: 'top-center' });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Stale summary detection
  const isSummaryStale = note.updated_at && note.summary_generated_at && new Date(note.updated_at) > new Date(note.summary_generated_at);

  // Secondary actions
  const secondaryActions = [
    { icon: 'file-download' as const, label: 'Export', onPress: showComingSoon, disabled: false },
    { icon: 'folder-open' as const, label: 'Organization', onPress: handleOrganization, disabled: false },
    { icon: 'download' as const, label: 'Download', onPress: showComingSoon, disabled: false },
  ];

  const handleDelete = () => {
    onClose();
    onDelete?.();
  };

  // Tertiary actions
  const tertiaryActions = [
    { icon: 'content-copy' as const, label: 'Copy', onPress: handleCopy, disabled: false, destructive: false },
    { icon: 'auto-awesome' as const, label: 'AI Actions', onPress: handleAIActions, disabled: false, accent: true },
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

          {/* Header with Title Input */}
          <View style={styles.header}>
            <TextInput
              style={[styles.titleInput, { color: colors.text, borderColor: colors.border }]}
              value={title}
              onChangeText={setTitle}
              onBlur={handleTitleBlur}
              returnKeyType="done"
              blurOnSubmit
              placeholder="Note title"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* AI Summary Section */}
          {note.ai_summary && (
            <View style={[styles.summaryContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.summaryHeader}>
                <MaterialIcons name="auto-awesome" size={16} color={colors.tint} />
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>AI Summary</Text>
                {isSummaryStale && (
                  <MaterialIcons name="warning" size={14} color="#F59E0B" style={{ marginLeft: 4 }} />
                )}
                <TouchableOpacity onPress={handleSummarize} style={styles.regenerateButton} disabled={isGeneratingSummary}>
                  <MaterialIcons name="refresh" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.summaryText, { color: colors.text }]}>
                {note.ai_summary}
              </Text>
            </View>
          )}

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

      {/* AI Actions Modal */}
      <AIActionsModal
        visible={showAIActionsModal}
        onClose={() => setShowAIActionsModal(false)}
        noteId={noteId}
        noteContent={noteContent}
        note={note}
        onTitleUpdated={onNoteUpdated}
      />

      {/* Folder Picker Modal */}
      <FolderPickerModal
        visible={showFolderPicker}
        onClose={() => setShowFolderPicker(false)}
        noteId={noteId}
        currentFolderId={folderId}
        onFolderChanged={onFolderChanged}
      />
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
  summaryContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  regenerateButton: {
    padding: 4,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
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
