import React, { useRef, useEffect } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
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
    ]).start(() => onClose());
  };

  useEffect(() => {
    if (visible) {
      slideIn();
    }
  }, [visible]);

  const handleSuccess = () => {
    onSuccess();
    slideOut();
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
              <NoteForm
                initialNote={initialNote}
                onSuccess={handleSuccess}
                onCancel={slideOut}
              />
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