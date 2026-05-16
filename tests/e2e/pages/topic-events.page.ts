import type { Page, Locator } from '@playwright/test';

/**
 * Page object for TopicEventsScreen — rendered for both:
 *   - `/topic/:categorySlug/:topicSlug` (canonical)
 *   - `/topics/:topicId` (legacy)
 *
 * The topic page mirrors a Bible chapter — no ScreenHeader, no search
 * bar. The topic name lives in the chapter-selector dropdown slot
 * (`desktop-chapter-selector-button` on ≥768px, `topic-selector-button`
 * on phone). `contentBody` is the stable marker that the page rendered.
 */
export class TopicEventsPage {
  readonly page: Page;
  readonly contentBody: Locator;

  constructor(page: Page) {
    this.page = page;
    this.contentBody = page.getByTestId('topic-content-body');
  }

  /** Navigate via the canonical `/topic/<cat>/<slug>` URL. */
  async gotoCanonical(categorySlug: string, topicSlug: string) {
    await this.page.goto(`/topic/${categorySlug}/${topicSlug}`);
    await this.contentBody.waitFor({ state: 'visible' });
  }

  /** Navigate via the legacy `/topics/<id>` URL. */
  async gotoLegacy(topicId: string | number) {
    await this.page.goto(`/topics/${topicId}`);
    await this.contentBody.waitFor({ state: 'visible' });
  }
}
