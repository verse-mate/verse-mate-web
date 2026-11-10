import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearTokens, setAccessToken } from '@/api/client';
import { useAudioProgress } from './useAudioProgress';

const player = vi.hoisted(() => ({
  currentTrack: { explanation_id: 314, duration_seconds: 600 },
  playbackState: 'playing',
  elapsedSeconds: 0,
}));

vi.mock('./AudioPlayerContext', () => ({ useAudioPlayer: () => player }));

const ORIGINAL_FETCH = global.fetch;
let requests: Request[] = [];

beforeEach(() => {
  requests = [];
  player.playbackState = 'playing';
  player.elapsedSeconds = 0;
  vi.stubGlobal('navigator', { ...navigator, sendBeacon: vi.fn(() => true) });
  global.fetch = vi.fn(async (input: RequestInfo | URL) => {
    if (input instanceof Request) requests.push(input);
    return new Response(JSON.stringify({ message: 'none' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as unknown as typeof fetch;
});

afterEach(() => {
  vi.useRealTimers();
  global.fetch = ORIGINAL_FETCH;
  vi.unstubAllGlobals();
  clearTokens();
});

const progressSaves = () =>
  requests.filter((r) => r.method === 'POST' && r.url.endsWith('/bible/explanation/audio/314/progress'));
const periodicSaves = () => progressSaves().filter((r) => !r.keepalive);
const closeSaves = () => progressSaves().filter((r) => r.keepalive);
const positionsOf = (saves: Request[]) =>
  Promise.all(saves.map(async (r) => (await r.clone().json()).position_seconds as number));

async function playFor(seconds: number, hook: { rerender: () => void }) {
  for (let i = 0; i < seconds; i++) {
    player.elapsedSeconds += 1;
    hook.rerender();
    await vi.advanceTimersByTimeAsync(1000);
  }
}

describe('saving while playing', () => {
  it('saves the position every 15 seconds while the position keeps moving', async () => {
    vi.useFakeTimers();
    setAccessToken('listener-token');
    const hook = renderHook(() => useAudioProgress());
    await playFor(31, hook);
    vi.useRealTimers();
    await vi.waitFor(() => expect(periodicSaves()).toHaveLength(2));
    expect(await positionsOf(periodicSaves())).toEqual([15, 30]);
  });
});

describe('closing the tab mid-way', () => {
  it('saves the position at the close, not the last periodic one, on a request that outlives the page', async () => {
    vi.useFakeTimers();
    setAccessToken('listener-token');
    const hook = renderHook(() => useAudioProgress());
    await playFor(22, hook);
    window.dispatchEvent(new Event('beforeunload'));
    vi.useRealTimers();
    await vi.waitFor(() => expect(closeSaves()).toHaveLength(1));
    const [save] = closeSaves();
    expect(save.headers.get('Authorization')).toBe('Bearer listener-token');
    expect(await save.clone().json()).toEqual({ position_seconds: 22, duration_seconds: 600, reason: 'navigation' });
    expect(await positionsOf(periodicSaves())).toEqual([15]);
  });

  it('saves a paused position once when both close events fire', async () => {
    setAccessToken('listener-token');
    player.playbackState = 'paused';
    player.elapsedSeconds = 95;
    renderHook(() => useAudioProgress());
    window.dispatchEvent(new Event('beforeunload'));
    window.dispatchEvent(new Event('pagehide'));
    await vi.waitFor(() => expect(closeSaves()).toHaveLength(1));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(closeSaves()).toHaveLength(1);
    expect(await positionsOf(closeSaves())).toEqual([95]);
  });

  it('saves on pagehide alone, which mobile browsers send instead of beforeunload', async () => {
    setAccessToken('listener-token');
    player.elapsedSeconds = 40;
    renderHook(() => useAudioProgress());
    window.dispatchEvent(new Event('pagehide'));
    await vi.waitFor(() => expect(closeSaves()).toHaveLength(1));
  });

  it('saves again on a later close once the tab is visible again', async () => {
    setAccessToken('listener-token');
    player.elapsedSeconds = 40;
    const hook = renderHook(() => useAudioProgress());
    window.dispatchEvent(new Event('pagehide'));
    await vi.waitFor(() => expect(closeSaves()).toHaveLength(1));
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
    player.elapsedSeconds = 70;
    hook.rerender();
    window.dispatchEvent(new Event('pagehide'));
    await vi.waitFor(() => expect(closeSaves()).toHaveLength(2));
    expect(await positionsOf(closeSaves())).toEqual([40, 70]);
  });

  it('sends no save for a guest', async () => {
    player.elapsedSeconds = 40;
    renderHook(() => useAudioProgress());
    window.dispatchEvent(new Event('beforeunload'));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(closeSaves()).toHaveLength(0);
    expect(navigator.sendBeacon).not.toHaveBeenCalled();
  });
});
