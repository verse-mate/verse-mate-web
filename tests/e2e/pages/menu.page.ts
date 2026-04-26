import type { Page, Locator } from '@playwright/test';

/**
 * Page object for `/menu` (MenuScreen).
 *
 * Mirrors the mobile hamburger-menu testID inventory: every item is
 * `menu-item-<destination>`. The auth-aware bottom button is
 * `menu-item-login` when signed out and `menu-item-logout` when signed in.
 */
export class MenuPage {
  readonly page: Page;
  readonly menuRoot: Locator;
  readonly closeButton: Locator;
  readonly profileCard: Locator;
  readonly bookmarks: Locator;
  readonly notes: Locator;
  readonly highlights: Locator;
  readonly settings: Locator;
  readonly share: Locator;
  readonly about: Locator;
  readonly giving: Locator;
  readonly help: Locator;
  readonly login: Locator;
  readonly logout: Locator;

  constructor(page: Page) {
    this.page = page;
    this.menuRoot = page.getByTestId('hamburger-menu');
    this.closeButton = page.getByTestId('menu-close-button');
    this.profileCard = page.getByTestId('menu-profile-card');
    this.bookmarks = page.getByTestId('menu-item-bookmarks');
    this.notes = page.getByTestId('menu-item-notes');
    this.highlights = page.getByTestId('menu-item-highlights');
    this.settings = page.getByTestId('menu-item-settings');
    this.share = page.getByTestId('menu-item-share');
    this.about = page.getByTestId('menu-item-about');
    this.giving = page.getByTestId('menu-item-giving');
    this.help = page.getByTestId('menu-item-help');
    this.login = page.getByTestId('menu-item-login');
    this.logout = page.getByTestId('menu-item-logout');
  }

  async goto() {
    await this.page.goto('/menu');
    await this.menuRoot.waitFor({ state: 'visible' });
  }
}
