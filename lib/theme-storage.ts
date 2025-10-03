import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName, VALID_THEME_NAMES } from '@/constants/theme';
import { ColorSchemeMode } from '@/contexts/theme-controller';

const KEYS = {
  THEME_NAME: '@noted_theme_name' as const,
  COLOR_SCHEME: '@noted_theme_preference' as const,
} as const;

const VALID_COLOR_SCHEMES: ColorSchemeMode[] = ['light', 'dark', 'system'];

export const ThemeStorage = {
  async getThemeName(): Promise<ThemeName | null> {
    const value = await AsyncStorage.getItem(KEYS.THEME_NAME);
    // Validate stored value is a valid theme name
    if (value && VALID_THEME_NAMES.includes(value as ThemeName)) {
      return value as ThemeName;
    }
    return null;
  },

  async setThemeName(name: ThemeName): Promise<void> {
    await AsyncStorage.setItem(KEYS.THEME_NAME, name);
  },

  async getColorScheme(): Promise<ColorSchemeMode | null> {
    const value = await AsyncStorage.getItem(KEYS.COLOR_SCHEME);
    // Validate stored value is a valid color scheme
    if (value && VALID_COLOR_SCHEMES.includes(value as ColorSchemeMode)) {
      return value as ColorSchemeMode;
    }
    return null;
  },

  async setColorScheme(scheme: ColorSchemeMode): Promise<void> {
    await AsyncStorage.setItem(KEYS.COLOR_SCHEME, scheme);
  },
};
