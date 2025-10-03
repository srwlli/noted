# ARCHITECTURE.md

**Date:** October 2, 2025
**Version:** 2.0.0

## Project Overview

Noted is a Progressive Web App (PWA) built with React Native, Expo Router, and Supabase, designed as a cross-platform note-taking application with folder organization, 10-theme system with 18-color palettes, universal card-based UI, and comprehensive offline support. The project leverages modern React Native development practices with a focus on maintainable, scalable architecture and PWA capabilities.

## System Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                    PWA App (React Native + Web)                │
├─────────────────────────────────────────────────────────────────┤
│                  PWA Layer (+html.tsx, manifest)               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Service Worker  │  │   PWA Manifest  │  │  Custom HTML    │  │
│  │  (Offline)      │  │   (Install)     │  │  (Icons/Fonts)  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                        App Layer (_layout.tsx)                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ ThemeController │  │   AuthProvider   │  │  AppLayout      │  │
│  │  (10 themes)    │  │   (Supabase)    │  │  (Toaster)      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      Navigation Layer                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Tab Layout    │  │   Auth Layout   │  │   Modal Stack   │  │
│  │  (Protected)    │  │  (Public)       │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                       Screen Layer                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Notes + Folders│  │      Info       │  │    Settings     │  │
│  │   (index.tsx)   │  │   (info.tsx)    │  │ (settings.tsx)  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                     Component Layer                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Universal Card  │  │  Info Cards     │  │ Settings Cards  │  │
│  │   Component     │  │  (Accordion)    │  │  (Accordion)    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Common Header  │  │  Note Item      │  │  Folder Modal   │  │
│  │  (w/ folder)    │  │  (w/ menu)      │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      Service Layer                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  notes.ts       │  │  folders.ts     │  │ theme-storage   │  │
│  │  (CRUD)         │  │  (CRUD)         │  │  (AsyncStorage) │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   External Services     │
                    │  ┌─────────────────────┐│
                    │  │  Supabase Backend   ││
                    │  │  - Authentication   ││
                    │  │  - PostgreSQL DB    ││
                    │  │  - Real-time        ││
                    │  │  - RLS Policies     ││
                    │  └─────────────────────┘│
                    └─────────────────────────┘
```

## Tech Stack Analysis

### Core Framework
- **React Native 0.81.4**: Mobile application framework
- **React 19.1.0**: Latest React for advanced features and optimizations
- **Expo SDK 54**: Development platform with managed workflow
- **Expo Router 6**: File-based routing system

### Styling & UI
- **Custom Theme System**: 10 themes with 18-color palettes each (180 total color values)
- **Material Design Icons**: @expo/vector-icons for consistent iconography
- **React Native Popup Menu 0.18**: Contextual dropdown menus for note actions
- **React Native Reanimated 4.1**: Advanced animations
- **React Native Gesture Handler 2.28**: Gesture recognition
- **Sonner Native 0.21**: Toast notifications

### Backend & Data
- **Supabase 2.57.4**: Backend-as-a-Service for authentication and database
- **AsyncStorage 2.2.0**: Local storage for theme preferences and caching

### Development & Quality
- **TypeScript 5.9.2**: Type safety and developer experience
- **ESLint 9.25.0**: Code linting with Expo configuration

## Module Boundaries & Data Flow

### 1. Context Providers (Global State)
```
ThemeControllerProvider
├── Manages: ThemeName (10 options) + ColorSchemeMode ('light' | 'dark' | 'system')
├── Persistence: AsyncStorage via typed ThemeStorage utility
├── Theme Colors: 18-color ColorScheme per theme
├── Metadata: displayName, description for each theme
├── Error Handling: Error state for storage failures
└── Children: AuthProvider

AuthProvider
├── Manages: User session, authentication state
├── Dependencies: Supabase client
├── Methods: signUp, signIn, signOut, resetPassword
└── Children: App navigation stack
```

### 2. Navigation Architecture
```
Root Stack (_layout.tsx)
├── (tabs) - Protected by AuthGuard
│   ├── index.tsx (Notes with folder filtering)
│   ├── info.tsx (Information & Quick Start)
│   └── settings.tsx (Theme & Account settings)
├── auth - Public authentication flow
│   └── index.tsx (Login/Signup)
└── +html.tsx - Custom HTML template for PWA
```

### 3. Component Hierarchy
```
Common Components (components/common/)
├── card.tsx - Universal Card component (accordion support)
├── common-header.tsx - Header with folder dropdown
└── shared-page-layout.tsx - Page structure with scrolling

Info Cards (components/info-cards/)
├── coming-soon-card.tsx - Future features list
├── tech-stack-card.tsx - Technology overview
├── quick-start-card.tsx - App usage guide
├── download-card.tsx - PWA installation
└── contact-card.tsx - Support information

Settings Cards (components/settings-cards/)
├── theme-settings-card.tsx - Theme picker & dark mode
├── profile-settings-card.tsx - User profile display
└── account-settings-card.tsx - Sign out action

Note Components
├── note-item.tsx - Individual note card with menu
└── note-modal.tsx - Edit/create note modal

