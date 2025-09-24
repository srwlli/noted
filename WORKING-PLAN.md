# Working Plan: Fix Mobile Safari PWA Behavior to Match PC

## Root Cause Identified

PC PWA works because it uses simple, consistent PWA detection. Mobile Safari fails because of **complex dual-detection logic** that conflicts with iOS Safari's unique behavior.

## Key Differences

- **PC (Working)**: Uses only `window.matchMedia('(display-mode: standalone)')`
- **Mobile Safari (Failing)**: Uses dual detection with `navigator.standalone` + timing issues

## Solution Strategy

### 1. Simplify Mobile Detection (Match PC Behavior)
- Change mobile Safari detection to match PC approach
- Remove complex iOS-specific `navigator.standalone` checks that may be interfering
- Use the same simple detection that works on PC

### 2. Fix Detection Timing Issues
- Add proper async/delay handling for Safari PWA recognition
- Ensure detection runs after Safari initializes standalone mode
- Add retry mechanism if initial detection fails

### 3. Unify PWA Detection Logic
- Create single, consistent PWA detection method across all platforms
- Remove duplicate/conflicting detection in PWADetector and PWAInstallCard components
- Use the proven PC detection method universally

### 4. Fix Component Visibility Logic
- Ensure PWA detection components don't disappear when installed
- Keep detection active even in standalone mode (like PC)
- Remove conditional rendering that might break Safari triggers

### 5. iOS Safari Specific Adjustments
- Add Safari-specific viewport handling
- Ensure proper meta tag recognition
- Fix any iOS-specific CSS conflicts

## Implementation Plan

1. Replace complex mobile detection with simple PC-style detection
2. Add proper timing/retry mechanisms for Safari
3. Unify all PWA detection to use single proven method
4. Test specifically on iOS Safari installed PWA mode

This will align mobile Safari behavior with the working PC implementation.

## Technical Details

### Current Issues
- **PWAInstallCardMobile**: Uses both `matchMedia` and `navigator.standalone`
- **PWADetector**: Copies same dual detection
- **Timing conflicts**: Detection may run before Safari recognition
- **Component disappearing**: PWA components return null when installed

### Target Solution
- **Single detection method**: Use only `window.matchMedia('(display-mode: standalone)')`
- **Consistent behavior**: Same logic across PC and mobile
- **Proper timing**: Async detection with retry mechanisms
- **Persistent detection**: Keep components active for Safari triggers