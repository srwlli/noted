import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Card } from '@/components/common/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

interface AISettingsCardProps {
  isExpanded: boolean;
  onToggle: () => void;
  onOpenApiKeys: () => void;
  refreshTrigger?: number;
}

export function AISettingsCard({ isExpanded, onToggle, onOpenApiKeys, refreshTrigger }: AISettingsCardProps) {
  const { colors } = useThemeColors();
  const { user } = useAuth();
  const [hasKeys, setHasKeys] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isExpanded) {
      checkApiKeys();
    }
  }, [user, isExpanded, refreshTrigger]);

  const checkApiKeys = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_ai_keys')
        .select('anthropic_key, perplexity_key')
        .eq('user_id', user?.id)
        .single();

      if (!error && data) {
        const hasAnthropicKey = !!data.anthropic_key && data.anthropic_key.trim().length > 0;
        const hasPerplexityKey = !!data.perplexity_key && data.perplexity_key.trim().length > 0;
        setHasKeys(hasAnthropicKey || hasPerplexityKey);
      } else {
        setHasKeys(false);
      }
    } catch (err) {
      console.error('Error checking API keys:', err);
      setHasKeys(false);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (loading) return colors.textSecondary;
    return hasKeys ? '#4CAF50' : '#FF9800';
  };

  const getStatusText = () => {
    if (loading) return 'Checking...';
    return hasKeys ? 'Configured' : 'Not configured';
  };

  const getStatusIcon = () => {
    if (loading) return null;
    return hasKeys ? 'check-circle' : 'warning';
  };

  return (
    <Card
      isAccordion={true}
      isExpanded={isExpanded}
      onToggle={onToggle}
      headerActive={isExpanded}
      headerContent={
        <>
          <MaterialIcons
            name={isExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
            size={24}
            color={colors.textSecondary}
          />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Features</Text>
        </>
      }
    >
      <View style={styles.statusRow}>
        <View style={styles.statusInfo}>
          <Text style={[styles.statusLabel, { color: colors.text }]}>Status</Text>
          <View style={styles.statusBadge}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.textSecondary} />
            ) : (
              <MaterialIcons
                name={getStatusIcon()!}
                size={16}
                color={getStatusColor()}
              />
            )}
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={onOpenApiKeys}
      >
        <MaterialIcons name="key" size={20} color={colors.tint} />
        <Text style={[styles.actionButtonText, { color: colors.text }]}>
          Manage API Keys
        </Text>
        <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <MaterialIcons name="info-outline" size={20} color={colors.tint} />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          AI features use your own API keys. You only pay for what you use.
        </Text>
      </View>

      <View style={styles.featuresList}>
        <Text style={[styles.featuresTitle, { color: colors.text }]}>Available Features:</Text>
        <FeatureItem icon="title" text="Smart Note Titles" colors={colors} enabled={hasKeys} />
        <FeatureItem icon="summarize" text="AI Summarization" colors={colors} enabled={false} />
        <FeatureItem icon="search" text="Semantic Search" colors={colors} enabled={false} />
        <FeatureItem icon="label" text="Auto-Tagging" colors={colors} enabled={false} />
      </View>
    </Card>
  );
}

function FeatureItem({ icon, text, colors, enabled }: {
  icon: string;
  text: string;
  colors: any;
  enabled: boolean;
}) {
  return (
    <View style={styles.featureItem}>
      <MaterialIcons name={icon as any} size={18} color={colors.textSecondary} />
      <Text style={[styles.featureText, { color: colors.textSecondary }]}>{text}</Text>
      {enabled && (
        <View style={[styles.enabledBadge, { backgroundColor: `${colors.tint}20` }]}>
          <Text style={[styles.enabledBadgeText, { color: colors.tint }]}>Active</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
  },
  actionButtonText: {
    fontSize: 16,
    flex: 1,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  featuresList: {
    gap: 8,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  enabledBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  enabledBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
