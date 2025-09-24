# 📑 PWA Review Checklist (Expo + React Native Web + iOS)

This checklist is for code reviewers to validate that the **Expo PWA** implementation follows best practices for **iOS fullscreen mode, safe areas, and cross-platform reliability**.
Reviewers should **inspect the code** and **compare against these guidelines**.

---

## 1. Expo App Configuration (`app.json`)

### Web PWA Configuration
* [ ] `expo.web` section exists
* [ ] `"output": "static"` is set for static export
* [ ] `"favicon": "./assets/images/favicon.png"` points to existing file
* [ ] `"name"` and `"shortName"` are defined and appropriate
* [ ] `"description"` clearly describes the app
* [ ] `"display": "standalone"` is set (critical for fullscreen)
* [ ] `"startUrl": "/"` is set to root path
* [ ] `"orientation": "portrait"` (or desired orientation)
* [ ] `"themeColor"` matches app branding
* [ ] `"backgroundColor"` matches app background (prevents flash)
* [ ] `"scope": "/"` is set correctly
* [ ] `"preferRelatedApplications": false` is set

### PWA Manifest Icons
* [ ] `manifest.icons` array includes:
  * [ ] `192x192` icon with `"purpose": "any maskable"`
  * [ ] `512x512` icon with `"purpose": "any maskable"`
* [ ] Icon files exist at specified paths in `assets/images/`
* [ ] Icons are properly sized and optimized

### PWA Meta Tags
* [ ] `meta` object includes:
  * [ ] `"apple-mobile-web-app-capable": "yes"`
  * [ ] `"apple-mobile-web-app-status-bar-style": "black-translucent"`
  * [ ] `"apple-mobile-web-app-title": "AppName"`
  * [ ] `"mobile-web-app-capable": "yes"`
  * [ ] `"viewport": "width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"`

---

## 2. HTML Template (`app/+html.tsx`)

### Required Meta Tags
* [ ] `<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />`
* [ ] Apple PWA meta tags are present:
  * [ ] `apple-mobile-web-app-capable`
  * [ ] `apple-mobile-web-app-status-bar-style`
  * [ ] `apple-mobile-web-app-title`
* [ ] `<meta name="theme-color" content="#000000" />` matches app theme

### Safe Area CSS Implementation
* [ ] CSS custom properties are defined:
  ```css
  :root {
    --safe-area-inset-top: env(safe-area-inset-top);
    --safe-area-inset-bottom: env(safe-area-inset-bottom);
    --safe-area-inset-left: env(safe-area-inset-left);
    --safe-area-inset-right: env(safe-area-inset-right);
  }
  ```

* [ ] PWA-specific utility classes exist:
  ```css
  @supports (padding: env(safe-area-inset-top)) {
    .pwa-safe-top { padding-top: env(safe-area-inset-top); }
    .pwa-safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
  }
  ```

* [ ] Body and HTML styling prevents scrolling issues:
  ```css
  html, body {
    overscroll-behavior: none;
    -webkit-overflow-scrolling: touch;
  }
  ```

---

## 3. Safe Area Implementation in Components

### Header Component (`components/common-header.tsx`)
* [ ] Uses `Platform.OS === 'web'` detection
* [ ] For web: applies CSS env() variables directly in styles
* [ ] For native: uses `useSafeAreaInsets()` from react-native-safe-area-context
* [ ] Horizontal safe areas are handled with `env(safe-area-inset-left/right)`

Example check:
```typescript
paddingTop: isWeb ? 'calc(env(safe-area-inset-top, 0px) + 12px)' : insets.top + 12
```

### Bottom Navigation (`app/(tabs)/_layout.tsx`)
* [ ] Platform detection for web vs native
* [ ] Web bottom padding: `'calc(env(safe-area-inset-bottom, 0px) + 8px)'`
* [ ] Height adjustment: `'calc(60px + env(safe-area-inset-bottom, 0px))'`
* [ ] Horizontal safe areas included

### Layout Components (`components/shared-page-layout.tsx`)
* [ ] Web-specific container styles with proper height/overflow
* [ ] Safe area padding applied conditionally based on platform
* [ ] No use of `className` properties (React Native Web incompatible)

---

## 4. Global CSS (`global.css`)

### Tailwind Integration
* [ ] Tailwind base, components, utilities imported
* [ ] Safe area utility classes defined in `@layer utilities`

### PWA-Specific Styles
* [ ] Standalone mode detection:
  ```css
  @media (display-mode: standalone) {
    body { overflow: hidden; overscroll-behavior: none; }
    #root { height: 100vh !important; overflow: hidden !important; }
  }
  ```

* [ ] React Native Web compatibility:
  ```css
  @supports (padding: env(safe-area-inset-top)) {
    [data-reactroot] {
      padding-top: env(safe-area-inset-top);
      /* ... other safe areas */
    }
  }
  ```

