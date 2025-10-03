import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toaster } from 'sonner-native';
import { MenuProvider } from 'react-native-popup-menu';
import 'react-native-reanimated';
import '../global.css';

import { ThemeControllerProvider, useThemeController } from '@/contexts/theme-controller';
import { AuthProvider } from '@/contexts/auth-context';
import { Themes } from '@/constants/theme';

// Removed anchor setting to prevent tab state conflicts
// This allows tabs to unmount/remount normally, clearing modal states
// export const unstable_settings = {
//   anchor: '(tabs)',
// };

function AppLayout() {
  const { resolvedScheme, themeName } = useThemeController();

  // Get colors from the selected theme
  const themeColors = Themes[themeName];
  const backgroundColor = resolvedScheme === 'dark' ? themeColors.dark.background : themeColors.light.background;

  // Create dynamic navigation themes based on selected theme
  const NotedLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: themeColors.light.tint,
      background: themeColors.light.background,
      card: themeColors.light.surface,
      text: themeColors.light.text,
      border: themeColors.light.border,
      notification: themeColors.light.text,
    },
  };

  const NotedDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: themeColors.dark.tint,
      background: themeColors.dark.background,
      card: themeColors.dark.surface,
      text: themeColors.dark.text,
      border: themeColors.dark.border,
      notification: themeColors.dark.text,
    },
  };

  // Enhanced PWA detection aligned with PC behavior
  React.useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Use unified detection method (same as PC)
      const checkAndApplyPWAMode = () => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        if (process.env.NODE_ENV === 'development') {
          console.log('PWA Detection:', {
            isStandalone,
            userAgent: navigator.userAgent,
            displayMode: window.matchMedia('(display-mode: standalone)').media,
            bodyClasses: document.body.className
          });
        }

        if (isStandalone) {
          document.body.classList.add('pwa-standalone');
          // Force hide address bar styles
          document.documentElement.style.setProperty('--pwa-standalone', '1');

          // Safari-specific PWA optimizations
          const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
          if (isSafari) {
            // iOS specific viewport handling
            const viewport = document.querySelector('meta[name=viewport]');
            if (viewport) {
              viewport.setAttribute('content',
                'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
              );
            }
          }
        } else {
          document.body.classList.remove('pwa-standalone');
        }

        return isStandalone;
      };

      // Initial check
      const initialResult = checkAndApplyPWAMode();

      // Retry mechanism for Safari timing issues
      if (!initialResult) {
        setTimeout(() => {
          checkAndApplyPWAMode();
        }, 250);
      }

      // Monitor for display mode changes (addresses reappearing navigation bars)
      const mediaQuery = window.matchMedia('(display-mode: standalone)');
      const handleDisplayModeChange = () => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Display mode changed, re-checking PWA mode');
        }
        checkAndApplyPWAMode();
      };

      mediaQuery.addEventListener('change', handleDisplayModeChange);

      return () => {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      };
    }
  }, []);

  return (
    <View style={{
      flex: 1,
      backgroundColor,
      // Ensure proper height on web
      ...(Platform.OS === 'web' && {
        minHeight: '100vh',
        width: '100%'
      })
    }}>
      <MenuProvider>
        <ThemeProvider value={resolvedScheme === 'dark' ? NotedDarkTheme : NotedLightTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
          <Toaster
            theme={resolvedScheme === 'dark' ? 'dark' : 'light'}
            position="bottom-center"
            richColors={true}
            closeButton={true}
          />
        </ThemeProvider>
      </MenuProvider>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeControllerProvider>
          <AuthProvider>
            <AppLayout />
          </AuthProvider>
        </ThemeControllerProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
