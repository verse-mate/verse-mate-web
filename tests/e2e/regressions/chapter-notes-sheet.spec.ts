import { test, expect } from '@playwright/test';
import { ReaderPage } from '../pages/reader.page';

/**
 * Regression — chapter-notes sheet (issue #130).
 *
 * Before the fix, the chapter-notes button (📄 icon next to the chapter
 * bookmark) called `navigate('/notes')`, pulling the user off the Bible
 * page they were reading. The fix wires it to open an in-place bottom
 * sheet ("Notes for {Book} {Chapter}") that lists existing notes for
 * the chapter and exposes an "Add New Note" form. Closing the sheet
 * (X or backdrop tap) leaves the user on the Bible page.
 *
 * Genesis 1 (bookId = 1) is the stable fixture used elsewhere in the
 * suite. Mobile-only — DesktopLayout duplicates the chapter-notes
 * testid via its own chrome.
 */

test.skip(
  ({ viewport }) => !!viewport && viewport.width >= 1024,
  'Mobile chrome only — DesktopLayout duplicates the chapter-notes testid',
);

test.describe('Bible — chapter-notes sheet (#130)', () => {
  test('tapping the chapter-notes button opens a chapter-scoped sheet (does NOT navigate)', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);

    const startUrl = page.url();
    await reader.tap(page.getByTestId('chapter-notes-button-1-1'));

    // Sheet visible, URL unchanged.
    await expect(page.getByTestId('chapter-notes-sheet')).toBeVisible({ timeout: 5_000 });
    expect(page.url()).toBe(startUrl);

    // Header copy reflects the current chapter.
    await expect(page.getByText(/Notes for Genesis 1/i)).toBeVisible();
  });

  test('sheet exposes the Add New Note form with a disabled Add Note button until text is entered', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.tap(page.getByTestId('chapter-notes-button-1-1'));

    const textarea = page.getByTestId('chapter-notes-textarea');
    const addButton = page.getByTestId('chapter-notes-add-button');

    await expect(textarea).toBeVisible();
    await expect(addButton).toBeVisible();
    await expect(addButton).toBeDisabled();

    await textarea.fill('A reflection on Genesis 1.');
    await expect(addButton).toBeEnabled();
  });

  test('close button dismisses the sheet and keeps the reader visible', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.tap(page.getByTestId('chapter-notes-button-1-1'));

    const sheet = page.getByTestId('chapter-notes-sheet');
    await expect(sheet).toBeVisible();

    await page.getByTestId('chapter-notes-sheet-close').click();
    await expect(sheet).not.toBeVisible();
    // Reader chrome still mounted — we didn't navigate.
    await expect(reader.chapterSelector).toBeVisible();
    await expect(reader.chapterHeader).toContainText(/Genesis 1/);
  });

  test('backdrop tap dismisses the sheet', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.tap(page.getByTestId('chapter-notes-button-1-1'));

    const sheet = page.getByTestId('chapter-notes-sheet');
    await expect(sheet).toBeVisible();

    await page.getByTestId('chapter-notes-sheet-backdrop').click({ position: { x: 5, y: 5 } });
    await expect(sheet).not.toBeVisible();
  });
});
