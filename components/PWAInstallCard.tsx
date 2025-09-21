import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallCardProps {
  style?: any;
}

export function PWAInstallCard({ style }: PWAInstallCardProps) {
  const { colors } = useThemeColors();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Only run PWA logic on web platform
    if (Platform.OS !== 'web') {
      return;
    }

    // Check if app is already installed
    const checkInstalled = () => {
      if (typeof window !== 'undefined') {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isInWebAppiOS = (window.navigator as any).standalone === true;
        setIsInstalled(isStandalone || isInWebAppiOS);
      }
    };

    checkInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setCanInstall(false);
      }
    } catch (error) {
      console.error('Install prompt error:', error);
    } finally {
      setDeferredPrompt(null);
    }
  };

  // Don't show if not on web platform, not in browser, or already installed
  if (Platform.OS !== 'web' || typeof window === 'undefined' || isInstalled) {
    return null;
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>App Installation</Text>

      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]}>
            {canInstall ? 'Install Noted' : 'PWA Available'}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {canInstall
              ? 'Add Noted to your home screen for quick access and offline use'
              : 'This app can be installed as a Progressive Web App'
            }
          </Text>
        </View>

        {canInstall ? (
          <TouchableOpacity
            style={[styles.installButton, { backgroundColor: colors.tint }]}
            onPress={handleInstallClick}
          >
            <Text style={[styles.installButtonText, { color: colors.background }]}>
              Install App
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.statusBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              Available
            </Text>
          </View>
        )}
      </View>

      {!canInstall && (
        <View style={styles.instructionsContainer}>
          <Text style={[styles.instructionsTitle, { color: colors.text }]}>
            How to install for standalone mode:
          </Text>
          <Text style={[styles.instruction, { color: colors.textSecondary }]}>
            • Chrome: Look for install icon (⊞) in address bar
          </Text>
          <Text style={[styles.instruction, { color: colors.textSecondary }]}>
            • Chrome Menu: More tools → Install app
          </Text>
          <Text style={[styles.instruction, { color: colors.textSecondary }]}>
            • Edge: Click install icon (⊞) in address bar
          </Text>
          <Text style={[styles.warningText, { color: colors.textSecondary }]}>
            Note: "Add to Home Screen" creates a bookmark with browser UI
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  info: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  installButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  installButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  instructionsContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 2,
  },
  warningText: {
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
    marginTop: 6,
  },
});