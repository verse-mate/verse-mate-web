import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { client, init, capture, captureException } = vi.hoisted(() => {
  const client = { __loaded: false } as Record<string, unknown>;
  const init = vi.fn();
  init.mockImplementation(() => {
    client.__loaded = true;
  });
  const capture = vi.fn();
  const captureException = vi.fn();
  Object.assign(client, { init, capture, captureException });
  return { client, init, capture, captureException };
});
vi.mock('posthog-js', () => ({ default: client }));

describe('the analytics client', () => {
  beforeEach(() => {
    vi.resetModules();
    client.__loaded = false;
    init.mockClear();
    capture.mockReset();
    captureException.mockReset();
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
});
