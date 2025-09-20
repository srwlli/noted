# Noted App UI Implementation Plan

Based on my review of the current Expo React Native app and the UI designs in the `noted-ui` folder, here's a comprehensive plan to transform the app into the Noted note-taking application:

## Current App Analysis
- **Framework**: Expo React Native with TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: Expo Router with tab-based navigation
- **Current State**: Basic template with placeholder content

## UI Design Analysis
The `noted-ui` folder contains 5 key screens:
1. **Authentication** - Login/signup with clean form design
2. **Dashboard** - Notes list with search and add functionality
3. **Form** - New note creation with title and content fields
4. **View** - Note viewing/editing with inline editing
5. **Settings** - App preferences and account management

## Implementation Plan

### Phase 1: Foundation & Design System
1. **Update Tailwind Configuration** - Add Noted's color scheme (`#137fec` primary, custom backgrounds)
2. **Create Reusable Components** - Buttons, inputs, cards matching the design
3. **Implement Theme System** - Dark/light mode with proper color tokens

### Phase 2: Core Screens
4. **Authentication Screen** - Login/signup form with proper validation
5. **Dashboard Screen** - Notes list with search, add button, and note cards
6. **New Note Screen** - Form for creating notes with title and content
7. **Note View Screen** - Read/edit notes with inline editing
8. **Settings Screen** - Dark mode toggle, profile, and app preferences

### Phase 3: Navigation & Integration
9. **Update Tab Navigation** - Replace current tabs with Notes, New Note, Settings
10. **Navigation Flow** - Proper routing between all screens
11. **State Management** - Notes storage and theme persistence

## Key Design Features to Implement
- **Color Scheme**: Primary blue (`#137fec`), light background (`#f6f7f8`), dark background (`#101922`)
- **Typography**: Inter font family with proper weight hierarchy
- **Components**: Rounded corners, subtle shadows, hover states
- **Layout**: Clean, minimal design with proper spacing
- **Icons**: Material Symbols and custom SVG icons
- **Responsive**: Mobile-first design with proper touch targets

## Technical Considerations
- Maintain existing Expo Router structure
- Use NativeWind for consistent styling
- Implement proper TypeScript types
- Add proper form validation
- Ensure accessibility compliance
- Optimize for both iOS and Android

## Detailed Task List

### Phase 1: Foundation & Design System
- [ ] Update Tailwind config with Noted color scheme and design tokens
- [ ] Create reusable UI components (buttons, inputs, cards) matching Noted design
- [ ] Implement dark/light theme switching functionality

### Phase 2: Core Screens
- [ ] Create authentication screen with login/signup form
- [ ] Implement main dashboard with notes list and search functionality
- [ ] Create new note form screen with title and content inputs
- [ ] Build note view/edit screen with inline editing capabilities
- [ ] Implement settings screen with dark mode toggle and account options

### Phase 3: Navigation & Integration
- [ ] Update tab navigation to match Noted design (Notes, New Note, Settings)
- [ ] Add proper navigation flow between all screens
- [ ] Implement notes storage and state management

## Color Palette
```css
Primary: #137fec
Background Light: #f6f7f8
Background Dark: #101922
Text Light: #11181C
Text Dark: #ECEDEE
```

## Component Specifications
- **Buttons**: Rounded corners (0.5rem), primary blue background, white text
- **Inputs**: Rounded corners (0.5rem), transparent background with subtle borders
- **Cards**: Rounded corners (0.75rem), subtle shadows, hover states
- **Typography**: Inter font family, proper weight hierarchy (400, 500, 700, 900)
- **Spacing**: Consistent 4px grid system
- **Icons**: 24px size, Material Symbols and custom SVGs

## File Structure Changes
```
app/
├── (tabs)/
│   ├── index.tsx (Dashboard/Notes List)
│   ├── new-note.tsx (New Note Form)
│   └── settings.tsx (Settings Screen)
├── auth/
│   └── index.tsx (Authentication)
├── note/
│   └── [id].tsx (Note View/Edit)
└── _layout.tsx (Root Layout)

components/
├── ui/
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── icon.tsx
└── notes/
    ├── note-card.tsx
    └── note-list.tsx
```

This plan provides a structured approach to implementing the Noted UI design while maintaining the existing Expo React Native architecture and adding the necessary components and screens to create a fully functional note-taking application.
