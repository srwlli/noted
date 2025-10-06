import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { toast } from 'sonner-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { SharedPageLayout } from '@/components/shared-page-layout';
import { Card } from '@/components/common/card';
import { FolderModal } from '@/components/folder-modal';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { foldersService, Folder } from '@/services/folders';

/**
 * FoldersScreen - Dedicated tab for viewing and managing folders
 *
 * Features:
 * - View all folders as vertical list of cards
 * - Create, rename, delete folders
 * - Mark folders as favorites
 * - Navigate to Notes tab with folder selected
 * - Pull-to-refresh support
 * - Empty state with CTA
 * - Cross-tab synchronization via folderRefreshTrigger
 */
export default function FoldersScreen() {
  const { colors } = useThemeColors();

  // STATE: Folder data and UI states
  const [folders, setFolders] = useState<Folder[]>([]); // All folders from database
  const [loading, setLoading] = useState(true); // Initial load indicator
  const [refreshing, setRefreshing] = useState(false); // Pull-to-refresh indicator
  const [error, setError] = useState<string | null>(null); // Error message display
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null); // For navigation tracking
  const [showFolderModal, setShowFolderModal] = useState(false); // Show/hide folder create/rename modal
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null); // Folder being renamed (null = create new)
  const [deleteFolder, setDeleteFolder] = useState<string | null>(null); // Folder ID pending deletion
  const [folderRefreshTrigger, setFolderRefreshTrigger] = useState(0); // Counter to sync header dropdown across tabs

  /**
   * Load all folders from database
   * Called on mount, focus, and after CRUD operations
   */
  const loadFolders = async () => {
    try {
      setError(null);
      const data = await foldersService.getFolders();
      setFolders(data);
    } catch (err) {
      console.error('Failed to load folders:', err);
      setError('Failed to load folders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadFolders();
  }, []);

  // Reload data when tab gains focus (user switches to Folders tab)
  useFocusEffect(
    useCallback(() => {
      loadFolders();
    }, [])
  );

  /**
   * Handle pull-to-refresh gesture
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadFolders();
  };

  /**
   * Navigate to Notes tab with selected folder
   * Uses exact same pattern as Dashboard for consistency
   * @param folderId - Folder ID to filter by, or null for "All Notes"
   */
  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId);
    router.push({
      pathname: '/(tabs)/notes',
      params: folderId ? { folderId } : {},
    });
  };

  /**
   * Open modal to create new folder
   */
  const handleNewFolder = () => {
    setEditingFolder(null); // null = create mode
    setShowFolderModal(true);
  };

  /**
   * Open modal to rename existing folder
   */
  const handleRenameFolder = (folder: Folder) => {
    setEditingFolder(folder); // Set folder = rename mode
    setShowFolderModal(true);
  };

  /**
   * Prompt user to confirm folder deletion
   */
  const handleDeleteFolder = (folderId: string) => {
    setDeleteFolder(folderId);
  };

  /**
   * Close folder modal without saving
   */
  const handleFolderModalClose = () => {
    setShowFolderModal(false);
    setEditingFolder(null);
  };

  /**
   * Handle successful folder create/rename
   * Triggers header dropdown reload across all tabs
   */
  const handleFolderModalSuccess = () => {
    setShowFolderModal(false);
    setEditingFolder(null);
    setFolderRefreshTrigger(prev => prev + 1); // Increment to trigger header reload
    loadFolders(); // Reload local folder list
  };

  /**
   * Execute folder deletion after user confirmation
   * Triggers header dropdown reload across all tabs
   */
  const confirmDeleteFolder = async () => {
    if (!deleteFolder) return;
    try {
      await foldersService.deleteFolder(deleteFolder);
      setDeleteFolder(null);
      setFolderRefreshTrigger(prev => prev + 1); // Increment to trigger header reload
      loadFolders(); // Reload local folder list
    } catch (err) {
      console.error('Failed to delete folder:', err);
      Alert.alert('Error', 'Failed to delete folder');
    }
  };

  /**
   * Open modal to create folder (used by empty state CTA)
   */
  const handleCreateFolder = () => {
    setEditingFolder(null);
    setShowFolderModal(true);
  };

  /**
   * Toggle folder favorite status
   * Updates database and reloads list to reflect changes
   * @param folder - Folder to toggle favorite status
   */
  const handleToggleFavorite = async (folder: Folder) => {
    try {
      const newFavoriteState = !folder.is_favorite;
      await foldersService.toggleFavorite(folder.id, newFavoriteState);
      toast.success(
        newFavoriteState ? 'Added to Favorites' : 'Removed from Favorites',
        { position: 'top-center' }
      );
      loadFolders(); // Reload to show updated favorite status
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      toast.error('Failed to update favorite', { position: 'top-center' });
    }
  };

  if (loading) {
    return (
      <SharedPageLayout
        folderRefreshTrigger={folderRefreshTrigger}
        onFolderSelect={handleFolderSelect}
        onNewFolder={handleNewFolder}
        onRenameFolder={handleRenameFolder}
        onDeleteFolder={handleDeleteFolder}
        selectedFolderId={selectedFolderId}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SharedPageLayout>
    );
  }

  return (
    <SharedPageLayout
      onRefresh={handleRefresh}
      refreshing={refreshing}
      folderRefreshTrigger={folderRefreshTrigger}
      onFolderSelect={handleFolderSelect}
      onNewFolder={handleNewFolder}
      onRenameFolder={handleRenameFolder}
      onDeleteFolder={handleDeleteFolder}
      selectedFolderId={selectedFolderId}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.tint]}
            tintColor={colors.tint}
          />
        }
      >
        {/* Error Message */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: '#fee2e2', borderColor: '#fecaca' }]}>
            <Text style={[styles.errorText, { color: '#dc2626' }]}>{error}</Text>
          </View>
        )}

        {/* Empty State */}
        {folders.length === 0 && (
          <Card
            isAccordion={false}
            style={{ backgroundColor: colors.surface }}
            headerContent={
              <View style={styles.emptyStateHeader}>
                <MaterialIcons name="folder" size={48} color={colors.textSecondary} />
              </View>
            }
          >
            <View style={styles.emptyStateContent}>
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                No folders yet
              </Text>
              <Text style={[styles.emptyStateMessage, { color: colors.textSecondary }]}>
                Create your first folder to organize notes
              </Text>
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.tint }]}
                onPress={handleCreateFolder}
                activeOpacity={0.7}
              >
                <MaterialIcons name="add" size={20} color="#fff" />
                <Text style={styles.createButtonText}>Create Folder</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Folder Cards (vertical list) - No body content when "collapsed" (isAccordion=false) */}
        {folders.map((folder) => (
          <Card
            key={folder.id}
            isAccordion={false}
            style={{ backgroundColor: colors.surface }}
            headerContent={
              <>
                {/* Folder icon + name - tap to navigate to Notes tab */}
                <TouchableOpacity
                  style={styles.folderCardHeader}
                  onPress={() => handleFolderSelect(folder.id)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="folder" size={24} color={colors.text} />
                  <Text style={[styles.folderName, { color: colors.text }]}>
                    {folder.name}
                  </Text>
                </TouchableOpacity>

                {/* Action menu (...) with Rename, Favorite, Delete options */}
                <View style={styles.folderActions}>
                  <Menu>
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
                        minWidth: 200,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 8,
                        elevation: 5,
                      }
                    }}>
                      {/* Rename folder */}
                      <MenuOption
                        onSelect={() => {
                          setEditingFolder(folder);
                          setShowFolderModal(true);
                        }}
                        customStyles={{ optionWrapper: styles.menuItem }}
                      >
                        <MaterialIcons name="edit" size={20} color={colors.text} />
                        <Text style={[styles.menuText, { color: colors.text }]}>Rename</Text>
                      </MenuOption>

                      {/* Toggle favorite status */}
                      <MenuOption
                        onSelect={() => handleToggleFavorite(folder)}
                        customStyles={{ optionWrapper: styles.menuItem }}
                      >
                        <MaterialIcons
                          name={folder.is_favorite ? 'star' : 'star-border'}
                          size={20}
                          color={colors.text}
                        />
                        <Text style={[styles.menuText, { color: colors.text }]}>
                          {folder.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        </Text>
                      </MenuOption>

                      {/* Delete folder */}
                      <MenuOption
                        onSelect={() => setDeleteFolder(folder.id)}
                        customStyles={{ optionWrapper: styles.menuItem }}
                      >
                        <MaterialIcons name="delete" size={20} color={colors.text} />
                        <Text style={[styles.menuText, { color: colors.text }]}>Delete</Text>
                      </MenuOption>
                    </MenuOptions>
                  </Menu>
                </View>
              </>
            }
          >
            {/* No body content - card shows header only when collapsed */}
          </Card>
        ))}
      </ScrollView>

      {/* Folder Modal */}
      <FolderModal
        visible={showFolderModal}
        onClose={handleFolderModalClose}
        onSuccess={handleFolderModalSuccess}
        onDelete={editingFolder ? () => handleDeleteFolder(editingFolder.id) : undefined}
        initialFolder={editingFolder ? { id: editingFolder.id, name: editingFolder.name } : undefined}
      />

      {/* Delete Folder Confirmation Modal */}
      <ConfirmationModal
        visible={!!deleteFolder}
        title="Delete Folder"
        message="Are you sure you want to delete this folder? Notes in this folder will not be deleted."
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="destructive"
        onConfirm={confirmDeleteFolder}
        onCancel={() => setDeleteFolder(null)}
      />
    </SharedPageLayout>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyStateHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyStateContent: {
    alignItems: 'center',
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  emptyStateMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  folderCardHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  folderName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  folderActions: {
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
  },
  noteCount: {
    fontSize: 14,
  },
});
