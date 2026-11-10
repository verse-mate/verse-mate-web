// @vitest-environment node
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { keyIn, newlyPublished, publishedLanguages, run, type Fetcher } from '../../scripts/indexnow';
import worker from '../../worker.js';
import { context, edgeEnv, installEdgeGlobals } from './testing/fakeEdge';

afterEach(() => vi.unstubAllGlobals());

const publicDir = join(__dirname, '../../public');
const KEY = '0cef9078b0b1b3b32fb3a427739bdc64';

function wrangler(languages: string[]) {
  return `{
  // the reader
  "vars": { "API_URL": "https://api.versemate.org", "INDEXED_LANGUAGES": ["en-US"] },
  "env": {
    /* staging */
    "staging": { "vars": { "INDEXED_LANGUAGES": ["en-US"] } },
    "production": { "vars": { "INDEXED_LANGUAGES": ${JSON.stringify(languages)}, }, },
  },
}`;
}

function files(previous: string[], current: string[]) {
  const dir = mkdtempSync(join(tmpdir(), 'indexnow-'));
  writeFileSync(join(dir, 'previous.jsonc'), wrangler(previous));
  writeFileSync(join(dir, 'current.jsonc'), wrangler(current));
  return { previous: join(dir, 'previous.jsonc'), current: join(dir, 'current.jsonc') };
}

function site(published: string[], indexnow: (body: unknown) => Response | Promise<Response>, build = 'build-1') {
  installEdgeGlobals();
  const submitted: unknown[] = [];
  const fetcher: Fetcher = async (input, init) => {
    if (input === 'https://api.indexnow.org/indexnow') {
      const body = JSON.parse(String(init?.body));
      submitted.push(body);
      return indexnow(body);
    }
    const ctx = context();
    const response = await worker.fetch(new Request(input), edgeEnv({ INDEXED_LANGUAGES: published, CF_VERSION_METADATA: { id: build } }), ctx);
    await ctx.settle();
    return response;
  };
  return { fetcher, submitted };
}

const quiet = { log: () => undefined, error: () => undefined };

describe('the published languages of a deploy', () => {
  it('are read from the production environment of wrangler.jsonc', () => {
    expect(publishedLanguages(wrangler(['en-US', 'es-MX']))).toEqual(['en-US', 'es-MX']);
  });

  it('are new when the parent commit did not publish them', () => {
    expect(newlyPublished(['en-US'], ['en-US', 'es-MX', 'pt-BR'])).toEqual(['es-MX', 'pt-BR']);
    expect(newlyPublished(['en-US', 'es-MX'], ['en-US'])).toEqual([]);
  });

  it('use the key file the site serves', () => {
    expect(keyIn(publicDir)).toBe(KEY);
  });
});

