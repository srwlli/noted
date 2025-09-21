import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useThemeColors } from '@/hooks/use-theme-colors';
import { SharedPageLayout } from '@/components/shared-page-layout';

export default function NotesScreen() {
  const { colors } = useThemeColors();

  const handleNewNote = () => {
    // TODO: Navigate to note creation form
    console.log('Create new note');
  };

  const handleNotePress = (noteId: string) => {
    // TODO: Navigate to note detail/edit
    console.log('Open note:', noteId);
  };

  return (
    <SharedPageLayout onNewNote={handleNewNote}>
      {/* New Note Card */}
      <TouchableOpacity
        style={[styles.newNoteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={handleNewNote}
      >
        <Text style={[styles.newNoteIcon, { color: colors.textSecondary }]}>+</Text>
        <Text style={[styles.newNoteText, { color: colors.textSecondary }]}>Create new note</Text>
      </TouchableOpacity>

      {/* Note Cards */}
      <TouchableOpacity
        style={[styles.noteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => handleNotePress('1')}
      >
        <Text style={[styles.noteTitle, { color: colors.text }]}>Meeting Notes</Text>
        <Text style={[styles.notePreview, { color: colors.textSecondary }]}>
          Discussed project timeline and key deliverables for the upcoming quarter...
        </Text>
        <Text style={[styles.noteDate, { color: colors.textSecondary }]}>Today, 2:30 PM</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.noteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => handleNotePress('2')}
      >
        <Text style={[styles.noteTitle, { color: colors.text }]}>Shopping List</Text>
        <Text style={[styles.notePreview, { color: colors.textSecondary }]}>
          Milk, bread, eggs, coffee beans, fresh vegetables for dinner...
        </Text>
        <Text style={[styles.noteDate, { color: colors.textSecondary }]}>Yesterday, 10:15 AM</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.noteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => handleNotePress('3')}
      >
        <Text style={[styles.noteTitle, { color: colors.text }]}>Ideas for App</Text>
        <Text style={[styles.notePreview, { color: colors.textSecondary }]}>
          User authentication flow, dark mode implementation, offline sync capabilities...
        </Text>
        <Text style={[styles.noteDate, { color: colors.textSecondary }]}>Jan 18, 4:45 PM</Text>
      </TouchableOpacity>
    </SharedPageLayout>
  );
}

const styles = StyleSheet.create({
  newNoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    gap: 12,
  },
  newNoteIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  newNoteText: {
    fontSize: 16,
    fontWeight: '500',
  },
  noteCard: {
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  notePreview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    fontWeight: '500',
  },
});
