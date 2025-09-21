import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Note } from '@/services/notes';

interface NoteItemProps {
  note: Note;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function NoteItem({ note, onPress, onEdit, onDelete }: NoteItemProps) {
  const { colors } = useThemeColors();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {note.title}
        </Text>
        {note.content && (
          <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={2}>
            {note.content}
          </Text>
        )}
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formatDate(note.created_at)}
        </Text>
      </View>

      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Text style={[styles.actionText, { color: colors.text }]}>Edit</Text>
          </TouchableOpacity>
        )}

        {onDelete && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#fee2e2', borderColor: '#fecaca' }]}
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Text style={[styles.actionText, { color: '#dc2626' }]}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  preview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});