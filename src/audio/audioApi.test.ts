/**
 * Stability regression: an expired access token must trigger a refresh
 * before the audio chip flips to GuestScopeExceededError. Without the
 * refresh hop, a signed-in user whose 15-min access token rolled over
 * sees "Sign in to listen to this chapter" — the exact bug we hit on
 * 2026-04-27 the day verse-mate-web shipped.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { describeFetch, type FetchCall } from '@/test/fetchCall';
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

function makeFetchMock(handlers: Array<(call: FetchCall) => Response | Promise<Response>>) {
  const calls: FetchCall[] = [];
  let i = 0;
  const fn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const call = await describeFetch(input, init);
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

describe('fetchAudioWithPolling — 401', () => {
  it('shows the sign-in prompt on a 401 without asking any refresh route, even with an old refresh cookie', async () => {
    setCookies({ accessToken: 'expired-token', refreshToken: 'legacy-refresh' });
    const { calls } = makeFetchMock([
      () =>
        new Response(JSON.stringify({ message: 'GUEST_SCOPE_EXCEEDED' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
    ]);

    await expect(fetchAudioWithPolling({ explanationId: 11486 })).rejects.toBeInstanceOf(
      GuestScopeExceededError,
    );
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toContain('/bible/explanation/audio/11486');
    expect(new Headers(calls[0].init?.headers).get('Authorization')).toBe('Bearer expired-token');
  });
});

describe('fetchAudioWithPolling — dynamic poll timeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('polls past the 30s floor when estimated_ready_seconds requires it', async () => {
    setCookies({ accessToken: 'valid' });
    let pollHits = 0;
    const { calls } = makeFetchMock([
      // 202 with a 60s estimate — fudge x2.5 → 150s timeout
      () =>
        new Response(
          JSON.stringify({
            job: {
              job_id: 'audio-gen:9999:alloy:en-US',
              estimated_ready_seconds: 60,
            },
          }),
          { status: 202, headers: { 'Content-Type': 'application/json' } },
        ),
      // Job stays "active" for the first several polls, then completes.
      // Returning a function as the catch-all handler means subsequent
      // polls share this body.
      () => {
        pollHits++;
        if (pollHits < 30) {
          return new Response(
            JSON.stringify({ job: { job_id: 'audio-gen:9999:alloy:en-US', status: 'active' } }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          );
        }
        return new Response(
          JSON.stringify({
            job: {
              job_id: 'audio-gen:9999:alloy:en-US',
              status: 'completed',
              audio: {
                url: 'https://cdn.test/long.mp3',
                duration_seconds: 270,
                voice: 'alloy',
                language_code: 'en-US',
              },
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      },
    ]);

    const promise = fetchAudioWithPolling({ explanationId: 9999 });
    // Fake-advance 60s in 2s ticks — exceeds the old 30s timeout but
    // well within the new 150s budget. The job completes on the 30th poll.
    for (let i = 0; i < 30; i++) {
      await vi.advanceTimersByTimeAsync(2000);
    }
    const audio = await promise;
    expect(audio.url).toBe('https://cdn.test/long.mp3');
    expect(calls.every((call) => new Headers(call.init?.headers).get('Authorization') === 'Bearer valid')).toBe(true);
    // 1 audio request + 30 polls.
    expect(calls.length).toBeGreaterThan(20);
  });

  it('keeps the 90s floor when estimated_ready_seconds is missing/short', async () => {
    setCookies({ accessToken: 'valid' });
    const { calls } = makeFetchMock([
      // 202 with no estimate at all
      () =>
        new Response(
          JSON.stringify({ job: { job_id: 'audio-gen:42:alloy:en-US' } }),
          { status: 202 },
        ),
      // All polls return active — should time out at 90s.
      () =>
        new Response(
          JSON.stringify({ job: { job_id: 'audio-gen:42:alloy:en-US', status: 'active' } }),
          { status: 200 },
        ),
    ]);

    const promise = fetchAudioWithPolling({ explanationId: 42 }).catch(
      (e) => e,
    );
    // Advance 92s — past the 90s floor.
    for (let i = 0; i < 46; i++) {
      await vi.advanceTimersByTimeAsync(2000);
    }
    const result = await promise;
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toMatch(/timed out after 90s/);
    expect(calls.length).toBeGreaterThan(0);
  });

  it('lets a long job complete near the floor when backend estimate is optimistic', async () => {
    // Real-world case observed on 2026-04-28: backend reports
    // `estimated_ready_seconds: 8` but actual completion is ~75s.
    // The 90s floor keeps the chip in `loading` long enough for the
    // worker to finish.
    setCookies({ accessToken: 'valid' });
    let pollHits = 0;
    const { calls } = makeFetchMock([
      () =>
        new Response(
          JSON.stringify({
            job: {
              job_id: 'audio-gen:11492:alloy:en-US',
              estimated_ready_seconds: 8,
            },
          }),
          { status: 202 },
        ),
      () => {
        pollHits++;
        // Complete on the 38th poll (~76s), like Numbers 7 on prod.
        if (pollHits < 38) {
          return new Response(
            JSON.stringify({
              job: { job_id: 'audio-gen:11492:alloy:en-US', status: 'active' },
            }),
            { status: 200 },
          );
        }
        return new Response(
          JSON.stringify({
            job: {
              job_id: 'audio-gen:11492:alloy:en-US',
              status: 'completed',
              audio: {
                url: 'https://cdn.test/numbers7.mp3',
                duration_seconds: 270,
                voice: 'alloy',
                language_code: 'en-US',
              },
            },
          }),
          { status: 200 },
        );
      },
    ]);

    const promise = fetchAudioWithPolling({ explanationId: 11492 });
    // Advance 80s in 2s ticks — would have timed out on the 30s floor
    // but completes inside the new 90s budget.
    for (let i = 0; i < 40; i++) {
      await vi.advanceTimersByTimeAsync(2000);
    }
    const audio = await promise;
    expect(audio.url).toBe('https://cdn.test/numbers7.mp3');
    expect(calls.length).toBeGreaterThan(30);
  });

  it('treats a transient 404 on the job poll as still-queued (verse-mate#194 race)', async () => {
    // After verse-mate#194 (drop failed jobs before re-enqueue), there
    // is a brief window where `getJob(jobId)` returns nothing on the
    // backend. The chip used to flip to `error` immediately; now it
    // should keep polling and succeed when the job materializes.
    setCookies({ accessToken: 'valid' });
    let pollHits = 0;
    const { calls } = makeFetchMock([
      // 1) audio request → 202 queued
      () =>
        new Response(
          JSON.stringify({
            job: {
              job_id: 'audio-gen:10236:alloy:en-US',
              estimated_ready_seconds: 8,
            },
          }),
          { status: 202 },
        ),
      // 2+) job-status polls: 404 for the first 3 polls, then completed
      () => {
        pollHits++;
        if (pollHits <= 3) {
          return new Response(
            JSON.stringify({ message: 'Job not found' }),
            { status: 404 },
          );
        }
        return new Response(
          JSON.stringify({
            job: {
              job_id: 'audio-gen:10236:alloy:en-US',
              status: 'completed',
              audio: {
                url: 'https://cdn.test/race.mp3',
                duration_seconds: 200,
                voice: 'alloy',
                language_code: 'en-US',
              },
            },
          }),
          { status: 200 },
        );
      },
    ]);

    const promise = fetchAudioWithPolling({ explanationId: 10236 });
    // 4 polls × 2s + a little buffer
    for (let i = 0; i < 5; i++) {
      await vi.advanceTimersByTimeAsync(2000);
    }
    const audio = await promise;
    expect(audio.url).toBe('https://cdn.test/race.mp3');
    expect(calls.length).toBeGreaterThanOrEqual(5);
  });

  it('extends the timeout up to 600s for long backend estimates (chunked TTS)', async () => {
    // Long Detailed explanations that get chunked server-side
    // (verse-mate#195) can run minutes end-to-end. The poll ceiling
    // bumped from 180s to 600s so the chip waits long enough.
    setCookies({ accessToken: 'valid' });
    const { calls } = makeFetchMock([
      // estimated 300s → fudge × 2.5 = 750s → clamped to MAX 600s
      () =>
        new Response(
          JSON.stringify({
            job: {
              job_id: 'audio-gen:99999:alloy:en-US',
              estimated_ready_seconds: 300,
            },
          }),
          { status: 202 },
        ),
      // Job stays active forever — we want to confirm the timeout is at 600s, not 180s.
      () =>
        new Response(
          JSON.stringify({
            job: { job_id: 'audio-gen:99999:alloy:en-US', status: 'active' },
          }),
          { status: 200 },
        ),
    ]);

    const promise = fetchAudioWithPolling({ explanationId: 99999 }).catch(
      (e) => e,
    );
    // Advance 602s — past the new 600s ceiling.
    for (let i = 0; i < 301; i++) {
      await vi.advanceTimersByTimeAsync(2000);
    }
    const result = await promise;
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toMatch(/timed out after 600s/);
    expect(calls.length).toBeGreaterThan(50);
  });
});
