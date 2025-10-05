import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Card } from '@/components/common/card';

interface QuickStartCardProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function QuickStartCard({ isExpanded, onToggle }: QuickStartCardProps) {
  const { colors } = useThemeColors();

  return (
    <Card
      isAccordion={true}
      isExpanded={isExpanded}
      onToggle={onToggle}
      headerActive={isExpanded}
      headerContent={
        <>
          <MaterialIcons
            name={isExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
            size={24}
            color={colors.textSecondary}
          />
          <Text style={[styles.title, { color: colors.text }]}>Quick Start</Text>
        </>
      }
    >
          {/* Header Actions */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Header Actions</Text>
          <View style={styles.iconList}>
            <View style={styles.iconRow}>
              <Text style={[styles.icon, { color: colors.text }]}>⟳</Text>
              <View style={styles.iconInfo}>
                <Text style={[styles.iconTitle, { color: colors.text }]}>Refresh</Text>
                <Text style={[styles.iconDescription, { color: colors.textSecondary }]}>
                  Refresh notes list
                </Text>
              </View>
            </View>

            <View style={styles.iconRow}>
              <MaterialIcons name="folder" size={20} color={colors.text} style={styles.iconMaterial} />
              <View style={styles.iconInfo}>
                <Text style={[styles.iconTitle, { color: colors.text }]}>Folder</Text>
                <Text style={[styles.iconDescription, { color: colors.textSecondary }]}>
                  Select and manage folders
                </Text>
              </View>
            </View>

            <View style={styles.iconRow}>
              <Text style={[styles.icon, { color: colors.text }]}>+</Text>
              <View style={styles.iconInfo}>
                <Text style={[styles.iconTitle, { color: colors.text }]}>New Note</Text>
                <Text style={[styles.iconDescription, { color: colors.textSecondary }]}>
                  Create a new note
                </Text>
              </View>
            </View>
          </View>

          {/* Folder Actions */}
          <View style={[styles.divider, { borderBottomColor: colors.border }]} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Folder Actions</Text>
          <View style={styles.iconList}>
            <View style={styles.iconRow}>
              <Text style={[styles.icon, { color: colors.text }]}>⋮</Text>
              <View style={styles.iconInfo}>
                <Text style={[styles.iconTitle, { color: colors.text }]}>Edit Folder</Text>
                <Text style={[styles.iconDescription, { color: colors.textSecondary }]}>
                  Rename or delete folder
                </Text>
              </View>
            </View>
          </View>

          {/* Card Actions */}
          <View style={[styles.divider, { borderBottomColor: colors.border }]} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Card Actions</Text>
          <View style={styles.iconList}>
            <View style={styles.iconRow}>
              <Text style={[styles.icon, { color: colors.text }]}>⋮</Text>
              <View style={styles.iconInfo}>
                <Text style={[styles.iconTitle, { color: colors.text }]}>More</Text>
                <Text style={[styles.iconDescription, { color: colors.textSecondary }]}>
                  Access note and folder options
                </Text>
              </View>
            </View>

            <View style={styles.iconRow}>
              <MaterialIcons name="edit" size={20} color={colors.text} style={styles.iconMaterial} />
              <View style={styles.iconInfo}>
                <Text style={[styles.iconTitle, { color: colors.text }]}>Edit</Text>
                <Text style={[styles.iconDescription, { color: colors.textSecondary }]}>
                  Modify note or folder
                </Text>
              </View>
            </View>

            <View style={styles.iconRow}>
              <MaterialIcons name="delete" size={20} color={colors.text} style={styles.iconMaterial} />
              <View style={styles.iconInfo}>
                <Text style={[styles.iconTitle, { color: colors.text }]}>Delete</Text>
                <Text style={[styles.iconDescription, { color: colors.textSecondary }]}>
                  Remove note or folder
                </Text>
              </View>
            </View>
          </View>

          {/* Tab Bar Navigation */}
          <View style={[styles.divider, { borderBottomColor: colors.border }]} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tab Bar Navigation</Text>
          <View style={styles.iconList}>
            <View style={styles.iconRow}>
              <MaterialIcons name="info" size={20} color={colors.text} style={styles.iconMaterial} />
              <View style={styles.iconInfo}>
                <Text style={[styles.iconTitle, { color: colors.text }]}>Info</Text>
                <Text style={[styles.iconDescription, { color: colors.textSecondary }]}>
                  App information and guides
                </Text>
              </View>
            </View>

            <View style={styles.iconRow}>
              <MaterialIcons name="description" size={20} color={colors.text} style={styles.iconMaterial} />
              <View style={styles.iconInfo}>
                <Text style={[styles.iconTitle, { color: colors.text }]}>Notes</Text>
                <Text style={[styles.iconDescription, { color: colors.textSecondary }]}>
                  View and manage your notes
                </Text>
              </View>
            </View>

            <View style={styles.iconRow}>
              <MaterialIcons name="settings" size={20} color={colors.text} style={styles.iconMaterial} />
              <View style={styles.iconInfo}>
                <Text style={[styles.iconTitle, { color: colors.text }]}>Settings</Text>
                <Text style={[styles.iconDescription, { color: colors.textSecondary }]}>
                  Customize app preferences
                </Text>
              </View>
            </View>
          </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  iconList: {
    gap: 12,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  iconMaterial: {
    width: 28,
    textAlign: 'center',
  },
  iconInfo: {
    flex: 1,
  },
  iconTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  iconDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    borderBottomWidth: 1,
    marginTop: 24,
    marginBottom: 16,
  },
});
