/**
 * Greyscale theme colors for the Noted app.
 * Uses light grey (#fafafa) and dark grey (#121212) backgrounds instead of pure white/black.
 */

import { Platform } from 'react-native';

export const Colors = {
  primary: '#4a4a4a', // Primary grey for buttons, links, etc.

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
};

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
