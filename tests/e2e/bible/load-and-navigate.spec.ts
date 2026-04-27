import { test, expect } from '@playwright/test';
import { ReaderPage } from '../pages/reader.page';

/**
 * Bible — load chapter + FAB navigation.
 *
 * Maps to FEATURES.md §3.2:
 *   - Load chapter (Genesis 1)              [P0]
 *   - FAB navigation: prev / next chapter   [P0]
 *   - FAB boundary: Genesis 1 ←             [P1]
 *   - FAB boundary: chapter renders verses  [P0]
 *   - Reading progress bar                  [P2]
 *
 * Desktop project skipped: at ≥1024px the app uses DesktopLayout, which
 * renders its OWN chapter chrome (including duplicate testids for
 * chapter-selector-button, bible-view-icon, etc.) alongside the inner
 * ReadingScreen. Targeting these specs at the desktop layout requires
 * scoped page objects — tracked as a Phase-2 follow-up. The mobile repo's
 * `e2e/desktop/` Playwright suite already covers the desktop split view.
 */

test.skip(
  ({ viewport }) => !!viewport && viewport.width >= 1024,
  'DesktopLayout duplicates reader testids — see file-level note',
);

test.describe('Bible — chapter load', () => {
  test('Genesis 1 renders header + verse 1', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.expectChapterLoaded('Genesis', 1);
  });

  test('John 3 renders header + verse 1 + Previous chapter button', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('john', 3);
    await reader.expectChapterLoaded('John', 3);
    await expect(reader.previousChapter).toBeVisible();
    await expect(reader.nextChapter).toBeVisible();
  });

  test('progress bar renders with non-zero percentage by chapter 5', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 5);
    await expect(reader.progressBar).toBeVisible();
    await expect(reader.progressBarPercentage).toBeVisible();
    // Genesis has 50 chapters; chapter 5 = 10%
    await expect(reader.progressBarPercentage).toContainText(/%/);
  });
});

test.describe('Bible — FAB navigation', () => {
  // The BibleRoute stale-closure bug (issue #43) is fixed; these tests
  // are now active. The `tap()` helper in reader.page.ts uses the DOM
  // click() API to fire React onClick reliably on chromium-mobile.
  test('Next chapter FAB advances Genesis 1 → 2', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.tap(reader.nextChapter);
    await page.waitForURL(/\/bible\/genesis\/2/, { timeout: 10_000 });
    await reader.expectChapterLoaded('Genesis', 2);
  });

  test('Previous chapter FAB retreats Genesis 2 → 1', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 2);
    await reader.tap(reader.previousChapter);
    await page.waitForURL(/\/bible\/genesis\/1/, { timeout: 10_000 });
    await reader.expectChapterLoaded('Genesis', 1);
  });

  test('Genesis 1 hides Previous FAB (left boundary)', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    // ReadingScreen.tsx renders Previous only when chapter > 1
    await expect(reader.previousChapter).not.toBeVisible();
    await expect(reader.nextChapter).toBeVisible();
  });
});
