/**
 * Email validation utility
 * Returns null if valid, error message string if invalid
 */
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return 'Email is required';
  }

  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }

  return null;
};

/**
 * Password validation utility
 * Returns null if valid, error message string if invalid
 */
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must contain an uppercase letter';
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must contain a lowercase letter';
  }

  if (!/[0-9]/.test(password)) {
    return 'Password must contain a number';
  }

  return null;
};
