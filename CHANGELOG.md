# Changelog

All notable changes to the Noted app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **18-Color Theme System** (Phase 2.1 - selectedSurface)
  - Added selectedSurface color (9th Phase 2 color) for selected/active item states
  - Provides visual feedback when note card menu is open
  - Semantically distinct from elevatedSurface (selection vs elevation)
  - All 10 themes include selectedSurface in light and dark modes
- **10-Theme Color Spectrum** (5 new themes added)
  - Forest: Natural green aesthetic for calm and focused work
  - Lavender: Soft purple aesthetic for creative work
  - Amber: Warm amber tones for energetic focus
  - Midnight: True black for OLED screens with maximum contrast
  - Rose: Soft rose aesthetic for gentle, modern design
  - Complete color spectrum coverage: grey, teal, brown, blue, red, green, purple, orange, black, pink
- **17-Color Theme System** (Phase 2 of Theme Expansion)
  - Expanded from 9 to 17 colors per theme for richer UI design
  - Added elevatedSurface for layered UI elements (modals, popovers)
  - Added overlay for semi-transparent modal backdrops
  - Added hover and pressed states for interactive elements
  - Added disabled state for non-interactive elements
  - Added highlight color for selections and notifications
  - Added linkColor for hyperlinks (distinct from buttons)
  - Added accentSecondary for visual variety
  - All themes updated with full 18-color palettes (180 total color values per theme)
  - Backward compatible: existing components work unchanged
- **New Themes Added** (Phase 1 of Theme Expansion)
  - Sepia: Warm vintage aesthetic for comfortable reading with brown earth tones
  - Nord: Cool Arctic-inspired palette for focused work with blue accents
  - Total themes increased from 2 to 10 across multiple phases
- **Modal Theme Picker**
  - Full-screen modal with large theme previews (120x80px showing background, surface, text, tint)
  - Light/Dark preview toggle to see themes before applying
  - Responsive grid layout (2 columns mobile, 3 columns desktop)
  - Selected theme indicator with "Current" badge
  - Smooth slide-up animation
- **Brand Icon Implementation**
  - Replaced generic placeholder icons with custom `noted-white.png` brand asset
  - Unified icon across browser favicon, PWA desktop shortcuts, iOS home screen, and Android launchers
  - Added branding assets documentation to README
- **Theme System Architecture Overhaul** (All 5 improvements completed 2025-09-30)
  - Extracted theme validation to `VALID_THEME_NAMES` constant for automatic validation updates
  - Added `DEFAULT_THEME_NAME` and `DEFAULT_COLOR_SCHEME` constants for single source of truth
  - Created typed storage utility (`lib/theme-storage.ts`) for type-safe theme persistence
  - Added theme metadata with `displayName` and `description` fields for professional UI
  - Implemented error state tracking with user-visible error banner in settings
  - System now ready for easy addition of new themes without code duplication

### Changed
- **Theme Names Modernized**
  - Renamed greyscale → Monochrome (pure cool neutrals)
  - Renamed bearRedGraphite → Crimson (rich red aesthetic)
  - Renamed appleNotes → Ocean (vibrant teal/turquoise)
  - Updated DEFAULT_THEME_NAME to 'monochrome'
- **Note Card UX Improvements**
  - Decluttered note cards by consolidating actions into overflow menu
  - Removed inline editing in favor of modal editing (preparing for rich text)
  - Replaced centered modal menu with contextual dropdown using react-native-popup-menu
  - Added visual highlight (selectedSurface background) when note menu is active
- **Info Page Reorganization**
  - Reordered cards: Quick Start (new), About, Git, Contact (new)
  - Removed README and Integrations cards
  - Added Quick Start onboarding card
  - Added Contact support card
- **Settings Page Cleanup**
  - Removed "Theme Style" label above theme picker
  - Renamed Debug section → Profile
  - Profile section now shows only user email
  - Removed debug color/scheme display fields
- **Theme Selection UI Enhancement**
  - Replaced horizontal card grid with compact selector button in settings
  - Settings page now shows single-row theme selector with color preview dots
  - Tapping selector opens full-screen modal theme picker
  - Scalable design supports 10+ themes
- **Icon Assets**
  - Moved `noted-white.png` to `assets/images/` directory for proper organization
  - Updated `app.json` favicon and PWA manifest icon references
  - Updated `app/+html.tsx` Apple touch icon paths
  - Backed up old icons as `favicon-old.png` and `icon-old.png`
