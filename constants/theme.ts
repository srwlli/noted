/**
 * Theme system for the Noted app.
 * Supports multiple themes with light/dark variants.
 */

import { Platform } from 'react-native';

export type ThemeName = 'greyscale' | 'appleNotes';

export const DEFAULT_THEME_NAME: ThemeName = 'greyscale';
export const DEFAULT_COLOR_SCHEME = 'system' as const;

interface ThemeMetadata {
  displayName: string;
  description: string;
  light: ColorScheme;
  dark: ColorScheme;
}

interface ColorScheme {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
}

export const Themes: Record<ThemeName, ThemeMetadata> = {
  greyscale: {
    displayName: 'Greyscale',
    description: 'Clean monochrome design',
    light: {
      background: '#fafafa',    // Light grey background (not white)
      surface: '#ffffff',       // Card/surface color
      text: '#1a1a1a',         // Primary text
      textSecondary: '#6a6a6a', // Secondary text
      border: '#e0e0e0',       // Borders and dividers
      tint: '#4a4a4a',         // Active elements
      icon: '#6a6a6a',         // Default icons
      tabIconDefault: '#6a6a6a',
      tabIconSelected: '#4a4a4a',
    },
    dark: {
      background: '#121212',    // Dark grey background (not black)
      surface: '#1e1e1e',       // Card/surface color
      text: '#f5f5f5',         // Primary text
      textSecondary: '#b0b0b0', // Secondary text
      border: '#333333',       // Borders and dividers
      tint: '#d0d0d0',         // Active elements
      icon: '#b0b0b0',         // Default icons
      tabIconDefault: '#b0b0b0',
      tabIconSelected: '#d0d0d0',
    },
  },
  appleNotes: {
    displayName: 'Apple Notes',
    description: 'Warm cream aesthetic inspired by iOS Notes',
    light: {
      background: '#fbf9f6',    // Apple Notes warm cream
      surface: '#ffffff',       // Pure white cards
      text: '#1c1c1e',         // Apple's primary text
      textSecondary: '#8e8e93', // Apple's secondary text
      border: '#d1d1d6',       // Apple's border color
      tint: '#007aff',         // Apple blue
      icon: '#8e8e93',         // Apple's icon color
      tabIconDefault: '#8e8e93',
      tabIconSelected: '#007aff',
    },
    dark: {
      background: '#1c1c1e',    // Apple's dark background
      surface: '#2c2c2e',       // Apple's dark surface
      text: '#ffffff',         // Primary text
      textSecondary: '#8e8e93', // Apple's secondary text (same in dark)
      border: '#48484a',       // Apple's dark border
      tint: '#0a84ff',         // Apple blue dark variant
      icon: '#8e8e93',         // Apple's icon color
      tabIconDefault: '#8e8e93',
      tabIconSelected: '#0a84ff',
    },
  },
};

// Valid theme names derived from Themes object
export const VALID_THEME_NAMES = Object.keys(Themes) as ThemeName[];

// Backward compatibility - defaults to greyscale theme
export const Colors = Themes[DEFAULT_THEME_NAME];

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
