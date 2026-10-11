import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clearTokens, getAccessToken, getRefreshToken } from '@/services/api';
import { SSO_VERIFIER_KEY, handleSSOCallback, startSSOSignIn } from './ssoCallback';

const PENDING_VERIFIER = 'v'.repeat(43);

function startedSignIn(secondsAgo = 0) {
  sessionStorage.setItem(
    SSO_VERIFIER_KEY,
    JSON.stringify({ verifier: PENDING_VERIFIER, startedAt: Date.now() - secondsAgo * 1000 }),
  );
}

function pendingVerifier(): string {
  return JSON.parse(sessionStorage.getItem(SSO_VERIFIER_KEY) ?? '{}').verifier;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  sessionStorage.clear();
  localStorage.clear();
  clearTokens();
});

describe('starting SSO sign-in', () => {
  it('keeps a fresh verifier and sends its SHA-256 challenge to the redirect', async () => {
    const location = { href: '' };
    vi.stubGlobal('location', location);
    const before = Date.now();

    await startSSOSignIn('https://api.example.test/auth/sso/google/redirect');

    const stored = JSON.parse(sessionStorage.getItem(SSO_VERIFIER_KEY) ?? '{}');
    expect(stored.startedAt).toBeGreaterThanOrEqual(before);
    expect(stored.startedAt).toBeLessThanOrEqual(Date.now());
    const verifier = pendingVerifier();
    expect(verifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
    const expected = createHash('sha256').update(verifier).digest('base64url');
    expect(location.href).toBe(
      `https://api.example.test/auth/sso/google/redirect?challenge=${expected}`,
    );
  });

  it('uses a new verifier for every sign-in', async () => {
    vi.stubGlobal('location', { href: '' });

    await startSSOSignIn('https://api.example.test/auth/sso/apple/redirect');
    const first = pendingVerifier();
    await startSSOSignIn('https://api.example.test/auth/sso/apple/redirect');

    expect(pendingVerifier()).not.toBe(first);
  });

  for (const provider of ['google', 'apple'] as const) {
    it(`sends the browser to the ${provider} error page when the challenge cannot be computed`, async () => {
      const location = { href: '' };
      vi.stubGlobal('location', location);
      vi.stubGlobal('crypto', { getRandomValues: crypto.getRandomValues.bind(crypto) });

      await startSSOSignIn(`https://api.example.test/auth/sso/${provider}/redirect`);

      const target = new URL(location.href, 'https://app.example.test');
      expect(target.origin).toBe('https://app.example.test');
      expect(target.pathname).toBe(`/auth/callback/${provider}`);
      expect(target.searchParams.get('error')).toBe('invalid_state');
      expect(target.searchParams.get('error_description')).toBe(
        'Sign-in could not start, please try again',
      );
      expect(sessionStorage.getItem(SSO_VERIFIER_KEY)).toBeNull();
    });
  }

  it('sends the browser to the error page when session storage refuses the verifier', async () => {
    const location = { href: '' };
    vi.stubGlobal('location', location);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    await startSSOSignIn('https://api.example.test/auth/sso/google/redirect');

    const target = new URL(location.href, 'https://app.example.test');
    expect(target.pathname).toBe('/auth/callback/google');
    expect(target.searchParams.get('error')).toBe('invalid_state');
  });

  it('shows the start failure on the callback page as a readable message', async () => {
    const location = { href: '' };
    vi.stubGlobal('location', location);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    await startSSOSignIn('https://api.example.test/auth/sso/apple/redirect');
    vi.restoreAllMocks();

    const result = await handleSSOCallback(
      new URL(location.href, 'https://app.example.test').search,
      vi.fn(),
    );

    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe('Sign-in could not start, please try again');
  });
});

describe('the sign-in callback handler', () => {
  it('sends the code with the pending verifier and forgets the verifier', async () => {
    startedSignIn();
    const exchange = vi.fn(async () => ({ accessToken: 'session-token' }));

    const result = await handleSSOCallback(new URLSearchParams({ code: 'one-time-code' }), exchange);

    expect(result.success).toBe(true);
    expect(exchange).toHaveBeenCalledWith('one-time-code', PENDING_VERIFIER);
    expect(sessionStorage.getItem(SSO_VERIFIER_KEY)).toBeNull();
    expect(getAccessToken()).toBe('session-token');
  });

  it('refuses a code when this tab never started sign-in, without calling the exchange', async () => {
    const exchange = vi.fn(async () => ({ accessToken: 'attacker-session' }));

    const result = await handleSSOCallback(new URLSearchParams({ code: 'planted-code' }), exchange);

    expect(result.success).toBe(false);
    expect(result.error).toBe('auth_failed');
    expect(exchange).not.toHaveBeenCalled();
    expect(getAccessToken()).toBeNull();
  });

  it('refuses a token parameter when this tab never started sign-in and stores nothing', async () => {
    const exchange = vi.fn();

    const result = await handleSSOCallback(
      new URLSearchParams({ accessToken: 'planted-token', refreshToken: 'planted-refresh' }),
      exchange,
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('auth_failed');
    expect(getAccessToken()).toBeNull();
    expect(document.cookie).not.toContain('planted');
  });

  it('accepts the token parameter older callbacks send when this tab started sign-in', async () => {
    startedSignIn();
    const exchange = vi.fn();

    const result = await handleSSOCallback(
      new URLSearchParams({ accessToken: 'legacy-token', verified: 'true' }),
      exchange,
    );

    expect(result.success).toBe(true);
    expect(exchange).not.toHaveBeenCalled();
    expect(getAccessToken()).toBe('legacy-token');
    expect(sessionStorage.getItem(SSO_VERIFIER_KEY)).toBeNull();
  });

  it('ignores a refresh token in the callback address', async () => {
    startedSignIn();

    const result = await handleSSOCallback(
      new URLSearchParams({
        accessToken: 'legacy-token',
        refreshToken: 'planted-refresh',
        verified: 'true',
      }),
      vi.fn(),
    );

    expect(result.success).toBe(true);
    expect(getAccessToken()).toBe('legacy-token');
    expect(getRefreshToken()).toBeNull();
    expect(document.cookie).not.toContain('planted-refresh');
  });

  it('refuses a code when the pending sign-in started more than 600 seconds ago', async () => {
    startedSignIn(601);
    const exchange = vi.fn(async () => ({ accessToken: 'late-session' }));

    const result = await handleSSOCallback(new URLSearchParams({ code: 'late-code' }), exchange);

    expect(result.success).toBe(false);
    expect(result.error).toBe('auth_failed');
    expect(exchange).not.toHaveBeenCalled();
    expect(getAccessToken()).toBeNull();
    expect(sessionStorage.getItem(SSO_VERIFIER_KEY)).toBeNull();
  });

  it('refuses a token parameter when the pending sign-in started more than 600 seconds ago', async () => {
    startedSignIn(601);

    const result = await handleSSOCallback(
      new URLSearchParams({ accessToken: 'late-token', verified: 'true' }),
      vi.fn(),
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('auth_failed');
    expect(getAccessToken()).toBeNull();
    expect(document.cookie).not.toContain('late-token');
  });

  it('accepts a sign-in that started just under 600 seconds ago', async () => {
    startedSignIn(590);

    const result = await handleSSOCallback(
      new URLSearchParams({ code: 'timely-code' }),
      vi.fn(async () => ({ accessToken: 'timely-session' })),
    );

    expect(result.success).toBe(true);
  });

  it('refuses a verifier stored in the old plain-text form', async () => {
    sessionStorage.setItem(SSO_VERIFIER_KEY, PENDING_VERIFIER);

    const result = await handleSSOCallback(
      new URLSearchParams({ accessToken: 'legacy-token', verified: 'true' }),
      vi.fn(),
    );

    expect(result.success).toBe(false);
    expect(getAccessToken()).toBeNull();
  });

  it('forgets the verifier when the callback carries an error', async () => {
    startedSignIn();

    const result = await handleSSOCallback(new URLSearchParams({ error: 'access_denied' }), vi.fn());

    expect(result.success).toBe(false);
    expect(sessionStorage.getItem(SSO_VERIFIER_KEY)).toBeNull();
  });
});
