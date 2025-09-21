import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { SharedPageLayout } from '@/components/shared-page-layout';
import { NoteForm } from '@/components/note-form';
import { NoteItem } from '@/components/note-item';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { notesService, Note } from '@/services/notes';

export default function NotesScreen() {
  const { colors } = useThemeColors();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
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
    setShowForm(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingNote(null);
    loadNotes();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingNote(null);
  };

  const confirmDeleteNote = async () => {
    if (!deleteNote) return;

    try {
      await notesService.deleteNote(deleteNote.id);

      // If we're deleting the note that's currently being edited, close the form
      if (editingNote && deleteNote.id === editingNote.id) {
        setShowForm(false);
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
    <SharedPageLayout onNewNote={handleNewNote}>
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
        {/* Note Form */}
        {showForm && (
          <NoteForm
            initialNote={editingNote ? {
              id: editingNote.id,
              title: editingNote.title,
              content: editingNote.content
            } : undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}

        {/* Action Cards - Refresh and Create */}
        {!showForm && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.refreshCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              <Text style={[styles.refreshText, { color: colors.textSecondary }]}>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.newNoteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleNewNote}
            >
              <Text style={[styles.newNoteText, { color: colors.textSecondary }]}>Create new note</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: '#fee2e2', borderColor: '#fecaca' }]}>
            <Text style={[styles.errorText, { color: '#dc2626' }]}>{error}</Text>
          </View>
        )}

        {/* Notes List */}
        {notes.length === 0 && !showForm ? (
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
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cardWithIcon: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  outsideIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  newNoteCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    gap: 8,
  },
  newNoteIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  newNoteText: {
    fontSize: 14,
    fontWeight: '500',
  },
  refreshCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    gap: 8,
  },
  refreshIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '500',
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