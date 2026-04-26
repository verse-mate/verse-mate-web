import { test, expect } from '@playwright/test';
import { MenuPage } from '../pages/menu.page';

/**
 * Menu — render + items.
 *
 * Maps to FEATURES.md §3.7 (Hamburger button → menu, Menu items in order).
 *
 * Web menu is a full-page route (`/menu`), not a slide-in overlay. Tests
 * must therefore not assert on transition animation — only on the final
 * rendered list.
 */

test.describe('Menu — items', () => {
  test('menu route renders all 9 expected items + close button + profile card', async ({
    page,
  }) => {
    const menu = new MenuPage(page);
    await menu.goto();

    await expect(menu.menuRoot).toBeVisible();
    await expect(menu.closeButton).toBeVisible();
    await expect(menu.profileCard).toBeVisible();

    await expect(menu.bookmarks).toBeVisible();
    await expect(menu.notes).toBeVisible();
    await expect(menu.highlights).toBeVisible();
    await expect(menu.settings).toBeVisible();
    await expect(menu.share).toBeVisible();
    await expect(menu.about).toBeVisible();
    await expect(menu.giving).toBeVisible();
    await expect(menu.help).toBeVisible();
    await expect(menu.login).toBeVisible(); // guest state
  });

  test('hamburger from the reader navigates to /menu', async ({ page, viewport }) => {
    test.skip(
      !!viewport && viewport.width >= 1024,
      'DesktopLayout renders its own menu in the right panel; uses different chrome.',
    );
    await page.goto('/bible/genesis/1');
    await page.getByTestId('hamburger-menu-button').click();
    await expect(page).toHaveURL(/\/menu(?:\/|$)/);
  });

  test('close button returns to /read', async ({ page }) => {
    const menu = new MenuPage(page);
    await menu.goto();
    await menu.closeButton.click();
    await expect(page).toHaveURL(/\/read|\/bible\//);
  });
});
