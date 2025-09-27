import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { ThemeName } from '@/constants/theme';

const THEME_STORAGE_KEY = '@noted_theme_preference';
const THEME_NAME_STORAGE_KEY = '@noted_theme_name';

export type ColorSchemeMode = 'light' | 'dark' | 'system';

interface ThemeControllerContextType {
  themeName: ThemeName;
  colorScheme: ColorSchemeMode;
  resolvedScheme: 'light' | 'dark';
  setTheme: (theme: ThemeName) => Promise<void>;
  setColorScheme: (scheme: ColorSchemeMode) => Promise<void>;
  isLoading: boolean;
}

const ThemeControllerContext = createContext<ThemeControllerContextType | null>(null);

interface ThemeControllerProviderProps {
  children: ReactNode;
}

export function ThemeControllerProvider({ children }: ThemeControllerProviderProps) {
  const [themeNameState, setThemeNameState] = useState<ThemeName>('greyscale');
  const [colorSchemeState, setColorSchemeState] = useState<ColorSchemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);
  const systemScheme = useColorScheme();

  // Load theme preferences from storage on mount
  useEffect(() => {
    async function loadThemePreferences() {
      try {
        const [storedColorScheme, storedThemeName] = await Promise.all([
          AsyncStorage.getItem(THEME_STORAGE_KEY),
          AsyncStorage.getItem(THEME_NAME_STORAGE_KEY)
        ]);

        if (storedColorScheme && ['light', 'dark', 'system'].includes(storedColorScheme)) {
          setColorSchemeState(storedColorScheme as ColorSchemeMode);
        }

        if (storedThemeName && ['greyscale', 'appleNotes'].includes(storedThemeName)) {
          setThemeNameState(storedThemeName as ThemeName);
        }
      } catch (error) {
        console.warn('Failed to load theme preferences:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadThemePreferences();
  }, []);

  // Memoized theme functions to prevent re-renders
  const setTheme = useCallback(async (theme: ThemeName) => {
    try {
      await AsyncStorage.setItem(THEME_NAME_STORAGE_KEY, theme);
      setThemeNameState(theme);
    } catch (error) {
      console.warn('Failed to save theme name:', error);
    }
  }, []);

  const setColorScheme = useCallback(async (scheme: ColorSchemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
      setColorSchemeState(scheme);
    } catch (error) {
      console.warn('Failed to save color scheme:', error);
    }
  }, []);

  // Compute resolved scheme (actual theme to display)
  const resolvedScheme = useMemo(() => {
    if (colorSchemeState === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return colorSchemeState;
  }, [colorSchemeState, systemScheme]);

  // Memoized context value to prevent unnecessary re-renders
  const value: ThemeControllerContextType = useMemo(() => ({
    themeName: themeNameState,
    colorScheme: colorSchemeState,
    resolvedScheme,
    setTheme,
    setColorScheme,
    isLoading,
  }), [themeNameState, colorSchemeState, resolvedScheme, setTheme, setColorScheme, isLoading]);

  return (
    <ThemeControllerContext.Provider value={value}>
      {children}
    </ThemeControllerContext.Provider>
  );
}

export function useThemeController(): ThemeControllerContextType {
  const context = useContext(ThemeControllerContext);
  if (!context) {
    throw new Error('useThemeController must be used within a ThemeControllerProvider');
  }
  return context;
}