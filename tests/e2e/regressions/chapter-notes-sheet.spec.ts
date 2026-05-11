import { test, expect } from '@playwright/test';
import { ReaderPage } from '../pages/reader.page';
import { HAS_AUTH_CREDENTIALS, skipReasonNoAuth } from '../fixtures/env';

/**
 * Regression — chapter-notes sheet (issue #130).
 *
 * Before the fix, the chapter-notes button (📄 icon next to the chapter
 * bookmark) called `navigate('/notes')`, pulling the user off the Bible
 * page they were reading. The fix wires it to open an in-place modal
 * ("Notes for {Book} {Chapter}") that lists existing notes for the
 * chapter and exposes an "Add New Note" form. Closing the modal (X or
 * backdrop tap) leaves the user on the Bible page.
 *
 * Guest gating: capturing a note requires auth (matches highlights /
 * bookmarks). Guests see a "Sign in to save..." CTA instead of the
 * textarea. Signed-in users see the form, and saving auto-dismisses
 * the modal and persists the note to `/notes`.
 *
 * Genesis 1 (bookId = 1) is the stable fixture used elsewhere in the
 * suite. Mobile-only — DesktopLayout duplicates the chapter-notes
 * testid via its own chrome.
 */

test.skip(
  ({ viewport }) => !!viewport && viewport.width >= 1024,
  'Mobile chrome only — DesktopLayout duplicates the chapter-notes testid',
);

test.describe('Bible — chapter-notes sheet (#130) — guest', () => {
  test('tapping the chapter-notes button opens a chapter-scoped modal (does NOT navigate)', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);

    const startUrl = page.url();
    await reader.tap(page.getByTestId('chapter-notes-button-1-1'));

    await expect(page.getByTestId('chapter-notes-sheet')).toBeVisible({ timeout: 5_000 });
    expect(page.url()).toBe(startUrl);
    await expect(page.getByRole('heading', { name: /Notes for Genesis 1/i })).toBeVisible();
  });

  test('guest sees the Sign In CTA instead of the Add Note form', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.tap(page.getByTestId('chapter-notes-button-1-1'));

    // Sign-in pattern mirrors SettingsScreen — User icon + copy + gold button.
    await expect(page.getByTestId('chapter-notes-signin-cta')).toBeVisible();
    await expect(page.getByTestId('chapter-notes-signin-button')).toBeVisible();
    await expect(page.getByText(/sign in to save your notes/i)).toBeVisible();

    // The author form must NOT render for guests.
    await expect(page.getByTestId('chapter-notes-textarea')).toHaveCount(0);
    await expect(page.getByTestId('chapter-notes-add-button')).toHaveCount(0);
  });

  test('Sign In button routes guest to /login and dismisses the sheet', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.tap(page.getByTestId('chapter-notes-button-1-1'));

    await page.getByTestId('chapter-notes-signin-button').click();
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 });
    await expect(page.getByTestId('chapter-notes-sheet')).toHaveCount(0);
  });

  test('close button dismisses the sheet and keeps the reader visible', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.tap(page.getByTestId('chapter-notes-button-1-1'));

    const sheet = page.getByTestId('chapter-notes-sheet');
    await expect(sheet).toBeVisible();

    await page.getByTestId('chapter-notes-sheet-close').click();
    await expect(sheet).not.toBeVisible();
    await expect(reader.chapterSelector).toBeVisible();
    await expect(reader.chapterHeader).toContainText(/Genesis 1/);
  });

  test('backdrop tap dismisses the sheet', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.tap(page.getByTestId('chapter-notes-button-1-1'));

    const sheet = page.getByTestId('chapter-notes-sheet');
    await expect(sheet).toBeVisible();

    await page.getByTestId('chapter-notes-sheet-backdrop').click({ position: { x: 5, y: 5 } });
    await expect(sheet).not.toBeVisible();
  });
});

test.describe('Bible — chapter-notes sheet (#130) — signed in', () => {
  test.use({ storageState: 'tests/e2e/.auth/user.json' });
  test.skip(!HAS_AUTH_CREDENTIALS, skipReasonNoAuth);

  test('signed-in user sees the Add New Note form (textarea + button)', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.tap(page.getByTestId('chapter-notes-button-1-1'));

    const textarea = page.getByTestId('chapter-notes-textarea');
    const addButton = page.getByTestId('chapter-notes-add-button');

    await expect(textarea).toBeVisible();
    await expect(addButton).toBeVisible();
    await expect(addButton).toBeDisabled();

    await textarea.fill('A reflection on Genesis 1.');
    await expect(addButton).toBeEnabled();

    // Sign-in CTA should NOT be present for authed users.
    await expect(page.getByTestId('chapter-notes-signin-cta')).toHaveCount(0);
  });

  test('saving a note dismisses the modal and surfaces the note in /notes', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.tap(page.getByTestId('chapter-notes-button-1-1'));

    const unique = `e2e-${Date.now()}`;
    await page.getByTestId('chapter-notes-textarea').fill(unique);
    await page.getByTestId('chapter-notes-add-button').click();

    // Modal auto-closes after a successful save.
    await expect(page.getByTestId('chapter-notes-sheet')).not.toBeVisible({ timeout: 10_000 });

    // Optimistic update writes the note into AppContext.state.notes, which
    // /notes renders as `chapter-group-{bookId}-{chapter}`. Drill into the
    // index list and confirm the Genesis 1 group is present after the save.
    await page.goto('/notes');
    await expect(page.getByTestId('notes-list')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('chapter-group-1-1')).toBeVisible({ timeout: 10_000 });
  });
});
