import { describe, expect, it } from 'vitest';
import { highlightsOverlap, rangeForTextOffsets, textOffsetWithin } from './charHighlights';

describe('highlightsOverlap', () => {
  it('compares characters within a verse', () => {
    const word = { startVerse: 3, endVerse: 3, startChar: 4, endChar: 9 };
    expect(highlightsOverlap(word, { startVerse: 3, endVerse: 3, startChar: 12, endChar: 15 })).toBe(false);
    expect(highlightsOverlap(word, { startVerse: 3, endVerse: 3, startChar: 8, endChar: 15 })).toBe(true);
  });

  it('treats a whole-verse extent as covering every character', () => {
    const word = { startVerse: 3, endVerse: 3, startChar: 4, endChar: 9 };
    expect(highlightsOverlap(word, { startVerse: 3, endVerse: 3 })).toBe(true);
    expect(highlightsOverlap(word, { startVerse: 4, endVerse: 5 })).toBe(false);
  });
});

describe('text offsets', () => {
  it('maps offsets across split text nodes and back', () => {
    const el = document.createElement('span');
    el.innerHTML = 'In the <button>beginning</button> God';
    const range = rangeForTextOffsets(el, 7, 16);
    expect(range?.toString()).toBe('beginning');
    const word = el.querySelector('button')!.firstChild!;
    expect(textOffsetWithin(el, word, 3)).toBe(10);
  });

  it('returns null past the end of the text', () => {
    const el = document.createElement('span');
    el.textContent = 'short';
    expect(rangeForTextOffsets(el, 2, 40)).toBeNull();
  });
});
