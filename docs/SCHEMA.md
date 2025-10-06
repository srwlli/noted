# Noted Schema Reference

**Date**: October 6, 2025
**Schema Version**: 2.1.0

## Overview

This document defines the data schemas, TypeScript interfaces, validation rules, and database relationships for the Noted application. The app uses Supabase as the backend service with TypeScript for type safety, 10-theme system with 18-color palettes, folder organization with favorites, Dashboard with quick access, enhanced authentication, and universal card component architecture.

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

### Folders Table

```sql
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Constraints
ALTER TABLE folders ADD CONSTRAINT folders_name_not_empty CHECK (LENGTH(TRIM(name)) > 0);

-- Indexes
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_parent_id ON folders(parent_folder_id);
CREATE INDEX idx_folders_user_favorite ON folders(user_id, is_favorite) WHERE is_favorite = true;

-- RLS Policies
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own folders" ON folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own folders" ON folders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own folders" ON folders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own folders" ON folders FOR DELETE USING (auth.uid() = user_id);
```

### Notes Table

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL CHECK (LENGTH(TRIM(title)) > 0),
  content TEXT CHECK (LENGTH(content) <= 50000),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_folder_id ON notes(folder_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX idx_notes_user_favorite ON notes(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_notes_user_recent ON notes(user_id, updated_at DESC) WHERE is_favorite = false;

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

### Folder Data Types

```typescript
// Folder Entity
interface Folder {
  id: string;
  name: string;
  user_id: string;
  parent_folder_id: string | null;
  is_favorite: boolean;
  created_at: string; // ISO 8601 format
  updated_at: string; // ISO 8601 format
}

// Folder Creation Request
interface CreateFolderRequest {
  name: string;
  parent_folder_id?: string | null;
}

// Folder Update Request
interface UpdateFolderRequest {
  name?: string;
  is_favorite?: boolean;
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
  folder_id: string | null;
  is_favorite: boolean;
  created_at: string; // ISO 8601 format
  updated_at: string; // ISO 8601 format
}

// Note Creation Request
interface CreateNoteRequest {
  title: string;
  content?: string;
  folder_id?: string | null;
}

// Note Update Request
interface UpdateNoteRequest {
  title?: string;
  content?: string;
  folder_id?: string | null;
  is_favorite?: boolean;
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
// Theme Name Type (10 themes)
export type ThemeName =
  | 'monochrome'
  | 'ocean'
  | 'sepia'
  | 'nord'
  | 'crimson'
  | 'forest'
  | 'lavender'
  | 'amber'
  | 'midnight'
  | 'rose';

// Color Scheme Type
export type ColorSchemeMode = 'light' | 'dark' | 'system';

// Color Scheme Interface (18 colors)
interface ColorScheme {
  // Original 9 colors
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;

  // Extended 9 colors
  elevatedSurface: string;
  selectedSurface: string;
  overlay: string;
  hover: string;
  pressed: string;
  disabled: string;
  highlight: string;
  linkColor: string;
  accentSecondary: string;
}

// Theme Metadata
interface ThemeMetadata {
  displayName: string;
  description: string;
  light: ColorScheme;
  dark: ColorScheme;
}

// Multi-Theme Structure
type Themes = Record<ThemeName, ThemeMetadata>;

// Enhanced Theme Context Interface
interface ThemeControllerContextType {
  themeName: ThemeName;
  colorScheme: ColorSchemeMode;
  resolvedScheme: 'light' | 'dark';
  setTheme: (theme: ThemeName) => Promise<void>;
  setColorScheme: (scheme: ColorSchemeMode) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Theme Storage
interface ThemeStorage {
  getTheme: () => Promise<ThemeName | null>;
  setTheme: (theme: ThemeName) => Promise<void>;
  getColorScheme: () => Promise<ColorSchemeMode | null>;
  setColorScheme: (scheme: ColorSchemeMode) => Promise<void>;
}
```

### Component Props Types

```typescript
// Universal Card Component Props
interface CardProps {
  isAccordion?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  headerContent: React.ReactNode;
  children?: React.ReactNode;
}

// Info Card Props
interface ComingSoonCardProps {
  isExpanded: boolean;
  onToggle: () => void;
}

interface TechStackCardProps {
  isExpanded: boolean;
  onToggle: () => void;
}

interface QuickStartCardProps {
  isExpanded: boolean;
  onToggle: () => void;
}

// Settings Card Props
interface ThemeSettingsCardProps {
  isExpanded: boolean;
  onToggle: () => void;
  onOpenThemePicker: () => void;
}

interface ProfileSettingsCardProps {
  isExpanded: boolean;
  onToggle: () => void;
}

interface AccountSettingsCardProps {
  isExpanded: boolean;
  onToggle: () => void;
  onSignOut: () => void;
  isSigningOut: boolean;
}

// Note Item Props
interface NoteItemProps {
  note: Note;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: (noteId: string) => void;
  onEdit: (note: Note) => void;
  onMoveToFolder: (noteId: string, folderId: string | null) => void;
}

// Layout Props
interface SharedPageLayoutProps extends PropsWithChildren {
  scrollable?: boolean;
}

interface CommonHeaderProps {
  title?: string;
}
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

### Folder Validation

```typescript
// Folder Constraints
const FOLDER_CONSTRAINTS = {
  name: {
    minLength: 1,
    maxLength: 255,
    required: true
  }
};

// Folder validation function
function validateFolder(folder: CreateFolderRequest): ValidationResult {
  const errors: ValidationError[] = [];

  if (!folder.name?.trim()) {
    errors.push({ field: 'name', message: 'Folder name is required', code: 'REQUIRED' });
  } else if (folder.name.length > FOLDER_CONSTRAINTS.name.maxLength) {
    errors.push({
      field: 'name',
      message: `Folder name must not exceed ${FOLDER_CONSTRAINTS.name.maxLength} characters`,
      code: 'MAX_LENGTH'
    });
  }

  return { isValid: errors.length === 0, errors };
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
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │     folders     │       │      notes      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄─────┤│ user_id (FK)    │       │ id (PK)         │
│ email           │      1:N│ id (PK)         │◄─────┤│ folder_id (FK)  │
│ name            │       │ name            │      0:N│ user_id (FK)    │
│ created_at      │       │ parent_id (FK)  │───┐   │ title           │
│ updated_at      │       │ created_at      │   │   │ content         │
│ last_login_at   │       │ updated_at      │◄──┘   │ created_at      │
└─────────────────┘       └─────────────────┘       │ updated_at      │
        │                                            └─────────────────┘
        │ 1:1                                                 ▲
        ▼                                                     │
┌─────────────────┐                                          │
│  user_settings  │                                          │ 1:N
├─────────────────┤                                          │
│ user_id (FK,PK) │                                          │
│ theme           │                                          │
│ font_size       │                        ┌─────────────────┘
│ notifications   │                        │
│ privacy         │              ┌─────────────────┐
│ created_at      │              │     users       │
│ updated_at      │              └─────────────────┘
└─────────────────┘
```

### Constraints and Foreign Keys

- **users.email**: UNIQUE constraint
- **folders.user_id**: FOREIGN KEY references auth.users(id) ON DELETE CASCADE
- **folders.parent_folder_id**: FOREIGN KEY references folders(id) ON DELETE CASCADE (self-reference for nested folders)
- **folders.name**: NOT NULL constraint with CHECK (LENGTH(TRIM(name)) > 0)
- **folders.is_favorite**: BOOLEAN NOT NULL DEFAULT false
- **notes.user_id**: FOREIGN KEY references users(id) ON DELETE CASCADE
- **notes.folder_id**: FOREIGN KEY references folders(id) ON DELETE SET NULL (nullable)
- **notes.title**: NOT NULL constraint with CHECK (LENGTH(TRIM(title)) > 0)
- **notes.content**: CHECK constraint (LENGTH(content) <= 50000)
- **notes.is_favorite**: BOOLEAN NOT NULL DEFAULT false
- **user_settings.user_id**: FOREIGN KEY references users(id) ON DELETE CASCADE, UNIQUE constraint
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
- `NOTE_NOT_FOUND`: Note does not exist or user lacks access
- `FOLDER_NOT_FOUND`: Folder does not exist or user lacks access

### Theme System Errors

- `THEME_INVALID_NAME`: Invalid theme name provided (must be one of: monochrome, ocean, sepia, nord, crimson, forest, lavender, amber, midnight, rose)
- `THEME_INVALID_COLOR_SCHEME`: Invalid color scheme mode (must be: light, dark, system)
- `THEME_PERSISTENCE_FAILED`: Failed to save theme preferences to AsyncStorage
- `THEME_LOAD_FAILED`: Failed to load theme preferences from AsyncStorage

### Folder Errors

- `FOLDER_NAME_REQUIRED`: Folder name cannot be empty
- `FOLDER_NAME_TOO_LONG`: Folder name exceeds 255 characters
- `FOLDER_CIRCULAR_REFERENCE`: Cannot set folder as its own parent
- `FOLDER_DELETE_HAS_NOTES`: Cannot delete folder containing notes (notes will be moved to "All Notes")

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

**Date**: October 6, 2025
**Schema Version**: 2.1.0

🤖 Generated with [Claude Code](https://claude.com/claude-code)

This schema reference provides comprehensive data structure documentation for the Noted application, including:

- **10 Theme System**: 18-color palettes with light/dark modes (monochrome, ocean, sepia, nord, crimson, forest, lavender, amber, midnight, rose)
- **Folder Organization**: Hierarchical folder structure with parent-child relationships, favorites support, and ON DELETE SET NULL cascading
- **Note & Folder Favorites**: is_favorite boolean fields with partial indexes for efficient Dashboard queries
- **Dashboard Support**: Optimized queries for favorite notes, favorite folders, and recent non-favorite notes
- **Universal Card Component**: Standardized accordion UI with consistent props across info, folders, settings, and note cards
- **Input Validation**: Database-level constraints (title: 200 chars, content: 50,000 chars, folder name: 255 chars)
- **Type Safety**: Complete TypeScript interfaces for all data structures, API responses, and component props
- **Row-Level Security**: Supabase RLS policies ensuring users can only access their own data

Optimized for AI-assisted development with complete type definitions, validation rules, and database relationships for seamless integration and extension.