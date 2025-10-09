import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { PrimaryActionRow } from '@/components/note-actions/primary-action-row';
import { generateTitle } from '@/services/ai/generate-title';
import { summarizeNote } from '@/services/ai/summarize';
import { notesService, Note } from '@/services/notes';
import { toast } from 'sonner-native';

interface AIActionsModalProps {
  visible: boolean;
  onClose: () => void;
  noteId: string;
  noteContent: string;
  note: Note;
  onTitleUpdated?: () => void;
}

/**
 * Bottom sheet modal for AI-powered actions
 * Handles title generation and summarization in-place without navigation
 */
export function AIActionsModal({ visible, onClose, noteId, noteContent, note, onTitleUpdated }: AIActionsModalProps) {
  const { colors } = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState<string | null>(null);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showSummaryResult, setShowSummaryResult] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const handleGenerateTitle = async () => {
    setLoading(true);
    setShowResult(true);

    try {
      const result = await generateTitle(noteContent);

      if (result.success) {
        setGeneratedTitle(result.title);
      } else {
        toast.error(result.error, { position: 'top-center' });
        setShowResult(false);
      }
    } catch (error) {
      console.error('Generate title error:', error);
      toast.error('Failed to generate title', { position: 'top-center' });
      setShowResult(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedTitle) return;

    try {
      // Update note with new title
      const hasHeading = noteContent.trim().startsWith('#');
      let newContent: string;

      if (hasHeading) {
        const lines = noteContent.split('\n');
        lines[0] = `# ${generatedTitle}`;
        newContent = lines.join('\n');
      } else {
        newContent = `# ${generatedTitle}\n\n${noteContent}`;
      }

      await notesService.updateNoteWithAITitle(noteId, generatedTitle, newContent);
      toast.success('Title saved successfully', { position: 'top-center' });

      // Trigger parent refresh
      onTitleUpdated?.();

      // Reset and close
      setGeneratedTitle(null);
      setShowResult(false);
      onClose();
    } catch (error) {
      console.error('Failed to save title:', error);
      toast.error('Failed to save title', { position: 'top-center' });
    }
  };

  const handleRegenerate = () => {
    handleGenerateTitle();
  };

  const handleCancel = () => {
    setGeneratedTitle(null);
    setGeneratedSummary(null);
    setShowResult(false);
    setShowSummaryResult(false);
  };

  const handleSummarize = async () => {
    setIsGeneratingSummary(true);
    setShowSummaryResult(true);

    try {
      const result = await summarizeNote(noteContent);

      if (result.success) {
        setGeneratedSummary(result.summary);
      } else {
        toast.error(result.error, { position: 'top-center' });
        setShowSummaryResult(false);
      }
    } catch (error) {
      console.error('Generate summary error:', error);
      toast.error('Failed to generate summary', { position: 'top-center' });
      setShowSummaryResult(false);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSaveSummary = async () => {
    if (!generatedSummary) return;

    try {
      await notesService.updateNoteSummary(noteId, generatedSummary);
      toast.success('Summary saved successfully', { position: 'top-center' });

      // Trigger parent refresh
      onTitleUpdated?.();

      // Reset and close
      setGeneratedSummary(null);
      setShowSummaryResult(false);
      onClose();
    } catch (error) {
      console.error('Failed to save summary:', error);
      toast.error('Failed to save summary', { position: 'top-center' });
    }
  };

  const handleRegenerateSummary = () => {
    handleSummarize();
  };

  const handleModalClose = () => {
    setGeneratedTitle(null);
    setGeneratedSummary(null);
    setShowResult(false);
    setShowSummaryResult(false);
    setLoading(false);
    onClose();
  };

  // Dynamic title button based on AI title generation
  const titleIcon = (note.ai_title_generated_at ? 'check-circle' : 'title') as const;
  const titleLabel = note.ai_title_generated_at ? 'Title Generated' : 'Generate Title';

  // Dynamic summarize button based on summary existence
  const summarizeIcon = (note.ai_summary ? 'check-circle' : 'summarize') as const;
  const summarizeLabel = note.ai_summary ? 'Summarized' : 'Summarize';

  const aiActions = [
    { icon: titleIcon, label: titleLabel, onPress: handleGenerateTitle, disabled: loading },
    { icon: summarizeIcon, label: summarizeLabel, onPress: handleSummarize, disabled: isGeneratingSummary },
    { icon: 'search' as const, label: 'Extract Tags', onPress: () => {}, disabled: true },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleModalClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleModalClose}
      >
        {/* Bottom Sheet */}
        <TouchableOpacity
          style={[styles.bottomSheet, { backgroundColor: colors.elevatedSurface }]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <MaterialIcons name="auto-awesome" size={24} color={colors.tint} />
            <Text style={[styles.title, { color: colors.text }]}>
              {showResult ? 'Generated Title' : showSummaryResult ? 'Generated Summary' : 'AI Actions'}
            </Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {!showResult && !showSummaryResult ? (
              /* Initial Action Buttons */
              <PrimaryActionRow actions={aiActions} />
            ) : showResult ? (
              loading ? (
                /* Title Loading State */
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.tint} />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Generating title...
                  </Text>
                </View>
              ) : (
                /* Title Result State */
                <>
                  <View style={[styles.titlePreview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.titleText, { color: colors.text }]}>
                      {generatedTitle}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.actionButton, { borderColor: colors.border }]}
                      onPress={handleCancel}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="close" size={20} color={colors.text} />
                      <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, { borderColor: colors.border }]}
                      onPress={handleRegenerate}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="refresh" size={20} color={colors.text} />
                      <Text style={[styles.buttonText, { color: colors.text }]}>Regenerate</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.saveButton, { backgroundColor: colors.tint }]}
                      onPress={handleSave}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="check" size={20} color="#ffffff" />
                      <Text style={[styles.buttonText, { color: '#ffffff' }]}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )
            ) : showSummaryResult ? (
              isGeneratingSummary ? (
                /* Summary Loading State */
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.tint} />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Generating summary...
                  </Text>
                </View>
              ) : (
                /* Summary Result State */
                <>
                  <View style={[styles.titlePreview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.titleText, { color: colors.text }]}>
                      {generatedSummary}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.actionButton, { borderColor: colors.border }]}
                      onPress={handleCancel}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="close" size={20} color={colors.text} />
                      <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, { borderColor: colors.border }]}
                      onPress={handleRegenerateSummary}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="refresh" size={20} color={colors.text} />
                      <Text style={[styles.buttonText, { color: colors.text }]}>Regenerate</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.saveButton, { backgroundColor: colors.tint }]}
                      onPress={handleSaveSummary}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="check" size={20} color="#ffffff" />
                      <Text style={[styles.buttonText, { color: '#ffffff' }]}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )
            ) : null}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    maxHeight: '60%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    minHeight: 120,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  titlePreview: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
  },
  saveButton: {
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
