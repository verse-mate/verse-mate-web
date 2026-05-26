import { describe, it, expect } from 'vitest';
import type { LexEntry } from '@versemate/lexicon';
import { shouldUnderlineLexeme } from './lexiconImportance';

function entry(partial: Partial<LexEntry>): LexEntry {
  return {
    lemma: 'x',
    translit: 'x',
    strongs: 'H0',
    pos: 'Noun (masc.)',
    basicGloss: 'gloss',
    ...partial,
  } as LexEntry;
}

describe('shouldUnderlineLexeme', () => {
  it('underlines content words (nouns, verbs, adjectives, proper nouns)', () => {
    expect(shouldUnderlineLexeme(entry({ pos: 'Noun (masc.)', basicGloss: 'God' }))).toBe(true);
    expect(shouldUnderlineLexeme(entry({ pos: 'Verb', basicGloss: 'to create' }))).toBe(true);
    expect(shouldUnderlineLexeme(entry({ pos: 'Adjective', basicGloss: 'good' }))).toBe(true);
    expect(shouldUnderlineLexeme(entry({ pos: 'Proper noun (person)', basicGloss: 'David' }))).toBe(true);
  });

  it('does not underline the copula "to be" (was/were/is) even though its POS is Verb', () => {
    expect(shouldUnderlineLexeme(entry({ pos: 'Verb', basicGloss: 'to be' }))).toBe(false);
    expect(shouldUnderlineLexeme(entry({ pos: 'Verb', basicGloss: 'To Be ' }))).toBe(false);
  });

  it('does not underline function/grammatical words', () => {
    expect(shouldUnderlineLexeme(entry({ pos: 'Adverb', basicGloss: 'so' }))).toBe(false);
    expect(shouldUnderlineLexeme(entry({ pos: 'Preposition', basicGloss: 'in' }))).toBe(false);
    expect(shouldUnderlineLexeme(entry({ pos: 'Conjunction', basicGloss: 'and' }))).toBe(false);
    expect(shouldUnderlineLexeme(entry({ pos: 'Particle', basicGloss: 'the' }))).toBe(false);
    expect(shouldUnderlineLexeme(entry({ pos: 'Pronoun (demonstrative)', basicGloss: 'this' }))).toBe(false);
  });

  it('treats terse function POS codes (G:CONJ, H:Neg, G:PRT-N) as function words', () => {
    expect(shouldUnderlineLexeme(entry({ pos: 'G:CONJ' }))).toBe(false);
    expect(shouldUnderlineLexeme(entry({ pos: 'H:Neg', basicGloss: 'not' }))).toBe(false);
    expect(shouldUnderlineLexeme(entry({ pos: 'G:PRT-N' }))).toBe(false);
  });

  it('underlines words with unrecognized POS (treated as content)', () => {
    expect(shouldUnderlineLexeme(entry({ pos: '?' }))).toBe(true);
    expect(shouldUnderlineLexeme(entry({ pos: 'H:N-M/F' }))).toBe(true);
  });
});
