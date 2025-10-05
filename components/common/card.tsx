import React, { ReactNode } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';

/**
 * Universal card component that ensures consistent sizing and structure across the app.
 * Based on info card structure as the baseline standard.
 *
 * @example
 * // Accordion card (info page)
 * <Card
 *   isAccordion={true}
 *   isExpanded={isExpanded}
 *   onToggle={() => setExpanded(!isExpanded)}
 *   headerContent={
 *     <>
 *       <MaterialIcons name="chevron-right" />
 *       <Text>Title</Text>
 *     </>
 *   }
 * >
 *   <Text>Card content</Text>
 * </Card>
 *
 * @example
 * // Static card (settings page)
 * <Card
 *   isAccordion={false}
 *   headerContent={<Text>Settings Section</Text>}
 * >
 *   <View>Settings content always visible</View>
 * </Card>
 */

interface CardProps {
  /**
   * If true, content shows/hides based on isExpanded.
   * If false, content is always visible.
   * @default true
   */
  isAccordion?: boolean;

  /**
   * Controls content visibility (only used if isAccordion is true).
   * @default false
   */
  isExpanded?: boolean;

  /**
   * Called when header is tapped (only used if isAccordion is true).
   */
  onToggle?: () => void;

  /**
   * Content to display in header section.
   * Typically contains title, icons, buttons.
   */
  headerContent: ReactNode;

  /**
   * Content to display in body section.
   */
  children: ReactNode;

  /**
   * Optional custom styles for container.
   * Use sparingly to maintain consistency.
   */
  style?: ViewStyle;

  /**
   * If true, header background uses selectedSurface color.
   * Used to indicate active/expanded state.
   * @default false
   */
  headerActive?: boolean;
}

export function Card({
  isAccordion = true,
  isExpanded = false,
  onToggle,
  headerContent,
  children,
  style,
  headerActive = false,
}: CardProps) {
  const { colors } = useThemeColors();

  const shouldShowContent = isAccordion ? isExpanded : true;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {/* Header - Always visible */}
      {isAccordion && onToggle ? (
        <TouchableOpacity
          style={[
            styles.header,
            {
              borderBottomColor: colors.border,
              backgroundColor: headerActive ? colors.selectedSurface : colors.surface,
            }
          ]}
          onPress={onToggle}
          activeOpacity={0.7}
        >
          {headerContent}
        </TouchableOpacity>
      ) : (
        <View style={[
          styles.header,
          {
            borderBottomColor: colors.border,
            backgroundColor: headerActive ? colors.selectedSurface : colors.surface,
          }
        ]}>
          {headerContent}
        </View>
      )}

      {/* Content - Conditionally visible */}
      {shouldShowContent && children && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    borderBottomWidth: 1,
  },
  content: {
    padding: 16,
  },
});