describe('the IndexNow submission', () => {
  it('sends the URLs of the newly published language only', async () => {
    const { previous, current } = files(['en-US'], ['en-US', 'es-MX']);
    const { fetcher, submitted } = site(['en-US', 'es-MX'], () => new Response(null, { status: 202 }));

    const code = await run(['changed', previous, current], { fetcher, publicDir, ...quiet });

    expect(code).toBe(0);
    expect(submitted).toEqual([
      {
        host: 'app.versemate.org',
        key: KEY,
        keyLocation: `https://app.versemate.org/${KEY}.txt`,
        urlList: [
          'https://app.versemate.org/bible/john/3?lang=es-MX',
          'https://app.versemate.org/jesus/event/event-baptism?lang=es-MX',
        ],
      },
    ]);
  });

  it('sends nothing and reads nothing when no language was added', async () => {
    const { previous, current } = files(['en-US', 'es-MX'], ['en-US']);
    const unreachable: Fetcher = async (input) => {
      throw new Error(`unexpected read of ${input}`);
    };

    expect(await run(['changed', previous, current], { fetcher: unreachable, publicDir, ...quiet })).toBe(0);
  });

  it('sends every published language for the launch', async () => {
    const { current } = files([], ['en-US']);
    const { fetcher, submitted } = site(['en-US'], () => new Response(null, { status: 200 }));

    expect(await run(['all', current], { fetcher, publicDir, ...quiet })).toBe(0);
    expect((submitted[0] as { urlList: string[] }).urlList).toEqual([
      'https://app.versemate.org/bible/genesis/1',
      'https://app.versemate.org/bible/john/3',
      'https://app.versemate.org/bible/john/4',
      'https://app.versemate.org/jesus/event/event-baptism',
      'https://app.versemate.org/topic/events/the-creation-of-the-world',
    ]);
  });

  it('waits for the new deploy to serve the sitemap index before submitting', async () => {
    const { current } = files([], ['en-US']);
    const { fetcher, submitted } = site(['en-US'], () => new Response(null, { status: 200 }));
    let oldDeployReads = 2;
    const deploying: Fetcher = async (input, init) => {
      if (input === 'https://app.versemate.org/sitemap.xml' && oldDeployReads > 0) {
        oldDeployReads -= 1;
        return new Response('<!doctype html><title>VerseMate</title>', { headers: { 'content-type': 'text/html' } });
      }
      return fetcher(input, init);
    };
    const waits: number[] = [];

    const code = await run(['all', current], { fetcher: deploying, publicDir, ...quiet, wait: async (ms) => void waits.push(ms) });

    expect(code).toBe(0);
    expect(waits).toHaveLength(2);
    expect((submitted[0] as { urlList: string[] }).urlList.length).toBeGreaterThan(0);
  });

  it('fails without submitting when the sitemap never lists the published language', async () => {
    const { current } = files([], ['en-US']);
    const { fetcher, submitted } = site(['en-US'], () => new Response(null, { status: 200 }));
    const stale: Fetcher = async (input, init) =>
      input === 'https://app.versemate.org/sitemap.xml'
        ? new Response('<!doctype html><title>VerseMate</title>', { headers: { 'content-type': 'text/html' } })
        : fetcher(input, init);
    const errors: string[] = [];

    const code = await run(['all', current], { fetcher: stale, publicDir, log: () => undefined, error: (line) => errors.push(line), wait: async () => undefined });

    expect(code).toBe(1);
    expect(submitted).toHaveLength(0);
    expect(errors.join('\n')).toMatch(/en-US/);
  });

  it('waits while the old deploy still serves an index without the new language', async () => {
    const { previous, current } = files(['en-US'], ['en-US', 'es-MX']);
    const old = site(['en-US'], () => new Response(null, { status: 200 }));
    const fresh = site(['en-US', 'es-MX'], () => new Response(null, { status: 200 }), 'build-2');
    let oldReads = 3;
    const deploying: Fetcher = async (input, init) => {
      if (input === 'https://app.versemate.org/sitemap.xml' && oldReads > 0) {
        oldReads -= 1;
        return old.fetcher(input, init);
      }
      return fresh.fetcher(input, init);
    };
    const waits: number[] = [];

    const code = await run(['changed', previous, current], { fetcher: deploying, publicDir, ...quiet, wait: async (ms) => void waits.push(ms) });

    expect(code).toBe(0);
    expect(waits).toHaveLength(3);
    const urls = (fresh.submitted[0] as { urlList: string[] }).urlList;
    expect(urls.length).toBeGreaterThan(0);
    expect(urls.every((url) => url.includes('lang=es-MX'))).toBe(true);
  });

  it('names the language when the index never lists it', async () => {
    const { previous, current } = files(['en-US'], ['en-US', 'es-MX']);
    const old = site(['en-US'], () => new Response(null, { status: 200 }));
    const errors: string[] = [];

    const code = await run(['changed', previous, current], { fetcher: old.fetcher, publicDir, log: () => undefined, error: (line) => errors.push(line), wait: async () => undefined });

    expect(code).toBe(1);
    expect(old.submitted).toHaveLength(0);
    expect(errors.join('\n')).toMatch(/lists no sitemap for es-MX/);
    expect(errors.join('\n')).not.toMatch(/Error: Error/);
  });

  it('fails without submitting when the sitemaps of a published language list no URLs', async () => {
    const { current } = files([], ['en-US']);
    const { fetcher, submitted } = site(['en-US'], () => new Response(null, { status: 200 }));
    const empty: Fetcher = async (input, init) =>
      /\/sitemaps\//.test(input)
        ? new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', { headers: { 'content-type': 'application/xml' } })
        : fetcher(input, init);
    const errors: string[] = [];

    const code = await run(['all', current], { fetcher: empty, publicDir, log: () => undefined, error: (line) => errors.push(line), wait: async () => undefined });

    expect(code).toBe(1);
    expect(submitted).toHaveLength(0);
    expect(errors.join('\n')).toMatch(/en-US/);
  });

  it('fails without submitting when a child sitemap answers with HTML', async () => {
    const { current } = files([], ['en-US']);
    const { fetcher, submitted } = site(['en-US'], () => new Response(null, { status: 200 }));
    const html: Fetcher = async (input, init) =>
      input.endsWith('/sitemaps/topics-en-US.xml')
        ? new Response('<!doctype html><title>VerseMate</title>', { headers: { 'content-type': 'text/html' } })
        : fetcher(input, init);
    const errors: string[] = [];

    const code = await run(['all', current], { fetcher: html, publicDir, log: () => undefined, error: (line) => errors.push(line), wait: async () => undefined });

    expect(code).toBe(1);
    expect(submitted).toHaveLength(0);
    expect(errors.join('\n')).toMatch(/topics-en-US\.xml: not a sitemap \(text\/html/);
  });

  it('fails when one published language has no URLs even though another has', async () => {
    const { previous, current } = files([], ['en-US', 'es-MX']);
    const { fetcher, submitted } = site(['en-US', 'es-MX'], () => new Response(null, { status: 200 }));
    const emptySpanish: Fetcher = async (input, init) =>
      /\/sitemaps\/[a-z]+-es-MX\.xml$/.test(input)
        ? new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', { headers: { 'content-type': 'application/xml' } })
        : fetcher(input, init);
    const errors: string[] = [];

    const code = await run(['changed', previous, current], { fetcher: emptySpanish, publicDir, log: () => undefined, error: (line) => errors.push(line), wait: async () => undefined });

    expect(code).toBe(1);
    expect(submitted).toHaveLength(0);
    expect(errors.join('\n')).toMatch(/sitemaps of es-MX list no URLs/);
  });

  it('retries a child sitemap that is still building', async () => {
    const { current } = files([], ['en-US']);
    const { fetcher, submitted } = site(['en-US'], () => new Response(null, { status: 200 }));
    let busy = 1;
    const building: Fetcher = async (input, init) => {
      if (input.endsWith('/sitemaps/topics-en-US.xml') && busy > 0) {
        busy -= 1;
        return new Response('busy', { status: 503 });
      }
      return fetcher(input, init);
    };
    const waits: number[] = [];

    expect(await run(['all', current], { fetcher: building, publicDir, ...quiet, wait: async (ms) => void waits.push(ms) })).toBe(0);
    expect(waits).toHaveLength(1);
    expect((submitted[0] as { urlList: string[] }).urlList).toContain('https://app.versemate.org/topic/events/the-creation-of-the-world');
  });

  it('fails with the status when IndexNow refuses or cannot be reached', async () => {
    const { current } = files([], ['en-US']);
    for (const answer of [() => new Response('bad key', { status: 403 }), () => Promise.reject(new Error('ECONNREFUSED'))]) {
      const errors: string[] = [];
      const { fetcher } = site(['en-US'], answer);

      expect(await run(['all', current], { fetcher, publicDir, log: () => undefined, error: (line) => errors.push(line) })).toBe(1);
      expect(errors.join('\n')).toMatch(/HTTP (403|0), submission failed: (bad key|.*ECONNREFUSED)/);
    }
  });
});
