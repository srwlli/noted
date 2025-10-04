import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { SharedPageLayout } from '@/components/shared-page-layout';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { PWADetector } from '@/components/PWADetector';
import { supabase } from '@/lib/supabase';
import { DownloadCard } from '@/components/info-cards/download-card';
import { QuickStartCard } from '@/components/info-cards/quick-start-card';
import { TechStackCard } from '@/components/info-cards/tech-stack-card';
import { ComingSoonCard } from '@/components/info-cards/coming-soon-card';
import { ContactCard } from '@/components/info-cards/contact-card';

export default function InfoScreen() {
  const { colors } = useThemeColors();
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const handleCardToggle = (cardId: string) => {
    if (expandedCard === cardId) {
      setExpandedCard(null);
    } else if (expandedCard !== null) {
      setExpandedCard(null);
      setTimeout(() => setExpandedCard(cardId), 200);
    } else {
      setExpandedCard(cardId);
    }
  };

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
        onToggle={() => handleCardToggle('download')}
      />

      <QuickStartCard
        isExpanded={expandedCard === 'quickstart'}
        onToggle={() => handleCardToggle('quickstart')}
      />

      <TechStackCard
        isExpanded={expandedCard === 'techstack'}
        onToggle={() => handleCardToggle('techstack')}
      />

      <ComingSoonCard
        isExpanded={expandedCard === 'comingsoon'}
        onToggle={() => handleCardToggle('comingsoon')}
      />

      <ContactCard
        isExpanded={expandedCard === 'contact'}
        onToggle={() => handleCardToggle('contact')}
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