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

  it('leaves the referrer policy of other pages alone', async () => {
    for (const path of ['/', '/bible/genesis/1', '/assets/app.js', '/auth/callbacks']) {
      const response = await get(path);
      expect(response.headers.get('referrer-policy')).toBeNull();
    }
  });
});
