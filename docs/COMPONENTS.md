# [POWER] Component Library Reference

## Overview

This document provides a comprehensive reference for all reusable components in the Mobile Tailwind Portal application. The app is built with React Native, Expo, TypeScript, and uses Tailwind CSS with NativeWind for styling. All components support both light and dark themes with automatic system preference detection.

## Project Context

**README Summary**: Modern React Native mobile application with cross-platform support (iOS, Android, Web), featuring clean minimal design, file-based routing, tab navigation, and TypeScript support. Built with Expo SDK 54, React 19.1.0, and uses Tailwind CSS for styling.

**Architecture Summary**: No dedicated architecture documentation found - components follow standard React Native patterns with hooks for state management and themed components for consistent styling.

**API Summary**: No dedicated API documentation found - app appears to be primarily UI-focused with potential for future API integration.

## Component Categories

### 1. Core UI Components

#### ThemedText
**File**: `components/themed-text.tsx:11`

A text component that automatically adapts to light/dark themes with predefined typography styles.

**Props**:
```typescript
type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};
```

**Usage**:
```jsx
import { ThemedText } from '@/components/themed-text';

// Basic usage
<ThemedText>Default text</ThemedText>

// With type styling
<ThemedText type="title">Page Title</ThemedText>
<ThemedText type="subtitle">Section Header</ThemedText>
<ThemedText type="link">Link Text</ThemedText>

// Custom colors
<ThemedText lightColor="#333" darkColor="#fff">
  Custom colored text
</ThemedText>
```

