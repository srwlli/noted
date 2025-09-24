import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { ThemeControllerProvider, useThemeController } from '@/contexts/theme-controller';
import { AuthProvider } from '@/contexts/auth-context';
import { Colors } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Custom themes that use our greyscale colors
const NotedLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.light.background,
    card: Colors.light.surface,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.text,
  },
};

const NotedDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.primary,
    background: Colors.dark.background,
    card: Colors.dark.surface,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.text,
  },
};

function AppLayout() {
  const { resolvedScheme } = useThemeController();
  const backgroundColor = resolvedScheme === 'dark' ? Colors.dark.background : Colors.light.background;

  // Add PWA standalone mode detection globally
  React.useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Force Safari to recognize PWA standalone mode consistently
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;

      if (isStandalone || isInWebAppiOS) {
        // Add a class to body for PWA-specific styling
        document.body.classList.add('pwa-standalone');

        // Ensure viewport is properly set for PWA
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport && !viewport.getAttribute('content')?.includes('viewport-fit=cover')) {
          viewport.setAttribute('content',
            'width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover'
          );
        }
      }
    }
  }, []);

  return (
    <View style={{
      flex: 1,
      backgroundColor,
      // Ensure proper height on web
      ...(Platform.OS === 'web' && {
        height: '100vh',
        overflow: 'hidden'
      })
    }}>
      <ThemeProvider value={resolvedScheme === 'dark' ? NotedDarkTheme : NotedLightTheme}>
        <Stack key={resolvedScheme}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeControllerProvider>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </ThemeControllerProvider>
  );
}
