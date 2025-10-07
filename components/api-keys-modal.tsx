import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner-native';

interface ApiKeysModalProps {
  visible: boolean;
  onClose: () => void;
  onKeysUpdated?: () => void;
}

export function ApiKeysModal({ visible, onClose, onKeysUpdated }: ApiKeysModalProps) {
  const { colors } = useThemeColors();
  const { user } = useAuth();
  const [anthropicKey, setAnthropicKey] = useState('');
  const [perplexityKey, setPerplexityKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (visible && user) {
      fetchExistingKeys();
    }
  }, [visible, user]);

  const fetchExistingKeys = async () => {
    try {
      setFetching(true);
      const { data, error } = await supabase
        .from('user_ai_keys')
        .select('anthropic_key, perplexity_key')
        .eq('user_id', user?.id)
        .single();

      if (!error && data) {
        setAnthropicKey(data.anthropic_key || '');
        setPerplexityKey(data.perplexity_key || '');
      }
    } catch (err) {
      console.error('Error fetching API keys:', err);
    } finally {
      setFetching(false);
    }
  };

  const validateAnthropicKey = (key: string): boolean => {
    if (!key || key.trim().length === 0) return true; // Empty is valid (user removing key)
    const regex = /^sk-ant-api03-[A-Za-z0-9_-]{95}$/;
    return regex.test(key.trim());
  };

  const validatePerplexityKey = (key: string): boolean => {
    if (!key || key.trim().length === 0) return true; // Empty is valid
    const regex = /^pplx-[A-Za-z0-9]{48}$/;
    return regex.test(key.trim());
  };

  const handleSave = async () => {
    const trimmedAnthropicKey = anthropicKey.trim();
    const trimmedPerplexityKey = perplexityKey.trim();

    // Validate keys
    if (!validateAnthropicKey(trimmedAnthropicKey)) {
      toast.error('Invalid Anthropic API key format');
      return;
    }

    if (!validatePerplexityKey(trimmedPerplexityKey)) {
      toast.error('Invalid Perplexity API key format');
      return;
    }

    if (!trimmedAnthropicKey && !trimmedPerplexityKey) {
      toast.error('Please provide at least one API key');
      return;
    }

    setLoading(true);

    try {
      // Check if user already has keys
      const { data: existing } = await supabase
        .from('user_ai_keys')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (existing) {
        // Update existing keys
        const { error } = await supabase
          .from('user_ai_keys')
          .update({
            anthropic_key: trimmedAnthropicKey || null,
            perplexity_key: trimmedPerplexityKey || null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user?.id);

        if (error) throw error;
      } else {
        // Insert new keys
        const { error } = await supabase
          .from('user_ai_keys')
          .insert({
            user_id: user?.id,
            anthropic_key: trimmedAnthropicKey || null,
            perplexity_key: trimmedPerplexityKey || null,
          });

        if (error) throw error;
      }

      toast.success('API keys saved successfully');
      onKeysUpdated?.();
      onClose();
    } catch (err: any) {
      console.error('Error saving API keys:', err);
      toast.error('Failed to save API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View
          style={[styles.modal, { backgroundColor: colors.elevatedSurface, borderColor: colors.border }]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Manage API Keys</Text>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {fetching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.tint} />
            </View>
          ) : (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <MaterialIcons name="info-outline" size={20} color={colors.tint} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Your API keys are stored securely and never shared. You only pay for your own API usage.
                </Text>
              </View>

              {/* Anthropic API Key */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { color: colors.text }]}>Anthropic API Key</Text>
                  <View style={[styles.badge, { backgroundColor: `${colors.tint}20` }]}>
                    <Text style={[styles.badgeText, { color: colors.tint }]}>Required</Text>
                  </View>
                </View>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                  For AI title generation and summarization
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={anthropicKey}
                  onChangeText={setAnthropicKey}
                  placeholder="sk-ant-api03-..."
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() =>
                    window.open('https://console.anthropic.com/settings/keys', '_blank')
                  }
                >
                  <Text style={[styles.link, { color: colors.tint }]}>
                    Get your API key from Anthropic →
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Perplexity API Key */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { color: colors.text }]}>Perplexity API Key</Text>
                  <View style={[styles.badge, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
                    <Text style={[styles.badgeText, { color: colors.textSecondary }]}>Optional</Text>
                  </View>
                </View>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                  For web-enhanced research features (coming soon)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={perplexityKey}
                  onChangeText={setPerplexityKey}
                  placeholder="pplx-..."
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => window.open('https://www.perplexity.ai/settings/api', '_blank')}
                >
                  <Text style={[styles.link, { color: colors.tint }]}>
                    Get your API key from Perplexity →
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: colors.tint }]}
              onPress={handleSave}
              disabled={loading || fetching}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={[styles.buttonText, { color: '#ffffff' }]}>Save Keys</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modal: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  scrollView: {
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 13,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 8,
  },
  link: {
    fontSize: 13,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
