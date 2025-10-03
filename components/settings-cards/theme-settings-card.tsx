import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeController, ColorSchemeMode } from '@/contexts/theme-controller';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Card } from '@/components/common/card';
import { Themes } from '@/constants/theme';

interface ThemeSettingsCardProps {
  isExpanded: boolean;
  onToggle: () => void;
  onOpenThemePicker: () => void;
}

export function ThemeSettingsCard({ isExpanded, onToggle, onOpenThemePicker }: ThemeSettingsCardProps) {
  const { themeName, colorScheme, resolvedScheme, setColorScheme, isLoading, loadError } = useThemeController();
  const { colors } = useThemeColors();

  const handleColorSchemeChange = (scheme: ColorSchemeMode) => {
    setColorScheme(scheme);
  };

  return (
    <Card
      isAccordion={true}
      isExpanded={isExpanded}
      onToggle={onToggle}
      headerContent={
        <>
          <MaterialIcons
            name={isExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
            size={24}
            color={colors.textSecondary}
          />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme</Text>
        </>
      }
    >
      {loadError && (
        <View style={[styles.errorBanner, { backgroundColor: colors.surface, borderColor: '#ff6b6b' }]}>
          <Text style={[styles.errorText, { color: '#ff6b6b' }]}>⚠️ {loadError}</Text>
          <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>
            Using default theme. Your preferences may not have loaded correctly.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.themeSelectorButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={onOpenThemePicker}
        disabled={isLoading}
      >
        <View style={styles.currentThemePreview}>
          <View style={[styles.previewDot, { backgroundColor: colors.background, borderColor: colors.border }]} />
          <View style={[styles.previewDot, { backgroundColor: colors.surface, borderColor: colors.border }]} />
          <View style={[styles.previewDot, { backgroundColor: colors.tint, borderColor: colors.border }]} />
        </View>

        <View style={styles.themeSelectorInfo}>
          <Text style={[styles.themeSelectorValue, { color: colors.text }]}>
            {Themes[themeName].displayName}
          </Text>
          <Text style={[styles.themeSelectorDesc, { color: colors.textSecondary }]} numberOfLines={1}>
            {Themes[themeName].description}
          </Text>
        </View>

        <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
      </TouchableOpacity>

      <View style={[styles.settingRow, { marginTop: 16 }]}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>Appearance</Text>
      </View>

      <View style={[styles.segmentedControl, { borderColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            styles.segmentButtonLeft,
            { borderColor: colors.border },
            colorScheme === 'light' && { backgroundColor: colors.tint },
          ]}
          onPress={() => handleColorSchemeChange('light')}
          disabled={isLoading}
        >
          <MaterialIcons
            name="light-mode"
            size={18}
            color={colorScheme === 'light' ? colors.surface : colors.text}
          />
          <Text
            style={[
              styles.segmentText,
              { color: colorScheme === 'light' ? colors.surface : colors.text },
            ]}
          >
            Light
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentButton,
            styles.segmentButtonMiddle,
            { borderColor: colors.border },
            colorScheme === 'system' && { backgroundColor: colors.tint },
          ]}
          onPress={() => handleColorSchemeChange('system')}
          disabled={isLoading}
        >
          <MaterialIcons
            name="brightness-auto"
            size={18}
            color={colorScheme === 'system' ? colors.surface : colors.text}
          />
          <Text
            style={[
              styles.segmentText,
              { color: colorScheme === 'system' ? colors.surface : colors.text },
            ]}
          >
            System
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentButton,
            styles.segmentButtonRight,
            { borderColor: colors.border },
            colorScheme === 'dark' && { backgroundColor: colors.tint },
          ]}
          onPress={() => handleColorSchemeChange('dark')}
          disabled={isLoading}
        >
          <MaterialIcons
            name="dark-mode"
            size={18}
            color={colorScheme === 'dark' ? colors.surface : colors.text}
          />
          <Text
            style={[
              styles.segmentText,
              { color: colorScheme === 'dark' ? colors.surface : colors.text },
            ]}
          >
            Dark
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.settingDescription, { color: colors.textSecondary, marginTop: 8 }]}>
        {colorScheme === 'system'
          ? `Currently using ${resolvedScheme} mode (automatic)`
          : `${colorScheme.charAt(0).toUpperCase() + colorScheme.slice(1)} mode`}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  errorBanner: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 14,
  },
  themeSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 12,
  },
  currentThemePreview: {
    flexDirection: 'row',
    gap: 6,
    marginRight: 12,
  },
  previewDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeSelectorInfo: {
    flex: 1,
  },
  themeSelectorValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  themeSelectorDesc: {
    fontSize: 14,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    overflow: 'hidden',
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 6,
  },
  segmentButtonLeft: {
    borderTopLeftRadius: 9,
    borderBottomLeftRadius: 9,
  },
  segmentButtonMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  segmentButtonRight: {
    borderTopRightRadius: 9,
    borderBottomRightRadius: 9,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
