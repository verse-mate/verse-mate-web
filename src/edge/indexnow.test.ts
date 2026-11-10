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

function site(published: string[], indexnow: (body: unknown) => Response | Promise<Response>) {
  installEdgeGlobals();
  const submitted: unknown[] = [];
  const fetcher: Fetcher = async (input, init) => {
    if (input === 'https://api.indexnow.org/indexnow') {
      const body = JSON.parse(String(init?.body));
      submitted.push(body);
      return indexnow(body);
    }
    const ctx = context();
    const response = await worker.fetch(new Request(input), edgeEnv({ INDEXED_LANGUAGES: published }), ctx);
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

  it('sends nothing when no language was added', async () => {
    const { previous, current } = files(['en-US', 'es-MX'], ['en-US']);
    const { fetcher, submitted } = site(['en-US'], () => new Response(null, { status: 202 }));

    expect(await run(['changed', previous, current], { fetcher, publicDir, ...quiet })).toBe(0);
    expect(submitted).toEqual([]);
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
