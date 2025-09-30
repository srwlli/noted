import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { ThemeName, Themes } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface ThemePickerModalProps {
  visible: boolean;
  currentTheme: ThemeName;
  onSelectTheme: (theme: ThemeName) => void;
  onClose: () => void;
}

interface ThemeCardProps {
  themeKey: ThemeName;
  theme: typeof Themes[ThemeName];
  isSelected: boolean;
  previewMode: 'light' | 'dark';
  onSelect: () => void;
}

function ThemeCard({ themeKey, theme, isSelected, previewMode, onSelect }: ThemeCardProps) {
  const colors = theme[previewMode];

  return (
    <TouchableOpacity
      style={[
        styles.themeCard,
        { borderColor: isSelected ? colors.tint : '#e0e0e0' },
        isSelected && { borderWidth: 3 }
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {/* Large Preview */}
      <View style={[styles.largePreview, { backgroundColor: colors.background }]}>
        <View style={[styles.previewSurface, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.previewText, { backgroundColor: colors.text }]} />
          <View style={[styles.previewText, { backgroundColor: colors.textSecondary }]} />
        </View>
        <View style={[styles.previewAccent, { backgroundColor: colors.tint }]} />
      </View>

      {/* Theme Info */}
      <View style={[styles.themeCardInfo, { backgroundColor: colors.surface }]}>
        <Text style={[styles.themeCardName, { color: colors.text }]}>{theme.displayName}</Text>
        <Text style={[styles.themeCardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
          {theme.description}
        </Text>

        {/* Selected Indicator */}
        {isSelected && (
          <View style={[styles.selectedBadge, { backgroundColor: colors.tint }]}>
            <Text style={styles.selectedText}>✓ Current</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export function ThemePickerModal({ visible, currentTheme, onSelectTheme, onClose }: ThemePickerModalProps) {
  const { colors } = useThemeColors();
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Theme</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Preview Mode Toggle */}
        <View style={styles.previewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              { borderColor: colors.border },
              previewMode === 'light' && { backgroundColor: colors.tint }
            ]}
            onPress={() => setPreviewMode('light')}
          >
            <Text style={[
              styles.toggleText,
              { color: previewMode === 'light' ? '#ffffff' : colors.text }
            ]}>
              ☀️ Light
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              { borderColor: colors.border },
              previewMode === 'dark' && { backgroundColor: colors.tint }
            ]}
            onPress={() => setPreviewMode('dark')}
          >
            <Text style={[
              styles.toggleText,
              { color: previewMode === 'dark' ? '#ffffff' : colors.text }
            ]}>
              🌙 Dark
            </Text>
          </TouchableOpacity>
        </View>

        {/* Theme Grid */}
        <ScrollView style={styles.themeGrid} contentContainerStyle={styles.gridContainer}>
          {Object.entries(Themes).map(([key, theme]) => (
            <ThemeCard
              key={key}
              themeKey={key as ThemeName}
              theme={theme}
              isSelected={currentTheme === key}
              previewMode={previewMode}
              onSelect={() => {
                onSelectTheme(key as ThemeName);
                onClose();
              }}
            />
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: '300',
  },
  previewToggle: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  themeGrid: {
    flex: 1,
    paddingHorizontal: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 40,
  },
  themeCard: {
    width: '47%',
    minWidth: 160,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  largePreview: {
    width: '100%',
    height: 120,
    position: 'relative',
    padding: 12,
  },
  previewSurface: {
    width: '80%',
    height: 60,
    borderRadius: 8,
    padding: 8,
    alignSelf: 'center',
    borderWidth: 1,
  },
  previewText: {
    height: 4,
    borderRadius: 2,
    marginBottom: 6,
    width: '100%',
  },
  previewAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
  },
  themeCardInfo: {
    padding: 12,
  },
  themeCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeCardDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  selectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
});
