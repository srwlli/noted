import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(note.content || '');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(note.content || '');
      Alert.alert('Copied', 'Note content copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy content');
    }
  };

  const handleSaveEdit = () => {
    // For now, just update local state - integrate with save functionality later
    setIsEditing(false);
    if (onEdit) {
      onEdit(); // Trigger parent edit handler
    }
  };

  const handleCancelEdit = () => {
    setEditedContent(note.content || '');
    setIsEditing(false);
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
            {isExpanded && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
              >
                <MaterialIcons name="content-copy" size={20} color={colors.text} />
              </TouchableOpacity>
            )}

            {isExpanded && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={(e) => {
                  e.stopPropagation();
                  setIsEditing(!isEditing);
                }}
              >
                <MaterialIcons name={isEditing ? "close" : "edit"} size={20} color={colors.text} />
              </TouchableOpacity>
            )}

            {onEdit && !isExpanded && (
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
          isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={[styles.editInput, { color: colors.text, borderColor: colors.border }]}
                value={editedContent}
                onChangeText={setEditedContent}
                multiline
                placeholder="Note content..."
                placeholderTextColor={colors.textSecondary}
                selectionColor={colors.tint}
              />
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: colors.tint }]}
                  onPress={handleSaveEdit}
                >
                  <Text style={[styles.editButtonText, { color: 'white' }]}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
                  onPress={handleCancelEdit}
                >
                  <Text style={[styles.editButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text
              style={[styles.preview, { color: colors.textSecondary }]}
              selectable={true}
            >
              {note.content}
            </Text>
          )
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
  editContainer: {
    marginTop: 8,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});