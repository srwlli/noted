import React, { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Invisible component that triggers PWA detection for Safari
 * This matches the behavior of PWAInstallCardMobile without showing UI
 */
export function PWADetector() {
  useEffect(() => {
    // Only run on web platform
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    // Same detection logic as PWAInstallCardMobile
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;

    // This detection seems to trigger Safari to properly handle PWA mode
    // Even though we don't use the result, the act of checking appears to matter
    const isPWAInstalled = isStandalone || isInWebAppiOS;

    // Optional: log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('PWA Detection:', {
        isStandalone,
        isInWebAppiOS,
        isPWAInstalled,
        userAgent: window.navigator.userAgent
      });
    }
  }, []);

  // Return null - this component is invisible
  return null;
}