Modals
├── folder-modal.tsx - Create/rename folder
└── theme-picker-modal.tsx - Full-screen theme selector
```

### 4. Data Flow Patterns

**Theme Management Flow:**
```
User Selection → ThemeStorage.setTheme → ThemeController →
18-Color ColorScheme → useThemeColors Hook → Component Colors
```

**Folder Organization Flow:**
```
User Creates Folder → services/folders.ts → Supabase RLS →
PostgreSQL folders table → Real-time update → UI refresh
```

**Note CRUD Flow:**
```
User Action → services/notes.ts → Supabase RLS →
PostgreSQL notes table (with folder_id) → Real-time update → UI refresh
```

**Authentication Flow:**
```
Auth Action → Supabase Client → Auth Context →
Session State → AuthGuard → Route Access
```

**Universal Card Accordion Flow:**
```
User Tap → Parent toggles expandedCard state →
Card receives isExpanded prop → Conditional render of children
```

## Design Decisions & Rationale

### 1. Universal Card Component Pattern
**Decision:** Single Card component with isAccordion prop instead of multiple card variants
**Rationale:** DRY principle - eliminates duplicate styling code across 15+ card components. Ensures pixel-perfect consistency (borderWidth 1, borderRadius 12, padding 16). Single source of truth for card structure makes design changes trivial.

### 2. 10-Theme System with 18-Color Palettes
**Decision:** Extensive theme library (180 total color values) with semantic color names
**Rationale:** Provides user choice while maintaining design consistency. 18 colors support advanced UI states (hover, pressed, disabled, overlay). Metadata (displayName, description) enables better UX in theme picker.

### 3. Folder Organization with Nullable folder_id
**Decision:** Optional folder association with ON DELETE SET NULL
**Rationale:** Notes remain accessible when folder is deleted (moved to "All Notes" view). Prevents data loss. Supports future nested folders via parent_folder_id self-reference.

### 4. Services Layer Architecture
**Decision:** Centralized data access (services/notes.ts, services/folders.ts) instead of direct Supabase calls
**Rationale:** Abstraction layer enables easier backend migration. Type-safe CRUD operations. Consistent error handling. Easier testing and mocking.

### 5. Progressive Web App (PWA) Implementation
**Decision:** Full PWA support with service worker, manifest, and custom HTML template
**Rationale:** Cross-platform reach (iOS, Android, desktop) without app stores. Offline functionality. Instant updates. Lower distribution friction. +html.tsx enables custom icons and fonts.

### 6. React Native Popup Menu for Note Actions
**Decision:** Contextual dropdown menus instead of inline buttons or centered modals
**Rationale:** Better UX - actions appear near tap location. Saves screen space. Standard mobile pattern. react-native-popup-menu provides native feel across platforms.

### 7. Single-Card Expansion Pattern
**Decision:** Only one accordion card expanded at a time per page
**Rationale:** Focused content consumption. Prevents overwhelming UI. Clearer visual hierarchy. ExpandedCard state managed at page level enables coordination.

### 8. Memory Leak Fix via useCallback + React.memo
**Decision:** Memoize all callbacks and wrap NoteItem with React.memo
**Rationale:** Prevents event listener accumulation (4.5GB → 700MB-1GB). React.memo with custom comparison prevents unnecessary re-renders. Only re-render when note.id or note.updated_at changes.

## Security Considerations

- **Environment Variables:** Supabase credentials stored in .env (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY)
- **Row-Level Security (RLS):** All database tables protected by RLS policies (auth.uid() = user_id)
- **Client-side Keys:** Using Supabase anon key (appropriate for client-side usage, RLS enforces access control)
- **Route Protection:** AuthGuard component prevents unauthorized access to protected routes
- **Session Management:** Automatic session refresh and cleanup handled by Supabase
- **Input Validation:** Database-level CHECK constraints (title max 200, content max 50,000 chars)
- **Cascading Deletes:** ON DELETE CASCADE for user data cleanup, ON DELETE SET NULL for folder references

## Performance Optimizations

- **Memory Leak Fix:** useCallback + React.memo reduces memory from 4.5GB to 700MB-1GB
- **Strategic Memoization:** useMemo and useCallback in ThemeController and NoteItem
- **Code Splitting:** Natural code splitting through Expo Router's file-based routing
- **Conditional Rendering:** Card component only renders children when expanded
- **Database Indexing:** Indexes on user_id, folder_id, created_at, updated_at for fast queries
- **PWA Caching:** Service worker caches app shell and static assets for offline usage

## Scalability Patterns

- **Services Layer:** Centralized data access (notes.ts, folders.ts) abstracts backend complexity
- **Universal Components:** Single Card component eliminates duplicate code, scales to 100+ card instances
- **Theme Extensibility:** Adding new themes requires only updating constants/theme.ts (no component changes)
- **Folder Hierarchy:** parent_folder_id enables future nested folders without schema changes
- **Component Composition:** Shared layout and header components ensure consistent UI patterns
- **Type Safety:** Full TypeScript coverage with strict mode prevents runtime errors at scale

## Key Architectural Highlights

- **Universal Card System:** Single component powers 15+ cards (info, settings, notes) with pixel-perfect consistency
- **10-Theme System:** 180 color values (10 themes × 18 colors × light/dark) with metadata for rich UX
- **Folder Organization:** Hierarchical structure with parent_folder_id, ON DELETE SET NULL prevents data loss
- **Services Layer:** Type-safe CRUD operations (notes.ts, folders.ts) abstract database complexity
- **PWA-First:** Service worker + manifest + custom HTML enables offline-first cross-platform distribution
- **Memory Optimized:** useCallback + React.memo fix reduces memory usage by 84% (4.5GB → 700MB-1GB)
- **Row-Level Security:** All tables protected by RLS policies (auth.uid() = user_id)
- **Single-Card Expansion:** Focused UX with one accordion open at a time per page

---

**🤖 Generated with Claude Code - AI-powered system architecture documentation**
**Built for scalable Progressive Web App development with React Native and modern best practices**