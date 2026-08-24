import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import JesusEventScreen from './JesusEventScreen';
import { AppProvider } from '@/contexts/AppContext';
import { JesusViewProvider } from '@/contexts/JesusViewContext';
import * as bibleService from '@/services/bibleService';
import * as jesusService from '@/services/jesusService';
import type { JesusEventCard, JesusEventDetail, JesusEventLifePeriod } from '@/services/types';

/**
 * Paging the arc. The reader swipes chapters; an event is this tab's chapter,
 * so the same gesture walks the chronology "Follow His Life" lays out.
 */

vi.mock('@/services/bibleService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/bibleService')>();
  return { ...actual, fetchCommentary: vi.fn(), fetchStudy: vi.fn() };
});
vi.mock('@/services/jesusService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/jesusService')>();
  return {
    ...actual,
    fetchJesusEvent: vi.fn(),
    fetchJesusCompare: vi.fn(),
    fetchJesusEventLife: vi.fn(),
  };
});

function card(slug: string, title: string): JesusEventCard {
  return {
    slug, title, summary: null, period_slug: 'ministry', period_name: 'Galilean ministry',
    sequence: null, chronology_confidence: 'high', parallel_confidence: 'high',
    gospels: [], passages: [], facet_counts: { words: 0, actions: 0, by_type: {} },
    matched_facets: [], themes: [],
  };
}

const arc: JesusEventLifePeriod[] = [
  {
    slug: 'ministry', name: 'Galilean ministry', subtitle: null, description: null,
    sort_order: 1, event_count: 3,
    events: [card('calls-the-twelve', 'Calls the twelve'), card('the-storm', 'Stilling the storm'), card('feeds-five-thousand', 'Feeds five thousand')],
  },
];

function detailFor(slug: string): JesusEventDetail {
  return {
    event: {
      ...card(slug, slug === 'the-storm' ? 'Stilling the storm' : slug),
      location: null, approximate_date: null, people: [],
    },
    words: [], actions: [], passages: [],
    reveals: { says_about_himself: [], demonstrates: [], others_say: [], narrator_says: [] },
    reactions: [], explanation: {}, related: [],
  } as unknown as JesusEventDetail;
}

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
}

function renderAt(entry: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[entry]}>
        <AppProvider>
          <JesusViewProvider>
            <LocationProbe />
            <Routes>
              <Route path="/jesus/event/:eventSlug" element={<JesusEventScreen />} />
            </Routes>
          </JesusViewProvider>
        </AppProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** A drag of `dx` pixels that ends where it started vertically. */
function swipe(element: HTMLElement, dx: number, dy = 0) {
  fireEvent.touchStart(element, { touches: [{ clientX: 200, clientY: 300 }] });
  fireEvent.touchEnd(element, { changedTouches: [{ clientX: 200 + dx, clientY: 300 + dy }] });
}

async function pager() {
  return await screen.findByTestId('jesus-event-pager-view');
}

beforeEach(() => {
  vi.mocked(jesusService.fetchJesusEvent).mockImplementation(async (slug: string) => detailFor(slug));
  vi.mocked(jesusService.fetchJesusCompare).mockResolvedValue(null);
  vi.mocked(jesusService.fetchJesusEventLife).mockResolvedValue(arc);
  vi.mocked(bibleService.fetchCommentary).mockResolvedValue([]);
  vi.mocked(bibleService.fetchStudy).mockResolvedValue(null);
});

describe('JesusEventScreen — swiping the chronology', () => {
  it('swiping left goes to the next event on the arc', async () => {
    renderAt('/jesus/event/the-storm');
    await waitFor(() => expect(screen.getByTestId('jesus-event-title')).toBeInTheDocument());

    swipe(await pager(), -120);

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/jesus/event/feeds-five-thousand'),
    );
  });

  it('swiping right goes back to the previous event', async () => {
    renderAt('/jesus/event/the-storm');
    await waitFor(() => expect(screen.getByTestId('jesus-event-title')).toBeInTheDocument());

    swipe(await pager(), 120);

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/jesus/event/calls-the-twelve'),
    );
  });

  it('carries the open insight tab across to the next event', async () => {
    renderAt('/jesus/event/the-storm?tab=study');
    await waitFor(() => expect(screen.getByTestId('jesus-event-tabs')).toBeInTheDocument());

    swipe(await pager(), -120);

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/jesus/event/feeds-five-thousand?tab=study',
      ),
    );
  });

  it('stays put at the end of the arc', async () => {
    renderAt('/jesus/event/feeds-five-thousand');
    await waitFor(() => expect(screen.getByTestId('jesus-event-title')).toBeInTheDocument());

    swipe(await pager(), -120);

    await new Promise((r) => setTimeout(r, 20));
    expect(screen.getByTestId('location')).toHaveTextContent('/jesus/event/feeds-five-thousand');
  });

  it('ignores a mostly-vertical drag, which is a scroll', async () => {
    renderAt('/jesus/event/the-storm');
    await waitFor(() => expect(screen.getByTestId('jesus-event-title')).toBeInTheDocument());

    swipe(await pager(), -120, 200);

    await new Promise((r) => setTimeout(r, 20));
    expect(screen.getByTestId('location')).toHaveTextContent('/jesus/event/the-storm');
  });

  it('ignores a short drag, which is a tap that slipped', async () => {
    renderAt('/jesus/event/the-storm');
    await waitFor(() => expect(screen.getByTestId('jesus-event-title')).toBeInTheDocument());

    swipe(await pager(), -30);

    await new Promise((r) => setTimeout(r, 20));
    expect(screen.getByTestId('location')).toHaveTextContent('/jesus/event/the-storm');
  });
});
