import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface DownloadCardProps {
  isExpanded: boolean;
  onToggle: () => void;
}

type PlatformTab = 'ios' | 'android' | 'pc';

export function DownloadCard({ isExpanded, onToggle }: DownloadCardProps) {
  const { colors } = useThemeColors();
  const [activeTab, setActiveTab] = useState<PlatformTab>('pc');

  // Auto-detect device and set appropriate tab
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent;

      if (/iPhone|iPod|iPad/.test(userAgent)) {
        setActiveTab('ios');
      } else if (/Android/.test(userAgent)) {
        setActiveTab('android');
      } else {
        setActiveTab('pc');
      }
    }
  }, []);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Accordion Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name={isExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
          size={24}
          color={colors.textSecondary}
        />
        <Text style={[styles.title, { color: colors.text }]}>Download</Text>
      </TouchableOpacity>

      {/* Content Area - Only shown when expanded */}
      {isExpanded && (
        <View style={styles.content}>
          {/* Tab Headers */}
          <View style={[styles.tabHeaders, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'ios' && { borderBottomColor: colors.tint }
              ]}
              onPress={() => setActiveTab('ios')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'ios' ? colors.tint : colors.textSecondary },
                activeTab === 'ios' && styles.activeTabText
              ]}>
                iOS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'android' && { borderBottomColor: colors.tint }
              ]}
              onPress={() => setActiveTab('android')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'android' ? colors.tint : colors.textSecondary },
                activeTab === 'android' && styles.activeTabText
              ]}>
                Android
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'pc' && { borderBottomColor: colors.tint }
              ]}
              onPress={() => setActiveTab('pc')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'pc' ? colors.tint : colors.textSecondary },
                activeTab === 'pc' && styles.activeTabText
              ]}>
                PC
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'ios' && (
              <View>
                <Text style={[styles.instructionTitle, { color: colors.text }]}>
                  Install on iOS (Safari)
                </Text>
                <View style={styles.instructionsList}>
                  <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                    1. Open this page in Safari (not Chrome)
                  </Text>
                  <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                    2. Tap the Share button (⬆️) at the bottom
                  </Text>
                  <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                    3. Scroll down and tap "Add to Home Screen"
                  </Text>
                  <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                    4. Tap "Add" to confirm
                  </Text>
                  <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                    5. App will open without Safari UI
                  </Text>
                </View>
                <Text style={[styles.note, { color: colors.textSecondary }]}>
                  💡 Chrome on iOS only creates bookmarks, not standalone apps. Use Safari for best experience.
                </Text>
              </View>
            )}

            {activeTab === 'android' && (
              <View>
                <Text style={[styles.instructionTitle, { color: colors.text }]}>
                  Install on Android (Chrome)
                </Text>
                <View style={styles.instructionsList}>
                  <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                    1. Open this page in Chrome (recommended)
                  </Text>
                  <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                    2. Tap the menu (⋮) in top right
                  </Text>
                  <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                    3. Tap "Add to Home screen" or "Install app"
                  </Text>
                  <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                    4. Tap "Add" or "Install" to confirm
                  </Text>
                  <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                    5. App will open without browser UI
                  </Text>
                </View>
                <Text style={[styles.note, { color: colors.textSecondary }]}>
                  💡 This creates a standalone app! Works best in Chrome.
                </Text>
              </View>
            )}

            {activeTab === 'pc' && (
              <View>
                <Text style={[styles.instructionTitle, { color: colors.text }]}>
                  Install on Desktop (Windows/Mac/Linux)
                </Text>
                <View style={styles.instructionsList}>
                  <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                    • Open this page in Chrome or Edge
                  </Text>
                  <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                    • Look for install icon (⊞) in address bar
                  </Text>
                  <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                    • Or: Browser menu → More tools → Install app
                  </Text>
                  <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                    • Creates standalone app without browser UI
                  </Text>
                </View>
                <Text style={[styles.note, { color: colors.textSecondary }]}>
                  💡 Firefox and Safari have limited PWA support. Use Chrome or Edge for full PWA features.
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  tabHeaders: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '400',
  },
  activeTabText: {
    fontWeight: '600',
  },
  tabContent: {
    padding: 16,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  instructionsList: {
    marginBottom: 12,
  },
  instruction: {
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 4,
  },
  note: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
