import { describe, expect, it } from 'vitest';
import type { InductiveStudy } from '@versemate/studies';
import { buildEventStudyCopyText } from './jesusStudyCopy';
import { eventVerseSpan, narrowStudyToEvent } from './jesusStudy';
import type { JesusEventDetail } from '@/services/types';

const passage = {
  book_id: 42,
  book_name: 'Luke',
  chapter: 2,
  verse_start: 41,
  verse_end: 52,
  is_primary: true,
  display: 'Luke 2:41-52',
};

const detail = {
  event: {
    slug: 'the-boy-in-the-temple',
    title: 'The boy in the temple',
    summary: null,
    period_slug: null,
    period_name: 'Childhood',
    sequence: 12,
    chronology_confidence: 'high',
    parallel_confidence: 'high',
    gospels: ['Luke'],
    passages: [passage],
    facet_counts: { words: 1, actions: 0, by_type: {} },
    matched_facets: [],
    themes: [],
    location: 'Jerusalem, the temple',
    approximate_date: 'AD 8',
    people: [{ person: 'Mary', role: 'mother' }],
  },
  words: [
    {
      slug: 'w',
      mode: 'WORD',
      type: 'QUESTION',
      type_slug: 'question',
      type_label: 'Question',
      speaker: 'JESUS',
      actor: null,
      title: 'Did you not know?',
      text: 'Did you not know that I must be in my Father’s house?',
      summary: null,
      provenance: 1,
      reference: 'Luke 2:49',
      book_id: 42,
      chapter: 2,
      verse_start: 49,
      verse_end: 49,
    },
  ],
  actions: [],
  passages: [passage],
  reveals: {
    says_about_himself: [
      { content: 'He calls the temple His Father’s house.', source_ref: '2:49', provenance: 1 },
    ],
    demonstrates: [],
    others_say: [{ content: 'His mother kept these things.', source_ref: null, provenance: 1 }],
    narrator_says: [],
  },
  reactions: [
    { who: 'The teachers', what: 'were amazed', source_ref: '2:47', provenance: 1 },
  ],
  explanation: {},
  related: [],
} as unknown as JesusEventDetail;

const study: InductiveStudy = {
  bookId: 42,
  bookName: 'Luke',
  chapter: 2,
  title: 'Luke 2',
  subtitle: 'The Precept Method, Verse by Verse',
  themeOneLine: 'Today a Savior has been born.',
  steps: [
    {
      number: 2,
      kind: 'qa',
      title: "Ask the 5 W's and an H",
      summary: 'Who, what, when, where.',
      items: [{ q: 'Who is there?', a: 'The boy and the teachers (2:46).' }],
    },
    {
      number: 4,
      kind: 'lists',
      title: 'Make lists',
      summary: 'What the text says about Him.',
      lists: [
        {
          title: 'About the boy',
          columns: ['Verse', 'Truth'],
          rows: [{ ref: '2:47', truth: 'All were amazed.' }],
        },
      ],
    },
  ],
  interpretation: {
    intro: 'How the chapter argues.',
    movements: [{ number: 4, title: 'The temple at twelve', range: '2:41-50', body: 'He knows.' }],
  },
  application: { intro: 'One per movement.', questions: [{ range: '2:49', question: 'Whose house?' }] },
};

const span = eventVerseSpan(passage);

describe('buildEventStudyCopyText', () => {
  const text = buildEventStudyCopyText(
    detail,
    span,
    narrowStudyToEvent(study, span!),
    'Inductive Study of The boy in the temple',
  );

  it('files the event’s observations under the step that hosts them on screen', () => {
    const stepTwo = text.indexOf("2. Ask the 5 W's and an H");
    const stepFour = text.indexOf('4. Make lists');
    expect(text.indexOf('The event in its setting')).toBeGreaterThan(stepTwo);
    expect(text.indexOf('The event in its setting')).toBeLessThan(stepFour);
    expect(text.indexOf('What He says')).toBeGreaterThan(stepFour);
    expect(text.indexOf('How people responded')).toBeGreaterThan(stepFour);
  });

  it('keeps the step’s own content as well as the event’s', () => {
    expect(text).toContain('About the boy');
    expect(text).toContain('2:47 — All were amazed.');
  });

  it('files a reveal under its movement and an untagged one under the section', () => {
    const movement = text.indexOf('Movement 4');
    const section = text.indexOf('INTERPRETATION');
    expect(text.indexOf('He calls the temple')).toBeGreaterThan(movement);
    expect(text.indexOf('His mother kept these things.')).toBeGreaterThan(section);
    expect(text.indexOf('His mother kept these things.')).toBeLessThan(movement);
  });

  it('says what it was narrowed from', () => {
    expect(text).toContain('Scope: Luke 2:41-52');
  });

  it('leads with the event’s record when the chapter has no study', () => {
    const bare = buildEventStudyCopyText(detail, span, null, 'The boy in the temple');
    expect(bare).toContain('The event in its setting');
    expect(bare).toContain('What He says');
    expect(bare).toContain('What this event reveals');
    expect(bare).not.toContain('OBSERVATION — 9 INDUCTIVE STEPS');
  });
});
