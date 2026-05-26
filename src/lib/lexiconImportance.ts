import type { LexEntry } from '@versemate/lexicon';

// Part-of-speech families that read as grammatical "glue" rather than
// meaningful vocabulary. Matched case-insensitively against the lexicon's
// free-form `pos` string, which is mostly clean ("Adverb", "Preposition",
// "Conjunction", "Particle", "Pronoun (demonstrative)", …) but also includes a
// handful of terse codes (e.g. "G:CONJ", "H:Neg", "G:PRT-N", "H:DemP"); the
// word-boundary alternation catches both forms. Content POS — Verb, Noun
// (masc./fem./neut.), Proper noun, Adjective — and anything unrecognized fall
// through to "underline" so distinctive words stay marked.
const FUNCTION_POS =
  /\b(adverb|preposition|conjunction|particle|pronoun|interjection|prefix|suffix|punct|conj|prt|neg|intj|intg|demp|cond)\b/i;

/**
 * Whether a lexicon word should be underlined. Only "content" words — nouns,
 * verbs, adjectives, proper nouns — get the dotted underline so it focuses on
 * meaningful vocabulary. Function/grammatical words (and the copula "to be",
 * i.e. was/were/is) stay tappable (the lexical card still opens) but render
 * without the underline.
 */
export function shouldUnderlineLexeme(entry: LexEntry): boolean {
  // The copula reads as glue, not vocabulary, but its POS is "Verb" (a content
  // tag). Both Hebrew הָיָה and Greek εἰμί gloss exactly as "to be".
  if (entry.basicGloss?.trim().toLowerCase() === 'to be') return false;
  if (FUNCTION_POS.test(entry.pos ?? '')) return false;
  return true;
}
