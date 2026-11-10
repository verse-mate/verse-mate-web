import { test, expect, type Page } from '@playwright/test';
import { ReaderPage } from '../pages/reader.page';
import { CommentaryPage } from '../pages/commentary.page';

test.skip(
  ({ viewport }) => !!viewport && viewport.width >= 1024,
  'DesktopLayout duplicates reader testids',
);

const STORED_LANGUAGE_KEY = '@versemate:preferred_language';
const SUMMARY_PATH = /\/bible\/book\/explanation\/\d+\/(\d+)$/;

type SummaryRequest = { chapter: number; lang: string | null };

function recordSummaryRequests(page: Page): SummaryRequest[] {
  const seen: SummaryRequest[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    const match = SUMMARY_PATH.exec(url.pathname);
    if (!match || url.searchParams.get('explanationType') !== 'summary') return;
    seen.push({ chapter: Number(match[1]), lang: url.searchParams.get('lang') });
  });
  return seen;
}

function languagesFor(seen: SummaryRequest[], chapter: number): (string | null)[] {
  return seen.filter((r) => r.chapter === chapter).map((r) => r.lang);
}

test.describe('Reader — ?lang= in the URL', () => {
  test('John 3 with lang=pt-BR stays Portuguese for the visit and leaves the stored choice alone', async ({ page }) => {
    const reader = new ReaderPage(page);
    const commentary = new CommentaryPage(page);
    const seen = recordSummaryRequests(page);

    await page.goto('/bible/john/3?lang=pt-BR');
    await reader.chapterSelector.waitFor({ state: 'visible' });
    await reader.commentaryViewIcon.click();
    await expect(commentary.tabSummary).toBeVisible();
    await expect.poll(() => languagesFor(seen, 3)).toContain('pt');

    await page.goBack();
    await reader.nextChapter.waitFor({ state: 'visible' });
    await reader.tap(reader.nextChapter);
    await page.waitForURL(/\/bible\/john\/4/i);
    await reader.commentaryViewIcon.click();
    await expect(commentary.tabSummary).toBeVisible();
    await expect.poll(() => languagesFor(seen, 4)).toContain('pt');
    expect(languagesFor(seen, 4)).not.toContain('en');

    await page.goto('/read/John/4/commentary');
    await expect(commentary.tabSummary).toBeVisible();
    await expect.poll(() => languagesFor(seen, 4)).toContain('en');

    expect(await page.evaluate((key) => localStorage.getItem(key), STORED_LANGUAGE_KEY)).toBeNull();
  });
});
