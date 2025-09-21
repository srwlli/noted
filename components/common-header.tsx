import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface CommonHeaderProps {
  onNewNote?: () => void;
}

export function CommonHeader({ onNewNote }: CommonHeaderProps) {
  const { colors } = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.header,
      {
        backgroundColor: colors.background,
        borderBottomColor: colors.border,
        paddingTop: insets.top + 12
      }
    ]}>
      <Text style={[styles.branding, { color: colors.text }]}>noted</Text>
      {onNewNote && (
        <TouchableOpacity
          style={[styles.newButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={onNewNote}
        >
          <Text style={[styles.newButtonText, { color: colors.text }]}>+</Text>
        </TouchableOpacity>
      )}
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
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});