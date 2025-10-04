import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface PrimaryAction {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

interface PrimaryActionRowProps {
  actions: PrimaryAction[];
  title?: string;
}

export function PrimaryActionRow({ actions, title }: PrimaryActionRowProps) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      {title && (
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      )}
      <View style={styles.row}>
      {actions.map((action, index) => {
        const iconColor = action.destructive ? '#dc2626' : colors.text;
        const textColor = action.destructive ? '#dc2626' : colors.text;

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.button,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              action.disabled && styles.disabled
            ]}
            onPress={action.onPress}
            disabled={action.disabled}
            activeOpacity={0.6}
          >
            <MaterialIcons
              name={action.icon}
              size={28}
              color={iconColor}
              style={action.disabled && styles.disabled}
            />
            <Text
              style={[
                styles.label,
                { color: textColor },
                action.disabled && styles.disabled
              ]}
            >
              {action.label}
            </Text>
          </TouchableOpacity>
        );
      })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
