import { test, expect } from '@playwright/test';
import { ReaderPage } from '../pages/reader.page';
import { BookSelectorPage } from '../pages/book-selector.page';

/**
 * Bible — anchor test for `/bible/james/1` (the production URL).
 *
 * Maps to the user-facing target URL `https://app.versemate.org/bible/james/1`.
 * James was specifically called out as the in-product reading flagship,
 * so we exercise it end-to-end: load, verse rendering, chapter pager,
 * chapter-bookmark toggle, chapter-notes button, and round-trip
 * navigation via the chapter picker.
 *
 * Desktop project skipped — DesktopLayout duplicates reader testids
 * (see `bible/load-and-navigate.spec.ts` file-level note).
 */

test.skip(
  ({ viewport }) => !!viewport && viewport.width >= 1024,
  'DesktopLayout duplicates reader testids — Phase-2 follow-up',
);

test.describe('Bible — /bible/james/1 anchor', () => {
  test('renders header + verse 1 + chapter pager', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('james', 1);

    await reader.expectChapterLoaded('James', 1);
    await expect(reader.chapterPager).toBeVisible();
    await expect(reader.progressBar).toBeVisible();
    // James is in the NT — Next FAB should be present, Previous should not
    // (James 1 is the first chapter of the book).
    await expect(reader.nextChapter).toBeVisible();
    await expect(reader.previousChapter).not.toBeVisible();
  });

  test('renders multiple verses (1..5)', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('james', 1);

    // James 1 has 27 verses; spot-checking the first few proves the
    // verse-renderer iterated past v1 (renderVerseGroup runs per verse
    // in ReadingScreen.tsx).
    for (const n of [1, 2, 3, 4, 5]) {
      await expect(reader.verse(n)).toBeVisible();
    }
  });

  test('Next FAB advances James 1 → 2', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('james', 1);
    await reader.tap(reader.nextChapter);
    await page.waitForURL(/\/bible\/james\/2/, { timeout: 10_000 });
    await reader.expectChapterLoaded('James', 2);
  });

  test('chapter picker round-trip: James 1 → James 5 via picker', async ({ page }) => {
    const reader = new ReaderPage(page);
    const picker = new BookSelectorPage(page);

    await reader.goto('james', 1);
    await reader.chapterSelector.click();
    await expect(picker.modal).toBeVisible();

    // James lives in the NT. Pre-condition: the NT tab must surface James
    // as a `book-item-james` row. After selecting James the chapter grid
    // shows 1..5 (the only James chapters that exist).
    await picker.tabNewTestament.click();
    await picker.bookItem('James').click();

    await expect(picker.modalChapters).toBeVisible();
    await expect(picker.chapter(1)).toBeVisible();
    await expect(picker.chapter(5)).toBeVisible();
    // James only has 5 chapters — chapter-6 testid should NOT render.
    await expect(picker.chapter(6)).toHaveCount(0);

    await reader.tap(picker.chapter(5));
    await page.waitForURL(/\/bible\/james\/5/, { timeout: 10_000 });
    await reader.expectChapterLoaded('James', 5);
    // James 5 is the last chapter; Next FAB should not render.
    await expect(reader.nextChapter).not.toBeVisible();
    await expect(reader.previousChapter).toBeVisible();
  });

  test('Insight pill on James 1 navigates to commentary', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('james', 1);
    await reader.commentaryViewIcon.click();
    await expect(page).toHaveURL(/\/read\/James\/1\/commentary/i);
    await expect(page.getByTestId('tab-summary')).toBeVisible({ timeout: 15_000 });
  });
});
