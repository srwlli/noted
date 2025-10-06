import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SharedPageLayout } from '@/components/shared-page-layout';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Card } from '@/components/common/card';

export default function SoonScreen() {
  const { colors } = useThemeColors();

  return (
    <SharedPageLayout>
      <Card
        isAccordion={false}
        headerContent={
          <View style={styles.header}>
            <MaterialIcons name="schedule" size={28} color={colors.text} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Coming Soon</Text>
          </View>
        }
      >
        <View style={styles.content}>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            New features coming soon
          </Text>
        </View>
      </Card>
    </SharedPageLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
});
