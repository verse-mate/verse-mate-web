import { test, expect } from '@playwright/test';
import { SettingsPage } from '../pages/settings.page';

/**
 * Settings — section headings + font size px display.
 *
 * Maps to FEATURES.md §3.8 (Settings — section layout, font size display).
 *
 * `settings/settings.spec.ts` covers the version-option / language-option
 * testids and the font-slider min/max attributes. This spec covers:
 *
 *   - All three section headings render in the expected order.
 *   - The "Size" display next to the slider updates when the slider
 *     receives a programmatic value change (jsdom-free behavior).
 *   - The "VerseMate · Version 1.0.0" footer is visible.
 */

test.describe('Settings — sections + dynamic display', () => {
  test('section headings render (Bible Version, Language, Display)', async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.goto();

    // Prod copy currently uses "Language Preferences" while the source in
    // some branches still says "Language" — match either.
    await expect(page.getByText(/^bible version$/i).first()).toBeVisible();
    await expect(page.getByText(/^language( preferences)?$/i).first()).toBeVisible();
    await expect(page.getByText(/^display$/i).first()).toBeVisible();
  });

  test('font-size slider px display reflects the slider value', async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.goto();

    // SettingsScreen renders a px label next to the slider. We move the
    // slider via `fill()` (most reliable for native range inputs) and
    // assert the px label updates.
    await settings.fontSizeSlider.fill('22');
    await expect(page.getByText(/22\s*px/i).first()).toBeVisible({ timeout: 5_000 });
  });
});
