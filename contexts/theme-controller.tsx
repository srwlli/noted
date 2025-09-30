import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeName, VALID_THEME_NAMES, DEFAULT_THEME_NAME, DEFAULT_COLOR_SCHEME } from '@/constants/theme';
import { ThemeStorage } from '@/lib/theme-storage';

export type ColorSchemeMode = 'light' | 'dark' | 'system';

interface ThemeControllerContextType {
  themeName: ThemeName;
  colorScheme: ColorSchemeMode;
  resolvedScheme: 'light' | 'dark';
  setTheme: (theme: ThemeName) => Promise<void>;
  setColorScheme: (scheme: ColorSchemeMode) => Promise<void>;
  isLoading: boolean;
  loadError: string | null;
}

const ThemeControllerContext = createContext<ThemeControllerContextType | null>(null);

interface ThemeControllerProviderProps {
  children: ReactNode;
}

export function ThemeControllerProvider({ children }: ThemeControllerProviderProps) {
  const [themeNameState, setThemeNameState] = useState<ThemeName>(DEFAULT_THEME_NAME);
  const [colorSchemeState, setColorSchemeState] = useState<ColorSchemeMode>(DEFAULT_COLOR_SCHEME);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const systemScheme = useColorScheme();

  // Load theme preferences from storage on mount
  useEffect(() => {
    async function loadThemePreferences() {
      try {
        const [storedColorScheme, storedThemeName] = await Promise.all([
          ThemeStorage.getColorScheme(),
          ThemeStorage.getThemeName()
        ]);

        if (storedColorScheme) {
          setColorSchemeState(storedColorScheme);
        }

        if (storedThemeName && VALID_THEME_NAMES.includes(storedThemeName)) {
          setThemeNameState(storedThemeName);
        }
      } catch (error) {
        const errorMessage = 'Failed to load theme preferences';
        console.warn(errorMessage, error);
        setLoadError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    loadThemePreferences();
  }, []);

  // Memoized theme functions to prevent re-renders
  const setTheme = useCallback(async (theme: ThemeName) => {
    try {
      await ThemeStorage.setThemeName(theme);
      setThemeNameState(theme);
    } catch (error) {
      console.warn('Failed to save theme name:', error);
    }
  }, []);

  const setColorScheme = useCallback(async (scheme: ColorSchemeMode) => {
    try {
      await ThemeStorage.setColorScheme(scheme);
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
    loadError,
  }), [themeNameState, colorSchemeState, resolvedScheme, setTheme, setColorScheme, isLoading, loadError]);

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