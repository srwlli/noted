import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Card } from '@/components/common/card';

interface ContactCardProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function ContactCard({ isExpanded, onToggle }: ContactCardProps) {
  const { colors } = useThemeColors();

  const handleEmailPress = () => {
    Linking.openURL('mailto:will.hart.sr@icloud.com');
  };

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
          <Text style={[styles.title, { color: colors.text }]}>Contact</Text>
        </>
      }
    >
          <Text style={[styles.description, { color: colors.text }]}>
            Contact the team, report a bug or problem:
          </Text>

          <TouchableOpacity
            style={[styles.emailButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={handleEmailPress}
          >
            <MaterialIcons name="email" size={20} color={colors.text} />
            <Text style={[styles.emailText, { color: colors.text }]}>
              will.hart.sr@icloud.com
            </Text>
          </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  emailText: {
    fontSize: 15,
  },
});
