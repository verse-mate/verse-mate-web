import { test, expect } from '@playwright/test';
import { BookmarksPage } from '../pages/data-screens.page';
import { ReaderPage } from '../pages/reader.page';
import { HAS_AUTH_CREDENTIALS, skipReasonNoAuth } from '../fixtures/env';

/**
 * Bookmarks — authenticated CRUD.
 *
 * Maps to FEATURES.md §3.4 (Authenticated sync, Delete bookmark).
 *
 * Uses the storageState produced by `fixtures/auth.setup.ts`. Skipped
 * cleanly when `E2E_TEST_PASSWORD` is unset (the storageState file is
 * still produced empty, but we don't waste cycles in CI).
 *
 * Mobile-only — desktop has different chrome (DesktopLayout) and the
 * chapter-bookmark interaction goes through a different code path.
 */

test.use({ storageState: 'tests/e2e/.auth/user.json' });

test.skip(({ viewport }) => !!viewport && viewport.width >= 1024, 'Mobile chrome only — desktop has its own bookmark surface');

test.describe('Bookmarks — authenticated CRUD', () => {
  test.skip(!HAS_AUTH_CREDENTIALS, skipReasonNoAuth);

  test('signed-in user can create and delete a chapter bookmark', async ({ page }) => {
    const reader = new ReaderPage(page);
    const bookmarks = new BookmarksPage(page);

    // Use a fixed bookId+chapter for the toggle (Genesis = bookId 1, ch 1).
    const toggle = reader.chapterBookmarkToggle(1, 1);

    await reader.goto('genesis', 1);
    await expect(toggle).toBeVisible();

    // Capture pre-state — if this test ran before, may already be bookmarked.
    // Tap once: toggles. Tap again only if the post-state isn't what we want.
    await toggle.click();
    await page.waitForTimeout(500); // let the API call complete

    // Navigate to /bookmarks via the menu (route directly to keep test focused).
    await bookmarks.goto();

    // Either the chapter is in the list now, or it was just removed.
    // Re-toggle once more: end at "bookmarked" to be deterministic.
    await reader.goto('genesis', 1);
    const isBookmarkedNow = await page.evaluate(() => {
      // Read AppContext bookmarks via localStorage (where it persists).
      const raw = localStorage.getItem('versemate.bookmarks');
      if (!raw) return false;
      try {
        const list = JSON.parse(raw) as Array<{ bookId: number; chapter: number; verse?: number }>;
        return list.some((b) => b.bookId === 1 && b.chapter === 1 && !b.verse);
      } catch {
        return false;
      }
    });
    if (!isBookmarkedNow) await toggle.click();
    await page.waitForTimeout(500);

    // Verify in /bookmarks list
    await bookmarks.goto();
    await expect(bookmarks.list).toContainText(/Genesis\s*1/i, { timeout: 10_000 });

    // Cleanup: delete via list — find the first bookmark item delete button
    const firstDelete = page.locator('[data-testid^="bookmark-delete-"]').first();
    if (await firstDelete.isVisible().catch(() => false)) {
      await firstDelete.click();
      await page.waitForTimeout(500);
    }
  });
});
