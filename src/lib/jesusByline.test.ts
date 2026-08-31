import { describe, expect, it } from 'vitest';
import {
  buildJesusByline,
  buildJesusBylineSections,
  bylineChapters,
  stripBylineHeader,
} from './jesusByline';
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

describe('bylineChapters', () => {
  it('lists each chapter once, in passage order', () => {
    expect(
      bylineChapters([
        passage({ book_id: 40, book_name: 'Matthew', chapter: 4, display: 'Matthew 4:17' }),
        passage({ book_id: 41, book_name: 'Mark', chapter: 1, display: 'Mark 1:14-15' }),
        // A second account out of the same chapter must not be fetched twice.
        passage({ book_id: 41, book_name: 'Mark', chapter: 1, display: 'Mark 1:16-20' }),
      ]).map((c) => c.key),
    ).toEqual(['40:4', '41:1']);
  });
});

describe('buildJesusBylineSections', () => {
  const matthew = passage({
    book_id: 40, book_name: 'Matthew', chapter: 4,
    verse_start: 17, verse_end: 17, display: 'Matthew 4:17',
  });
  const mark = passage({
    book_id: 41, book_name: 'Mark', chapter: 1, is_primary: false,
    verse_start: 14, verse_end: 15, display: 'Mark 1:14-15',
  });

  it('covers every account, not only the primary one', () => {
    const sections = buildJesusBylineSections(
      [matthew, mark],
      new Map([
        ['40:4', [byline(17)]],
        ['41:1', [byline(14), byline(15)]],
      ]),
    );
    expect(sections.map((s) => s.display)).toEqual(['Matthew 4:17', 'Mark 1:14-15']);
    expect(sections[1].rows.map((r) => r.reference)).toEqual(['Mark 1:14', 'Mark 1:15']);
  });

  it('keeps an account whose chapter has no commentary, with no rows', () => {
    // The caller says "not generated yet" in place; dropping the section would
    // read as "Mark has nothing to explain here".
    const sections = buildJesusBylineSections([matthew, mark], new Map([['40:4', [byline(17)]]]));
    expect(sections).toHaveLength(2);
    expect(sections[1].rows).toEqual([]);
  });

  it('gives every row a key that is unique across accounts', () => {
    const sections = buildJesusBylineSections(
      [matthew, passage({ book_id: 42, book_name: 'Luke', chapter: 4, verse_start: 17, verse_end: 17, display: 'Luke 4:17' })],
      new Map([
        ['40:4', [byline(17)]],
        ['42:4', [byline(17)]],
      ]),
    );
    const keys = sections.flatMap((s) => s.rows.map((r) => r.key));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('prints a verse once when two accounts of one chapter overlap', () => {
    const sections = buildJesusBylineSections(
      [
        passage({ book_id: 41, book_name: 'Mark', chapter: 1, verse_start: 14, verse_end: 15, display: 'Mark 1:14-15' }),
        passage({ book_id: 41, book_name: 'Mark', chapter: 1, verse_start: 15, verse_end: 16, display: 'Mark 1:15-16' }),
      ],
      new Map([['41:1', [byline(14), byline(15), byline(16)]]]),
    );
    expect(sections[0].rows.map((r) => r.verse)).toEqual([14, 15]);
    expect(sections[1].rows.map((r) => r.verse)).toEqual([16]);
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
