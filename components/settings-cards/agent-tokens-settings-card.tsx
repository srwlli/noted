import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Card } from '@/components/common/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import * as Clipboard from 'expo-clipboard';
import { toast } from 'sonner-native';

interface AgentToken {
  id: string;
  token_prefix: string;
  name: string | null;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  last_used_at: string | null;
  requests_count: number;
}

interface AgentTokensSettingsCardProps {
  isExpanded: boolean;
  onToggle: () => void;
  onOpenGenerateToken: () => void;
  refreshTrigger?: number;
}

export function AgentTokensSettingsCard({ isExpanded, onToggle, onOpenGenerateToken, refreshTrigger }: AgentTokensSettingsCardProps) {
  const { colors } = useThemeColors();
  const { user } = useAuth();
  const [tokens, setTokens] = useState<AgentToken[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isExpanded) {
      loadTokens();
    }
  }, [user, isExpanded, refreshTrigger]);

  const loadTokens = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agent_tokens')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTokens(data || []);
    } catch (err) {
      console.error('Error loading agent tokens:', err);
      toast.error('Failed to load tokens');
    } finally {
      setLoading(false);
    }
  };

  const getTokenStatus = (token: AgentToken): { text: string; color: string; icon: string } => {
    if (token.revoked_at) {
      return { text: 'Revoked', color: '#999', icon: 'block' };
    }

    const now = new Date();
    const expiresAt = new Date(token.expires_at);

    if (now >= expiresAt) {
      return { text: 'Expired', color: '#FF9800', icon: 'warning' };
    }

    return { text: 'Active', color: '#4CAF50', icon: 'check-circle' };
  };

  const handleRevokeToken = async (tokenId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/agent-revoke-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token_id: tokenId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to revoke token');
      }

      toast.success('Token revoked successfully');
      loadTokens();
    } catch (err) {
      console.error('Error revoking token:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to revoke token');
    }
  };

  const handleCopyTokenPrefix = async (prefix: string) => {
    await Clipboard.setStringAsync(prefix);
    toast.success('Token prefix copied');
  };

  const activeTokensCount = tokens.filter(t => !t.revoked_at && new Date(t.expires_at) > new Date()).length;

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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Agent Communication</Text>
        </>
      }
    >
      <View style={styles.statusRow}>
        <View style={styles.statusInfo}>
          <Text style={[styles.statusLabel, { color: colors.text }]}>Active Tokens</Text>
          <View style={styles.statusBadge}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.textSecondary} />
            ) : (
              <>
                <MaterialIcons
                  name="vpn-key"
                  size={16}
                  color={activeTokensCount > 0 ? '#4CAF50' : colors.textSecondary}
                />
                <Text style={[styles.statusText, { color: activeTokensCount > 0 ? '#4CAF50' : colors.textSecondary }]}>
                  {activeTokensCount} {activeTokensCount === 1 ? 'token' : 'tokens'}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={onOpenGenerateToken}
      >
        <MaterialIcons name="add-circle-outline" size={20} color={colors.tint} />
        <Text style={[styles.actionButtonText, { color: colors.text }]}>
          Generate New Token
        </Text>
        <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <MaterialIcons name="info-outline" size={20} color={colors.tint} />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Generate tokens for AI agents like Claude Code to read and write your notes securely. Tokens expire after 90 days.
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : tokens.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialIcons name="vpn-key" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No tokens yet</Text>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            Generate your first token to enable agent communication
          </Text>
        </View>
      ) : (
        <View style={styles.tokensList}>
          <Text style={[styles.tokensTitle, { color: colors.text }]}>Your Tokens:</Text>
          {tokens.map((token) => {
            const status = getTokenStatus(token);
            const isActive = status.text === 'Active';

            return (
              <View
                key={token.id}
                style={[styles.tokenItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.tokenHeader}>
                  <View style={styles.tokenInfo}>
                    <Text style={[styles.tokenName, { color: colors.text }]}>
                      {token.name || 'Unnamed Token'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleCopyTokenPrefix(token.token_prefix)}
                      style={styles.tokenPrefixContainer}
                    >
                      <Text style={[styles.tokenPrefix, { color: colors.textSecondary }]}>
                        {token.token_prefix}
                      </Text>
                      <MaterialIcons name="content-copy" size={14} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.statusBadgeSmall, { backgroundColor: `${status.color}20` }]}>
                    <MaterialIcons name={status.icon as any} size={14} color={status.color} />
                    <Text style={[styles.statusBadgeText, { color: status.color }]}>
                      {status.text}
                    </Text>
                  </View>
                </View>

                <View style={styles.tokenDetails}>
                  <View style={styles.tokenDetailRow}>
                    <MaterialIcons name="calendar-today" size={14} color={colors.textSecondary} />
                    <Text style={[styles.tokenDetailText, { color: colors.textSecondary }]}>
                      Created: {format(new Date(token.created_at), 'MMM d, yyyy')}
                    </Text>
                  </View>
                  <View style={styles.tokenDetailRow}>
                    <MaterialIcons name="event" size={14} color={colors.textSecondary} />
                    <Text style={[styles.tokenDetailText, { color: colors.textSecondary }]}>
                      Expires: {format(new Date(token.expires_at), 'MMM d, yyyy')}
                    </Text>
                  </View>
                  {token.last_used_at && (
                    <View style={styles.tokenDetailRow}>
                      <MaterialIcons name="access-time" size={14} color={colors.textSecondary} />
                      <Text style={[styles.tokenDetailText, { color: colors.textSecondary }]}>
                        Last used: {format(new Date(token.last_used_at), 'MMM d, yyyy h:mm a')}
                      </Text>
                    </View>
                  )}
                  <View style={styles.tokenDetailRow}>
                    <MaterialIcons name="bar-chart" size={14} color={colors.textSecondary} />
                    <Text style={[styles.tokenDetailText, { color: colors.textSecondary }]}>
                      Requests: {token.requests_count}
                    </Text>
                  </View>
                </View>

                {isActive && (
                  <TouchableOpacity
                    style={[styles.revokeButton, { borderColor: '#ef4444' }]}
                    onPress={() => handleRevokeToken(token.id)}
                  >
                    <MaterialIcons name="block" size={16} color="#ef4444" />
                    <Text style={[styles.revokeButtonText, { color: '#ef4444' }]}>
                      Revoke Token
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}
    </Card>
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
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
  },
  tokensList: {
    gap: 12,
  },
  tokensTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  tokenItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tokenInfo: {
    flex: 1,
    gap: 4,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: '600',
  },
  tokenPrefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tokenPrefix: {
    fontSize: 13,
    fontFamily: 'monospace',
  },
  statusBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tokenDetails: {
    gap: 6,
  },
  tokenDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tokenDetailText: {
    fontSize: 13,
  },
  revokeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  revokeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
