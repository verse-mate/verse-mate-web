import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import JesusTabBodies from './JesusTabBodies';
import { AppProvider } from '@/contexts/AppContext';
import * as bibleService from '@/services/bibleService';
import type { Commentary, JesusEventDetail } from '@/services/types';

/**
 * The By-Line tab has to explain every verse the left column prints.
 *
 * "Repent, for the kingdom of heaven is at hand" prints Matthew 4:17 and
 * Mark 1:14-15; the tab used to fetch the primary account's chapter only, so
 * Mark's two verses came out with no explanation at all and nothing said why.
 */
vi.mock('@/services/bibleService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/bibleService')>();
  return { ...actual, fetchCommentary: vi.fn() };
});

const byline = (verse: number, detail = 'Body of the explanation.'): Commentary => ({
  verse,
  summary: '',
  detail,
  type: 'byline',
});

const detail = {
  event: {
    slug: 'repent', title: 'Repent, for the kingdom of heaven is at hand',
    summary: 'The first thing He preaches.',
    period_slug: 'ministry', period_name: 'The Galilean ministry', sequence: 30,
    chronology_confidence: 'high', parallel_confidence: 'high',
    gospels: ['Matthew', 'Mark'], passages: [],
    facet_counts: { words: 0, actions: 0, by_type: {} }, matched_facets: [], themes: [],
    location: null, approximate_date: null, people: [],
  },
  words: [], actions: [],
  passages: [
    {
      book_id: 40, book_name: 'Matthew', chapter: 4, verse_start: 17, verse_end: 17,
      is_primary: true, display: 'Matthew 4:17',
    },
    {
      book_id: 41, book_name: 'Mark', chapter: 1, verse_start: 14, verse_end: 15,
      is_primary: false, display: 'Mark 1:14-15',
    },
  ],
  reveals: { says_about_himself: [], demonstrates: [], others_say: [], narrator_says: [] },
  reactions: [], explanation: {}, related: [],
} as unknown as JesusEventDetail;

function renderByline() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AppProvider>
          <JesusTabBodies tab="byline" detail={detail} />
        </AppProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.mocked(bibleService.fetchCommentary).mockReset();
});

describe('By-Line across every account of an event', () => {
  it('explains the verses of both accounts, each under its own reference', async () => {
    vi.mocked(bibleService.fetchCommentary).mockImplementation(async (book) =>
      book === 'Matthew'
        ? [byline(17), byline(18, 'outside the event')]
        : [byline(14), byline(15)],
    );

    renderByline();

    await waitFor(() =>
      expect(screen.getByTestId('jesus-byline-account-matthew-4-17')).toBeInTheDocument(),
    );

    const matthew = within(screen.getByTestId('jesus-byline-account-matthew-4-17'));
    const mark = within(screen.getByTestId('jesus-byline-account-mark-1-14-15'));

    expect(matthew.getAllByText('Matthew 4:17')).toHaveLength(2); // heading + row
    expect(mark.getByText('Mark 1:14')).toBeInTheDocument();
    expect(mark.getByText('Mark 1:15')).toBeInTheDocument();
    // Still narrowed to the event's own verses.
    expect(screen.queryByText('Matthew 4:18')).not.toBeInTheDocument();
  });

  it('says an account is ungenerated rather than leaving it out', async () => {
    vi.mocked(bibleService.fetchCommentary).mockImplementation(async (book) =>
      book === 'Matthew' ? [byline(17)] : [],
    );

    renderByline();

    await waitFor(() =>
      expect(screen.getByTestId('jesus-byline-account-empty-mark-1-14-15')).toBeInTheDocument(),
    );
    expect(screen.getByTestId('jesus-byline-account-empty-mark-1-14-15')).toHaveTextContent(
      /Mark 1:14-15/,
    );
    // Matthew still renders its row alongside the note.
    expect(
      within(screen.getByTestId('jesus-byline-account-matthew-4-17')).getByTestId(
        'jesus-byline-list',
      ),
    ).toBeInTheDocument();
  });

  it('falls back to the whole-event empty state when nothing is generated', async () => {
    vi.mocked(bibleService.fetchCommentary).mockResolvedValue([]);

    renderByline();

    await waitFor(() => expect(screen.getByTestId('jesus-byline-empty')).toBeInTheDocument());
    expect(screen.getByTestId('jesus-byline-empty')).toHaveTextContent(
      /Matthew 4:17, Mark 1:14-15/,
    );
  });
});
