import { afterEach, describe, expect, it, vi } from 'vitest';

import { clearTokens } from './api';
import { signup } from './bibleService';

const ORIGINAL_FETCH = global.fetch;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('signup', () => {
  afterEach(() => {
    global.fetch = ORIGINAL_FETCH;
    clearTokens();
  });

  it('posts the first and last name the backend requires', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    global.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      calls.push({ url, init });
      if (new URL(url).pathname === '/auth/signup') {
        return Promise.resolve(jsonResponse({ accessToken: 'session-token', verified: false }));
      }
      return Promise.resolve(
        jsonResponse({ id: 'u1', email: 'ruth@example.com', firstName: 'Ruth', lastName: 'Moab' }),
      );
    }) as unknown as typeof fetch;

    await signup({ email: 'ruth@example.com', password: 'Sup3rSecret!pass', firstName: 'Ruth', lastName: 'Moab' });

    const signupCall = calls.find((c) => new URL(c.url).pathname === '/auth/signup');
    expect(JSON.parse(String(signupCall?.init?.body))).toEqual({
      email: 'ruth@example.com',
      password: 'Sup3rSecret!pass',
      firstName: 'Ruth',
      lastName: 'Moab',
    });
  });
});
