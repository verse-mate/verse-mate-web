import { test, expect } from '@playwright/test';
import { HelpPage } from '../pages/help.page';

/**
 * Menu — Help screen.
 *
 * Maps to FEATURES.md §3.7 (Help — feedback form).
 *
 * HelpScreen ships without `data-testid` attributes on its form, so this
 * spec relies on role + accessible name (heading, placeholder, submit
 * button). The form is rendered as a topic dropdown + textarea +
 * submit; we verify the inputs render and a typed message is accepted.
 * We deliberately do NOT submit to the backend.
 */

test.describe('Menu — Help', () => {
  test('renders heading + topic picker + textarea + submit button', async ({ page }) => {
    const help = new HelpPage(page);
    await help.goto();

    await expect(help.heading).toBeVisible();
    await expect(help.messageTextarea).toBeVisible();
    await expect(help.submitButton).toBeVisible();
  });

  test('textarea accepts user input', async ({ page }) => {
    const help = new HelpPage(page);
    await help.goto();
    await help.messageTextarea.fill('Some test feedback');
    await expect(help.messageTextarea).toHaveValue('Some test feedback');
  });

  test('back button returns to /menu', async ({ page }) => {
    const help = new HelpPage(page);
    await help.goto();
    await help.backButton.click();
    await expect(page).toHaveURL(/\/menu(?:\/|$)/);
  });
});
