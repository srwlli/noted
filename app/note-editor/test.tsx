import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SharedPageLayout } from '@/components/shared-page-layout';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function MarkdownEditorTest() {
  const { colors } = useThemeColors();

  return (
    <SharedPageLayout scrollable={true}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          Markdown Editor Test Route
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          This is a placeholder for the markdown editor implementation.
        </Text>
        <Text style={[styles.info, { color: colors.textSecondary }]}>
          Phase 0: Development environment isolated successfully.
        </Text>
      </View>
    </SharedPageLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
  },
  info: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
