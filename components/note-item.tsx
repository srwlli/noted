import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
  const [isExpanded, setIsExpanded] = useState(false);

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
        <View style={[
          styles.titleRow,
          isExpanded && { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8, marginBottom: 8 }
        ]}>
          <TouchableOpacity
            style={styles.chevronButton}
            onPress={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <MaterialIcons
              name={isExpanded ? "expand-less" : "chevron-right"}
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {note.title}
          </Text>
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <MaterialIcons name="more-horiz" size={20} color={colors.text} />
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <MaterialIcons name="delete" size={20} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>
        </View>
{isExpanded && note.content && (
          <Text style={[styles.preview, { color: colors.textSecondary }]}>
            {note.content}
          </Text>
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
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
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
  chevronButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});