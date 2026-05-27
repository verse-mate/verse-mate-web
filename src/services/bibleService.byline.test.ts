/**
 * By Line parsing must work for every language, not just English. The byline
 * markdown headings carry localized book names ("## Génesis 1:1", "## 創世記
 * 1:1"); an ASCII-only heading regex silently dropped every verse for any
 * language whose book names aren't plain ASCII.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchCommentary } from './bibleService';

const ORIGINAL_FETCH = global.fetch;

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

const BOOKS = { books: [{ bookId: 1, name: 'Genesis', testament: 'OT', chapters: [{}] }] };

function explanationResponse(text: string): Response {
  return jsonResponse({ explanation: { explanation: text, explanation_id: 7 } });
}

/** Route /bible/books and the byline explanation; everything else is empty. */
function mockBylineMarkdown(byline: string) {
  global.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/bible/books')) return jsonResponse(BOOKS);
    if (url.includes('explanationType=byline')) return explanationResponse(byline);
    return explanationResponse('');
  }) as typeof global.fetch;
}

afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
});

describe('fetchCommentary — By Line parsing across languages', () => {
  it('parses headings with accented (Latin-1) book names — Spanish', async () => {
    mockBylineMarkdown(
      [
        '## Génesis 1:1',
        '> En el principio creó Dios…',
        '### Resumen',
        'La apertura.',
        '',
        '## Génesis 1:2',
        '> Y la tierra estaba desordenada…',
        '### Resumen',
        'El segundo versículo.',
      ].join('\n')
    );

    // Distinct chapter per test avoids the module-level explanation cache.
    const byline = (await fetchCommentary('Genesis', 1)).filter((c) => c.type === 'byline');
    expect(byline.map((c) => c.verse)).toEqual([1, 2]);
    expect(byline[0]?.detail).toContain('En el principio');
  });

  it('parses headings with non-Latin book names — Japanese', async () => {
    mockBylineMarkdown(['## 創世記 1:1', '> 初めに、神は…', '', '## 創世記 1:2', '> 地は混沌であって…'].join('\n'));

    const byline = (await fetchCommentary('Genesis', 2)).filter((c) => c.type === 'byline');
    expect(byline.map((c) => c.verse)).toEqual([1, 2]);
  });

  it('still parses plain ASCII headings, including numbered book names', async () => {
    mockBylineMarkdown(['## 1 Corinthians 13:4', '> Love is patient…', '', '## 1 Corinthians 13:5', '> It does not…'].join('\n'));

    const byline = (await fetchCommentary('Genesis', 3)).filter((c) => c.type === 'byline');
    expect(byline.map((c) => c.verse)).toEqual([4, 5]);
  });
});
