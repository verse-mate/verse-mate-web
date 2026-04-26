import { test, expect } from '@playwright/test';
import { ReaderPage } from '../pages/reader.page';
import { CommentaryPage } from '../pages/commentary.page';

/**
 * Bible — Bible ↔ Insight pill navigation.
 *
 * Maps to FEATURES.md §3.2 (View toggle: Bible ↔ Insight/Commentary).
 * Web differs from mobile here: mobile is an in-place view swap; web
 * navigates between `/bible/<book>/<ch>` and `/read/<Book>/<ch>/commentary`.
 *
 * Both pages expose `bible-view-icon` + `commentary-view-icon` testids,
 * so the test asserts on the navigation rather than on a single-page state.
 *
 * Desktop project skipped — DesktopLayout duplicates the chrome (see
 * load-and-navigate.spec.ts file-level note).
 */

test.skip(
  ({ viewport }) => !!viewport && viewport.width >= 1024,
  'DesktopLayout duplicates reader testids — Phase-2 follow-up',
);

test.describe('Bible — view toggle', () => {
  test('Bible → Insight navigates to commentary route', async ({ page }) => {
    const reader = new ReaderPage(page);
    const commentary = new CommentaryPage(page);

    await reader.goto('genesis', 1);
    await reader.commentaryViewIcon.click();

    await expect(page).toHaveURL(/\/read\/Genesis\/1\/commentary/i);
    await expect(commentary.tabSummary).toBeVisible();
  });

  test('Insight → Bible navigates back to reader', async ({ page }) => {
    const commentary = new CommentaryPage(page);
    const reader = new ReaderPage(page);

    await commentary.goto('Genesis', 1);
    await commentary.bibleViewIcon.click();

    await expect(page).toHaveURL(/\/read(?:\/.*)?$|\/bible\/genesis\/1/);
    await expect(reader.chapterSelector).toBeVisible();
  });
});
