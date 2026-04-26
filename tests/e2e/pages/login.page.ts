import type { Page, Locator } from '@playwright/test';

/**
 * Page object for /login and /create-account (SignInScreen).
 *
 * Two screens behind one URL:
 *  - "providers": Google / Apple / Continue-with-Email buttons
 *  - "email": email + password (+ name on signup) + submit
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
  readonly nameInput: Locator;
  readonly modeToggle: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.googleButton = page.getByTestId('login-google-button');
    this.appleButton = page.getByTestId('login-apple-button');
    this.emailButton = page.getByTestId('login-email-button');
    this.emailInput = page.getByTestId('login-email');
    this.passwordInput = page.getByTestId('login-password');
    this.nameInput = page.getByTestId('signup-name');
    this.modeToggle = page.getByTestId('login-mode-toggle');
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

  async signUp(email: string, password: string, name: string) {
    await this.openEmailScreen();
    // The combined screen starts in signin mode; toggle to signup if needed
    if (await this.nameInput.isVisible().catch(() => false)) {
      // already in signup
    } else {
      await this.modeToggle.click();
      await this.nameInput.waitFor({ state: 'visible' });
    }
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.page.getByTestId('signup-submit').click();
  }
}
