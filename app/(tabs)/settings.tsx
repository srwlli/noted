import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useThemeController } from '@/contexts/theme-controller';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useAuth } from '@/hooks/use-auth';
import { SharedPageLayout } from '@/components/shared-page-layout';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { colorScheme, resolvedScheme, setColorScheme, isLoading } = useThemeController();
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
    <SharedPageLayout scrollable={false}>
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Theme</Text>

        <View style={styles.settingRow}>
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
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Debug</Text>

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
});