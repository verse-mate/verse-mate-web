import { test, expect, type Page } from '@playwright/test';

/**
 * Bible search — phrase, word and reference search in the Search screen,
 * and the jump from a result or a typed reference to its verse, which is
 * marked in yellow until the reader leaves the chapter (no Verse Insight).
 * A shared link with &insight=1 still opens Verse Insight.
 *
 * Needs an API with GET /bible/search and NASB1995 loaded (the default
 * translation), e.g. a local backend started on a seeded database.
 */

/** The reader has rendered (the first load of a cold dev server is slow). */
async function readerReady(page: Page) {
  await expect(page.getByTestId('chapter-header').first()).toBeVisible({ timeout: 30_000 });
}

async function openSearch(page: Page, url = '/bible/john/1') {
  await page.goto(url);
  await readerReady(page);
  // Desktop renders the selector in DesktopLayout's header, mobile in the
  // reader's own header.
  const desktop = page.getByTestId('desktop-chapter-selector-button');
  const mobile = page.getByTestId('chapter-selector-button');
  await desktop.or(mobile).first().click();
  const input = page.getByTestId('books-search-input');
  await expect(input).toBeVisible();
  return input;
}

test.describe('Bible search', () => {
  test('finds an exact phrase and its words, then lands on the verse marked, without Verse Insight', async ({ page }) => {
    const input = await openSearch(page);
    await input.fill('east and west');

    const matthew = page.getByTestId('verse-result-40-8-11');
    const psalm = page.getByTestId('verse-result-19-103-12');
    await expect(matthew).toHaveAttribute('data-match', 'exact');
    await expect(psalm).toHaveAttribute('data-match', 'words');
    await expect(matthew.locator('strong')).toHaveText(['east', 'and', 'west']);

    await matthew.click();

    await expect(page).toHaveURL(/\/bible\/matthew\/8\?v=11$/);
    await expect(page.getByTestId('chapter-header')).toHaveText('Matthew 8');
    await expect(page.locator('[data-verse="11"]').first()).toHaveAttribute('data-search-mark', 'true');
    await expect(page.getByRole('dialog', { name: 'Verse Insight' })).toHaveCount(0);
  });

  test('jumps to a typed reference with Enter and marks the verse, without Verse Insight', async ({ page }) => {
    const input = await openSearch(page);
    await input.fill('jn 3.16');
    await expect(page.getByTestId('search-go-to-0')).toContainText('John 3:16');
    await input.press('Enter');

    await expect(page).toHaveURL(/\/bible\/john\/3\?v=16$/);
    const verse = page.locator('[data-verse="16"]').first();
    await expect(verse).toHaveAttribute('data-search-mark', 'true');
    await expect(page.getByRole('dialog', { name: 'Verse Insight' })).toHaveCount(0);

    // The mark is display-only and goes away with the chapter.
    await page.getByTestId('next-chapter-button').or(page.getByLabel('Next chapter')).first().click();
    await expect(page.getByTestId('chapter-header').first()).toHaveText('John 4');
    await expect(page.locator('[data-search-mark]')).toHaveCount(0);
  });

  test('searches the words after a book name within that book', async ({ page }) => {
    const input = await openSearch(page);
    await input.fill('Matthew east and west');
    await expect(page.getByTestId('verse-search-scope')).toContainText('in Matthew');
    await expect(page.getByTestId('verse-result-40-8-11')).toBeVisible();
    await expect(page.getByTestId('verse-result-19-103-12')).toHaveCount(0);
  });

  test('a shared verse link opens the verse with Verse Insight once', async ({ page }) => {
    await page.goto('/bible/psalms/23?v=1&insight=1');
    await readerReady(page);
    await expect(page.getByRole('dialog', { name: 'Verse Insight' })).toContainText('Psalms 23:1');
    // insight=1 is dropped, so a reload doesn't pop the sheet again.
    await expect(page).toHaveURL(/\/bible\/psalms\/23\?v=1$/);
  });
});