- **Theme System**
  - Theme validation now automatically includes new themes when added to `Themes` object
  - Default theme and color scheme defined via constants instead of magic strings
  - Backward compatibility export now uses `DEFAULT_THEME_NAME` constant
  - Removed `Colors` object dependency in tab layout (app/(tabs)/_layout.tsx:17,28,29)
  - All AsyncStorage theme operations now use typed `ThemeStorage` utility
  - Settings UI displays theme metadata (displayName/description) for better UX
  - Error banner shows when theme preferences fail to load

### Technical Improvements
- **Theme System Architecture**: Complete refactor for maintainability and extensibility
  - Single source of truth for theme validation (constants/theme.ts:88 - VALID_THEME_NAMES)
  - Eliminated magic strings ('greyscale', 'system') throughout codebase
  - Enhanced type safety with default theme constants and typed storage utility
  - Type-safe AsyncStorage wrapper (lib/theme-storage.ts) with ThemeName/ColorSchemeMode types
  - Error state propagation from storage layer to UI with user-facing error messages
  - Theme metadata system supports future extensibility (icons, preview colors, etc.)
- Professional asset organization with semantic naming conventions

### Known Issues
- Safe area CSS causing excessive whitespace above header and below footer on non-iOS devices
- Need to restrict safe area padding to standalone PWA mode only
- TypeScript errors related to web CSS strings in React Native styles (non-critical)

### Removed
- "Welcome back!" toast notification on login for cleaner, less intrusive UX

### Fixed
- **iOS App Icon Path** (Phase 1 - iOS Icon Fix)
  - Updated app.json line 7 to point to correct `noted-white.png` asset
  - Fixed broken iOS builds caused by reference to non-existent icon.png file
  - Backed up original 1024x1024 icon as `noted-white-original.png`
- Tab sliding animation by removing haptic feedback component
- Type indexing errors in tab layout by using `colors` from `useThemeColors()` hook

## [1.0.0] - 2025-09-21

### Added
- **Progressive Web App (PWA) Features**
  - Service worker with caching strategies for offline functionality
  - Web app manifest for installation prompts
  - Install cards for desktop and mobile with browser-specific instructions
  - Offline fallback page
- **Material Design Icons Integration**
  - Google Fonts CDN integration for reliable icon rendering
  - Replaced custom IconSymbol with MaterialIcons across all tabs
- **Enhanced Deployment Workflow**
  - Git-based auto-deployment through Vercel
  - Persistent PWA configuration in source files
  - Custom HTML template for consistent build output

### Changed
- Removed tab bar text labels for cleaner icon-only interface
- Updated Vercel configuration for static PWA builds
- Improved tab interaction by removing haptic feedback

### Fixed
- Material Icons rendering as squares by adding Google Fonts CDN
- Build configuration overwriting by moving settings to source files
- Deployment conflicts by implementing git-based workflow
- Tab sliding animations by removing PlatformPressable component

### Technical Improvements
- Custom HTML template (`app/+html.tsx`) for persistent configurations
- Proper safe area CSS variables for iOS support
- Optimized caching strategies in service worker
- Browser and device detection for install instructions

## [0.3.0] - 2025-09-20

### Added
- Complete notes CRUD implementation with enhanced UX
- Real-time note saving and editing capabilities
- Note deletion with confirmation modals

### Improved
- User interface design and user experience
- Form validation and error handling

## [0.2.0] - 2025-09-19

### Added
- Supabase authentication with custom UI
- Protected routes and authentication guards
- User session management

### Implemented
- Sign in/sign up functionality
- Secure authentication flow
- Route protection for authenticated content

## [0.1.0] - 2025-09-18

### Added
- Initial notes app implementation
- Shared layout system
- Documentation pages
- Comprehensive theme system with greyscale colors
- Dark/light mode support

### Infrastructure
- Expo React Native framework setup
- TypeScript configuration
- Basic navigation structure
- Theme context and color system

---

## Development Notes

### PWA Implementation Details
The PWA implementation includes comprehensive offline support, install prompts for both desktop and mobile platforms, and proper iOS safe area handling. The service worker implements intelligent caching strategies for app shell, API responses, and static assets.

### Deployment Workflow
The project uses git-based deployment through Vercel, eliminating manual deployment conflicts. All PWA configurations are maintained in source files to prevent build overwrites.

### Icon System
Transitioned from custom IconSymbol to Material Design Icons with Google Fonts CDN for reliable cross-platform rendering and consistent design language.