import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';
import { AuthGuard } from '@/components/auth-guard';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function TabLayout() {
  const { colorScheme, colors } = useThemeColors();
  const isWeb = Platform.OS === 'web';

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tint,
          headerShown: false,
          tabBarShowLabel: false,
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
          },
          sceneContainerStyle: {
            backgroundColor: colors.background,
          },
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            // Add safe area padding for web PWA
            ...(isWeb && {
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              height: 'calc(44px + env(safe-area-inset-bottom, 0px))',
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 999,
            }),
          },
        }}>
        <Tabs.Screen
          name="info"
          key="info-tab"
          options={{
            title: 'Info',
            tabBarIcon: ({ color }) => <MaterialIcons size={24} name="info" color={color} />,
          }}
        />
        <Tabs.Screen
          name="notes"
          key="notes-tab"
          options={{
            title: 'Notes',
            tabBarIcon: ({ color }) => <MaterialIcons size={24} name="description" color={color} />,
          }}
        />
        <Tabs.Screen
          name="index"
          key="index-tab"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="soon"
          key="soon-tab"
          options={{
            title: 'Soon',
            tabBarIcon: ({ color }) => <MaterialIcons size={24} name="schedule" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          key="settings-tab"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <MaterialIcons size={24} name="settings" color={color} />,
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
