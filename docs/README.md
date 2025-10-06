# Noted

**Date:** October 6, 2025
**Version:** 1.0.0
**Maintainer:** willh

## Overview

Noted is a modern Progressive Web App (PWA) note-taking application built with React Native, Expo Router, and Supabase. The app features a universal card-based interface with 10 theme options, folder organization with favorites, Dashboard with quick access, dark/light mode support, user authentication, and full offline capabilities. Built with TypeScript and Material Design Icons, optimized for mobile, desktop, and web platforms.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)
- Supabase account for backend services

## Quickstart

### 1. Clone and Install
```bash
git clone <repository-url>
cd noted
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start Development Server
```bash
npm start
```

Expected output:
```
› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### 4. Run on Device/Simulator
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Usage Examples

### Basic Note Creation
```typescript
import { createNote } from '@/services/notes';

const newNote = await createNote({
  title: "Meeting Notes",
  content: "Discussion points and action items...",
  folder_id: null  // or specific folder ID
});
```

### Folder Management
```typescript
import { createFolder, getFolders, getFavoriteFolders, toggleFavorite } from '@/services/folders';

// Create a new folder
const folder = await createFolder('Work Notes');

// Get all folders for current user
const folders = await getFolders();

// Get favorite folders only
const favoriteFolders = await getFavoriteFolders();

// Toggle folder favorite status
await toggleFavorite(folderId, true); // Add to favorites
await toggleFavorite(folderId, false); // Remove from favorites
```

### Theme Integration
```typescript
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useThemeController } from '@/contexts/theme-controller';

// Access current theme colors
const { colors } = useThemeColors();
// colors.text, colors.background, colors.surface, colors.tint, etc.

// Change theme programmatically
const { setTheme, colorScheme } = useThemeController();
setTheme('ocean');  // 10 themes available
```

### Universal Card Component
```typescript
import { Card } from '@/components/common/card';

<Card
  isAccordion={true}
  isExpanded={expanded}
  onToggle={() => setExpanded(!expanded)}
  headerContent={
    <>
      <MaterialIcons name="info" size={24} color={colors.tint} />
      <Text>Header Title</Text>
    </>
  }
>
  <Text>Card content goes here</Text>
</Card>
```

### Authentication Flow
```typescript
import { useAuth } from '@/hooks/use-auth';

const { user, signIn, signOut } = useAuth();
if (!user) {
  // Show authentication screen
}
```

## Project Structure

```
noted/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Dashboard (home) - favorite notes, folders, recent notes
│   │   ├── notes.tsx      # Notes list screen with folder filtering
│   │   ├── info.tsx       # Information and quick start screen
│   │   ├── folders.tsx    # Folders management and navigation hub
│   │   └── settings.tsx   # Theme and account settings
│   ├── auth/              # Authentication screens
│   ├── note-editor/       # Note editor screens (new, edit, test)
│   ├── +html.tsx          # Custom HTML template for PWA
│   └── _layout.tsx        # Root layout with theme providers
├── components/            # Reusable UI components
│   ├── common/            # Shared components (Card, Header, Layout)
│   ├── info-cards/        # Info page accordion cards
│   ├── settings-cards/    # Settings page cards
│   ├── note-item.tsx      # Individual note card component
│   └── folder-modal.tsx   # Folder creation/editing modal
├── contexts/              # React Context providers
│   ├── auth-context.tsx   # User authentication state
│   └── theme-controller.tsx # Theme management
├── services/              # Backend service layer
│   ├── notes.ts           # Note CRUD operations (with favorites)
│   └── folders.ts         # Folder management (with favorites)
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   └── theme-storage.ts   # Type-safe AsyncStorage for themes
├── constants/             # App constants and themes
│   └── theme.ts           # 10 themes with 18 colors each
├── supabase/              # Database migrations and config
│   └── migrations/        # SQL migration files
└── assets/                # Images, icons, and static files
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run android` | Run on Android device/emulator |
| `npm run ios` | Run on iOS device/simulator |
| `npm run web` | Run in web browser |
| `npm run build` | Export production build |
| `npm run lint` | Run ESLint code analysis |
| `npm run validate-pwa` | Validate PWA configuration |
| `npm run reset-project` | Reset to clean Expo template |

## Troubleshooting

### Common Issues

**Metro bundler not starting**
```bash
# Clear Metro cache
npx expo start --clear
```

**Supabase connection errors**
- Verify `.env` file contains correct Supabase credentials
- Check network connectivity and Supabase project status
- Ensure RLS policies are properly configured

**TypeScript errors**
```bash
# Regenerate TypeScript definitions
npx expo install --fix
```

**Build failures on iOS**
```bash
# Clean iOS build
cd ios && xcodebuild clean && cd ..
npx expo run:ios --clear
```

### Decision Tree: Setup Issues

1. **App won't start?**
   - Check Node.js version (≥18)
   - Run `npm install` to ensure dependencies
   - Verify `.env` file exists with Supabase credentials

2. **Authentication not working?**
   - Confirm Supabase project is active
   - Check RLS policies on notes table
   - Verify anon key permissions

3. **Styling issues?**
   - Check theme context is properly wrapped in `_layout.tsx`
   - Verify colors are accessed via `useThemeColors()` hook
   - Ensure Material Icons are loaded (Google Fonts CDN in +html.tsx)

## Technology Stack

### Frontend
- **Framework:** React Native 0.81.4 with Expo Router 6.0
- **Language:** TypeScript 5.9
- **UI Components:** Material Design Icons (@expo/vector-icons)
- **Menus:** react-native-popup-menu for contextual dropdowns
- **Styling:** Custom 18-color theme system (10 themes)

### Backend
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth with RLS policies
- **Real-time:** Supabase Realtime for live updates
- **Storage:** AsyncStorage for local preferences

### PWA Features
- **Service Worker:** Offline-first caching strategies
- **Install Prompts:** iOS, Android, Desktop support
- **Icons:** Custom branded assets (noted-white.png)
- **Manifest:** Web app manifest for home screen installation

### Architecture
- **State Management:** React Context + Custom Hooks
- **Navigation:** File-based routing with Expo Router
- **Services Layer:** Centralized data access (notes.ts, folders.ts)
- **Type Safety:** Full TypeScript coverage with strict mode

---

## Key Features

- **Dashboard Home:** Quick access to favorite notes, favorite folders, and 3 most recent notes
- **10 Theme System:** Monochrome, Ocean, Sepia, Nord, Crimson, Forest, Lavender, Amber, Midnight, Rose
- **18-Color Palette:** Each theme includes 18 semantic colors (background, surface, text, tint, etc.)
- **Folder Organization:** Create folders, filter notes by folder, "All Notes" and "Unfiled" views
- **Folder Favorites:** Mark folders as favorites for quick Dashboard access
- **Note Favorites:** Star notes to pin them to top of Dashboard
- **Folders Tab:** Dedicated tab for managing all folders with favorite toggle
- **Universal Card Component:** Consistent accordion UI across info, notes, folders, and settings pages
- **Progressive Web App:** Install on iOS, Android, and desktop with offline support
- **Input Validation:** Title (200 chars), content (50,000 chars) with real-time feedback
- **Memory Optimized:** Fixed critical memory leak (4.5GB → 700MB-1GB stable)
- **Dark/Light Mode:** System-aware or manual toggle in settings

---

*🤖 Generated with [Claude Code](https://claude.com/claude-code)*

*This README provides comprehensive setup and usage guidance for the Noted application, designed for developers seeking to understand, extend, or contribute to the codebase.*