import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const init = vi.fn();
const capture = vi.fn();
vi.mock('posthog-js', () => ({ default: { init, capture, __loaded: true } }));
vi.mock('posthog-js/react', () => ({ PostHogProvider: ({ children }: { children: React.ReactNode }) => children }));

describe('the analytics client', () => {
  beforeEach(() => {
    vi.resetModules();
    init.mockReset();
    capture.mockReset();
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
  });

  afterEach(() => vi.unstubAllEnvs());

  async function mount(url: string) {
    const { PostHogProvider } = await import('./PostHogProvider');
    render(
      <MemoryRouter initialEntries={[url]}>
        <PostHogProvider>
          <div />
        </PostHogProvider>
      </MemoryRouter>,
    );
  }

  it('scrubs events and replay network entries before they leave the browser', async () => {
    await mount('/coach');
    const config = init.mock.calls[0][1];
    expect(config.before_send).toBeTypeOf('function');
    expect(config.session_recording.maskCapturedNetworkRequestFn).toBeTypeOf('function');
    expect(
      config.before_send({ uuid: 'u', event: 'x', properties: { $current_url: 'https://a.test/coach?s=r1' } })
        .properties.$current_url,
    ).toBe('https://a.test/coach');
  });

  it('masks a coach request in the replay: no ids in its address and no bodies', async () => {
    await mount('/coach');
    const mask = init.mock.calls[0][1].session_recording.maskCapturedNetworkRequestFn;
    const out = mask({
      name: 'https://api.test/coach/admin/reports/rep-77/dimensions/5?leader=milo-kerr',
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
    await mount('/coach?s=report-1&leader=l1');
    const [, props] = capture.mock.calls.find(([event]) => event === '$pageview') ?? [];
    expect(props).toBeDefined();
    expect(JSON.stringify(props)).not.toContain('report-1');
    expect(JSON.stringify(props)).not.toContain('leader=l1');
  });
});
