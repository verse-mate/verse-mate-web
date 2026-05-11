import { test, expect } from '@playwright/test';
import { HighlightsPage } from '../pages/data-screens.page';

/**
 * Highlights — Auto-Highlights themes section + back navigation.
 *
 * Maps to FEATURES.md §3.5 (Auto-Highlights themes).
 *
 * `highlights/list-and-empty.spec.ts` covers the guest empty state.
 * This spec asserts the Auto-Highlights section heading renders (the
 * theme toggles themselves have no testids today, so we assert against
 * the section copy) and that back navigation returns to /menu.
 */

test.describe('Highlights — Auto-Highlights + back nav', () => {
  test('Auto Highlights section heading is visible', async ({ page }) => {
    const highlights = new HighlightsPage(page);
    await highlights.goto();
    await expect(page.getByText(/auto highlights/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/enable all auto-highlights/i)).toBeVisible();
  });

  test('back button returns to /menu', async ({ page }) => {
    const highlights = new HighlightsPage(page);
    await highlights.goto();
    await highlights.backButton.click();
    await expect(page).toHaveURL(/\/menu(?:\/|$)/);
  });
});
