import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface PWAInstallCardMobileProps {
  style?: any;
}

export function PWAInstallCardMobile({ style }: PWAInstallCardMobileProps) {
  const { colors } = useThemeColors();
  const [isInstalled, setIsInstalled] = useState(false);
  const [browserType, setBrowserType] = useState<string>('');
  const [deviceType, setDeviceType] = useState<string>('');

  useEffect(() => {
    // Only run on web platform
    if (Platform.OS !== 'web') {
      return;
    }

    // Detect device and browser type
    const detectEnvironment = () => {
      if (typeof window !== 'undefined') {
        const userAgent = window.navigator.userAgent;

        // Detect device
        if (/iPhone|iPod/.test(userAgent)) {
          setDeviceType('iOS');
        } else if (/iPad/.test(userAgent)) {
          setDeviceType('iPad');
        } else if (/Android/.test(userAgent)) {
          setDeviceType('Android');
        } else {
          return; // Not mobile, don't show
        }

        // Detect browser
        if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
          setBrowserType('Safari');
        } else if (userAgent.includes('Chrome')) {
          setBrowserType('Chrome');
        } else if (userAgent.includes('Firefox')) {
          setBrowserType('Firefox');
        } else {
          setBrowserType('Browser');
        }
      }
    };

    // Check if app is already installed (mobile web app)
    const checkInstalled = () => {
      if (typeof window !== 'undefined') {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isInWebAppiOS = (window.navigator as any).standalone === true;
        setIsInstalled(isStandalone || isInWebAppiOS);
      }
    };

    detectEnvironment();
    checkInstalled();
  }, []);

  // Don't show if not on web platform, not mobile, already installed, or not mobile device
  if (Platform.OS !== 'web' || typeof window === 'undefined' || isInstalled || !deviceType) {
    return null;
  }

  const getInstallInstructions = () => {
    if (deviceType === 'iOS' || deviceType === 'iPad') {
      if (browserType === 'Safari') {
        return {
          title: 'Install on iOS (Safari)',
          instructions: [
            '1. Tap the Share button (⬆️) at the bottom',
            '2. Scroll down and tap "Add to Home Screen"',
            '3. Tap "Add" to confirm',
            '4. App will open without Safari UI'
          ],
          note: 'This creates a true standalone app!'
        };
      } else {
        return {
          title: 'Install on iOS',
          instructions: [
            '1. Open this page in Safari (not Chrome)',
            '2. Tap the Share button (⬆️) at the bottom',
            '3. Scroll down and tap "Add to Home Screen"',
            '4. Tap "Add" to confirm'
          ],
          note: 'Chrome on iOS only creates bookmarks, not standalone apps.'
        };
      }
    } else if (deviceType === 'Android') {
      if (browserType === 'Chrome') {
        return {
          title: 'Install on Android (Chrome)',
          instructions: [
            '1. Tap the menu (⋮) in Chrome',
            '2. Tap "Add to Home screen"',
            '3. Tap "Add" to confirm',
            '4. App will open without browser UI'
          ],
          note: 'This creates a standalone app!'
        };
      } else {
        return {
          title: 'Install on Android',
          instructions: [
            '1. Open this page in Chrome',
            '2. Tap the menu (⋮)',
            '3. Tap "Add to Home screen"',
            '4. Tap "Add" to confirm'
          ],
          note: 'Works best in Chrome for standalone app experience.'
        };
      }
    }

    return {
      title: 'Install Mobile App',
      instructions: [
        '1. Use your browser\'s menu',
        '2. Look for "Add to Home Screen" option',
        '3. Follow the prompts to install'
      ],
      note: 'Creates a shortcut for quick access.'
    };
  };

  const instructions = getInstallInstructions();
  const isOptimal = (deviceType === 'iOS' && browserType === 'Safari') ||
                   (deviceType === 'Android' && browserType === 'Chrome');

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        Mobile App Installation
      </Text>

      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]}>
            {instructions.title}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Add Noted to your home screen for app-like experience and offline access
          </Text>
        </View>

        <View style={[
          styles.statusBadge,
          {
            backgroundColor: isOptimal ? colors.tint : colors.background,
            borderColor: colors.border
          }
        ]}>
          <Text style={[
            styles.statusText,
            { color: isOptimal ? colors.background : colors.textSecondary }
          ]}>
            {isOptimal ? 'Optimal' : 'Available'}
          </Text>
        </View>
      </View>

      <View style={[styles.instructionsContainer, { borderTopColor: colors.border }]}>
        <Text style={[styles.instructionsTitle, { color: colors.text }]}>
          How to install:
        </Text>
        {instructions.instructions.map((instruction, index) => (
          <Text key={index} style={[styles.instruction, { color: colors.textSecondary }]}>
            {instruction}
          </Text>
        ))}
        <Text style={[styles.note, { color: colors.textSecondary }]}>
          💡 {instructions.note}
        </Text>
      </View>

      {!isOptimal && (
        <View style={[styles.recommendationContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.recommendationTitle, { color: colors.text }]}>
            For best experience:
          </Text>
          <Text style={[styles.recommendationText, { color: colors.textSecondary }]}>
            {deviceType === 'iOS'
              ? 'Use Safari for true standalone app installation'
              : 'Use Chrome for true standalone app installation'
            }
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
    marginBottom: 4,
  },
  note: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
    marginTop: 8,
  },
  recommendationContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  recommendationTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 12,
    lineHeight: 16,
  },
});