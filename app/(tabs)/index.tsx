import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { SharedPageLayout } from '@/components/shared-page-layout';
import { NoteItem } from '@/components/note-item';
import { Card } from '@/components/common/card';
import { notesService, Note } from '@/services/notes';
import { foldersService, Folder } from '@/services/folders';
import { FolderModal } from '@/components/folder-modal';
import { ConfirmationModal } from '@/components/confirmation-modal';

export default function DashboardScreen() {
  const { colors } = useThemeColors();
  const [favoriteNotes, setFavoriteNotes] = useState<Note[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [deleteFolder, setDeleteFolder] = useState<string | null>(null);
  const [folderRefreshTrigger, setFolderRefreshTrigger] = useState(0);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setError(null);
      const favorites = await notesService.getFavoriteNotes();
      const recent = await notesService.getRecentNonFavoriteNotes(3);
      setFavoriteNotes(favorites);
      setRecentNotes(recent);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Reload data when Dashboard tab gains focus
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId);
    router.push({
      pathname: '/(tabs)/notes',
      params: folderId ? { folderId } : {},
    });
  };

  const handleNewFolder = () => {
    setEditingFolder(null);
    setShowFolderModal(true);
  };

  const handleRenameFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setShowFolderModal(true);
  };

  const handleFolderModalClose = () => {
    setShowFolderModal(false);
    setEditingFolder(null);
  };

  const handleFolderModalSuccess = () => {
    setShowFolderModal(false);
    setEditingFolder(null);
    setFolderRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteFolder = (folderId: string) => {
    setDeleteFolder(folderId);
  };

  const confirmDeleteFolder = async () => {
    if (!deleteFolder) return;

    try {
      await foldersService.deleteFolder(deleteFolder);
      if (selectedFolderId === deleteFolder) {
        setSelectedFolderId(null);
      }
      setDeleteFolder(null);
      setFolderRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Failed to delete folder:', err);
      Alert.alert('Error', 'Failed to delete folder');
    }
  };

  if (loading) {
    return (
      <SharedPageLayout>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SharedPageLayout>
    );
  }

  const showEmptyState = favoriteNotes.length === 0 && recentNotes.length === 0;

  return (
    <SharedPageLayout
      onRefresh={handleRefresh}
      refreshing={refreshing}
      onFolderSelect={handleFolderSelect}
      onNewFolder={handleNewFolder}
      onRenameFolder={handleRenameFolder}
      onDeleteFolder={handleDeleteFolder}
      selectedFolderId={selectedFolderId}
      folderRefreshTrigger={folderRefreshTrigger}
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
        {showEmptyState && (
          <>
            <Card
              isAccordion={false}
              headerContent={
                <View style={styles.emptyCardHeader}>
                  <MaterialIcons name="star-border" size={32} color={colors.textSecondary} />
                  <Text style={[styles.emptyCardTitle, { color: colors.text }]}>Favorites</Text>
                </View>
              }
            >
              <View style={styles.emptyCardContent}>
                <Text style={[styles.emptyCardText, { color: colors.textSecondary }]}>
                  Add fav for quick access
                </Text>
              </View>
            </Card>

            <Card
              isAccordion={false}
              headerContent={
                <View style={styles.emptyCardHeader}>
                  <MaterialIcons name="access-time" size={32} color={colors.textSecondary} />
                  <Text style={[styles.emptyCardTitle, { color: colors.text }]}>Recent Notes</Text>
                </View>
              }
            >
              <View style={styles.emptyCardContent}>
                <Text style={[styles.emptyCardText, { color: colors.textSecondary }]}>
                  Last 3 notes here
                </Text>
              </View>
            </Card>
          </>
        )}

        {/* Favorites Section (no header) */}
        {favoriteNotes.length > 0 && (
          <View>
            {favoriteNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onFavoriteToggle={loadDashboardData}
              />
            ))}
          </View>
        )}

        {/* Last 3 Section (with divider) */}
        {recentNotes.length > 0 && (
          <View>
            <View style={[styles.divider, { borderBottomColor: colors.border }]} />
            {recentNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onFavoriteToggle={loadDashboardData}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <FolderModal
        visible={showFolderModal}
        onClose={handleFolderModalClose}
        onSuccess={handleFolderModalSuccess}
        onDelete={editingFolder ? () => handleDeleteFolder(editingFolder.id) : undefined}
        initialFolder={editingFolder ? { id: editingFolder.id, name: editingFolder.name } : undefined}
      />

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
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 24,
  },
  divider: {
    borderBottomWidth: 1,
    marginTop: 0,
    marginBottom: 12,
  },
  emptyCardHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  emptyCardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyCardContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  emptyCardText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
