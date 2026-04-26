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

  async goto(book = 'genesis', chapter: number = 1) {
    await this.page.goto(`/bible/${book}/${chapter}`);
    await this.chapterSelector.waitFor({ state: 'visible' });
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
