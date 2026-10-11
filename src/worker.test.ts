import { describe, expect, it } from 'vitest';

import worker from '../worker.js';

const page = '<!doctype html><title>VerseMate</title>';

const env = {
  ASSETS: {
    fetch: async (request: Request) =>
      new URL(request.url).pathname === '/assets/app.js'
        ? new Response('app', { headers: { 'content-type': 'text/javascript' } })
        : new Response(page, { headers: { 'content-type': 'text/html' } }),
  },
};

function get(path: string) {
  return worker.fetch(new Request(`https://app.example.test${path}`), env);
}

describe('the worker', () => {
  it('serves the sign-in callback page with no Referer for anything it loads', async () => {
    for (const path of ['/auth/callback/google?code=one-time-code', '/auth/callback/apple?code=x', '/auth/callback']) {
      const response = await get(path);
      expect(response.status).toBe(200);
      expect(response.headers.get('referrer-policy')).toBe('no-referrer');
      expect(response.headers.get('content-type')).toBe('text/html');
      expect(await response.text()).toBe(page);
    }
  });

  it('sets the policy on the index.html fallback when the callback path is not an asset', async () => {
    const requested: string[] = [];
    const spaEnv = {
      ASSETS: {
        fetch: async (request: Request) => {
          const { pathname } = new URL(request.url);
          requested.push(pathname);
          return pathname === '/index.html'
            ? new Response(page, { headers: { 'content-type': 'text/html' } })
            : new Response('not found', { status: 404 });
        },
      },
    };

    const response = await worker.fetch(
      new Request('https://app.example.test/auth/callback/google?code=one-time-code'),
      spaEnv,
    );

    expect(requested).toEqual(['/auth/callback/google', '/index.html']);
    expect(response.status).toBe(200);
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(await response.text()).toBe(page);
  });

  it('keeps the status of a HEAD request and a 304 on the callback page', async () => {
    const headEnv = {
      ASSETS: {
        fetch: async (request: Request) =>
          new Response(null, {
            status: request.method === 'HEAD' ? 200 : 304,
            headers: { 'content-type': 'text/html', etag: '"v1"' },
          }),
      },
    };

    const head = await worker.fetch(
      new Request('https://app.example.test/auth/callback/apple', { method: 'HEAD' }),
      headEnv,
    );
    const notModified = await worker.fetch(
      new Request('https://app.example.test/auth/callback/apple', {
        headers: { 'if-none-match': '"v1"' },
      }),
      headEnv,
    );

    expect(head.status).toBe(200);
    expect(head.body).toBeNull();
    expect(head.headers.get('referrer-policy')).toBe('no-referrer');
    expect(notModified.status).toBe(304);
    expect(notModified.body).toBeNull();
    expect(notModified.headers.get('etag')).toBe('"v1"');
    expect(notModified.headers.get('referrer-policy')).toBe('no-referrer');
  });

  it('leaves the referrer policy of other pages alone', async () => {
    for (const path of ['/', '/bible/genesis/1', '/assets/app.js', '/auth/callbacks']) {
      const response = await get(path);
      expect(response.headers.get('referrer-policy')).toBeNull();
    }
  });
});
