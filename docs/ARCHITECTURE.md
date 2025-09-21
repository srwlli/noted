# ARCHITECTURE.md

**Date:** September 21, 2025
**Version:** 1.0.0

## Project Overview

Noted is a React Native mobile application built with Expo Router and TailwindCSS, designed as a notes application with authentication, theming, and cross-platform support. The project leverages modern React Native development practices with a focus on maintainable, scalable architecture.

## System Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                        Mobile App (React Native)               │
├─────────────────────────────────────────────────────────────────┤
│                        App Layer (_layout.tsx)                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ ThemeController │  │   AuthProvider   │  │  AppLayout      │  │
│  │   Provider      │  │                  │  │                 │  │
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
│  │     Notes       │  │      Docs       │  │    Settings     │  │
│  │   (index.tsx)   │  │   (docs.tsx)    │  │ (settings.tsx)  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                     Component Layer                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Auth Guard    │  │  Themed Views   │  │   UI Components │  │
│  │   Components    │  │   & Text        │  │   (Icon, etc.)  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      Service Layer                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Supabase      │  │   AsyncStorage  │  │   Theme Utils   │  │
│  │   Client        │  │   (Persistence) │  │   & Constants   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   External Services     │
                    │  ┌─────────────────────┐│
                    │  │  Supabase Backend   ││
                    │  │  - Authentication   ││
                    │  │  - Database         ││
                    │  │  - Real-time        ││
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
- **TailwindCSS 3.4.17**: Utility-first CSS framework
- **NativeWind 4.2.1**: TailwindCSS for React Native
- **React Native Reanimated 4.1**: Advanced animations
- **React Native Gesture Handler 2.28**: Gesture recognition

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
├── Manages: ColorSchemeMode ('light' | 'dark' | 'system')
├── Persistence: AsyncStorage (@noted_theme_preference)
├── Dependencies: useColorScheme (React Native)
└── Children: AuthProvider

AuthProvider
├── Manages: User session, authentication state
├── Dependencies: Supabase client
├── Methods: signUp, signIn, signOut
└── Children: App navigation stack
```

### 2. Navigation Architecture
```
Root Stack (_layout.tsx)
├── (tabs) - Protected by AuthGuard
│   ├── index.tsx (Notes)
│   ├── docs.tsx (Documentation)
│   └── settings.tsx (Settings)
├── auth - Public authentication flow
│   └── index.tsx (Login/Signup)
└── modal.tsx - Modal presentations
```

### 3. Component Hierarchy
```
Shared Components
├── auth-guard.tsx - Route protection
├── themed-view.tsx - Theme-aware containers
├── themed-text.tsx - Theme-aware typography
├── shared-page-layout.tsx - Common page structure
└── ui/
    ├── icon-symbol.tsx - Cross-platform icons
    └── collapsible.tsx - Expandable content
```

### 4. Data Flow Patterns

**Theme Management Flow:**
```
System Theme Change → useColorScheme → ThemeController →
resolvedScheme → Navigation Themes → Component Colors
```

**Authentication Flow:**
```
Auth Action → Supabase Client → Auth Context →
Session State → AuthGuard → Route Access
```

**Component Styling Flow:**
```
Theme Context → useThemeColors Hook →
Component Props → NativeWind Classes
```

## Design Decisions & Rationale

### 1. Expo Router vs React Navigation
**Decision:** Expo Router
**Rationale:** File-based routing provides better developer experience, automatic TypeScript generation, and simplified navigation patterns. The folder structure directly maps to app navigation.

### 2. Context-based State Management
**Decision:** React Context + Hooks instead of Redux/Zustand
**Rationale:** For the current scope (auth + theme), React Context provides sufficient state management without additional complexity. Easy to upgrade to external state management later.

### 3. Supabase Backend
**Decision:** Supabase as Backend-as-a-Service
**Rationale:** Provides authentication, real-time database, and API generation without backend development overhead. TypeScript support and React integration.

### 4. Greyscale Theme System
**Decision:** Custom greyscale color palette instead of platform defaults
**Rationale:** Provides consistent branding across platforms while maintaining accessibility. Uses softer backgrounds (#fafafa, #121212) for better visual comfort.

### 5. TailwindCSS + NativeWind
**Decision:** TailwindCSS utility classes for React Native
**Rationale:** Consistent styling system across web and mobile. Reduced StyleSheet boilerplate, better developer productivity, and maintainable design system.

### 6. TypeScript Strict Mode
**Decision:** Full TypeScript implementation
**Rationale:** Type safety prevents runtime errors, improves developer experience, and provides better refactoring capabilities. Essential for team collaboration.

## Security Considerations

- **Environment Variables:** Supabase credentials stored in environment variables
- **Client-side Keys:** Using Supabase anon key (appropriate for client-side usage)
- **Route Protection:** AuthGuard component prevents unauthorized access to protected routes
- **Session Management:** Automatic session refresh and cleanup handled by Supabase

## Performance Optimizations

- **React Compiler:** Enabled experimental React Compiler for automatic optimizations
- **Memoization:** Strategic use of `useMemo` and `useCallback` in theme controller
- **Code Splitting:** Natural code splitting through Expo Router's file-based routing
- **Image Optimization:** Expo Image for optimized image loading

## Scalability Patterns

- **Modular Architecture:** Clear separation between contexts, components, and utilities
- **Hook-based Logic:** Reusable business logic through custom hooks
- **Component Composition:** Shared layout components for consistent UI patterns
- **Theme System:** Extensible color and typography system

---

**🤖 Generated with Claude Code - AI-powered system architecture documentation**
**Built for scalable React Native development with modern best practices**