import type { Page, Locator } from '@playwright/test';

/**
 * Page object for TopicEventsScreen — rendered for both:
 *   - `/topic/:categorySlug/:topicSlug` (canonical)
 *   - `/topics/:topicId` (legacy)
 *
 * As of the "treat topics like a Bible chapter" alignment, the in-page
 * ScreenHeader is gone — there is no back arrow or top-level title
 * element. The topic name sits in the chapter-selector dropdown slot
 * (testid varies by viewport: `desktop-chapter-selector-button` on
 * ≥768px, `topic-selector-button` on phone). Tests that need to wait
 * for the page to render should target `searchInput`.
 */
export class TopicEventsPage {
  readonly page: Page;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByTestId('topic-content-search');
  }

  /** Navigate via the canonical `/topic/<cat>/<slug>` URL. */
  async gotoCanonical(categorySlug: string, topicSlug: string) {
    await this.page.goto(`/topic/${categorySlug}/${topicSlug}`);
    await this.searchInput.waitFor({ state: 'visible' });
  }

  /** Navigate via the legacy `/topics/<id>` URL. */
  async gotoLegacy(topicId: string | number) {
    await this.page.goto(`/topics/${topicId}`);
    await this.searchInput.waitFor({ state: 'visible' });
  }
}
