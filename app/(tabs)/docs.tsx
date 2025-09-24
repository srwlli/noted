import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SharedPageLayout } from '@/components/shared-page-layout';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { PWADetector } from '@/components/PWADetector';
import { supabase } from '@/lib/supabase';

export default function DocsScreen() {
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

  const handleCardPress = (cardType: string) => {
    switch (cardType) {
      case 'git':
        Linking.openURL('https://github.com/srwlli/noted');
        break;
      default:
        console.log('Pressed:', cardType);
    }
  };

  return (
    <SharedPageLayout>
      <PWADetector />
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => handleCardPress('git')}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>Git</Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
          Version control and collaboration workflow
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => handleCardPress('readme')}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>README</Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
          Project documentation and setup instructions
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => handleCardPress('about')}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>About</Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
          Application details and technical information
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => handleCardPress('integrations')}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>Integrations</Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
          Third-party services and API connections
        </Text>
      </TouchableOpacity>

      <Text style={[styles.statusText, { color: colors.textSecondary }]}>
        Supabase: {connectionStatus}
      </Text>
    </SharedPageLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'monospace',
  },
});