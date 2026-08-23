import { describe, expect, it } from 'vitest';
import type { InductiveStudy } from '@versemate/studies';
import {
  eventVerseSpan,
  narrowStudyToEvent,
  parseVerseRefs,
  refTouchesSpan,
  spanRangeLabel,
  type EventVerseSpan,
} from './jesusStudy';
import type { JesusEventPassage } from '@/services/types';

const span: EventVerseSpan = {
  bookId: 42,
  bookName: 'Luke',
  chapter: 2,
  start: 41,
  end: 52,
  display: 'Luke 2:41-52',
};

describe('parseVerseRefs', () => {
  it('reads a chapter-qualified range', () => {
    expect(parseVerseRefs('2:41-52', 2)).toEqual([{ chapter: 2, start: 41, end: 52 }]);
  });

  it('carries the chapter across a comma list', () => {
    expect(parseVerseRefs('2:19, 51', 2)).toEqual([
      { chapter: 2, start: 19, end: 19 },
      { chapter: 2, start: 51, end: 51 },
    ]);
  });

  it('ignores Greek glosses and occurrence counts in parentheses', () => {
    expect(parseVerseRefs('2:11 (soter); 2:30 (soterion)', 2)).toEqual([
      { chapter: 2, start: 11, end: 11 },
      { chapter: 2, start: 30, end: 30 },
    ]);
    expect(parseVerseRefs('2:9 (×2), 11', 2)).toEqual([
      { chapter: 2, start: 9, end: 9 },
      { chapter: 2, start: 11, end: 11 },
    ]);
  });

  it('keeps a parenthesised range — segment titles carry theirs that way', () => {
    expect(parseVerseRefs("An emperor's decree serves a divine appointment (2:1-7)", 2)).toEqual([
      { chapter: 2, start: 1, end: 7 },
    ]);
  });

  it('falls back to the passage chapter for a bare range', () => {
    expect(parseVerseRefs('41-52', 2)).toEqual([{ chapter: 2, start: 41, end: 52 }]);
  });

  it('ignores an unqualified number when qualifiedOnly is set', () => {
    // "The 12 disciples" must not parse as verse 12.
    expect(parseVerseRefs('The 12 disciples', 2, true)).toEqual([]);
    expect(parseVerseRefs('Something (2:5)', 2, true)).toEqual([
      { chapter: 2, start: 5, end: 5 },
    ]);
  });

  it('rejects impossible verse numbers', () => {
    expect(parseVerseRefs('2:900', 2)).toEqual([]);
    expect(parseVerseRefs('2:20-5', 2)).toEqual([]);
  });

  it('returns nothing for empty input', () => {
    expect(parseVerseRefs(null, 2)).toEqual([]);
    expect(parseVerseRefs('no digits here', 2)).toEqual([]);
  });
});

describe('refTouchesSpan', () => {
  it('matches any overlap, not just containment', () => {
    expect(refTouchesSpan({ chapter: 2, start: 39, end: 50 }, span)).toBe(true);
    expect(refTouchesSpan({ chapter: 2, start: 51, end: 52 }, span)).toBe(true);
    expect(refTouchesSpan({ chapter: 2, start: 1, end: 7 }, span)).toBe(false);
  });

  it('never matches another chapter', () => {
    expect(refTouchesSpan({ chapter: 1, start: 41, end: 52 }, span)).toBe(false);
  });

  it('treats a chapter-wide span as covering everything in it', () => {
    const whole = { ...span, start: null, end: null };
    expect(refTouchesSpan({ chapter: 2, start: 1, end: 1 }, whole)).toBe(true);
    expect(refTouchesSpan({ chapter: 3, start: 1, end: 1 }, whole)).toBe(false);
  });
});

