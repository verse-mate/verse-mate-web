import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Page object for ReadingScreen (`/bible/<book>/<chapter>` and `/read`).
 *
 * Encapsulates the chapter header, view-toggle pills, FAB navigation,
 * progress bar, and verse-level interactions (long-press to open the
 * verse-actions sheet, click to open the verse-insight sheet).
 *
 * Long-press: ReadingScreen attaches `onMouseDown`/`onMouseUp` only on
 * mobile viewport (`!isDesktop`, where the desktop breakpoint is 1024px),
 * so verse-action long-press flows must run on the chromium-mobile project.
 */
export class ReaderPage {
  readonly page: Page;
  readonly chapterSelector: Locator;
  readonly chapterHeader: Locator;
  readonly bibleViewIcon: Locator;
  readonly commentaryViewIcon: Locator;
  readonly hamburgerMenu: Locator;
  readonly previousChapter: Locator;
  readonly nextChapter: Locator;
  readonly progressBar: Locator;
  readonly progressBarFill: Locator;
  readonly progressBarPercentage: Locator;
  readonly chapterPager: Locator;

  constructor(page: Page) {
    this.page = page;
    this.chapterSelector = page.getByTestId('chapter-selector-button');
    this.chapterHeader = page.getByTestId('chapter-header');
    this.bibleViewIcon = page.getByTestId('bible-view-icon');
    this.commentaryViewIcon = page.getByTestId('commentary-view-icon');
    this.hamburgerMenu = page.getByTestId('hamburger-menu-button');
    this.previousChapter = page.getByTestId('previous-chapter-button');
    this.nextChapter = page.getByTestId('next-chapter-button');
    this.progressBar = page.getByTestId('progress-bar');
    this.progressBarFill = page.getByTestId('progress-bar-fill');
    this.progressBarPercentage = page.getByTestId('progress-bar-percentage');
    this.chapterPager = page.getByTestId('chapter-pager-view');
  }

  /**
   * Navigate to a chapter and wait for the reader to settle.
   *
   * Waits for ReadingScreen to mount (chapter-selector visible) AND for
   * the books cache to populate (the FAB next button only renders once
   * `currentBook` is defined, so its visibility is a useful "books have
   * loaded" signal). The `.catch()` on the FAB wait is intentional — for
   * Revelation 22 there is no Next FAB, but goto() callers don't need
   * that detail.
   */
  async goto(book = 'genesis', chapter: number = 1) {
    await this.page.goto(`/bible/${book}/${chapter}`);
    await this.chapterSelector.waitFor({ state: 'visible' });
    // Wait until either Previous OR Next FAB has rendered — proxy for
    // "books cache loaded so subsequent FAB taps can succeed."
    await Promise.race([
      this.nextChapter.waitFor({ state: 'visible', timeout: 10_000 }),
      this.previousChapter.waitFor({ state: 'visible', timeout: 10_000 }),
    ]).catch(() => undefined);
  }

  /**
   * Click a FAB-style button reliably on chromium-mobile.
   *
   * Plain `locator.click()` is flaky on this project — investigation in
   * `_diagnostics/fab-click-investigation.spec.ts` showed plain click,
   * dispatchEvent('click'), and `touchscreen.tap` all racing with the
   * page's initial async work, while `click({ force: true })` and
   * `el.click()` (the DOM API) worked consistently. We use the DOM API
   * via `evaluate` because it bypasses Playwright's actionability
   * checks and synthetic input layer entirely, going straight to React's
   * onClick handler.
   */
  async tap(locator: Locator) {
    await locator.evaluate((el) => (el as HTMLElement).click());
  }

  /**
   * Tap-and-hold via CDP — the only reliable way to fire React's
   * `onTouchStart` then `onTouchEnd` separated by a real wall-clock
   * delay so that ReadingScreen's 400ms long-press timer fires.
   * Works only on Chromium (which is fine — all our projects are).
   */
  async longPressVerseViaCDP(n: number, holdMs = 600) {
    const verse = this.verse(n);
    const box = await verse.boundingBox();
    if (!box) throw new Error(`Verse ${n} not found / not visible`);
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    const cdp = await this.page.context().newCDPSession(this.page);
    try {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x, y, id: 0 }],
      });
      await this.page.waitForTimeout(holdMs);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } finally {
      await cdp.detach().catch(() => undefined);
    }
  }

  /** Locator for verse N's tappable span in the current chapter. */
  verse(n: number): Locator {
    return this.page.getByTestId(`verse-group-${n}`);
  }

  /** Chapter-level bookmark toggle — testid embeds bookId + chapter. */
  chapterBookmarkToggle(bookId: number, chapter: number): Locator {
    return this.page.getByTestId(`bookmark-toggle-${bookId}-${chapter}`);
  }

  /**
   * Trigger a long-press on a verse to open the verse-actions sheet.
   * Only meaningful on mobile viewport (< 1024px). Desktop just opens
   * the verse insight sheet via click.
   */
  async longPressVerse(n: number) {
    const verse = this.verse(n);
    const box = await verse.boundingBox();
    if (!box) throw new Error(`Verse ${n} not found / not visible`);
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await this.page.mouse.move(x, y);
    await this.page.mouse.down();
    // ReadingScreen press timer fires at 400ms (handlePressStart in
    // ReadingScreen.tsx). 600ms is comfortably past that with no risk
    // of accidentally counting as a click on `mouseUp`.
    await this.page.waitForTimeout(600);
    await this.page.mouse.up();
  }

  async expectChapterLoaded(book: string, chapter: number) {
    await expect(this.chapterHeader).toContainText(`${book} ${chapter}`);
    // At least the first verse should render — chapters always start at 1
    await expect(this.verse(1)).toBeVisible();
  }
}
