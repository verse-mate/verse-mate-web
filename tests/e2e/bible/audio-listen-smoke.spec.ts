/**
 * Audio — listen smoke (PR #56 verification).
 *
 * Walks the new audio path on /read/leviticus/1/commentary:
 *   - Listen chip (`audio-inline-entry`) reaches `data-state=populated`
 *     (or `playing`) — meaning the API returned a usable URL.
 *   - Tapping the chip mounts the dock (`audio-dock-bar`) and the
 *     <audio> element gains a non-empty src.
 *   - Tapping the dock body opens the full-sheet dialog.
 *   - Esc closes it (TASK-016 a11y).
 *
 * Uses the storageState seeded by `fixtures/auth.setup.ts`. Skipped
 * cleanly when E2E_TEST_PASSWORD is unset.
 *
 * The desktop project is skipped — DesktopLayout renders its own
 * commentary side-panel which duplicates testids; same Phase-2
 * deferral pattern used by commentary-tabs.spec.ts.
 */
import { test, expect } from '@playwright/test';
import { HAS_AUTH_CREDENTIALS, skipReasonNoAuth } from '../fixtures/env';

test.use({ storageState: 'tests/e2e/.auth/user.json' });

test.skip(!HAS_AUTH_CREDENTIALS, skipReasonNoAuth);
test.skip(
  ({ viewport }) => !!viewport && viewport.width >= 1024,
  'Mobile chrome only — desktop has its own commentary surface',
);

test.describe('Audio — listen smoke', () => {
  test('chip → dock → full sheet → Esc closes', async ({ page }) => {
    await page.goto('/read/leviticus/1/commentary');

    // The summary tab is the default. Wait for the inline entry to
    // resolve from the loading state into populated/playing — this
    // proves the API call succeeded and the React Query data flowed
    // back into the UI.
    const chip = page
      .getByTestId('audio-inline-entry')
      .filter({ visible: true })
      .first();
    await expect(chip).toBeVisible({ timeout: 30_000 });
    await expect(chip).toHaveAttribute(
      'data-state',
      /populated|playing/,
      { timeout: 30_000 },
    );

    // Tap to start playback.
    await chip.click();

    const dock = page.getByTestId('audio-dock-bar');
    await expect(dock).toBeVisible({ timeout: 15_000 });

    // <audio> element should have a non-empty src once load() ran.
    const audioSrc = await page
      .locator('audio')
      .first()
      .evaluate((el: HTMLAudioElement) => el.src);
    expect(audioSrc.length).toBeGreaterThan(0);
    expect(audioSrc).toMatch(/explanation-audio\/\d+/);

    // Tap the dock body button (its aria-label starts with
    // "Open full player:") to open the full sheet.
    await page
      .getByRole('button', { name: /open full player/i })
      .click();

    const sheet = page.getByRole('dialog', { name: /full audio player/i });
    await expect(sheet).toBeVisible();

    // TASK-016 a11y: Esc closes the sheet.
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
  });
});
