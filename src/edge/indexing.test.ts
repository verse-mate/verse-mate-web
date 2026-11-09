// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createApi } from './api';
import { readConfig, type Language } from './config';
import { indexingFor, loadCoverage } from './indexing';
import { loadPage, matchPageRoute } from './pageData';
import { fakeData, installEdgeGlobals } from './testing/fakeEdge';

afterEach(() => vi.unstubAllGlobals());

const api = () => createApi('https://api.example.test', { cache: null, waitUntil: () => undefined });

async function indexing(path: string, lang: Language, indexed: unknown) {
  const published = readConfig({ ASSETS: null, INDEXED_LANGUAGES: indexed as string[] }).indexedLanguages;
  const page = await loadPage(api(), matchPageRoute(path)!.route, lang, published);
  return indexingFor(page, lang, published, await loadCoverage(api()));
}

describe('published languages', () => {
  it('keeps an unlisted language noindex and out of the alternates', async () => {
    installEdgeGlobals();

    expect(await indexing('/bible/john/3', 'es-MX', ['en-US'])).toMatchObject({ indexable: false, alternates: [] });
    expect(await indexing('/bible/john/3', 'en-US', ['en-US'])).toMatchObject({ indexable: true, alternates: ['en-US'] });
  });

  it('keeps a listed language noindex where it has no explanation for the chapter', async () => {
    installEdgeGlobals();

    expect(await indexing('/bible/john/3', 'ru', ['en-US', 'ru'])).toMatchObject({ indexable: false, alternates: [] });
    expect(await indexing('/bible/john/3', 'en-US', ['en-US', 'ru'])).toMatchObject({ alternates: ['en-US'] });
  });

  it('makes a language indexable and linked once the variable lists it', async () => {
    installEdgeGlobals();

    expect(await indexing('/bible/john/3', 'es-MX', '["en-US","es-MX"]')).toMatchObject({
      indexable: true,
      alternates: ['en-US', 'es-MX'],
    });
    expect(await indexing('/bible/john/3', 'en-US', ['en-US', 'es-MX'])).toMatchObject({ alternates: ['en-US', 'es-MX'] });
  });

  it('never marks a translation indexable while coverage cannot be read', async () => {
    for (const coverage of ['missing', 'down'] as const) {
      installEdgeGlobals(fakeData({ coverage }));

      expect(await indexing('/bible/john/3', 'es-MX', ['en-US', 'es-MX'])).toMatchObject({ indexable: false, alternates: [] });
      expect(await indexing('/bible/john/3', 'en-US', ['en-US', 'es-MX'])).toEqual({
        indexable: true,
        alternates: ['en-US'],
        complete: false,
      });
    }
  });

  it('counts an event or topic as explained in a language only when the text is not the English fallback', async () => {
    installEdgeGlobals();

    expect(await indexing('/jesus/event/event-baptism', 'es-MX', ['en-US', 'es-MX'])).toMatchObject({
      indexable: true,
      alternates: ['en-US', 'es-MX'],
    });
    expect(await indexing('/topic/events/the-creation-of-the-world', 'es-MX', ['en-US', 'es-MX'])).toMatchObject({
      indexable: false,
    });
    expect(await indexing('/topic/events/the-creation-of-the-world', 'en-US', ['en-US', 'es-MX'])).toMatchObject({
      indexable: true,
      alternates: ['en-US'],
    });
    expect(await indexing('/topic/events/the-fall-of-man', 'en-US', ['en-US'])).toMatchObject({ indexable: false });
  });
});
