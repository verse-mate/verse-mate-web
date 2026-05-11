import { test, expect } from '@playwright/test';
import { NotesPage } from '../pages/data-screens.page';

/**
 * Notes — chapter-scoped view at /notes/:book/:chapter.
 *
 * Maps to FEATURES.md §3.6 (Notes — chapter scope).
 *
 * NotesScreen.tsx renders two distinct view modes:
 *   - List (root /notes) — `notes-list` + per-chapter groups
 *   - Chapter scope (/notes/:book/:chapter) — `notes-chapter-list`
 *
 * `notes/list-and-empty.spec.ts` covers the list view; this spec covers
 * the chapter-scoped view and its back button (`notes-chapter-back-button`).
 *
 * Mobile-only — DesktopLayout puts notes into the right panel rather
 * than a /notes route.
 */

test.skip(
  ({ viewport }) => !!viewport && viewport.width >= 1024,
  'Mobile chrome only — DesktopLayout renders notes in the right panel',
);

test.describe('Notes — chapter scope', () => {
  test('/notes/genesis/1 renders the chapter-scoped list (empty for guests)', async ({ page }) => {
    const notes = new NotesPage(page);
    await notes.gotoChapter('genesis', 1);
    await expect(notes.chapterList).toBeVisible();
    // Guests have no notes — the inner list should be empty (no
    // note-item-* descendants).
    await expect(page.locator('[data-testid^="note-item-"]')).toHaveCount(0);
  });

  test('chapter-back button returns to /notes', async ({ page }) => {
    const notes = new NotesPage(page);
    await notes.gotoChapter('genesis', 1);
    await notes.chapterBackButton.click();
    await expect(page).toHaveURL(/\/notes(?:\?|$)/);
    await expect(notes.list).toBeVisible();
  });
});
