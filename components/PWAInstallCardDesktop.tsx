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

interface PWAInstallCardDesktopProps {
  style?: any;
}

export function PWAInstallCardDesktop({ style }: PWAInstallCardDesktopProps) {
  const { colors } = useThemeColors();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [browserType, setBrowserType] = useState<string>('');

  useEffect(() => {
    // Only run on web platform
    if (Platform.OS !== 'web') {
      return;
    }

    // Detect browser type
    const detectBrowser = () => {
      if (typeof window !== 'undefined') {
        const userAgent = window.navigator.userAgent;
        if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
          setBrowserType('Chrome');
        } else if (userAgent.includes('Edge')) {
          setBrowserType('Edge');
        } else if (userAgent.includes('Firefox')) {
          setBrowserType('Firefox');
        } else if (userAgent.includes('Safari')) {
          setBrowserType('Safari');
        } else {
          setBrowserType('Browser');
        }
      }
    };

    // Check if app is already installed
    const checkInstalled = () => {
      if (typeof window !== 'undefined') {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        setIsInstalled(isStandalone);
      }
    };

    detectBrowser();
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

  const getInstallInstructions = () => {
    switch (browserType) {
      case 'Chrome':
        return [
          '• Look for install icon (⊞) in address bar',
          '• Or: Chrome menu → More tools → Install app',
          '• Creates standalone app without browser UI'
        ];
      case 'Edge':
        return [
          '• Click install icon (⊞) in address bar',
          '• Or: Edge menu → Apps → Install this site as an app',
          '• Creates standalone app without browser UI'
        ];
      case 'Firefox':
        return [
          '• Firefox doesn\'t support PWA installation',
          '• You can bookmark the page for quick access',
          '• Consider using Chrome or Edge for full PWA features'
        ];
      case 'Safari':
        return [
          '• Safari on desktop has limited PWA support',
          '• You can bookmark the page for quick access',
          '• Consider using Chrome or Edge for full PWA features'
        ];
      default:
        return [
          '• Look for install or add to apps option in browser menu',
          '• Creates standalone app without browser UI',
          '• Works best in Chrome or Edge'
        ];
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        Desktop App Installation
      </Text>

      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]}>
            {canInstall ? 'Install Noted Desktop App' : `Install on ${browserType}`}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {canInstall
              ? 'Install as a standalone desktop app for the best experience'
              : 'Add Noted to your desktop for quick access and offline use'
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
              {browserType === 'Firefox' || browserType === 'Safari' ? 'Limited' : 'Available'}
            </Text>
          </View>
        )}
      </View>

      {!canInstall && (
        <View style={[styles.instructionsContainer, { borderTopColor: colors.border }]}>
          <Text style={[styles.instructionsTitle, { color: colors.text }]}>
            How to install:
          </Text>
          {getInstallInstructions().map((instruction, index) => (
            <Text key={index} style={[styles.instruction, { color: colors.textSecondary }]}>
              {instruction}
            </Text>
          ))}
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
});