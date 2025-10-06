# Changelog

All notable changes to the Noted app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Auto-Assign Notes to Folder** (2025-10-06)
  - New notes created while viewing a folder are automatically assigned to that folder
  - Folder ID passed via URL parameter from Notes page to note editor
  - "All Notes" and "Unfiled" views create notes without folder assignment
  - Seamless organization workflow: select folder → create note → note appears in that folder
  - Reduces manual "Move to Folder" actions after note creation
- **Coming Soon Tab** (2025-10-06)
  - New "Soon" tab route with placeholder card for upcoming features
  - Tab reordered to center Dashboard: Info → Notes → Dashboard → Soon → Settings
  - Dashboard now at position 3 of 5 for ergonomic thumb access
  - Uses 'schedule' icon (clock) to represent future features
  - Consistent card styling with SharedPageLayout integration
- **Dashboard with Favorites and Recent Notes** (2025-10-05)
  - New Dashboard tab as home page (index route) with 'home' icon
  - Favorites section displays favorited notes without header for clean design
  - Last 3 section shows 3 most recently modified non-favorite notes with horizontal divider
  - Notes in favorites excluded from Last 3 to avoid duplication
  - Empty state cards for new users: "Add fav for quick access" and "Last 3 notes here"
  - Empty state dismisses when user adds notes or favorites
  - Auto-refresh via useFocusEffect hook when Dashboard tab gains focus
  - Database migration adds is_favorite boolean column with 2 performance indexes
  - Partial index on (user_id, is_favorite) for fast favorite queries
  - Partial index on (user_id, updated_at DESC) for Last 3 query optimization
  - 'Add to Favorites' action in popup menu (...) with star/star-border icon
  - 'Favorite' primary action card in long-press modal with dynamic label
  - Toast confirmation when toggling favorite status (sonner-native)
  - User stays on current note when favoriting (not redirected)
  - State synchronization ensures favorite icon reflects actual status
  - Service methods: toggleFavorite(), getFavoriteNotes(), getRecentNonFavoriteNotes()
  - Tab navigation updated: Info → Notes → Dashboard → Soon → Settings (Dashboard centered)
  - Notes list moved from index to dedicated 'notes' route
  - Migration file: 20251005000000_add_is_favorite_column.sql
- **Mobile Long Press Actions** (2025-10-05)
  - Added long press gesture on note cards to open actions modal (mobile only)
  - Long press on note title triggers full NoteActionsModal with 9 actions
  - Platform check ensures gesture only works on iOS/Android (not web)
  - Actions modal now available on all notes via long press or (...) button
  - Test note continues to use (...) button → modal for testing
  - Regular notes have both (...) dropdown menu AND long press → modal
  - Provides quick access to Edit, Share, Duplicate, AI Actions, Export, Organization, Copy, Delete, Download
  - Native mobile gesture pattern for intuitive note management
- **Unfiled Notes Filter** (2025-10-04)
  - Added "Unfiled" option to folder dropdown menu for viewing notes without folder assignment
  - Shows only notes where folder_id is NULL
  - Uses folder-off icon to indicate unorganized notes
  - Menu structure now: All Notes → Unfiled → [User Folders] → New Folder
  - Updated getNotesByFolder() to handle 'unfiled' special case
  - Helps users quickly find and organize notes that haven't been filed yet
- **Note Editor Navigation Controls** (2025-10-04)
  - Added back arrow button to all note editor headers (new, edit, loading, error states)
  - Uses MaterialIcons "arrow-back" with theme-aware colors
  - Navigates back to notes list via `router.back()`
  - Consistent styling across all header buttons (marginLeft: 16, activeOpacity: 0.7)
- **Markdown Editor with Toolbar** (2025-10-03)
  - Implemented full-featured markdown editor as alternative to modal editor
  - Feature flag controlled: `USE_MARKDOWN_EDITOR` in `config/features.ts` (enabled by default)
  - Full-screen editing experience with edit/preview toggle
  - 8-button formatting toolbar: Bold, Italic, H1, H2, List, Code, Link, Table
  - Link dialog modal for creating `[text](url)` markdown links
  - Table generator modal with visual grid picker (2-10 rows, 2-8 cols)
  - HTML export functionality (web download, mobile share)
  - Auto-save with 1000ms debounce after typing stops
  - Error boundary with graceful fallback and user-friendly error screen
  - Smooth slide-in animations for native app feel
  - Theme-aware markdown rendering with 18-color palette support
  - Dual-editor strategy: Both old modal and new markdown editor maintained
  - Zero breaking changes: Instant rollback by toggling feature flag
  - Test route accessible via Settings → Developer → Test Markdown Editor
  - Components: `markdown-editor.tsx`, `markdown-renderer.tsx`, `markdown-toolbar.tsx`, `link-dialog-modal.tsx`, `table-generator-modal.tsx`, `markdown-error-boundary.tsx`
  - Services: `markdown-service.ts` for HTML conversion
  - Utils: `note-parser.ts` for title extraction
  - Routes: `app/note-editor/new.tsx`, `app/note-editor/[id].tsx`, `app/note-editor/test.tsx`
  - Documentation: `MARKDOWN_EDITOR_IMPLEMENTATION.md`
  - Implementation timeline: 5 checkpoints, 17 tasks (commits: 71b7224, 0804a17, 3a29c10, 63ad9b4, 4d9c738)
