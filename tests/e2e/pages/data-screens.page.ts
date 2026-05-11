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
  /** `notes-chapter-list` — visible only on /notes/:book/:chapter (chapter scope). */
  readonly chapterList: Locator;
  /** Back button on the chapter-scoped view (returns to /notes). */
  readonly chapterBackButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.list = page.getByTestId('notes-list');
    this.emptyState = page.getByTestId('notes-empty-state');
    this.backButton = page.getByTestId('notes-back-button');
    this.chapterList = page.getByTestId('notes-chapter-list');
    this.chapterBackButton = page.getByTestId('notes-chapter-back-button');
  }

  async goto() {
    await this.page.goto('/notes');
    await this.list.waitFor({ state: 'visible' });
  }

  /** Navigate directly to the chapter-scoped notes view. */
  async gotoChapter(book: string, chapter: number) {
    await this.page.goto(`/notes/${book}/${chapter}`);
    await this.chapterList.waitFor({ state: 'visible' });
  }

  /** Group row keyed by bookId+chapter (NotesScreen renders per-chapter groups on the index). */
  group(bookId: number, chapter: number): Locator {
    return this.page.getByTestId(`chapter-group-${bookId}-${chapter}`);
  }

  /** Individual note item on the chapter-scoped view. */
  noteItem(noteId: string): Locator {
    return this.page.getByTestId(`note-item-${noteId}`);
  }

  noteEdit(noteId: string): Locator {
    return this.page.getByTestId(`note-edit-${noteId}`);
  }

  noteOptions(noteId: string): Locator {
    return this.page.getByTestId(`note-options-${noteId}`);
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
