import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { client, init, capture, captureException, register, reset } = vi.hoisted(() => {
  const client = { __loaded: false } as Record<string, unknown>;
  const init = vi.fn();
  init.mockImplementation(() => {
    client.__loaded = true;
  });
  const capture = vi.fn();
  const captureException = vi.fn();
  const register = vi.fn();
  const reset = vi.fn();
  Object.assign(client, { init, capture, captureException, register, reset, debug: vi.fn() });
  return { client, init, capture, captureException, register, reset };
});
vi.mock('posthog-js', () => ({ default: client }));

describe('the analytics client', () => {
  beforeEach(() => {
    vi.resetModules();
    client.__loaded = false;
    init.mockClear();
    capture.mockReset();
    captureException.mockReset();
    register.mockReset();
    reset.mockReset();
    window.localStorage.clear();
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    window.history.replaceState({}, '', '/');
  });

  async function mount(url: string, child: React.ReactNode = <div />) {
    const { PostHogProvider } = await import('./PostHogProvider');
    return render(
      <MemoryRouter initialEntries={[url]}>
        <PostHogProvider>{child}</PostHogProvider>
      </MemoryRouter>,
    );
  }

  it('reports an uncaught error once PostHog has started', async () => {
    const { unmount } = await mount('/read');
    window.onerror?.('boom', 'https://app.test/main.js', 1, 2, new Error('NOTICKET-21 uncaught'));
    unmount();
    expect(captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'NOTICKET-21 uncaught' }),
      expect.objectContaining({ source: 'window-error' }),
    );
  });

  it('reports an unhandled promise rejection once PostHog has started', async () => {
    const { unmount } = await mount('/read');
    window.onunhandledrejection?.call(window, {
      reason: new Error('NOTICKET-21 rejected'),
    } as PromiseRejectionEvent);
    unmount();
    expect(captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'NOTICKET-21 rejected' }),
      expect.objectContaining({ source: 'unhandled-promise' }),
    );
  });

  it('reports a rejection that is not an Error without its contents', async () => {
    const { unmount } = await mount('/read');
    window.onunhandledrejection?.call(window, { reason: { body: 'secret body' } } as PromiseRejectionEvent);
    unmount();
    expect(captureException.mock.calls[0][0].message).toBe('Non-Error rejection: object');
    expect(JSON.stringify(captureException.mock.calls)).not.toContain('secret body');
  });

  it('reports an error thrown while rendering', async () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});
    const Broken = () => {
      throw new Error('NOTICKET-21 render');
    };
    await mount('/read', <Broken />);
    quiet.mockRestore();
    expect(captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'NOTICKET-21 render' }),
      expect.objectContaining({ source: 'error-boundary' }),
    );
  });

  it('leaves out a render error from a signed-out state', async () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { CoachAuthError } = await import('@/services/coachService');
    const SignedOut = () => {
      throw new CoachAuthError('signed_out');
    };
    await mount('/read', <SignedOut />);
    quiet.mockRestore();
    expect(captureException).not.toHaveBeenCalled();
  });

  it('starts nothing without a key', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', '');
    const before = window.onerror;
    await mount('/read', <p>still here</p>);
    expect(init).not.toHaveBeenCalled();
    expect(window.onerror).toBe(before);
    expect(document.body.textContent).toContain('still here');
  });

  it('sends the first pageview of the visit', async () => {
    await mount('/read');
    expect(capture).toHaveBeenCalledWith('$pageview', expect.objectContaining({ pathname: '/read' }));
  });

  it('scrubs events and replay network entries before they leave the browser', async () => {
    await mount('/coach');
    const config = init.mock.calls[0][1];
    expect(config.before_send).toBeTypeOf('function');
    expect(config.session_recording.maskCapturedNetworkRequestFn).toBeTypeOf('function');
    expect(config.session_recording.maskAllInputs).toBe(true);
    expect(config.session_recording.blockClass).toBeUndefined();
    expect(config.session_recording).toMatchObject({ recordBody: false, recordHeaders: false });
    expect(config.enable_recording_console_log).toBe(false);
    expect(config.advanced_disable_feature_flags).toBe(true);
    expect(config.capture_exceptions).toBe(false);
    expect(
      config.before_send({ uuid: 'u', event: 'x', properties: { $current_url: 'https://a.test/coach?s=r1' } })
        .properties.$current_url,
    ).toBe('https://a.test/coach');
  });

  it('masks a coach request in the replay: no ids in its address and no bodies', async () => {
    await mount('/coach');
    const mask = init.mock.calls[0][1].session_recording.maskCapturedNetworkRequestFn;
    const out = mask({
      name: 'https://api.test/coach/admin/reports/rep-77/dimensions/5?leader=leader-f',
      entryType: 'resource',
      startTime: 0,
      duration: 1,
      requestBody: '{"score":2,"rationale":"never opened the passage"}',
      responseBody: '{"base":76,"status":"Strong"}',
    });
    expect(out).toMatchObject({
      name: 'https://api.test/coach/admin/reports/:id/dimensions/:id',
      requestBody: null,
      responseBody: null,
    });
  });

  it('sends a pageview without the query string', async () => {
    window.history.pushState({}, '', '/coach?s=report-1&leader=l1');
    await mount('/coach?s=report-1&leader=l1');
    const [, props] = capture.mock.calls.find(([event]) => event === '$pageview') ?? [];
    expect(props).toBeDefined();
    expect(JSON.stringify(props)).not.toContain('report-1');
    expect(JSON.stringify(props)).not.toContain('leader=l1');
  });

  it('starts nothing and reports nothing when the browser refuses storage', async () => {
    const blocked = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    await mount('/read');
    blocked.mockRestore();
    window.onerror?.('boom', 'https://app.test/main.js', 1, 2, new Error('after refusal'));
    expect(init).not.toHaveBeenCalled();
    expect(capture).not.toHaveBeenCalled();
    expect(captureException).not.toHaveBeenCalled();
  });

  it('starts nothing when the browser refuses cookies', async () => {
    Object.defineProperty(document, 'cookie', { configurable: true, get: () => '', set: () => {} });
    try {
      await mount('/read');
    } finally {
      delete (document as unknown as Record<string, unknown>).cookie;
    }
    expect(init).not.toHaveBeenCalled();
  });

  it('decides returning before PostHog writes its own state', async () => {
    window.history.replaceState({}, '', '/bible/john/3');
    init.mockImplementationOnce((key: string, config: { loaded: (c: unknown) => void }) => {
      client.__loaded = true;
      window.localStorage.setItem(`ph_${key}_posthog`, '{}');
      config.loaded(client);
    });
    await mount('/bible/john/3');
    expect(capture).toHaveBeenCalledWith('acquisition_first_touch', expect.objectContaining({ returning: false }));
  });

  it('marks a browser that used the reader before as returning', async () => {
    window.localStorage.setItem('ph_test-key_posthog', '{}');
    init.mockImplementationOnce((_key: string, config: { loaded: (c: unknown) => void }) => {
      client.__loaded = true;
      config.loaded(client);
    });
    await mount('/read');
    expect(capture).toHaveBeenCalledWith('acquisition_first_touch', expect.objectContaining({ returning: true }));
  });

  it('sends the first page view after the first touch, carrying its channel', async () => {
    window.history.replaceState({}, '', '/bible/john/3?utm_source=chatgpt.com');
    init.mockImplementationOnce((_key: string, config: { loaded: (c: unknown) => void }) => {
      client.__loaded = true;
      config.loaded(client);
    });
    await mount('/bible/john/3');
    const channelAt = register.mock.calls.findIndex(([props]) => props.first_touch_channel === 'ai');
    const pageviewAt = capture.mock.calls.findIndex(([event]) => event === '$pageview');
    expect(channelAt).toBeGreaterThanOrEqual(0);
    expect(register.mock.invocationCallOrder[channelAt]).toBeLessThan(capture.mock.invocationCallOrder[pageviewAt]);
  });

  it('names the surface and records the first touch once loaded', async () => {
    window.history.replaceState({}, '', '/bible/john/3?utm_source=chatgpt.com');
    await mount('/bible/john/3');
    const instance = { register: vi.fn(), capture: vi.fn(), debug: vi.fn() };
    init.mock.calls[0][1].loaded(instance);
    expect(instance.register).toHaveBeenCalledWith({ platform: 'web', surface: 'reader' });
    expect(instance.capture).toHaveBeenCalledWith(
      'acquisition_first_touch',
      expect.objectContaining({ surface: 'reader', channel: 'ai', ai_source: 'chatgpt' }),
    );
  });

  it('keeps the surface and first touch on events after a sign-out', async () => {
    window.history.replaceState({}, '', '/bible/john/3?utm_source=chatgpt.com');
    await mount('/bible/john/3');
    init.mock.calls[0][1].loaded({ register: vi.fn(), capture: vi.fn(), debug: vi.fn() });
    const { analytics } = await import('@/lib/analytics');
    analytics.reset();
    const resetAt = reset.mock.invocationCallOrder[0];
    const surfaceAt = register.mock.calls.findIndex(([props]) => props.surface === 'reader');
    const touchAt = register.mock.calls.findIndex(([props]) => props.first_touch_channel === 'ai');
    expect(register.mock.calls[touchAt][0]).toEqual({ first_touch_channel: 'ai', first_touch_ai_source: 'chatgpt' });
    expect(register.mock.invocationCallOrder[surfaceAt]).toBeGreaterThan(resetAt);
    expect(register.mock.invocationCallOrder[touchAt]).toBeGreaterThan(resetAt);
  });

  it('sends no first touch when another tab of this browser already sent one', async () => {
    window.history.replaceState({}, '', '/bible/john/3?utm_source=chatgpt.com');
    window.localStorage.setItem(
      'vm_first_touch_sent',
      JSON.stringify({ channel: 'search', at: '2026-11-11T00:00:00.000Z' }),
    );
    Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: { request: (_name: string, callback: () => Promise<void>) => callback() },
    });
    init.mockImplementationOnce((_key: string, config: { loaded: (c: unknown) => void }) => {
      client.__loaded = true;
      config.loaded(client);
    });
    try {
      await mount('/bible/john/3');
      await new Promise((resolve) => setTimeout(resolve, 0));
    } finally {
      Reflect.deleteProperty(navigator, 'locks');
    }
    expect(capture).not.toHaveBeenCalledWith('acquisition_first_touch', expect.anything());
    const channels = register.mock.calls.filter(([props]) => 'first_touch_channel' in props);
    expect(channels.at(-1)?.[0]).toEqual({ first_touch_channel: 'search' });
  });
});