### iOS-Specific Overrides
* [ ] Safari-specific styles:
  ```css
  @supports (-webkit-touch-callout: none) {
    .ios-safe-top { padding-top: calc(env(safe-area-inset-top, 20px) + 12px); }
  }
  ```

---

## 5. Build Configuration

### Expo Configuration
* [ ] `expo export` builds successfully without errors
* [ ] `dist/` directory contains:
  * [ ] `index.html` with proper meta tags
  * [ ] `manifest.json` with correct PWA configuration
  * [ ] `_expo/static/` folder with assets

### Vercel Configuration (`vercel.json`)
* [ ] `"outputDirectory": "dist"` points to build output
* [ ] Service worker headers configured:
  ```json
  {
    "source": "/sw.js",
    "headers": [{"key": "Cache-Control", "value": "public, max-age=0, must-revalidate"}]
  }
  ```
* [ ] SPA fallback configured: `{"source": "/(.*)", "destination": "/index.html"}`

---

## 6. Code Quality Checks

### TypeScript Configuration
* [ ] `tsconfig.json` includes web types
* [ ] No TypeScript errors in build output
* [ ] Proper type imports for React Native vs Web

### Platform-Specific Code
* [ ] `Platform.OS === 'web'` used correctly throughout
* [ ] No `className` usage in React Native components
* [ ] CSS environment variables used as strings in inline styles
* [ ] Proper fallback values: `env(safe-area-inset-top, 0px)`

### Performance Considerations
* [ ] No inline styles that cause unnecessary re-renders
* [ ] CSS environment variables cached in useMemo if needed
* [ ] Bundle size reasonable for PWA standards

---

## 7. Manual Testing Checklist

### iOS Safari Testing
* [ ] Open app in Safari on iPhone/iPad
* [ ] Verify "Add to Home Screen" option appears
* [ ] Install PWA and confirm:
  * [ ] App opens in fullscreen (no Safari UI)
  * [ ] Status bar style matches app theme
  * [ ] No content clipped by notch or home indicator
  * [ ] Home screen icon displays correctly
  * [ ] App name displays correctly

### Android Chrome Testing
* [ ] Open app in Chrome on Android
* [ ] Install prompt appears automatically
* [ ] After installation:
  * [ ] App opens in standalone mode
  * [ ] Navigation bars properly handled
  * [ ] Safe areas respected on various screen sizes

### Cross-Device Testing
* [ ] iPhone with notch (12, 13, 14, 15 series)
* [ ] iPhone without notch (SE, 8 and older)
* [ ] iPad (various sizes)
* [ ] Android phones with different aspect ratios
* [ ] Android tablets

### Functionality Testing
* [ ] Authentication works in standalone mode
* [ ] All navigation functions properly
* [ ] Offline functionality (if implemented)
* [ ] App state persists between PWA sessions
* [ ] Deep links work when app is installed

---

## 8. Common Issues to Watch For

### ❌ **Failures that break PWA**
- Using `className` in React Native components (doesn't work in RN Web)
- Missing `viewport-fit=cover` in viewport meta tag
- Incorrect `display: "standalone"` configuration
- CSS environment variables not in quotes when used in JS styles
- Missing platform detection for web vs native

### ⚠️ **Warnings that reduce quality**
- No fallback values for `env()` CSS functions
- Poor offline experience
- Icons not optimized or wrong sizes
- Theme colors not matching actual app colors
- Status bar style not matching app theme

### ✅ **Best Practices Implemented**
- Direct CSS `env()` usage in inline styles for React Native Web
- Proper platform detection throughout app
- Comprehensive safe area handling for all screen edges
- PWA manifest fully configured for both iOS and Android
- Standalone mode properly configured and tested

---

## 9. Automated Validation

Run these commands to verify setup:

```bash
# Build the app
npm run build

# Check that required files exist
ls dist/index.html dist/manifest.json

# Validate manifest.json structure (if validation script exists)
node scripts/validate-pwa.js

# Check for common PWA meta tags
grep -r "apple-mobile-web-app" dist/

# Verify safe area CSS exists
grep -r "env(safe-area-inset" app/ components/ global.css
```

---

## ✅ **Pass Criteria**

If all items above are confirmed, the app is a **proper PWA** supporting:
- ✅ iOS fullscreen mode with proper safe area handling
- ✅ Android standalone installation
- ✅ Cross-platform compatibility
- ✅ Professional PWA user experience
- ✅ No UI clipping or layout issues

**Final Test**: Install the PWA on an iPhone with notch and verify that:
1. Status bar is properly styled
2. Content doesn't disappear behind notch
3. Bottom navigation isn't cut off by home indicator
4. App feels native and professional