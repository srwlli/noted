import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface CommonHeaderProps {
  onNewNote?: () => void;
}

export function CommonHeader({ onNewNote }: CommonHeaderProps) {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
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
    paddingTop: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
  },
  branding: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  newButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});