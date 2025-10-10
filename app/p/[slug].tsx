import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Platform, Share } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { publishService } from '@/services/publish';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import { toast } from 'sonner-native';
import { format } from 'date-fns';

interface PublicNote {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  slug: string;
}

/**
 * Public note viewing route
 * Accessible at /p/[slug] without authentication
 * Displays published notes in read-only mode
 */
export default function PublicNoteScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [note, setNote] = useState<PublicNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useThemeColors();

  // Load published note by slug
  useEffect(() => {
    async function loadPublicNote() {
      if (!slug) {
        setError('No slug provided');
        setLoading(false);
        return;
      }

      try {
        const publicNote = await publishService.getPublicNoteBySlug(slug);

        if (!publicNote) {
          setError('Note not found or no longer published');
          setLoading(false);
          return;
        }

        setNote(publicNote as PublicNote);
        setError(null);
      } catch (err) {
        console.error('Failed to load public note:', err);
        setError('Failed to load note');
      } finally {
        setLoading(false);
      }
    }

    loadPublicNote();
  }, [slug]);

  const handleCopyUrl = async () => {
    if (!slug) return;

    const url = Platform.OS === 'web'
      ? window.location.href
      : `${process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:8081'}/p/${slug}`;

    await Clipboard.setStringAsync(url);
    toast.success('URL copied to clipboard');
  };

  const handleShare = async () => {
    if (!slug || !note) return;

    const url = Platform.OS === 'web'
      ? window.location.href
      : `${process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:8081'}/p/${slug}`;

    try {
      if (Platform.OS === 'web') {
        // Web: Use Web Share API or fallback to copy
        if (navigator.share) {
          await navigator.share({
            title: note.title,
            url: url
          });
        } else {
          await handleCopyUrl();
        }
      } else {
        // Mobile: Use Share sheet
        await Share.share({
          message: `${note.title}\n\n${url}`,
          title: note.title,
          url: url
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Don't show error if user cancelled
    }
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Loading...',
            headerStyle: {
              backgroundColor: colors.surface,
              height: 52,
            },
            headerTintColor: colors.text,
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <MaterialIcons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading published note...
          </Text>
        </View>
      </>
    );
  }

  // Error state (404 or network error)
  if (error || !note) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Not Found',
            headerStyle: {
              backgroundColor: colors.surface,
              height: 52,
            },
            headerTintColor: colors.text,
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <MaterialIcons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
          <MaterialIcons name="error-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Note Not Found
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            This note may have been unpublished or the link is incorrect.
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.tint }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: note.title,
          headerStyle: {
            backgroundColor: colors.surface,
            height: 52,
          },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleShare}
              activeOpacity={0.7}
              style={{ marginRight: 16 }}
            >
              <MaterialIcons name="share" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Note metadata */}
          <View style={[styles.metadataContainer, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              {note.title}
            </Text>
            <View style={styles.metadataRow}>
              <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
                Published {format(new Date(note.published_at), 'MMM d, yyyy')}
              </Text>
              {note.updated_at !== note.created_at && (
                <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
                  • Updated {format(new Date(note.updated_at), 'MMM d, yyyy')}
                </Text>
              )}
            </View>
          </View>

          {/* Rendered markdown */}
          <View style={styles.markdownContainer}>
            <MarkdownRenderer markdown={note.content} scrollable={false} />
          </View>

          {/* Footer with copy URL button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.copyButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleCopyUrl}
              activeOpacity={0.7}
            >
              <MaterialIcons name="link" size={20} color={colors.tint} />
              <Text style={[styles.copyButtonText, { color: colors.tint }]}>
                Copy Link
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  metadataContainer: {
    padding: 24,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metadataText: {
    fontSize: 14,
  },
  markdownContainer: {
    padding: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
