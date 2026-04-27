import { test, expect } from '@playwright/test';
import { ReaderPage } from '../pages/reader.page';

/**
 * Bible — long-press verse → action sheet.
 *
 * Maps to FEATURES.md §3.2 (Long-press verse → action menu) and §3.5
 * (Highlight color buttons).
 *
 * **Mobile-only flow.** ReadingScreen attaches `onMouseDown`/`onMouseUp`
 * with the press timer ONLY when `!isDesktop` (viewport < 1024px). On
 * desktop, clicking a verse opens the verse-insight sheet instead. This
 * file is therefore project-filtered to chromium-mobile.
 */

// Issue #43 (BibleRoute stale-closure) is FIXED — that unblocked the
// FAB navigation and chapter-picker fixme tests. These verse-actions
// tests, however, remain blocked on a separate Playwright issue:
// CDP `Input.dispatchTouchEvent` does not reliably fire React's synthetic
// `onTouchStart` / `onTouchEnd` handlers attached to the verse spans, so
// the 400ms press-timer never starts and the action sheet never opens.
// Verified: verse selection (state.selectedVerse) updates correctly, but
// state.longPressVerse stays null. Real users on a real touch device
// don't hit this — the bug is in Playwright's emulation layer.
//
// Tracked separately. Possible workarounds to explore:
//   1. `verse.dispatchEvent('touchstart', ...)` with a Touch ctor payload
//   2. Patch the press timer threshold during tests via a query param
//   3. Add a non-touch trigger (data-testid on a hidden button) for tests
test.describe.fixme('Bible — verse actions (mobile)', () => {
  test.skip(({ viewport }) => {
    return !viewport || viewport.width >= 1024;
  }, 'Long-press flow only fires on viewports < 1024px (see ReadingScreen.tsx isDesktop)');

  test('long-press opens the action sheet with all six buttons', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.longPressVerseViaCDP(1);

    await expect(page.getByTestId('verse-actions-sheet')).toBeVisible();
    await expect(page.getByTestId('verse-action-bookmark')).toBeVisible();
    await expect(page.getByTestId('verse-action-note')).toBeVisible();
    await expect(page.getByTestId('verse-action-copy')).toBeVisible();
    await expect(page.getByTestId('verse-action-commentary')).toBeVisible();
    await expect(page.getByTestId('verse-action-insight')).toBeVisible();
    await expect(page.getByTestId('verse-action-highlight')).toBeVisible();
  });

  test('action sheet exposes 5 highlight color buttons', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.longPressVerseViaCDP(1);

    for (const color of ['yellow', 'green', 'blue', 'pink', 'orange'] as const) {
      await expect(page.getByTestId(`color-button-${color}`)).toBeVisible();
    }
  });

  test('Commentary action navigates to the commentary route', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.longPressVerseViaCDP(1);

    await page.getByTestId('verse-action-commentary').click();
    await expect(page).toHaveURL(/\/read\/Genesis\/1\/commentary/i);
  });

  test('Backdrop tap closes the sheet', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.longPressVerseViaCDP(1);

    const sheet = page.getByTestId('verse-actions-sheet');
    await expect(sheet).toBeVisible();
    await page.getByTestId('verse-actions-backdrop').click({ position: { x: 5, y: 5 } });
    await expect(sheet).not.toBeVisible();
  });
});