describe('eventVerseSpan', () => {
  const passage = (over: Partial<JesusEventPassage> = {}): JesusEventPassage => ({
    book_id: 42,
    book_name: 'Luke',
    chapter: 2,
    verse_start: 41,
    verse_end: 52,
    is_primary: true,
    display: 'Luke 2:41-52',
    ...over,
  });

  it('reads the span off the passage', () => {
    expect(eventVerseSpan(passage())).toMatchObject({ chapter: 2, start: 41, end: 52 });
  });

  it('treats a missing verse_end as a single verse', () => {
    expect(eventVerseSpan(passage({ verse_end: null }))).toMatchObject({ start: 41, end: 41 });
  });

  it('returns null without a passage', () => {
    expect(eventVerseSpan(null)).toBeNull();
  });
});

describe('spanRangeLabel', () => {
  it('renders a range, a single verse, and a whole chapter', () => {
    expect(spanRangeLabel(span)).toBe('2:41-52');
    expect(spanRangeLabel({ ...span, start: 49, end: 49 })).toBe('2:49');
    expect(spanRangeLabel({ ...span, start: null, end: null })).toBe('2');
  });
});

const study: InductiveStudy = {
  bookId: 42,
  bookName: 'Luke',
  chapter: 2,
  title: 'Luke 2',
  subtitle: 'The Precept Method, Verse by Verse',
  themeOneLine: 'Today a Savior has been born.',
  steps: [
    {
      number: 1,
      kind: 'bullets',
      title: 'Begin with prayer',
      summary: 'Apart from the Spirit this is just a method.',
      items: [
        { tag: 'POSTURE', text: 'Willingness.' },
        { tag: 'EYES', text: 'Attentiveness.' },
      ],
    },
    {
      number: 2,
      kind: 'qa',
      title: "Ask the 5 W's and an H",
      summary: 'Setting the table.',
      items: [
        { tag: 'WHO', q: 'Who?', a: 'Jesus, at twelve, in the temple (2:46).' },
        { tag: 'WHERE', q: 'Where?', a: 'Bethlehem (2:4).' },
      ],
    },
    {
      number: 3,
      kind: 'keywords',
      title: 'Mark key words',
      summary: 'Repetition carries purpose.',
      inventory: [
        { word: 'Savior', count: 2, verses: '2:11, 30' },
        { word: 'Father', count: 1, verses: '2:49' },
      ],
    },
    {
      number: 4,
      kind: 'lists',
      title: 'Make lists',
      summary: 'What I learn about ___.',
      lists: [
        {
          title: 'What Luke 2 teaches about Christ',
          columns: ['Verse', 'Truth'],
          rows: [
            { ref: '2:7', truth: 'Laid in a manger.' },
            { ref: '2:49', truth: "In His Father's house." },
          ],
        },
        {
          title: 'What Luke 2 teaches about shepherds',
          columns: ['Verse', 'Truth'],
          rows: [{ ref: '2:15-17', truth: 'They went with haste.' }],
        },
      ],
    },
    {
      number: 5,
      kind: 'contrasts',
      title: 'Watch for contrasts',
      summary: 'Descriptive language.',
      items: [
        { verses: '2:7', type: 'Contrast', pairing: 'Palace vs. manger.' },
        { verses: '2:48-49', type: 'Contrast', pairing: 'Your father vs. My Father.' },
      ],
    },
    {
      number: 6,
      kind: 'bullets',
      title: 'Note expressions of time',
      summary: 'Chronology sheds light.',
      items: [
        { tag: '2:1-2', text: 'In those days.' },
        { tag: '2:42', text: 'When He was twelve.' },
      ],
    },
    {
      number: 9,
      kind: 'segments',
      title: 'Identify the chapter theme',
      summary: 'Centre on the main event.',
      themeHeadline: 'The Savior is born and named.',
      segments: [
        { title: "An emperor's decree (2:1-7)", body: 'Rome serves God.' },
        { title: 'The boy in the temple (2:41-52)', body: 'He knows whose He is.' },
      ],
    },
  ],
  interpretation: {
    intro: 'How the chapter argues.',
    movements: [
      { number: 1, title: 'The birth', range: '2:1-7', body: 'A' },
      { number: 2, title: 'The shepherds', range: '2:8-20', body: 'B' },
      { number: 3, title: 'The temple at twelve', range: '2:39-50', body: 'C' },
      { number: 4, title: 'Subject to them', range: '2:51-52', body: 'D' },
    ],
  },
  application: {
    intro: 'One question per movement.',
    questions: [
      { range: '2:1-7', question: 'Where is God ordering your circumstances?' },
      { range: '2:49', question: 'What do you assume about your Father’s house?' },
    ],
  },
};

