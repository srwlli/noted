import React from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { CommonHeader } from '@/components/common-header';

interface SharedPageLayoutProps {
  children: React.ReactNode;
  onNewNote?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  scrollable?: boolean;
}

export function SharedPageLayout({ children, onNewNote, onRefresh, refreshing, scrollable = true }: SharedPageLayoutProps) {
  const { colors } = useThemeColors();
  const isWeb = Platform.OS === 'web';

  const content = scrollable ? (
    <ScrollView
      style={[
        styles.scrollContainer,
        // Add safe area padding for web
        isWeb && {
          paddingLeft: 'max(env(safe-area-inset-left, 0px), 16px)',
          paddingRight: 'max(env(safe-area-inset-right, 0px), 16px)',
          // Add bottom padding to account for tab bar + safe area
          paddingBottom: 'calc(60px + env(safe-area-inset-bottom, 0px) + 16px)',
        }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.container,
        // Add safe area padding for web
        isWeb && {
          paddingLeft: 'max(env(safe-area-inset-left, 0px), 16px)',
          paddingRight: 'max(env(safe-area-inset-right, 0px), 16px)',
          // Add bottom padding to account for tab bar + safe area
          paddingBottom: 'calc(60px + env(safe-area-inset-bottom, 0px) + 16px)',
        }
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={[
      styles.wrapper,
      { backgroundColor: colors.background },
      // Full height container with proper overflow handling for PWA
      isWeb && styles.webWrapper
    ]}>
      <CommonHeader onNewNote={onNewNote} onRefresh={onRefresh} refreshing={refreshing} />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  webWrapper: {
    minHeight: '100vh',
    display: 'flex' as any,
    flexDirection: 'column' as any,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  container: {
    flex: 1,
    padding: 16,
  },
});