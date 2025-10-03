import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { toast } from 'sonner-native';

interface MarkdownErrorBoundaryProps {
  children: ReactNode;
}

interface MarkdownErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for markdown editor
 * Catches crashes and provides graceful fallback
 *
 * On error:
 * - Shows error UI with option to go back
 * - Displays toast notification
 * - Logs error to console
 *
 * Note: Does NOT render old modal as fallback
 * Instead shows error message and allows user to navigate back
 */
export class MarkdownErrorBoundary extends Component<
  MarkdownErrorBoundaryProps,
  MarkdownErrorBoundaryState
> {
  constructor(props: MarkdownErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): MarkdownErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console for debugging
    console.error('Markdown editor error:', error, errorInfo);

    // Show toast notification
    toast.error('Editor error occurred. Please try again or use the old editor.');
  }

  handleGoBack = () => {
    // Reset error state
    this.setState({ hasError: false, error: null });

    // Navigate back to previous screen
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <MaterialIcons name="error-outline" size={64} color="#EF4444" />
            <Text style={styles.title}>Editor Error</Text>
            <Text style={styles.message}>
              The markdown editor encountered an unexpected error.
            </Text>
            <Text style={styles.suggestion}>
              You can go back and try again, or use the old editor from settings.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorDetailsTitle}>Error Details (Dev Only):</Text>
                <Text style={styles.errorDetailsText}>{this.state.error.message}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={this.handleGoBack}>
              <MaterialIcons name="arrow-back" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  suggestion: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorDetails: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    width: '100%',
  },
  errorDetailsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 4,
  },
  errorDetailsText: {
    fontSize: 11,
    color: '#DC2626',
    fontFamily: 'monospace',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
