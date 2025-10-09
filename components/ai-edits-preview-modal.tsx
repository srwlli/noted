import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';
import type { EditResult, EditType, AppliedEdit, FailedEdit } from '@/services/ai/edits/types';

interface AIEditsPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  originalContent: string;
  editedContent: string;
  editResult: EditResult | null;
  isProcessing: boolean;
  onRegenerate: () => void;
  onApply: () => void;
  onCancelProcessing: () => void;
  hasValidationError?: boolean;
  validationErrorMessage?: string;
  onRevertToOriginal?: () => void;
  editProgress?: Record<EditType, { status: 'pending' | 'in_progress' | 'completed' | 'failed'; durationMs?: number }>;
}

type TabType = 'original' | 'edited' | 'comparison';

/**
 * AI Edits Preview Modal - Full-screen modal with tab view
 *
 * Features:
 * - 3 tabs: Original, Edited (default), Comparison
 * - Step-by-step progress indicators with status icons
 * - Cancellable during processing
 * - Markdown validation warnings
 * - Cancel, Regenerate, Apply buttons
 * - Full accessibility (WCAG 2.1 AA)
 */
export function AIEditsPreviewModal({
  visible,
  onClose,
  originalContent,
  editedContent,
  editResult,
  isProcessing,
  onRegenerate,
  onApply,
  onCancelProcessing,
  hasValidationError = false,
  validationErrorMessage,
  onRevertToOriginal,
  editProgress = {},
}: AIEditsPreviewModalProps) {
  const { colors } = useThemeColors();
  const [activeTab, setActiveTab] = useState<TabType>('edited');

  // Calculate if changes were made
  const hasChanges = editResult
    ? editResult.success && editResult.changePercentage > 0
    : false;

  // Get edit list from result or progress
  const editList = React.useMemo(() => {
    if (!editResult) return Object.keys(editProgress) as EditType[];

    const allEdits = new Set<EditType>();
    editResult.appliedEdits?.forEach(edit => allEdits.add(edit.type));
    editResult.failedEdits?.forEach(edit => allEdits.add(edit.type));

    return Array.from(allEdits);
  }, [editResult, editProgress]);

  const handleClose = () => {
    if (isProcessing) {
      onCancelProcessing();
    }
    onClose();
  };

  const renderProgressItem = (editType: EditType) => {
    // Get status from editResult if available, otherwise from editProgress
    let status: 'pending' | 'in_progress' | 'completed' | 'failed' = 'pending';
    let durationMs: number | undefined;
    let error: string | undefined;

    if (editResult) {
      const applied = editResult.appliedEdits.find(e => e.type === editType);
      const failed = editResult.failedEdits?.find(e => e.type === editType);

      if (applied) {
        status = 'completed';
        durationMs = applied.durationMs;
      } else if (failed) {
        status = 'failed';
        error = failed.error;
      }
    } else if (editProgress[editType]) {
      status = editProgress[editType].status;
      durationMs = editProgress[editType].durationMs;
    }

    // Format edit name for display
    const editName = {
      formatMarkdown: 'Format Markdown',
      fixGrammar: 'Fix Grammar',
      addHeadings: 'Add Headings',
      improveStructure: 'Improve Structure',
      makeConcise: 'Make Concise',
      expandContent: 'Expand Content',
      changeTone: 'Change Tone',
    }[editType];

    const durationText = durationMs ? ` (${(durationMs / 1000).toFixed(1)}s)` : '';

    return (
      <View
        key={editType}
        style={styles.progressItem}
        accessible
        accessibilityLabel={`${editName}: ${status}`}
      >
        <View style={styles.progressIcon}>
          {status === 'pending' && (
            <View style={[styles.iconCircle, { borderColor: colors.border }]} />
          )}
          {status === 'in_progress' && (
            <ActivityIndicator size="small" color={colors.tint} />
          )}
          {status === 'completed' && (
            <MaterialIcons name="check-circle" size={20} color="#10b981" />
          )}
          {status === 'failed' && (
            <MaterialIcons name="error" size={20} color="#ef4444" />
          )}
        </View>

        <View style={styles.progressContent}>
          <Text style={[styles.progressLabel, { color: colors.text }]}>
            {editName}
            {durationText}
          </Text>
          {error && (
            <Text style={[styles.progressError, { color: '#ef4444' }]}>
              {error}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    if (activeTab === 'original') {
      return (
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
          accessible
          accessibilityLabel="Original note content"
        >
          <Text style={[styles.contentText, { color: colors.text }]} selectable>
            {originalContent}
          </Text>
        </ScrollView>
      );
    }

    if (activeTab === 'edited') {
      return (
        <View style={styles.editedContainer}>
          {/* Progress Section */}
          {(isProcessing || editList.length > 0) && (
            <View style={[styles.progressSection, { borderBottomColor: colors.border }]}>
              <Text style={[styles.progressTitle, { color: colors.text }]}>
                {isProcessing ? 'Applying AI edits...' : 'Edits Applied'}
              </Text>
              <ScrollView
                style={styles.progressList}
                showsVerticalScrollIndicator={false}
              >
                {editList.map(renderProgressItem)}
              </ScrollView>
            </View>
          )}

          {/* Edited Content */}
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
            accessible
            accessibilityLabel="AI-edited note content"
          >
            {isProcessing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.tint} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Processing edits...
                </Text>
              </View>
            ) : (
              <Text style={[styles.contentText, { color: colors.text }]} selectable>
                {editedContent}
              </Text>
            )}
          </ScrollView>
        </View>
      );
    }

    if (activeTab === 'comparison') {
      return (
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
          accessible
          accessibilityLabel="Side-by-side comparison of changes"
        >
          <View style={styles.comparisonContainer}>
            <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>
              ORIGINAL
            </Text>
            <View style={[styles.comparisonBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.comparisonText, { color: colors.text }]} selectable>
                {originalContent}
              </Text>
            </View>

            <View style={styles.comparisonDivider}>
              <MaterialIcons name="arrow-downward" size={24} color={colors.textSecondary} />
            </View>

            <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>
              EDITED
            </Text>
            <View style={[styles.comparisonBox, { backgroundColor: colors.surface, borderColor: colors.tint }]}>
              <Text style={[styles.comparisonText, { color: colors.text }]} selectable>
                {editedContent}
              </Text>
            </View>
          </View>
        </ScrollView>
      );
    }

    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      accessible
      accessibilityLabel="AI Edits Preview Modal"
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            activeOpacity={0.7}
            accessible
            accessibilityLabel={isProcessing ? 'Cancel AI processing and close' : 'Close preview'}
            accessibilityRole="button"
          >
            <MaterialIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>
            AI Edits Preview
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Markdown Validation Warning */}
        {hasValidationError && (
          <View style={[styles.validationWarning, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}>
            <MaterialIcons name="warning" size={20} color="#f59e0b" />
            <Text style={[styles.validationText, { color: '#92400e' }]}>
              {validationErrorMessage || 'AI edits produced invalid markdown.'}
            </Text>
            {onRevertToOriginal && (
              <TouchableOpacity
                onPress={onRevertToOriginal}
                style={styles.revertButton}
                activeOpacity={0.7}
                accessible
                accessibilityLabel="Revert to original content"
                accessibilityRole="button"
              >
                <Text style={[styles.revertButtonText, { color: '#f59e0b' }]}>
                  Revert
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Tab Bar */}
        <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'original' && [styles.activeTab, { borderBottomColor: colors.tint }],
            ]}
            onPress={() => setActiveTab('original')}
            activeOpacity={0.7}
            accessible
            accessibilityLabel="Original tab"
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'original' }}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === 'original' ? colors.tint : colors.textSecondary },
              ]}
            >
              Original
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'edited' && [styles.activeTab, { borderBottomColor: colors.tint }],
            ]}
            onPress={() => setActiveTab('edited')}
            activeOpacity={0.7}
            accessible
            accessibilityLabel="Edited tab"
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'edited' }}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === 'edited' ? colors.tint : colors.textSecondary },
              ]}
            >
              Edited
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'comparison' && [styles.activeTab, { borderBottomColor: colors.tint }],
            ]}
            onPress={() => setActiveTab('comparison')}
            activeOpacity={0.7}
            accessible
            accessibilityLabel="Comparison tab"
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'comparison' }}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === 'comparison' ? colors.tint : colors.textSecondary },
              ]}
            >
              Comparison
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Footer Buttons */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.footerButton, styles.cancelButton, { borderColor: colors.border }]}
            onPress={handleClose}
            activeOpacity={0.7}
            accessible
            accessibilityLabel={isProcessing ? 'Cancel processing and close' : 'Discard changes and close'}
            accessibilityRole="button"
          >
            <Text style={[styles.footerButtonText, { color: colors.text }]}>
              {isProcessing ? 'Cancel' : 'Discard'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.footerButton, styles.regenerateButton, { borderColor: colors.border }]}
            onPress={onRegenerate}
            activeOpacity={0.7}
            disabled={isProcessing}
            accessible
            accessibilityLabel="Regenerate edits with same options"
            accessibilityRole="button"
            accessibilityState={{ disabled: isProcessing }}
          >
            <MaterialIcons
              name="refresh"
              size={18}
              color={isProcessing ? colors.textSecondary : colors.text}
            />
            <Text
              style={[
                styles.footerButtonText,
                { color: isProcessing ? colors.textSecondary : colors.text },
              ]}
            >
              Regenerate
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.footerButton,
              styles.applyButton,
              { backgroundColor: hasChanges && !isProcessing ? colors.tint : colors.border },
            ]}
            onPress={onApply}
            activeOpacity={0.7}
            disabled={!hasChanges || isProcessing}
            accessible
            accessibilityLabel="Save edited content to note"
            accessibilityRole="button"
            accessibilityState={{ disabled: !hasChanges || isProcessing }}
          >
            <MaterialIcons
              name="check"
              size={18}
              color={hasChanges && !isProcessing ? '#ffffff' : colors.textSecondary}
            />
            <Text
              style={[
                styles.footerButtonText,
                { color: hasChanges && !isProcessing ? '#ffffff' : colors.textSecondary },
              ]}
            >
              Apply Changes
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 44,
  },
  validationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  validationText: {
    flex: 1,
    fontSize: 14,
  },
  revertButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  revertButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  editedContainer: {
    flex: 1,
  },
  progressSection: {
    borderBottomWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    maxHeight: 200,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressList: {
    maxHeight: 140,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  progressIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  progressContent: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 14,
  },
  progressError: {
    fontSize: 12,
    marginTop: 2,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  comparisonContainer: {
    gap: 12,
  },
  comparisonLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  comparisonBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  comparisonText: {
    fontSize: 14,
    lineHeight: 20,
  },
  comparisonDivider: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  cancelButton: {
    borderWidth: 1,
  },
  regenerateButton: {
    borderWidth: 1,
  },
  applyButton: {
    borderWidth: 0,
  },
  footerButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
