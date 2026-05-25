import { test, expect } from '@playwright/test';
import { SettingsPage } from '../pages/settings.page';
import { guestStorageState } from '../fixtures/env';

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
 *
 * Parallel-execution isolation (VER-125):
 *   Root cause: two specs were flaky under --fullyParallel because
 *   (a) goto() resolved as soon as the back button appeared but before
 *       lazy-rendered sections (font-size slider, version picker) were
 *       mounted, causing attribute assertions to race against React
 *       hydration; and
 *   (b) openVersionPicker()'s isVisible() guard ran without a settle
 *       wait, so a concurrent worker's in-flight dropdown animation
 *       could return a stale visibility state.
 *   Fix: await networkidle after navigation in goto(), and assert
 *   visibility with an explicit timeout before reading attributes.
 *   storageState is cleared per-test at the global config level
 *   (playwright.config.ts → use.storageState), so localStorage does not
 *   bleed between workers.
 */

test.describe('Settings', () => {
  // Belt-and-suspenders: make isolation explicit at the suite level even
  // though the global config already sets this per test. Uses the shared
  // guest state so the first-run onboarding overlay stays dismissed (an
  // empty storageState would let it cover the page and block interactions).
  test.use({ storageState: guestStorageState() });

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
    // Wait for the option to be stable before clicking (avoids animation races
    // under parallel execution where a previous worker's transition is still
    // in flight on a shared dev-server render).
    await expect(settings.versionOption('nasb1995')).toBeVisible({ timeout: 10_000 });
    await settings.versionOption('nasb1995').click();

    // After click the picker collapses; wait for the trigger to reflect the
    // selection before reloading so the assertion isn't racing a React state
    // update.
    await expect(settings.versionPickerTrigger).toContainText('NASB1995', { timeout: 10_000 });

    await page.reload();
    await expect(settings.backButton).toBeVisible({ timeout: 10_000 });
    await expect(settings.versionPickerTrigger).toContainText('NASB1995');
  });

  test('font size slider has the documented 13–26 range', async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.goto();

    // Wait for the slider to be fully mounted (it may render after the back
    // button in lazy sections — see VER-125 root-cause note at the top).
    const slider = settings.fontSizeSlider;
    await expect(slider).toBeVisible({ timeout: 10_000 });
    // Attributes are set synchronously with the element; a stable visibility
    // check above is sufficient before reading them.
    await expect(slider).toHaveAttribute('min', '13');
    await expect(slider).toHaveAttribute('max', '26');
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
