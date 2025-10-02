import React, { useRef, useEffect, useState } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Animated, Dimensions, Easing, TextInput, Text, Alert } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { foldersService } from '@/services/folders';

interface FolderModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialFolder?: {
    id?: string;
    name: string;
  };
}

export function FolderModal({ visible, onClose, onSuccess, initialFolder }: FolderModalProps) {
  const { colors } = useThemeColors();
  const [folderName, setFolderName] = useState(initialFolder?.name || '');
  const [saving, setSaving] = useState(false);
  const slideAnim = useRef(new Animated.Value(-Dimensions.get('window').height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const slideIn = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  };

  const slideOut = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -Dimensions.get('window').height,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
      setFolderName('');
    });
  };

  useEffect(() => {
    if (visible) {
      setFolderName(initialFolder?.name || '');
      slideIn();
    }
  }, [visible, initialFolder]);

  const handleSave = async () => {
    const trimmedName = folderName.trim();

    if (!trimmedName) {
      Alert.alert('Error', 'Folder name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      if (initialFolder?.id) {
        await foldersService.updateFolder(initialFolder.id, trimmedName);
      } else {
        await foldersService.createFolder(trimmedName);
      }
      onSuccess();
      slideOut();
    } catch (err) {
      console.error('Failed to save folder:', err);
      Alert.alert('Error', 'Failed to save folder');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={slideOut}
    >
      <Animated.View
        style={[
          styles.backdrop,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity: backdropOpacity
          }
        ]}
      >
        <TouchableOpacity
          style={styles.backdropTouchable}
          onPress={slideOut}
          activeOpacity={1}
        >
          <Animated.View
            style={[
              styles.modalContainer,
              {
                backgroundColor: colors.background,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={styles.formContainer}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {initialFolder?.id ? 'Rename Folder' : 'New Folder'}
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text
                    }
                  ]}
                  placeholder="Folder name"
                  placeholderTextColor={colors.textSecondary}
                  value={folderName}
                  onChangeText={setFolderName}
                  autoFocus
                  maxLength={255}
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.cancelButton,
                      { borderColor: colors.border }
                    ]}
                    onPress={slideOut}
                    disabled={saving}
                  >
                    <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.saveButton,
                      { backgroundColor: colors.tint }
                    ]}
                    onPress={handleSave}
                    disabled={saving || !folderName.trim()}
                  >
                    <Text style={[styles.buttonText, { color: '#fff' }]}>
                      {saving ? 'Saving...' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  backdropTouchable: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  modalContainer: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 34,
    paddingHorizontal: 12,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  formContainer: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
