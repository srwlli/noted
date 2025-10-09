import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Card } from '@/components/common/card';

interface TechStackCardProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function TechStackCard({ isExpanded, onToggle }: TechStackCardProps) {
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
          <Text style={[styles.title, { color: colors.text }]}>Tech Stack</Text>
        </>
      }
    >
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

          {/* Content & AI */}
          <View style={[styles.divider, { borderBottomColor: colors.border }]} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Content & AI</Text>
          <View style={styles.techList}>
            <View style={styles.techRow}>
              <Text style={[styles.techName, { color: colors.text }]}>React Markdown</Text>
              <Text style={[styles.techDescription, { color: colors.textSecondary }]}>
                Rich markdown rendering and preview
              </Text>
            </View>

            <View style={styles.techRow}>
              <Text style={[styles.techName, { color: colors.text }]}>Syntax Highlighter</Text>
              <Text style={[styles.techDescription, { color: colors.textSecondary }]}>
                Code blocks with language support
              </Text>
            </View>

            <View style={styles.techRow}>
              <Text style={[styles.techName, { color: colors.text }]}>Anthropic Claude</Text>
              <Text style={[styles.techDescription, { color: colors.textSecondary }]}>
                AI-powered features and assistance
              </Text>
            </View>

            <View style={styles.techRow}>
              <Text style={[styles.techName, { color: colors.text }]}>Perplexity API</Text>
              <Text style={[styles.techDescription, { color: colors.textSecondary }]}>
                Web research with citations
              </Text>
            </View>

            <View style={styles.techRow}>
              <Text style={[styles.techName, { color: colors.text }]}>Supabase Storage</Text>
              <Text style={[styles.techDescription, { color: colors.textSecondary }]}>
                Image and file uploads
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
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '600',
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
