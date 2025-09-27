import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Note } from '@/services/notes';

interface NoteItemProps {
  note: Note;
  onPress?: () => void;
  onEdit?: () => void;
  onSave?: (id: string, title: string, content: string) => Promise<void>;
  onDelete?: () => void;
}

export function NoteItem({ note, onPress, onEdit, onSave, onDelete }: NoteItemProps) {
  const { colors } = useThemeColors();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(note.content || '');
  const [textInputHeight, setTextInputHeight] = useState(150);

  const editHeightAnimation = useRef(new Animated.Value(0)).current;


  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(note.content || '');
      Alert.alert('Copied', 'Note content copied to clipboard');
    } catch {
      Alert.alert('Error', 'Failed to copy content');
    }
  };

  useEffect(() => {
    if (isEditing) {
      // Animate edit area slide in
      Animated.spring(editHeightAnimation, {
        toValue: 1,
        useNativeDriver: false,
      }).start();
    } else {
      // Animate edit area slide out
      Animated.spring(editHeightAnimation, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [isEditing, editHeightAnimation]);

  const handleSaveEdit = async () => {
    if (!onSave) {
      // Fallback to modal editing if no save callback provided
      setIsEditing(false);
      if (onEdit) {
        onEdit();
      }
      return;
    }

    try {
      await onSave(note.id, note.title, editedContent);
      setIsEditing(false);
      Alert.alert('Saved', 'Note updated successfully');
    } catch {
      Alert.alert('Error', 'Failed to save note. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditedContent(note.content || '');
    setIsEditing(false);
  };

  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    setTextInputHeight(Math.max(150, height + 20));
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        isEditing && {
          backgroundColor: colors.background,
          borderColor: colors.tint,
          borderWidth: 2,
          shadowColor: colors.tint,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} disabled={isEditing}>
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
            <Animated.View
              style={[
                styles.editContainer,
                {
                  opacity: editHeightAnimation,
                  transform: [
                    {
                      translateY: editHeightAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                  ],
                }
              ]}
            >
              <TextInput
                style={[
                  styles.editInput,
                  {
                    color: colors.text,
                    borderColor: colors.tint,
                    backgroundColor: colors.surface,
                    height: textInputHeight,
                  }
                ]}
                value={editedContent}
                onChangeText={setEditedContent}
                onContentSizeChange={handleContentSizeChange}
                multiline
                placeholder="Note content..."
                placeholderTextColor={colors.textSecondary}
                selectionColor={colors.tint}
                autoFocus
                textAlignVertical="top"
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
            </Animated.View>
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
    </Animated.View>
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
    marginTop: 16,
    marginHorizontal: -4,
  },
  editInput: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 150,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    justifyContent: 'flex-end',
  },
  editButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});