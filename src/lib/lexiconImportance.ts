import type { LexEntry } from '@versemate/lexicon';

// Above this occurrence count a lemma reads as common "glue" (e.g. the copula
// "to be" → was/were, "all", "said", "God/Lord") rather than a distinctive
// word, so it stays tappable but loses the underline. Tuned against Genesis 1,
// where it keeps formless/void/deep/darkness/created and drops was/God/earth.
export const UNDERLINE_FREQ_MAX = 600;

/**
 * Whether a lexicon word should be underlined. We only underline distinctive
 * words so the dotted underlines highlight the meaningful vocabulary instead of
 * every aligned token. Common high-frequency lemmas — the copula "to be"
 * (was/were/is), "all", "said", "God/Lord", etc. — stay tappable but lose the
 * underline. Words with unknown frequency default to underlined (distinctive).
 */
export function shouldUnderlineLexeme(entry: LexEntry): boolean {
  const freq = entry.otFrequency ?? entry.ntFrequency;
  if (freq == null) return true;
  return freq < UNDERLINE_FREQ_MAX;
}
