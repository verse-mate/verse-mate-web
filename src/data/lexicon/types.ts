// Layer 1 lexical data + per-occurrence contextual notes. Hand-curated for
// the James 1 prototype; structured to match what an automated MorphGNT +
// BSB-alignment ingest would emit so we can swap data sources later
// without rewriting the renderer.

export type LemmaKey = string; // stable ASCII slug, e.g. "logos"

export interface RelatedWord {
  lemma: string;     // Greek (Greek script): "λέγω"
  translit: string;  // "legō"
  note: string;      // "verb form — to speak, say"
}

export interface LexEntry {
  /** Greek lemma in Greek script. */
  lemma: string;
  /** English transliteration. */
  translit: string;
  /** Plain-English pronunciation hint. */
  pronunciation?: string;
  /** Strong's number with G/H prefix. */
  strongs: string;
  /** Part of speech (free-form, mirrors lexicon conventions). */
  pos: string;
  /** Concise gloss — never "X means Y," always "carries the sense of …". */
  basicGloss: string;
  /** Ordered list of senses across the NT — broadest to narrowest. */
  semanticRange?: string[];
  /** Total NT occurrences (helps the user judge how distinctive a word is). */
  ntFrequency?: number;
  /**
   * Theologically loaded words (logos, sarx, dikaiosynē, kosmos, agapē, …)
   * that get abused without context. The UI surfaces a "context-sensitive"
   * marker when this is true, and contextual glosses for these lemmas
   * should be pastorally reviewed before publishing.
   */
  loaded?: boolean;
  /** Cross-references to related lemmas (cognates, antonyms, common pairs). */
  related?: RelatedWord[];
  /** Long-form lexicon note shown in the expanded view. */
  notes?: string;
}

export interface AlignedToken {
  /**
   * English surface as it appears in the displayed translation, exactly as
   * rendered (case + punctuation preserved). Match is case-insensitive and
   * whole-word; multi-word entries (e.g. "double-minded") are matched as a
   * contiguous span.
   */
  surface: string;
  /** Lemma key into the chapter's lexicon map. */
  lemma: LemmaKey;
  /**
   * Optional per-occurrence contextual gloss. Falls back to the lexicon's
   * basicGloss when absent. Phrase it as "In this verse, X foregrounds Y" —
   * never "X means Y."
   */
  contextual?: string;
}

export interface ChapterAlignment {
  bookId: number;
  book: string;
  chapter: number;
  /** Translation key the surface forms were authored against (e.g. "ESV"). */
  version: string;
  /** verseNumber → ordered list of tokens to surface in that verse. */
  verses: Record<number, AlignedToken[]>;
  /** Lexicon entries keyed by lemma slug. */
  lexicon: Record<LemmaKey, LexEntry>;
  /**
   * Lemma keys that carry the chapter's central theme or argument.
   * The renderer gives these a more prominent visual treatment so the
   * chapter's spine reads at a glance; non-theme lemmas use a subtle
   * hairline underline that doesn't compete with the verse text.
   */
  themeLemmas?: LemmaKey[];
}
