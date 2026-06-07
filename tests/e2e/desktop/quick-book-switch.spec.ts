import { test, expect } from '@playwright/test';
import { DesktopReaderPage } from '../pages/desktop.page';
import { BookSelectorPage } from '../pages/book-selector.page';

/**
 * Desktop — quick book switch via "just start typing" + return button.
 *
 * Two linked affordances for jumping to another book and back:
 *   1. Type-to-search: pressing a printable key while reading opens the
 *      Search modal seeded with that character (DesktopLayout's global
 *      keydown handler → BookSelector `initialQuery`).
 *   2. Return button: after jumping to a new passage via the selector, a
 *      "Back to <book> <chapter>" pill (ReturnToPassageButton, fed by
 *      AppContext.previousPassage) appears in the reading column and
 *      restores the prior passage on click.
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

  test('jump to another book shows a Back button that returns to the prior passage', async ({
    page,
  }) => {
    const desktop = new DesktopReaderPage(page);
    const selector = new BookSelectorPage(page);
    const returnButton = page.getByTestId('return-to-passage-button');

    await desktop.goto('genesis', 1);
    // No return button before any jump.
    await expect(returnButton).toHaveCount(0);

    // Open Search by typing, refine to "john", pick John 3.
    await page.getByTestId('chapter-header').click();
    await page.keyboard.press('j');
    await expect(selector.modal).toBeVisible();
    await selector.booksSearchInput.fill('john');
    await selector.bookItem('John').click();
    await selector.chapter(3).click();

    await page.waitForURL(/\/bible\/john\/3/, { timeout: 10_000 });

    // The destination offers a one-tap return to where we were.
    await expect(returnButton).toBeVisible();
    await expect(returnButton).toContainText('Back to Genesis 1');

    await returnButton.click();
    await page.waitForURL(/\/bible\/genesis\/1/, { timeout: 10_000 });
    // Once consumed, the button is gone.
    await expect(returnButton).toHaveCount(0);
  });
});
