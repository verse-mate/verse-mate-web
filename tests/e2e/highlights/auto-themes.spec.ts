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

  test("Jesus's Words (red-letter) toggle is present and persists", async ({ page }) => {
    const highlights = new HighlightsPage(page);
    await highlights.goto();

    const card = page.getByTestId('red-letter-card');
    await expect(card).toBeVisible({ timeout: 10_000 });
    await expect(card.getByText(/jesus's words/i)).toBeVisible();

    // Client-side toggle (no sign-in required). Flips aria-checked on click.
    const toggle = card.getByRole('switch');
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');

    // Setting is persisted to the local settings blob.
    const persisted = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('versemate-settings') || '{}').redLetter
    );
    expect(persisted).toBe(true);
  });
});
