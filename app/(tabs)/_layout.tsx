import { Tabs } from 'expo-router';
import React from 'react';

import { MaterialIcons } from '@expo/vector-icons';
import { AuthGuard } from '@/components/auth-guard';
import { Colors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function TabLayout() {
  const { colorScheme } = useThemeColors();

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
