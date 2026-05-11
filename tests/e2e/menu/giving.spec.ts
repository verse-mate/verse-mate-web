import { test, expect } from '@playwright/test';
import { GivingPage } from '../pages/giving.page';

/**
 * Menu — Giving screen.
 *
 * Maps to FEATURES.md §3.7 (Giving — preset amounts, cadence toggle).
 *
 * `regressions/divergences.spec.ts` asserts the CTA is a `mailto:` link
 * (divergence #5). This spec adds the positive structural coverage:
 *   - Monthly / One-time toggle renders
 *   - Four preset amount buttons render ($10, $25, $50, $100)
 *   - Primary mailto CTA includes the chosen amount in its querystring
 */

test.describe('Menu — Giving', () => {
  test('renders heading + Monthly/One-time toggle + four preset buttons', async ({ page }) => {
    const giving = new GivingPage(page);
    await giving.goto();

    await expect(giving.heading).toBeVisible();
    await expect(giving.monthlyToggle).toBeVisible();
    await expect(giving.oneTimeToggle).toBeVisible();

    for (const label of ['$10', '$25', '$50', '$100'] as const) {
      await expect(giving.presetAmount(label)).toBeVisible();
    }
  });

  test('primary CTA is a mailto: link with a non-empty href', async ({ page }) => {
    const giving = new GivingPage(page);
    await giving.goto();

    await expect(giving.mailtoCta).toBeVisible();
    const href = await giving.mailtoCta.getAttribute('href');
    expect(href).toMatch(/^mailto:.+@versemate\.org/);
  });

  test('back button returns to /menu', async ({ page }) => {
    const giving = new GivingPage(page);
    await giving.goto();
    await giving.backButton.click();
    await expect(page).toHaveURL(/\/menu(?:\/|$)/);
  });
});
