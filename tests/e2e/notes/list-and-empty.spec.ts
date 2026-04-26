import { test, expect } from '@playwright/test';
import { NotesPage } from '../pages/data-screens.page';

/**
 * Notes — guest list view + empty state.
 *
 * Maps to FEATURES.md §3.6 (Notes list grouped by chapter, Empty state).
 */

test.describe('Notes — guest list', () => {
  test('renders empty state for a guest visiting /notes', async ({ page }) => {
    const notes = new NotesPage(page);
    await notes.goto();
    await expect(notes.list).toBeVisible();
    await expect(notes.emptyState).toBeVisible();
    await expect(notes.emptyState).toContainText(/no notes yet/i);
    await expect(notes.emptyState).toContainText(/long-press a verse/i);
  });

  test('back button is visible', async ({ page }) => {
    const notes = new NotesPage(page);
    await notes.goto();
    await expect(notes.backButton).toBeVisible();
  });
});
