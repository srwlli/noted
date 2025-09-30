import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useThemeController } from '@/contexts/theme-controller';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useAuth } from '@/hooks/use-auth';
import { SharedPageLayout } from '@/components/shared-page-layout';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { PWAInstallCardDesktop } from '@/components/PWAInstallCardDesktop';
import { PWAInstallCardMobile } from '@/components/PWAInstallCardMobile';
import { router } from 'expo-router';
import { Themes } from '@/constants/theme';

export default function SettingsScreen() {
  const { themeName, colorScheme, resolvedScheme, setTheme, setColorScheme, isLoading, loadError } = useThemeController();
  const { colors } = useThemeColors();
  const { signOut, user } = useAuth();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleThemeToggle = (value: boolean) => {
    setColorScheme(value ? 'dark' : 'light');
  };

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
      setShowSignOutModal(false);
    }
  };

  return (
    <SharedPageLayout scrollable={true}>
      {loadError && (
        <View style={[styles.errorBanner, { backgroundColor: colors.surface, borderColor: '#ff6b6b' }]}>
          <Text style={[styles.errorText, { color: '#ff6b6b' }]}>⚠️ {loadError}</Text>
          <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>
            Using default theme. Your preferences may not have loaded correctly.
          </Text>
        </View>
      )}

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Theme</Text>

        {/* Theme Selection */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Theme Style</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Choose your visual theme
            </Text>
          </View>
        </View>

        <View style={styles.themeOptions}>
          <TouchableOpacity
            style={[
              styles.themeOption,
              { borderColor: colors.border },
              themeName === 'greyscale' && { borderColor: colors.tint, backgroundColor: `${colors.tint}10` }
            ]}
            onPress={() => setTheme('greyscale')}
            disabled={isLoading}
          >
            <View style={[styles.themePreview, { backgroundColor: '#fafafa' }]}>
              <View style={[styles.themePreviewCard, { backgroundColor: '#ffffff', borderColor: '#e0e0e0' }]} />
              <View style={[styles.themePreviewText, { backgroundColor: '#4a4a4a' }]} />
            </View>
            <Text style={[styles.themeOptionText, { color: colors.text }]}>
              {Themes.greyscale.displayName}
            </Text>
            <Text style={[styles.themeOptionDesc, { color: colors.textSecondary }]}>
              {Themes.greyscale.description}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOption,
              { borderColor: colors.border },
              themeName === 'appleNotes' && { borderColor: colors.tint, backgroundColor: `${colors.tint}10` }
            ]}
            onPress={() => setTheme('appleNotes')}
            disabled={isLoading}
          >
            <View style={[styles.themePreview, { backgroundColor: '#fbf9f6' }]}>
              <View style={[styles.themePreviewCard, { backgroundColor: '#ffffff', borderColor: '#d1d1d6' }]} />
              <View style={[styles.themePreviewText, { backgroundColor: '#007aff' }]} />
            </View>
            <Text style={[styles.themeOptionText, { color: colors.text }]}>
              {Themes.appleNotes.displayName}
            </Text>
            <Text style={[styles.themeOptionDesc, { color: colors.textSecondary }]}>
              {Themes.appleNotes.description}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOption,
              { borderColor: colors.border },
              themeName === 'sepia' && { borderColor: colors.tint, backgroundColor: `${colors.tint}10` }
            ]}
            onPress={() => setTheme('sepia')}
            disabled={isLoading}
          >
            <View style={[styles.themePreview, { backgroundColor: '#f5f1e8' }]}>
              <View style={[styles.themePreviewCard, { backgroundColor: '#fdfcf7', borderColor: '#d4c7b3' }]} />
              <View style={[styles.themePreviewText, { backgroundColor: '#8b6f47' }]} />
            </View>
            <Text style={[styles.themeOptionText, { color: colors.text }]}>
              {Themes.sepia.displayName}
            </Text>
            <Text style={[styles.themeOptionDesc, { color: colors.textSecondary }]}>
              {Themes.sepia.description}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOption,
              { borderColor: colors.border },
              themeName === 'nord' && { borderColor: colors.tint, backgroundColor: `${colors.tint}10` }
            ]}
            onPress={() => setTheme('nord')}
            disabled={isLoading}
          >
            <View style={[styles.themePreview, { backgroundColor: '#eceff4' }]}>
              <View style={[styles.themePreviewCard, { backgroundColor: '#e5e9f0', borderColor: '#d8dee9' }]} />
              <View style={[styles.themePreviewText, { backgroundColor: '#5e81ac' }]} />
            </View>
            <Text style={[styles.themeOptionText, { color: colors.text }]}>
              {Themes.nord.displayName}
            </Text>
            <Text style={[styles.themeOptionDesc, { color: colors.textSecondary }]}>
              {Themes.nord.description}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOption,
              { borderColor: colors.border },
              themeName === 'bearRedGraphite' && { borderColor: colors.tint, backgroundColor: `${colors.tint}10` }
            ]}
            onPress={() => setTheme('bearRedGraphite')}
            disabled={isLoading}
          >
            <View style={[styles.themePreview, { backgroundColor: '#fafaf8' }]}>
              <View style={[styles.themePreviewCard, { backgroundColor: '#ffffff', borderColor: '#e0e0e0' }]} />
              <View style={[styles.themePreviewText, { backgroundColor: '#d4534f' }]} />
            </View>
            <Text style={[styles.themeOptionText, { color: colors.text }]}>
              {Themes.bearRedGraphite.displayName}
            </Text>
            <Text style={[styles.themeOptionDesc, { color: colors.textSecondary }]}>
              {Themes.bearRedGraphite.description}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dark Mode Toggle */}
        <View style={[styles.settingRow, { marginTop: 16 }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Current: {resolvedScheme} {colorScheme === 'system' ? '(auto)' : ''}
            </Text>
          </View>
          <Switch
            value={resolvedScheme === 'dark'}
            onValueChange={handleThemeToggle}
            disabled={isLoading}
            trackColor={{ false: colors.border, true: colors.tint }}
            thumbColor={resolvedScheme === 'dark' ? colors.surface : colors.background}
          />
        </View>
      </View>

      <PWAInstallCardDesktop />
      <PWAInstallCardMobile />

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Debug</Text>

        <View style={styles.debugRow}>
          <Text style={[styles.debugLabel, { color: colors.text }]}>Theme:</Text>
          <Text style={[styles.debugValue, { color: colors.textSecondary }]}>{themeName}</Text>
        </View>

        <View style={styles.debugRow}>
          <Text style={[styles.debugLabel, { color: colors.text }]}>Color Scheme:</Text>
          <Text style={[styles.debugValue, { color: colors.textSecondary }]}>{colorScheme}</Text>
        </View>

        <View style={styles.debugRow}>
          <Text style={[styles.debugLabel, { color: colors.text }]}>Resolved:</Text>
          <Text style={[styles.debugValue, { color: colors.textSecondary }]}>{resolvedScheme}</Text>
        </View>

        <View style={styles.debugRow}>
          <Text style={[styles.debugLabel, { color: colors.text }]}>Background:</Text>
          <Text style={[styles.debugValue, { color: colors.textSecondary }]}>{colors.background}</Text>
        </View>

        <View style={styles.debugRow}>
          <Text style={[styles.debugLabel, { color: colors.text }]}>User Email:</Text>
          <Text style={[styles.debugValue, { color: colors.textSecondary }]}>{user?.email || 'None'}</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>

        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={handleSignOut}
          disabled={isSigningOut}
        >
          <Text style={[styles.signOutText, { color: colors.text }]}>
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </Text>
        </TouchableOpacity>
      </View>

      <ConfirmationModal
        visible={showSignOutModal}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
        confirmStyle="destructive"
        onConfirm={confirmSignOut}
        onCancel={() => setShowSignOutModal(false)}
      />
    </SharedPageLayout>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
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
  themeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  themeOption: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  themePreview: {
    width: 60,
    height: 40,
    borderRadius: 8,
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  themePreviewCard: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
  },
  themePreviewText: {
    position: 'absolute',
    bottom: 6,
    left: 12,
    right: 20,
    height: 3,
    borderRadius: 1,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  themeOptionDesc: {
    fontSize: 12,
    textAlign: 'center',
  },
  errorBanner: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 14,
  },
});