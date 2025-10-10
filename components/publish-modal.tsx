import React, { useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity, ScrollView, StyleSheet, Text, TextInput, Platform, Share, ActivityIndicator, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { publishService, PublishedNote } from '@/services/publish';
import { toast } from 'sonner-native';
import { format } from 'date-fns';

interface PublishModalProps {
  visible: boolean;
  onClose: () => void;
  noteId: string;
  noteTitle: string;
  noteContent: string;
  onPublished?: () => void;
}

/**
 * PublishModal component
 * Handles note publishing, unpublishing, and public URL management
 */
export function PublishModal({
  visible,
  onClose,
  noteId,
  noteTitle,
  noteContent,
  onPublished,
}: PublishModalProps) {
  const { colors } = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [publishedNote, setPublishedNote] = useState<PublishedNote | null>(null);
  const [publishesRemaining, setPublishesRemaining] = useState<number>(50);

  // Load published note status when modal opens
  useEffect(() => {
    if (visible) {
      loadPublishStatus();
    }
  }, [visible, noteId]);

  const loadPublishStatus = async () => {
    setLoading(true);
    try {
      const [published, remaining] = await Promise.all([
        publishService.getPublishedNote(noteId),
        publishService.getPublishesRemaining(),
      ]);

      setPublishedNote(published);
      setPublishesRemaining(remaining);
    } catch (error) {
      console.error('Failed to load publish status:', error);
      toast.error('Failed to load publish status');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (publishing) return;

    // Validate content
    if (!noteContent || noteContent.trim().length === 0) {
      toast.error('Cannot publish empty note');
      return;
    }

    // Check rate limit
    if (publishesRemaining <= 0) {
      toast.error('Daily publish limit reached (50/day)');
      return;
    }

    setPublishing(true);
    const loadingToast = toast.loading('Publishing note...');

    try {
      const result = await publishService.publishNote(
        noteId,
        noteTitle,
        noteContent
      );

      if (!result.success) {
        const errorMessage = getErrorMessage(result.error);
        toast.error(errorMessage, { id: loadingToast });
        return;
      }

      // Success - reload status to get published note info
      await loadPublishStatus();

      toast.success('Note published successfully!', { id: loadingToast });
      onPublished?.();

      // Auto-copy URL to clipboard
      if (result.publicUrl) {
        await Clipboard.setStringAsync(result.publicUrl);
        toast.info('Public URL copied to clipboard');
      }
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Failed to publish note', { id: loadingToast });
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublishConfirm = async () => {
    if (unpublishing) return;

    setUnpublishing(true);
    const loadingToast = toast.loading('Unpublishing note...');

    try {
      await publishService.unpublishNote(noteId);

      setPublishedNote(null);
      toast.success('Note unpublished successfully', { id: loadingToast });
      onPublished?.();
    } catch (error) {
      console.error('Unpublish error:', error);
      toast.error('Failed to unpublish note', { id: loadingToast });
    } finally {
      setUnpublishing(false);
    }
  };

  const handleUnpublish = () => {
    if (unpublishing) return;

    Alert.alert(
      'Unpublish note?',
      'The public link will stop working. You can publish again later.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Unpublish', style: 'destructive', onPress: handleUnpublishConfirm }
      ]
    );
  };

  const getPublicUrl = () => {
    if (!publishedNote) return '';

    const baseUrl = Platform.OS === 'web'
      ? window.location.origin
      : process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:8081';

    return `${baseUrl}/p/${publishedNote.slug}`;
  };

  const handleCopyUrl = async () => {
    const url = getPublicUrl();
    await Clipboard.setStringAsync(url);
    toast.success('Public URL copied to clipboard');
  };

  const handleShareUrl = async () => {
    const url = getPublicUrl();

    try {
      if (Platform.OS === 'web') {
        // Web: Use Web Share API or fallback to copy
        if (navigator.share) {
          await navigator.share({
            title: noteTitle,
            url: url,
          });
        } else {
          await handleCopyUrl();
        }
      } else {
        // Mobile: Use Share sheet
        await Share.share({
          message: `${noteTitle}\n\n${url}`,
          title: noteTitle,
          url: url,
        });
      }
    } catch (error) {
      // User cancelled or error (don't show toast)
    }
  };

  const handleViewPublicPage = async () => {
    const url = getPublicUrl();

    if (Platform.OS === 'web') {
      // Web: Open in new tab
      window.open(url, '_blank');
    } else {
      // Mobile: Open in in-app browser
      await WebBrowser.openBrowserAsync(url);
    }
  };

  const getErrorMessage = (errorCode?: string): string => {
    switch (errorCode) {
      case 'UNAUTHORIZED':
        return 'You must be logged in to publish notes';
      case 'NOTE_NOT_FOUND':
        return 'Note not found';
      case 'NOTE_EMPTY':
        return 'Cannot publish empty note';
      case 'NOTE_TOO_LARGE':
        return 'Note too large (max 100,000 characters)';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Daily publish limit reached (50/day). Resets at midnight UTC.';
      case 'DATABASE_ERROR':
        return 'Server error. Please try again later.';
      default:
        return 'Failed to publish note';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
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
            <View style={styles.headerContent}>
              <MaterialIcons name="public" size={24} color={colors.tint} />
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Publish Note
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.tint} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading...
                </Text>
              </View>
            ) : publishedNote ? (
              // Published state
              <>
                {/* Published status badge */}
                <View style={[styles.statusBadge, { backgroundColor: colors.surface, borderColor: '#10B981' }]}>
                  <MaterialIcons name="check-circle" size={20} color="#10B981" />
                  <Text style={[styles.statusText, { color: '#10B981' }]}>
                    Published
                  </Text>
                </View>

                {/* Published metadata */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                    Public URL
                  </Text>
                  <Text style={[styles.urlText, { color: colors.tint }]} numberOfLines={1}>
                    {getPublicUrl()}
                  </Text>
                  <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
                    Published {format(new Date(publishedNote.published_at), 'MMM d, yyyy')}
                  </Text>
                </View>

                {/* Action buttons */}
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.tint }]}
                    onPress={handleCopyUrl}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="link" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Copy URL</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.tint }]}
                    onPress={handleShareUrl}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="share" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Share</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={handleViewPublicPage}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="open-in-new" size={20} color={colors.tint} />
                  <Text style={[styles.secondaryButtonText, { color: colors.tint }]}>
                    View Public Page
                  </Text>
                </TouchableOpacity>

                {/* Unpublish button */}
                <TouchableOpacity
                  style={[styles.unpublishButton, { backgroundColor: colors.surface, borderColor: '#EF4444' }]}
                  onPress={handleUnpublish}
                  activeOpacity={0.7}
                  disabled={unpublishing}
                >
                  {unpublishing ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <>
                      <MaterialIcons name="link-off" size={20} color="#EF4444" />
                      <Text style={[styles.unpublishButtonText, { color: '#EF4444' }]}>
                        Unpublish
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              // Unpublished state
              <>
                {/* Info section */}
                <View style={[styles.infoSection, { backgroundColor: colors.surface }]}>
                  <MaterialIcons name="info-outline" size={20} color={colors.tint} />
                  <Text style={[styles.infoText, { color: colors.text }]}>
                    Publishing makes your note publicly accessible via a shareable URL.
                    Anyone with the link can view it.
                  </Text>
                </View>

                {/* Rate limit info */}
                <View style={[styles.rateLimitSection, { backgroundColor: colors.surface }]}>
                  <View style={styles.rateLimitRow}>
                    <Text style={[styles.rateLimitLabel, { color: colors.textSecondary }]}>
                      Publishes remaining today
                    </Text>
                    <Text style={[styles.rateLimitValue, { color: colors.text }]}>
                      {publishesRemaining} / 50
                    </Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: publishesRemaining > 10 ? colors.tint : '#F59E0B',
                          width: `${(publishesRemaining / 50) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.rateLimitNote, { color: colors.textSecondary }]}>
                    Limit resets daily at midnight UTC
                  </Text>
                </View>

                {/* Preview */}
                <View style={[styles.previewSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                    Your note will be published at:
                  </Text>
                  <Text style={[styles.previewUrl, { color: colors.tint }]}>
                    {Platform.OS === 'web' ? window.location.origin : 'https://your-app.com'}/p/
                    <Text style={{ fontWeight: '600' }}>your-note-title</Text>
                  </Text>
                </View>

                {/* Publish button */}
                <TouchableOpacity
                  style={[
                    styles.publishButton,
                    {
                      backgroundColor: publishesRemaining > 0 ? colors.tint : colors.disabled,
                    },
                  ]}
                  onPress={handlePublish}
                  activeOpacity={0.7}
                  disabled={publishing || publishesRemaining <= 0}
                >
                  {publishing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <MaterialIcons name="public" size={20} color="#FFFFFF" />
                      <Text style={styles.publishButtonText}>
                        Publish Note
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
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
    maxHeight: '90%',
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  urlText: {
    fontSize: 14,
    fontWeight: '500',
  },
  metadataText: {
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  unpublishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  unpublishButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  rateLimitSection: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  rateLimitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateLimitLabel: {
    fontSize: 14,
  },
  rateLimitValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  rateLimitNote: {
    fontSize: 12,
  },
  previewSection: {
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  previewUrl: {
    fontSize: 14,
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
