import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { notesService } from '@/services/notes';

// Validation constants (match database constraints)
const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 50000;

interface NoteFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialNote?: {
    id?: string;
    title: string;
    content: string;
  };
}

export function NoteForm({ onSuccess, onCancel, initialNote }: NoteFormProps) {
  const { colors } = useThemeColors();
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialNote?.id;

  // Calculate character counts
  const titleLength = title.length;
  const contentLength = content.length;
  const isTitleTooLong = titleLength > MAX_TITLE_LENGTH;
  const isContentTooLong = contentLength > MAX_CONTENT_LENGTH;

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (isTitleTooLong) {
      setError(`Title must be less than ${MAX_TITLE_LENGTH} characters`);
      return;
    }

    if (isContentTooLong) {
      setError(`Content must be less than ${MAX_CONTENT_LENGTH} characters`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditing && initialNote?.id) {
        await notesService.updateNote(initialNote.id, title.trim(), content.trim());
      } else {
        await notesService.createNote(title.trim(), content.trim());
      }

      setTitle('');
      setContent('');
      onSuccess?.();
    } catch (err) {
      console.error('Error saving note:', err);
      setError('Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Title</Text>
        <Text style={[
          styles.charCounter,
          { color: isTitleTooLong ? '#ef4444' : colors.textSecondary }
        ]}>
          {titleLength}/{MAX_TITLE_LENGTH}
        </Text>
      </View>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            borderColor: isTitleTooLong ? '#ef4444' : colors.border,
            color: colors.text
          }
        ]}
        placeholder="Enter note title..."
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={setTitle}
        maxLength={MAX_TITLE_LENGTH}
        editable={!loading}
      />

      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Content</Text>
        <Text style={[
          styles.charCounter,
          { color: isContentTooLong ? '#ef4444' : colors.textSecondary }
        ]}>
          {contentLength}/{MAX_CONTENT_LENGTH}
        </Text>
      </View>
      <TextInput
        style={[
          styles.textArea,
          {
            backgroundColor: colors.background,
            borderColor: isContentTooLong ? '#ef4444' : colors.border,
            color: colors.text
          }
        ]}
        placeholder="Enter note content..."
        placeholderTextColor={colors.textSecondary}
        value={content}
        onChangeText={setContent}
        maxLength={MAX_CONTENT_LENGTH}
        multiline
        numberOfLines={10}
        textAlignVertical="top"
        editable={!loading}
      />

      {error && (
        <Text style={[styles.error, { color: '#ef4444' }]}>{error}</Text>
      )}

      <View style={styles.buttonContainer}>
        {onCancel && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.saveButton, { backgroundColor: colors.tint }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.background }]}>
              {isEditing ? 'Update' : 'Save'} Note
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  charCounter: {
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 200,
  },
  error: {
    fontSize: 14,
    marginBottom: 16,
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