import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/use-auth';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Card } from '@/components/common/card';

interface ProfileSettingsCardProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function ProfileSettingsCard({ isExpanded, onToggle }: ProfileSettingsCardProps) {
  const { user } = useAuth();
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile</Text>
        </>
      }
    >
      <View style={styles.debugRow}>
        <Text style={[styles.debugLabel, { color: colors.text }]}>Email:</Text>
        <Text style={[styles.debugValue, { color: colors.textSecondary }]}>{user?.email || 'None'}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  debugRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  debugLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  debugValue: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
});
