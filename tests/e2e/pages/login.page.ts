import type { Page, Locator } from '@playwright/test';

/**
 * Page object for /login and /create-account (SignInScreen).
 *
 * Two screens behind one URL:
 *  - "providers": Google / Apple / Continue-with-Email buttons
 *  - "email": email + password (+ first and last name on signup) + submit
 *
 * The mobile testID inventory uses `login-*` for both modes; this page
 * mirrors that. Submit testid is mode-aware (login-submit vs signup-submit).
 */
export class LoginPage {
  readonly page: Page;
  readonly googleButton: Locator;
  readonly appleButton: Locator;
  readonly emailButton: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly modeToggle: Locator;
  readonly providersModeToggle: Locator;
  readonly emailScreenBack: Locator;
  readonly providersBack: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.googleButton = page.getByTestId('login-google-button');
    this.appleButton = page.getByTestId('login-apple-button');
    this.emailButton = page.getByTestId('login-email-button');
    this.emailInput = page.getByTestId('login-email');
    this.passwordInput = page.getByTestId('login-password');
    this.firstNameInput = page.getByTestId('signup-first-name');
    this.lastNameInput = page.getByTestId('signup-last-name');
    this.modeToggle = page.getByTestId('login-mode-toggle');
    this.providersModeToggle = page.getByTestId('login-providers-mode-toggle');
    // Back button shown on the email-screen sub-view (returns to providers view).
    this.emailScreenBack = page.getByTestId('login-screen-back');
    // Back button shown on the providers sub-view (returns to /menu).
    this.providersBack = page.getByTestId('login-back-button');
    this.errorMessage = page.getByTestId('login-error');
  }

  async goto(path: '/login' | '/create-account' = '/login') {
    await this.page.goto(path);
  }

  async openEmailScreen() {
    await this.emailButton.click();
    await this.emailInput.waitFor({ state: 'visible' });
  }

  async signIn(email: string, password: string) {
    await this.openEmailScreen();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.page.getByTestId('login-submit').click();
  }

  async signUp(email: string, password: string, firstName: string, lastName: string) {
    await this.openEmailScreen();
    if (!(await this.firstNameInput.isVisible().catch(() => false))) {
      await this.modeToggle.click();
      await this.firstNameInput.waitFor({ state: 'visible' });
    }
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.page.getByTestId('signup-submit').click();
  }
}
