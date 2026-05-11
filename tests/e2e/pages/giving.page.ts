import type { Page, Locator } from '@playwright/test';

/**
 * Page object for /menu/giving (GivingScreen).
 *
 * No `data-testid` on the donation controls today. We address them by
 * role + accessible name (button text) and stable headings. The primary
 * CTA is a `mailto:` link verified by `href^=mailto:` in the regression
 * suite (FEATURES.md §4 #5).
 */
export class GivingPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly heading: Locator;
  readonly monthlyToggle: Locator;
  readonly oneTimeToggle: Locator;
  readonly mailtoCta: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.getByTestId('screen-header-back-button');
    this.heading = page.getByRole('heading', { name: /give the word/i });
    this.monthlyToggle = page.getByRole('button', { name: /^monthly$/i });
    this.oneTimeToggle = page.getByRole('button', { name: /one[- ]time/i });
    this.mailtoCta = page.locator('a[href^="mailto:"]').first();
  }

  async goto() {
    await this.page.goto('/menu/giving');
    await this.heading.waitFor({ state: 'visible' });
  }

  /** Locator for a preset amount button — labels are "$10", "$25", "$50", "$100". */
  presetAmount(label: '$10' | '$25' | '$50' | '$100'): Locator {
    return this.page.getByRole('button', { name: label, exact: true });
  }
}
