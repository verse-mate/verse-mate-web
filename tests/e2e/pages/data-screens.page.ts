import type { Page, Locator } from '@playwright/test';

/**
 * Lightweight page objects for the three list screens that share the
 * same shape: Bookmarks, Notes, Highlights. Each has a list root, an
 * empty state, a back button, and per-item testids.
 */

export class BookmarksPage {
  readonly page: Page;
  readonly list: Locator;
  readonly emptyState: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.list = page.getByTestId('bookmarks-list');
    this.emptyState = page.getByTestId('bookmarks-empty-state');
    this.backButton = page.getByTestId('bookmarks-back-button');
  }

  async goto() {
    await this.page.goto('/bookmarks');
    await this.list.waitFor({ state: 'visible' });
  }

  item(id: string): Locator {
    return this.page.getByTestId(`bookmark-item-${id}`);
  }

  delete(id: string): Locator {
    return this.page.getByTestId(`bookmark-delete-${id}`);
  }
}

export class NotesPage {
  readonly page: Page;
  readonly list: Locator;
  readonly emptyState: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.list = page.getByTestId('notes-list');
    this.emptyState = page.getByTestId('notes-empty-state');
    this.backButton = page.getByTestId('notes-back-button');
  }

  async goto() {
    await this.page.goto('/notes');
    await this.list.waitFor({ state: 'visible' });
  }

  /** Group row keyed by bookId+chapter (NotesScreen renders per-chapter groups on the index). */
  group(bookId: number, chapter: number): Locator {
    return this.page.getByTestId(`chapter-group-${bookId}-${chapter}`);
  }
}

export class HighlightsPage {
  readonly page: Page;
  readonly list: Locator;
  readonly emptyState: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.list = page.getByTestId('highlights-list');
    this.emptyState = page.getByTestId('highlights-empty-state');
    this.backButton = page.getByTestId('highlights-back-button');
  }

  async goto() {
    await this.page.goto('/highlights');
  }

  group(bookId: number, chapter: number): Locator {
    return this.page.getByTestId(`chapter-group-${bookId}-${chapter}`);
  }
}
