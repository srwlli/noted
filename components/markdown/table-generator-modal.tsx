import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface TableGeneratorModalProps {
  visible: boolean;
  onGenerate: (table: string) => void;
  onCancel: () => void;
}

/**
 * Modal for generating markdown tables
 * Visual grid picker for rows and columns
 */
export function TableGeneratorModal({ visible, onGenerate, onCancel }: TableGeneratorModalProps) {
  const { colors } = useThemeColors();
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);

  // Reset on close
  useEffect(() => {
    if (!visible) {
      setRows(2);
      setCols(2);
    }
  }, [visible]);

  const generateMarkdownTable = () => {
    // Generate header row
    const headerRow = '| ' + Array(cols).fill('Column').map((col, i) => `${col} ${i + 1}`).join(' | ') + ' |';

    // Generate separator row
    const separatorRow = '|' + Array(cols).fill('---').map(sep => ` ${sep} `).join('|') + '|';

    // Generate data rows
    const dataRows = Array(rows).fill(null).map(() =>
      '|' + Array(cols).fill('').map(() => '  ').join('|') + '|'
    ).join('\n');

    return `${headerRow}\n${separatorRow}\n${dataRows}`;
  };

  const handleGenerate = () => {
    const table = generateMarkdownTable();
    onGenerate(table);
  };

  const handleCancel = () => {
    setRows(2);
    setCols(2);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleCancel}
        />
        <View style={[styles.modal, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialIcons name="table-chart" size={24} color={colors.tint} />
            <Text style={[styles.title, { color: colors.text }]}>Insert Table</Text>
          </View>

          {/* Rows Selector */}
          <View style={styles.selectorContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Rows: {rows}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
              <View style={styles.buttonRow}>
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <TouchableOpacity
                    key={`row-${num}`}
                    style={[
                      styles.selectorButton,
                      {
                        backgroundColor: rows === num ? colors.tint : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setRows(num)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.selectorButtonText,
                        { color: rows === num ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Columns Selector */}
          <View style={styles.selectorContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Columns: {cols}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
              <View style={styles.buttonRow}>
                {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <TouchableOpacity
                    key={`col-${num}`}
                    style={[
                      styles.selectorButton,
                      {
                        backgroundColor: cols === num ? colors.tint : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setCols(num)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.selectorButtonText,
                        { color: cols === num ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Preview */}
          <View style={[styles.preview, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Preview: {rows} × {cols} table</Text>
            <View style={styles.gridPreview}>
              {Array(Math.min(rows, 3)).fill(null).map((_, rowIdx) => (
                <View key={`preview-row-${rowIdx}`} style={styles.gridRow}>
                  {Array(Math.min(cols, 4)).fill(null).map((_, colIdx) => (
                    <View
                      key={`preview-cell-${rowIdx}-${colIdx}`}
                      style={[
                        styles.gridCell,
                        {
                          backgroundColor: rowIdx === 0 ? colors.tint : colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                    />
                  ))}
                  {cols > 4 && <Text style={{ color: colors.textSecondary }}>...</Text>}
                </View>
              ))}
              {rows > 3 && <Text style={{ color: colors.textSecondary }}>...</Text>}
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.background }]}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.generateButton, { backgroundColor: colors.tint }]}
              onPress={handleGenerate}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, styles.generateButtonText]}>Generate</Text>
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
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
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
  selectorContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  scrollView: {
    maxHeight: 50,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  selectorButton: {
    width: 44,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  preview: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  gridPreview: {
    gap: 4,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  gridCell: {
    width: 40,
    height: 24,
    borderWidth: 1,
    borderRadius: 4,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  generateButton: {
    // Tint background applied via inline style
  },
  generateButtonText: {
    color: '#FFFFFF',
  },
});
