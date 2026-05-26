import { describe, it, expect } from 'vitest';
import type { LexEntry } from '@versemate/lexicon';
import { shouldUnderlineLexeme } from './lexiconImportance';

function entry(partial: Partial<LexEntry>): LexEntry {
  return {
    lemma: 'x',
    translit: 'x',
    strongs: 'H0',
    pos: 'Noun',
    basicGloss: 'gloss',
    ...partial,
  } as LexEntry;
}

describe('shouldUnderlineLexeme', () => {
  it('underlines distinctive (low-frequency) OT words', () => {
    expect(shouldUnderlineLexeme(entry({ otFrequency: 80 }))).toBe(true); // darkness
    expect(shouldUnderlineLexeme(entry({ otFrequency: 3 }))).toBe(true); // void
  });

  it('does not underline common high-frequency OT glue words', () => {
    expect(shouldUnderlineLexeme(entry({ otFrequency: 2883 }))).toBe(false); // hayah → was/were
    expect(shouldUnderlineLexeme(entry({ otFrequency: 2565 }))).toBe(false); // elohim → God
    expect(shouldUnderlineLexeme(entry({ otFrequency: 5232 }))).toBe(false); // kol → all
  });

  it('uses NT frequency when OT frequency is absent', () => {
    expect(shouldUnderlineLexeme(entry({ ntFrequency: 319 }))).toBe(true); // logos
    expect(shouldUnderlineLexeme(entry({ ntFrequency: 2322 }))).toBe(false); // eimi → is
  });

  it('treats the threshold as exclusive', () => {
    expect(shouldUnderlineLexeme(entry({ otFrequency: 599 }))).toBe(true);
    expect(shouldUnderlineLexeme(entry({ otFrequency: 600 }))).toBe(false);
  });

  it('underlines words with unknown frequency (treated as distinctive)', () => {
    expect(shouldUnderlineLexeme(entry({}))).toBe(true);
  });
});
