import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface TechStackCardProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function TechStackCard({ isExpanded, onToggle }: TechStackCardProps) {
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
        <Text style={[styles.title, { color: colors.text }]}>Tech Stack</Text>
      </TouchableOpacity>

      {/* Content Area - Only shown when expanded */}
      {isExpanded && (
        <View style={styles.content}>
          {/* Frontend */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Frontend</Text>
          <View style={styles.techList}>
            <View style={styles.techRow}>
              <Text style={[styles.techName, { color: colors.text }]}>React Native</Text>
              <Text style={[styles.techDescription, { color: colors.textSecondary }]}>
                Cross-platform mobile framework
              </Text>
            </View>

            <View style={styles.techRow}>
              <Text style={[styles.techName, { color: colors.text }]}>Expo Router</Text>
              <Text style={[styles.techDescription, { color: colors.textSecondary }]}>
                File-based navigation
              </Text>
            </View>

            <View style={styles.techRow}>
              <Text style={[styles.techName, { color: colors.text }]}>TypeScript</Text>
              <Text style={[styles.techDescription, { color: colors.textSecondary }]}>
                Type-safe JavaScript
              </Text>
            </View>
          </View>

          {/* Backend */}
          <View style={[styles.divider, { borderBottomColor: colors.border }]} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Backend</Text>
          <View style={styles.techList}>
            <View style={styles.techRow}>
              <Text style={[styles.techName, { color: colors.text }]}>Supabase</Text>
              <Text style={[styles.techDescription, { color: colors.textSecondary }]}>
                Backend as a service
              </Text>
            </View>

            <View style={styles.techRow}>
              <Text style={[styles.techName, { color: colors.text }]}>PostgreSQL</Text>
              <Text style={[styles.techDescription, { color: colors.textSecondary }]}>
                Database with real-time subscriptions
              </Text>
            </View>

            <View style={styles.techRow}>
              <Text style={[styles.techName, { color: colors.text }]}>Authentication</Text>
              <Text style={[styles.techDescription, { color: colors.textSecondary }]}>
                Secure user auth via Supabase
              </Text>
            </View>
          </View>

          {/* UI/UX */}
          <View style={[styles.divider, { borderBottomColor: colors.border }]} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>UI/UX</Text>
          <View style={styles.techList}>
            <View style={styles.techRow}>
              <Text style={[styles.techName, { color: colors.text }]}>Custom Theming</Text>
              <Text style={[styles.techDescription, { color: colors.textSecondary }]}>
                Dynamic theme system with dark mode
              </Text>
            </View>

            <View style={styles.techRow}>
              <Text style={[styles.techName, { color: colors.text }]}>Material Icons</Text>
              <Text style={[styles.techDescription, { color: colors.textSecondary }]}>
                Icon library for UI elements
              </Text>
            </View>

            <View style={styles.techRow}>
              <Text style={[styles.techName, { color: colors.text }]}>Safe Area</Text>
              <Text style={[styles.techDescription, { color: colors.textSecondary }]}>
                Device-aware layout handling
              </Text>
            </View>
          </View>

          {/* PWA Features */}
          <View style={[styles.divider, { borderBottomColor: colors.border }]} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>PWA Features</Text>
          <View style={styles.techList}>
            <View style={styles.techRow}>
              <Text style={[styles.techName, { color: colors.text }]}>Progressive Web App</Text>
              <Text style={[styles.techDescription, { color: colors.textSecondary }]}>
                Install as standalone app
              </Text>
            </View>

            <View style={styles.techRow}>
              <Text style={[styles.techName, { color: colors.text }]}>Offline Support</Text>
              <Text style={[styles.techDescription, { color: colors.textSecondary }]}>
                Works without internet connection
              </Text>
            </View>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  techList: {
    gap: 12,
  },
  techRow: {
    gap: 4,
  },
  techName: {
    fontSize: 14,
    fontWeight: '500',
  },
  techDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    borderBottomWidth: 1,
    marginTop: 24,
    marginBottom: 16,
  },
});
