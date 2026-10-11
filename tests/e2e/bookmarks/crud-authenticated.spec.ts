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

    const toggle = reader.chapterBookmarkToggle(1, 1);

    await reader.goto('genesis', 1);
    await expect(toggle).toBeVisible();
    await page.waitForLoadState('networkidle');

    if ((await toggle.getAttribute('aria-label')) === 'Bookmark chapter') await toggle.click();
    await expect(toggle).toHaveAttribute('aria-label', 'Remove bookmark');

    await bookmarks.goto();
    await expect(bookmarks.list).toContainText(/Genesis\s*1/i, { timeout: 10_000 });

    await page.locator('[data-testid^="bookmark-delete-"]').first().click();
    await expect(bookmarks.list).not.toContainText(/Genesis\s*1/i);
  });
});