- **Coming Soon Feature Synchronization** (2025-10-02)
  - Created comprehensive planning docs for all Coming Soon features
  - Added 5 new plan files: ide-integration.json, exports.json, n8n-automation.json, themes-and-styles.json, sharing-collaboration.json
  - Added Search Bar and Advanced Filters to Coming Soon card (now showing 11 features total)
  - Moved website-plan.json to improvements/business/ (not a user feature)
  - Now all features in UI have corresponding detailed implementation plans
  - Feature list includes: Rich Text Editor, Search Bar, Advanced Filters, Sharing and Collaboration, Exports, Private Notes, Data Abstraction, IDE Integration, n8n Automation, New Themes and Styles, AI Integrations
- **Universal Card Component** (2025-10-02)
  - Created universal Card component (`components/common/card.tsx`) ensuring pixel-perfect consistency across all card types
  - Single source of truth for card structure: borderWidth 1, borderRadius 12, padding 16
  - Header always includes bottom border for visual separation
  - Supports both accordion mode (collapsible content) and static mode (always visible)
  - Empty children handling to prevent unnecessary spacing
  - All info cards migrated to use Card wrapper (download, quick-start, tech-stack, coming-soon, contact)
  - Note cards refactored to use Card component while maintaining independent expansion behavior
  - Eliminated duplicate card styling code across 6 components

### Added
- **Info Page Accordion Cards** (2025-10-02)
  - Created Download Card with iOS/Android/PC tabs and auto-detection
  - Platform-specific installation instructions for PWA setup
  - Quick Start Card with app actions organized by location (Header, Folder, Card, Tab Bar)
  - Tech Stack Card displaying technologies used (Frontend, Backend, UI/UX, PWA Features)
  - Coming Soon Card listing planned features
  - Contact Card with email contact information
  - Accordion UI pattern with single-card expansion state management
  - Horizontal divider lines between sections for improved visual separation
  - All cards use theme colors for consistent styling
- **Folders for Note Organization** (2025-10-02)
  - Created `folders` table with RLS policies for user-specific folder access
  - Added `folder_id` column to notes table (nullable, ON DELETE SET NULL)
  - Database constraints ensure folder names are not empty (max 255 characters)
  - Folder icon in header with dropdown menu for navigation and creation
  - "All Notes" default view shows all notes across folders
  - "Move to Folder" submenu in note card (...) menu for quick organization
  - New folder creation via header menu with validation modal
  - Real-time folder filtering without page reload
  - Services layer: `services/folders.ts` with full CRUD operations
  - Updated `services/notes.ts` with `getNotesByFolder()` method
  - Components: `FolderModal` for creation/renaming, folder dropdown in `CommonHeader`
  - Migration: `20251002120000_add_folders.sql`
  - Uses MaterialIcons and react-native-popup-menu for consistent UI
  - Foundation for nested folders via `parent_folder_id` (future enhancement)
- **Memory Leak Fix in NoteItem Component** (2025-10-02)
  - Fixed critical memory leak causing 4.5GB memory usage during development
  - Added cleanup useEffect to properly remove event listeners on unmount
  - Memoized all callback functions with useCallback to prevent listener accumulation
  - Wrapped component with React.memo() and custom comparison function
  - Prevents unnecessary re-renders when parent updates
  - Expected impact: 84% memory reduction (4.5GB → 700MB-1GB stable)
  - Fixes event listener accumulation from react-native-popup-menu Menu component
  - Component now only re-renders when note.id or note.updated_at changes
- **Database Input Validation Constraints** (2025-10-02)
  - Title max length: 200 characters (enforced at database level)
  - Title cannot be null or empty/whitespace
  - Content max length: 50,000 characters (~10 pages)
  - Prevents database corruption and malicious input
  - Migration: `20251002032805_add_note_constraints.sql`
- **Frontend Input Validation** (2025-10-02)
  - Real-time character counters (e.g., "150/200" for title)
  - Visual feedback: red borders when exceeding limits
  - Red counter text when over character limit
  - maxLength props prevent typing beyond limits
  - Validation errors before save with clear messages
  - Auto-trim whitespace before saving
  - Two-layer protection: frontend UX + database security
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
- **Dashboard Last 3 Section Divider** (2025-10-06)
  - Replaced "Last 3" text header with horizontal divider line
  - Divider uses theme's border color for consistent styling across all themes
  - Maintains same spacing as original text (24px top, 12px bottom)
  - Cleaner visual separation between favorites and recent notes sections
- **Markdown Toolbar Icon** (2025-10-04)
  - Changed toolbar icon from `format-size` to `text-format` in note editor headers
  - Better represents diverse formatting options (Bold, Italic, Headers, Lists, Code, Links, Tables)
  - More semantically accurate than font-size-specific icon
