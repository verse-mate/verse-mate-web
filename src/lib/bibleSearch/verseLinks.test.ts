import { describe, expect, it } from 'vitest';
import { buildVerseUrl, parseVerseTarget } from './verseLinks';

describe('buildVerseUrl', () => {
  it('links a chapter, a verse, a range, and opens Insight on request', () => {
    expect(buildVerseUrl(40, 8)).toBe('/bible/matthew/8');
    expect(buildVerseUrl(40, 8, { start: 11 })).toBe('/bible/matthew/8?v=11');
    expect(buildVerseUrl(23, 43, { start: 5, end: 6, insight: true })).toBe(
      '/bible/isaiah/43?v=5-6&insight=1',
    );
  });

  it('ignores a range that ends where it starts', () => {
    expect(buildVerseUrl(43, 3, { start: 16, end: 16 })).toBe('/bible/john/3?v=16');
  });

  it('returns null for an unknown book', () => {
    expect(buildVerseUrl(99, 1)).toBeNull();
  });
});

describe('parseVerseTarget', () => {
  it('reads a verse, a range and the insight flag', () => {
    expect(parseVerseTarget('?v=11&insight=1')).toEqual({ start: 11, end: 11, insight: true });
    expect(parseVerseTarget('?v=5-6')).toEqual({ start: 5, end: 6, insight: false });
  });

  it('ignores anything else', () => {
    expect(parseVerseTarget('')).toBeNull();
    expect(parseVerseTarget('?v=abc')).toBeNull();
    expect(parseVerseTarget('?v=0')).toBeNull();
    expect(parseVerseTarget('?v=6-5')).toBeNull();
    expect(parseVerseTarget('?v=1;alert(1)')).toBeNull();
  });
});
