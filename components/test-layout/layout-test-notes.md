# Layout Testing Notes

## Goal
- Header: Always visible at top (fixed)
- Tab bar: Always visible at bottom (fixed)
- Content: Scrollable between them
- Browser nav bars: Hidden in PWA mode

## Test Strategies

### 1. Fixed Positioning (variant="fixed")
**Best for: Web PWA**
- Header: `position: fixed, top: 0`
- Content: Padding top/bottom to account for fixed elements
- Tab bar: Handled by Expo Router (stays at bottom)
- Pros: True fixed positioning, works well in PWA
- Cons: May have issues on native

### 2. Flexbox (variant="flex")
**Best for: Cross-platform**
- Container: `display: flex, height: 100vh`
- Header: `flex-shrink: 0`
- Content: `flex: 1, overflow: auto`
- Pros: Works on all platforms
- Cons: May scroll on some iOS devices

### 3. CSS Grid (variant="grid")
**Best for: Modern web**
- Container: `display: grid`
- Template: Header (auto) / Content (1fr)
- Content: `overflow: auto`
- Pros: Clean layout control
- Cons: Web only, needs fallback

## Testing Instructions

1. **To test in index.tsx**:
```tsx
// Replace:
import { SharedPageLayout } from '@/components/shared-page-layout';

// With:
import { TestSharedLayout } from '@/components/test-layout/TestSharedLayout';

// And change:
<SharedPageLayout ...>

// To:
<TestSharedLayout variant="fixed" ...>
```

2. **Test each variant**:
- `variant="fixed"` - for PWA
- `variant="flex"` - for cross-platform
- `variant="grid"` - for modern web

3. **Check on iOS PWA**:
- Add to Home Screen from Safari
- Verify header stays fixed when scrolling
- Verify tab bar stays fixed at bottom
- Check no browser nav bars visible

## Key Measurements
- Header height: ~60px + safe area top
- Tab bar height: 60px + safe area bottom
- Content padding: Must account for both

## PWA Optimizations Included
- `env(safe-area-inset-*)` for notches
- `100vh` height management
- `position: fixed` for true fixed elements
- Proper z-index layering

## Next Steps
1. Test each variant with existing pages
2. Pick best performer on iOS PWA
3. Apply to all pages
4. Remove test components