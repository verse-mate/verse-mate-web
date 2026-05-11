import type { Page, Locator } from '@playwright/test';

/**
 * Page object for MostQuotedScreen — `/topics/:topicId/:eventId/most-quoted`.
 *
 * No data-testid on individual verse rows today. We address by role
 * (search input, heading) and verse text. Specs that need to reach this
 * screen do so by navigating Topics → Topic → Event → "Most Quoted
 * Verses" button (or by direct URL when the topicId / eventId are
 * known fixtures).
 */
export class MostQuotedPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly heading: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.getByTestId('screen-header-back-button');
    this.heading = page.getByRole('heading', { name: /most quoted|memorized/i });
    this.searchInput = page.getByPlaceholder(/^search/i).first();
  }

  async goto(topicId: string | number, eventId: string | number) {
    await this.page.goto(`/topics/${topicId}/${eventId}/most-quoted`);
    await this.heading.waitFor({ state: 'visible' });
  }
}
