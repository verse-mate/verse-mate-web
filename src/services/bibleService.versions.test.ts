/**
 * Multi-version support: fetchChapter must send the selected version as
 * `bible_version`, and fetchBibleVersions must normalize the discovery
 * endpoint, backfill license/attribution from the static catalog, and fall
 * back to that catalog when the endpoint is empty or unreachable.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchChapter, fetchBibleVersions } from './bibleService';
import { bibleVersions } from '@/constants/bible-versions';

const ORIGINAL_FETCH = global.fetch;

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

const BOOKS = { books: [{ bookId: 1, name: 'Genesis', testament: 'OT', chapters: [{}] }] };

let urls: string[] = [];

function mockFetch(router: (url: string) => Response | Promise<Response>) {
  urls = [];
  global.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    urls.push(url);
    return router(url);
  }) as typeof global.fetch;
}

afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
});

describe('fetchChapter', () => {
  it('sends the version as the bible_version query param', async () => {
    mockFetch((url) => {
      if (url.includes('/bible/books')) return jsonResponse(BOOKS);
      return jsonResponse({
        book: { bookId: 1, name: 'Genèse', chapters: [{ verses: [{ verseNumber: 1, text: 'Au commencement…' }] }] },
      });
    });

    const ch = await fetchChapter('Genesis', 1, 'LSG');
    const chapterUrl = urls.find((u) => u.includes('/bible/book/1/1'));
    expect(chapterUrl).toContain('bible_version=LSG');
    // Localized book name flows through from the response.
    expect(ch.book).toBe('Genèse');
    expect(ch.verses[0]?.text).toBe('Au commencement…');
  });
});

describe('fetchBibleVersions', () => {
  it('normalizes the discovery payload and backfills missing attribution', async () => {
    mockFetch(() =>
      jsonResponse({
        versions: [
          // CC version with attribution not yet populated by the API.
          { version_key: 'SCH51', version_name: 'Schlachter-Bibel 1951', language_code: 'de', license: 'CC BY 4.0', license_url: null, attribution: null, testament_coverage: 'full' },
          // Synthetic NT-only entry to exercise the coverage passthrough.
          { version_key: 'XYZNT', version_name: 'Example NT', language_code: 'xx', license: 'Public Domain', license_url: null, attribution: null, testament_coverage: 'nt' },
        ],
      })
    );

    const versions = await fetchBibleVersions();
    const sch = versions.find((v) => v.key === 'SCH51');
    const ntOnly = versions.find((v) => v.key === 'XYZNT');

    expect(sch?.value).toBe('Schlachter-Bibel 1951 (SCH51)');
    // Attribution backfilled from the static catalog when the API returns null.
    expect(sch?.attribution).toMatch(/CC BY 4\.0/);
    expect(ntOnly?.testamentCoverage).toBe('nt');
  });

  it('falls back to the static catalog when the endpoint is empty', async () => {
    mockFetch(() => jsonResponse({ versions: [] }));
    const versions = await fetchBibleVersions();
    expect(versions).toBe(bibleVersions);
  });

  it('falls back to the static catalog when the endpoint errors', async () => {
    mockFetch(() => new Response('boom', { status: 500 }));
    const versions = await fetchBibleVersions();
    expect(versions).toBe(bibleVersions);
  });
});
