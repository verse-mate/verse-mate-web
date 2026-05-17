import { InductiveStudy } from './types';
import { JAMES_1_STUDY } from './james-1';
import { JAMES_2_STUDY } from './james-2';
import { JAMES_3_STUDY } from './james-3';
import { JAMES_4_STUDY } from './james-4';
import { JAMES_5_STUDY } from './james-5';
import { FIRST_JOHN_1_STUDY } from './1-john-1';
import { FIRST_JOHN_2_STUDY } from './1-john-2';
import { FIRST_JOHN_3_STUDY } from './1-john-3';
import { FIRST_JOHN_4_STUDY } from './1-john-4';
import { FIRST_JOHN_5_STUDY } from './1-john-5';

const STUDIES: Record<string, InductiveStudy> = {
  '59:1': JAMES_1_STUDY,
  '59:2': JAMES_2_STUDY,
  '59:3': JAMES_3_STUDY,
  '59:4': JAMES_4_STUDY,
  '59:5': JAMES_5_STUDY,
  '62:1': FIRST_JOHN_1_STUDY,
  '62:2': FIRST_JOHN_2_STUDY,
  '62:3': FIRST_JOHN_3_STUDY,
  '62:4': FIRST_JOHN_4_STUDY,
  '62:5': FIRST_JOHN_5_STUDY,
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
