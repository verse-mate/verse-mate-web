import type { Page, Locator } from '@playwright/test';

/**
 * Page object for /menu/help (HelpScreen).
 *
 * HelpScreen exposes no `data-testid` attributes today — its controls
 * are addressed by role + accessible name (textarea placeholder, Submit
 * button label) and by stable copy. When testids land, swap the
 * accessor implementations here without touching the spec files.
 *
 * Five topic options are rendered as plain buttons inside an animated
 * dropdown; we don't pin to specific topic labels here since copy may
 * evolve. Specs just verify the dropdown opens and at least one option
 * surfaces.
 */
export class HelpPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly heading: Locator;
  readonly messageTextarea: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.getByTestId('screen-header-back-button');
    this.heading = page.getByRole('heading', { name: /how can we help/i });
    this.messageTextarea = page.getByPlaceholder(/describe the issue/i);
    this.submitButton = page.getByRole('button', { name: /^send|^submit/i });
  }

  async goto() {
    await this.page.goto('/menu/help');
    await this.heading.waitFor({ state: 'visible' });
  }
}
