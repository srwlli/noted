# PWA Troubleshooting Log

## Issue: iOS PWA Header and Footer Not Fixed (2025-09-27)

**Problem**: On iOS home screen PWA, header and footer were not properly fixed/sticky. They would scroll with content instead of staying in position.

**Root Cause**:
- CommonHeader was using React Native View with relative positioning
- Tab bar had safe area padding but no fixed positioning
- SharedPageLayout didn't account for fixed header/footer heights

**Solution Applied**:

1. **Fixed Header Positioning** (`components/common-header.tsx`):
   ```javascript
   // Added for web platform
   position: 'fixed',
   top: 0,
   left: 0,
   right: 0,
   zIndex: 1000,
   ```

2. **Fixed Tab Bar Positioning** (`app/(tabs)/_layout.tsx`):
   ```javascript
   // Added for web platform
   position: 'fixed',
   bottom: 0,
   left: 0,
   right: 0,
   zIndex: 999,
   ```

3. **Updated Content Spacing** (`components/shared-page-layout.tsx`):
   ```javascript
   // Added top padding to account for fixed header
   paddingTop: 'calc(env(safe-area-inset-top, 0px) + 64px)',
   ```

4. **Z-Index Layering**:
   - Header: 1000 (top layer)
   - Tab bar: 999 (below header)

**Result**: Header and footer now properly stick to their positions on iOS PWA, providing native app-like experience.

**Files Modified**:
- `components/common-header.tsx`
- `app/(tabs)/_layout.tsx`
- `components/shared-page-layout.tsx`