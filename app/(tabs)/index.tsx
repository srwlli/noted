import { Text, View, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function HomeScreen() {
  const { colors } = useThemeColors();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Theme Demo App</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Testing theme switching functionality
        </Text>
      </View>

      {/* Button Grid */}
      <View style={styles.buttonGrid}>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.buttonText, { color: colors.text }]}>Button 1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.buttonText, { color: colors.text }]}>Button 2</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.buttonText, { color: colors.text }]}>Button 3</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.buttonText, { color: colors.text }]}>Button 4</Text>
        </TouchableOpacity>
      </View>

      {/* Card Grid */}
      <View style={styles.cardGrid}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Card One</Text>
          <Text style={[styles.cardContent, { color: colors.textSecondary }]}>
            Background color changes with theme.
          </Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Card Two</Text>
          <Text style={[styles.cardContent, { color: colors.textSecondary }]}>
            Text adapts to light/dark mode.
          </Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Card Three</Text>
          <Text style={[styles.cardContent, { color: colors.textSecondary }]}>
            Go to Settings to toggle theme.
          </Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Card Four</Text>
          <Text style={[styles.cardContent, { color: colors.textSecondary }]}>
            Theme preference persists.
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Theme System Demo • 2025
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
  },
});
