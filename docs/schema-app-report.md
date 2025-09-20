# Noted Mobile Application – Integrated Architecture & Schema Report

**Generated**: September 20, 2025
**Report Version**: 1.1.0
**Agent**: Synthesized Architecture & Schema Brief
**Framework**: COSTAR with Schema Appendix

---

## Executive Summary
Noted is a modern, cross-platform mobile note-taking experience built with Expo Router, React Native 0.81, and strict-mode TypeScript. The project balances clean UI templates, reusable themed primitives, and design references (`noted-ui/`) that guide future product work. This consolidated brief merges the previous architecture report and schema reference so product, engineering, and AI assistants can rely on a single authoritative source.

---

## Context – System Overview
- **Architecture**: Expo Router drives navigation with a root stack plus tab group, reinforced by shared themed components and hooks for light/dark parity.
- **Technology Foundation**: Expo SDK 54, React 19.1, NativeWind + Tailwind CSS, React Navigation, React Native Reanimated, Expo Haptics, and Symbol/Icon sets for polish.
- **Development Maturity**: Production-ready patterns with TypeScript strict mode, themed primitives, and extensive design artifacts; API/back-end layers are intentionally deferred.

### Project Topology
```text
expo-router/entry ? app/_layout.tsx (Stack)
  +- app/(tabs)/_layout.tsx (Bottom tabs, haptic buttons)
  ¦   +- app/(tabs)/index.tsx (Dashboard/Home)
  ¦   +- app/(tabs)/explore.tsx (Discovery/Docs demo)
  +- app/modal.tsx (Modal surface)

components/** ? themed primitives, navigation helpers, UI widgets
hooks/** ? color-scheme, theme token helpers
constants/theme.ts ? color + font tokens
assets/images ? platform icons, branding
noted-ui/** ? HTML/PNG reference mockups (auth, dashboard, form, settings, view)
```

---

## Objective – What It Is, How It Works, Value
- **What**: A UI-first starter for note-taking experiences with reusable components, dark/light theming, and cross-platform parity.
- **How**: File-based routing, themed component library, NativeWind utility styling, and optional modals/animations demonstrate advanced UI behaviors without data services.
- **Value**: Accelerates prototyping, enforces consistency, and provides AI-ready documentation for code generation or future integration work.

---

## Configuration & Data Schemas
### Expo Configuration (`app.json`)
```json
{
  "expo": {
    "name": "string",
    "slug": "string",
    "version": "string",
    "orientation": "portrait" | "landscape" | "default",
    "icon": "string",
    "scheme": "string",
    "userInterfaceStyle": "automatic" | "light" | "dark",
    "newArchEnabled": boolean,
    "ios": { "supportsTablet": boolean },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "string",
        "foregroundImage": "string",
        "backgroundImage": "string",
        "monochromeImage": "string"
      },
      "edgeToEdgeEnabled": boolean,
      "predictiveBackGestureEnabled": boolean
    },
    "web": { "output": "static" | "server", "favicon": "string" },
    "plugins": ["plugin" | ["plugin", object]],
    "experiments": { "typedRoutes": boolean, "reactCompiler": boolean }
  }
}
```
Validation: required strings must be non-empty; semver for `version`; hex color for `backgroundColor`; referenced assets must exist.

### Package Configuration (`package.json`)
```json
{
  "name": "string",
  "main": "string",
  "version": "string",
  "scripts": { "key": "command" },
  "dependencies": { "package": "semver" },
  "devDependencies": { "package": "semver" },
  "private": boolean
}
```
Validation: npm name rules, semver versions, entry file must resolve, dependencies declared before import.

### TypeScript Configuration (`tsconfig.json`)
```json
{
  "extends": "string",
  "compilerOptions": {
    "strict": boolean,
    "paths": { "@/*": ["./*"] }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts", "nativewind-env.d.ts"]
}
```
Validation: ensure extended base exists; path aliases resolve from repo root; include patterns reflect actual directories.

### Tailwind/NativeWind Configuration (`tailwind.config.js`)
```js
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: { extend: {} },
  plugins: []
};
```
Validation: keep content globs aligned with routes/components to ensure classes are discovered.

---

