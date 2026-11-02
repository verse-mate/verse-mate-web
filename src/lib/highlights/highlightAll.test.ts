import { describe, expect, it } from 'vitest';
import {
  canHighlightAll,
  collectBookOccurrences,
  findPhraseOccurrences,
  highlightAllIds,
} from './highlightAll';

describe('findPhraseOccurrences', () => {
  it('finds whole words only, any case', () => {
    const text = 'I am the bread of life. Amos said, “I AM.” The lamb, I am.';
    expect(findPhraseOccurrences(text, 'I am').map(o => o.text)).toEqual(['I am', 'I AM', 'I am']);
    expect(findPhraseOccurrences(text, 'am').map(o => o.start)).toEqual([2, 38, 55]);
  });

  it('gives offsets into the verse text', () => {
    const text = 'In the beginning God created the heavens and the earth.';
    const [hit] = findPhraseOccurrences(text, 'heavens');
    expect(text.slice(hit.start, hit.end)).toBe('heavens');
  });

  it('matches across a run of spaces and either apostrophe', () => {
    expect(findPhraseOccurrences("the Lord’s  house", "Lord's house")).toHaveLength(1);
  });
});

describe('collectBookOccurrences', () => {
  it('returns hits in chapter order and lists unreadable chapters', async () => {
    const chapters: Record<number, { verseNumber: number; text: string }[] | null> = {
      1: [{ verseNumber: 1, text: 'light and light' }],
      2: null,
      3: [{ verseNumber: 4, text: 'the light shines' }],
    };
    const { occurrences, missingChapters } = await collectBookOccurrences({
      phrase: 'light',
      chapterCount: 3,
      loadChapter: async ch => {
        // Later chapters answer first: the result must still be in order.
        await new Promise(r => setTimeout(r, (4 - ch) * 2));
        return chapters[ch];
      },
    });
    expect(occurrences.map(o => [o.chapter, o.verse, o.start])).toEqual([
      [1, 1, 0],
      [1, 1, 10],
      [3, 4, 4],
    ]);
    expect(missingChapters).toEqual([2]);
  });
});

describe('canHighlightAll', () => {
  it('offers a short phrase in one verse only', () => {
    expect(canHighlightAll('I am', 6, 6)).toBe(true);
    expect(canHighlightAll('I am', 6, 7)).toBe(false);
    expect(canHighlightAll('one two three four five six seven', 6, 6)).toBe(false);
  });
});

describe('highlightAllIds', () => {
  const t0 = Date.parse('2026-11-02T10:00:00Z');
  const word = (id: string, text: string, secondsIn: number, extra: Record<string, unknown> = {}) => ({
    id,
    bookId: 1,
    color: 'green',
    startChar: 0,
    endChar: text.length,
    selectedText: text,
    createdAt: new Date(t0 + secondsIn * 1000).toISOString(),
    ...extra,
  });

  it('picks out a run of the same words saved together', () => {
    const ids = highlightAllIds([
      word('a', 'light', 0),
      word('b', 'Light', 1),
      word('c', 'light', 3),
      word('d', 'darkness', 2),
    ]);
    expect([...ids].sort()).toEqual(['a', 'b', 'c']);
  });

  it('leaves alone a single word, other colours, other books, and far-apart saves', () => {
    const ids = highlightAllIds([
      word('a', 'light', 0),
      word('b', 'light', 1, { color: 'blue' }),
      word('c', 'light', 2, { bookId: 2 }),
      word('d', 'light', 3600),
      word('e', 'light', 0, { startChar: null, endChar: null }),
    ]);
    expect(ids.size).toBe(0);
  });
});
