# Archived: markdown-toolbar.tsx

**Date Archived:** October 6, 2025
**Status:** Not used in current implementation
**Location:** `improvements/archived/markdown-toolbar.tsx`

## Why Archived

This component was part of the original markdown editor implementation plan but was **never integrated into the active codebase**. It has been replaced by `markdown-toolbar-dropdown.tsx`.

## Original Intended Purpose

**Design Pattern:** Always-visible inline toolbar
**Positioning:** Fixed at bottom of screen above keyboard using KeyboardAvoidingView
**Layout:** Horizontal row with buttons distributed via `justifyContent: 'space-around'`
**Visual:** Border top, no modal/overlay, permanent presence

From the original implementation plan (archived/rich-text-editor.json):
> "Floating toolbar at bottom of screen, above keyboard"
> "Positioning: Fixed above keyboard using KeyboardAvoidingView"
> "Visibility: Visible in edit mode, hidden in preview mode"

## Why It Was Replaced

The team pivoted to a **dropdown/overlay pattern** instead due to:

1. **Screen Real Estate:** Permanent toolbar consumes valuable vertical space on mobile devices
2. **Platform Inconsistencies:** KeyboardAvoidingView behavior differs significantly between iOS/Android
3. **UX Preference:** On-demand toolbar is less intrusive, gives more writing space
4. **Keyboard Conflicts:** Always-visible toolbar complicated keyboard handling logic

## Current Solution

**Component:** `markdown-toolbar-dropdown.tsx`
**Pattern:** Modal overlay triggered by header button
**Visibility:** Controlled by `showToolbar` state toggle
**Layout:** Horizontal ScrollView with backdrop dismissal
**Location:** Positioned below header with `paddingTop: 60`

This dropdown approach is actively used by:
- `components/markdown/markdown-editor.tsx` (line 297)
- `app/note-editor/new.tsx` via MarkdownEditor component

## Evidence It's Unused

**Search Results:**
```bash
grep -r "import.*MarkdownToolbar[^D]" components/ app/
# Result: No imports found
```

**Only Reference:** `improvements/archived/rich-text-editor.json` (archived implementation plan)

## When It Might Be Used

This component could be revived in the future if:

1. **Web Platform Focus:** Desktop/web users might prefer always-visible toolbar (more screen space available)
2. **User Preference Setting:** "Always show toolbar" toggle for power users
3. **Tablet/Large Screen Mode:** More vertical space makes permanent toolbar viable
4. **Keyboard Shortcut Alternative:** Visual toolbar for users who can't/won't use keyboard shortcuts

## Technical Details

**Features:**
- 9 formatting buttons: B, I, H1, H2, List, Code, Link, Image, Table
- Modal dialogs for Link, Image, Table insertion
- Text selection wrapping support
- Inline markdown syntax insertion

**Key Difference from Dropdown:**
- No `visible` prop (always rendered)
- No modal/backdrop wrapper
- Styled with `borderTopWidth: 1` (divider from content)
- Uses `justifyContent: 'space-around'` (evenly distributed buttons)

## Implementation Status

✅ **Component is complete and ready to use**
- All 9 buttons implemented (B, I, H1, H2, List, Code, Link, Image, Table)
- All modal dialogs wired up (LinkDialogModal, ImageDialogModal, TableGeneratorModal)
- Text insertion logic functional
- Theme-aware styling complete

## How to Re-implement (If Needed)

**Step 1: Copy file back to components**
```bash
cp improvements/archived/markdown-toolbar.tsx components/markdown/markdown-toolbar.tsx
```

**Step 2: Update MarkdownEditor component**
```typescript
// components/markdown/markdown-editor.tsx
import { MarkdownToolbar } from './markdown-toolbar'; // Add import

// In JSX (line 295+), replace or add alongside dropdown:
{mode === 'edit' && (
  <MarkdownToolbar
    onInsert={handleInsert}
    onInsertText={handleInsertText}
    selectedText={getSelectedText()}
  />
)}
```

**Step 3: Wrap in KeyboardAvoidingView (optional)**
```typescript
// In note-editor screen
<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>
  <MarkdownEditor {...props} />
</KeyboardAvoidingView>
```

**Step 4: Test on all platforms**
- iOS: Verify toolbar appears above keyboard
- Android: Verify keyboard doesn't cover toolbar
- Web: Verify toolbar position is appropriate

## Recommendation

**Keep archived** for now. May be useful for:
- Future web-optimized UI
- User preference settings
- Reference implementation for toolbar patterns

**Delete** if after 6+ months there's no demand for always-visible toolbar option.

## Related Files

- **Active:** `components/markdown/markdown-toolbar-dropdown.tsx`
- **Active:** `components/markdown/markdown-editor.tsx`
- **Archived:** `improvements/archived/rich-text-editor.json`
- **Archived:** `improvements/archived/markdown-toolbar.tsx` (this file)
