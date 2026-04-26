import type { Page, Locator } from '@playwright/test';

/**
 * Page object for the BookSelector full-screen modal.
 *
 * Two views behind a single component:
 *  - Book/Topic list (with [OT] [NT] [Topics] tabs + search)
 *  - Chapter grid (when a book is selected)
 *
 * The modal opens from `chapter-selector-button` on Reader/Commentary.
 */
export class BookSelectorPage {
  readonly page: Page;
  readonly modal: Locator;
  readonly modalChapters: Locator;
  readonly closeButton: Locator;
  readonly chapterPickerBack: Locator;
  readonly tabOldTestament: Locator;
  readonly tabNewTestament: Locator;
  readonly tabTopics: Locator;
  readonly booksSearchInput: Locator;
  readonly topicsSearchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.getByTestId('bible-navigation-modal');
    this.modalChapters = page.getByTestId('bible-navigation-modal-chapters');
    this.closeButton = page.getByTestId('bible-navigation-modal-close');
    this.chapterPickerBack = page.getByTestId('chapter-picker-back-button');
    this.tabOldTestament = page.getByTestId('tab-old-testament');
    this.tabNewTestament = page.getByTestId('tab-new-testament');
    this.tabTopics = page.getByTestId('tab-topics');
    this.booksSearchInput = page.getByTestId('books-search-input');
    this.topicsSearchInput = page.getByTestId('topics-search-input');
  }

  /**
   * Slugified book name → `book-item-<slug>` testid. BookSelector slugifies
   * via `name.toLowerCase().replace(/[^a-z0-9]+/g, '-')` etc.
   */
  bookItem(name: string): Locator {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return this.page.getByTestId(`book-item-${slug}`);
  }

  topicItem(name: string): Locator {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return this.page.getByTestId(`topic-item-${slug}`);
  }

  chapter(n: number): Locator {
    return this.page.getByTestId(`chapter-${n}`);
  }
}
