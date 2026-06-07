import { test, expect } from '@playwright/test';
import { ReaderPage } from '../pages/reader.page';
import { BookSelectorPage } from '../pages/book-selector.page';

/**
 * Bible — "Back to <book> <chapter>" return button (mobile).
 *
 * Jumping to another book via the Search / book selector remembers where
 * you were (AppContext.previousPassage) and renders a return pill
 * (ReturnToPassageButton) on the destination page. Tapping it restores the
 * prior passage. Verified on the phone layout, where the selector is opened
 * by tapping the chapter header rather than by typing.
 */

test.skip(
  ({ viewport }) => !!viewport && viewport.width >= 1024,
  'Phone layout (ReadingScreen) only — desktop chrome covered separately',
);

test.describe('Bible — return to previous passage', () => {
  test('jumping to John 3 from Genesis 1 shows a working Back button', async ({ page }) => {
    const reader = new ReaderPage(page);
    const selector = new BookSelectorPage(page);
    const returnButton = page.getByTestId('return-to-passage-button');

    await reader.goto('genesis', 1);
    await expect(returnButton).toHaveCount(0);

    // Open the selector, search for John, pick chapter 3.
    await reader.tap(reader.chapterSelector);
    await expect(selector.modal).toBeVisible();
    await selector.booksSearchInput.fill('john');
    await reader.tap(selector.bookItem('John'));
    await reader.tap(selector.chapter(3));

    await page.waitForURL(/\/bible\/john\/3/, { timeout: 10_000 });
    await reader.expectChapterLoaded('John', 3);

    await expect(returnButton).toBeVisible();
    await expect(returnButton).toContainText('Back to Genesis 1');

    await reader.tap(returnButton);
    await page.waitForURL(/\/bible\/genesis\/1/, { timeout: 10_000 });
    await reader.expectChapterLoaded('Genesis', 1);
    await expect(returnButton).toHaveCount(0);
  });
});
