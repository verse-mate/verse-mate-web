import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clearTokens, getAccessToken } from '@/services/api';
import { SSO_VERIFIER_KEY, handleSSOCallback, startSSOSignIn } from './ssoCallback';

const PENDING_VERIFIER = 'v'.repeat(43);

function startedSignIn() {
  sessionStorage.setItem(SSO_VERIFIER_KEY, PENDING_VERIFIER);
}

afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
  localStorage.clear();
  clearTokens();
});

describe('starting SSO sign-in', () => {
  it('keeps a fresh verifier and sends its SHA-256 challenge to the redirect', async () => {
    const location = { href: '' };
    vi.stubGlobal('location', location);

    await startSSOSignIn('https://api.example.test/auth/sso/google/redirect');

    const verifier = sessionStorage.getItem(SSO_VERIFIER_KEY) ?? '';
    expect(verifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
    const expected = createHash('sha256').update(verifier).digest('base64url');
    expect(location.href).toBe(
      `https://api.example.test/auth/sso/google/redirect?challenge=${expected}`,
    );
  });

  it('uses a new verifier for every sign-in', async () => {
    vi.stubGlobal('location', { href: '' });

    await startSSOSignIn('https://api.example.test/auth/sso/apple/redirect');
    const first = sessionStorage.getItem(SSO_VERIFIER_KEY);
    await startSSOSignIn('https://api.example.test/auth/sso/apple/redirect');

    expect(sessionStorage.getItem(SSO_VERIFIER_KEY)).not.toBe(first);
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

  it('forgets the verifier when the callback carries an error', async () => {
    startedSignIn();

    const result = await handleSSOCallback(new URLSearchParams({ error: 'access_denied' }), vi.fn());

    expect(result.success).toBe(false);
    expect(sessionStorage.getItem(SSO_VERIFIER_KEY)).toBeNull();
  });
});
