import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useThemeController } from '@/contexts/theme-controller';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useAuth } from '@/hooks/use-auth';
import { SharedPageLayout } from '@/components/shared-page-layout';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { ThemePickerModal } from '@/components/theme-picker-modal';
import { router } from 'expo-router';
import { Themes } from '@/constants/theme';

export default function SettingsScreen() {
  const { themeName, colorScheme, resolvedScheme, setTheme, setColorScheme, isLoading, loadError } = useThemeController();
  const { colors } = useThemeColors();
  const { signOut, user } = useAuth();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

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

        <TouchableOpacity
          style={[styles.themeSelectorButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowThemePicker(true)}
          disabled={isLoading}
        >
          <View style={styles.currentThemePreview}>
            <View style={[styles.previewDot, { backgroundColor: colors.background, borderColor: colors.border }]} />
            <View style={[styles.previewDot, { backgroundColor: colors.surface, borderColor: colors.border }]} />
            <View style={[styles.previewDot, { backgroundColor: colors.tint, borderColor: colors.border }]} />
          </View>

          <View style={styles.themeSelectorInfo}>
            <Text style={[styles.themeSelectorValue, { color: colors.text }]}>
              {Themes[themeName].displayName}
            </Text>
            <Text style={[styles.themeSelectorDesc, { color: colors.textSecondary }]} numberOfLines={1}>
              {Themes[themeName].description}
            </Text>
          </View>

          <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>


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

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Profile</Text>

        <View style={styles.debugRow}>
          <Text style={[styles.debugLabel, { color: colors.text }]}>Email:</Text>
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

      <ThemePickerModal
        visible={showThemePicker}
        currentTheme={themeName}
        onSelectTheme={setTheme}
        onClose={() => setShowThemePicker(false)}
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
  themeSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 12,
  },
  currentThemePreview: {
    flexDirection: 'row',
    gap: 6,
    marginRight: 12,
  },
  previewDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeSelectorInfo: {
    flex: 1,
  },
  themeSelectorValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  themeSelectorDesc: {
    fontSize: 14,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
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