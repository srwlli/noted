import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { ThemeControllerProvider, useThemeController } from '@/contexts/theme-controller';
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

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <ThemeProvider value={resolvedScheme === 'dark' ? NotedDarkTheme : NotedLightTheme}>
        <Stack key={resolvedScheme}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
      <AppLayout />
    </ThemeControllerProvider>
  );
}
