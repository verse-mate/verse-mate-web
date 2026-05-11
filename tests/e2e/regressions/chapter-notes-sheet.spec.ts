import { test, expect } from '@playwright/test';
import { ReaderPage } from '../pages/reader.page';
import { HAS_AUTH_CREDENTIALS, skipReasonNoAuth } from '../fixtures/env';

/**
 * Regression — chapter-notes sheet (issue #130).
 *
 * The chapter-notes button (📄 icon next to the chapter bookmark) opens
 * an in-place 480px modal ("Notes for {Book} {Chapter}") instead of
 * navigating to `/notes`. Closing the modal (X or backdrop tap) leaves
 * the user on the Bible page.
 *
 * Guest gating: capturing a note requires a signed-in account. The
 * sign-in flow renders INLINE inside the same 480px modal — Google /
 * Apple SSO buttons + an inline email/password form. No navigation
 * away from the bible page until the user actually picks an SSO
 * provider (which redirects to the backend) or successfully signs in
 * via email (which leaves the modal open and swaps to the Add New
 * Note form because `state.isSignedIn` flips true).
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

  test('guest sees inline sign-in providers inside the same 480px modal', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.tap(page.getByTestId('chapter-notes-button-1-1'));

    // Sign-in renders INSIDE the chapter-notes modal — same container,
    // 3 provider buttons, prompt copy.
    await expect(page.getByTestId('chapter-notes-signin-cta')).toBeVisible();
    await expect(page.getByText(/sign in to save your notes/i)).toBeVisible();
    await expect(page.getByTestId('login-google-button')).toBeVisible();
    await expect(page.getByTestId('login-apple-button')).toBeVisible();
    await expect(page.getByTestId('login-email-button')).toBeVisible();

    // The author form must NOT render for guests.
    await expect(page.getByTestId('chapter-notes-textarea')).toHaveCount(0);
    await expect(page.getByTestId('chapter-notes-add-button')).toHaveCount(0);
  });

  test('Continue with Email reveals the inline email form (no navigation)', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.tap(page.getByTestId('chapter-notes-button-1-1'));

    const startUrl = page.url();
    await page.getByTestId('login-email-button').click();

    // Modal stays mounted; URL unchanged; email/password inputs + submit
    // button appear in place of the providers.
    await expect(page.getByTestId('chapter-notes-sheet')).toBeVisible();
    expect(page.url()).toBe(startUrl);
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
    await expect(page.getByTestId('chapter-notes-signin-email-back')).toBeVisible();

    // Back arrow returns to providers in place.
    await page.getByTestId('chapter-notes-signin-email-back').click();
    await expect(page.getByTestId('login-google-button')).toBeVisible();
    await expect(page.getByTestId('login-email')).toHaveCount(0);
  });

  test('email submit with empty fields shows an inline error (no navigation)', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.tap(page.getByTestId('chapter-notes-button-1-1'));
    await page.getByTestId('login-email-button').click();

    const startUrl = page.url();
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-error')).toContainText(/email|password/i);
    expect(page.url()).toBe(startUrl);
    await expect(page.getByTestId('chapter-notes-sheet')).toBeVisible();
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
