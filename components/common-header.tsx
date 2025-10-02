import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { router } from 'expo-router';

interface CommonHeaderProps {
  onNewNote?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function CommonHeader({ onNewNote, onRefresh, refreshing }: CommonHeaderProps) {
  const { colors } = useThemeColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const handleNewNote = () => {
    if (onNewNote) {
      onNewNote();
    } else {
      router.push('/?openModal=true');
    }
  };

  return (
    <View style={[
      styles.header,
      {
        backgroundColor: colors.background,
        borderBottomColor: colors.border,
        // Use CSS safe area on web, native insets on mobile
        paddingTop: isWeb ? 'calc(env(safe-area-inset-top, 0px) + 12px)' : insets.top + 12,
        // Add horizontal safe areas for web
        ...(isWeb && {
          paddingLeft: 'max(env(safe-area-inset-left, 0px), 16px)',
          paddingRight: 'max(env(safe-area-inset-right, 0px), 16px)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        })
      }
    ]}>
      <Text style={[styles.branding, { color: colors.text }]}>noted</Text>
      <View style={styles.buttonContainer}>
        {onRefresh && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: refreshing ? 0.6 : 1
              }
            ]}
            onPress={onRefresh}
            disabled={refreshing}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>⟳</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleNewNote}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  branding: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});