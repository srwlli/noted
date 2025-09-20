[Date]: 2025-09-20
[Version]: 1.0.0

# Architecture Reference

## Project Overview
- Mobile Tailwind Portal is a modern Expo-based React Native template delivering a clean, minimal UI with Tailwind CSS, automatic dark/light theming, and cross-platform reach across iOS, Android, and web (source: README.md).
- Core goals are rapid prototyping, reusable themed components, and Expo-managed workflows that hide native complexity while staying TypeScript-first.

## System Topology
```
+-----------------------+
| Expo Router Entry     | (package.json main -> expo-router/entry)
+-----------+-----------+
            |
     +------+------+-------------------------+
     | Root Stack Navigator (app/_layout.tsx) |
     +------+------+-------------------------+
            |
      +-----+-----+
      | (tabs)    | Modal stack screen
      +-----+-----+
            |
   +--------+--------+
   | Home (tabs/index) | Explore (tabs/explore)
   +--------+--------+
            |
     +------+------+-------------------+
     | Shared UI Layer (components/**) |
     +------+------+-------------------+
            |
   +--------+--------+-------------------+
   | Hooks/theme  | Constants | Assets   |
   +---------------+----------+----------+
```
- The entry point loads the root stack, which anchors tab navigation and optional modal screens.
- Tabs orchestrate feature surfaces, while shared UI and theming utilities back both screens.
- Static design artifacts in `noted-ui` inform future product expansion but stay out of the runtime bundle.

## Module Boundaries
- `app/`: Route-driven screen composition using Expo Router; `_layout.tsx` manages navigation shell, `(tabs)` encapsulates tabbed surface areas (`index`, `explore`, `modal`).
- `components/`: Themed presentation primitives (e.g., `themed-text`, `themed-view`), interaction wrappers (`haptic-tab`), and animated containers (`parallax-scroll-view`) to keep screen code declarative.
- `hooks/`: Lightweight adapters for platform color scheme (`use-color-scheme`) and merged palette resolution (`use-theme-color`).
- `constants/`: Theme tokens (`Colors`, `Fonts`) bridging React Native and web typography/color affordances.
- `assets/`: Shared imagery and icons referenced via Expo asset system.
- `scripts/reset-project.js`: Operational tooling to wipe or archive feature scaffolding; intentionally separated from runtime.
- `noted-ui/`: HTML/PNG design snapshots (authentication, dashboard, settings) acting as product design references without being compiled into the app.

## Technology Stack Decisions
- **Expo SDK 54 + React Native 0.81**: Provides managed workflow with new architecture enabled, simplifying native builds while keeping performance parity.
- **Expo Router + React Navigation**: File-based routing lowers mental overhead and scales to nested stacks/tabs; pairing with React Navigation ensures mature navigation semantics.
- **NativeWind + Tailwind CSS**: Utility-first styling keeps parity with web Tailwind conventions, accelerating prototyping and enforcing consistent spacing/typography.
- **TypeScript Strict Mode**: Enforces type safety across screens/components, reducing runtime regressions from mis-typed props or theme keys.
- **React Native Reanimated & Gesture Handler**: Powers advanced motion (parallax effects, animated gestures) while staying performant on mobile.
- **Expo Haptics & Symbol Icons**: Enhances UX polish with tactile feedback and platform-aware iconography.

## Data Flow & State
- Navigation state is owned by Expo Router and React Navigation; screens are pure functional components responding to route events.
- Theming flow: `useColorScheme` (platform source) feeds `useThemeColor` (token mapping) which drives themed components.
- UI events bubble through React props; specialized handlers like `HapticTab` intercept interactions to trigger side effects (haptic feedback) before delegating to navigation handlers.
- Static content (images, copy) is bundled via the Expo asset loader and referenced declaratively in screens/components.

## Dependency Map
- **Runtime Core**: `expo`, `react`, `react-native`, `react-native-web` underpin cross-platform execution; `expo-router` ties in navigation entry.
- **Navigation Layer**: `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/elements`, `react-native-screens` implement stack plus tab orchestration.
- **Presentation/Theming**: `nativewind`, `tailwindcss`, themed components (`components/**`), and `constants/theme.ts` deliver styling cohesion across light/dark modes.
- **Interaction & UX**: `expo-haptics`, `expo-image`, `react-native-gesture-handler`, `react-native-reanimated`, `expo-symbols`, `@expo/vector-icons` add sensory feedback, optimized media, and animation capabilities.
- **Tooling & Quality**: TypeScript 5.9, ESLint 9, Expo lint config, plus `scripts/reset-project.js` for repo hygiene.
- Dependencies intentionally avoid global state managers; local hooks suffice for current template scope and keep the bundle lean.

## Rationale & Future Notes
- Separation between `app/` routes and `components/` primitives enforces clear boundaries, enabling future feature teams to swap screens without duplicating UI logic.
- Tailwind plus NativeWind chosen over bespoke StyleSheet code to maximize designer-developer velocity and align with web design system conventions.
- The `noted-ui` artifact directory keeps UX deliverables versioned alongside code, supporting AI or automation pipelines that may synthesize UI flows.
- Maintaining the Expo-managed workflow ensures rapid iteration; ejecting is deferred until native extensions demand it.

---
[Date]: 2025-09-20
[Version]: 1.0.0
AI Support: Codex (GPT-5) generated this POWER-aligned architecture reference to accelerate future AI-assisted delivery.
