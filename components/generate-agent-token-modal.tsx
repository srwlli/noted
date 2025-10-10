import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { supabase } from '@/lib/supabase';
import * as Clipboard from 'expo-clipboard';
import { toast } from 'sonner-native';

interface GenerateAgentTokenModalProps {
  visible: boolean;
  onClose: () => void;
  onTokenGenerated: () => void;
}

export function GenerateAgentTokenModal({ visible, onClose, onTokenGenerated }: GenerateAgentTokenModalProps) {
  const { colors } = useThemeColors();
  const [tokenName, setTokenName] = useState('');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  const handleClose = () => {
    // Reset state when closing
    setTokenName('');
    setGeneratedToken(null);
    setTokenCopied(false);
    setIsGenerating(false);
    onClose();
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);

      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/agent-generate-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: tokenName.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate token');
      }

      const data = await response.json();
      setGeneratedToken(data.token);
      toast.success('Token generated successfully');
    } catch (err) {
      console.error('Error generating token:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to generate token');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToken = async () => {
    if (generatedToken) {
      await Clipboard.setStringAsync(generatedToken);
      setTokenCopied(true);
      toast.success('Token copied to clipboard');
    }
  };

  const handleDone = () => {
    if (generatedToken && !tokenCopied) {
      // Warn user if they didn't copy the token
      toast.error('Please copy the token first! It will not be shown again.');
      return;
    }
    onTokenGenerated();
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialIcons name="vpn-key" size={24} color={colors.tint} />
            <Text style={[styles.title, { color: colors.text }]}>
              {generatedToken ? 'Token Generated' : 'Generate Agent Token'}
            </Text>
          </View>

          {!generatedToken ? (
            <>
              {/* Input Section */}
              <View style={styles.content}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Token Name (Optional)
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
                  placeholder="e.g., Claude Code - Desktop"
                  placeholderTextColor={colors.textSecondary}
                  value={tokenName}
                  onChangeText={setTokenName}
                  editable={!isGenerating}
                />

                <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <MaterialIcons name="info-outline" size={20} color={colors.tint} />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    This token will allow AI agents to read and write your notes. It expires in 90 days and can be revoked anytime.
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                  onPress={handleClose}
                  disabled={isGenerating}
                >
                  <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.generateButton,
                    { backgroundColor: colors.tint },
                    isGenerating && styles.buttonDisabled,
                  ]}
                  onPress={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={[styles.buttonText, { color: '#ffffff' }]}>Generate</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Token Display Section */}
              <View style={styles.content}>
                <View style={[styles.warningBox, { backgroundColor: '#FFF3CD', borderColor: '#FFCC00' }]}>
                  <MaterialIcons name="warning" size={24} color="#FF9800" />
                  <Text style={[styles.warningText, { color: '#856404' }]}>
                    Save this token securely! It will not be shown again.
                  </Text>
                </View>

                <Text style={[styles.label, { color: colors.text }]}>Your Token:</Text>
                <View style={[styles.tokenDisplay, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.tokenText, { color: colors.text }]} selectable>
                    {generatedToken}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.copyButton,
                    { backgroundColor: tokenCopied ? '#4CAF50' : colors.tint },
                  ]}
                  onPress={handleCopyToken}
                >
                  <MaterialIcons
                    name={tokenCopied ? 'check' : 'content-copy'}
                    size={20}
                    color="#ffffff"
                  />
                  <Text style={[styles.copyButtonText, { color: '#ffffff' }]}>
                    {tokenCopied ? 'Copied!' : 'Copy to Clipboard'}
                  </Text>
                </TouchableOpacity>

                <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <MaterialIcons name="info-outline" size={20} color={colors.tint} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                      Add this token to your .env file:
                    </Text>
                    <Text style={[styles.codeText, { color: colors.text }]}>
                      NOTED_AGENT_TOKEN={generatedToken}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.doneButton,
                    { backgroundColor: tokenCopied ? colors.tint : colors.border },
                  ]}
                  onPress={handleDone}
                >
                  <Text style={[styles.buttonText, { color: tokenCopied ? '#ffffff' : colors.textSecondary }]}>
                    {tokenCopied ? 'Done' : 'Copy First!'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    gap: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  tokenDisplay: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  tokenText: {
    fontSize: 13,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 6,
    lineHeight: 18,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 8,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  generateButton: {
    // backgroundColor set dynamically
  },
  doneButton: {
    // backgroundColor set dynamically
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
