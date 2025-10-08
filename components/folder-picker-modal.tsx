import React, { useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity, ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { foldersService, Folder } from '@/services/folders';
import { toast } from 'sonner-native';

interface FolderPickerModalProps {
  visible: boolean;
  onClose: () => void;
  noteId: string;
  currentFolderId: string | null;
  onFolderChanged?: () => void;
}

/**
 * Bottom sheet modal for selecting a folder to move a note to
 * Displays current folder, "All Notes", list of folders, and "Create Folder" button
 */
export function FolderPickerModal({ visible, onClose, noteId, currentFolderId, onFolderChanged }: FolderPickerModalProps) {
  const { colors } = useThemeColors();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [moving, setMoving] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Load folders when modal opens
  useEffect(() => {
    if (visible) {
      loadFolders();
    }
  }, [visible]);

  const loadFolders = async () => {
    setLoading(true);
    try {
      const data = await foldersService.getFolders();
      setFolders(data);
    } catch (err) {
      console.error('Failed to load folders:', err);
      toast.error('Failed to load folders', { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFolder = async (folderId: string | null, folderName: string) => {
    if (folderId === currentFolderId) {
      // Already in this folder
      onClose();
      return;
    }

    setMoving(true);
    try {
      await foldersService.moveNoteToFolder(noteId, folderId);
      toast.success(`Moved to ${folderName}`, { position: 'top-center' });
      onFolderChanged?.();
      onClose();
    } catch (err) {
      console.error('Failed to move note:', err);
      toast.error('Failed to move note', { position: 'top-center' });
    } finally {
      setMoving(false);
    }
  };

  const handleCreateFolder = async () => {
    const trimmedName = newFolderName.trim();
    if (!trimmedName) {
      toast.error('Folder name cannot be empty', { position: 'top-center' });
      return;
    }

    try {
      const newFolder = await foldersService.createFolder(trimmedName);
      toast.success('Folder created', { position: 'top-center' });
      setNewFolderName('');
      setShowCreateFolder(false);
      await loadFolders();
      // Automatically move note to new folder
      await handleSelectFolder(newFolder.id, newFolder.name);
    } catch (err) {
      console.error('Failed to create folder:', err);
      toast.error('Failed to create folder', { position: 'top-center' });
    }
  };

  const handleModalClose = () => {
    setShowCreateFolder(false);
    setNewFolderName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleModalClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleModalClose}
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
            <MaterialIcons name="folder-open" size={24} color={colors.tint} />
            <Text style={[styles.title, { color: colors.text }]}>
              Move to Folder
            </Text>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.tint} />
              </View>
            ) : (
              <View style={styles.content}>
                {/* Current folder indicator */}
                {currentFolderId && (
                  <View style={[styles.currentFolderBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <MaterialIcons name="info-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.currentFolderText, { color: colors.textSecondary }]}>
                      Current: {folders.find(f => f.id === currentFolderId)?.name || 'Unknown'}
                    </Text>
                  </View>
                )}

                {/* All Notes option */}
                <TouchableOpacity
                  style={[
                    styles.folderItem,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    currentFolderId === null && styles.folderItemActive
                  ]}
                  onPress={() => handleSelectFolder(null, 'All Notes')}
                  disabled={moving}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="folder-open" size={20} color={colors.text} />
                  <Text style={[styles.folderName, { color: colors.text }]}>All Notes</Text>
                  {currentFolderId === null && (
                    <MaterialIcons name="check" size={20} color={colors.tint} />
                  )}
                </TouchableOpacity>

                {/* Folder list */}
                {folders.map((folder) => (
                  <TouchableOpacity
                    key={folder.id}
                    style={[
                      styles.folderItem,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      currentFolderId === folder.id && styles.folderItemActive
                    ]}
                    onPress={() => handleSelectFolder(folder.id, folder.name)}
                    disabled={moving}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="folder" size={20} color={colors.text} />
                    <Text style={[styles.folderName, { color: colors.text }]}>{folder.name}</Text>
                    {currentFolderId === folder.id && (
                      <MaterialIcons name="check" size={20} color={colors.tint} />
                    )}
                  </TouchableOpacity>
                ))}

                {/* Create New Folder button */}
                {!showCreateFolder ? (
                  <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: colors.surface, borderColor: colors.tint }]}
                    onPress={() => setShowCreateFolder(true)}
                    disabled={moving}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="add" size={20} color={colors.tint} />
                    <Text style={[styles.createButtonText, { color: colors.tint }]}>Create New Folder</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.createFolderForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <input
                      style={{
                        flex: 1,
                        padding: '12px',
                        fontSize: '16px',
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        color: colors.text,
                      }}
                      type="text"
                      placeholder="Folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                      autoFocus
                    />
                    <TouchableOpacity onPress={handleCreateFolder} style={styles.createIconButton}>
                      <MaterialIcons name="check" size={20} color={colors.tint} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setShowCreateFolder(false);
                        setNewFolderName('');
                      }}
                      style={styles.createIconButton}
                    >
                      <MaterialIcons name="close" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
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
    paddingBottom: 80, // Account for tab bar (49px) + extra padding
    maxHeight: '80%', // Allow taller sheets but cap at 80%
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
  scrollView: {
    flexShrink: 1, // Allow content to naturally size based on folder count
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  currentFolderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  currentFolderText: {
    fontSize: 14,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  folderItemActive: {
    borderWidth: 2,
  },
  folderName: {
    fontSize: 16,
    flex: 1,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  createFolderForm: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    overflow: 'hidden',
  },
  createIconButton: {
    padding: 12,
  },
});
