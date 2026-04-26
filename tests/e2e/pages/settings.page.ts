import type { Page, Locator } from '@playwright/test';

/**
 * Page object for `/menu/settings` (SettingsScreen).
 *
 * Three sections currently exposed: Bible Version, Language, Font size.
 * Theme switching is documented in mobile but not present on web (see
 * FEATURES.md §4 — divergence #4).
 */
export class SettingsPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly fontSizeSlider: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.getByTestId('settings-back-button');
    this.fontSizeSlider = page.getByTestId('font-size-slider');
  }

  async goto() {
    await this.page.goto('/menu/settings');
    await this.backButton.waitFor({ state: 'visible' });
  }

  versionOption(v: 'esv' | 'niv' | 'kjv' | 'nlt'): Locator {
    return this.page.getByTestId(`version-option-${v}`);
  }

  languageOption(l: 'en' | 'es' | 'fr' | 'pt'): Locator {
    return this.page.getByTestId(`language-option-${l}`);
  }
}
