import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface LinkDialogModalProps {
  visible: boolean;
  selectedText?: string;
  onInsert: (text: string, url: string) => void;
  onCancel: () => void;
}

/**
 * Modal dialog for creating markdown links
 * Generates: [text](url)
 */
export function LinkDialogModal({ visible, selectedText = '', onInsert, onCancel }: LinkDialogModalProps) {
  const { colors } = useThemeColors();
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  // Pre-fill link text if text was selected
  useEffect(() => {
    if (visible && selectedText) {
      setLinkText(selectedText);
    }
  }, [visible, selectedText]);

  // Reset on close
  useEffect(() => {
    if (!visible) {
      setLinkText('');
      setLinkUrl('');
    }
  }, [visible]);

  const handleInsert = () => {
    if (linkText.trim() && linkUrl.trim()) {
      onInsert(linkText.trim(), linkUrl.trim());
      setLinkText('');
      setLinkUrl('');
    }
  };

  const handleCancel = () => {
    setLinkText('');
    setLinkUrl('');
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
            <MaterialIcons name="link" size={24} color={colors.tint} />
            <Text style={[styles.title, { color: colors.text }]}>Insert Link</Text>
          </View>

          {/* Link Text Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Link Text</Text>
            <TextInput
              value={linkText}
              onChangeText={setLinkText}
              placeholder="Enter link text"
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

          {/* URL Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>URL</Text>
            <TextInput
              value={linkUrl}
              onChangeText={setLinkUrl}
              placeholder="https://example.com"
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
                (!linkText.trim() || !linkUrl.trim()) && styles.buttonDisabled,
              ]}
              onPress={handleInsert}
              activeOpacity={0.7}
              disabled={!linkText.trim() || !linkUrl.trim()}
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
