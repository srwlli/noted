import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Card } from '@/components/common/card';
import { router } from 'expo-router';

interface DevSettingsCardProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function DevSettingsCard({ isExpanded, onToggle }: DevSettingsCardProps) {
  const { colors } = useThemeColors();

  return (
    <Card
      isAccordion={true}
      isExpanded={isExpanded}
      onToggle={onToggle}
      headerContent={
        <>
          <MaterialIcons
            name={isExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
            size={24}
            color={colors.textSecondary}
          />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Developer</Text>
        </>
      }
    >
      <TouchableOpacity
        style={[styles.devButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => router.push('/note-editor/test')}
      >
        <MaterialIcons name="science" size={20} color={colors.tint} />
        <Text style={[styles.devButtonText, { color: colors.text }]}>
          Test Markdown Editor
        </Text>
        <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  devButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  devButtonText: {
    fontSize: 16,
    flex: 1,
  },
});
