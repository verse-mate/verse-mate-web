import { expect, test } from '@playwright/test';

import {
  NEWEST_ID,
  OLDER_ID,
  useCoachApi,
} from './fixtures';

/**
 * The leader-facing coaching flows.
 *
 * Every case here is a bug that shipped and was caught by driving the portal by
 * hand rather than by a test. They are the four the suite could not see:
 *
 * - an unknown deep link silently rendering a DIFFERENT session's score,
 * - a status band rendered in the bottom band's red until the rubric loaded,
 * - a session's retained recording unreachable for the leader it belongs to,
 * - a recording address minted on render rather than at playback.
 *
 * The suite runs against a Vite dev server with no backend, so the coach API is
 * fulfilled from `./fixtures`.
 */
test.describe('Coaching dashboard, as the leader', () => {
  test('opens the most recent session', async ({ page }) => {
    await useCoachApi(page);
    await page.goto('/coach');

    await expect(page.getByText('August 29, 2026').first()).toBeVisible();
    await expect(page.getByTestId('coach-tab-scorecard')).toBeVisible();
  });

  test('a deep link opens the session it NAMES, not the newest', async ({ page }) => {
    await useCoachApi(page);
    await page.goto(`/coach?s=${OLDER_ID}`);

    await expect(page.getByText('August 22, 2026').first()).toBeVisible();
    await expect(page.getByText('August 29, 2026')).toHaveCount(0);
  });

  test('an UNKNOWN deep link is a not-found, never another session', async ({ page }) => {
    // `Math.max(0, findIndex(...))` turned "not found" into index 0, so a stale
    // emailed link showed the leader someone else's score with nothing on the
    // page revealing the substitution.
    await useCoachApi(page);
    await page.goto('/coach?s=no-such-session');

    await expect(page.getByText(/couldn't find that session/i)).toBeVisible();
    await expect(page.getByText('August 29, 2026')).toHaveCount(0);
  });

  test('a status band is not the WORST colour before the rubric arrives', async ({
    page,
  }) => {
    // Band colours are keyed by position in the SERVED order, and every caller
    // passes an empty list on first paint. With a bottom-band fallback, a
    // leader having an excellent month was shown the colour of the worst one
    // until the fetch resolved.
    await useCoachApi(page, { rubricDelayMs: 4000 });
    await page.goto('/coach');

    const band = page.getByText('Strong', { exact: true }).first();
    await expect(band).toBeVisible();
    const before = await band.evaluate((el) => getComputedStyle(el).color);
    expect(before).toBe('rgb(138, 130, 114)'); // neutral: unknown, not bad
    expect(before).not.toBe('rgb(169, 78, 43)'); // the bottom band's rust

    // And once the rubric lands, the band gets its own colour.
    await expect
      .poll(async () => band.evaluate((el) => getComputedStyle(el).color), {
        timeout: 10_000,
      })
      .toBe('rgb(154, 110, 31)');
  });

  test('no PDF affordance anywhere on a report', async ({ page }) => {
    // The Drive PDF path is gone; the portal renders everything it carried.
    await useCoachApi(page);
    await page.goto('/coach');

    await expect(page.getByText('August 29, 2026').first()).toBeVisible();
    await expect(page.getByText(/download.*pdf/i)).toHaveCount(0);
  });
});

test.describe("A session's retained recording", () => {
  test('is offered to the leader whose session it is', async ({ page }) => {
    // The component, its endpoint and its tests all existed while the component
    // was mounted only behind an admin-gated screen, so the leader saw nothing.
    const mints: string[] = [];
    await useCoachApi(page, { retained: [NEWEST_ID], onMint: (id) => mints.push(id) });
    await page.goto('/coach');

    const play = page.getByTestId(`coach-recording-play-${NEWEST_ID}`);
    await expect(play).toBeVisible();
    // Opening the session mints NOTHING: an address minted on render is spent
    // by the time anyone presses play.
    expect(mints).toEqual([]);

    await play.click();
    await expect(page.locator('video')).toBeVisible();
    expect(mints).toEqual([NEWEST_ID]);
  });

  test('re-mints ONCE on a failed load, then says so instead of showing a dead player', async ({
    page,
  }) => {
    // A detail view left open past the address lifetime should still play, so
    // one failed load re-mints. The second failure is the recording itself, and
    // the player has to go: left mounted, it was a black rectangle with no
    // explanation, and the message never reached the screen.
    const mints: string[] = [];
    await useCoachApi(page, {
      retained: [NEWEST_ID],
      breakPlayback: true,
      onMint: (id) => mints.push(id),
    });
    await page.goto('/coach');

    await page.getByTestId(`coach-recording-play-${NEWEST_ID}`).click();
    await expect(page.getByText(/Recording unavailable/i)).toBeVisible();
    await expect(page.locator('video')).toHaveCount(0);
    expect(mints).toEqual([NEWEST_ID, NEWEST_ID]);
  });

  test('is absent on a session with nothing retained', async ({ page }) => {
    await useCoachApi(page);
    await page.goto('/coach');

    await expect(page.getByText('August 29, 2026').first()).toBeVisible();
    await expect(page.getByTestId(`coach-recording-play-${NEWEST_ID}`)).toHaveCount(0);
  });
});
