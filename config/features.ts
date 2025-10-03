/**
 * Feature flags configuration
 *
 * This is the SINGLE SOURCE OF TRUTH for toggling between old and new editor systems.
 * Change this flag to switch between editors app-wide.
 */

/**
 * Use new markdown editor instead of old modal editor
 *
 * - `false`: Uses original modal editor (components/note-modal.tsx)
 * - `true`: Uses new full-screen markdown editor (app/note-editor/*)
 *
 * Default: true (new markdown editor is production-ready)
 *
 * Features of new editor:
 * - Full-screen editing experience
 * - Edit/Preview toggle
 * - Formatting toolbar (Bold, Italic, Headings, Lists, Code, Links, Tables)
 * - HTML export functionality
 * - Auto-save with debounce
 * - Error boundary with graceful fallback
 *
 * To revert to old editor (if needed):
 * 1. Change to `false`
 * 2. Old modal works immediately
 * 3. No data migration needed
 * 4. No code changes required
 *
 * Error handling:
 * - New editor has error boundary protection
 * - Crashes show user-friendly error screen
 * - User can navigate back safely
 * - All errors logged to console
 */
export const USE_MARKDOWN_EDITOR = true;
