import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface ImageDialogModalProps {
  visible: boolean;
  selectedText?: string;
  onInsert: (alt: string, url: string) => void;
  onCancel: () => void;
}

/**
 * Modal dialog for inserting markdown images
 * Generates: ![alt](url)
 */
export function ImageDialogModal({ visible, selectedText = '', onInsert, onCancel }: ImageDialogModalProps) {
  const { colors } = useThemeColors();
  const [altText, setAltText] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Pre-fill alt text if text was selected
  useEffect(() => {
    if (visible && selectedText) {
      setAltText(selectedText);
    }
  }, [visible, selectedText]);

  // Reset on close
  useEffect(() => {
    if (!visible) {
      setAltText('');
      setImageUrl('');
    }
  }, [visible]);

  const handleInsert = () => {
    if (altText.trim() && imageUrl.trim()) {
      onInsert(altText.trim(), imageUrl.trim());
      setAltText('');
      setImageUrl('');
    }
  };

  const handleCancel = () => {
    setAltText('');
    setImageUrl('');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleCancel}
        />
        <View style={[styles.modal, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialIcons name="image" size={24} color={colors.tint} />
            <Text style={[styles.title, { color: colors.text }]}>Insert Image</Text>
          </View>

          {/* Alt Text Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Alt Text (Description)</Text>
            <TextInput
              value={altText}
              onChangeText={setAltText}
              placeholder="Image description"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              autoFocus={!selectedText}
            />
          </View>

          {/* Image URL Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Image URL</Text>
            <TextInput
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor={colors.textSecondary}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              autoFocus={!!selectedText}
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.background }]}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.insertButton,
                { backgroundColor: colors.tint },
                (!altText.trim() || !imageUrl.trim()) && styles.buttonDisabled,
              ]}
              onPress={handleInsert}
              activeOpacity={0.7}
              disabled={!altText.trim() || !imageUrl.trim()}
            >
              <Text style={[styles.buttonText, styles.insertButtonText]}>Insert</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  insertButton: {
    // Tint background applied via inline style
  },
  insertButtonText: {
    color: '#FFFFFF',
  },
});
