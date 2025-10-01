import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
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
  const [showMenu, setShowMenu] = useState(false);


  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(note.content || '');
      Alert.alert('Copied', 'Note content copied to clipboard');
    } catch {
      Alert.alert('Error', 'Failed to copy content');
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
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
            <TouchableOpacity
              style={styles.iconButton}
              onPress={(e) => {
                e.stopPropagation();
                setShowMenu(true);
              }}
            >
              <MaterialIcons name="more-vert" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        {isExpanded && note.content && (
          <Text
            style={[styles.preview, { color: colors.textSecondary }]}
            selectable={true}
          >
            {note.content}
          </Text>
        )}
      </View>
      </TouchableOpacity>

      {showMenu && (
        <Modal transparent visible={showMenu} onRequestClose={() => setShowMenu(false)}>
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          >
            <View style={[styles.menuContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  onEdit?.();
                }}
              >
                <MaterialIcons name="edit" size={20} color={colors.text} />
                <Text style={[styles.menuText, { color: colors.text }]}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  handleCopy();
                }}
              >
                <MaterialIcons name="content-copy" size={20} color={colors.text} />
                <Text style={[styles.menuText, { color: colors.text }]}>Copy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  onDelete?.();
                }}
              >
                <MaterialIcons name="delete" size={20} color={colors.text} />
                <Text style={[styles.menuText, { color: colors.text }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
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
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
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
});