import { InductiveStudy } from './types';
import { JAMES_1_STUDY } from './james-1';

const STUDIES: Record<string, InductiveStudy> = {
  '59:1': JAMES_1_STUDY,
};

/**
 * Look up the inductive study for a given book + chapter.
 * Returns null when no authored study exists for the chapter yet.
 * Keyed by `${bookId}:${chapter}`.
 */
export function getStudyFor(bookId: number, chapter: number): InductiveStudy | null {
  return STUDIES[`${bookId}:${chapter}`] ?? null;
}

export type { InductiveStudy } from './types';
