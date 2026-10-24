/**
 * Translated lemma cards: fetchLemmaCard must hit /lemma/:strongs?lang=,
 * cache hits (and 404 misses) so repeat taps are free, NOT cache transient
 * failures, and map the snake_case API shape onto the bundled LexEntry shape.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchLemmaCard, apiCardToLexEntry, type ApiLemmaCard } from './lemmaApi';

const ORIGINAL_FETCH = global.fetch;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

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

const SPANISH_CARD: ApiLemmaCard = {
  strongs: 'G2385',
  lemma: 'Ἰάκωβος',
  translit: 'Iakōbos',
  pronunciation: "ee-ak'-o-bos",
  nt_frequency: 42,
  ot_frequency: 0,
  loaded: true,
  pos: 'Sustantivo (masc.)',
  basic_gloss: 'Santiago',
  semantic_range: ['Hijo de Zebedeo'],
  notes: 'Apóstol, hermano de Juan.',
  related: [{ translit: 'Joannes', note: 'hermano' }],
  language_code: 'es',
  source: 'llm:claude-haiku-4-5',
  is_translated: true,
};

describe('fetchLemmaCard', () => {
  it('fetches /lemma/:strongs?lang= and returns the parsed card', async () => {
    mockFetch(() => jsonResponse(SPANISH_CARD));

    const card = await fetchLemmaCard('G2385', 'es');

    expect(card?.basic_gloss).toBe('Santiago');
    expect(card?.is_translated).toBe(true);
    expect(urls).toHaveLength(1);
    expect(urls[0]).toContain('/lemma/G2385');
    expect(urls[0]).toContain('lang=es');
  });

  it('caches a successful result — a repeat tap makes no second request', async () => {
    mockFetch(() => jsonResponse({ ...SPANISH_CARD, strongs: 'G0026' }));

    await fetchLemmaCard('G0026', 'es');
    const second = await fetchLemmaCard('G0026', 'es');

    expect(second?.strongs).toBe('G0026');
    expect(urls).toHaveLength(1); // served from cache
  });

  it('returns null and caches the miss on 404 (never retries)', async () => {
    mockFetch(() => jsonResponse({ error: 'not found' }, 404));

    expect(await fetchLemmaCard('G9999', 'es')).toBeNull();
    expect(await fetchLemmaCard('G9999', 'es')).toBeNull();
    expect(urls).toHaveLength(1); // 404 cached, no second fetch
  });

  it('returns null WITHOUT caching on a transient error (allows retry)', async () => {
    mockFetch(() => jsonResponse({ error: 'boom' }, 500));
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(await fetchLemmaCard('G1500', 'es')).toBeNull();
    expect(await fetchLemmaCard('G1500', 'es')).toBeNull();
    expect(urls).toHaveLength(2); // not cached — both taps hit the network
  });

  it('keys the cache by language — same lemma in another language refetches', async () => {
    mockFetch((url) =>
      jsonResponse({ ...SPANISH_CARD, strongs: 'G0080', language_code: url.includes('lang=de') ? 'de' : 'es' }),
    );

    const es = await fetchLemmaCard('G0080', 'es');
    const de = await fetchLemmaCard('G0080', 'de');

    expect(es?.language_code).toBe('es');
    expect(de?.language_code).toBe('de');
    expect(urls).toHaveLength(2);
  });
});

describe('apiCardToLexEntry', () => {
  it('maps snake_case fields onto the LexEntry shape', () => {
    const entry = apiCardToLexEntry(SPANISH_CARD);
    expect(entry.basicGloss).toBe('Santiago');
    expect(entry.pos).toBe('Sustantivo (masc.)');
    expect(entry.ntFrequency).toBe(42);
    expect(entry.pronunciation).toBe("ee-ak'-o-bos");
    expect(entry.semanticRange).toEqual(['Hijo de Zebedeo']);
    // `related` is merged by the popover (it restores the Greek script), so
    // the mapper deliberately omits it.
    expect(entry.related).toBeUndefined();
  });

  it('omits null and empty fields so the bundled English shows through', () => {
    const sparse: ApiLemmaCard = {
      ...SPANISH_CARD,
      pronunciation: null,
      semantic_range: [],
      notes: null,
      nt_frequency: null,
      ot_frequency: null,
    };
    const entry = apiCardToLexEntry(sparse);
    expect(entry.basicGloss).toBe('Santiago');
    expect('pronunciation' in entry).toBe(false);
    expect('semanticRange' in entry).toBe(false);
    expect('notes' in entry).toBe(false);
    expect('ntFrequency' in entry).toBe(false);
    expect('otFrequency' in entry).toBe(false);
  });

  it('defaults a word with no backend text to the bundled English definition', () => {
    // Outside the ~2,200 `loaded` lemmas the backend stores no prose in any
    // language, so the card arrives bare.
    const bare: ApiLemmaCard = {
      ...SPANISH_CARD,
      strongs: 'H5483',
      lemma: 'סוּס',
      translit: 'sus',
      pronunciation: null,
      loaded: false,
      pos: null,
      basic_gloss: null,
      semantic_range: null,
      notes: null,
      related: null,
      language_code: 'en',
      source: null,
      is_translated: false,
    };
    const bundled = {
      lemma: 'סוּס',
      translit: 'sus',
      strongs: 'H5483',
      pos: 'Noun (masc.)',
      basicGloss: 'horse',
      semanticRange: ['horse, esp. war or chariot horse'],
      notes: 'In Israel\'s world the horse is mainly a weapon of war.',
    };
    const merged = { ...bundled, ...apiCardToLexEntry(bare) };
    expect(merged.basicGloss).toBe('horse');
    expect(merged.pos).toBe('Noun (masc.)');
    expect(merged.semanticRange).toEqual(['horse, esp. war or chariot horse']);
    expect(merged.notes).toContain('weapon of war');
  });
});
