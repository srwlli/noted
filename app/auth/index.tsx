import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { toast } from 'sonner-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useAuth } from '@/hooks/use-auth';
import { router } from 'expo-router';
import { validateEmail, validatePassword } from '@/lib/validation';
import { supabase } from '@/lib/supabase';

export default function AuthScreen() {
  const { colors } = useThemeColors();
  const { signIn, signUp, resetPassword, loading, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  // Phase 2: Detect email verification success from URL hash
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      // Parse the session to get user email
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');

      // Get user email from Supabase session and pre-fill
      if (accessToken) {
        supabase.auth.getUser(accessToken).then(({ data }) => {
          if (data?.user?.email) {
            setEmail(data.user.email); // Pre-fill email for easy login
          }
        });
      }

      toast.success('Email verified! Please log in');
      setIsLogin(true); // Switch to login tab
      setPassword(''); // Clear password for security
      window.history.replaceState({}, '', '/auth'); // Clean URL
    }
  }, []);

  const handleSubmit = async () => {
    // Phase 1: Client-side validation
    const emailValidationError = validateEmail(email);
    const passwordValidationError = !isLogin ? validatePassword(password) : null;

    setEmailError(emailValidationError);
    setPasswordError(passwordValidationError);

    if (emailValidationError || passwordValidationError) {
      return; // Don't submit if validation fails
    }

    setIsSubmitting(true);
    try {
      const { error, data } = isLogin
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        // Phase 3: Enhanced error handling
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          toast.error('This email is already registered. Please sign in.');
          setIsLogin(true); // Switch to login tab
          setPassword(''); // Clear password
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password');
        } else if (error.message.includes('password')) {
          toast.error('Password is too weak. Please use at least 8 characters with uppercase, lowercase, and numbers.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          toast.error('Connection failed. Please check your internet and try again.');
        } else {
          toast.error(error.message || 'Authentication failed');
        }
      } else if (!isLogin) {
        toast.success('Please check your email to confirm your account');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setEmailError(null);
    setPasswordError(null);
  };

  // Real-time validation handlers
  const handleEmailBlur = () => {
    setEmailError(validateEmail(email));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (!isLogin) {
      setPasswordError(validatePassword(value));
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setIsResetting(true);
    try {
      const { error } = await resetPassword(forgotEmail);

      if (error) {
        toast.error(error.message || 'Failed to send reset email');
      } else {
        toast.success('Check your email for password reset instructions');
        setShowForgotPassword(false);
        setForgotEmail('');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Branding */}
        <Text style={[styles.cardTitle, { color: colors.text }]}>noted</Text>

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
          <View>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, borderColor: emailError ? '#ef4444' : colors.border, color: colors.text }
              ]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              onBlur={handleEmailBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isSubmitting}
            />
            {emailError && (
              <Text style={[styles.errorText, { color: '#ef4444' }]}>{emailError}</Text>
            )}
          </View>

          <View>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, borderColor: passwordError ? '#ef4444' : colors.border, color: colors.text }
              ]}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              autoComplete="password"
              editable={!isSubmitting}
            />
            {passwordError && (
              <Text style={[styles.errorText, { color: '#ef4444' }]}>{passwordError}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.tint },
              (isSubmitting || loading || !!emailError || !!passwordError) && { opacity: 0.6 }
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || loading || !!emailError || !!passwordError}
          >
            {isSubmitting ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color={colors.background} />
                <Text style={[styles.submitButtonText, { color: colors.background }]}>Loading...</Text>
              </View>
            ) : (
              <Text style={[styles.submitButtonText, { color: colors.background }]}>
                {isLogin ? 'Sign in' : 'Create account'}
              </Text>
            )}
          </TouchableOpacity>

          {isLogin && (
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => setShowForgotPassword(true)}
            >
              <Text style={[styles.forgotPasswordText, { color: colors.textSecondary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotPassword}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowForgotPassword(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Reset Password</Text>
            <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
              Enter your email address and we'll send you instructions to reset your password.
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={forgotEmail}
              onChangeText={setForgotEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => {
                  setShowForgotPassword(false);
                  setForgotEmail('');
                }}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.resetButton, { backgroundColor: colors.tint }]}
                onPress={handleForgotPassword}
                disabled={isResetting}
              >
                <Text style={[styles.resetButtonText, { color: colors.background }]}>
                  {isResetting ? 'Sending...' : 'Send Reset Email'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
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
  errorText: {
    fontSize: 13,
    marginTop: 4,
    marginLeft: 4,
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
  forgotPasswordButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  resetButton: {
    // backgroundColor set dynamically
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});