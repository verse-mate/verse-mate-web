import { test, expect } from '@playwright/test';
import { AboutPage } from '../pages/about.page';

/**
 * Menu — About screen.
 *
 * Maps to FEATURES.md §3.7 (About — content + external links).
 *
 * `regressions/divergences.spec.ts` already asserts the Privacy/Terms/
 * Contact link testids exist after divergence #6 was fixed. This spec
 * adds the positive coverage: the mission copy and version label both
 * render, and the back button (default `screen-header-back-button`)
 * returns the user to /menu.
 */

test.describe('Menu — About', () => {
  test('renders hero heading and mission copy', async ({ page }) => {
    const about = new AboutPage(page);
    await about.goto();

    await expect(page.getByText(/built by believers/i)).toBeVisible();
    await expect(page.getByText(/illuminating god/i)).toBeVisible();
  });

  test('exposes Privacy, Terms, and Contact links with sensible hrefs', async ({ page }) => {
    const about = new AboutPage(page);
    await about.goto();

    await expect(about.privacyLink).toBeVisible();
    await expect(about.privacyLink).toHaveAttribute('href', /\/privacy/);

    await expect(about.termsLink).toBeVisible();
    await expect(about.termsLink).toHaveAttribute('href', /\/terms/);

    await expect(about.contactLink).toBeVisible();
    await expect(about.contactLink).toHaveAttribute('href', /^mailto:.+@versemate\.org/);
  });

  test('version label renders in the footer', async ({ page }) => {
    const about = new AboutPage(page);
    await about.goto();
    await expect(page.getByText(/versemate\s*[·•]\s*version\s*1\.0/i)).toBeVisible();
  });

  test('back button returns to /menu', async ({ page }) => {
    const about = new AboutPage(page);
    await about.goto();
    await about.backButton.click();
    await expect(page).toHaveURL(/\/menu(?:\/|$)/);
  });
});
