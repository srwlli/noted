import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { NoteForm } from './note-form';

interface NoteModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialNote?: {
    id?: string;
    title: string;
    content: string;
  };
}

export function NoteModal({ visible, onClose, onSuccess, initialNote }: NoteModalProps) {
  const { colors } = useThemeColors();

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          onPress={onClose}
          activeOpacity={1}
        >
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <NoteForm
                initialNote={initialNote}
                onSuccess={handleSuccess}
                onCancel={onClose}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
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
    paddingTop: 34, // Extra padding for safe area
    paddingHorizontal: 16,
    paddingBottom: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
});