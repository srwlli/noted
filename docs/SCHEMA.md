# Noted Schema Reference

**Date**: October 2, 2025
**Schema Version**: 1.3.0

## Overview

This document defines the data schemas, TypeScript interfaces, validation rules, and database relationships for the Noted application. The app uses Supabase as the backend service with TypeScript for type safety, multi-theme support, enhanced authentication with forgot password functionality, and Sonner toast notification integration.

**Referenced Documentation**:
- README.md: Modern React Native note-taking app with Expo Router and Supabase backend
- ARCHITECTURE.md: Expo SDK 54 + React Native architecture with file-based routing and theme system
- API.md: RESTful API interface with JWT authentication and CRUD operations for notes
- COMPONENTS.md: TypeScript components with theme-aware styling and cross-platform support

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
```

### Notes Table

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL CHECK (LENGTH(TRIM(title)) > 0),
  content TEXT CHECK (LENGTH(content) <= 50000),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);

-- RLS Policies
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notes" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own notes" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON notes FOR DELETE USING (auth.uid() = user_id);
```

### User Settings Table

```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(10) DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
  font_size VARCHAR(10) DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  notifications JSONB DEFAULT '{"email": true, "push": false}',
  privacy JSONB DEFAULT '{"shareAnalytics": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
```

## TypeScript Interfaces

### Authentication Types

```typescript
// Auth Context Interface
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

// Supabase User Type (imported from @supabase/supabase-js)
interface User {
  id: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
}

// Supabase Session Type (imported from @supabase/supabase-js)
interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: User;
}
```

### Note Data Types

```typescript
// Note Entity
interface Note {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string; // ISO 8601 format
  updated_at: string; // ISO 8601 format
}

// Note Creation Request
interface CreateNoteRequest {
  title: string;
  content?: string;
}

// Note Update Request
interface UpdateNoteRequest {
  title?: string;
  content?: string;
}

// Notes List Response
interface NotesListResponse {
  notes: Note[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

### Multi-Theme System Types

```typescript
// Theme Name Type
export type ThemeName = 'greyscale' | 'appleNotes';

// Color Scheme Type
export type ColorSchemeMode = 'light' | 'dark' | 'system';

// Color Scheme Interface
interface ColorScheme {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
}

// Multi-Theme Structure
interface Themes {
  greyscale: {
    light: ColorScheme;
    dark: ColorScheme;
  };
  appleNotes: {
    light: ColorScheme;
    dark: ColorScheme;
  };
}

// Enhanced Theme Context Interface
interface ThemeControllerContextType {
  themeName: ThemeName;
  colorScheme: ColorSchemeMode;
  resolvedScheme: 'light' | 'dark';
  setTheme: (theme: ThemeName) => Promise<void>;
  setColorScheme: (scheme: ColorSchemeMode) => Promise<void>;
  isLoading: boolean;
}

// Themed Component Props
interface ThemedProps {
  lightColor?: string;
  darkColor?: string;
}

type ThemedTextProps = TextProps & ThemedProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

type ThemedViewProps = ViewProps & ThemedProps;
```

### Component Props Types

```typescript
// Navigation Component Props
interface HapticTabProps extends BottomTabBarButtonProps {}

interface ExternalLinkProps extends Omit<ComponentProps<typeof Link>, 'href'> {
  href: Href & string;
}

// UI Component Props
interface CollapsibleProps extends PropsWithChildren {
  title: string;
}

interface IconSymbolProps {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}

interface ParallaxScrollViewProps extends PropsWithChildren {
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}

// Icon Symbol Names (SF Symbols mapping)
type IconSymbolName =
  | 'house.fill'
  | 'note.text'
  | 'gear'
  | 'paperplane.fill'
  | 'chevron.left.forwardslash.chevron.right'
  | 'chevron.right'
  | 'plus'
  | 'trash'
  | 'pencil';
```

### Settings Types

```typescript
interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  notifications: {
    email: boolean;
    push: boolean;
  };
  privacy: {
    shareAnalytics: boolean;
  };
}

interface SettingsUpdateRequest extends Partial<UserSettings> {}

### Notification Types

```typescript
// Sonner Toast Types
interface ToastOptions {
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  theme?: 'light' | 'dark' | 'system';
  expand?: boolean;
  richColors?: boolean;
  closeButton?: boolean;
}

// Toast Message Types
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  type: ToastType;
  message: string;
  duration?: number;
}

// Auth-related Toast Messages
interface AuthToastMessages {
  signInSuccess: 'Welcome back!';
  signUpSuccess: 'Please check your email to confirm your account';
  passwordResetSuccess: 'Check your email for password reset instructions';
  signOutSuccess: 'Signed out successfully';
  validationError: 'Please fill in all fields';
  authenticationError: string; // Dynamic based on Supabase error
  passwordResetError: string; // Dynamic based on Supabase error
}
```

## API Response Schemas

### Success Response Schema

```typescript
interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;
```

### Authentication Responses

```typescript
interface AuthResponse {
  user: User;
  token: string;
}

interface ProfileResponse {
  user: User & {
    notesCount: number;
  };
}
```

## Validation Rules

### Input Validation

