# Noted Component Library

**Framework**: React Native + Expo
**Version**: 2.1.0
**Date**: October 6, 2025

---

## Overview

Component library reference for the Noted Progressive Web App. All components follow a universal card-based architecture supporting **10 themes** (Monochrome, Ocean, Sepia, Nord, Crimson, Forest, Lavender, Amber, Midnight, Rose) with light/dark variants and an **18-color system**. Components are built with TypeScript, Material Design Icons, and integrated theme management with folder organization and favorites system. The app features a Dashboard landing page with favorite folders and recent notes for quick access.

**Key Architectural Patterns:**
- **Bottom Sheet Modal**: NoteActionsModal provides 3-row action grid accessible via (...) menu
- **Action Card System**: Reusable PrimaryActionRow with 4 variants (Standard, Accent, Destructive, Disabled)
- **Universal Card**: Single Card component powers all accordion UIs (info, settings, notes)
- **Auto-Save Pattern**: Title fields save automatically on blur without explicit save buttons

**Referenced Documentation:**
- **README.md**: Setup, quickstart, and usage examples
- **ARCHITECTURE.md**: System design, tech stack, and data flow patterns
- **API.md**: Backend API interface and Supabase integration

---

## Table of Contents

1. [Theme System](#theme-system)
2. [Universal Card Component](#universal-card-component)
3. [Layout Components](#layout-components)
4. [Screen Components](#screen-components)
5. [Info Card Components](#info-card-components)
6. [Settings Card Components](#settings-card-components)
7. [Note Components](#note-components)
8. [Action Components](#action-components)
9. [Modal Components](#modal-components)
10. [Hooks](#hooks)
11. [Services Layer](#services-layer)
12. [State Management](#state-management)

---

## Theme System

### ThemeController Context

Multi-theme system supporting 10 themes with 18-color palettes and metadata.

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
  themeName: ThemeName;              // 'monochrome' | 'ocean' | 'sepia' | 'nord' | 'crimson' | 'forest' | 'lavender' | 'amber' | 'midnight' | 'rose'
  setTheme: (theme: ThemeName) => Promise<void>;
  colorScheme: ColorSchemeMode;      // 'light' | 'dark' | 'system'
  setColorScheme: (mode: ColorSchemeMode) => Promise<void>;
  resolvedScheme: 'light' | 'dark';  // Computed scheme
  isLoading: boolean;                // Loading state
  error: string | null;              // Error state
}
```

**Usage Example:**
```typescript
import { useThemeController } from '@/contexts/theme-controller';

function ThemeSwitcher() {
  const { themeName, setTheme, colorScheme, setColorScheme, error } = useThemeController();

  return (
    <>
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button onPress={() => setTheme('ocean')}>
        Ocean Theme
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
type ThemeName = 'monochrome' | 'ocean' | 'sepia' | 'nord' | 'crimson' | 'forest' | 'lavender' | 'amber' | 'midnight' | 'rose';

interface ThemeMetadata {
  displayName: string;
  description: string;
  light: ColorScheme;
  dark: ColorScheme;
}

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

  // Extended 9 colors (Phase 2)
  elevatedSurface: string;  // Layered UI (modals, popovers)
  selectedSurface: string;  // Selected/active item states
  overlay: string;          // Semi-transparent backdrops (rgba)
  hover: string;            // Interactive hover states
  pressed: string;          // Active/pressed button states
  disabled: string;         // Disabled UI elements
  highlight: string;        // Selections, notifications
  linkColor: string;        // Hyperlinks (can differ from tint)
  accentSecondary: string;  // Secondary accent variety
}

// Monochrome Theme Example
{
  displayName: 'Monochrome',
  description: 'Clean monochrome design',
  light: {
    background: '#fafafa',
    surface: '#ffffff',
    text: '#1a1a1a',
    textSecondary: '#6a6a6a',
    border: '#e0e0e0',
    tint: '#4a4a4a',
    elevatedSurface: '#f2f2f0',
    selectedSurface: '#e8e8e6',
    overlay: 'rgba(18, 18, 18, 0.5)',
    hover: '#ececec',
    pressed: '#e0e0e0',
    disabled: '#bcbcbc',
    highlight: '#ffeb3b',
    linkColor: '#0066cc',
    accentSecondary: '#6a6a6a',
  },
  dark: { /* ... */ }
}
```

**Persistence:**
- Theme name stored via ThemeStorage utility (lib/theme-storage.ts)
- Color scheme stored in AsyncStorage
- Type-safe storage with error handling

---

## Universal Card Component

### Card

Universal card component powering all accordion UIs across the app with pixel-perfect consistency.

**Location**: `components/common/card.tsx`

**Props:**
```typescript
interface CardProps {
  isAccordion?: boolean;        // Enable accordion behavior (default: false)
  isExpanded?: boolean;         // Accordion expansion state
  onToggle?: () => void;        // Accordion toggle handler
  headerContent: React.ReactNode; // Header content (typically icon + text)
  children?: React.ReactNode;   // Card body content
}
```

**Features:**
- Single source of truth for card styling (borderWidth 1, borderRadius 12, padding 16)
- Header with bottom border for visual separation
- Optional accordion mode with expand/collapse
- Empty children handling (no spacing when collapsed)
- Theme-aware styling
- Used by 15+ components (info cards, settings cards, notes)

**Usage:**
```typescript
import { Card } from '@/components/common/card';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';

function InfoCard() {
  const { colors } = useThemeColors();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card
      isAccordion={true}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      headerContent={
        <>
          <MaterialIcons
            name={isExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
            size={24}
            color={colors.textSecondary}
          />
          <Text style={[styles.title, { color: colors.text }]}>Card Title</Text>
        </>
      }
    >
      <Text style={{ color: colors.text }}>Card content goes here</Text>
    </Card>
  );
}

// Static card (non-accordion)
<Card
  headerContent={
    <Text style={{ color: colors.text }}>Static Card</Text>
  }
>
  <Text>Always visible content</Text>
</Card>
```

---

## Layout Components

### SharedPageLayout

Common page layout wrapper with header, folder dropdown, scrolling, and responsive design.

**Location**: `components/common/shared-page-layout.tsx`

**Props:**
```typescript
interface SharedPageLayoutProps {
  children: React.ReactNode;
  scrollable?: boolean;  // Enable scrolling (default: true)
}
```

**Features:**
- CommonHeader with folder dropdown
- Responsive padding for web/PWA
- Theme-aware background
- Safe area handling
- ScrollView when scrollable=true

**Usage:**
```typescript
import { SharedPageLayout } from '@/components/common/shared-page-layout';

function NotesScreen() {
  return (
    <SharedPageLayout scrollable={true}>
      {/* Page content */}
    </SharedPageLayout>
  );
}
```

---

### CommonHeader

Shared header component with refresh, folder dropdown, and new note buttons.

**Location**: `components/common/common-header.tsx`

**Features:**
- Folder dropdown menu with "All Notes" option
- New folder creation
- New note button
- Refresh button
- Theme-aware styling
- Material Icons integration

---

## Screen Components

### Dashboard (index.tsx)

Main dashboard screen displaying favorite folders and recent notes. Replaces the previous notes list as the app's landing page.

**Location**: `app/(tabs)/index.tsx`

**Features:**
- **Favorites Section**: Quick access to starred folders with folder card display
- **Recent Notes Section**: 5 most recently updated notes with timestamps
- **Empty States**: Friendly messaging when no favorites or notes exist
- **Smart Navigation**: Taps navigate to folder view or note detail
- **Theme Integration**: Full theme support with dynamic colors
- **Tab Navigation**: Accessible via Dashboard tab (center position)

**Key Functions:**
```typescript
// Fetches favorite folders (is_favorite = true)
const favoriteFolders = await getFavoriteFolders();

// Fetches 5 most recent notes across all folders
const recentNotes = await getNotes(); // Sorted by updated_at DESC, limited to 5
```

**Usage:**
```typescript
// Dashboard renders automatically at root (/)
// Users see favorites + recent notes on app launch
// Tap folder card → Navigate to folder detail
// Tap note card → Navigate to note detail
```

---

### Notes List (notes.tsx)

Dedicated notes list screen with folder filtering and comprehensive note management.

**Location**: `app/(tabs)/notes.tsx`

**Features:**
- **Folder Filtering**: Filter notes by selected folder from dropdown
- **All Notes View**: Display all notes when no folder selected
- **Full CRUD Operations**: Create, read, update, delete notes
- **Inline Editing**: Edit notes directly in the list
- **Empty States**: Contextual messages for empty folders or no notes
- **Theme-Aware**: Dynamic theming across all UI elements

**State Management:**
```typescript
const [notes, setNotes] = useState<Note[]>([]);
const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

// Filter notes by folder
const filteredNotes = selectedFolder
  ? notes.filter(note => note.folder_id === selectedFolder)
  : notes;
```

**Usage:**
```typescript
// Access via Notes tab (second position)
// Select folder from dropdown to filter
// Create new note with folder context
// Edit/delete notes inline
```

---

### Folders Screen (folders.tsx)

Dedicated folder management hub with favorites system and comprehensive folder operations.

**Location**: `app/(tabs)/folders.tsx`

**Features:**
- **Folder Favorites**: Star/unstar folders for Dashboard quick access
- **Folder Cards**: Visual folder display with star indicators
- **Folder CRUD**: Create, rename, delete folders
- **Note Counts**: Display number of notes per folder
- **Empty State**: Encouragement to create first folder
- **Theme Integration**: Full theme support

**Folder Card Features:**
```typescript
// Star icon toggles is_favorite status
<TouchableOpacity onPress={() => toggleFavorite(folder.id)}>
  <MaterialIcons
    name={folder.is_favorite ? "star" : "star-border"}
    size={24}
    color={colors.tint}
  />
</TouchableOpacity>

// Folder actions: Rename, Delete, View Notes
```

**Key Functions:**
```typescript
// Toggle folder favorite status
const toggleFavorite = async (folderId: string) => {
  await toggleFavorite(folderId);
  // Refreshes folder list to show updated star state
};

// Get favorite folders for Dashboard
const favorites = folders.filter(f => f.is_favorite);
```

**Usage:**
```typescript
// Access via Folders tab (fourth position)
// Tap star to add/remove from Dashboard favorites
// Tap folder card to view folder notes
// Long press for rename/delete options
```

**Tab Navigation Order:**
```
Info (1) → Notes (2) → Dashboard (3) → Folders (4) → Settings (5)
```

---

## Info Card Components

All info cards use the Universal Card component with accordion behavior.

### ComingSoonCard

**Location**: `components/info-cards/coming-soon-card.tsx`

**Props:**
```typescript
interface ComingSoonCardProps {
  isExpanded: boolean;
  onToggle: () => void;
}
```

**Features:**
- Lists 11 planned features
- Chevron animation on expand/collapse
- Theme-aware text

---

### TechStackCard

**Location**: `components/info-cards/tech-stack-card.tsx`

**Features:**
- Frontend, Backend, UI/UX, PWA sections
- Technology list with descriptions

---

### QuickStartCard

**Location**: `components/info-cards/quick-start-card.tsx`

**Features:**
- App usage guide organized by location
- Header actions, folder actions, card actions, tab bar actions

---

### DownloadCard

**Location**: `components/info-cards/download-card.tsx`

**Features:**
- iOS/Android/PC tabs
- Auto-detection of current platform
- PWA installation instructions

---

### ContactCard

**Location**: `components/info-cards/contact-card.tsx`

**Features:**
- Email contact with copy-to-clipboard
- Theme-aware styling

---

## Settings Card Components

### ThemeSettingsCard

**Location**: `components/settings-cards/theme-settings-card.tsx`

**Props:**
```typescript
interface ThemeSettingsCardProps {
  isExpanded: boolean;
  onToggle: () => void;
  onOpenThemePicker: () => void;
}
```

**Features:**
- Theme picker button with color preview
- Dark mode toggle
- Error banner for theme loading failures

---

### ProfileSettingsCard

**Location**: `components/settings-cards/profile-settings-card.tsx`

**Props:**
```typescript
interface ProfileSettingsCardProps {
  isExpanded: boolean;
  onToggle: () => void;
}
```

**Features:**
- Displays user email
- Minimal profile information

---

### AccountSettingsCard

**Location**: `components/settings-cards/account-settings-card.tsx`

**Props:**
```typescript
interface AccountSettingsCardProps {
  isExpanded: boolean;
  onToggle: () => void;
  onSignOut: () => void;
  isSigningOut: boolean;
}
```

**Features:**
- Sign out button with loading state
- Disabled state during sign out

---

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

## Action Components

### PrimaryActionRow

Reusable action button row component for consistent action grids throughout the app. Used in NoteActionsModal for Export, Embed, Upload, and other actions.

**Location**: `components/note-actions/primary-action-row.tsx`

**Props:**
```typescript
interface PrimaryAction {
  icon: keyof typeof MaterialIcons.glyphMap;  // Material icon name
  label: string;                               // Primary label
  sublabel?: string;                           // Optional state/status text
  onPress: () => void;                        // Action handler
  disabled?: boolean;                          // Disabled state
  destructive?: boolean;                       // Red styling for dangerous actions
  accent?: boolean;                            // Highlighted styling (tint color)
}

interface PrimaryActionRowProps {
  actions: PrimaryAction[];  // Array of actions in this row
  title?: string;            // Optional row title
}
```

**Visual States:**
```typescript
// Default button
{ icon: 'file-download', label: 'Export', onPress: handleExport }

// With sublabel (shows state/prerequisite)
{ icon: 'cloud-upload', label: 'Upload', sublabel: 'Connect Drive', onPress: handleUpload }
{ icon: 'code', label: 'Embed', sublabel: 'Publish first', disabled: true, onPress: handleEmbed }

// Destructive action (red)
{ icon: 'delete', label: 'Delete', destructive: true, onPress: handleDelete }

// Accent action (highlighted)
{ icon: 'auto-awesome', label: 'AI Actions', accent: true, onPress: handleAI }

// Disabled state
{ icon: 'share', label: 'Share', disabled: true, onPress: handleShare }
```

**Styling Variants:**
- **Default**: Surface background, border, text icon
- **Accent**: Tint-colored background (8% opacity), tint border, tint icon/text
- **Destructive**: Red icon and text (#dc2626)
- **Disabled**: 50% opacity, non-interactive

**Usage Example:**
```typescript
import { PrimaryActionRow } from '@/components/note-actions/primary-action-row';

function NoteActionsModal() {
  const [isConnected, setIsConnected] = useState(false);

  const primaryActions = [
    { icon: 'edit', label: 'Edit', onPress: handleEdit },
    { icon: 'share', label: 'Share', onPress: handleShare },
    { icon: 'content-copy', label: 'Duplicate', onPress: handleDuplicate },
  ];

  const secondaryActions = [
    {
      icon: 'auto-awesome',
      label: 'AI Actions',
      accent: true,
      onPress: handleAI
    },
    { icon: 'file-download', label: 'Export', onPress: handleExport },
    {
      icon: 'cloud-upload',
      label: 'Upload',
      sublabel: isConnected ? 'Google Drive' : 'Connect Drive',
      onPress: handleUpload
    },
  ];

  const tertiaryActions = [
    { icon: 'folder-open', label: 'Organization', onPress: handleOrganize },
    {
      icon: 'delete',
      label: 'Delete',
      destructive: true,
      onPress: handleDelete
    },
  ];

  return (
    <View>
      <PrimaryActionRow actions={primaryActions} />
      <PrimaryActionRow actions={secondaryActions} />
      <PrimaryActionRow actions={tertiaryActions} />
    </View>
  );
}
```

**Action Button Structure:**
```
┌──────────────┐
│              │
│   [Icon 28]  │  ← Material icon, themed color
│              │
│   Label      │  ← 14px, medium weight
│   Sublabel   │  ← 12px, secondary color (optional)
│              │
└──────────────┘
   12px gap between buttons
```

**Styling Specifications:**
```typescript
// Container (row)
{
  flexDirection: 'row',
  gap: 12,                    // 12px between action cards
  marginBottom: 12,           // 12px between rows
}

// Action button
{
  flex: 1,                    // Equal width distribution
  flexDirection: 'column',    // Icon above text (vertical)
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 16,        // 16px top/bottom padding
  paddingHorizontal: 12,      // 12px left/right padding
  borderRadius: 12,           // Rounded corners
  borderWidth: 1,             // 1px border
  gap: 8,                     // 8px between icon and label
}

// Icon
{
  size: 28,                   // Material icon 28px
  color: colors.text          // Default (or tint/red for variants)
}

// Label
{
  fontSize: 14,
  fontWeight: '500',          // Medium weight
  textAlign: 'center',
}

// Sublabel (optional)
{
  fontSize: 12,
  fontWeight: '400',          // Regular weight
  textAlign: 'center',
  marginTop: -4,              // Tighten spacing to label
  color: colors.textSecondary
}

// Disabled state
{
  opacity: 0.5                // 50% transparency
}
```

**Layout Math:**
```
3 buttons per row with 12px gaps:
┌────────┐ 12px ┌────────┐ 12px ┌────────┐
│  flex1 │      │  flex1 │      │  flex1 │
└────────┘      └────────┘      └────────┘

Each button: (containerWidth - 48px horizontal padding - 24px gaps) / 3
Minimum tappable area: 44x44px (iOS/Android guideline)
Actual height: ~88px (16px padding * 2 + 28px icon + 14px label + 8px gap)
```

**Consistency Standards:**
All action buttons must follow these patterns (as specified in Export/Embed/Upload plans):
1. **Sublabels for state**: Use sublabel to show prerequisites or current state
   - Example: `sublabel: 'Connect Drive'` when not authenticated
   - Example: `sublabel: 'Publish first'` when note not published
2. **Accent for AI features**: Use `accent: true` for AI-powered actions
3. **Destructive for dangerous actions**: Use `destructive: true` for delete, remove, etc.
4. **Disabled with explanation**: When disabled, sublabel should explain why

**Integration with NoteActionsModal:**
```typescript
// NoteActionsModal uses 3 rows in a grid pattern:
// Row 1: Edit, Share, Duplicate, Preview
// Row 2: AI Actions, Export, Upload
// Row 3: Organization, Copy, Delete

// Each action card uses PrimaryActionRow component
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

### NoteActionsModal

Bottom sheet modal providing comprehensive note actions in a 3-row grid layout. Central hub for all note operations accessible via (...) menu or long press.

**Location**: `components/note-actions-modal.tsx`

**Props:**
```typescript
interface NoteActionsModalProps {
  visible: boolean;
  onClose: () => void;
  noteId: string;
  noteTitle: string;
  noteContent: string;
  folderId: string | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onFolderChanged?: () => void;
  onNoteUpdated?: () => void;
  onDelete?: () => void;
}
```

**Features:**
- **Editable Title Field**: Auto-saves on blur when user taps away
- **3-Row Action Grid**: 9+ actions organized by priority and function
- **Nested Modals**: AI Actions, Folder Picker open within bottom sheet
- **Slide Animation**: Smooth bottom-to-top entrance
- **Theme Integration**: Uses `elevatedSurface` for layered appearance
- **Drag Handle**: Visual affordance for dismissal

**Action Grid Structure:**
```
Row 1 (Primary):   Edit | Favorite | Share | Preview
Row 2 (Secondary): Export | Organization | Download
Row 3 (Tertiary):  Copy | AI Actions (accent) | Delete (red)
```

**Action Card Types:**

1. **Standard Action Card**
   - Default styling with surface background
   - Border and text in theme colors
   - Examples: Edit, Export, Organization

2. **Accent Action Card**
   - Highlighted with theme tint color
   - Tint-colored border, icon, and text
   - 8% opacity tint background
   - Used for: AI Actions (special features)

3. **Destructive Action Card**
   - Red icon and text (#dc2626)
   - Used for: Delete operations

4. **Disabled Action Card**
   - 50% opacity
   - Optional sublabel explaining why disabled
   - Non-interactive state

**Auto-Save Title Pattern:**
```typescript
// Title field saves automatically when user taps away
onBlur={() => {
  if (title !== originalTitle) {
    await updateNote(noteId, title, content);
    toast.success('Title updated');
  }
}}
```

**Nested Modal Pattern:**
```typescript
// Bottom sheet contains other modals
<NoteActionsModal>
  {/* Editable title + actions grid */}
  <AIActionsModal />        // AI features submenu
  <FolderPickerModal />     // Organization submenu
</NoteActionsModal>
```

**Usage:**
```typescript
import { NoteActionsModal } from '@/components/note-actions-modal';

function NoteCard({ note }: { note: Note }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setShowActions(true)}>
        <Text>(...)</Text>
      </TouchableOpacity>

      <NoteActionsModal
        visible={showActions}
        onClose={() => setShowActions(false)}
        noteId={note.id}
        noteTitle={note.title}
        noteContent={note.content}
        folderId={note.folder_id}
        isFavorite={note.is_favorite}
        onToggleFavorite={handleToggleFavorite}
        onNoteUpdated={refreshNote}
        onDelete={handleDelete}
      />
    </>
  );
}
```

**Visual Hierarchy:**
- **Row 1**: Most common actions (Edit, Favorite, Share, Preview)
- **Row 2**: Organization and export functions
- **Row 3**: Special actions (AI) and dangerous actions (Delete)

**Bottom Sheet Structure:**
```
┌─────────────────────────────┐
│      ═══ (drag handle)      │  ← Dismissal affordance
├─────────────────────────────┤
│  [Editable Title Field]     │  ← Auto-save on blur
├─────────────────────────────┤
│  [Row 1: 4 primary actions] │  ← Standard cards
│  [Row 2: 3 secondary acts]  │  ← Standard cards
│  [Row 3: Copy|AI|Delete]    │  ← Accent + Destructive
└─────────────────────────────┘
```

---

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

## Services Layer

### Notes Service

Centralized data access layer for note CRUD operations.

**Location**: `services/notes.ts`

**Functions:**
```typescript
async function getNotes(): Promise<Note[]>
async function getNotesByFolder(folderId: string | null): Promise<Note[]>
async function createNote(note: CreateNoteRequest): Promise<Note>
async function updateNote(id: string, updates: UpdateNoteRequest): Promise<Note>
async function deleteNote(id: string): Promise<void>
```

**Usage:**
```typescript
import { getNotes, createNote, updateNote, deleteNote } from '@/services/notes';

// Get all notes
const notes = await getNotes();

// Get notes by folder
const folderNotes = await getNotesByFolder(folderId);

// Create note
const newNote = await createNote({
  title: 'My Note',
  content: 'Note content',
  folder_id: folderId
});

// Update note
await updateNote(noteId, { title: 'Updated Title' });

// Delete note
await deleteNote(noteId);
```

---

### Folders Service

Centralized data access layer for folder CRUD operations with favorites support.

**Location**: `services/folders.ts`

**Folder Interface:**
```typescript
interface Folder {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;  // New: favorite status for Dashboard
}
```

**Functions:**
```typescript
async function getFolders(): Promise<Folder[]>
async function getFavoriteFolders(): Promise<Folder[]>  // New: Get only favorites
async function createFolder(name: string): Promise<Folder>
async function updateFolder(id: string, name: string): Promise<Folder>
async function deleteFolder(id: string): Promise<void>
async function toggleFavorite(id: string): Promise<Folder>  // New: Toggle is_favorite
```

**Usage:**
```typescript
import {
  getFolders,
  getFavoriteFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  toggleFavorite
} from '@/services/folders';

// Get all folders
const folders = await getFolders();

// Get favorite folders for Dashboard
const favorites = await getFavoriteFolders();

// Create folder (is_favorite defaults to false)
const newFolder = await createFolder('Work Notes');

// Rename folder
await updateFolder(folderId, 'Work Projects');

// Toggle favorite status
const updatedFolder = await toggleFavorite(folderId);
console.log(updatedFolder.is_favorite); // true or false

// Delete folder (notes will be set to folder_id = null)
await deleteFolder(folderId);
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
  folder_id: string | null;
  created_at: string;
  updated_at: string;
}

// Folder Types
interface Folder {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;  // Favorite status for Dashboard display
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

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

**AI Integration Notes:**
This component library is designed for AI-assisted development. All components follow the Universal Card pattern, services layer abstraction, and 10-theme system. Copy-paste examples are production-ready and follow React Native + Expo + PWA best practices. When extending this library, use the Card component for all card-based UIs, access data via services layer (not direct Supabase), and leverage the 18-color theme system.

**Version History:**
- 2.1.0 (Oct 6, 2025): Dashboard with favorites, folder favorites system, dedicated Folders screen, tab navigation reorder
- 2.0.0 (Oct 2, 2025): Universal Card component, 10 themes (18 colors each), folder organization, services layer, PWA support, memory leak fix
- 1.3.0 (Sept 30, 2025): 17-color system expansion, 3 new themes (Sepia, Nord, Bear Red Graphite)
- 1.2.0 (Sept 27, 2025): Multi-theme system (Greyscale + Apple Notes), Sonner toast integration
- 1.1.0: Initial authentication and notes CRUD
- 1.0.0: Base component library

**Key Updates in 2.1.0:**
- **Dashboard Screen**: New landing page with favorite folders and recent notes (replaces notes list at index)
- **Folder Favorites**: Star/unstar folders for Dashboard quick access via is_favorite field
- **Dedicated Folders Screen**: Comprehensive folder management hub with favorites toggle
- **Notes Screen Separation**: Dedicated notes.tsx screen with folder filtering
- **Tab Navigation Update**: Info → Notes → Dashboard → Folders → Settings
- **Service Layer Expansion**: getFavoriteFolders() and toggleFavorite() methods added

**Key Updates in 2.0.0:**
- **Universal Card Component**: Single component powers 15+ cards (info, settings, notes) with pixel-perfect consistency
- **10-Theme System**: Monochrome, Ocean, Sepia, Nord, Crimson, Forest, Lavender, Amber, Midnight, Rose (180 color values total)
- **Folder Organization**: Hierarchical folder structure with services layer abstraction
- **Services Layer**: Type-safe CRUD operations (services/notes.ts, services/folders.ts) replace direct Supabase calls
- **Memory Optimization**: useCallback + React.memo reduces memory by 84% (4.5GB → 700MB-1GB)

**References:**
- README.md: Application setup and usage
- ARCHITECTURE.md: System design and data flow
- SCHEMA.md: Database schema and TypeScript types
- API.md: Backend API reference
