import React, { useState, useCallback, useEffect, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { router } from 'expo-router';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Card } from '@/components/common/card';
import { Note } from '@/services/notes';
import { USE_MARKDOWN_EDITOR } from '@/config/features';
import { toast } from 'sonner-native';
import { NoteActionsModal } from '@/components/note-actions-modal';

interface NoteItemProps {
  note: Note;
  onEdit?: () => void;
  onDelete?: () => void;
  onMoveToFolder?: () => void;
  onFavoriteToggle?: () => void;
}

export const NoteItem = memo(({ note, onEdit, onDelete, onMoveToFolder, onFavoriteToggle }: NoteItemProps) => {
  const { colors } = useThemeColors();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(note.is_favorite);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsMenuOpen(false);
      setIsExpanded(false);
    };
  }, []);

  // Sync local state when note.is_favorite changes from parent
  useEffect(() => {
    setIsFavorite(note.is_favorite);
  }, [note.is_favorite]);

  const handleMenuOpen = useCallback(() => {
    setIsMenuOpen(true);
  }, []);

  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleEdit = useCallback(() => {
    if (USE_MARKDOWN_EDITOR) {
      // Navigate to markdown editor with note ID
      router.push(`/note-editor/${note.id}`);
    } else {
      // Use old modal editor via callback
      onEdit?.();
    }
  }, [note.id, onEdit]);

  const handlePreview = useCallback(() => {
    router.push(`/note-editor/${note.id}?mode=preview`);
  }, [note.id]);

  const handleCopy = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(note.content || '');
      toast.success('Note content copied to clipboard');
    } catch {
      toast.error('Failed to copy content');
    }
  }, [note.content]);

  const handleDelete = useCallback(() => {
    onDelete?.();
  }, [onDelete]);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleLongPress = useCallback(() => {
    setShowActionsModal(true);
  }, []);

  const handleToggleFavorite = useCallback(async () => {
    try {
      const newFavoriteState = !isFavorite;
      setIsFavorite(newFavoriteState);
      onFavoriteToggle?.();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  }, [note.id, isFavorite, onFavoriteToggle]);


  return (
    <>
      <Card
        isAccordion={false}
        headerActive={isMenuOpen || showActionsModal || isExpanded}
        style={{
          backgroundColor: colors.surface,
        }}
        headerContent={
          <>
            <TouchableOpacity
              style={styles.titleContainer}
              onPress={handleToggleExpanded}
              onLongPress={handleLongPress}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={isExpanded ? "keyboard-arrow-down" : "keyboard-arrow-right"}
                size={24}
                color={colors.textSecondary}
              />
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {note.title}
              </Text>
            </TouchableOpacity>
            <View style={styles.actions}>
              <Menu
                  onOpen={handleMenuOpen}
                  onClose={handleMenuClose}
                >
                  <MenuTrigger customStyles={{ triggerWrapper: styles.iconButton }}>
                    <MaterialIcons name="more-vert" size={20} color={colors.text} />
                  </MenuTrigger>
                  <MenuOptions customStyles={{
                    optionsContainer: {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderWidth: 1,
                      borderRadius: 12,
                      padding: 8,
                      minWidth: 150,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 8,
                      elevation: 5,
                    }
                  }}>
                    <MenuOption onSelect={handleEdit} customStyles={{ optionWrapper: styles.menuItem }}>
                      <MaterialIcons name="edit" size={20} color={colors.text} />
                      <Text style={[styles.menuText, { color: colors.text }]}>Edit</Text>
                    </MenuOption>
                    <MenuOption onSelect={handlePreview} customStyles={{ optionWrapper: styles.menuItem }}>
                      <MaterialIcons name="visibility" size={20} color={colors.text} />
                      <Text style={[styles.menuText, { color: colors.text }]}>Preview</Text>
                    </MenuOption>
                    <MenuOption onSelect={handleCopy} customStyles={{ optionWrapper: styles.menuItem }}>
                      <MaterialIcons name="content-copy" size={20} color={colors.text} />
                      <Text style={[styles.menuText, { color: colors.text }]}>Copy</Text>
                    </MenuOption>
                    <MenuOption onSelect={handleDelete} customStyles={{ optionWrapper: styles.menuItem }}>
                      <MaterialIcons name="delete" size={20} color={colors.text} />
                      <Text style={[styles.menuText, { color: colors.text }]}>Delete</Text>
                    </MenuOption>
                  </MenuOptions>
                </Menu>
            </View>
          </>
        }
      >
        {isExpanded && note.content && (
          <Text
            style={[styles.preview, { color: colors.textSecondary }]}
            selectable={true}
          >
            {note.content}
          </Text>
        )}
      </Card>

      {/* Actions Modal - triggered by (...) button or long press on mobile */}
      <NoteActionsModal
        visible={showActionsModal}
        onClose={() => setShowActionsModal(false)}
        noteId={note.id}
        noteTitle={note.title}
        noteContent={note.content || ''}
        folderId={note.folder_id}
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
        onFolderChanged={onMoveToFolder}
        onNoteUpdated={onEdit}
        onDelete={handleDelete}
      />
    </>
  );
}, (prevProps, nextProps) => {
  // Only re-render if note actually changed
  return prevProps.note.id === nextProps.note.id &&
         prevProps.note.updated_at === nextProps.note.updated_at;
});

NoteItem.displayName = 'NoteItem';

const styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    fontSize: 14,
    lineHeight: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
  },
  submenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 24,
    gap: 12,
  },
  submenuText: {
    fontSize: 14,
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: 4,
  },
});