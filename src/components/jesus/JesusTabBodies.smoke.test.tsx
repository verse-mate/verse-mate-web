import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import JesusTabBodies from './JesusTabBodies';
import { AppProvider } from '@/contexts/AppContext';
import * as bibleService from '@/services/bibleService';
import * as jesusService from '@/services/jesusService';
import type { JesusEventDetail } from '@/services/types';

// Guards the extraction of the tab chrome into `JesusTabParts`: Summary,
// By-Line and Compare must keep rendering their toolbars and bodies.
vi.mock('@/services/bibleService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/bibleService')>();
  return { ...actual, fetchCommentary: vi.fn(), fetchStudy: vi.fn() };
});
vi.mock('@/services/jesusService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/jesusService')>();
  return { ...actual, fetchJesusCompare: vi.fn() };
});

const detail = {
  event: {
    slug: 'the-storm', title: 'Stilling the storm', summary: 'He rebukes the wind.',
    period_slug: 'ministry', period_name: 'Galilean ministry', sequence: 40,
    chronology_confidence: 'high', parallel_confidence: 'high',
    gospels: ['Matthew', 'Mark', 'Luke'], passages: [],
    facet_counts: { words: 0, actions: 0, by_type: {} }, matched_facets: [], themes: [],
    location: 'The Sea of Galilee', approximate_date: null, people: [],
  },
  words: [], actions: [],
  passages: [{
    book_id: 41, book_name: 'Mark', chapter: 4, verse_start: 35, verse_end: 41,
    is_primary: true, display: 'Mark 4:35-41',
  }],
  reveals: { says_about_himself: [], demonstrates: [], others_say: [], narrator_says: [] },
  reactions: [], explanation: {}, related: [],
} as unknown as JesusEventDetail;

function renderTab(tab: 'summary' | 'byline' | 'compare') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AppProvider>
          <JesusTabBodies tab={tab} detail={detail} />
        </AppProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.mocked(bibleService.fetchCommentary).mockResolvedValue([]);
  vi.mocked(bibleService.fetchStudy).mockResolvedValue(null);
  vi.mocked(jesusService.fetchJesusCompare).mockResolvedValue(null);
});

describe('JesusTabBodies', () => {
  it('renders the Summary tab with its toolbar', () => {
    renderTab('summary');
    expect(screen.getByText('Summary of Stilling the storm')).toBeInTheDocument();
    expect(screen.getByLabelText('Copy Summary of Stilling the storm')).toBeInTheDocument();
  });

  // A section heading is a promise of content. Discourse events (a teaching with
  // no narrative frame) legitimately have no reveals and no recorded reaction,
  // and the enrichment pipeline is required to return [] rather than invent
  // them — so the headings must not render an empty state under themselves.
  it('omits the Summary sections that have nothing under them', () => {
    renderTab('summary');
    expect(screen.queryByText(/What this reveals/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/How people reacted/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('jesus-event-reveals')).not.toBeInTheDocument();
    expect(screen.queryByTestId('jesus-event-reactions')).not.toBeInTheDocument();
  });

  it('renders the Summary sections once there is something to show', () => {
    const filled = {
      ...detail,
      reveals: {
        says_about_himself: [],
        demonstrates: [
          { content: 'He commands the wind and it obeys.', source_ref: 'Mark 4:39', provenance: 2 },
        ],
        others_say: [],
        narrator_says: [],
      },
      reactions: [{ who: 'The disciples', what: 'were terrified', source_ref: 'Mark 4:41' }],
    } as unknown as JesusEventDetail;

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <AppProvider>
            <JesusTabBodies tab="summary" detail={filled} />
          </AppProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/What this reveals/i)).toBeInTheDocument();
    expect(screen.getByTestId('jesus-event-reveals')).toBeInTheDocument();
    expect(screen.getByText(/How people reacted/i)).toBeInTheDocument();
    expect(screen.getByTestId('jesus-event-reactions')).toBeInTheDocument();
  });

  it('renders the By-Line tab', async () => {
    renderTab('byline');
    expect(screen.getByText(/Line-by-Line Analysis of Stilling the storm/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('jesus-byline-empty')).toBeInTheDocument());
  });

  it('renders the Compare tab', async () => {
    renderTab('compare');
    await waitFor(() =>
      expect(screen.getByText(/Couldn’t load the comparison/)).toBeInTheDocument(),
    );
  });
});
