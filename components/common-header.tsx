import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { router } from 'expo-router';

interface CommonHeaderProps {
  onNewNote?: () => void;
}

export function CommonHeader({ onNewNote }: CommonHeaderProps) {
  const { colors } = useThemeColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const handleNewNote = () => {
    if (onNewNote) {
      onNewNote();
    } else {
      router.push('/');
    }
  };

  return (
    <View style={[
      styles.header,
      {
        backgroundColor: colors.background,
        borderBottomColor: colors.border,
        // Use CSS safe area on web, native insets on mobile
        paddingTop: isWeb ? 'calc(env(safe-area-inset-top, 0px) + 12px)' : insets.top + 12,
        // Add horizontal safe areas for web
        ...(isWeb && {
          paddingLeft: 'max(env(safe-area-inset-left, 0px), 16px)',
          paddingRight: 'max(env(safe-area-inset-right, 0px), 16px)',
        })
      }
    ]}>
      <Text style={[styles.branding, { color: colors.text }]}>noted</Text>
      <TouchableOpacity
        style={[styles.newButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={handleNewNote}
      >
        <Text style={[styles.newButtonText, { color: colors.text }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  branding: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  newButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});