import { test, expect } from '@playwright/test';
import { SettingsPage } from '../pages/settings.page';

/**
 * Settings — render + version + language + font size + theme.
 *
 * Maps to FEATURES.md §3.8.
 *
 * The settings page was rewritten to match verse-mate-mobile/app/settings.tsx —
 * the Bible Version / Language pickers are now toggle dropdowns, the
 * version list is scoped to NASB1995 only (matching mobile's
 * bible-versions constant), language codes come from /bible/languages
 * dynamically, and a Theme selector now exists (closes divergence #4).
 *
 * Profile editing + delete-account flows are exercised in the
 * authenticated suite when the storageState fixture is in scope.
 */

test.describe('Settings', () => {
  test('shows Bible version, language, font slider, and theme selector', async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.goto();

    // Bible version picker — only NASB1995 is enabled in the mobile constant.
    await settings.openVersionPicker();
    await expect(settings.versionOption('nasb1995')).toBeVisible();

    // Language picker — at least one language code from /bible/languages.
    await settings.openLanguagePicker();
    await expect(
      page.locator('[data-testid^="language-option-"]').first(),
    ).toBeVisible({ timeout: 10_000 });

    // Font slider + theme selector trigger always render.
    await expect(settings.fontSizeSlider).toBeVisible();
    await expect(settings.themeSelectorTrigger).toBeVisible();
  });

  test('selecting NASB1995 persists across reload', async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.goto();

    await settings.openVersionPicker();
    await settings.versionOption('nasb1995').click();

    // After click the picker collapses; the trigger button label is the
    // selected version's full display value.
    await expect(settings.versionPickerTrigger).toContainText('NASB1995');

    await page.reload();
    await expect(settings.backButton).toBeVisible({ timeout: 10_000 });
    await expect(settings.versionPickerTrigger).toContainText('NASB1995');
  });

  test('font size slider has the documented 13–26 range', async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.goto();

    await expect(settings.fontSizeSlider).toBeVisible({ timeout: 10_000 });
    await expect(settings.fontSizeSlider).toHaveAttribute('min', '13');
    await expect(settings.fontSizeSlider).toHaveAttribute('max', '26');
  });

  test('theme picker exposes Auto / Light / Dark options', async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.goto();

    await settings.openThemePicker();
    await expect(settings.themeOption('system')).toBeVisible();
    await expect(settings.themeOption('light')).toBeVisible();
    await expect(settings.themeOption('dark')).toBeVisible();
  });

  test('back button returns to /menu', async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.goto();
    await settings.backButton.click();
    await expect(page).toHaveURL(/\/menu(?:\/|$)/);
  });
});
