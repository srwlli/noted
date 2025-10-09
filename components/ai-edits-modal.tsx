import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { toast } from 'sonner-native';
import type { EditOptions } from '@/services/ai/edits/types';

interface AIEditsModalProps {
  visible: boolean;
  onClose: () => void;
  onPreview: (options: EditOptions) => void;
  noteContent: string;
}

const STORAGE_KEY = 'ai_edits_last_options';

/**
 * AI Edits Modal - Bottom sheet for selecting edit options
 *
 * Features:
 * - Multi-select checkboxes for format & structure edits
 * - Radio buttons for length adjustment
 * - State persistence via AsyncStorage
 * - Mobile-first design with 44x44pt touch targets
 * - Full accessibility (WCAG 2.1 AA)
 */
export function AIEditsModal({
  visible,
  onClose,
  onPreview,
  noteContent,
}: AIEditsModalProps) {
  const { colors } = useThemeColors();

  // Edit options state
  const [formatMarkdown, setFormatMarkdown] = useState(false);
  const [fixGrammar, setFixGrammar] = useState(false);
  const [addHeadings, setAddHeadings] = useState(false);
  const [improveStructure, setImproveStructure] = useState(false);
  const [lengthAdjustment, setLengthAdjustment] = useState<'keep' | 'concise' | 'expand'>(
    'keep'
  );

  // Load persisted options on mount
  useEffect(() => {
    if (visible) {
      loadPersistedOptions();
    }
  }, [visible]);

  const loadPersistedOptions = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const options: EditOptions = JSON.parse(stored);
        setFormatMarkdown(options.formatMarkdown || false);
        setFixGrammar(options.fixGrammar || false);
        setAddHeadings(options.addHeadings || false);
        setImproveStructure(options.improveStructure || false);
        setLengthAdjustment(options.lengthAdjustment || 'keep');
      }
    } catch (error) {
      console.error('Failed to load persisted options:', error);
    }
  };

  const saveOptions = async (options: EditOptions) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(options));
    } catch (error) {
      console.error('Failed to save options:', error);
    }
  };

  const handlePreviewChanges = async () => {
    // Validate: at least one option must be selected
    const hasOptions =
      formatMarkdown ||
      fixGrammar ||
      addHeadings ||
      improveStructure ||
      lengthAdjustment !== 'keep';

    if (!hasOptions) {
      toast.error('Please select at least one edit option', { position: 'top-center' });
      return;
    }

    // Validate content length
    if (noteContent.trim().length < 10) {
      toast.error('Note must have at least 10 characters to edit', { position: 'top-center' });
      return;
    }

    if (noteContent.length > 50000) {
      toast.error('Note too long for AI editing (max 50,000 characters)', {
        position: 'top-center',
      });
      return;
    }

    const options: EditOptions = {
      formatMarkdown,
      fixGrammar,
      addHeadings,
      improveStructure,
      lengthAdjustment,
      tone: null, // Phase 2
    };

    // Persist options for next use
    await saveOptions(options);

    // Trigger preview
    onPreview(options);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      accessible
      accessibilityLabel="AI Edits Options Modal"
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleClose}
        accessible={false}
      >
        {/* Bottom Sheet */}
        <TouchableOpacity
          style={[styles.bottomSheet, { backgroundColor: colors.elevatedSurface }]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          accessible={false}
        >
          {/* Drag Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <MaterialIcons name="edit" size={24} color={colors.tint} />
            <Text
              style={[styles.title, { color: colors.text }]}
              accessible
              accessibilityRole="header"
            >
              AI Edits
            </Text>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Format & Structure Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Format & Structure
              </Text>

              <CheckboxOption
                label="Format Markdown Properly"
                sublabel="Add headings, lists, spacing"
                checked={formatMarkdown}
                onPress={() => setFormatMarkdown(!formatMarkdown)}
                colors={colors}
              />

              <CheckboxOption
                label="Fix Grammar & Spelling"
                sublabel="Correct errors"
                checked={fixGrammar}
                onPress={() => setFixGrammar(!fixGrammar)}
                colors={colors}
              />

              <CheckboxOption
                label="Add Section Headings"
                sublabel="Organize hierarchically"
                checked={addHeadings}
                onPress={() => setAddHeadings(!addHeadings)}
                colors={colors}
              />

              <CheckboxOption
                label="Improve Structure/Flow"
                sublabel="Reorganize for clarity"
                checked={improveStructure}
                onPress={() => setImproveStructure(!improveStructure)}
                colors={colors}
              />
            </View>

            {/* Length Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Length</Text>

              <RadioOption
                label="Keep as-is"
                selected={lengthAdjustment === 'keep'}
                onPress={() => setLengthAdjustment('keep')}
                colors={colors}
              />

              <RadioOption
                label="Make More Concise"
                sublabel="Remove redundancy"
                selected={lengthAdjustment === 'concise'}
                onPress={() => setLengthAdjustment('concise')}
                colors={colors}
              />

              <RadioOption
                label="Expand with Details"
                sublabel="Add context"
                selected={lengthAdjustment === 'expand'}
                onPress={() => setLengthAdjustment('expand')}
                colors={colors}
              />
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleClose}
              activeOpacity={0.7}
              accessible
              accessibilityLabel="Cancel AI edits and close"
              accessibilityRole="button"
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { backgroundColor: colors.tint }]}
              onPress={handlePreviewChanges}
              activeOpacity={0.7}
              accessible
              accessibilityLabel="Generate preview of selected edits"
              accessibilityHint="Processing may take several seconds"
              accessibilityRole="button"
            >
              <Text style={[styles.buttonText, { color: '#ffffff' }]}>Preview Changes</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

/**
 * Checkbox Option Component
 */
interface CheckboxOptionProps {
  label: string;
  sublabel?: string;
  checked: boolean;
  onPress: () => void;
  colors: any;
}

function CheckboxOption({ label, sublabel, checked, onPress, colors }: CheckboxOptionProps) {
  return (
    <TouchableOpacity
      style={[
        styles.option,
        {
          backgroundColor: checked ? `${colors.tint}15` : colors.surface,
          borderColor: checked ? colors.tint : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessible
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={`${label}${sublabel ? `: ${sublabel}` : ''}`}
    >
      <View style={styles.optionContent}>
        <Text style={[styles.optionLabel, { color: colors.text }]}>{label}</Text>
        {sublabel && (
          <Text style={[styles.optionSublabel, { color: colors.textSecondary }]}>{sublabel}</Text>
        )}
      </View>

      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: checked ? colors.tint : 'transparent',
            borderColor: checked ? colors.tint : colors.border,
          },
        ]}
      >
        {checked && <MaterialIcons name="check" size={16} color="#ffffff" />}
      </View>
    </TouchableOpacity>
  );
}

/**
 * Radio Option Component
 */
interface RadioOptionProps {
  label: string;
  sublabel?: string;
  selected: boolean;
  onPress: () => void;
  colors: any;
}

function RadioOption({ label, sublabel, selected, onPress, colors }: RadioOptionProps) {
  return (
    <TouchableOpacity
      style={[
        styles.option,
        {
          backgroundColor: selected ? `${colors.tint}15` : colors.surface,
          borderColor: selected ? colors.tint : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessible
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label}${sublabel ? `: ${sublabel}` : ''}`}
    >
      <View style={styles.optionContent}>
        <Text style={[styles.optionLabel, { color: colors.text }]}>{label}</Text>
        {sublabel && (
          <Text style={[styles.optionSublabel, { color: colors.textSecondary }]}>{sublabel}</Text>
        )}
      </View>

      <View
        style={[
          styles.radio,
          {
            borderColor: selected ? colors.tint : colors.border,
          },
        ]}
      >
        {selected && <View style={[styles.radioInner, { backgroundColor: colors.tint }]} />}
      </View>
    </TouchableOpacity>
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
    maxHeight: '85%',
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
  scrollView: {
    maxHeight: '70%',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    minHeight: 44, // Accessibility: minimum touch target
  },
  optionContent: {
    flex: 1,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  optionSublabel: {
    fontSize: 13,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  button: {
    flex: 1,
    height: 44, // Accessibility: minimum touch target
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  primaryButton: {
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
