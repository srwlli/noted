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
 * Default: false (safe default, old system proven stable)
 *
 * To enable new editor:
 * 1. Change to `true`
 * 2. Test new note creation
 * 3. Test editing existing notes
 * 4. Test all formatting buttons
 * 5. Test export functionality
 *
 * To revert to old editor:
 * 1. Change back to `false`
 * 2. Old modal works immediately
 * 3. No data migration needed
 *
 * Error handling:
 * - New editor has error boundary that falls back to old modal
 * - Any crashes in new editor automatically revert to old modal
 * - User sees toast notification on error
 */
export const USE_MARKDOWN_EDITOR = false;
