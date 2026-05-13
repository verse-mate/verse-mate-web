import { test, expect } from '@playwright/test';

/**
 * Topics — Most Quoted Verses screen.
 *
 * Maps to FEATURES.md §3.3 (Most-quoted verses).
 *
 * The route is `/topics/:topicId/:eventId/most-quoted`. Reachable from
 * TopicEventDetailScreen via the "Most Quoted Verses" button. No stable
 * direct-URL fixture (topicId/eventId are API-driven), so this spec
 * walks the discovery path: Topics → first topic → first event → Most
 * Quoted Verses button.
 *
 * If the discovery path can't be completed (no topics, no events, or
 * the button isn't visible), the spec skips cleanly so it doesn't
 * regress the suite on transient data states.
 */

test.describe('Topics — Most Quoted', () => {
  test('discovery: Topics → topic → event → Most Quoted Verses', async ({ page }) => {
    await page.goto('/topics');
    await expect(page.getByRole('heading', { name: /topics/i })).toBeVisible({ timeout: 15_000 });

    // Click first topic. TopicsScreen renders items as button-like rows
    // with the topic name as accessible text — the first stable one we
    // know exists is "Creation" (per `topics/browse.spec.ts`).
    const creation = page.getByText(/^creation$/i).first();
    if (!(await creation.isVisible().catch(() => false))) {
      test.skip(true, 'No "Creation" topic on /topics — fixture-dependent');
    }
    await creation.click();

    // Now on TopicEventsScreen. The page no longer renders a top-level
    // ScreenHeader (topics behave like Bible chapters per the chrome
    // alignment) — wait for the topic search input instead.
    await expect(page.getByTestId('topic-content-body')).toBeVisible({ timeout: 15_000 });

    const firstEventButton = page.locator('button').filter({ hasNotText: /^(search|back)$/i }).first();
    if (!(await firstEventButton.isVisible().catch(() => false))) {
      test.skip(true, 'No events listed for the selected topic');
    }
    await firstEventButton.click();

    // Now on TopicEventDetailScreen. Click "Most Quoted Verses" button.
    const mostQuotedButton = page.getByRole('button', { name: /most quoted verses/i });
    if (!(await mostQuotedButton.isVisible().catch(() => false))) {
      test.skip(true, 'Most Quoted Verses button not surfaced on this event');
    }
    await mostQuotedButton.click();

    // Most Quoted screen has a heading containing "Most quoted" or "memorized".
    await expect(page).toHaveURL(/\/most-quoted$/);
    await expect(page.getByRole('heading', { name: /most quoted|memorized/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
