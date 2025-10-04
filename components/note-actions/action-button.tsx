import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface ActionButtonProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

export function ActionButton({ icon, label, onPress, disabled = false, destructive = false }: ActionButtonProps) {
  const { colors } = useThemeColors();

  const textColor = destructive ? '#dc2626' : colors.text;
  const iconColor = destructive ? '#dc2626' : colors.text;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
    >
      <MaterialIcons
        name={icon}
        size={20}
        color={iconColor}
        style={disabled && styles.disabled}
      />
      <Text
        style={[
          styles.label,
          { color: textColor },
          disabled && styles.disabled
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
  },
  disabled: {
    opacity: 0.5,
  },
});
