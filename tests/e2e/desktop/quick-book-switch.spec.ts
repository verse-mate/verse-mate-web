import { test, expect } from '@playwright/test';
import { DesktopReaderPage } from '../pages/desktop.page';
import { BookSelectorPage } from '../pages/book-selector.page';

/**
 * Desktop — quick book switch via "just start typing".
 *
 * Type-to-search: pressing a printable key while reading opens the Search
 * modal seeded with that character (DesktopLayout's global keydown handler
 * → BookSelector `initialQuery`).
 *
 * Desktop-only — the type-to-search handler lives in DesktopLayout, which
 * mounts at >=768px; this project runs at 1280px.
 */

test.skip(
  ({ viewport }) => !viewport || viewport.width < 1024,
  'Type-to-search handler only mounts in DesktopLayout (>=768px)',
);

test.describe('Desktop — quick book switch', () => {
  test('typing a letter opens Search seeded with that character', async ({ page }) => {
    const desktop = new DesktopReaderPage(page);
    const selector = new BookSelectorPage(page);
    await desktop.goto('genesis', 1);

    // Focus the reading column (not an input) so the key reaches the
    // document-level handler, then press a single letter.
    await page.getByTestId('chapter-header').click();
    await page.keyboard.press('j');

    await expect(selector.modal).toBeVisible();
    await expect(selector.booksSearchInput).toHaveValue('j');
  });
});