- **Toast Notifications for Note Actions** (2025-10-04)
  - Replaced blocking Alert.alert() modals with non-blocking toast notifications
  - Move to folder now displays actual folder name (e.g., "Note moved to Work")
  - Copy note action now uses toast instead of native alert
  - Consistent notification system across entire app using sonner-native
  - Better web compatibility and smoother user experience
- **Info and Settings Card Toggle Animation** (2025-10-04)
  - Improved accordion card toggle behavior with smooth transitions
  - Clicking one card now closes the current card before opening the new one
  - Added 200ms delay between close and open for smooth visual transition
  - Applied to both info page and settings page cards
- **Card Component Standardization** (2025-10-02)
  - Refactored all info cards to use universal Card component instead of inline structure
  - Refactored note-item.tsx to use Card component for consistent sizing
  - Refactored settings page into 3 card components (theme, profile, account)
  - Note card button sizes reduced from 32x32 to 24x24 to match info card icons
  - Collapsed card heights now identical across notes, info, and settings pages
  - Visual consistency: all cards share same border, padding, radius, and header structure
  - Standardized chevron icons across all cards (keyboard-arrow-down/right, size 24, textSecondary color)
  - Settings page reduced from 242 to 60 lines (75% reduction)
  - Settings cards now collapsible with single-card expansion pattern
  - Note card title click area expanded (chevron + title both trigger expansion)
- **Info Page Structure**
  - Renamed "docs" tab to "info" tab
  - Reordered header icons: refresh, folder, new note (left to right)
  - Replaced static content cards with interactive accordion cards
  - Single-card expansion ensures focused content consumption
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
- **Test Note (NOTE-MODAL-TEST)** (2025-10-05)
  - Removed development test note from All Notes view
  - Test note was used to demonstrate modal actions during development
  - All notes now have consistent menu and modal behavior
  - Simplified loadNotes() function by removing conditional test note injection (37 lines removed)
- **Legacy Modal Note Editor** (2025-10-04)
  - Removed old modal-based note editor code from notes screen
  - Removed `NoteModal` component imports and state management
  - Removed `USE_MARKDOWN_EDITOR` feature flag conditional logic
  - All notes now use full-screen markdown editor exclusively
  - Simplified notes screen code by eliminating dual-editor complexity
- "Welcome back!" toast notification on login for cleaner, less intrusive UX

### Fixed
- **Toast Notifications Blocked by Modal** (2025-10-06)
  - Fixed toast notifications being hidden behind NoteActionsModal bottom sheet
  - Changed toast position to `top-center` for all modal-triggered actions
  - Favorite toggle and "Coming Soon" toasts now appear above modal backdrop
  - Ensures toast visibility when modal covers bottom of screen (up to 80% height)
  - Affects: Favorite action, all Coming Soon action placeholders in modal
- **Favorites Database Migration Not Applied** (2025-10-06)
  - Fixed is_favorite column migration not applied to remote database
  - Repaired migration history conflict (20251002130000 orphan migration)
  - Ran `supabase migration repair` and `supabase db push` to apply migration
  - Resolved 3 issues: favorites not persisting, modal favorite button failing, dashboard load errors
  - All favorite functionality now working correctly across all pages
- **New Note Button Routing After Index Rename** (2025-10-06)
  - Fixed "+" button in header routing to old index instead of note editor
  - Updated fallback route from `/?openModal=true` to `/note-editor/new`
  - New note button now works from all tabs (Dashboard, Info, Settings, Soon)
  - Previously only worked from Notes page which had explicit onNewNote prop
- **Toast Notification Bottom Positioning** (2025-10-04)
  - Added 60px bottom offset to Toaster component
  - Prevents toast notifications from being cut off or overlapped by tab bar
  - Ensures full visibility on all platforms (web PWA, iOS, Android)
  - Accounts for tab bar height (44px) + safe area padding + visual spacing
- **Markdown Editor Focus Restoration** (2025-10-04)
  - Fixed TextInput losing focus after toolbar formatting actions on iOS
  - Added TextInput ref for programmatic focus control
  - Implemented `restoreFocus()` method with iOS-optimized timing (200ms delay)
  - Added `setSelection()` API fallback for newer React Native versions (deprecated `setNativeProps` replacement)
  - Delayed modal close by 250ms to prevent iOS from interrupting focus restoration
  - Automatically restores focus and cursor position after all toolbar actions (Bold, Italic, Headings, Lists, Code, Links, Tables)
  - Users can now format text and immediately continue typing without manual refocus
  - Improved writing flow: reduced from 6 steps to 4 steps per formatting action
  - Verified working on iOS, Android, and Web with proper keyboard handling
- **Note Editor Double Header Issue** (2025-10-04)
  - Fixed double header display showing both "note-editor" and screen-specific titles
  - Added `headerShown: false` for note-editor route in root Stack layout
  - Removed redundant screen title definitions from `note-editor/_layout.tsx`
  - Child screens now fully control their own headers via `<Stack.Screen>` components
  - Maintains shared navigation config (animations, gestures) in layout file
  - Result: Clean single-header display with proper theme colors and dynamic buttons
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