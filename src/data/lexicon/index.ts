import { ChapterAlignment } from './types';
import { JAMES_1_ALIGNMENT } from './james-1';
import { JAMES_2_ALIGNMENT } from './james-2';
import { JAMES_3_ALIGNMENT } from './james-3';
import { JAMES_4_ALIGNMENT } from './james-4';
import { JAMES_5_ALIGNMENT } from './james-5';

// Keyed by `${bookId}:${chapter}` — same shape as data/studies/index.ts.
// All five James chapters share a single lexicon (lemmas.ts) imported by
// each chapter's alignment file.
const ALIGNMENTS: Record<string, ChapterAlignment> = {
  '59:1': JAMES_1_ALIGNMENT,
  '59:2': JAMES_2_ALIGNMENT,
  '59:3': JAMES_3_ALIGNMENT,
  '59:4': JAMES_4_ALIGNMENT,
  '59:5': JAMES_5_ALIGNMENT,
};

export function getAlignmentFor(
  bookId: number,
  chapter: number,
): ChapterAlignment | null {
  return ALIGNMENTS[`${bookId}:${chapter}`] ?? null;
}

export type { ChapterAlignment, LexEntry, AlignedToken, LemmaKey } from './types';
