import { test, expect } from '@playwright/test';
import { ReaderPage } from '../pages/reader.page';
import { HAS_AUTH_CREDENTIALS, skipReasonNoAuth } from '../fixtures/env';

/**
 * Regression — chapter-notes sheet (issue #130).
 *
 * The chapter-notes button (📄 icon next to the chapter bookmark) opens
 * an in-place 480px modal ("Notes for {Book} {Chapter}") instead of
 * navigating to `/notes`. The textarea is ALWAYS visible — guests can
 * compose their note first, and the Add Note button morphs into "Sign in
 * to save" when the user is not signed in. Tapping it swaps the modal
 * to an inline sign-in view (Google / Apple / Email) without losing the
 * draft. After signing in (email submits in place; Google/Apple
 * round-trip via sessionStorage), the user is brought back to the
 * compose view with their draft intact and the button now reads "Add
 * Note".
 *
 * Genesis 1 (bookId = 1) is the stable fixture used elsewhere. Mobile-
 * only — DesktopLayout duplicates the chapter-notes testid via its own
 * chrome.
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

  test('textarea is visible for guests and the Add button reads "Sign in to save"', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.tap(page.getByTestId('chapter-notes-button-1-1'));

    const textarea = page.getByTestId('chapter-notes-textarea');
    const button = page.getByTestId('chapter-notes-add-button');

    await expect(textarea).toBeVisible();
    await expect(button).toBeVisible();
    await expect(button).toBeDisabled(); // disabled until something is typed
    await expect(button).toContainText(/sign in to save/i);

    await textarea.fill('My guest draft.');
    await expect(button).toBeEnabled();
    await expect(button).toContainText(/sign in to save/i);
  });

  test('tapping "Sign in to save" with a draft switches to inline sign-in providers', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.tap(page.getByTestId('chapter-notes-button-1-1'));

    const startUrl = page.url();
    await page.getByTestId('chapter-notes-textarea').fill('My guest draft.');
    await page.getByTestId('chapter-notes-add-button').click();

    // URL unchanged, modal still mounted, sign-in view rendered.
    expect(page.url()).toBe(startUrl);
    await expect(page.getByTestId('chapter-notes-signin-cta')).toBeVisible();
    await expect(page.getByTestId('login-google-button')).toBeVisible();
    await expect(page.getByTestId('login-apple-button')).toBeVisible();
    await expect(page.getByTestId('login-email-button')).toBeVisible();

    // The textarea must NOT be in the DOM during sign-in (compose view is
    // hidden until they finish), but the in-flight draft is held in
    // component state and restored when we return.
    await expect(page.getByTestId('chapter-notes-textarea')).toHaveCount(0);

    // "Back to note" returns to the compose view with the draft intact.
    await page.getByTestId('chapter-notes-signin-cancel').click();
    await expect(page.getByTestId('chapter-notes-textarea')).toHaveValue('My guest draft.');
  });

  test('Continue with Email reveals the inline email form (no navigation)', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.tap(page.getByTestId('chapter-notes-button-1-1'));
    await page.getByTestId('chapter-notes-textarea').fill('hello');
    await page.getByTestId('chapter-notes-add-button').click();

    const startUrl = page.url();
    await page.getByTestId('login-email-button').click();

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
    await page.getByTestId('chapter-notes-textarea').fill('hello');
    await page.getByTestId('chapter-notes-add-button').click();
    await page.getByTestId('login-email-button').click();

    const startUrl = page.url();
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-error')).toContainText(/email|password/i);
    expect(page.url()).toBe(startUrl);
    await expect(page.getByTestId('chapter-notes-sheet')).toBeVisible();
  });

  test('returning to /bible with a pending draft auto-reopens the modal with text restored', async ({ page }) => {
    // Simulate the post-SSO return: seed sessionStorage with a draft, then
    // navigate to the bible page. ReadingScreen's useEffect should see the
    // pending draft via `hasPendingChapterNoteDraft` and open the modal,
    // and the modal consumes it on mount to populate the textarea.
    await page.goto('/bible/genesis/1');
    await page.evaluate(() => {
      sessionStorage.setItem('versemate.pending-chapter-note.1.1', 'Restored after SSO');
    });
    // Reload so ReadingScreen mounts with the seeded draft present.
    await page.reload();
    await expect(page.getByTestId('chapter-notes-sheet')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('chapter-notes-textarea')).toHaveValue('Restored after SSO');

    // Draft consumed — second reload should NOT reopen the modal.
    const remaining = await page.evaluate(() =>
      sessionStorage.getItem('versemate.pending-chapter-note.1.1'),
    );
    expect(remaining).toBeNull();
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

  test('signed-in user sees the Add New Note form with "Add Note" label', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.tap(page.getByTestId('chapter-notes-button-1-1'));

    const textarea = page.getByTestId('chapter-notes-textarea');
    const button = page.getByTestId('chapter-notes-add-button');

    await expect(textarea).toBeVisible();
    await expect(button).toBeVisible();
    await expect(button).toContainText(/^add note/i);
    await expect(button).toBeDisabled();

    await textarea.fill('A reflection on Genesis 1.');
    await expect(button).toBeEnabled();

    // Sign-in CTA must NOT render for authed users.
    await expect(page.getByTestId('chapter-notes-signin-cta')).toHaveCount(0);
  });

  test('saving a note dismisses the modal and surfaces the note in /notes', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto('genesis', 1);
    await reader.tap(page.getByTestId('chapter-notes-button-1-1'));

    const unique = `e2e-${Date.now()}`;
    await page.getByTestId('chapter-notes-textarea').fill(unique);
    await page.getByTestId('chapter-notes-add-button').click();

    await expect(page.getByTestId('chapter-notes-sheet')).not.toBeVisible({ timeout: 10_000 });

    await page.goto('/notes');
    await expect(page.getByTestId('notes-list')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('chapter-group-1-1')).toBeVisible({ timeout: 10_000 });
  });
});
