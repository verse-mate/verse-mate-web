// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import { vi } from 'vitest';

import worker from '../../worker.js';
import { createApi } from './api';
import { loadPage, matchPageRoute } from './pageData';
import { context, edgeEnv, fakeData, installEdgeGlobals, SHELL } from './testing/fakeEdge';

afterEach(() => vi.unstubAllGlobals());

const api = () => createApi('https://api.example.test', { cache: null, waitUntil: () => undefined });
const route = (path: string) => matchPageRoute(path)!.route;

describe('page data for each route kind', () => {
  it('maps a chapter to its book, verses and explanations in the page language', async () => {
    const { api: fake } = installEdgeGlobals();

    const page = await loadPage(api(), route('/bible/john/3'), 'es-MX');

    expect(page).toMatchObject({ kind: 'chapter', path: '/bible/john/3', bookId: 43, bookName: 'John', chapter: 3 });
    expect(page.kind === 'chapter' && page.verses.find((v) => v.number === 16)?.text).toContain('For God so loved');
    expect(page.kind === 'chapter' && page.summary).toContain('Resumen de Juan 3');
    expect(page.kind === 'chapter' && page.byline).toContain('Análisis de Juan 3');
    expect(fake.calls).toContain('/bible/book/43/3?bible_version=NASB1995');
  });

  it('maps a Jesus event to its title, passages and explanation', async () => {
    installEdgeGlobals();

    const page = await loadPage(api(), route('/jesus/event/event-baptism'), 'en-US');

    expect(page).toMatchObject({
      kind: 'event',
      path: '/jesus/event/event-baptism',
      title: 'The baptism of Jesus',
      passages: ['Matthew 3:13-17', 'Mark 1:9-11'],
    });
    expect(page.kind === 'event' && page.explanation).toContain('Jesus comes from Nazareth');
  });

  it('resolves a topic by the slug the reader links to', async () => {
    installEdgeGlobals();

    const page = await loadPage(api(), route('/topic/events/the-creation-of-the-world'), 'en-US');

    expect(page).toMatchObject({
      kind: 'topic',
      path: '/topic/events/the-creation-of-the-world',
      title: 'The Creation of the World',
      sections: [{ subtitle: 'The Six Days of Creation', references: ['Genesis 1', 'Genesis 2:1-3'] }],
    });
    expect(page.kind === 'topic' && page.explanation).toContain('God alone created all things');
  });

  it('finds nothing for an unknown book, chapter, event, topic or category', async () => {
    installEdgeGlobals();

    for (const path of [
      '/bible/notabook/1',
      '/bible/john/999',
      '/bible/john/0',
      '/bible/john/3x',
      '/jesus/event/no-such-event',
      '/topic/events/no-such-topic',
      '/topic/nonsense/the-creation-of-the-world',
    ])
      expect(await loadPage(api(), route(path), 'en-US'), path).toBeNull();
  });
});

describe('legacy chapter links', () => {
  it('still redirect to the slug URL with the shared book map', async () => {
    for (const path of ['/?bookId=43&verseId=3', '/bible/43/3']) {
      const response = await worker.fetch(new Request(`https://app.versemate.org${path}`), edgeEnv(), context());
      expect(response.status, path).toBe(301);
      expect(response.headers.get('location'), path).toBe('https://app.versemate.org/bible/john/3');
    }
  });
});

describe('pages that do not exist', () => {
  const get = (path: string) => worker.fetch(new Request(`https://app.versemate.org${path}`), edgeEnv(), context());

  for (const path of ['/bible/john/999', '/bible/notabook/1', '/jesus/event/no-such-event', '/topic/events/no-such-topic']) {
    it(`answers ${path} with 404, noindex and the reader shell`, async () => {
      installEdgeGlobals();

      const response = await get(path);

      expect(response.status).toBe(404);
      expect(response.headers.get('x-robots-tag')).toBe('noindex');
      expect(await response.text()).toBe(SHELL);
    });
  }

  it('answers with the shell and 200 when the API is down', async () => {
    installEdgeGlobals(fakeData({ down: true }));

    const response = await get('/bible/john/3');

    expect(response.status).toBe(200);
    expect(await response.text()).toBe(SHELL);
  });

  it('answers with the shell when the API never answers', async () => {
    installEdgeGlobals();
    const stalled = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(init.signal.reason))),
    );
    vi.stubGlobal('fetch', stalled);
    const started = Date.now();

    const response = await get('/bible/john/3');

    expect(stalled).toHaveBeenCalled();
    expect(Date.now() - started).toBeLessThan(4000);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe(SHELL);
  }, 10_000);
});
