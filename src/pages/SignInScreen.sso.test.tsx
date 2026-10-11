import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { startSSOSignIn } from '@/lib/ssoCallback';
import SignInScreen from './SignInScreen';

vi.mock('@/lib/ssoCallback', () => ({ startSSOSignIn: vi.fn(async () => {}) }));
vi.mock('@/contexts/AppContext', () => ({ useApp: () => ({ dispatch: vi.fn() }) }));
vi.mock('@/services/bibleService', () => ({
  API_BASE_URL: 'https://api.example.test',
  login: vi.fn(),
  signup: vi.fn(),
}));

describe('the sign-in screen SSO buttons', () => {
  afterEach(() => {
    vi.mocked(startSSOSignIn).mockClear();
  });

  for (const [label, testId, provider] of [
    ['Google', 'login-google-button', 'google'],
    ['Apple', 'login-apple-button', 'apple'],
  ] as const) {
    it(`starts ${label} sign-in with a challenge through the provider redirect`, () => {
      render(
        <MemoryRouter>
          <SignInScreen />
        </MemoryRouter>,
      );

      fireEvent.click(screen.getByTestId(testId));

      expect(startSSOSignIn).toHaveBeenCalledTimes(1);
      expect(startSSOSignIn).toHaveBeenCalledWith(
        `https://api.example.test/auth/sso/${provider}/redirect`,
      );
    });
  }
});
