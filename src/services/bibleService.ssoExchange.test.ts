import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearTokens, setAccessToken, setRefreshToken } from './api';
import { exchangeSSOCode } from './bibleService';

const ORIGINAL_FETCH = global.fetch;
const CODE = 'c'.repeat(43);
const VERIFIER = 'v'.repeat(43);

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

let calls: Array<{ url: string; init?: RequestInit }> = [];
function mockFetch(router: (url: string, init?: RequestInit) => Response) {
  calls = [];
  global.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    calls.push({ url, init });
    return Promise.resolve(router(url, init));
  }) as unknown as typeof fetch;
}

describe('exchangeSSOCode', () => {
  beforeEach(() => {
    setAccessToken('placeholder-access');
    setRefreshToken('placeholder-refresh');
  });

  afterEach(() => {
    global.fetch = ORIGINAL_FETCH;
    vi.unstubAllGlobals();
    clearTokens();
  });

  it('posts the code and the verifier without an Authorization header', async () => {
    mockFetch(() => jsonResponse({ accessToken: 'session-token', verified: true }));

    const session = await exchangeSSOCode(CODE, VERIFIER);

    expect(session.accessToken).toBe('session-token');
    expect(calls).toHaveLength(1);
    expect(new URL(calls[0].url).pathname).toBe('/auth/sso/exchange');
    expect(calls[0].init?.method).toBe('POST');
    expect(JSON.parse(String(calls[0].init?.body))).toEqual({ code: CODE, verifier: VERIFIER });
    expect(new Headers(calls[0].init?.headers).get('Authorization')).toBeNull();
  });

  it('rejects a refused code without refreshing or sending the user to /logout', async () => {
    const location = { href: 'http://localhost:3000/auth/callback/google', pathname: '/auth/callback/google' };
    vi.stubGlobal('location', location);
    mockFetch(() => jsonResponse({ message: 'Invalid or expired sign-in code' }, 401));

    await expect(exchangeSSOCode(CODE, VERIFIER)).rejects.toMatchObject({ status: 401 });

    expect(calls.map((c) => new URL(c.url).pathname)).toEqual(['/auth/sso/exchange']);
    expect(location.href).toBe('http://localhost:3000/auth/callback/google');
  });
});
