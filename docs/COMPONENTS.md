# Noted Component Library

**Framework**: React Native + Expo
**Version**: 1.3.0
**Date**: September 30, 2025

---

## Overview

Component library reference for the Noted React Native application. All components follow a multi-theme architecture supporting **5 themes** (Greyscale, Apple Notes, Sepia, Nord, Bear Red Graphite) with light/dark variants and a **17-color system**. Components are built with TypeScript, NativeWind (TailwindCSS), and integrated theme management.

**Referenced Documentation:**
- **README.md**: Setup, quickstart, and usage examples
- **ARCHITECTURE.md**: System design, tech stack, and data flow patterns
- **API.md**: Backend API interface and Supabase integration

---

## Table of Contents

1. [Theme System](#theme-system)
2. [Layout Components](#layout-components)
3. [UI Components](#ui-components)
4. [Note Components](#note-components)
5. [Authentication Components](#authentication-components)
6. [Modal Components](#modal-components)
7. [Hooks](#hooks)
8. [State Management](#state-management)

---

## Theme System

### ThemeController Context

Multi-theme system supporting 5 themes with 17-color palettes.

**Location**: `contexts/theme-controller.tsx`

**Provider Props:**
```typescript
interface ThemeControllerProps {
  children: React.ReactNode;
}
```

**Context Value:**
```typescript
interface ThemeControllerValue {
  themeName: ThemeName;              // 'greyscale' | 'appleNotes' | 'sepia' | 'nord' | 'bearRedGraphite'
  setTheme: (theme: ThemeName) => void;
  colorScheme: ColorSchemeMode;      // 'light' | 'dark' | 'system'
  setColorScheme: (mode: ColorSchemeMode) => void;
  resolvedScheme: 'light' | 'dark';  // Computed scheme
}
```

**Usage Example:**
```typescript
import { useThemeController } from '@/contexts/theme-controller';

function ThemeSwitcher() {
  const { themeName, setTheme, colorScheme, setColorScheme } = useThemeController();

  return (
    <>
      <Button onPress={() => setTheme('appleNotes')}>
        Apple Notes Theme
      </Button>
      <Button onPress={() => setColorScheme('dark')}>
        Dark Mode
      </Button>
    </>
  );
}
```

**Theme Definitions:**
```typescript
// constants/theme.ts
type ThemeName = 'greyscale' | 'appleNotes' | 'sepia' | 'nord' | 'bearRedGraphite';

interface ColorScheme {
  // Original 9 colors
  background: string;      // Page background
  surface: string;         // Card/surface color
  text: string;           // Primary text
  textSecondary: string;  // Secondary text
  border: string;         // Borders and dividers
  tint: string;           // Active elements
  icon: string;           // Default icons
  tabIconDefault: string; // Tab bar inactive
  tabIconSelected: string; // Tab bar active

  // New 8 colors (Phase 2)
  elevatedSurface: string;  // Layered UI (modals, popovers)
  overlay: string;          // Semi-transparent backdrops (rgba)
  hover: string;            // Interactive hover states
  pressed: string;          // Active/pressed button states
  disabled: string;         // Disabled UI elements
  highlight: string;        // Selections, notifications
  linkColor: string;        // Hyperlinks (can differ from tint)
  accentSecondary: string;  // Secondary accent variety
}

// Greyscale Light Example
{
  background: '#fafafa',
  surface: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#6a6a6a',
  border: '#e0e0e0',
  tint: '#4a4a4a',
  elevatedSurface: '#f2f2f0',
  overlay: 'rgba(18, 18, 18, 0.5)',
  hover: '#ececec',
  pressed: '#e0e0e0',
  disabled: '#bcbcbc',
  highlight: '#ffeb3b',
  linkColor: '#0066cc',  // Traditional blue
  accentSecondary: '#6a6a6a',
}

// Apple Notes Light Example
{
  background: '#fbf9f6',  // Warm cream
  surface: '#ffffff',
  text: '#1c1c1e',
  textSecondary: '#8e8e93',
  border: '#d1d1d6',
  tint: '#007aff',        // Apple blue
  elevatedSurface: '#ffffff',
  overlay: 'rgba(28, 28, 30, 0.4)',
  hover: '#f5f3f0',
  linkColor: '#007aff',
  // ... + 5 more colors
}
```

**Persistence:**
- Theme name stored in AsyncStorage: `@noted_theme_preference`
- Color scheme stored in AsyncStorage: `@noted_theme_name`

---

## Layout Components

### ThemedView

Theme-aware container component that automatically applies background color based on active theme.

**Location**: `components/themed-view.tsx`

**Props:**
```typescript
interface ThemedViewProps extends ViewProps {
  lightColor?: string;  // Override light theme color
  darkColor?: string;   // Override dark theme color
}
```

**Usage:**
```typescript
import { ThemedView } from '@/components/themed-view';

<ThemedView style={{ flex: 1, padding: 16 }}>
  <Text>Content automatically themed</Text>
</ThemedView>

// With color overrides
<ThemedView
  lightColor="#f0f0f0"
  darkColor="#2a2a2a"
  style={{ padding: 20 }}
>
  <Text>Custom colors</Text>
</ThemedView>
```

---

### ThemedText

Theme-aware text component with typography variants.

**Location**: `components/themed-text.tsx`

**Props:**
```typescript
interface ThemedTextProps extends TextProps {
  lightColor?: string;                    // Override light theme color
  darkColor?: string;                     // Override dark theme color
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
}
```

**Typography Styles:**
```typescript
{
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
}
```

**Usage:**
```typescript
import { ThemedText } from '@/components/themed-text';

<ThemedText type="title">Page Title</ThemedText>
<ThemedText type="subtitle">Section Header</ThemedText>
<ThemedText type="defaultSemiBold">Important text</ThemedText>
<ThemedText>Regular body text</ThemedText>
<ThemedText type="link" onPress={handlePress}>Learn more</ThemedText>
```

---

### SharedPageLayout

Common page layout wrapper with header, scrolling, and responsive design.

**Location**: `components/shared-page-layout.tsx`

**Props:**
```typescript
interface SharedPageLayoutProps {
  children: React.ReactNode;
  onNewNote?: () => void;       // Add note handler
  onRefresh?: () => void;       // Pull-to-refresh handler
  refreshing?: boolean;         // Loading state
  scrollable?: boolean;         // Enable scrolling (default: true)
}
```

**Features:**
- Fixed header with common navigation
- Responsive padding for web/PWA
- Pull-to-refresh support
- Automatic theme integration
- Safe area handling

**Usage:**
```typescript
import { SharedPageLayout } from '@/components/shared-page-layout';

function NotesScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotes();
    setRefreshing(false);
  };

  const handleNewNote = () => {
    router.push('/note/new');
  };

  return (
    <SharedPageLayout
      onNewNote={handleNewNote}
      onRefresh={handleRefresh}
      refreshing={refreshing}
      scrollable={true}
    >
      {/* Page content */}
    </SharedPageLayout>
  );
}
```

---

## UI Components

### IconSymbol

Cross-platform icon component using SF Symbols (iOS) and Material Icons (Android/Web).

**Location**: `components/ui/icon-symbol.tsx`, `components/ui/icon-symbol.ios.tsx`

**Props:**
```typescript
interface IconSymbolProps {
  name: IconSymbolName;                     // Icon identifier
  size?: number;                            // Icon size (default: 24)
  color: string | OpaqueColorValue;        // Icon color
  style?: StyleProp<TextStyle>;            // Additional styles
  weight?: SymbolWeight;                   // iOS only
}

type IconSymbolName =
  | 'house.fill'
  | 'paperplane.fill'
  | 'chevron.left.forwardslash.chevron.right'
  | 'chevron.right';
```

**Icon Mapping:**
```typescript
// SF Symbol → Material Icon
{
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
}
```

**Usage:**
```typescript
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColors } from '@/hooks/use-theme-colors';

function NavigationIcon() {
  const { colors } = useThemeColors();

  return (
    <IconSymbol
      name="house.fill"
      size={24}
      color={colors.icon}
    />
  );
}
```

---

### Collapsible

Expandable/collapsible content container with animated chevron.

**Location**: `components/ui/collapsible.tsx`

**Props:**
```typescript
interface CollapsibleProps extends PropsWithChildren {
  title: string;  // Header text
}
```

**Features:**
- Animated chevron rotation
- Theme-aware styling
- Touch feedback
- Controlled state

**Usage:**
```typescript
import { Collapsible } from '@/components/ui/collapsible';

<Collapsible title="Advanced Settings">
  <Text>Hidden content that expands on tap</Text>
  <Text>Automatically themed and animated</Text>
</Collapsible>
```

---

## Note Components

### NoteItem

Interactive note card with expand/collapse, inline editing, copy, and delete.

**Location**: `components/note-item.tsx`

**Props:**
```typescript
interface NoteItemProps {
  note: Note;                                            // Note data
  onPress?: () => void;                                 // Card tap handler
  onEdit?: () => void;                                  // Edit button handler
  onSave?: (id: string, title: string, content: string) => Promise<void>;
  onDelete?: () => void;                                // Delete handler
}

interface Note {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}
```

**Features:**
- Expandable/collapsible with animated chevron
- Inline editing with auto-resizing text input
- Copy to clipboard
- Delete with confirmation
- Theme-aware styling
- Animated transitions

**Usage:**
```typescript
import { NoteItem } from '@/components/note-item';

function NotesList({ notes }: { notes: Note[] }) {
  const handleSave = async (id: string, title: string, content: string) => {
    await supabase
      .from('notes')
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq('id', id);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('notes').delete().eq('id', id);
  };

  return (
    <>
      {notes.map(note => (
        <NoteItem
          key={note.id}
          note={note}
          onSave={handleSave}
          onDelete={() => handleDelete(note.id)}
          onEdit={() => router.push(`/note/${note.id}`)}
        />
      ))}
    </>
  );
}
```

**State Management:**
```typescript
// Internal state
const [isExpanded, setIsExpanded] = useState(false);      // Collapse state
const [isEditing, setIsEditing] = useState(false);        // Edit mode
const [editedContent, setEditedContent] = useState('');   // Edit buffer
const [textInputHeight, setTextInputHeight] = useState(150); // Dynamic height
```

---

## Authentication Components

### AuthGuard

Route protection component that redirects unauthenticated users to login.

**Location**: `components/auth-guard.tsx`

**Props:**
```typescript
interface AuthGuardProps {
  children: React.ReactNode;  // Protected content
}
```

**Features:**
- Session validation
- Loading state with spinner
- Automatic redirect to `/auth`
- Theme-aware loading screen

**Usage:**
```typescript
import { AuthGuard } from '@/components/auth-guard';

// In _layout.tsx
export default function TabLayout() {
  return (
    <AuthGuard>
      <Tabs>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="settings" />
      </Tabs>
    </AuthGuard>
  );
}
```

**Authentication Flow:**
```
User access → AuthGuard → Check session
  ├─ Loading → Show spinner
  ├─ No user → Redirect to /auth
  └─ User exists → Render children
```

---

## Modal Components

### ConfirmationModal

Reusable confirmation dialog with customizable actions.

**Location**: `components/confirmation-modal.tsx`

**Props:**
```typescript
interface ConfirmationModalProps {
  visible: boolean;                         // Modal visibility
  title: string;                            // Modal title
  message: string;                          // Modal message
  confirmText?: string;                     // Confirm button label (default: 'Confirm')
  cancelText?: string;                      // Cancel button label (default: 'Cancel')
  onConfirm: () => void;                   // Confirm handler
  onCancel: () => void;                    // Cancel/dismiss handler
  confirmStyle?: 'default' | 'destructive'; // Button styling (default: 'default')
}
```

**Features:**
- Transparent overlay with blur
- Theme-aware styling
- Destructive action styling (red button)
- Responsive max-width
- Accessibility support

**Usage:**
```typescript
import { ConfirmationModal } from '@/components/confirmation-modal';

function DeleteNoteButton({ noteId }: { noteId: string }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    await deleteNote(noteId);
    setShowConfirm(false);
    toast.success('Note deleted');
  };

  return (
    <>
      <Button onPress={() => setShowConfirm(true)}>Delete</Button>

      <ConfirmationModal
        visible={showConfirm}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="destructive"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
```

**Styling Variants:**
```typescript
// Default (uses theme tint)
confirmStyle="default"  → Blue button (theme.tint)

// Destructive (red button)
confirmStyle="destructive" → Red button (#ef4444)
```

---

## Hooks

### useThemeColor

Hook to access theme colors with optional overrides.

**Location**: `hooks/use-theme-color.ts`

**Signature:**
```typescript
function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ColorScheme
): string
```

**Usage:**
```typescript
import { useThemeColor } from '@/hooks/use-theme-color';

function CustomComponent() {
  // Use theme color
  const backgroundColor = useThemeColor({}, 'background');

  // With overrides
  const textColor = useThemeColor(
    { light: '#000000', dark: '#ffffff' },
    'text'
  );

  return (
    <View style={{ backgroundColor }}>
      <Text style={{ color: textColor }}>Themed content</Text>
    </View>
  );
}
```

---

### useThemeColors

Hook to access all colors from the active theme.

**Location**: `hooks/use-theme-colors.ts`

**Return Value:**
```typescript
interface UseThemeColorsReturn {
  colors: ColorScheme;      // All theme colors
  themeName: ThemeName;     // Active theme name
}
```

**Usage:**
```typescript
import { useThemeColors } from '@/hooks/use-theme-colors';

function StyledComponent() {
  const { colors, themeName } = useThemeColors();

  return (
    <View style={{
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderWidth: 1,
    }}>
      <Text style={{ color: colors.text }}>
        Current theme: {themeName}
      </Text>
      <Text style={{ color: colors.textSecondary }}>
        Secondary text
      </Text>
    </View>
  );
}
```

---

### useAuth

Authentication hook providing user state and auth methods.

**Location**: `hooks/use-auth.ts`

**Return Value:**
```typescript
interface UseAuthReturn {
  user: User | null;                                // Current user
  loading: boolean;                                 // Loading state
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}
```

**Usage:**
```typescript
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

function LoginForm() {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { error } = await signIn(email, password);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welcome back!');
    }
  };

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button onPress={handleLogin} disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </View>
  );
}
```

---

## State Management

### Auth Context

Global authentication state management.

**Location**: `contexts/auth-context.tsx`

**Provider:**
```typescript
<AuthProvider>
  <App />
</AuthProvider>
```

**Features:**
- Supabase session management
- Automatic session refresh
- Toast notification integration
- Persistent authentication

**State Flow:**
```
App Launch → Check Session → Set User
  ├─ Session exists → Auto sign-in → Update state
  ├─ Session expired → Clear state → Redirect to /auth
  └─ No session → Redirect to /auth

User Action → Auth Method → Supabase → Update State → Toast
  ├─ Sign Up → Create account → Set user → Success toast
  ├─ Sign In → Validate credentials → Set user → Success toast
  ├─ Sign Out → Clear session → Clear user → Redirect
  └─ Reset Password → Send email → Success toast
```

---

### Theme Controller Context

Global theme management with persistence.

**Location**: `contexts/theme-controller.tsx`

**Provider:**
```typescript
<ThemeControllerProvider>
  <App />
</ThemeControllerProvider>
```

**Features:**
- Multi-theme support (Greyscale, Apple Notes)
- Light/dark/system modes
- AsyncStorage persistence
- Automatic system preference detection

**State Flow:**
```
App Launch → Load Preferences → Apply Theme
  ├─ AsyncStorage → themeName + colorScheme
  ├─ Default: greyscale + system
  └─ Apply to Navigation + Components

User Selection → Update State → Persist → Re-render
  ├─ setTheme → AsyncStorage → Update context
  └─ setColorScheme → AsyncStorage → Update context

System Change (mode: 'system') → Detect → Update resolvedScheme → Re-render
```

**Persistence Keys:**
```typescript
'@noted_theme_preference'  // ThemeName
'@noted_theme_name'        // ColorSchemeMode
```

---

## Component Patterns

### Theme Integration Pattern

All components should follow this pattern for theme support:

```typescript
import { useThemeColors } from '@/hooks/use-theme-colors';

function MyComponent() {
  const { colors } = useThemeColors();

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderColor: colors.border,
    }}>
      <Text style={{ color: colors.text }}>Content</Text>
    </View>
  );
}
```

### Error Handling Pattern

All async operations should integrate toast notifications:

```typescript
import { toast } from 'sonner';

async function handleAction() {
  try {
    const result = await performAction();
    toast.success('Action completed successfully');
    return result;
  } catch (error) {
    toast.error('Action failed. Please try again.');
    console.error('Action error:', error);
  }
}
```

### Animated Component Pattern

Components with animations should use React Native Reanimated:

```typescript
import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

function AnimatedComponent({ isVisible }: { isVisible: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(opacity, {
      toValue: isVisible ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [isVisible, opacity]);

  return (
    <Animated.View style={{ opacity }}>
      {/* Content */}
    </Animated.View>
  );
}
```

---

## TypeScript Types

### Core Types

```typescript
// Theme Types
type ThemeName = 'greyscale' | 'appleNotes' | 'sepia' | 'nord' | 'bearRedGraphite';
type ColorSchemeMode = 'light' | 'dark' | 'system';

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
  // New 8 colors
  elevatedSurface: string;
  overlay: string;
  hover: string;
  pressed: string;
  disabled: string;
  highlight: string;
  linkColor: string;
  accentSecondary: string;
}

// Note Types
interface Note {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Auth Types
interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}
```

---

## Best Practices

### Component Guidelines

1. **Always use theme hooks** for styling instead of hardcoded colors
2. **Wrap async actions** with toast notifications for user feedback
3. **Use SharedPageLayout** for consistent page structure
4. **Implement AuthGuard** for protected routes
5. **Leverage TypeScript** for prop validation and type safety

### Performance

1. **Memoize expensive computations** with `useMemo`
2. **Optimize re-renders** with `useCallback` for event handlers
3. **Use native driver** for animations when possible
4. **Lazy load** heavy components with `React.lazy()`

### Accessibility

1. **Provide accessible labels** for interactive elements
2. **Support keyboard navigation** on web platform
3. **Use semantic HTML** for web (via NativeWind)
4. **Test with screen readers** on mobile platforms

---

## Examples

### Complete Page Example

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useAuth } from '@/hooks/use-auth';
import { SharedPageLayout } from '@/components/shared-page-layout';
import { NoteItem } from '@/components/note-item';
import { AuthGuard } from '@/components/auth-guard';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function NotesPage() {
  const { colors } = useThemeColors();
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      toast.error('Failed to load notes');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotes();
    setRefreshing(false);
  };

  const handleSave = async (id: string, title: string, content: string) => {
    const { error } = await supabase
      .from('notes')
      .update({ title, content })
      .eq('id', id);

    if (!error) {
      await fetchNotes();
      toast.success('Note updated');
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchNotes();
      toast.success('Note deleted');
    }
  };

  return (
    <AuthGuard>
      <SharedPageLayout
        onRefresh={handleRefresh}
        refreshing={refreshing}
      >
        <View style={{ gap: 12 }}>
          {notes.map(note => (
            <NoteItem
              key={note.id}
              note={note}
              onSave={handleSave}
              onDelete={() => handleDelete(note.id)}
            />
          ))}
        </View>
      </SharedPageLayout>
    </AuthGuard>
  );
}
```

---

**🤖 Generated with [Claude Code](https://claude.ai/code)**

**AI Integration Notes:**
This component library is designed for AI-assisted development. All components follow consistent patterns for theme integration, error handling, and state management. Copy-paste examples are production-ready and follow React Native + Expo best practices. When extending this library, maintain the established patterns for theme support, TypeScript typing, and toast notification integration.

**Version History:**
- 1.3.0 (Sept 30, 2025): 17-color system expansion, 3 new themes (Sepia, Nord, Bear Red Graphite), updated components (ConfirmationModal, ThemePickerModal, ExternalLink)
- 1.2.0 (Sept 27, 2025): Multi-theme system (Greyscale + Apple Notes), Sonner toast integration, forgot password flow
- 1.1.0: Initial authentication and notes CRUD
- 1.0.0: Base component library

**References:**
- README.md: Application setup and usage
- ARCHITECTURE.md: System design and data flow
- API.md: Backend API reference
