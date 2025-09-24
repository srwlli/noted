import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';
import { AuthGuard } from '@/components/auth-guard';
import { Colors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function TabLayout() {
  const { colorScheme } = useThemeColors();
  const isWeb = Platform.OS === 'web';

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme].tint,
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: Colors[colorScheme].surface,
            borderTopColor: Colors[colorScheme].border,
            // Add safe area padding for web PWA
            ...(isWeb && {
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
              height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
              position: 'relative' as const,
            }),
          },
        }}>
        <Tabs.Screen
          name="docs"
          options={{
            title: 'About',
            tabBarIcon: ({ color }) => <MaterialIcons size={28} name="info" color={color} />,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Notes',
            tabBarIcon: ({ color }) => <MaterialIcons size={28} name="description" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <MaterialIcons size={28} name="settings" color={color} />,
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
