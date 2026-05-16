import { ChapterAlignment, LexEntry, LemmaKey } from './types';
import { LEXICON as HAND_LEXICON } from './lemmas';
import { JAMES_1_ALIGNMENT } from './james-1';
import { JAMES_2_ALIGNMENT } from './james-2';
import { JAMES_3_ALIGNMENT } from './james-3';
import { JAMES_4_ALIGNMENT } from './james-4';
import { JAMES_5_ALIGNMENT } from './james-5';
import { getBookSlug } from '@/lib/bookSlugs';

// Hand-curated alignments — preferred over generated when both exist.
// Keyed by `${bookId}:${chapter}`.
const HAND_ALIGNMENTS: Record<string, ChapterAlignment> = {
  '59:1': JAMES_1_ALIGNMENT,
  '59:2': JAMES_2_ALIGNMENT,
  '59:3': JAMES_3_ALIGNMENT,
  '59:4': JAMES_4_ALIGNMENT,
  '59:5': JAMES_5_ALIGNMENT,
};

// Books that have generated alignment data (run scripts/lexicon-ingest/build.py
// to extend this list). Vite's import.meta.glob discovers every chapter file
// at build time but each only loads when its key is dereferenced.
const generatedChapterLoaders = import.meta.glob<{ default: GeneratedAlignment }>(
  './generated/*-*.json',
);

interface GeneratedAlignment {
  bookId: number;
  book: string;
  chapter: number;
  version: string;
  verses: Record<string, { surface: string; lemma: string }[]>;
  themeLemmas?: string[];
}

type GeneratedLexicon = Record<LemmaKey, LexEntry>;

/**
 * Per-occurrence contextual glosses for loaded NT lemmas — Phase 3 data.
 * Keyed by `<book-slug>:<chapter>:<verse>:<lemma>`. When a token in a
 * generated alignment has an entry here, the popover's "In this verse"
 * section appears; otherwise the card shows Layer 1 only.
 */
type ContextualGlosses = Record<string, string>;

// Cache: the global generated lemmas table is downloaded once, the
// first time any generated chapter is opened. ~190KB compressed.
let generatedLexiconPromise: Promise<GeneratedLexicon> | null = null;
function loadGeneratedLexicon(): Promise<GeneratedLexicon> {
  if (!generatedLexiconPromise) {
    generatedLexiconPromise = import('./generated/_lemmas.json').then(
      (m) => m.default as GeneratedLexicon,
    );
  }
  return generatedLexiconPromise;
}

let contextualPromise: Promise<ContextualGlosses> | null = null;
function loadContextual(): Promise<ContextualGlosses> {
  if (!contextualPromise) {
    contextualPromise = import('./generated/_contextual.json').then((m) => {
      // The _meta key in the JSON is informational only — strip it before
      // the data is consumed by the renderer so it never accidentally
      // matches a lemma lookup.
      const { _meta, ...rest } = m.default as ContextualGlosses & { _meta?: unknown };
      void _meta;
      return rest as ContextualGlosses;
    });
  }
  return contextualPromise;
}

// Cache: alignments by `${bookId}:${chapter}` — synchronous lookup after
// the first async load resolves. Hand-curated chapters are seeded here
// at module init so they hit immediately without an await.
const alignmentCache: Map<string, ChapterAlignment> = new Map(
  Object.entries(HAND_ALIGNMENTS),
);

/**
 * Async lookup. Hand-curated chapters return synchronously (via resolved
 * promise). Generated chapters lazy-load their per-chapter JSON + (on
 * first hit) the shared lemmas file, then merge with hand-curated
 * overrides so theologically loaded words keep their richer entries.
 */
export async function loadAlignmentFor(
  bookId: number,
  chapter: number,
): Promise<ChapterAlignment | null> {
  const key = `${bookId}:${chapter}`;
  const cached = alignmentCache.get(key);
  if (cached) return cached;

  const slug = getBookSlug(bookId);
  if (!slug) return null;
  const loaderKey = `./generated/${slug}-${chapter}.json`;
  const loader = generatedChapterLoaders[loaderKey];
  if (!loader) return null;

  const [chapterMod, generatedLexicon, contextual] = await Promise.all([
    loader(),
    loadGeneratedLexicon(),
    loadContextual(),
  ]);
  const raw = chapterMod.default;
  // Hand-curated entries win on collision — preserves the rich James-1
  // contextual glosses + semantic ranges for words like λόγος, ὑπομονή.
  const mergedLexicon: Record<LemmaKey, LexEntry> = {
    ...generatedLexicon,
    ...HAND_LEXICON,
  };

  // Inject per-occurrence contextual glosses for loaded lemmas. Keyed by
  // `<book-slug>:<chapter>:<verse>:<lemma>`. Tokens without a match keep
  // their generated-only Layer 1 card (no "In this verse" section).
  const mergedVerses: ChapterAlignment['verses'] = {};
  for (const [verseStr, tokens] of Object.entries(raw.verses)) {
    mergedVerses[Number(verseStr)] = (tokens as { surface: string; lemma: string }[]).map(
      (t) => {
        const k = `${slug}:${raw.chapter}:${verseStr}:${t.lemma}`;
        return contextual[k] ? { ...t, contextual: contextual[k] } : t;
      },
    );
  }

  const alignment: ChapterAlignment = {
    bookId: raw.bookId,
    book: raw.book,
    chapter: raw.chapter,
    version: raw.version,
    verses: mergedVerses,
    lexicon: mergedLexicon,
    themeLemmas: raw.themeLemmas,
  };
  alignmentCache.set(key, alignment);
  return alignment;
}

export type { ChapterAlignment, LexEntry, AlignedToken, LemmaKey } from './types';
