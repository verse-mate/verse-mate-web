import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Serve the real dictionary files from public/ so the test covers the data
// the app ships, not a fixture that could drift from it.
const PUBLIC = path.resolve(__dirname, '../../public');

describe('lookupEnglishWord', () => {
  let lookupEnglishWord: typeof import('./englishDictionary').lookupEnglishWord;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        try {
          const body = readFileSync(path.join(PUBLIC, url), 'utf8');
          return new Response(body, { status: 200 });
        } catch {
          return new Response('not found', { status: 404 });
        }
      }),
    );
    ({ lookupEnglishWord } = await import('./englishDictionary'));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('answers from Easton’s first ("flood", Psalm 90:5)', async () => {
    const r = await lookupEnglishWord('flood,');
    expect(r?.source).toBe('easton');
    expect(r?.term).toBe('Flood');
    expect(r?.scriptureRefs).toContain('Genesis 7');
  });

  it('falls back to Webster’s', async () => {
    const r = await lookupEnglishWord('anew');
    expect(r?.source).toBe('webster');
    expect(r?.definition).toMatch(/again/i);
  });

  it('follows a Webster’s inflection pointer to its headword', async () => {
    const r = await lookupEnglishWord('swept');
    expect(r?.source).toBe('webster');
    expect(r?.formOf).toBe('imp. & p. p. of Sweep.');
    expect(r?.definition).toMatch(/broom/);
  });

  it('does not treat a real "… of …" definition as a pointer', async () => {
    const r = await lookupEnglishWord('anatomization');
    expect(r?.formOf).toBeUndefined();
    expect(r?.definition).toMatch(/^The act of anatomizing/);
  });

  it('tries the singular when the plural is missing ("sprouts")', async () => {
    const r = await lookupEnglishWord('sprouts');
    expect(r).not.toBeNull();
    expect(r?.term.toLowerCase()).toBe('sprout');
  });

  it('still finds biblical spelling variants, after exact lookups miss', async () => {
    const r = await lookupEnglishWord('Zaccheus');
    expect(r?.source).toBe('easton');
    expect(r?.term).toMatch(/^Zacch/);
  });

  it('returns null for non-words', async () => {
    expect(await lookupEnglishWord('')).toBeNull();
    expect(await lookupEnglishWord('42')).toBeNull();
  });
});
