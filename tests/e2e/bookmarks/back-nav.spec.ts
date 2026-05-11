import { test, expect } from '@playwright/test';
import { BookmarksPage } from '../pages/data-screens.page';

/**
 * Bookmarks — back navigation.
 *
 * Maps to FEATURES.md §3.4 (Bookmark — back to menu).
 *
 * `bookmarks/list-and-empty.spec.ts` asserts the back button is visible;
 * this spec exercises the click and asserts the destination URL.
 */

test.describe('Bookmarks — back navigation', () => {
  test('back button returns to /menu', async ({ page }) => {
    const bookmarks = new BookmarksPage(page);
    await bookmarks.goto();
    await bookmarks.backButton.click();
    await expect(page).toHaveURL(/\/menu(?:\/|$)/);
  });
});
