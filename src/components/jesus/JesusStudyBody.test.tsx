import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { InductiveStudy } from '@versemate/studies';
import JesusStudyBody from './JesusStudyBody';
import { AppProvider } from '@/contexts/AppContext';
import * as bibleService from '@/services/bibleService';
import type { JesusEventDetail, JesusFacet } from '@/services/types';

// The tab composes the chapter study with the event graph. Mock only the
// chapter fetch — the narrowing and the rendering are what's under test.
vi.mock('@/services/bibleService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/bibleService')>();
  return { ...actual, fetchStudy: vi.fn() };
});

const facet = (over: Partial<JesusFacet> = {}): JesusFacet => ({
  slug: 'boy-temple-question',
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
  ...over,
});

const detail: JesusEventDetail = {
  event: {
    slug: 'the-boy-in-the-temple',
    title: 'The boy in the temple',
    summary: 'Jesus stays behind in Jerusalem.',
    period_slug: 'childhood',
    period_name: 'Childhood',
    sequence: 12,
    chronology_confidence: 'high',
    parallel_confidence: 'high',
    gospels: ['Luke'],
    passages: [],
    facet_counts: { words: 1, actions: 1, by_type: {} },
    matched_facets: [],
    themes: [{ slug: 'sonship', name: 'Sonship' }],
    location: 'Jerusalem, the temple',
    approximate_date: 'AD 8',
    people: [{ person: 'Mary', role: 'mother' }],
  },
  words: [facet()],
  actions: [
    facet({
      slug: 'boy-temple-stays',
      mode: 'ACTION',
      type: 'ENCOUNTER',
      type_label: 'Encounter',
      speaker: null,
      actor: 'JESUS',
      title: 'Stays behind in the temple',
      text: null,
    }),
  ],
  passages: [
    {
      book_id: 42,
      book_name: 'Luke',
      chapter: 2,
      verse_start: 41,
      verse_end: 52,
      is_primary: true,
      display: 'Luke 2:41-52',
    },
  ],
  reveals: {
    says_about_himself: [
      { content: 'He calls the temple His Father’s house.', source_ref: 'Luke 2:49', provenance: 1 },
    ],
    demonstrates: [],
    others_say: [],
    narrator_says: [],
  },
  reactions: [
    { who: 'The teachers', what: 'were amazed at His understanding', source_ref: 'Luke 2:47', provenance: 1 },
  ],
  explanation: {},
  related: [
    {
      slug: 'the-presentation',
      title: 'The presentation in the temple',
      summary: null,
      period_slug: 'childhood',
      period_name: 'Childhood',
      sequence: 11,
      chronology_confidence: 'high',
      parallel_confidence: 'high',
      gospels: ['Luke'],
      passages: [
        {
          book_id: 42,
          book_name: 'Luke',
          chapter: 2,
          verse_start: 22,
          verse_end: 38,
          is_primary: true,
          display: 'Luke 2:22-38',
        },
      ],
      facet_counts: { words: 0, actions: 0, by_type: {} },
      matched_facets: [],
      themes: [],
    },
  ],
};

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
      items: [{ tag: 'POSTURE', text: 'Willingness to sit under Luke.' }],
    },
    {
      number: 2,
      kind: 'qa',
      title: "Ask the 5 W's and an H",
      summary: 'Who, what, when, where, why, how.',
      items: [{ tag: 'WHO', q: 'Who is in the temple?', a: 'The boy and the teachers (2:46).' }],
    },
    {
      number: 4,
      kind: 'lists',
      title: 'Make lists',
      summary: 'What the text says about the main person.',
      lists: [
        {
          title: 'What Luke says about the boy',
          columns: ['Verse', 'Truth'],
          rows: [{ ref: '2:47', truth: 'All who heard Him were amazed.' }],
        },
      ],
    },
    {
      number: 6,
      kind: 'bullets',
      title: 'Note expressions of time',
      summary: 'Chronology sheds light.',
      items: [
        { tag: '2:6', text: 'While they were there.' },
        { tag: '2:42', text: 'When He was twelve.' },
      ],
    },
  ],
  interpretation: {
    intro: 'How the chapter argues.',
    movements: [
      { number: 1, title: 'The birth', range: '2:1-7', body: 'Rome serves God.' },
      { number: 4, title: 'The temple at twelve', range: '2:39-50', body: 'He knows whose He is.' },
    ],
  },
  application: {
    intro: 'One question per movement.',
    questions: [
      { range: '2:1-7', question: 'Where is God ordering your circumstances?' },
      { range: '2:49', question: 'Whose house do you assume is yours?' },
    ],
  },
};

