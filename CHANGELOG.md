# Changelog

All notable changes to the Noted app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Known Issues
- Safe area CSS causing excessive whitespace above header and below footer on non-iOS devices
- Need to restrict safe area padding to standalone PWA mode only

### Fixed
- Tab sliding animation by removing haptic feedback component

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