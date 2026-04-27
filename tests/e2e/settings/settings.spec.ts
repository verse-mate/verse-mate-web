import { test, expect } from '@playwright/test';
import { SettingsPage } from '../pages/settings.page';

/**
 * Settings — render + version + language + font size.
 *
 * Maps to FEATURES.md §3.8.
 *
 * Theme switching is documented in mobile but absent on web (divergence
 * #4); not covered here.
 *
 * Profile editing is also absent on web settings — covered in the
 * authenticated suite when the feature lands.
 */

test.describe('Settings', () => {
  test('renders all four version options + four language options + font slider', async ({
    page,
  }) => {
    const settings = new SettingsPage(page);
    await settings.goto();

    for (const v of ['esv', 'niv', 'kjv', 'nlt'] as const) {
      await expect(settings.versionOption(v)).toBeVisible();
    }
    for (const l of ['en', 'es', 'fr', 'pt'] as const) {
      await expect(settings.languageOption(l)).toBeVisible();
    }
    await expect(settings.fontSizeSlider).toBeVisible();
  });

  test('selecting NIV updates the active state visually', async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.goto();

    // SettingsScreen flips backgroundColor to gold (#B09A6D) on the active
    // version. Asserting on style is brittle — instead, click and verify
    // the click handler ran by re-rendering the page and checking the
    // version persists in localStorage / context.
    await settings.versionOption('niv').click();

    // The button should remain visible after click
    await expect(settings.versionOption('niv')).toBeVisible();

    // Reload — the choice should persist (AppContext writes settings to
    // localStorage). After reload the NIV button should still be the
    // active one (visually). We verify via getAttribute on the inline
    // background-color.
    await page.reload();
    // Wait for the page to fully hydrate post-reload BEFORE reading the
    // computed style — without this, AppContext may not have rehydrated
    // settings.defaultVersion from localStorage yet, and the button
    // briefly shows the default (ESV) styling. Issue #51.
    await expect(settings.backButton).toBeVisible({ timeout: 10_000 });
    await expect(settings.versionOption('niv')).toBeVisible();
    // expect.poll auto-retries the computed-style read until it matches
    // (or times out), so any remaining hydration race is handled.
    await expect
      .poll(
        async () =>
          settings.versionOption('niv').evaluate((el) => {
            const cs = window.getComputedStyle(el as HTMLElement);
            return cs.backgroundColor;
          }),
        { timeout: 5_000 },
      )
      // #B09A6D = rgb(176, 154, 109)
      .toContain('176');
  });

  test('font size slider has the documented 13–26 range', async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.goto();

    // Wait for the slider to be visible AND attached before asserting
    // attrs — under parallel load the SettingsScreen can render with a
    // brief flash where attrs aren't yet on the DOM. Issue #51.
    await expect(settings.fontSizeSlider).toBeVisible({ timeout: 10_000 });
    await expect(settings.fontSizeSlider).toHaveAttribute('min', '13');
    await expect(settings.fontSizeSlider).toHaveAttribute('max', '26');
  });

  test('back button returns to /menu', async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.goto();
    await settings.backButton.click();
    await expect(page).toHaveURL(/\/menu(?:\/|$)/);
  });
});
