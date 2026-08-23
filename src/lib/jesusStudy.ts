import type { InductiveStudy } from '@versemate/studies';
import type {
  StepBullets,
  StepContrasts,
  StepKeywords,
  StepLists,
  StepQA,
  StepSegments,
  StudyApplication,
  StudyMovement,
  StudyStep,
} from '@versemate/studies/types';
import type { JesusEventPassage } from '@/services/types';

/**
 * Narrow a chapter's inductive study down to the verses a Jesus event spans.
 *
 * Same move as `lib/jesusByline`: there is no event-scoped study content and
 * there doesn't need to be. The Precept study tags almost everything it says
 * with a verse reference — movement ranges, application ranges, list rows,
 * contrast pairings, keyword inventories, the ref-tagged bullets — and an
 * event knows the verses it covers. Keeping only the parts that touch those
 * verses turns the Luke 2 study into a study of Luke 2:41-52.
 *
 * Two rules keep the result honest:
 *
 *  1. Nothing is invented. Every line rendered came from the chapter study.
 *  2. A step whose content carries no verse tags (prayer, the 5 W's, the
 *     chapter theme) is kept whole and marked chapter-scope rather than
 *     dropped — the reader still gets the nine-step spine, and the UI says
 *     plainly which cards are chapter context rather than passage detail.
 */

// ─── Verse references ────────────────────────────────────────────────────

export interface VerseRef {
  chapter: number;
  start: number;
  end: number;
}

export interface EventVerseSpan {
  bookId: number;
  bookName: string;
  chapter: number;
  /** null = the passage covers the whole chapter. */
  start: number | null;
  end: number | null;
  /** "Luke 2:41-52" — what the scope note shows. */
  display: string;
}

/** Highest verse number in any chapter (Psalm 119) — a sanity bound on parses. */
const MAX_VERSE = 176;

/**
 * Drop parenthetical asides that are not verse references, so `×2` counts and
 * Greek glosses can't be mistaken for verse numbers. `(2:1-7)` and `(41-52)`
 * survive because segment titles carry their range that way.
 */
function stripNonRefParens(text: string): string {
  return text.replace(/\([^()]*\)/g, (group) =>
    /\d+\s*:\s*\d+/.test(group) || /^\(\s*\d+(?:\s*[-–—]\s*\d+)?\s*\)$/.test(group) ? group : ' ',
  );
}

const REF_TOKEN = /(\d+)\s*:\s*(\d+)(?:\s*[-–—]\s*(\d+))?|(\d+)(?:\s*[-–—]\s*(\d+))?/g;

/**
 * Pull every verse reference out of a study's ref field.
 *
 * Handles the shapes the generator emits: `2:41-52`, `2:19, 51`,
 * `2:11 (soter); 2:30 (soterion)`, `2:9 (×2), 11, 15`, and the bare `41-52`.
 * A bare number inherits the chapter of the last qualified reference in the
 * same string, or `fallbackChapter` when there wasn't one.
 *
 * @param qualifiedOnly  ignore bare numbers that have no chapter context —
 *   used for free-text fields (segment titles) where a stray number would
 *   otherwise read as a verse.
 */
export function parseVerseRefs(
  text: string | null | undefined,
  fallbackChapter: number,
  qualifiedOnly = false,
): VerseRef[] {
  if (!text) return [];
  const cleaned = stripNonRefParens(text);
  const refs: VerseRef[] = [];
  let context: number | null = null;
  REF_TOKEN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = REF_TOKEN.exec(cleaned))) {
    const [, qChapter, qStart, qEnd, bareStart, bareEnd] = match;
    let chapter: number;
    let start: number;
    let end: number;
    if (qChapter) {
      chapter = Number(qChapter);
      start = Number(qStart);
      end = qEnd ? Number(qEnd) : start;
      context = chapter;
    } else {
      if (context == null && qualifiedOnly) continue;
      chapter = context ?? fallbackChapter;
      start = Number(bareStart);
      end = bareEnd ? Number(bareEnd) : start;
    }
    if (!start || start > MAX_VERSE || end > MAX_VERSE || end < start) continue;
    refs.push({ chapter, start, end });
  }
  return refs;
}

/** Does a parsed reference land inside the event's verses? */
export function refTouchesSpan(ref: VerseRef, span: EventVerseSpan): boolean {
  if (ref.chapter !== span.chapter) return false;
  if (span.start == null) return true;
  const end = span.end ?? span.start;
  return ref.end >= span.start && ref.start <= end;
}

function touches(
  text: string | null | undefined,
  span: EventVerseSpan,
  qualifiedOnly = false,
): boolean {
  const refs = parseVerseRefs(text, span.chapter, qualifiedOnly);
  return refs.some((ref) => refTouchesSpan(ref, span));
}

/** The verses an event covers, taken from the account being read. */
export function eventVerseSpan(passage: JesusEventPassage | null | undefined): EventVerseSpan | null {
  if (!passage) return null;
  return {
    bookId: passage.book_id,
    bookName: passage.book_name,
    chapter: passage.chapter,
    start: passage.verse_start,
    end: passage.verse_end ?? passage.verse_start,
    display: passage.display || `${passage.book_name} ${passage.chapter}`,
  };
}

