import React, { useState } from 'react';
import { useThemeController } from '@/contexts/theme-controller';
import { useAuth } from '@/hooks/use-auth';
import { SharedPageLayout } from '@/components/shared-page-layout';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { ThemePickerModal } from '@/components/theme-picker-modal';
import { ThemeSettingsCard } from '@/components/settings-cards/theme-settings-card';
import { ProfileSettingsCard } from '@/components/settings-cards/profile-settings-card';
import { AccountSettingsCard } from '@/components/settings-cards/account-settings-card';
import { DevSettingsCard } from '@/components/settings-cards/dev-settings-card';
import { router } from 'expo-router';
import { toast } from 'sonner-native';

export default function SettingsScreen() {
  const { setTheme, themeName } = useThemeController();
  const { signOut } = useAuth();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { error } = await signOut();

      if (error) {
        toast.error('Failed to sign out. Please try again.');
      } else {
        router.replace('/auth');
      }
    } finally {
      setIsSigningOut(false);
      setShowSignOutModal(false);
    }
  };

  return (
    <SharedPageLayout scrollable={true}>
      <ThemeSettingsCard
        isExpanded={expandedCard === 'theme'}
        onToggle={() => setExpandedCard(expandedCard === 'theme' ? null : 'theme')}
        onOpenThemePicker={() => setShowThemePicker(true)}
      />
      <ProfileSettingsCard
        isExpanded={expandedCard === 'profile'}
        onToggle={() => setExpandedCard(expandedCard === 'profile' ? null : 'profile')}
      />
      <AccountSettingsCard
        isExpanded={expandedCard === 'account'}
        onToggle={() => setExpandedCard(expandedCard === 'account' ? null : 'account')}
        onSignOut={handleSignOut}
        isSigningOut={isSigningOut}
      />
      <DevSettingsCard
        isExpanded={expandedCard === 'developer'}
        onToggle={() => setExpandedCard(expandedCard === 'developer' ? null : 'developer')}
      />

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