import { describe, expect, it } from 'vitest';
import { buildJesusByline, stripBylineHeader } from './jesusByline';
import type { Commentary, JesusEventPassage } from '@/services/types';

const passage = (over: Partial<JesusEventPassage> = {}): JesusEventPassage => ({
  book_id: 41,
  book_name: 'Mark',
  chapter: 4,
  verse_start: 35,
  verse_end: 41,
  is_primary: true,
  display: 'Mark 4:35-41',
  ...over,
});

const byline = (verse: number, detail = 'x'): Commentary => ({
  verse,
  summary: '',
  detail,
  type: 'byline',
});

describe('buildJesusByline', () => {
  it('keeps only the verses the event spans', () => {
    const rows = buildJesusByline(passage(), [
      byline(1),
      byline(34),
      byline(35),
      byline(39),
      byline(41),
      byline(42),
    ]);
    expect(rows.map((r) => r.verse)).toEqual([35, 39, 41]);
  });

  it('labels each row with the account it came from', () => {
    const [row] = buildJesusByline(passage(), [byline(39)]);
    expect(row.reference).toBe('Mark 4:39');
  });

  it('treats a null verse_start as the whole chapter', () => {
    // A chapter-level passage has no bounds, so every byline row belongs to it.
    const rows = buildJesusByline(
      passage({ verse_start: null, verse_end: null }),
      [byline(1), byline(20), byline(41)],
    );
    expect(rows).toHaveLength(3);
  });

  it('treats a null verse_end as a single verse', () => {
    const rows = buildJesusByline(
      passage({ verse_start: 12, verse_end: null }),
      [byline(11), byline(12), byline(13)],
    );
    expect(rows.map((r) => r.verse)).toEqual([12]);
  });

  it('ignores chapter-level and non-byline rows', () => {
    const rows = buildJesusByline(passage(), [
      { verse: 0, summary: '', detail: 'chapter summary', type: 'summary' },
      { verse: 39, summary: '', detail: 'summary row', type: 'summary' },
      byline(39),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].detail).toBe('x');
  });

  it('returns nothing without a passage', () => {
    expect(buildJesusByline(null, [byline(39)])).toEqual([]);
  });

  it('sorts into reading order regardless of API order', () => {
    const rows = buildJesusByline(passage(), [byline(41), byline(35), byline(39)]);
    expect(rows.map((r) => r.verse)).toEqual([35, 39, 41]);
  });

  it('attaches hydrated verse text when the passage carries it', () => {
    const rows = buildJesusByline(
      passage({ verses: [{ verse_number: 39, text: 'And he awoke and rebuked the wind…' }] }),
      [byline(39), byline(40)],
    );
    expect(rows[0].text).toBe('And he awoke and rebuked the wind…');
    expect(rows[1].text).toBeNull();
  });
});

describe('stripBylineHeader', () => {
  it('drops the ref heading, the verse blockquote and the Summary label', () => {
    const input = '# Mark 4:39\n\n> And he awoke and rebuked the wind.\n\n## Summary\n\nThe real body.';
    expect(stripBylineHeader(input)).toBe('The real body.');
  });

  it('leaves a body that has no header alone', () => {
    expect(stripBylineHeader('Just the body.')).toBe('Just the body.');
  });

  it('handles multi-word and numbered book names in the heading', () => {
    // "1 Corinthians 15:3" would leave the heading behind under a \S+ pattern.
    const input = '# 1 Corinthians 15:3\n\n> For I delivered to you…\n\nBody here.';
    expect(stripBylineHeader(input)).toBe('Body here.');
  });
});
