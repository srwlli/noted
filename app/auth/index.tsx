import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useAuth } from '@/hooks/use-auth';
import { router } from 'expo-router';

export default function AuthScreen() {
  const { colors } = useThemeColors();
  const { signIn, signUp, loading, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Auth attempt:', { isLogin, email });

      const { error, data } = isLogin
        ? await signIn(email, password)
        : await signUp(email, password);

      console.log('Auth response:', { error, data });

      if (error) {
        console.error('Auth error:', error);
        Alert.alert('Error', error.message || 'Authentication failed');
      } else if (!isLogin) {
        console.log('Signup successful, showing success message');
        Alert.alert('Success', 'Please check your email to confirm your account');
      } else {
        console.log('Login successful, redirecting to dashboard');
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('Auth exception:', err);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.branding, { color: colors.text }]}>noted</Text>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Tab Toggle */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              { borderBottomColor: isLogin ? colors.tint : colors.border },
              isLogin && styles.activeTab
            ]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.tabText, { color: isLogin ? colors.tint : colors.textSecondary }]}>
              Welcome back
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              { borderBottomColor: !isLogin ? colors.tint : colors.border },
              !isLogin && styles.activeTab
            ]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.tabText, { color: !isLogin ? colors.tint : colors.textSecondary }]}>
              Sign up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.tint }]}
            onPress={handleSubmit}
            disabled={isSubmitting || loading}
          >
            <Text style={[styles.submitButtonText, { color: colors.background }]}>
              {isSubmitting ? 'Loading...' : (isLogin ? 'Sign in' : 'Create account')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  branding: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 48,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    paddingBottom: 12,
    borderBottomWidth: 2,
    alignItems: 'center',
  },
  activeTab: {
    // Active styling handled by border color
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    gap: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  submitButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});