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

    // Unified detection logic matching PC behavior (working approach)
    const checkPWAMode = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

      // Optional: log for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('PWA Detection (Unified):', {
          isStandalone,
          userAgent: window.navigator.userAgent,
          timestamp: new Date().toISOString()
        });
      }

      return isStandalone;
    };

    // Initial check
    const initialCheck = checkPWAMode();

    // Add retry mechanism for Safari timing issues
    let retryCount = 0;
    const maxRetries = 3;

    const retryCheck = () => {
      if (retryCount < maxRetries) {
        setTimeout(() => {
          const retryResult = checkPWAMode();
          if (retryResult !== initialCheck) {
            console.log('PWA Detection changed on retry:', retryResult);
          }
          retryCount++;
          if (retryCount < maxRetries) {
            retryCheck();
          }
        }, 100 * (retryCount + 1)); // Increasing delay
      }
    };

    if (!initialCheck) {
      retryCheck();
    }
  }, []);

  // Return null - this component is invisible
  return null;
}