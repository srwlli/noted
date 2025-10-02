import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';

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
        <Text style={[styles.title, { color: colors.text }]}>Contact</Text>
      </TouchableOpacity>

      {/* Content Area - Only shown when expanded */}
      {isExpanded && (
        <View style={styles.content}>
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
