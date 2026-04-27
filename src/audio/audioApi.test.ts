/**
 * Stability regression: an expired access token must trigger a refresh
 * before the audio chip flips to GuestScopeExceededError. Without the
 * refresh hop, a signed-in user whose 15-min access token rolled over
 * sees "Sign in to listen to this chapter" — the exact bug we hit on
 * 2026-04-27 the day verse-mate-web shipped.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAudioWithPolling, GuestScopeExceededError } from './audioApi';

const ORIGINAL_FETCH = global.fetch;

function setCookies(cookies: Record<string, string>) {
  Object.defineProperty(document, 'cookie', {
    configurable: true,
    get: () =>
      Object.entries(cookies)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('; '),
    set: (next: string) => {
      // Crude parser: name=value; ... — enough for the api.ts writeCookie
      // shape. Lets the refresh path persist the new accessToken.
      const [pair] = next.split(';');
      const [k, v] = pair.split('=');
      cookies[k.trim()] = decodeURIComponent(v ?? '');
    },
  });
}

interface FetchCall {
  url: string;
  init: RequestInit;
}

function makeFetchMock(handlers: Array<(call: FetchCall) => Response | Promise<Response>>) {
  const calls: FetchCall[] = [];
  let i = 0;
  const fn = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = typeof input === 'string' ? input : input.toString();
    const call = { url, init };
    calls.push(call);
    const handler = handlers[i++] ?? handlers[handlers.length - 1];
    return await handler(call);
  });
  global.fetch = fn as typeof global.fetch;
  return { fn, calls };
}

beforeEach(() => {
  setCookies({});
});

afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
});

describe('fetchAudioWithPolling — refresh on 401', () => {
  it('refreshes the access token on 401 and retries the audio request', async () => {
    setCookies({ accessToken: 'expired-token', refreshToken: 'valid-refresh' });

    const { calls } = makeFetchMock([
      // 1) audio request with expired token → 401
      () =>
        new Response(JSON.stringify({ message: 'GUEST_SCOPE_EXCEEDED' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      // 2) refresh call → 200 with a fresh token
      () =>
        new Response(
          JSON.stringify({ accessToken: 'fresh-token', refreshToken: 'rotated-refresh' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      // 3) retried audio request with fresh token → 200 with audio
      () =>
        new Response(
          JSON.stringify({
            audio: {
              url: 'https://cdn.test/audio.mp3',
              duration_seconds: 180,
              voice: 'alloy',
              language_code: 'en-US',
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
    ]);

    const audio = await fetchAudioWithPolling({ explanationId: 11486 });

    expect(audio.url).toBe('https://cdn.test/audio.mp3');
    expect(audio.duration_seconds).toBe(180);

    expect(calls).toHaveLength(3);
    expect(calls[0].url).toContain('/bible/explanation/audio/11486');
    expect((calls[0].init.headers as Headers).get('Authorization')).toBe(
      'Bearer expired-token',
    );
    expect(calls[1].url).toContain('/auth/refresh');
    expect(calls[2].url).toContain('/bible/explanation/audio/11486');
    expect((calls[2].init.headers as Headers).get('Authorization')).toBe(
      'Bearer fresh-token',
    );
  });

  it('throws GuestScopeExceededError when no refresh token is available', async () => {
    setCookies({}); // no tokens at all — true guest
    const { calls } = makeFetchMock([
      () =>
        new Response(JSON.stringify({ message: 'GUEST_SCOPE_EXCEEDED' }), {
          status: 401,
        }),
    ]);

    await expect(fetchAudioWithPolling({ explanationId: 11486 })).rejects.toBeInstanceOf(
      GuestScopeExceededError,
    );
    // No refresh attempt because there's no refresh cookie to send.
    expect(calls).toHaveLength(1);
  });

  it('throws GuestScopeExceededError when refresh fails', async () => {
    setCookies({ accessToken: 'expired', refreshToken: 'also-expired' });
    const { calls } = makeFetchMock([
      () => new Response('{}', { status: 401 }),
      () => new Response('{}', { status: 401 }),
    ]);

    await expect(fetchAudioWithPolling({ explanationId: 11486 })).rejects.toBeInstanceOf(
      GuestScopeExceededError,
    );
    // 1: audio (401) → refresh (401, returns null, no retry).
    expect(calls).toHaveLength(2);
  });
});
