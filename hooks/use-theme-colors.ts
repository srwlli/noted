import { useTheme } from '@react-navigation/native';
import { Themes } from '@/constants/theme';
import { useThemeController } from '@/contexts/theme-controller';

/**
 * Hook that provides theme colors based on the selected theme and color scheme.
 * Returns computed theme colors from the active theme variant.
 */
export function useThemeColors() {
  const navigationTheme = useTheme();
  const { themeName } = useThemeController();
  const isDark = navigationTheme.dark;
  const colorScheme = isDark ? 'dark' : 'light';

  // Return colors from the selected theme variant
  const colors = Themes[themeName][colorScheme];

  return {
    colors,
    colorScheme,
    isDark,
    themeName,
  };
}