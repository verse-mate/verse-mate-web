import type { Page, Locator } from '@playwright/test';

/**
 * Page object for TopicEventsScreen — rendered for both:
 *   - `/topic/:categorySlug/:topicSlug` (canonical)
 *   - `/topics/:topicId` (legacy)
 *
 * No data-testid on individual reference buttons today; specs address
 * them via role+name or `getByText` against the verse reference (e.g.
 * "Genesis 1:1"). The screen-level controls use the shared
 * `screen-header-back-button` + `screen-header-title` testids.
 */
export class TopicEventsPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly title: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.getByTestId('screen-header-back-button');
    this.title = page.getByTestId('screen-header-title');
    this.searchInput = page.getByPlaceholder(/^search/i).first();
  }

  /** Navigate via the canonical `/topic/<cat>/<slug>` URL. */
  async gotoCanonical(categorySlug: string, topicSlug: string) {
    await this.page.goto(`/topic/${categorySlug}/${topicSlug}`);
    await this.title.waitFor({ state: 'visible' });
  }

  /** Navigate via the legacy `/topics/<id>` URL. */
  async gotoLegacy(topicId: string | number) {
    await this.page.goto(`/topics/${topicId}`);
    await this.title.waitFor({ state: 'visible' });
  }
}
