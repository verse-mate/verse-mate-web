import type { Page, Locator } from '@playwright/test';

/**
 * Page object for /menu/about (AboutScreen).
 *
 * Static content screen reached from Menu → About. Three external/email
 * links carry testids (`about-privacy-link`, `about-terms-link`,
 * `about-contact-link`); the rest is content text we assert against
 * loosely (mission heading, version label). Back nav uses the shared
 * ScreenHeader back button — when no `backTestId` prop is set, this
 * falls back to `screen-header-back-button`.
 */
export class AboutPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly privacyLink: Locator;
  readonly termsLink: Locator;
  readonly contactLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // AboutScreen renders <ScreenHeader> without a backTestId prop, so the
    // shared default testid is used here.
    this.backButton = page.getByTestId('screen-header-back-button');
    this.privacyLink = page.getByTestId('about-privacy-link');
    this.termsLink = page.getByTestId('about-terms-link');
    this.contactLink = page.getByTestId('about-contact-link');
  }

  async goto() {
    await this.page.goto('/menu/about');
    await this.privacyLink.waitFor({ state: 'visible' });
  }
}
