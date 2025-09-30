import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName } from '@/constants/theme';
import { ColorSchemeMode } from '@/contexts/theme-controller';

const KEYS = {
  THEME_NAME: '@noted_theme_name' as const,
  COLOR_SCHEME: '@noted_theme_preference' as const,
} as const;

export const ThemeStorage = {
  async getThemeName(): Promise<ThemeName | null> {
    const value = await AsyncStorage.getItem(KEYS.THEME_NAME);
    return value as ThemeName | null;
  },

  async setThemeName(name: ThemeName): Promise<void> {
    await AsyncStorage.setItem(KEYS.THEME_NAME, name);
  },

  async getColorScheme(): Promise<ColorSchemeMode | null> {
    const value = await AsyncStorage.getItem(KEYS.COLOR_SCHEME);
    return value as ColorSchemeMode | null;
  },

  async setColorScheme(scheme: ColorSchemeMode): Promise<void> {
    await AsyncStorage.setItem(KEYS.COLOR_SCHEME, scheme);
  },
};