**Typography Styles**:
- `default`: 16px, line-height 24px
- `title`: 32px, bold, line-height 32px
- `subtitle`: 20px, bold
- `defaultSemiBold`: 16px, font-weight 600
- `link`: 16px, blue color (#0a7ea4)

#### ThemedView
**File**: `components/themed-view.tsx:10`

A view component that automatically adapts background colors to light/dark themes.

**Props**:
```typescript
type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};
```

**Usage**:
```jsx
import { ThemedView } from '@/components/themed-view';

// Basic themed container
<ThemedView>
  <ThemedText>Content here</ThemedText>
</ThemedView>

// Custom background colors
<ThemedView lightColor="#f5f5f5" darkColor="#2a2a2a">
  <ThemedText>Custom background</ThemedText>
</ThemedView>
```

### 2. Navigation Components

#### HapticTab
**File**: `components/haptic-tab.tsx:5`

A tab bar button component that provides haptic feedback on iOS when pressed.

**Props**: Extends `BottomTabBarButtonProps`

**Usage**:
```jsx
import { HapticTab } from '@/components/haptic-tab';

// Used in tab navigator configuration
<Tab.Screen
  name="home"
  component={HomeScreen}
  options={{
    tabBarButton: HapticTab,
  }}
/>
```

**Features**:
- iOS haptic feedback (Light impact)
- Platform-aware (only on iOS)
- Maintains original tab button functionality

#### ExternalLink
**File**: `components/external-link.tsx:7`

A link component that opens external URLs in an in-app browser on native platforms and new tab on web.

**Props**:
```typescript
type Props = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: Href & string
};
```

**Usage**:
```jsx
import { ExternalLink } from '@/components/external-link';

<ExternalLink href="https://example.com">
  <ThemedText type="link">Visit Website</ThemedText>
</ExternalLink>
```

**Features**:
- Cross-platform URL handling
- In-app browser on native (automatic presentation style)
- New tab on web
- Prevents default navigation on native

### 3. UI Components

#### Collapsible
**File**: `components/ui/collapsible.tsx:10`

An expandable content container with animated chevron indicator.

**Props**:
```typescript
type Props = PropsWithChildren & {
  title: string
};
```

**Usage**:
```jsx
import { Collapsible } from '@/components/ui/collapsible';

<Collapsible title="Section Title">
  <ThemedText>Collapsible content here</ThemedText>
  <ThemedText>More content...</ThemedText>
</Collapsible>
```

**Features**:
- Toggle state management
- Animated chevron rotation (0° → 90°)
- Theme-aware icon colors
- Touch feedback (activeOpacity: 0.8)

#### IconSymbol
**File**: `components/ui/icon-symbol.tsx:28`

A cross-platform icon component using SF Symbols on iOS and Material Icons elsewhere.

**Props**:
```typescript
type Props = {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
};
```

**Available Icons**:
- `house.fill` → `home`
- `paperplane.fill` → `send`
- `chevron.left.forwardslash.chevron.right` → `code`
- `chevron.right` → `chevron-right`

**Usage**:
```jsx
import { IconSymbol } from '@/components/ui/icon-symbol';

<IconSymbol
  name="house.fill"
  size={24}
  color="#333"
/>
```

### 4. Layout Components

#### ParallaxScrollView
**File**: `components/parallax-scroll-view.tsx:21`

An advanced scroll view with parallax header effects and animations.

**Props**:
```typescript
type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;
```

**Usage**:
```jsx
import ParallaxScrollView from '@/components/parallax-scroll-view';

<ParallaxScrollView
  headerImage={<Image source={heroImage} />}
  headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}>
  <ThemedView>
    <ThemedText type="title">Content Title</ThemedText>
    <ThemedText>Scrollable content here...</ThemedText>
  </ThemedView>
</ParallaxScrollView>
```

**Features**:
- Fixed header height (250px)
- Smooth parallax scrolling with interpolation
- Scale and translate animations
- Theme-aware background colors
- Reanimated 3 integration

#### HelloWave
**File**: `components/hello-wave.tsx:3`

An animated wave emoji component with CSS keyframe animation.

**Usage**:
```jsx
import { HelloWave } from '@/components/hello-wave';

<HelloWave />
```

**Features**:
- 👋 emoji with rotation animation
- 4 iteration cycles
- 300ms duration per cycle
- 25-degree rotation at 50% keyframe

### 5. Custom Hooks

#### useThemeColor
**File**: `hooks/use-theme-color.ts:9`

Hook for retrieving theme-appropriate colors with fallback support.

**Usage**:
```jsx
import { useThemeColor } from '@/hooks/use-theme-color';

function MyComponent() {
  const backgroundColor = useThemeColor(
    { light: '#fff', dark: '#000' },
    'background'
  );

  return <View style={{ backgroundColor }} />;
}
```

**Parameters**:
- `props`: Object with light/dark color overrides
- `colorName`: Key from Colors theme object

#### useColorScheme
**File**: `hooks/use-color-scheme.ts`

Hook for detecting current color scheme (light/dark).

**Usage**:
```jsx
import { useColorScheme } from '@/hooks/use-color-scheme';

function MyComponent() {
  const colorScheme = useColorScheme();
  return <Text>Current theme: {colorScheme}</Text>;
}
```

## State Management Patterns

### Theme Management
Components use the `useThemeColor` and `useColorScheme` hooks for consistent theming:

```jsx
// Pattern for themed components
function ThemedComponent({ lightColor, darkColor, ...props }) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  return <Text style={{ color }} {...props} />;
}
```

### Local State
Components manage local state with standard React hooks:

```jsx
// Toggle state pattern
function ToggleComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TouchableOpacity onPress={() => setIsOpen(!isOpen)}>
      {/* Conditional rendering based on state */}
    </TouchableOpacity>
  );
}
```

## Styling Conventions

### Tailwind CSS Integration
The main app component (`App.js`) uses Tailwind classes:

```jsx
// Grid layouts
<View className="grid grid-cols-2 gap-4 p-4">

// Cards with shadows
<View className="bg-white p-4 border border-gray-300 rounded shadow">

// Typography
<Text className="text-3xl font-bold text-gray-900">
```

### StyleSheet Patterns
Components use React Native StyleSheet for complex styling:

```jsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
```

## Color System

### Theme Colors
Defined in `constants/theme.ts:11`:

**Light Theme**:
- text: `#11181C`
- background: `#fff`
- tint: `#0a7ea4`
- icon: `#687076`

**Dark Theme**:
- text: `#ECEDEE`
- background: `#151718`
- tint: `#fff`
- icon: `#9BA1A6`

### Usage Pattern
```jsx
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function MyComponent() {
  const theme = useColorScheme() ?? 'light';
  const iconColor = Colors[theme].icon;

  return <IconSymbol color={iconColor} name="house.fill" />;
}
```

## Platform-Specific Features

### iOS Specific
- SF Symbols through `icon-symbol.ios.tsx`
- Haptic feedback in navigation
- System fonts and rounded typography

### Android/Web Fallbacks
- Material Icons for cross-platform consistency
- Standard fonts for compatibility

### Cross-Platform Components
All components are designed to work across iOS, Android, and Web with appropriate fallbacks and platform-specific optimizations.

## Best Practices

1. **Theme Consistency**: Always use `ThemedText` and `ThemedView` for automatic theme support
2. **Icon Usage**: Use `IconSymbol` with mapped SF Symbol names for consistent iconography
3. **Navigation**: Implement `HapticTab` for enhanced user feedback
4. **External Links**: Use `ExternalLink` for proper cross-platform URL handling
5. **Animations**: Leverage Reanimated 3 for performant animations
6. **State Management**: Use React hooks for local state, consider context for global state

## Copy-Paste Examples

### Basic Card Component
```jsx
import { ThemedView, ThemedText } from '@/components';

function InfoCard({ title, content }) {
  return (
    <ThemedView className="bg-white p-4 border border-gray-300 rounded shadow">
      <ThemedText type="defaultSemiBold">{title}</ThemedText>
      <ThemedText>{content}</ThemedText>
    </ThemedView>
  );
}
```

### Interactive Button with Haptics
```jsx
import { TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';

function HapticButton({ onPress, children }) {
  const handlePress = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress?.();
  };

  return (
    <TouchableOpacity onPress={handlePress} className="bg-blue-500 p-4 rounded">
      <ThemedText lightColor="#fff" darkColor="#fff">{children}</ThemedText>
    </TouchableOpacity>
  );
}
```

### Themed Icon with Color
```jsx
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

function ThemedIcon({ name, size = 24 }) {
  const iconColor = useThemeColor({}, 'icon');

  return (
    <IconSymbol
      name={name}
      size={size}
      color={iconColor}
    />
  );
}
```

---

## [Version: 1.0.0]

*This component library reference was generated for AI development assistance. All components support TypeScript, cross-platform compatibility, and automatic theme switching. For implementation details, refer to the individual component files and the project's README.md for setup instructions.*

*🤖 AI-Ready: This documentation is optimized for AI code generation and component understanding. Each component includes complete prop interfaces, usage examples, and integration patterns for seamless development assistance.*