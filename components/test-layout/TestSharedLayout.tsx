import React from 'react';
import { View, ScrollView, StyleSheet, Platform, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { CommonHeader } from '@/components/common-header';

interface TestSharedLayoutProps {
  children: React.ReactNode;
  onNewNote?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  variant?: 'fixed' | 'flex' | 'grid';
}

// Strategy 1: Fixed Positioning (Web PWA optimized)
export function TestSharedLayout({
  children,
  onNewNote,
  onRefresh,
  refreshing,
  variant = 'fixed'
}: TestSharedLayoutProps) {
  const { colors } = useThemeColors();
  const isWeb = Platform.OS === 'web';

  // Fixed positioning approach - best for PWA
  if (variant === 'fixed' && isWeb) {
    return (
      <View style={[styles.fixedContainer, { backgroundColor: colors.background }]}>
        {/* Fixed Header */}
        <View style={[styles.fixedHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <CommonHeader onNewNote={onNewNote} onRefresh={onRefresh} refreshing={refreshing} />
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.fixedContent}
          contentContainerStyle={styles.fixedContentInner}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing || false}
                onRefresh={onRefresh}
                colors={[colors.tint]}
                tintColor={colors.tint}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  // Flexbox approach
  if (variant === 'flex') {
    return (
      <SafeAreaView
        style={[styles.flexContainer, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        {/* Header */}
        <View style={[styles.flexHeader, { borderBottomColor: colors.border }]}>
          <CommonHeader onNewNote={onNewNote} onRefresh={onRefresh} refreshing={refreshing} />
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.flexContent}
          contentContainerStyle={styles.flexContentInner}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing || false}
                onRefresh={onRefresh}
                colors={[colors.tint]}
                tintColor={colors.tint}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // CSS Grid approach (Web only)
  if (variant === 'grid' && isWeb) {
    return (
      <View style={[styles.gridContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.gridHeader, { borderBottomColor: colors.border }]}>
          <CommonHeader onNewNote={onNewNote} onRefresh={onRefresh} refreshing={refreshing} />
        </View>

        <ScrollView
          style={styles.gridContent}
          contentContainerStyle={styles.gridContentInner}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing || false}
                onRefresh={onRefresh}
                colors={[colors.tint]}
                tintColor={colors.tint}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  // Default fallback - use flex for native
  return (
    <SafeAreaView
      style={[styles.flexContainer, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={[styles.flexHeader, { borderBottomColor: colors.border }]}>
        <CommonHeader onNewNote={onNewNote} onRefresh={onRefresh} refreshing={refreshing} />
      </View>

      <ScrollView
        style={styles.flexContent}
        contentContainerStyle={styles.flexContentInner}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing || false}
              onRefresh={onRefresh}
              colors={[colors.tint]}
              tintColor={colors.tint}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Fixed Positioning Styles (PWA optimized)
  fixedContainer: {
    flex: 1,
    height: '100vh',
    width: '100%',
    position: 'relative' as any,
  },
  fixedHeader: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: 'env(safe-area-inset-top, 0px)',
    borderBottomWidth: 1,
  },
  fixedContent: {
    flex: 1,
    paddingTop: 'calc(60px + env(safe-area-inset-top, 0px))', // Header height + safe area
    paddingBottom: 'calc(60px + env(safe-area-inset-bottom, 0px))', // Tab bar height + safe area
  },
  fixedContentInner: {
    padding: 16,
    paddingBottom: 20,
  },

  // Flexbox Styles
  flexContainer: {
    flex: 1,
    height: '100vh',
    display: 'flex' as any,
    flexDirection: 'column' as any,
  },
  flexHeader: {
    flexShrink: 0,
    borderBottomWidth: 1,
  },
  flexContent: {
    flex: 1,
    overflow: 'auto' as any,
  },
  flexContentInner: {
    padding: 16,
    paddingBottom: 80, // Account for tab bar
  },

  // CSS Grid Styles (Web only)
  gridContainer: {
    height: '100vh',
    width: '100%',
    display: 'grid' as any,
    gridTemplateRows: 'auto 1fr' as any,
    gridTemplateAreas: '"header" "content"' as any,
  },
  gridHeader: {
    gridArea: 'header' as any,
    paddingTop: 'env(safe-area-inset-top, 0px)',
    borderBottomWidth: 1,
  },
  gridContent: {
    gridArea: 'content' as any,
    overflow: 'auto' as any,
    paddingBottom: 'calc(60px + env(safe-area-inset-bottom, 0px))', // Tab bar space
  },
  gridContentInner: {
    padding: 16,
    paddingBottom: 20,
  },
});