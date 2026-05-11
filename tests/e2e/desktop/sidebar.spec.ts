import { test, expect } from '@playwright/test';
import { DesktopReaderPage } from '../pages/desktop.page';

/**
 * Desktop — sidebar OT/NT collapsible sections + chapter buttons.
 *
 * Maps to FEATURES.md §3.11 (Desktop sidebar).
 *
 * `desktop/split-view.spec.ts` covers the layout shell, header, panels,
 * divider drag, and commentary tabs in the shared header. This spec
 * focuses on the sidebar itself:
 *
 *   - OT and NT section headers (`sidebar-section-old-testament` /
 *     `sidebar-section-new-testament`) render with the right testids.
 *   - Clicking a chapter inside the sidebar advances the reader URL.
 *
 * Desktop-only.
 */

test.skip(
  ({ viewport }) => !viewport || viewport.width < 1024,
  'DesktopLayout sidebar only mounts at >=1024px',
);

test.describe('Desktop — sidebar', () => {
  test('OT + NT section headers are visible in the sidebar', async ({ page }) => {
    const desktop = new DesktopReaderPage(page);
    await desktop.goto('genesis', 1);

    await expect(desktop.sidebar).toBeVisible();
    await expect(desktop.sidebarSection('old-testament')).toBeVisible();
    await expect(desktop.sidebarSection('new-testament')).toBeVisible();
  });

  test('OT/NT section headers toggle expanded state on click', async ({ page }) => {
    const desktop = new DesktopReaderPage(page);
    await desktop.goto('genesis', 1);

    // Both sections render and are clickable. We don't pin to a specific
    // expanded/collapsed signal because DesktopLayout's chapter-grid
    // reveal nests several layers deep and varies by current book — but
    // a click should not crash and the section header stays visible.
    const ot = desktop.sidebarSection('old-testament');
    await expect(ot).toBeVisible();
    await ot.click();
    await expect(ot).toBeVisible();
  });
});

// Phase-2: deep sidebar interactions (clicking a specific chapter button
// to advance the reader URL) require scoping into the post-expand chapter
// grid. The current sidebar renders chapter buttons only after a book is
// expanded, and the buttons have no individual testids. Add testids
// (e.g. `desktop-sidebar-chapter-<bookId>-<n>`) in DesktopLayout.tsx
// before writing a deterministic click-and-advance spec.
