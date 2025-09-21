import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SharedPageLayout } from '@/components/shared-page-layout';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function DocsScreen() {
  const { colors } = useThemeColors();

  const handleCardPress = (cardType: string) => {
    console.log('Pressed:', cardType);
  };

  return (
    <SharedPageLayout>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => handleCardPress('git')}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>Git</Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
          Version control and collaboration workflow
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => handleCardPress('readme')}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>README</Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
          Project documentation and setup instructions
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => handleCardPress('about')}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>About</Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
          Application details and technical information
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => handleCardPress('integrations')}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>Integrations</Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
          Third-party services and API connections
        </Text>
      </TouchableOpacity>
    </SharedPageLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});