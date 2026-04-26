import { test, expect } from '@playwright/test';

/**
 * Topics — browse + search.
 *
 * Maps to FEATURES.md §3.3 (Topics list browse, Topic search).
 *
 * `/topics` renders TopicsScreen which fetches the full list from the API.
 * No `data-testid` on individual topic items at this screen yet (the
 * BookSelector modal does have them — `topic-item-{slug}` — but those
 * are scoped to the modal). The test relies on heading + at least one
 * common topic name being visible.
 */

test.describe('Topics — browse', () => {
  test('list renders and shows expected categories', async ({ page }) => {
    await page.goto('/topics');
    await expect(page.getByRole('heading', { name: /topics/i })).toBeVisible({ timeout: 15_000 });

    // The prod walkthrough confirms these names are visible. Spot-check
    // by getting the first match (avoids strict-mode violations on
    // desktop where DesktopLayout's inner reader may render verse text
    // containing the same words).
    await expect(page.getByText('Creation', { exact: false }).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText('Faith', { exact: true }).first()).toBeVisible();
  });

  test('back button returns to /read or /bible/...', async ({ page }) => {
    await page.goto('/topics');
    // ScreenHeader emits screen-header-back-button as default fallback
    await page.getByTestId('screen-header-back-button').click();
    await expect(page).toHaveURL(/\/read|\/bible\//);
  });
});
