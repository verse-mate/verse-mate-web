// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

import worker from '../../worker.js';
import { prefersMarkdown } from './accept';
import { context, edgeEnv, fakeData, installEdgeGlobals } from './testing/fakeEdge';

afterEach(() => vi.unstubAllGlobals());

const BROWSER_ACCEPT = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';

async function get(path: string, accept?: string, method = 'GET') {
  const ctx = context();
  const headers: Record<string, string> = accept === undefined ? {} : { accept };
  const response = await worker.fetch(
    new Request(`https://app.versemate.org${path}`, { method, headers }),
    edgeEnv(),
    ctx,
  );
  const body = await response.text();
  await ctx.settle();
  return { response, body, type: response.headers.get('content-type') };
}

describe('a page URL asked for Markdown', () => {
  it('answers the Markdown of the page, varying on Accept', async () => {
    installEdgeGlobals();

    const { response, body, type } = await get('/bible/john/3', 'text/markdown');

    expect(response.status).toBe(200);
    expect(type).toBe('text/markdown; charset=utf-8');
    expect(response.headers.get('vary')).toMatch(/\bAccept\b/);
    expect(response.headers.get('link')).toBe('<https://app.versemate.org/bible/john/3>; rel="canonical"');
    expect(body.startsWith('# John 3\n')).toBe(true);
  });

  it('prefers Markdown when it is listed at least as high as HTML', async () => {
    installEdgeGlobals();

    expect((await get('/bible/john/3', 'text/markdown, text/html')).type).toBe('text/markdown; charset=utf-8');
    expect((await get('/bible/john/3', 'text/html;q=0.5, text/markdown;q=0.9')).type).toBe('text/markdown; charset=utf-8');
    expect((await get('/bible/john/3', 'text/html, text/markdown;q=0.5')).type).toBe('text/html; charset=utf-8');
  });

  it('keeps HTML for browsers, wildcards, no header, and a refused Markdown', async () => {
    installEdgeGlobals();

    for (const accept of [BROWSER_ACCEPT, '*/*', undefined, 'text/markdown;q=0, */*', 'text/x-markdown']) {
      const { type, response } = await get('/bible/john/3', accept);
      expect(type, String(accept)).toBe('text/html; charset=utf-8');
      expect(response.headers.get('vary'), String(accept)).toMatch(/\bAccept\b/);
    }
  });

  it('answers a missing chapter the way its .md path does', async () => {
    installEdgeGlobals();

    const negotiated = await get('/bible/john/999', 'text/markdown');
    const direct = await get('/bible/john/999.md');

    expect(negotiated.response.status).toBe(404);
    expect(negotiated.response.status).toBe(direct.response.status);
    expect(negotiated.type).toBe(direct.type);
    expect(negotiated.response.headers.get('x-robots-tag')).toBe('noindex');
    expect(negotiated.response.headers.get('vary')).toMatch(/\bAccept\b/);
  });

  it('gives HEAD the status and headers of GET', async () => {
    installEdgeGlobals();

    const head = await get('/bible/john/3', 'text/markdown', 'HEAD');

    expect(head.response.status).toBe(200);
    expect(head.type).toBe('text/markdown; charset=utf-8');
    expect(head.response.headers.get('vary')).toMatch(/\bAccept\b/);
    expect(head.body).toBe('');
  });

  it('never serves one representation from the cache for a request asking for the other', async () => {
    installEdgeGlobals();

    const first = await get('/bible/john/3', 'text/markdown');
    const second = await get('/bible/john/3', BROWSER_ACCEPT);
    const third = await get('/bible/john/3', 'text/markdown');

    expect(first.type).toBe('text/markdown; charset=utf-8');
    expect(second.type).toBe('text/html; charset=utf-8');
    expect(second.body).toContain('<html');
    expect(third.type).toBe('text/markdown; charset=utf-8');
    expect(third.body.startsWith('# John 3\n')).toBe(true);
  });

  it('marks the .md path as varying on Accept too', async () => {
    installEdgeGlobals();

    expect((await get('/bible/john/3.md')).response.headers.get('vary')).toMatch(/\bAccept\b/);
  });
});

describe('the edges of Markdown negotiation', () => {
  it('redirects a moved book slug to its canonical page URL, keeping Vary for the next request', async () => {
    installEdgeGlobals();

    const { response } = await get('/bible/JOHN/3', 'text/markdown');

    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe('https://app.versemate.org/bible/john/3');
    expect(response.headers.get('vary')).toMatch(/\bAccept\b/);
  });

  it('answers like the .md path while the API is down', async () => {
    installEdgeGlobals(fakeData({ down: true }));

    const negotiated = await get('/bible/john/3', 'text/markdown');
    const direct = await get('/bible/john/3.md');

    expect(negotiated.response.status).toBe(503);
    expect(negotiated.response.status).toBe(direct.response.status);
    expect(negotiated.response.headers.get('cache-control')).toBe('no-store');
  });

  it('keeps noindex and the language for an unpublished language', async () => {
    installEdgeGlobals();

    const { response, type } = await get('/bible/john/3?lang=ru', 'text/markdown');

    expect(type).toBe('text/markdown; charset=utf-8');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('link')).toBe('<https://app.versemate.org/bible/john/3?lang=ru>; rel="canonical"');
  });

  it('gives HEAD the headers of GET, for both representations', async () => {
    for (const accept of ['text/markdown', BROWSER_ACCEPT]) {
      installEdgeGlobals();
      const full = await get('/bible/john/3', accept);
      installEdgeGlobals();
      const head = await get('/bible/john/3', accept, 'HEAD');

      for (const name of ['content-type', 'vary', 'link', 'x-robots-tag', 'cache-control']) {
        expect(head.response.headers.get(name), `${accept} ${name}`).toBe(full.response.headers.get(name));
      }
      expect(head.body).toBe('');
      vi.unstubAllGlobals();
    }
  });
});

describe('the Markdown cache', () => {
  it('is one entry for the .md path and the negotiated page URL', async () => {
    const { api } = installEdgeGlobals();

    await get('/bible/john/3.md');
    const before = api.calls.length;
    const negotiated = await get('/bible/john/3', 'text/markdown');

    expect(negotiated.type).toBe('text/markdown; charset=utf-8');
    expect(api.calls.length).toBe(before);
  });
});

describe('reading the Accept header', () => {
  it('follows text/* and */* when deciding how much HTML is wanted', () => {
    expect(prefersMarkdown('text/markdown;q=0.5, text/*')).toBe(false);
    expect(prefersMarkdown('text/markdown;q=0.5, */*;q=0.4')).toBe(true);
  });

  it('ignores case and spacing, treats a broken quality as zero, and caps it at one', () => {
    expect(prefersMarkdown('Text/Markdown')).toBe(true);
    expect(prefersMarkdown('text/markdown ; q=0.8 , text/html ; q=0.5')).toBe(true);
    expect(prefersMarkdown('text/markdown;q=abc, text/html;q=0.1')).toBe(false);
    expect(prefersMarkdown('text/html;q=5, text/markdown')).toBe(true);
  });
});