function renderTab() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AppProvider>
          <JesusStudyBody detail={detail} />
        </AppProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
  vi.mocked(bibleService.fetchStudy).mockResolvedValue(study);
});

describe('JesusStudyBody', () => {
  it('titles the study after the event and says where the content came from', async () => {
    renderTab();
    // The header names the passage, exactly as the Bible side's does.
    expect(screen.getByText('Inductive Study of Luke 2:41-52')).toBeInTheDocument();
    expect(screen.queryByText(/Inductive Study of The boy in the temple/i)).not.toBeInTheDocument();
    const scope = await screen.findByTestId('jesus-study-scope');
    expect(scope).toHaveTextContent('Luke 2 inductive study');
    expect(scope).toHaveTextContent('Luke 2:41-52');
    // 1 of 2 movements and 1 of 2 questions touch 2:41-52.
    expect(scope).toHaveTextContent('1 of 2 movements');
    expect(scope).toHaveTextContent('1 of 2 application questions');
  });

  it('renders the full three-section Precept spine, not a placeholder', async () => {
    renderTab();
    await screen.findByTestId('jesus-study-scope');
    expect(screen.getByText(/Observation — 9 Inductive Steps/i)).toBeInTheDocument();
    expect(screen.getByText(/^Interpretation$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Application$/i)).toBeInTheDocument();
    // The old "hasn't been written yet" empty state is gone.
    expect(screen.queryByTestId('jesus-study-ungenerated')).not.toBeInTheDocument();
  });

  it('keeps only the movement and question that touch the event', async () => {
    renderTab();
    await screen.findByTestId('jesus-study-scope');
    expect(screen.getByText(/The temple at twelve/)).toBeInTheDocument();
    expect(screen.queryByText(/The birth/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(/Apply, one question per movement/i));
    expect(screen.getByText(/Whose house do you assume is yours\?/)).toBeInTheDocument();
    expect(
      screen.queryByText(/Where is God ordering your circumstances\?/),
    ).not.toBeInTheDocument();
  });

  it('marks a step it could not narrow as chapter context', async () => {
    renderTab();
    await screen.findByTestId('jesus-study-scope');
    // Step 1 tags its bullets POSTURE / EYES — no verse scope to narrow by.
    const badges = screen.getAllByTestId('jesus-study-chapter-badge');
    expect(badges).toHaveLength(1);
    expect(screen.getByText('Begin with prayer')).toBeInTheDocument();
    expect(screen.getByText('Note expressions of time')).toBeInTheDocument();
  });

  it('folds the event’s setting into the step that asks the five Ws', async () => {
    renderTab();
    await screen.findByTestId('jesus-study-scope');
    // Closed, the step still says it carries the event's own record.
    expect(screen.queryByText('The event in its setting')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(/Ask the 5 W's and an H/));
    fireEvent.click(screen.getByText('The event in its setting'));
    expect(screen.getByTestId('jesus-study-setting')).toHaveTextContent('Jerusalem, the temple');
  });

  it('folds His words, His acts and the reactions into the lists step', async () => {
    renderTab();
    await screen.findByTestId('jesus-study-scope');
    expect(screen.queryByText('What He says')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Make lists'));

    fireEvent.click(screen.getByText('What He says'));
    expect(screen.getByTestId('jesus-study-words')).toBeInTheDocument();
    fireEvent.click(screen.getByText('What He does'));
    expect(screen.getByTestId('jesus-study-actions')).toBeInTheDocument();
    fireEvent.click(screen.getByText('How people responded'));
    expect(screen.getByTestId('jesus-study-reactions')).toHaveTextContent('The teachers');
    // The step's own list is still there — the event is added to it, not
    // swapped in for it.
    expect(screen.getByText(/What Luke says about the boy/)).toBeInTheDocument();
  });

  it('marks the steps that carry the event’s record so a closed card says so', async () => {
    renderTab();
    await screen.findByTestId('jesus-study-scope');
    const badges = screen.getAllByTestId('jesus-study-event-badge');
    // Step 2 (the setting), step 4 (three blocks of one item each) and the
    // movement the one reveal was filed under.
    expect(badges).toHaveLength(3);
    expect(badges[1]).toHaveTextContent('3');
  });

  it('gives the event’s blocks their own cards when no step can host them', async () => {
    vi.mocked(bibleService.fetchStudy).mockResolvedValue({
      ...study,
      steps: study.steps.filter((step) => step.number !== 2 && step.number !== 4),
    });
    renderTab();
    await screen.findByTestId('jesus-study-scope');
    fireEvent.click(screen.getByText('What He says'));
    expect(screen.getByTestId('jesus-study-words')).toBeInTheDocument();
    fireEvent.click(screen.getByText('The event in its setting'));
    expect(screen.getByTestId('jesus-study-setting')).toHaveTextContent('Jerusalem, the temple');
    // Nothing claims to carry event material inside an observation step.
    expect(screen.queryByTestId('jesus-study-event-inset')).not.toBeInTheDocument();
  });

  it('puts what the event reveals inside the movement whose verses it cites', async () => {
    renderTab();
    await screen.findByTestId('jesus-study-scope');
    expect(screen.queryByText('What He says about Himself')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(/The temple at twelve/));
    fireEvent.click(screen.getByText('What He says about Himself'));
    expect(screen.getByTestId('jesus-study-reveal-says_about_himself')).toHaveTextContent(
      'Father’s house',
    );
  });

  it('keeps a reveal no movement covers in the Interpretation section', async () => {
    vi.mocked(bibleService.fetchStudy).mockResolvedValue({
      ...study,
      interpretation: {
        ...study.interpretation,
        movements: [{ number: 4, title: 'The temple at twelve', range: '2:41-48', body: 'x' }],
      },
    });
    renderTab();
    await screen.findByTestId('jesus-study-scope');
    fireEvent.click(screen.getByText(/About the interpretation/i));
    fireEvent.click(screen.getByText('What He says about Himself'));
    expect(screen.getByTestId('jesus-study-reveals')).toHaveTextContent('Father’s house');
  });

  it('expands and collapses every card at once', async () => {
    renderTab();
    await screen.findByTestId('jesus-study-scope');
    const bulk = screen.getByTestId('jesus-study-expand-all');
    expect(bulk).toHaveTextContent('Expand All');
    fireEvent.click(bulk);
    expect(bulk).toHaveTextContent('Collapse All');
    // Reaches the blocks nested inside the steps, not just the top-level cards.
    expect(screen.getByTestId('jesus-study-words')).toBeInTheDocument();
    expect(screen.getByTestId('jesus-study-reveal-says_about_himself')).toBeInTheDocument();
    fireEvent.click(bulk);
    expect(screen.queryByTestId('jesus-study-words')).not.toBeInTheDocument();
  });

  it('links out to the events that read alongside this one', async () => {
    renderTab();
    await screen.findByTestId('jesus-study-scope');
    fireEvent.click(screen.getByText(/Events that read with this one/));
    expect(screen.getByTestId('jesus-study-related')).toHaveTextContent(
      'The presentation in the temple',
    );
  });

  it('still shows the event graph when the chapter has no study', async () => {
    vi.mocked(bibleService.fetchStudy).mockResolvedValue(null);
    renderTab();
    await waitFor(() => expect(screen.getByTestId('jesus-study-no-chapter')).toBeInTheDocument());
    expect(screen.getByText('What He says')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/What this event reveals about Him/));
    expect(screen.getByTestId('jesus-study-reveals')).toHaveTextContent('Father’s house');
    expect(screen.queryByTestId('jesus-study-scope')).not.toBeInTheDocument();
  });
});
