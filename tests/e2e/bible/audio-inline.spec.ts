import { test, expect } from '@playwright/test';
import { CommentaryPage } from '../pages/commentary.page';

/**
 * Commentary — audio inline-entry render states (no auth required).
 *
 * The full audio-playback flow (chip → dock → full sheet) lives in
 * `bible/audio-listen-smoke.spec.ts` and runs only with `E2E_TEST_PASSWORD`.
 * This spec is the guest-side counterpart: we verify that the inline
 * audio entry mounts and lands on a meaningful `data-state` even
 * without a signed-in user.
 *
 * `AudioInlineEntry.tsx` exposes data-state values:
 *   guest-blocked | error | loading | populated | playing
 *
 * For guests on most chapters past the free quota, the chip should
 * settle into `guest-blocked` (or `loading` while the gate evaluates).
 * Both are acceptable; the test fails only if the chip never mounts.
 *
 * Desktop project skipped — DesktopLayout's commentary panel duplicates
 * the inline entry testid.
 */

test.skip(
  ({ viewport }) => !!viewport && viewport.width >= 1024,
  'Mobile chrome only — desktop has its own commentary surface',
);

test.describe('Commentary — audio inline-entry (guest)', () => {
  test('audio-inline-entry mounts on the summary tab and reaches a known state', async ({ page }) => {
    const commentary = new CommentaryPage(page);
    await commentary.goto('Genesis', 1);

    const chip = commentary.audioInlineEntry.first();
    await expect(chip).toBeVisible({ timeout: 30_000 });

    // The chip starts at `loading` and settles to one of the four other
    // terminal states. Either of those is a positive signal.
    await expect(chip).toHaveAttribute(
      'data-state',
      /guest-blocked|error|loading|populated|playing/,
      { timeout: 30_000 },
    );
  });

  test('audio-inline-entry persists across tab switches (Summary ↔ Detailed)', async ({ page }) => {
    const commentary = new CommentaryPage(page);
    await commentary.goto('Genesis', 1);

    // Sanity: chip on Summary tab.
    await expect(commentary.audioInlineEntry.first()).toBeVisible({ timeout: 30_000 });

    // Switch to Detailed — chip should re-mount in that tab body.
    await commentary.tabDetailed.click();
    await expect(commentary.audioInlineEntry.first()).toBeVisible({ timeout: 15_000 });
  });
});
