import React from 'react';
import { View } from 'react-native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function LandingLayout() {
  const { colors, resolvedScheme } = useThemeColors();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
      <Slot />
    </View>
  );
}