describe('narrowStudyToEvent', () => {
  const result = narrowStudyToEvent(study, span);
  const byNumber = (n: number) => result.study.steps.find((s) => s.number === n);

  it('keeps only the movements the event touches', () => {
    expect(result.study.interpretation.movements.map((m) => m.range)).toEqual([
      '2:39-50',
      '2:51-52',
    ]);
    expect(result.kept.movements).toBe(2);
    expect(result.total.movements).toBe(4);
  });

  it('keeps only the application questions the event touches', () => {
    expect(result.study.application.questions.map((q) => q.range)).toEqual(['2:49']);
  });

  it('filters the keyword inventory to words used in the passage', () => {
    const step = byNumber(3);
    expect(step?.kind === 'keywords' && step.inventory.map((r) => r.word)).toEqual(['Father']);
  });

  it('filters list rows and drops lists left empty', () => {
    const step = byNumber(4);
    expect(step?.kind === 'lists' && step.lists).toHaveLength(1);
    expect(step?.kind === 'lists' && step.lists[0].rows.map((r) => r.ref)).toEqual(['2:49']);
  });

  it('filters contrast rows', () => {
    const step = byNumber(5);
    expect(step?.kind === 'contrasts' && step.items.map((i) => i.verses)).toEqual(['2:48-49']);
  });

  it('filters verse-tagged bullets', () => {
    const step = byNumber(6);
    expect(step?.kind === 'bullets' && step.items.map((i) => i.tag)).toEqual(['2:42']);
  });

  it('filters segments by the range in their title, keeping the chapter theme', () => {
    const step = byNumber(9);
    expect(step?.kind === 'segments' && step.segments.map((s) => s.title)).toEqual([
      'The boy in the temple (2:41-52)',
    ]);
    expect(step?.kind === 'segments' && step.themeHeadline).toBe('The Savior is born and named.');
  });

  it('marks word-tagged and untouched steps as chapter context instead of dropping them', () => {
    // Step 1 tags bullets with POSTURE / EYES — no verse scope at all.
    expect(result.chapterScopedSteps.has(1)).toBe(true);
    expect(byNumber(1)).toEqual(study.steps[0]);
    // Every one of the nine steps still renders.
    expect(result.study.steps).toHaveLength(study.steps.length);
  });

  it('keeps the 5 Ws when an answer cites the passage', () => {
    expect(result.chapterScopedSteps.has(2)).toBe(false);
    const step = byNumber(2);
    expect(step?.kind === 'qa' && step.items).toHaveLength(2);
  });

  it('reports that it narrowed', () => {
    expect(result.narrowed).toBe(true);
  });

  it('falls back to the whole chapter when nothing overlaps', () => {
    const orphan = narrowStudyToEvent(study, { ...span, chapter: 9, start: 1, end: 2 });
    expect(orphan.study.interpretation.movements).toHaveLength(4);
    expect(orphan.study.application.questions).toHaveLength(2);
    expect(orphan.chapterScopedSteps.size).toBe(study.steps.length);
    expect(orphan.narrowed).toBe(false);
  });

  it('never mutates the study it was given', () => {
    expect(study.interpretation.movements).toHaveLength(4);
    expect(study.steps[3].kind === 'lists' && study.steps[3].lists).toHaveLength(2);
  });
});
