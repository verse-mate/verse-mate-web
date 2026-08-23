import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import JesusEventScreen from './JesusEventScreen';
import { AppProvider } from '@/contexts/AppContext';
import { JesusViewProvider } from '@/contexts/JesusViewContext';
import * as bibleService from '@/services/bibleService';
import * as jesusService from '@/services/jesusService';
import type { JesusEventDetail } from '@/services/types';

/**
 * The phone chrome: the event itself belongs to the header's Bible pill, the
 * way a chapter's text does on the reader. There is no Content pill — that was
 * the one place in the app where the same content wore two different controls.
 */

vi.mock('@/services/bibleService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/bibleService')>();
  return { ...actual, fetchCommentary: vi.fn(), fetchStudy: vi.fn() };
});
vi.mock('@/services/jesusService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/jesusService')>();
  return { ...actual, fetchJesusEvent: vi.fn(), fetchJesusCompare: vi.fn() };
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
    is_primary: true, display: 'Mark 4:35-41', verses: [],
  }],
  reveals: { says_about_himself: [], demonstrates: [], others_say: [], narrator_says: [] },
  reactions: [], explanation: {}, related: [],
} as unknown as JesusEventDetail;

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/jesus/events/the-storm']}>
        <AppProvider>
          <JesusViewProvider>
            <Routes>
              <Route path="/jesus/events/:eventSlug" element={<JesusEventScreen />} />
            </Routes>
          </JesusViewProvider>
        </AppProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.mocked(jesusService.fetchJesusEvent).mockResolvedValue(detail);
  vi.mocked(jesusService.fetchJesusCompare).mockResolvedValue(null);
  vi.mocked(bibleService.fetchCommentary).mockResolvedValue([]);
  vi.mocked(bibleService.fetchStudy).mockResolvedValue(null);
});

describe('JesusEventScreen — phone chrome', () => {
  it('opens on the Bible view with the event itself and no Content pill', async () => {
    renderScreen();

    await waitFor(() =>
      expect(screen.getByTestId('jesus-event-title')).toHaveTextContent('Stilling the storm'),
    );
    expect(screen.getByTestId('jesus-event-passages')).toBeInTheDocument();

    expect(screen.queryByTestId('jesus-event-tab-content')).not.toBeInTheDocument();
    // Pills belong to the Insight side, so the Bible view shows none at all.
    expect(screen.queryByTestId('jesus-event-tabs')).not.toBeInTheDocument();
  });

  it('swaps to the insight tabs and back through the header toggle', async () => {
    renderScreen();

    await waitFor(() => expect(screen.getByTestId('jesus-event-title')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('commentary-view-icon'));
    expect(await screen.findByTestId('jesus-event-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('jesus-event-panel-summary')).toBeInTheDocument();
    expect(screen.queryByTestId('jesus-event-passages')).not.toBeInTheDocument();

    // The toggle remembers which tab you were reading.
    fireEvent.click(screen.getByTestId('jesus-event-tab-study'));
    expect(await screen.findByTestId('jesus-event-panel-study')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('bible-view-icon'));
    expect(await screen.findByTestId('jesus-event-passages')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('commentary-view-icon'));
    expect(await screen.findByTestId('jesus-event-panel-study')).toBeInTheDocument();
  });
});
