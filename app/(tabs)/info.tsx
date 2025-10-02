import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { SharedPageLayout } from '@/components/shared-page-layout';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { PWADetector } from '@/components/PWADetector';
import { supabase } from '@/lib/supabase';
import { DownloadCard } from '@/components/info-cards/download-card';
import { QuickStartCard } from '@/components/info-cards/quick-start-card';

export default function InfoScreen() {
  const { colors } = useThemeColors();
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

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

      <DownloadCard
        isExpanded={expandedCard === 'download'}
        onToggle={() => setExpandedCard(expandedCard === 'download' ? null : 'download')}
      />

      <QuickStartCard
        isExpanded={expandedCard === 'quickstart'}
        onToggle={() => setExpandedCard(expandedCard === 'quickstart' ? null : 'quickstart')}
      />

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