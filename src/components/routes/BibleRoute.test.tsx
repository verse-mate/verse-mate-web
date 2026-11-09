import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import BibleRoute from './BibleRoute';

const books = vi.hoisted(() => ({ list: [] as { bookId: number; name: string; chapters: number }[] }));

vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({ state: { book: 'Genesis', chapter: 1, bookId: 1 }, dispatch: vi.fn() }),
}));
vi.mock('@/services/bibleService', () => ({ fetchBooks: async () => books.list }));
vi.mock('@/pages/ReadingScreen', () => ({ default: () => <div>reading screen</div> }));

function open(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/bible/:bookSlug/:chapterNumber" element={<BibleRoute />} />
        <Route path="/read" element={<div>read redirect</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('BibleRoute', () => {
  beforeEach(() => {
    books.list = [{ bookId: 43, name: 'John', chapters: 21 }];
  });

  it('shows the not-found screen for a chapter past the end of the book', async () => {
    open('/bible/john/999');
    expect(await screen.findByText('Oops! Page not found')).toBeInTheDocument();
  });

  it('shows the not-found screen for a book that does not exist', async () => {
    open('/bible/notabook/1');
    expect(await screen.findByText('Oops! Page not found')).toBeInTheDocument();
  });

  it('opens the reader on a chapter that exists', async () => {
    open('/bible/john/21');
    expect(await screen.findByText('reading screen')).toBeInTheDocument();
  });

  it('opens the reader rather than a not-found screen when the book list cannot be loaded', async () => {
    books.list = [];
    open('/bible/john/3');
    expect(await screen.findByText('reading screen')).toBeInTheDocument();
  });
});
