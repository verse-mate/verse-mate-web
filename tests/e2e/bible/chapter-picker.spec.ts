import { test, expect } from '@playwright/test';
import { ReaderPage } from '../pages/reader.page';
import { BookSelectorPage } from '../pages/book-selector.page';

/**
 * Bible — chapter picker modal.
 *
 * Maps to FEATURES.md §3.2:
 *   - Chapter selector dropdown        [P0]
 *   - Chapter selector — book search   [P0]
 *   - Recents list in picker           [P1] (covered transitively)
 *
 * The modal is `BookSelector` with [OT] [NT] [Topics] tabs and a search
 * input. Selecting a book opens the chapter grid; selecting a chapter
 * fires `onSelect(book, chapter)` which navigates the Reader.
 *
 * Desktop project skipped — DesktopLayout duplicates the chapter-selector
 * button that opens this modal; targeting the inner reader requires a
 * scoped page object (Phase-2 follow-up).
 */

test.skip(
  ({ viewport }) => !!viewport && viewport.width >= 1024,
  'DesktopLayout duplicates chapter-selector — Phase-2 follow-up',
);

test.describe('Bible — chapter picker', () => {
  test('opens with OT tab and book list visible', async ({ page }) => {
    const reader = new ReaderPage(page);
    const picker = new BookSelectorPage(page);

    await reader.goto('genesis', 1);
    await reader.chapterSelector.click();

    await expect(picker.modal).toBeVisible();
    await expect(picker.tabOldTestament).toBeVisible();
    await expect(picker.tabNewTestament).toBeVisible();
    await expect(picker.tabTopics).toBeVisible();
    await expect(picker.booksSearchInput).toBeVisible();
    await expect(picker.bookItem('Genesis')).toBeVisible();
  });

  test('NT tab swaps the book list', async ({ page }) => {
    const reader = new ReaderPage(page);
    const picker = new BookSelectorPage(page);

    await reader.goto('genesis', 1);
    await reader.chapterSelector.click();
    await picker.tabNewTestament.click();

    await expect(picker.bookItem('John')).toBeVisible();
    await expect(picker.bookItem('Revelation')).toBeVisible();
    // Old Testament books should no longer be in the list when NT is active
    await expect(picker.bookItem('Genesis')).not.toBeVisible();
  });

  test('search filters the list (typing "John" leaves John visible)', async ({ page }) => {
    const reader = new ReaderPage(page);
    const picker = new BookSelectorPage(page);

    await reader.goto('genesis', 1);
    await reader.chapterSelector.click();
    await picker.tabNewTestament.click();
    await picker.booksSearchInput.fill('John');

    await expect(picker.bookItem('John')).toBeVisible();
    await expect(picker.bookItem('Revelation')).not.toBeVisible();
  });

  test('selecting a book reveals the chapter grid', async ({ page }) => {
    const reader = new ReaderPage(page);
    const picker = new BookSelectorPage(page);

    await reader.goto('genesis', 1);
    await reader.chapterSelector.click();
    await picker.tabNewTestament.click();
    await picker.bookItem('John').click();

    await expect(picker.modalChapters).toBeVisible();
    await expect(picker.chapter(1)).toBeVisible();
    // John has 21 chapters
    await expect(picker.chapter(21)).toBeVisible();
  });

  test('end-to-end: Genesis 1 → John 3 via picker', async ({ page }) => {
    const reader = new ReaderPage(page);
    const picker = new BookSelectorPage(page);

    await reader.goto('genesis', 1);
    await reader.chapterSelector.click();
    await picker.tabNewTestament.click();
    await picker.booksSearchInput.fill('John');
    await picker.bookItem('John').click();
    await reader.tap(picker.chapter(3));
    await page.waitForURL(/\/bible\/john\/3/, { timeout: 10_000 });
    await reader.expectChapterLoaded('John', 3);
  });

  test('Topics tab shows the topics search and at least one topic', async ({ page }) => {
    const reader = new ReaderPage(page);
    const picker = new BookSelectorPage(page);

    await reader.goto('genesis', 1);
    await reader.chapterSelector.click();
    await picker.tabTopics.click();

    await expect(picker.topicsSearchInput).toBeVisible({ timeout: 15_000 });
    // The list is fetched async; just confirm something topic-y rendered.
    // (Topic name slugs vary, so we don't pin to a specific topic-item testid here.)
    await expect(page.locator('[data-testid^="topic-item-"]').first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
