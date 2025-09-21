# [React Native] Component Library Reference

**Framework:** React Native + Expo
**Version:** 1.0.0
**Description:** Reusable UI components for the Noted mobile application

## Core Theme Components

### ThemedText
A text component that automatically adapts to light/dark themes.

**Props:**
```typescript
export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};
```

**Usage:**
```tsx
import { ThemedText } from '@/components/themed-text';

// Basic usage
<ThemedText>Regular text</ThemedText>

// With type styling
<ThemedText type="title">Page Title</ThemedText>
<ThemedText type="subtitle">Section Header</ThemedText>
<ThemedText type="link">Clickable Link</ThemedText>

// Custom colors
<ThemedText lightColor="#000" darkColor="#fff">
  Custom themed text
</ThemedText>
```

### ThemedView
A view container that automatically adapts background color to themes.

**Props:**
```typescript
export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};
```

**Usage:**
```tsx
import { ThemedView } from '@/components/themed-view';

<ThemedView style={{ padding: 16 }}>
  <ThemedText>Content inside themed container</ThemedText>
</ThemedView>
```

## Layout Components

### SharedPageLayout
A common layout wrapper used across all main app screens.

**Props:**
```typescript
interface SharedPageLayoutProps {
  children: React.ReactNode;
  onNewNote?: () => void;
  scrollable?: boolean; // default: true
}
```

**Usage:**
```tsx
import { SharedPageLayout } from '@/components/shared-page-layout';

export default function MyScreen() {
  const handleNewNote = () => {
    // Handle new note creation
  };

  return (
    <SharedPageLayout onNewNote={handleNewNote}>
      <ThemedText>Page content</ThemedText>
    </SharedPageLayout>
  );
}
```

### ParallaxScrollView
A scroll view with parallax header animation effects.

**Props:**
```typescript
type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;
```

**Usage:**
```tsx
import ParallaxScrollView from '@/components/parallax-scroll-view';

<ParallaxScrollView
  headerImage={<HelloWave />}
  headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
>
  <ThemedText>Scrollable content</ThemedText>
</ParallaxScrollView>
```

### CommonHeader
Header component with app branding and optional new note button.

**Props:**
```typescript
interface CommonHeaderProps {
  onNewNote?: () => void;
}
```

**Usage:**
```tsx
import { CommonHeader } from '@/components/common-header';

<CommonHeader onNewNote={() => createNewNote()} />
```

## Interactive Components

### Collapsible
An expandable/collapsible content section with animated chevron.

**Props:**
```typescript
PropsWithChildren & { title: string }
```

**Usage:**
```tsx
import { Collapsible } from '@/components/ui/collapsible';

<Collapsible title="Advanced Settings">
  <ThemedText>Hidden content here</ThemedText>
</Collapsible>
```

### ExternalLink
A link component that opens URLs in the system browser (native) or new tab (web).

**Props:**
```typescript
type Props = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: Href & string
};
```

**Usage:**
```tsx
import { ExternalLink } from '@/components/external-link';

<ExternalLink href="https://example.com">
  <ThemedText type="link">Visit Website</ThemedText>
</ExternalLink>
```

### HapticTab
A tab button component with iOS haptic feedback on press.

**Props:**
```typescript
BottomTabBarButtonProps
```

**Usage:**
```tsx
import { HapticTab } from '@/components/haptic-tab';

// Used in tab navigator configuration
tabBarButton: (props) => <HapticTab {...props} />
```

## Icon Components

### IconSymbol
Cross-platform icon component using SF Symbols (iOS) and Material Icons (Android/Web).

**Props:**
```typescript
{
  name: IconSymbolName; // 'house.fill' | 'paperplane.fill' | 'chevron.left.forwardslash.chevron.right' | 'chevron.right'
  size?: number; // default: 24
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}
```

**Usage:**
```tsx
import { IconSymbol } from '@/components/ui/icon-symbol';

<IconSymbol
  name="house.fill"
  size={20}
  color={colors.icon}
/>
```

### HelloWave
Animated wave emoji component with rotation animation.

**Usage:**
```tsx
import { HelloWave } from '@/components/hello-wave';

<HelloWave />
```

## Authentication Components

### AuthGuard
Route protection component that redirects unauthenticated users to login.

**Props:**
```typescript
interface AuthGuardProps {
  children: React.ReactNode;
}
```

**Usage:**
```tsx
import { AuthGuard } from '@/components/auth-guard';

export default function ProtectedScreen() {
  return (
    <AuthGuard>
      <ThemedText>Protected content</ThemedText>
    </AuthGuard>
  );
}
```

## State Management Patterns

### Theme Integration
All components use the theme system via hooks:

```tsx
import { useThemeColors } from '@/hooks/use-theme-colors';

const { colors, colorScheme, isDark } = useThemeColors();
```

### Authentication State
Components access auth state through context:

```tsx
import { useAuth } from '@/hooks/use-auth';

const { user, session, loading, signIn, signOut } = useAuth();
```

## Design System

### Color Tokens
Components use standardized color tokens from `@/constants/theme`:

- `colors.background` - Page backgrounds
- `colors.surface` - Card/panel backgrounds
- `colors.text` - Primary text
- `colors.textSecondary` - Secondary text
- `colors.border` - Borders and dividers
- `colors.tint` - Interactive elements

### Typography Scale
ThemedText supports these predefined styles:

- `default` - 16px, regular weight
- `defaultSemiBold` - 16px, 600 weight
- `title` - 32px, bold
- `subtitle` - 20px, bold
- `link` - 16px, blue color (#0a7ea4)

## Framework Conventions

### Import Paths
All components use absolute imports with `@/` alias:
```tsx
import { ThemedText } from '@/components/themed-text';
import { useThemeColors } from '@/hooks/use-theme-colors';
```

### Cross-Platform Support
Components handle platform differences:
- Icon mappings for iOS SF Symbols vs Material Icons
- Haptic feedback iOS-only
- Web browser handling for external links

### Expo Integration
Components leverage Expo modules:
- `expo-haptics` for tactile feedback
- `expo-web-browser` for in-app browsing
- `expo-router` for navigation
- `expo-symbols` for native icons

---

## AI Assistant Integration Notes

This component library is designed for React Native mobile development using Expo. When suggesting modifications or new components:

1. **Always use TypeScript** with proper prop interfaces
2. **Follow the theming pattern** - use `useThemeColors()` for colors
3. **Maintain cross-platform compatibility** - handle iOS/Android/Web differences
4. **Use absolute imports** with the `@/` path alias
5. **Follow the existing naming conventions** - PascalCase for components, kebab-case for files
6. **Integrate with Expo ecosystem** - prefer Expo modules over React Native Community packages
7. **Consider accessibility** - use proper semantic elements and contrast ratios
8. **Optimize for mobile** - touch targets, gestures, performance

**Generated with [Claude Code](https://claude.ai/code)**

**Framework:** React Native + Expo | **Version:** 1.0.0