import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Link } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { PWAInstallCardDesktop } from '@/components/PWAInstallCardDesktop';
import { PWAInstallCardMobile } from '@/components/PWAInstallCardMobile';

export default function LandingPage() {
  const { colors } = useThemeColors();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <ThemedView style={styles.heroSection}>
        <View style={styles.heroContent}>
          <ThemedText style={styles.heroTitle}>
            Your Notes, Everywhere You Work
          </ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            The universal productivity hub that connects with your favorite apps, tools, and workflows.
            From personal notes to enterprise collaboration - one app, endless possibilities.
          </ThemedText>

          <View style={styles.heroButtons}>
            <Link href="/auth" asChild>
              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.tint }]}>
                <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                  Try Free
                </Text>
              </TouchableOpacity>
            </Link>

            <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.border }]}>
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                View Demo
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>

      {/* PWA Install Cards */}
      {Platform.OS === 'web' && (
        <ThemedView style={styles.installSection}>
          <PWAInstallCardDesktop />
          <PWAInstallCardMobile />
        </ThemedView>
      )}

      {/* User Segments Section */}
      <ThemedView style={styles.segmentsSection}>
        <ThemedText style={styles.sectionTitle}>
          Built for Every Workflow
        </ThemedText>

        <View style={styles.segmentsGrid}>
          <UserSegmentCard
            icon="👤"
            title="Personal"
            description="Individual productivity and personal knowledge management"
            features={["Cloud storage backups", "Apple ecosystem integration", "Personal automation"]}
            price="Free"
            colors={colors}
          />

          <UserSegmentCard
            icon="💼"
            title="Work"
            description="Professional productivity and team collaboration"
            features={["Slack & Teams integration", "Office suite connectivity", "Enterprise security"]}
            price="$9.99/month"
            colors={colors}
          />

          <UserSegmentCard
            icon="🎓"
            title="School"
            description="Academic success and learning tools"
            features={["LMS integration", "Study tools (Anki, Quizlet)", "Student pricing"]}
            price="$2.99/month"
            colors={colors}
          />

          <UserSegmentCard
            icon="⚡"
            title="Dev"
            description="Development workflows and code documentation"
            features={["Git integration", "IDE extensions", "API documentation"]}
            price="$7.99/month"
            colors={colors}
          />
        </View>
      </ThemedView>

      {/* Features Section */}
      <ThemedView style={styles.featuresSection}>
        <ThemedText style={styles.sectionTitle}>
          Powerful Features
        </ThemedText>

        <View style={styles.featuresGrid}>
          <FeatureCard
            icon="🔄"
            title="Universal Sync"
            description="Real-time synchronization across all your devices and platforms"
            colors={colors}
          />

          <FeatureCard
            icon="🔗"
            title="8,000+ Integrations"
            description="Connect with Google, Microsoft, Slack, GitHub, and thousands more via Zapier"
            colors={colors}
          />

          <FeatureCard
            icon="🌐"
            title="Works Everywhere"
            description="Progressive Web App that works offline on mobile, desktop, and web"
            colors={colors}
          />

          <FeatureCard
            icon="🔒"
            title="Secure & Private"
            description="Enterprise-grade security with row-level database protection"
            colors={colors}
          />
        </View>
      </ThemedView>

      {/* Integrations Showcase */}
      <ThemedView style={styles.integrationsSection}>
        <ThemedText style={styles.sectionTitle}>
          Integrates with Your Favorite Apps
        </ThemedText>

        <View style={styles.integrationsGrid}>
          {['Google Drive', 'Microsoft Office', 'Slack', 'GitHub', 'Notion', 'Canvas', 'Anki', 'Zapier'].map((app, index) => (
            <View key={index} style={[styles.integrationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <ThemedText style={styles.integrationName}>{app}</ThemedText>
            </View>
          ))}
        </View>

        <ThemedText style={[styles.integrationsNote, { color: colors.textSecondary }]}>
          + 8,000 more apps via automation platforms
        </ThemedText>
      </ThemedView>

      {/* CTA Section */}
      <ThemedView style={styles.ctaSection}>
        <ThemedText style={styles.ctaTitle}>
          Ready to Transform Your Productivity?
        </ThemedText>
        <ThemedText style={styles.ctaSubtitle}>
          Join thousands of users who've made Noted their productivity hub
        </ThemedText>

        <Link href="/auth" asChild>
          <TouchableOpacity style={[styles.ctaButton, { backgroundColor: colors.tint }]}>
            <Text style={[styles.ctaButtonText, { color: colors.background }]}>
              Get Started Free
            </Text>
          </TouchableOpacity>
        </Link>
      </ThemedView>

      {/* Footer */}
      <ThemedView style={[styles.footer, { borderTopColor: colors.border }]}>
        <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
          © 2025 Noted App. Built with Claude Code.
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

interface UserSegmentCardProps {
  icon: string;
  title: string;
  description: string;
  features: string[];
  price: string;
  colors: any;
}

function UserSegmentCard({ icon, title, description, features, price, colors }: UserSegmentCardProps) {
  return (
    <View style={[styles.segmentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={styles.segmentIcon}>{icon}</Text>
      <ThemedText style={styles.segmentTitle}>{title}</ThemedText>
      <ThemedText style={[styles.segmentDescription, { color: colors.textSecondary }]}>
        {description}
      </ThemedText>

      <View style={styles.segmentFeatures}>
        {features.map((feature, index) => (
          <ThemedText key={index} style={[styles.segmentFeature, { color: colors.textSecondary }]}>
            • {feature}
          </ThemedText>
        ))}
      </View>

      <View style={styles.segmentPricing}>
        <ThemedText style={styles.segmentPrice}>{price}</ThemedText>
        {title === 'School' && (
          <ThemedText style={[styles.segmentPriceNote, { color: colors.textSecondary }]}>
            Student verified
          </ThemedText>
        )}
      </View>
    </View>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  colors: any;
}

function FeatureCard({ icon, title, description, colors }: FeatureCardProps) {
  return (
    <View style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <ThemedText style={styles.featureTitle}>{title}</ThemedText>
      <ThemedText style={[styles.featureDescription, { color: colors.textSecondary }]}>
        {description}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
    paddingVertical: Platform.OS === 'web' ? 80 : 60,
    alignItems: 'center',
  },
  heroContent: {
    maxWidth: 800,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: Platform.OS === 'web' ? 48 : 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: Platform.OS === 'web' ? 56 : 42,
  },
  heroSubtitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 28,
    opacity: 0.8,
  },
  heroButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 120,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  installSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  segmentsSection: {
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
    paddingVertical: Platform.OS === 'web' ? 80 : 60,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 48,
  },
  segmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  segmentCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    width: Platform.OS === 'web' ? 280 : '100%',
    maxWidth: 320,
    minHeight: 320,
    margin: 12,
  },
  segmentIcon: {
    fontSize: 32,
    marginBottom: 16,
  },
  segmentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  segmentDescription: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  segmentFeatures: {
    flex: 1,
    marginBottom: 20,
  },
  segmentFeature: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  segmentPricing: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  segmentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  segmentPriceNote: {
    fontSize: 12,
    marginTop: 4,
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featureCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    width: Platform.OS === 'web' ? 240 : '100%',
    maxWidth: 280,
    alignItems: 'center',
    margin: 12,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  integrationsSection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  integrationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  integrationCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 120,
    alignItems: 'center',
    margin: 8,
  },
  integrationName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  integrationsNote: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  ctaSection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  ctaButton: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
});