import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface ComingSoonCardProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function ComingSoonCard({ isExpanded, onToggle }: ComingSoonCardProps) {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Accordion Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name={isExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
          size={24}
          color={colors.textSecondary}
        />
        <Text style={[styles.title, { color: colors.text }]}>Coming Soon</Text>
      </TouchableOpacity>

      {/* Content Area - Only shown when expanded */}
      {isExpanded && (
        <View style={styles.content}>
          <View style={styles.featureList}>
            <Text style={[styles.featureItem, { color: colors.text }]}>• Rich Text Editor</Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>• Sharing and Collaboration</Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>• IDE Integration</Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>• Exports</Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>• Private Notes</Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>• Data Abstraction</Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>• n8n Automation</Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>• New Themes and Styles</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    padding: 16,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  featureList: {
    gap: 10,
  },
  featureItem: {
    fontSize: 15,
    lineHeight: 22,
  },
});
