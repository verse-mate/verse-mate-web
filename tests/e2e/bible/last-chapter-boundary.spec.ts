import { test, expect } from '@playwright/test';
import { ReaderPage } from '../pages/reader.page';

/**
 * Bible — last-chapter FAB boundary.
 *
 * Complements `bible/load-and-navigate.spec.ts` which asserts the
 * first-chapter (left) boundary. Here we cover the right boundary:
 *
 *   - Revelation 22 is the final chapter of the canon — no Next FAB.
 *   - James 5 is the last chapter of James — also no Next FAB.
 *
 * Per ReadingScreen.tsx, the Next FAB renders only when
 * `state.chapter < maxChapter` — strict intra-book boundary, no
 * cross-book roll-forward. Both boundary cases verify the same gate.
 *
 * Mobile-only — DesktopLayout duplicates FAB testids.
 */

test.skip(
  ({ viewport }) => !!viewport && viewport.width >= 1024,
  'DesktopLayout duplicates FAB testids — Phase-2 follow-up',
);

test.describe('Bible — last-chapter boundary', () => {
  test('Revelation 22 hides the Next FAB (canon end)', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('revelation', 22);
    await reader.expectChapterLoaded('Revelation', 22);
    await expect(reader.previousChapter).toBeVisible();
    await expect(reader.nextChapter).not.toBeVisible();
  });

  test('James 5 hides the Next FAB (intra-book right boundary)', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('james', 5);
    await reader.expectChapterLoaded('James', 5);
    await expect(reader.previousChapter).toBeVisible();
    // ReadingScreen's `chapter < maxChapter` gate means Next FAB hides
    // at the last chapter of the current book even though canonically
    // 1 Peter 1 would be next. Cross-book roll-forward happens via the
    // chapter picker, not the FAB.
    await expect(reader.nextChapter).not.toBeVisible();
  });
});
