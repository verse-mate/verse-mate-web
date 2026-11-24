import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import ReadingScreen from './ReadingScreen';
import BibleRoute from '@/components/routes/BibleRoute';
import { AppProvider } from '@/contexts/AppContext';
import * as bibleService from '@/services/bibleService';

vi.hoisted(() => {
  window.history.replaceState(null, '', '/bible/romans/12?lang=pt-BR');
  Element.prototype.scrollTo = () => {};
  Element.prototype.scrollIntoView = () => {};
});

vi.mock('@/services/bibleService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/bibleService')>();
  const books = [
    { bookId: 44, name: 'Acts', shortName: 'Act', testament: 'NT' as const, chapters: 28 },
    { bookId: 45, name: 'Romans', shortName: 'Rom', testament: 'NT' as const, chapters: 16 },
    { bookId: 46, name: '1 Corinthians', shortName: '1Co', testament: 'NT' as const, chapters: 16 },
  ];
  return {
    ...actual,
    fetchBooks: vi.fn(async () => books),
    fetchChapter: vi.fn(async (book: string, chapter: number) => ({
      book,
      bookId: books.find((entry) => entry.name === book)?.bookId ?? 45,
      chapter,
      verses: [{ number: 1, text: `${book} ${chapter}, verse 1.` }],
    })),
    fetchAutoHighlights: vi.fn(async () => []),
  };
});

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
          <LocationProbe />
          <Routes>
            <Route path="/bible/:bookSlug/:chapterNumber" element={<BibleRoute />} />
            <Route path="/read" element={<ReadingScreen />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function nextArrow() {
  return (await screen.findAllByTestId('next-chapter-button'))[0];
}

describe('the reader chapter arrows during a ?lang= visit', () => {
  it('keep the visit language in their address, so a new tab opens the chapter in that language', async () => {
    renderAt('/bible/romans/12?lang=pt-BR');

    const next = await nextArrow();

    expect(next.getAttribute('href')).toBe('/bible/romans/13?lang=pt-BR');
    expect((await screen.findAllByTestId('previous-chapter-button'))[0].getAttribute('href')).toBe('/bible/romans/11?lang=pt-BR');
    fireEvent.click(next);
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/bible/romans/13'));
    expect((await nextArrow()).getAttribute('href')).toBe('/bible/romans/14?lang=pt-BR');
  });
});
