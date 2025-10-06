import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { SharedPageLayout } from '@/components/shared-page-layout';
import { NoteItem } from '@/components/note-item';
import { Card } from '@/components/common/card';
import { notesService, Note } from '@/services/notes';

export default function DashboardScreen() {
  const { colors } = useThemeColors();
  const [favoriteNotes, setFavoriteNotes] = useState<Note[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setError(null);
      const favorites = await notesService.getFavoriteNotes();
      const recent = await notesService.getRecentNonFavoriteNotes(3);
      setFavoriteNotes(favorites);
      setRecentNotes(recent);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Reload data when Dashboard tab gains focus
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <SharedPageLayout>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SharedPageLayout>
    );
  }

  const showEmptyState = favoriteNotes.length === 0 && recentNotes.length === 0;

  return (
    <SharedPageLayout onRefresh={handleRefresh} refreshing={refreshing}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.tint]}
            tintColor={colors.tint}
          />
        }
      >
        {/* Error Message */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: '#fee2e2', borderColor: '#fecaca' }]}>
            <Text style={[styles.errorText, { color: '#dc2626' }]}>{error}</Text>
          </View>
        )}

        {/* Empty State */}
        {showEmptyState && (
          <>
            <Card
              isAccordion={false}
              headerContent={
                <View style={styles.emptyCardHeader}>
                  <MaterialIcons name="star-border" size={32} color={colors.textSecondary} />
                  <Text style={[styles.emptyCardTitle, { color: colors.text }]}>Favorites</Text>
                </View>
              }
            >
              <View style={styles.emptyCardContent}>
                <Text style={[styles.emptyCardText, { color: colors.textSecondary }]}>
                  Add fav for quick access
                </Text>
              </View>
            </Card>

            <Card
              isAccordion={false}
              headerContent={
                <View style={styles.emptyCardHeader}>
                  <MaterialIcons name="access-time" size={32} color={colors.textSecondary} />
                  <Text style={[styles.emptyCardTitle, { color: colors.text }]}>Recent Notes</Text>
                </View>
              }
            >
              <View style={styles.emptyCardContent}>
                <Text style={[styles.emptyCardText, { color: colors.textSecondary }]}>
                  Last 3 notes here
                </Text>
              </View>
            </Card>
          </>
        )}

        {/* Favorites Section (no header) */}
        {favoriteNotes.length > 0 && (
          <View>
            {favoriteNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onFavoriteToggle={loadDashboardData}
              />
            ))}
          </View>
        )}

        {/* Last 3 Section (with header) */}
        {recentNotes.length > 0 && (
          <View>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>Last 3</Text>
            {recentNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onFavoriteToggle={loadDashboardData}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SharedPageLayout>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 24,
  },
  emptyCardHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  emptyCardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyCardContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  emptyCardText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
