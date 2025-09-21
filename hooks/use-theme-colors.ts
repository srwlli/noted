import { useTheme } from '@react-navigation/native';
import { Colors } from '@/constants/theme';

/**
 * Hook that bridges React Navigation themes with our custom color system.
 * Returns computed theme colors based on the current navigation theme.
 */
export function useThemeColors() {
  const navigationTheme = useTheme();
  const isDark = navigationTheme.dark;
  const colorScheme = isDark ? 'dark' : 'light';

  // Return our custom colors based on the current scheme
  const colors = Colors[colorScheme];

  return {
    colors,
    colorScheme,
    isDark,
  };
}