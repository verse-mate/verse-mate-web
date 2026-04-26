import { test, expect } from '@playwright/test';
import { BookmarksPage } from '../pages/data-screens.page';

/**
 * Bookmarks — guest list view + empty state.
 *
 * Maps to FEATURES.md §3.4 (Bookmark list view, Empty state).
 *
 * Authenticated CRUD lives in `bookmarks/crud-authenticated.spec.ts`,
 * which uses the storageState produced by `fixtures/auth.setup.ts`.
 */

test.describe('Bookmarks — guest list', () => {
  test('renders empty state for a guest visiting /bookmarks', async ({ page }) => {
    const bookmarks = new BookmarksPage(page);
    await bookmarks.goto();
    await expect(bookmarks.list).toBeVisible();
    await expect(bookmarks.emptyState).toBeVisible();
    await expect(bookmarks.emptyState).toContainText(/no bookmarks yet/i);
    await expect(bookmarks.emptyState).toContainText(/long-press a verse/i);
  });

  test('back button is visible and labelled', async ({ page }) => {
    const bookmarks = new BookmarksPage(page);
    await bookmarks.goto();
    await expect(bookmarks.backButton).toBeVisible();
  });
});
