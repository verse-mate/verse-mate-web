import { render, waitFor } from '@testing-library/react';
import type { CaptureResult } from 'posthog-js';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('the analytics client against the real posthog-js', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    window.history.replaceState({}, '', '/');
  });

  it('sends no query string in any event and never asks for feature flags', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    vi.stubEnv('DEV', false);
    const requested: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        requested.push(String(url));
        return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
      }),
    );
    window.history.pushState({}, '', '/coach/leader/l-77/manage?s=report-1&token=t-secret#notes');

    const { default: posthog } = await import('posthog-js');
    const { PostHogProvider } = await import('./PostHogProvider');
    render(
      <MemoryRouter initialEntries={['/coach/leader/l-77/manage?s=report-1&token=t-secret']}>
        <PostHogProvider>
          <div />
        </PostHogProvider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(posthog.__loaded).toBe(true));

    const captured: CaptureResult[] = [];
    posthog.on('eventCaptured', (event) => captured.push(event));
    posthog.capture('$pageview', { $current_url: window.location.href });
    posthog.capture('$autocapture', {
      $elements_chain: 'a:attr__href="/coach/leader/l-77?s=report-1"text="https://zoom.test/j/1?pwd=p-secret"',
      $el_text: 'Join https://zoom.test/j/1?pwd=p-secret',
    });
    posthog.setPersonProperties({ landing_href: window.location.href });
    posthog.identify('u-1', { landing_url: window.location.href });

    await waitFor(() => expect(captured.map((e) => e.event)).toEqual(expect.arrayContaining(['$pageview', '$identify'])));
    const sent = JSON.stringify(captured);
    for (const secret of ['report-1', 't-secret', 'p-secret', 'l-77', '#notes']) expect(sent).not.toContain(secret);
    await waitFor(() => expect(requested.some((url) => url.includes('/e/'))).toBe(true));
    expect(requested.some((url) => url.includes('/flags') || url.includes('/decide'))).toBe(false);
  });

  it('scrubs an exception and starts before the first render', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    vi.stubEnv('DEV', false);
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })));
    window.history.pushState({}, '', '/coach/leader/l-77/manage?s=report-1');

    const { default: posthog } = await import('posthog-js');
    const { PostHogProvider } = await import('./PostHogProvider');
    const { captureRequestError } = await import('@/lib/errorFilters');
    expect(posthog.__loaded).toBe(true);

    const captured: CaptureResult[] = [];
    posthog.on('eventCaptured', (event) => captured.push(event));
    const Broken = () => {
      throw new Error('render failed at https://api.test/coach/admin/reports/rep-8?token=t-render');
    };
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <MemoryRouter initialEntries={['/coach/leader/l-77/manage?s=report-1']}>
        <PostHogProvider>
          <Broken />
        </PostHogProvider>
      </MemoryRouter>,
    );
    quiet.mockRestore();
    captureRequestError(new Error('GET https://api.test/coach/admin/reports/rep-9?token=t-secret failed'), {
      query_key: ['coach', 'admin', 'reports', 'rep-9'],
    });

    await waitFor(() => expect(captured.filter((e) => e.event === '$exception')).toHaveLength(2));
    const sent = JSON.stringify(captured);
    for (const secret of ['rep-8', 'rep-9', 't-render', 't-secret', 'l-77', 'report-1']) expect(sent).not.toContain(secret);
  });
});
