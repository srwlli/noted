import React, { useState } from 'react';
import { useThemeController } from '@/contexts/theme-controller';
import { useAuth } from '@/hooks/use-auth';
import { SharedPageLayout } from '@/components/shared-page-layout';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { ThemePickerModal } from '@/components/theme-picker-modal';
import { ApiKeysModal } from '@/components/api-keys-modal';
import { ThemeSettingsCard } from '@/components/settings-cards/theme-settings-card';
import { ProfileSettingsCard } from '@/components/settings-cards/profile-settings-card';
import { AISettingsCard } from '@/components/settings-cards/ai-settings-card';
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
  const [showApiKeysModal, setShowApiKeysModal] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [aiRefreshTrigger, setAiRefreshTrigger] = useState(0);

  const handleCardToggle = (cardId: string) => {
    if (expandedCard === cardId) {
      setExpandedCard(null);
    } else if (expandedCard !== null) {
      setExpandedCard(null);
      setTimeout(() => setExpandedCard(cardId), 200);
    } else {
      setExpandedCard(cardId);
    }
  };

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

  const handleApiKeysUpdated = () => {
    setAiRefreshTrigger(prev => prev + 1);
  };

  return (
    <SharedPageLayout scrollable={true}>
      <ThemeSettingsCard
        isExpanded={expandedCard === 'theme'}
        onToggle={() => handleCardToggle('theme')}
        onOpenThemePicker={() => setShowThemePicker(true)}
      />
      <ProfileSettingsCard
        isExpanded={expandedCard === 'profile'}
        onToggle={() => handleCardToggle('profile')}
      />
      <AISettingsCard
        isExpanded={expandedCard === 'ai'}
        onToggle={() => handleCardToggle('ai')}
        onOpenApiKeys={() => setShowApiKeysModal(true)}
        refreshTrigger={aiRefreshTrigger}
      />
      <DevSettingsCard
        isExpanded={expandedCard === 'testing'}
        onToggle={() => handleCardToggle('testing')}
      />
      <AccountSettingsCard
        isExpanded={expandedCard === 'account'}
        onToggle={() => handleCardToggle('account')}
        onSignOut={handleSignOut}
        isSigningOut={isSigningOut}
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

      <ApiKeysModal
        visible={showApiKeysModal}
        onClose={() => setShowApiKeysModal(false)}
        onKeysUpdated={handleApiKeysUpdated}
      />
    </SharedPageLayout>
  );
}