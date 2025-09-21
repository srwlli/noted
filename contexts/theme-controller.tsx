import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const THEME_STORAGE_KEY = '@noted_theme_preference';

export type ColorSchemeMode = 'light' | 'dark' | 'system';

interface ThemeControllerContextType {
  colorScheme: ColorSchemeMode;
  resolvedScheme: 'light' | 'dark';
  setColorScheme: (scheme: ColorSchemeMode) => Promise<void>;
  isLoading: boolean;
}

const ThemeControllerContext = createContext<ThemeControllerContextType | null>(null);

interface ThemeControllerProviderProps {
  children: ReactNode;
}

export function ThemeControllerProvider({ children }: ThemeControllerProviderProps) {
  const [colorSchemeState, setColorSchemeState] = useState<ColorSchemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);
  const systemScheme = useColorScheme();

  // Load theme preference from storage on mount
  useEffect(() => {
    async function loadThemePreference() {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored && ['light', 'dark', 'system'].includes(stored)) {
          setColorSchemeState(stored as ColorSchemeMode);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadThemePreference();
  }, []);

  // Memoized setColorScheme function to prevent re-renders
  const setColorScheme = useCallback(async (scheme: ColorSchemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
      setColorSchemeState(scheme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
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
    colorScheme: colorSchemeState,
    resolvedScheme,
    setColorScheme,
    isLoading,
  }), [colorSchemeState, resolvedScheme, setColorScheme, isLoading]);

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