## Theme & Component Schemas
### Color & Font Tokens (`constants/theme.ts`)
```typescript
export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: "#0a7ea4",
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: "#0a7ea4",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: "#fff",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#fff",
  },
};
```
Fonts use `Platform.select` to route to system families across iOS, Android/Web.

### Themed Components
`ThemedText` & `ThemedView` consume `useThemeColor` to auto-select palette tokens.
```typescript
export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};
```
Props maintain TypeScript-first patterns with optional overrides.

### Navigation Structure
```
app/
+- _layout.tsx         // Root stack layout
+- (tabs)/
¦   +- _layout.tsx     // Tab navigator with HapticTab button
¦   +- index.tsx       // Home/Dashboard
¦   +- explore.tsx     // Explore screen using ParallaxScrollView
+- modal.tsx           // Modal screen stacked above tabs
```
Rules: `_layout.tsx` exports default layout component; parentheses denote layout groups; filenames map to route segments.

### Shared Component Inventory
- `components/haptic-tab.tsx`: wraps tab buttons with Expo Haptics (iOS-only).
- `components/external-link.tsx`: unified external link handling for native/web.
- `components/parallax-scroll-view.tsx`: reanimated-powered scroll container for Explore screen.
- `components/ui/collapsible.tsx`: disclosure component supporting theme-aware styling.
- `components/ui/icon-symbol(.ios).tsx`: SF Symbol on iOS, vector icon fallback cross-platform.
- `components/hello-wave.tsx`: animated wave demo using Reanimated (currently unused in routing layer).

### Error & Build Schemas
```typescript
interface TypeScriptError {
  file: string;
  line: number;
  column: number;
  code: number;
  message: string;
  category: 'error' | 'warning' | 'suggestion';
}

interface ExpoBuildError {
  platform: 'ios' | 'android' | 'web';
  phase: 'compile' | 'bundle' | 'build' | 'deploy';
  code?: string;
  message: string;
  stack?: string;
}
```

---

## Audience & Integration Focus
- **Technical Leads**: align navigation, theming, and component usage; ensure typed routes remain enabled; monitor `unstable_settings.anchor` for deep links.
- **Developers**: leverage NativeWind utilities, themed primitives, and component catalog to compose screens rapidly; reuse `noted-ui` HTML/PNG mockups as visual contracts.
- **Design/UX**: maintain parity between mockups and app by mirroring spacing, typography, and color tokens defined above.

---

## Development Workflow
1. Install deps (`npm install`), launch dev server (`npm start`).
2. Use Expo Go / simulators for live reload; press `w` for web preview.
3. Styling via Tailwind class utilities; Themed components guarantee light/dark coverage.
4. `expo lint` provides linting; `tsconfig` enforces strict typing.
5. `scripts/reset-project.js` can archive or delete scaffolding—document destructive behavior before use.

---

## Strategic Roadmap (UI-Centric)
- **Phase 1 – Foundation (Done)**: Navigation shell, theming pipeline, shared component library, design artifacts.
- **Phase 2 – Feature UI (Planned)**: Build auth, dashboard, new note form, note view, settings screens based on `noted-ui` references; add reusable card/list primitives.
- **Phase 3 – Interactivity Enhancements**: Integrate animations (Parallax, HelloWave) across screens, add haptics to key interactions, ensure accessibility/contrast compliance.
- **Phase 4 – Future Integrations**: Introduce data/APIs, offline caching, push notifications, collaborative features once UI surfaces are stable.

---

## AI Integration Recommendations
- Consistent component patterns and documented props enable code generation.
- Schema definitions above supply structured data for validation/automation.
- `noted-ui` assets can seed AI-driven UI synthesis or test case generation.
- Future AI features: semantic search, smart tagging, template suggestions, note summarization.

---

## Conclusion & Next Steps
**Strengths**: Modern tooling, cross-platform parity, strict typing, reusable UI system, AI-ready docs. 
**Next Actions**:
1. Implement documented UI surfaces using shared components and NativeWind classes.
2. Add accessibility verification (contrast, screen reader labels) before data integration.
3. Plan CI automation for `expo lint` and TypeScript checks; communicate reset script implications.

---

*This integrated reference supersedes the separate schema-only document. For updates, modify this report to keep architecture context and schema definitions synchronized.*
