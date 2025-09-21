import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <View className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex-row items-center justify-between">
      <View className="flex-1 mr-3">
        <Text className="font-semibold text-gray-900 mb-1">
          Install Noted
        </Text>
        <Text className="text-sm text-gray-600">
          Add to your home screen for quick access
        </Text>
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={handleDismiss}
          className="px-3 py-2 rounded border border-gray-300"
        >
          <Text className="text-gray-700 text-sm">Later</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleInstallClick}
          className="px-3 py-2 rounded bg-blue-600"
        >
          <Text className="text-white text-sm font-medium">Install</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}