import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { SharedPageLayout } from '@/components/shared-page-layout';
import { NoteModal } from '@/components/note-modal';
import { NoteItem } from '@/components/note-item';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { PWADetector } from '@/components/PWADetector';
import { notesService, Note } from '@/services/notes';

export default function NotesScreen() {
  const { colors } = useThemeColors();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deleteNote, setDeleteNote] = useState<Note | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setError(null);
      const data = await notesService.getNotes();
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
    setEditingNote(null);
    setShowModal(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowModal(true);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setEditingNote(null);
    loadNotes();
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingNote(null);
  };

  const confirmDeleteNote = async () => {
    if (!deleteNote) return;

    try {
      await notesService.deleteNote(deleteNote.id);

      // If we're deleting the note that's currently being edited, close the modal
      if (editingNote && deleteNote.id === editingNote.id) {
        setShowModal(false);
        setEditingNote(null);
      }

      setDeleteNote(null);
      loadNotes();
    } catch (err) {
      console.error('Failed to delete note:', err);
      Alert.alert('Error', 'Failed to delete note');
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

  return (
    <SharedPageLayout onNewNote={handleNewNote} onRefresh={handleRefresh} refreshing={refreshing}>
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
            />
          ))
        )}
      </ScrollView>

      {/* Note Modal */}
      <NoteModal
        visible={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        initialNote={editingNote ? {
          id: editingNote.id,
          title: editingNote.title,
          content: editingNote.content
        } : undefined}
      />

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