```typescript
// Email Validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password Requirements
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: false,
  requireLowercase: false,
  requireNumbers: false,
  requireSpecialChars: false
};

// Note Validation (matches database constraints)
const NOTE_CONSTRAINTS = {
  title: {
    minLength: 1,
    maxLength: 200,
    required: true
  },
  content: {
    maxLength: 50000,
    required: false
  }
};

// User Profile Validation
const USER_CONSTRAINTS = {
  name: {
    minLength: 1,
    maxLength: 255,
    required: true
  },
  email: {
    pattern: EMAIL_REGEX,
    maxLength: 255,
    required: true
  }
};
```

### Schema Validation Functions

```typescript
// Validation helper types
interface ValidationError {
  field: string;
  message: string;
  code: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Example validation functions
function validateEmail(email: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required', code: 'REQUIRED' });
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'Invalid email format', code: 'INVALID_FORMAT' });
  }

  return { isValid: errors.length === 0, errors };
}

function validateNote(note: CreateNoteRequest): ValidationResult {
  const errors: ValidationError[] = [];

  if (!note.title?.trim()) {
    errors.push({ field: 'title', message: 'Title is required', code: 'REQUIRED' });
  } else if (note.title.length > NOTE_CONSTRAINTS.title.maxLength) {
    errors.push({
      field: 'title',
      message: `Title must not exceed ${NOTE_CONSTRAINTS.title.maxLength} characters`,
      code: 'MAX_LENGTH'
    });
  }

  if (note.content && note.content.length > NOTE_CONSTRAINTS.content.maxLength) {
    errors.push({
      field: 'content',
      message: `Content must not exceed ${NOTE_CONSTRAINTS.content.maxLength} characters`,
      code: 'MAX_LENGTH'
    });
  }

  return { isValid: errors.length === 0, errors };
}
```

## Database Relationships

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│     users       │       │      notes      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄─────┤│ user_id (FK)    │
│ email           │      1:N│ id (PK)         │
│ name            │       │ title           │
│ created_at      │       │ content         │
│ updated_at      │       │ created_at      │
│ last_login_at   │       │ updated_at      │
└─────────────────┘       └─────────────────┘
        │
        │ 1:1
        ▼
┌─────────────────┐
│  user_settings  │
├─────────────────┤
│ user_id (FK,PK) │
│ theme           │
│ font_size       │
│ notifications   │
│ privacy         │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

### Constraints and Foreign Keys

- **users.email**: UNIQUE constraint
- **notes.user_id**: FOREIGN KEY references users(id) ON DELETE CASCADE
- **user_settings.user_id**: FOREIGN KEY references users(id) ON DELETE CASCADE, UNIQUE constraint
- **notes.title**: NOT NULL constraint
- **users.email, users.name**: NOT NULL constraints

## Error Codes

### Authentication Errors

- `AUTH_INVALID_CREDENTIALS`: Invalid email or password
- `AUTH_EMAIL_EXISTS`: Email already registered
- `AUTH_TOKEN_EXPIRED`: JWT token has expired
- `AUTH_TOKEN_INVALID`: JWT token is malformed or invalid
- `AUTH_USER_NOT_FOUND`: User account does not exist
- `AUTH_PASSWORD_RESET_FAILED`: Failed to send password reset email
- `AUTH_INVALID_EMAIL_FORMAT`: Email address format is invalid
- `AUTH_PASSWORD_RESET_EXPIRED`: Password reset token has expired

### Validation Errors

- `VALIDATION_REQUIRED`: Required field is missing
- `VALIDATION_INVALID_FORMAT`: Field format is invalid
- `VALIDATION_MAX_LENGTH`: Field exceeds maximum length
- `VALIDATION_MIN_LENGTH`: Field below minimum length

### Resource Errors

- `RESOURCE_NOT_FOUND`: Requested resource does not exist
- `RESOURCE_ACCESS_DENIED`: User lacks permission to access resource
- `RESOURCE_CONFLICT`: Resource conflicts with existing data

### Theme System Errors

- `THEME_INVALID_NAME`: Invalid theme name provided
- `THEME_INVALID_COLOR_SCHEME`: Invalid color scheme mode
- `THEME_PERSISTENCE_FAILED`: Failed to save theme preferences to storage
- `THEME_LOAD_FAILED`: Failed to load theme preferences from storage

## Environment Configuration

```typescript
// Environment Variables Schema
interface EnvironmentConfig {
  EXPO_PUBLIC_SUPABASE_URL: string;
  EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

// Supabase Configuration
interface SupabaseConfig {
  url: string;
  anonKey: string;
  options?: {
    auth: {
      autoRefreshToken: boolean;
      persistSession: boolean;
      detectSessionInUrl: boolean;
    };
  };
}
```

---

**Date**: October 2, 2025
**Schema Version**: 1.3.0

🤖 Generated with [Claude Code](https://claude.ai/code)

This schema reference provides comprehensive data structure documentation for the Noted application, including multi-theme support, enhanced authentication with forgot password functionality, Sonner toast notification integration, and input validation constraints. Optimized for AI-assisted development with complete type definitions, validation rules, and database relationships for seamless integration and extension.