import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { SharedPageLayout } from '@/components/shared-page-layout';
import { NoteItem } from '@/components/note-item';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { FolderModal } from '@/components/folder-modal';
import { PWADetector } from '@/components/PWADetector';
import { notesService, Note } from '@/services/notes';
import { foldersService, Folder } from '@/services/folders';

export default function NotesScreen() {
  const { colors } = useThemeColors();
  const params = useLocalSearchParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteNote, setDeleteNote] = useState<Note | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [deleteFolder, setDeleteFolder] = useState<string | null>(null);

  // Load notes on mount and when folder changes
  useEffect(() => {
    loadNotes();
  }, [selectedFolderId]);

  const loadNotes = async () => {
    try {
      setError(null);
      const data = await notesService.getNotesByFolder(selectedFolderId);
      setNotes(data);
    } catch (err) {
      console.error('Failed to load notes:', err);
      setError('Failed to load notes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotes();
  };

  const handleNewNote = () => {
    router.push('/note-editor/new');
  };

  const handleEditNote = (note: Note) => {
    router.push(`/note-editor/${note.id}`);
  };

  const confirmDeleteNote = async () => {
    if (!deleteNote) return;

    try {
      await notesService.deleteNote(deleteNote.id);
      setDeleteNote(null);
      loadNotes();
    } catch (err) {
      console.error('Failed to delete note:', err);
      Alert.alert('Error', 'Failed to delete note');
    }
  };

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId);
  };

  const handleNewFolder = () => {
    setEditingFolder(null);
    setShowFolderModal(true);
  };

  const handleRenameFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setShowFolderModal(true);
  };

  const handleDeleteFolder = async (folderId: string) => {
    setDeleteFolder(folderId);
  };

  const confirmDeleteFolder = async () => {
    if (!deleteFolder) return;

    try {
      await foldersService.deleteFolder(deleteFolder);

      // If we deleted the currently selected folder, reset to "All Notes"
      if (selectedFolderId === deleteFolder) {
        setSelectedFolderId(null);
      }

      setDeleteFolder(null);
      loadNotes();
    } catch (err) {
      console.error('Failed to delete folder:', err);
      Alert.alert('Error', 'Failed to delete folder');
    }
  };

  const handleFolderModalSuccess = () => {
    setShowFolderModal(false);
    setEditingFolder(null);
    // Reload notes to update the folder dropdown in header
    loadNotes();
  };

  const handleFolderModalClose = () => {
    setShowFolderModal(false);
    setEditingFolder(null);
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

  return (
    <SharedPageLayout
      onNewNote={handleNewNote}
      onRefresh={handleRefresh}
      refreshing={refreshing}
      onFolderSelect={handleFolderSelect}
      onNewFolder={handleNewFolder}
      onRenameFolder={handleRenameFolder}
      onDeleteFolder={handleDeleteFolder}
      selectedFolderId={selectedFolderId}
    >
      <PWADetector />
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

        {/* Notes List */}
        {notes.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No notes yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Create your first note to get started
            </Text>
          </View>
        ) : (
          notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onEdit={() => handleEditNote(note)}
              onDelete={() => setDeleteNote(note)}
              onMoveToFolder={loadNotes}
            />
          ))
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={!!deleteNote}
        title="Delete Note"
        message={`Are you sure you want to delete "${deleteNote?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="destructive"
        onConfirm={confirmDeleteNote}
        onCancel={() => setDeleteNote(null)}
      />

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
  emptyContainer: {
    padding: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});