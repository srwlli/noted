import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Card } from '@/components/common/card';

interface ComingSoonCardProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function ComingSoonCard({ isExpanded, onToggle }: ComingSoonCardProps) {
  const { colors } = useThemeColors();

  return (
    <Card
      isAccordion={true}
      isExpanded={isExpanded}
      onToggle={onToggle}
      headerActive={isExpanded}
      headerContent={
        <>
          <MaterialIcons
            name={isExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
            size={24}
            color={colors.textSecondary}
          />
          <Text style={[styles.title, { color: colors.text }]}>Coming Soon</Text>
        </>
      }
    >
          <View style={styles.featureList}>
            <Text style={[styles.featureItem, { color: colors.text }]}>• Search Bar</Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>• Advanced Filters</Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>• Notifications</Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>• Sharing and Collaboration</Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>• More Export Formats (PDF, DOCX)</Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>• Private Notes</Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>• Data Abstraction</Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>• IDE Integration</Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>• n8n Automation</Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>• New Themes and Styles</Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>• More AI Features (Voice, Semantic Search)</Text>
          </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  featureList: {
    gap: 10,
  },
  featureItem: {
    fontSize: 15,
    lineHeight: 22,
  },
});