/** "2:41-52" — the range pill shown next to the scope note. */
export function spanRangeLabel(span: EventVerseSpan): string {
  if (span.start == null) return `${span.chapter}`;
  const end = span.end ?? span.start;
  return end > span.start
    ? `${span.chapter}:${span.start}-${end}`
    : `${span.chapter}:${span.start}`;
}

// ─── Narrowing ───────────────────────────────────────────────────────────

export interface NarrowedStudy {
  /** The chapter study with every ref-tagged section filtered to the event. */
  study: InductiveStudy;
  /**
   * Steps kept whole because their content carries no verse tags (or none
   * that touch the event). Rendered with a "chapter context" badge.
   */
  chapterScopedSteps: Set<number>;
  /** True when at least one section actually narrowed to the event. */
  narrowed: boolean;
  /** How much of the chapter study this event's verses account for. */
  kept: { movements: number; questions: number };
  total: { movements: number; questions: number };
}

function narrowKeywords(step: StepKeywords, span: EventVerseSpan): StepKeywords | null {
  const inventory = step.inventory.filter((row) => touches(row.verses, span));
  return inventory.length ? { ...step, inventory } : null;
}

function narrowLists(step: StepLists, span: EventVerseSpan): StepLists | null {
  const lists = step.lists
    .map((list) => ({ ...list, rows: list.rows.filter((row) => touches(row.ref, span)) }))
    .filter((list) => list.rows.length > 0);
  return lists.length ? { ...step, lists } : null;
}

function narrowContrasts(step: StepContrasts, span: EventVerseSpan): StepContrasts | null {
  const items = step.items.filter((item) => touches(item.verses, span));
  return items.length ? { ...step, items } : null;
}

function narrowBullets(step: StepBullets, span: EventVerseSpan): StepBullets | null {
  // Steps 1 and 8 tag their bullets with words (POSTURE / EYES / WILL), not
  // verses — those carry no passage scope and stay chapter context.
  const refTagged = step.items.filter((item) => item.tag && /^\d/.test(item.tag));
  if (!refTagged.length) return null;
  const items = refTagged.filter((item) => touches(item.tag, span));
  return items.length ? { ...step, items } : null;
}

function narrowSegments(step: StepSegments, span: EventVerseSpan): StepSegments | null {
  // Segment titles carry their range parenthetically — "…decree (2:1-7)".
  // `qualifiedOnly` keeps a title like "The 12 disciples" from parsing as v12.
  const segments = step.segments.filter((seg) => touches(seg.title, span, true));
  return segments.length ? { ...step, segments } : null;
}

function narrowQA(step: StepQA, span: EventVerseSpan): StepQA | null {
  // The 5 W's answer the chapter, not a pericope — but when an answer never
  // mentions the event's verses it is pure chapter context, so the whole step
  // is marked as such rather than filtered item by item (the questions only
  // make sense as a set).
  const relevant = step.items.some((item) => touches(`${item.q} ${item.a}`, span, true));
  return relevant ? step : null;
}

function narrowStep(step: StudyStep, span: EventVerseSpan): StudyStep | null {
  switch (step.kind) {
    case 'keywords':
      return narrowKeywords(step, span);
    case 'lists':
      return narrowLists(step, span);
    case 'contrasts':
      return narrowContrasts(step, span);
    case 'bullets':
      return narrowBullets(step, span);
    case 'segments':
      return narrowSegments(step, span);
    case 'qa':
      return narrowQA(step, span);
    case 'prose':
      // Free prose has no reliable per-paragraph scope; keep it whole.
      return null;
  }
}

/**
 * @param study  the whole chapter's study, straight from `fetchStudy`
 * @param span   the verses the event covers, from `eventVerseSpan`
 */
export function narrowStudyToEvent(study: InductiveStudy, span: EventVerseSpan): NarrowedStudy {
  const chapterScopedSteps = new Set<number>();
  let narrowed = false;

  const steps = study.steps.map((step) => {
    const scoped = narrowStep(step, span);
    if (scoped) {
      // Only count it as narrowing when something was actually removed.
      if (scoped !== step) narrowed = true;
      return scoped;
    }
    chapterScopedSteps.add(step.number);
    return step;
  });

  const movements: StudyMovement[] = study.interpretation.movements.filter((mv) =>
    touches(mv.range, span),
  );
  const questions: StudyApplication[] = study.application.questions.filter((q) =>
    touches(q.range, span),
  );
  if (movements.length && movements.length < study.interpretation.movements.length) narrowed = true;
  if (questions.length && questions.length < study.application.questions.length) narrowed = true;

  return {
    study: {
      ...study,
      steps,
      interpretation: {
        ...study.interpretation,
        // Falling back to every movement beats an empty Interpretation
        // section when a span (or a study) has no usable ranges.
        movements: movements.length ? movements : study.interpretation.movements,
      },
      application: {
        ...study.application,
        questions: questions.length ? questions : study.application.questions,
      },
    },
    chapterScopedSteps,
    narrowed,
    kept: {
      movements: movements.length || study.interpretation.movements.length,
      questions: questions.length || study.application.questions.length,
    },
    total: {
      movements: study.interpretation.movements.length,
      questions: study.application.questions.length,
    },
  };
}
