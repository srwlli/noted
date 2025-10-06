import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { SharedPageLayout } from '@/components/shared-page-layout';
import { Card } from '@/components/common/card';
import { FolderModal } from '@/components/folder-modal';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { foldersService, Folder } from '@/services/folders';

export default function FoldersScreen() {
  const { colors } = useThemeColors();

  // Phase 1 states
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [deleteFolder, setDeleteFolder] = useState<string | null>(null);
  const [folderRefreshTrigger, setFolderRefreshTrigger] = useState(0);

  // Load folders data
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

  // Load data on mount
  useEffect(() => {
    loadFolders();
  }, []);

  // Reload data when Folders tab gains focus
  useFocusEffect(
    useCallback(() => {
      loadFolders();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadFolders();
  };

  // Navigation handler (exact copy from Dashboard)
  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId);
    router.push({
      pathname: '/(tabs)/notes',
      params: folderId ? { folderId } : {},
    });
  };

  // Modal handlers
  const handleNewFolder = () => {
    setEditingFolder(null);
    setShowFolderModal(true);
  };

  const handleRenameFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setShowFolderModal(true);
  };

  const handleDeleteFolder = (folderId: string) => {
    setDeleteFolder(folderId);
  };

  const handleFolderModalClose = () => {
    setShowFolderModal(false);
    setEditingFolder(null);
  };

  const handleFolderModalSuccess = () => {
    setShowFolderModal(false);
    setEditingFolder(null);
    setFolderRefreshTrigger(prev => prev + 1); // Triggers header reload
    loadFolders(); // Reload local list
  };

  const confirmDeleteFolder = async () => {
    if (!deleteFolder) return;
    try {
      await foldersService.deleteFolder(deleteFolder);
      setDeleteFolder(null);
      setFolderRefreshTrigger(prev => prev + 1); // Triggers header reload
      loadFolders(); // Reload local list
    } catch (err) {
      console.error('Failed to delete folder:', err);
      Alert.alert('Error', 'Failed to delete folder');
    }
  };

  const handleCreateFolder = () => {
    setEditingFolder(null);
    setShowFolderModal(true);
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

        {/* Folder Cards (vertical list) */}
        {folders.map((folder) => (
          <Card
            key={folder.id}
            isAccordion={false}
            style={{ backgroundColor: colors.surface }}
            headerContent={
              <>
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
                        minWidth: 150,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 8,
                        elevation: 5,
                      }
                    }}>
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
            <Text style={[styles.noteCount, { color: colors.textSecondary }]}>
              0 notes
            </Text>
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
