import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { CommonHeader } from '@/components/common-header';

interface SharedPageLayoutProps {
  children: React.ReactNode;
  onNewNote?: () => void;
  scrollable?: boolean;
}

export function SharedPageLayout({ children, onNewNote, scrollable = true }: SharedPageLayoutProps) {
  const { colors } = useThemeColors();

  const content = scrollable ? (
    <ScrollView style={styles.scrollContainer}>
      {children}
    </ScrollView>
  ) : (
    <View style={styles.container}>
      {children}
    </View>
  );

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <CommonHeader onNewNote={onNewNote} />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  container: {
    flex: 1,
    padding: 16,
  },
});