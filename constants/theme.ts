/**
 * Theme system for the Noted app.
 * Supports multiple themes with light/dark variants.
 */

import { Platform } from 'react-native';

export type ThemeName = 'monochrome' | 'ocean' | 'sepia' | 'nord' | 'crimson' | 'forest' | 'lavender' | 'amber' | 'midnight' | 'rose';

export const DEFAULT_THEME_NAME: ThemeName = 'monochrome';
export const DEFAULT_COLOR_SCHEME = 'system' as const;

interface ThemeMetadata {
  displayName: string;
  description: string;
  light: ColorScheme;
  dark: ColorScheme;
}

interface ColorScheme {
  // Original 9 fields (PRESERVED)
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;

  // New 9 fields (ADDED - Phase 2)
  elevatedSurface: string;
  selectedSurface: string;  // For selected/active item states
  overlay: string;
  hover: string;
  pressed: string;
  disabled: string;
  highlight: string;
  linkColor: string;
  accentSecondary: string;
}

export const Themes: Record<ThemeName, ThemeMetadata> = {
  monochrome: {
    displayName: 'Monochrome',
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
      elevatedSurface: '#f2f2f0',
      selectedSurface: '#e8e8e6',
      overlay: 'rgba(18, 18, 18, 0.5)',
      hover: '#ececec',
      pressed: '#e0e0e0',
      disabled: '#bcbcbc',
      highlight: '#ffeb3b',
      linkColor: '#0066cc',
      accentSecondary: '#6a6a6a',
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
      elevatedSurface: '#2a2a2a',
      selectedSurface: '#363636',
      overlay: 'rgba(0, 0, 0, 0.7)',
      hover: '#1a1a1a',
      pressed: '#0d0d0d',
      disabled: '#666666',
      highlight: '#ffeb3b',
      linkColor: '#5eb3ff',
      accentSecondary: '#b0b0b0',
    },
  },
  ocean: {
    displayName: 'Ocean',
    description: 'Vibrant teal aesthetic for refreshing design',
    light: {
      background: '#f0faf9',
      surface: '#ffffff',
      text: '#1a3d3a',
      textSecondary: '#4a7a75',
      border: '#d4f0ed',
      tint: '#14b8a6',
      icon: '#4a7a75',
      tabIconDefault: '#4a7a75',
      tabIconSelected: '#14b8a6',
      elevatedSurface: '#f7fcfb',
      selectedSurface: '#e0f5f3',
      overlay: 'rgba(26, 61, 58, 0.4)',
      hover: '#e0f5f3',
      pressed: '#c7ebe8',
      disabled: '#a5c9c6',
      highlight: '#ccf5f0',
      linkColor: '#14b8a6',
      accentSecondary: '#2dd4bf',
    },
    dark: {
      background: '#0f1f1e',
      surface: '#1a2d2b',
      text: '#e8f5f3',
      textSecondary: '#a5c9c6',
      border: '#2d4a47',
      tint: '#5eead4',
      icon: '#a5c9c6',
      tabIconDefault: '#a5c9c6',
      tabIconSelected: '#5eead4',
      elevatedSurface: '#243a37',
      selectedSurface: '#2e4744',
      overlay: 'rgba(0, 0, 0, 0.7)',
      hover: '#1f3330',
      pressed: '#152624',
      disabled: '#547a75',
      highlight: '#2d4a47',
      linkColor: '#5eead4',
      accentSecondary: '#14b8a6',
    },
  },
  sepia: {
    displayName: 'Sepia',
    description: 'Warm vintage aesthetic for comfortable reading',
    light: {
      background: '#f5f1e8',
      surface: '#fdfcf7',
      text: '#3d3226',
      textSecondary: '#6d5d4d',
      border: '#d4c7b3',
      tint: '#8b6f47',
      icon: '#6d5d4d',
      tabIconDefault: '#6d5d4d',
      tabIconSelected: '#8b6f47',
      elevatedSurface: '#fdfcf7',
      selectedSurface: '#f0e9dd',
      overlay: 'rgba(26, 22, 18, 0.4)',
      hover: '#ece6dc',
      pressed: '#e0d7ca',
      disabled: '#b8aea0',
      highlight: '#fff3d6',
      linkColor: '#8b6f47',
      accentSecondary: '#c4a576',
    },
    dark: {
      background: '#1a1612',
      surface: '#2a231d',
      text: '#e8e0d5',
      textSecondary: '#a89a88',
      border: '#3d352c',
      tint: '#c4a576',
      icon: '#a89a88',
      tabIconDefault: '#a89a88',
      tabIconSelected: '#c4a576',
      elevatedSurface: '#322a23',
      selectedSurface: '#3d342c',
      overlay: 'rgba(0, 0, 0, 0.7)',
      hover: '#2f2924',
      pressed: '#251f1a',
      disabled: '#6b5f55',
      highlight: '#3a322b',
      linkColor: '#c4a576',
      accentSecondary: '#9e8767',
    },
  },
  nord: {
    displayName: 'Nord',
    description: 'Cool Arctic-inspired palette for focused work',
    light: {
      background: '#eceff4',
      surface: '#e5e9f0',
      text: '#2e3440',
      textSecondary: '#4c566a',
      border: '#d8dee9',
      tint: '#5e81ac',
      icon: '#4c566a',
      tabIconDefault: '#4c566a',
      tabIconSelected: '#5e81ac',
      elevatedSurface: '#ffffff',
      selectedSurface: '#dde3eb',
      overlay: 'rgba(46, 52, 64, 0.4)',
      hover: '#dde3eb',
      pressed: '#cbd5e1',
      disabled: '#aeb6c3',
      highlight: '#dbe9f5',
      linkColor: '#5e81ac',
      accentSecondary: '#81a1c1',
    },
    dark: {
      background: '#2e3440',
      surface: '#3b4252',
      text: '#eceff4',
      textSecondary: '#d8dee9',
      border: '#4c566a',
      tint: '#88c0d0',
      icon: '#d8dee9',
      tabIconDefault: '#d8dee9',
      tabIconSelected: '#88c0d0',
      elevatedSurface: '#434c5e',
      selectedSurface: '#4c566a',
      overlay: 'rgba(0, 0, 0, 0.7)',
      hover: '#454d60',
      pressed: '#3a4150',
      disabled: '#6b7689',
      highlight: '#4c566a',
      linkColor: '#88c0d0',
      accentSecondary: '#81a1c1',
    },
  },
  crimson: {
    displayName: 'Crimson',
    description: 'Rich red aesthetic for bold design',
    light: {
      background: '#fef5f5',
      surface: '#ffffff',
      text: '#3d1a1a',
      textSecondary: '#7a4545',
      border: '#f0d4d4',
      tint: '#dc143c',
      icon: '#7a4545',
      tabIconDefault: '#7a4545',
      tabIconSelected: '#dc143c',
      elevatedSurface: '#fff9f9',
      selectedSurface: '#ffe8e8',
      overlay: 'rgba(61, 26, 26, 0.4)',
      hover: '#ffe8e8',
      pressed: '#ffd4d4',
      disabled: '#c9a5a5',
      highlight: '#ffe0e0',
      linkColor: '#dc143c',
      accentSecondary: '#ff6b7a',
    },
    dark: {
      background: '#1f1212',
      surface: '#2d1e1e',
      text: '#f5e8e8',
      textSecondary: '#c9a5a5',
      border: '#4a3030',
      tint: '#ff6b7a',
      icon: '#c9a5a5',
      tabIconDefault: '#c9a5a5',
      tabIconSelected: '#ff6b7a',
      elevatedSurface: '#3a2626',
      selectedSurface: '#4a3232',
      overlay: 'rgba(0, 0, 0, 0.7)',
      hover: '#332020',
      pressed: '#281818',
      disabled: '#6b5454',
      highlight: '#4a3030',
      linkColor: '#ff6b7a',
      accentSecondary: '#dc143c',
    },
  },
  forest: {
    displayName: 'Forest',
    description: 'Natural green aesthetic for calm and focused work',
    light: {
      background: '#f0f4f0',
      surface: '#ffffff',
      text: '#1a2419',
      textSecondary: '#4a5d47',
      border: '#d4dfd4',
      tint: '#6b8e5e',
      icon: '#4a5d47',
      tabIconDefault: '#4a5d47',
      tabIconSelected: '#6b8e5e',
      elevatedSurface: '#f5f9f5',
      selectedSurface: '#e8f0e8',
      overlay: 'rgba(26, 36, 25, 0.4)',
      hover: '#e8f0e8',
      pressed: '#d9e8d9',
      disabled: '#a5b5a3',
      highlight: '#d4f1d4',
      linkColor: '#6b8e5e',
      accentSecondary: '#8da87f',
    },
    dark: {
      background: '#1a2419',
      surface: '#243023',
      text: '#e8f0e8',
      textSecondary: '#a5b5a3',
      border: '#3a4738',
      tint: '#8da87f',
      icon: '#a5b5a3',
      tabIconDefault: '#a5b5a3',
      tabIconSelected: '#8da87f',
      elevatedSurface: '#2d3a2c',
      selectedSurface: '#364433',
      overlay: 'rgba(0, 0, 0, 0.7)',
      hover: '#2a3828',
      pressed: '#1f2a1e',
      disabled: '#5a6659',
      highlight: '#3a4738',
      linkColor: '#8da87f',
      accentSecondary: '#6b8e5e',
    },
  },
  lavender: {
    displayName: 'Lavender',
    description: 'Soft purple aesthetic for creative work',
    light: {
      background: '#f5f3f8',
      surface: '#ffffff',
      text: '#1e1a24',
      textSecondary: '#5d5466',
      border: '#e0d9e8',
      tint: '#9b7fb5',
      icon: '#5d5466',
      tabIconDefault: '#5d5466',
      tabIconSelected: '#9b7fb5',
      elevatedSurface: '#f9f7fc',
      selectedSurface: '#ede8f4',
      overlay: 'rgba(30, 26, 36, 0.4)',
      hover: '#ede8f4',
      pressed: '#dfd6ea',
      disabled: '#b3a5bf',
      highlight: '#e8d9f5',
      linkColor: '#9b7fb5',
      accentSecondary: '#b699cc',
    },
    dark: {
      background: '#1e1a24',
      surface: '#2a2430',
      text: '#f0ecf5',
      textSecondary: '#b3a5bf',
      border: '#3d3447',
      tint: '#b699cc',
      icon: '#b3a5bf',
      tabIconDefault: '#b3a5bf',
      tabIconSelected: '#b699cc',
      elevatedSurface: '#342f3d',
      selectedSurface: '#3e3847',
      overlay: 'rgba(0, 0, 0, 0.7)',
      hover: '#2f2838',
      pressed: '#241f2b',
      disabled: '#5a4f66',
      highlight: '#3d3447',
      linkColor: '#b699cc',
      accentSecondary: '#9b7fb5',
    },
  },
  amber: {
    displayName: 'Amber',
    description: 'Warm amber tones for energetic focus',
    light: {
      background: '#fef5f0',
      surface: '#ffffff',
      text: '#2d1f14',
      textSecondary: '#6b5444',
      border: '#e8d9cc',
      tint: '#d87a3a',
      icon: '#6b5444',
      tabIconDefault: '#6b5444',
      tabIconSelected: '#d87a3a',
      elevatedSurface: '#fefaf7',
      selectedSurface: '#f7ede5',
      overlay: 'rgba(45, 31, 20, 0.4)',
      hover: '#f7ede5',
      pressed: '#eddfd0',
      disabled: '#b8a594',
      highlight: '#ffe4cc',
      linkColor: '#d87a3a',
      accentSecondary: '#e69960',
    },
    dark: {
      background: '#1f1810',
      surface: '#2b2219',
      text: '#f5ebe0',
      textSecondary: '#b8a594',
      border: '#3d3128',
      tint: '#e69960',
      icon: '#b8a594',
      tabIconDefault: '#b8a594',
      tabIconSelected: '#e69960',
      elevatedSurface: '#352a20',
      selectedSurface: '#3f3428',
      overlay: 'rgba(0, 0, 0, 0.7)',
      hover: '#322722',
      pressed: '#261f18',
      disabled: '#6b5d50',
      highlight: '#3d3128',
      linkColor: '#e69960',
      accentSecondary: '#d87a3a',
    },
  },
  midnight: {
    displayName: 'Midnight',
    description: 'True black for OLED screens and maximum contrast',
    light: {
      background: '#f5f5f7',
      surface: '#ffffff',
      text: '#1c1c1e',
      textSecondary: '#6e6e73',
      border: '#d1d1d6',
      tint: '#00d4ff',
      icon: '#6e6e73',
      tabIconDefault: '#6e6e73',
      tabIconSelected: '#00d4ff',
      elevatedSurface: '#fafafa',
      selectedSurface: '#ebebf0',
      overlay: 'rgba(28, 28, 30, 0.4)',
      hover: '#ebebf0',
      pressed: '#d9d9de',
      disabled: '#aeaeb2',
      highlight: '#ccf5ff',
      linkColor: '#00d4ff',
      accentSecondary: '#5eb3ff',
    },
    dark: {
      background: '#000000',
      surface: '#1c1c1e',
      text: '#ffffff',
      textSecondary: '#98989d',
      border: '#38383a',
      tint: '#00d4ff',
      icon: '#98989d',
      tabIconDefault: '#98989d',
      tabIconSelected: '#00d4ff',
      elevatedSurface: '#2c2c2e',
      selectedSurface: '#3a3a3c',
      overlay: 'rgba(0, 0, 0, 0.9)',
      hover: '#2c2c2e',
      pressed: '#1c1c1e',
      disabled: '#48484a',
      highlight: '#003d4d',
      linkColor: '#00d4ff',
      accentSecondary: '#5eb3ff',
    },
  },
  rose: {
    displayName: 'Rose',
    description: 'Soft rose aesthetic for gentle, modern design',
    light: {
      background: '#fef5f7',
      surface: '#ffffff',
      text: '#2d1a1f',
      textSecondary: '#6b4a54',
      border: '#e8d4d9',
      tint: '#c76b7a',
      icon: '#6b4a54',
      tabIconDefault: '#6b4a54',
      tabIconSelected: '#c76b7a',
      elevatedSurface: '#fefafa',
      selectedSurface: '#f7e8eb',
      overlay: 'rgba(45, 26, 31, 0.4)',
      hover: '#f7e8eb',
      pressed: '#edd9de',
      disabled: '#b8a5a9',
      highlight: '#ffd9e0',
      linkColor: '#c76b7a',
      accentSecondary: '#d98c99',
    },
    dark: {
      background: '#1f1719',
      surface: '#2b2022',
      text: '#f5e8eb',
      textSecondary: '#b8a5a9',
      border: '#3d3135',
      tint: '#d98c99',
      icon: '#b8a5a9',
      tabIconDefault: '#b8a5a9',
      tabIconSelected: '#d98c99',
      elevatedSurface: '#352a2d',
      selectedSurface: '#3f3336',
      overlay: 'rgba(0, 0, 0, 0.7)',
      hover: '#322528',
      pressed: '#261d20',
      disabled: '#6b5a5e',
      highlight: '#3d3135',
      linkColor: '#d98c99',
      accentSecondary: '#c76b7a',
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
