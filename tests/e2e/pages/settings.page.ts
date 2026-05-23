import type { Page, Locator } from '@playwright/test';

/**
 * Page object for `/menu/settings` (SettingsScreen).
 *
 * Sections currently exposed (all ported from verse-mate-mobile):
 *   - Profile Information (authenticated only)
 *   - Bible Version (dropdown — NASB1995 only, matches mobile constant)
 *   - Language Preferences (dropdown — codes come from /bible/languages)
 *   - Font Size (slider 13–26 with minus/plus buttons)
 *   - Theme (dropdown — Auto / Light / Dark)
 *   - Logout + Delete Account (authenticated only)
 *
 * The Bible Version + Language pickers are toggle-dropdowns: the trigger
 * button is always present, but the option items only render after the
 * dropdown is opened. Helpers below `await openVersionPicker()` /
 * `openLanguagePicker()` for that.
 */
export class SettingsPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly fontSizeSlider: Locator;
  readonly versionPickerTrigger: Locator;
  readonly languagePickerTrigger: Locator;
  readonly themeSelectorTrigger: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.getByTestId('settings-back-button');
    this.fontSizeSlider = page.getByTestId('font-size-slider');
    this.versionPickerTrigger = page.getByTestId('settings-version-button');
    this.languagePickerTrigger = page.getByTestId('settings-language-button');
    this.themeSelectorTrigger = page.getByTestId('theme-selector-button');
  }

  async goto() {
    // waitUntil: 'networkidle' ensures lazy-rendered sections (font-size
    // slider, version picker) are mounted before callers assert against them.
    // Without this, goto() resolved as soon as the back button appeared but
    // before React had finished rendering all settings rows — causing
    // intermittent failures under parallel execution (VER-125).
    await this.page.goto('/menu/settings', { waitUntil: 'networkidle' });
    await this.backButton.waitFor({ state: 'visible' });
  }

  async openVersionPicker() {
    if (await this.versionOption('nasb1995').isVisible().catch(() => false)) return;
    await this.versionPickerTrigger.click();
  }

  async openLanguagePicker() {
    // Any language option visible means the picker is already open.
    const anyLang = this.page.locator('[data-testid^="language-option-"]').first();
    if (await anyLang.isVisible().catch(() => false)) return;
    await this.languagePickerTrigger.click();
  }

  async openThemePicker() {
    if (await this.page.getByTestId('theme-option-light').isVisible().catch(() => false)) return;
    await this.themeSelectorTrigger.click();
  }

  versionOption(key: string): Locator {
    return this.page.getByTestId(`version-option-${key.toLowerCase()}`);
  }

  /**
   * Language code as returned by /bible/languages (e.g. "en-US", "ro").
   * The new picker uses the raw API code in the testid, not the
   * 2-letter ISO code the old picker used.
   */
  languageOption(code: string): Locator {
    return this.page.getByTestId(`language-option-${code}`);
  }

  themeOption(value: 'system' | 'light' | 'dark'): Locator {
    return this.page.getByTestId(`theme-option-${value}`);
  }
}
