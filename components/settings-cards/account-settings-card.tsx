import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Card } from '@/components/common/card';

interface AccountSettingsCardProps {
  isExpanded: boolean;
  onToggle: () => void;
  onSignOut: () => void;
  isSigningOut: boolean;
}

export function AccountSettingsCard({ isExpanded, onToggle, onSignOut, isSigningOut }: AccountSettingsCardProps) {
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        </>
      }
    >
      <TouchableOpacity
        style={[styles.signOutButton, { backgroundColor: colors.background, borderColor: colors.border }]}
        onPress={onSignOut}
        disabled={isSigningOut}
      >
        <Text style={[styles.signOutText, { color: colors.text }]}>
          {isSigningOut ? 'Signing Out...' : 'Sign Out'}
        </Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  signOutButton: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
