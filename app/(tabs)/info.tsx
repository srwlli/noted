import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { SharedPageLayout } from '@/components/shared-page-layout';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { PWADetector } from '@/components/PWADetector';
import { supabase } from '@/lib/supabase';

export default function InfoScreen() {
  const { colors } = useThemeColors();
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('notes').select('count', { count: 'exact', head: true });
      if (error) {
        setConnectionStatus(`Error: ${error.message}`);
      } else {
        setConnectionStatus('Connected ✅');
      }
    } catch (err) {
      setConnectionStatus(`Connection failed: ${err}`);
    }
  };

  return (
    <SharedPageLayout>
      <PWADetector />

      <Text style={[styles.statusText, { color: colors.textSecondary }]}>
        Supabase: {connectionStatus}
      </Text>
    </SharedPageLayout>
  );
}

const styles = StyleSheet.create({
  statusText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'monospace',
  },
});