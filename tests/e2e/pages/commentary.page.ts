import type { Page, Locator } from '@playwright/test';

/**
 * Page object for CommentaryScreen — `/read/<Book>/<chapter>/commentary`.
 *
 * Reachable via the `Insight` pill from ReaderPage or via the verse
 * long-press → "Commentary" action.
 */
export class CommentaryPage {
  readonly page: Page;
  readonly chapterSelector: Locator;
  readonly bibleViewIcon: Locator;
  readonly commentaryViewIcon: Locator;
  readonly hamburgerMenu: Locator;
  readonly tabSummary: Locator;
  readonly tabByline: Locator;
  readonly tabStudy: Locator;
  readonly tabVisuals: Locator;
  readonly shareSummary: Locator;
  readonly shareByline: Locator;
  readonly bylineExpandAll: Locator;
  readonly audioInlineEntry: Locator;

  constructor(page: Page) {
    this.page = page;
    this.chapterSelector = page.getByTestId('chapter-selector-button');
    this.bibleViewIcon = page.getByTestId('bible-view-icon');
    this.commentaryViewIcon = page.getByTestId('commentary-view-icon');
    this.hamburgerMenu = page.getByTestId('hamburger-menu-button');
    this.tabSummary = page.getByTestId('tab-summary');
    this.tabByline = page.getByTestId('tab-byline');
    this.tabStudy = page.getByTestId('tab-study');
    this.tabVisuals = page.getByTestId('tab-visuals');
    this.shareSummary = page.getByTestId('share-summary-button');
    this.shareByline = page.getByTestId('share-byline-button');
    this.bylineExpandAll = page.getByTestId('byline-expand-all-button');
    this.audioInlineEntry = page.getByTestId('audio-inline-entry');
  }

  async goto(book = 'Genesis', chapter: number = 1) {
    // Note: this route uses capitalized Book (per CommentaryScreen.tsx
    // `useParams` → decoded directly into the API call). See FEATURES.md
    // §1 for the casing inconsistency between /bible/{book} (lowercase)
    // and /read/{Book}/{ch}/commentary.
    await this.page.goto(`/read/${encodeURIComponent(book)}/${chapter}/commentary`);
    await this.tabSummary.waitFor({ state: 'visible' });
  }

  bylineVerse(n: number): Locator {
    return this.page.getByTestId(`byline-verse-${n}`);
  }

  bylineVerseToggle(n: number): Locator {
    return this.page.getByTestId(`byline-verse-toggle-${n}`);
  }
}
