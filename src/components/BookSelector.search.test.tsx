import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import BookSelector from './BookSelector';
import { AppProvider } from '@/contexts/AppContext';
import type { VerseSearchResponse } from '@/services/bibleService';
import * as bibleService from '@/services/bibleService';

vi.mock('@/services/bibleService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/bibleService')>();
  return {
    ...actual,
    fetchBooks: vi.fn().mockResolvedValue([
      { bookId: 19, name: 'Psalms', shortName: 'Psa', testament: 'OT', chapters: 150 },
      { bookId: 40, name: 'Matthew', shortName: 'Mat', testament: 'NT', chapters: 28 },
      { bookId: 43, name: 'John', shortName: 'Joh', testament: 'NT', chapters: 21 },
      { bookId: 62, name: '1 John', shortName: '1Jo', testament: 'NT', chapters: 5 },
    ]),
    fetchTopics: vi.fn().mockResolvedValue([]),
    getRecentBooks: vi.fn().mockReturnValue([]),
    fetchLocalizedBookNames: vi.fn().mockResolvedValue({}),
    searchVerses: vi.fn(),
  };
});

vi.mock('@/services/jesusService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/jesusService')>();
  return {
    ...actual,
    fetchJesusOverview: vi.fn().mockResolvedValue(null),
    fetchJesusEntries: vi.fn().mockResolvedValue({ entries: [] }),
  };
});

const searchVerses = vi.mocked(bibleService.searchVerses);

const EAST_AND_WEST: VerseSearchResponse = {
  results: [
    {
      match: 'exact',
      bookId: 40,
      bookName: 'Matthew',
      chapter: 8,
      verse: 11,
      text: 'I say to you that many will come from east and west, and recline',
      highlights: [
        [38, 42],
        [43, 46],
        [47, 51],
      ],
    },
    {
      match: 'words',
      bookId: 19,
      bookName: 'Psalms',
      chapter: 103,
      verse: 12,
      text: 'As far as the east is from the west',
      highlights: [
        [14, 18],
        [31, 35],
      ],
    },
  ],
  nextCursor: null,
  totals: { exact: 1, words: 1 },
  books: [
    { bookId: 19, name: 'Psalms', testament: 'OT', count: 1 },
    { bookId: 40, name: 'Matthew', testament: 'NT', count: 1 },
  ],
};

let currentUrl = '';
function LocationProbe() {
  const location = useLocation();
  currentUrl = location.pathname + location.search;
  return null;
}

function renderSelector(onClose = vi.fn()) {
  render(
    <MemoryRouter initialEntries={['/bible/john/1']}>
      <AppProvider>
        <BookSelector onClose={onClose} onSelect={() => {}} initialTab="NT" />
        <LocationProbe />
      </AppProvider>
    </MemoryRouter>,
  );
  return { onClose, input: screen.getByTestId('books-search-input') };
}

const type = (input: HTMLElement, value: string) => fireEvent.change(input, { target: { value } });

describe('BookSelector search', () => {
  beforeEach(() => {
    localStorage.clear();
    searchVerses.mockReset();
    currentUrl = '';
  });

  it('turns a typed reference into a Go to row and skips the verse search', async () => {
    const { input, onClose } = renderSelector();
    await waitFor(() => expect(bibleService.fetchBooks).toHaveBeenCalled());
    type(input, 'jn 3.16');

    expect(await screen.findByText('John 3:16')).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onClose).toHaveBeenCalled();
    expect(currentUrl).toBe('/bible/john/3?v=16');
    await new Promise((r) => setTimeout(r, 300));
    expect(searchVerses).not.toHaveBeenCalled();
  });

  it('sends typing to the search field when it is not focused', async () => {
    searchVerses.mockResolvedValue(EAST_AND_WEST);
    const { input } = renderSelector();
    await waitFor(() => expect(bibleService.fetchBooks).toHaveBeenCalled());
    // Focus is elsewhere (a tab button), as after clicking one.
    const tab = screen.getByTestId('tab-old-testament');
    tab.focus();

    fireEvent.keyDown(tab, { key: 'j' });
    fireEvent.keyDown(tab, { key: 'o' });
    fireEvent.keyDown(tab, { key: 'x' });
    fireEvent.keyDown(tab, { key: 'Backspace' });
    expect(input).toHaveValue('jo');
    expect(document.activeElement).toBe(input);

    // Shortcuts are left alone.
    fireEvent.keyDown(tab, { key: 'c', metaKey: true });
    expect(input).toHaveValue('jo');
  });

  it('searches the words after a book name within that book, and can widen to all books', async () => {
    searchVerses.mockResolvedValue({ ...EAST_AND_WEST, results: [], totals: { exact: 0, words: 0 }, books: [] });
    const { input } = renderSelector();
    await waitFor(() => expect(bibleService.fetchBooks).toHaveBeenCalled());
    type(input, 'Psalms east and west');

    await waitFor(() => expect(searchVerses).toHaveBeenCalled());
    expect(searchVerses.mock.calls.at(-1)?.[0]).toMatchObject({ q: 'east and west', book: 19 });
    expect(await screen.findByTestId('verse-search-scope')).toHaveTextContent('in Psalms');

    fireEvent.click(screen.getByTestId('verse-search-scope-all'));
    await waitFor(() =>
      expect(searchVerses.mock.calls.at(-1)?.[0]).toMatchObject({ q: 'Psalms east and west' }),
    );
    expect(searchVerses.mock.calls.at(-1)?.[0].book).toBeUndefined();
  });

  it('shows exact-phrase matches, then all-words matches, with the words in bold', async () => {
    searchVerses.mockResolvedValue(EAST_AND_WEST);
    const { input } = renderSelector();
    type(input, 'east and west');

    const matthew = await screen.findByTestId('verse-result-40-8-11');
    expect(screen.getByText('Exact phrase')).toBeInTheDocument();
    expect(screen.getByText('All words')).toBeInTheDocument();
    expect([...matthew.querySelectorAll('strong')].map((b) => b.textContent)).toEqual([
      'east',
      'and',
      'west',
    ]);
    expect(searchVerses).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'east and west', version: expect.any(String) }),
    );
  });

  it('opens a result at its verse with Verse Insight', async () => {
    searchVerses.mockResolvedValue(EAST_AND_WEST);
    const { input, onClose } = renderSelector();
    type(input, 'east and west');
    fireEvent.click(await screen.findByTestId('verse-result-19-103-12'));

    expect(onClose).toHaveBeenCalled();
    expect(currentUrl).toBe('/bible/psalms/103?v=12&insight=1');
  });

  it('drops a slow response for text the user has typed past', async () => {
    let resolveFirst: (r: VerseSearchResponse) => void = () => {};
    searchVerses
      .mockImplementationOnce(() => new Promise((r) => (resolveFirst = r)))
      .mockResolvedValueOnce(EAST_AND_WEST);
    const { input } = renderSelector();

    type(input, 'east and');
    await waitFor(() => expect(searchVerses).toHaveBeenCalledTimes(1));
    type(input, 'east and west');
    await screen.findByTestId('verse-result-40-8-11');

    // The answer for "east and" arrives last and must not replace it.
    resolveFirst({ ...EAST_AND_WEST, results: [{ ...EAST_AND_WEST.results[1], verse: 99 }] });
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByTestId('verse-result-40-8-11')).toBeInTheDocument();
    expect(screen.queryByTestId('verse-result-19-103-99')).toBeNull();
    // The first request was also cancelled.
    expect(searchVerses.mock.calls[0][0].signal?.aborted).toBe(true);
  });

  it('is a combobox: arrow keys move the active result, Enter opens it', async () => {
    searchVerses.mockResolvedValue(EAST_AND_WEST);
    const { input } = renderSelector();
    type(input, 'east and west');
    await screen.findByTestId('verse-result-40-8-11');

    expect(input).toHaveAttribute('role', 'combobox');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveAttribute('aria-activedescendant', 'verse-result-19-103-12');
    expect(screen.getByTestId('verse-result-19-103-12')).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(currentUrl).toBe('/bible/psalms/103?v=12&insight=1');
  });

  it('filters by testament from the chips', async () => {
    searchVerses.mockResolvedValue(EAST_AND_WEST);
    const { input } = renderSelector();
    type(input, 'east and west');
    fireEvent.click(await screen.findByTestId('verse-filter-ot'));

    await waitFor(() =>
      expect(searchVerses).toHaveBeenLastCalledWith(expect.objectContaining({ testament: 'OT' })),
    );
  });

  it('keeps the title and tabs with a mouse: search mode is for touch screens', () => {
    const { input } = renderSelector();
    fireEvent.focus(input);
    expect(screen.getByTestId('search-chrome')).not.toHaveClass('is-folded');
  });

  it('says so when nothing matches', async () => {
    searchVerses.mockResolvedValue({
      results: [],
      nextCursor: null,
      totals: { exact: 0, words: 0 },
      books: [],
    });
    const { input } = renderSelector();
    type(input, 'zzqx');
    expect(await screen.findByText(/No verses match "zzqx"/)).toBeInTheDocument();
  });
});

describe('BookSelector search on a phone with the keyboard up', () => {
  const realMatchMedia = window.matchMedia;
  let viewport: EventTarget & { height: number; offsetTop: number; scale: number };

  const setKeyboard = (px: number) =>
    act(() => {
      viewport.height = window.innerHeight - px;
      viewport.dispatchEvent(new Event('resize'));
    });

  beforeEach(() => {
    localStorage.clear();
    searchVerses.mockReset();
    searchVerses.mockResolvedValue(EAST_AND_WEST);
    currentUrl = '';
    window.matchMedia = ((query: string) => ({
      ...realMatchMedia(query),
      matches: query === '(pointer: coarse)',
    })) as typeof window.matchMedia;
    viewport = Object.assign(new EventTarget(), {
      height: window.innerHeight,
      offsetTop: 0,
      scale: 1,
    });
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
  });

  afterEach(() => {
    window.matchMedia = realMatchMedia;
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: undefined });
  });

  const folded = () => screen.getByTestId('search-chrome').classList.contains('is-folded');

  it('enters search mode as soon as the field is tapped', () => {
    const { input } = renderSelector();
    expect(folded()).toBe(false);
    fireEvent.focus(input);
    expect(folded()).toBe(true);
    expect(screen.getByTestId('search-chrome')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('search-mode-back')).toHaveClass('is-shown');
  });

  it('stays in search mode when the keyboard closes', async () => {
    const { input } = renderSelector();
    input.focus();
    setKeyboard(320);
    type(input, 'east and west');
    await screen.findByTestId('verse-result-40-8-11');

    setKeyboard(0);
    input.blur();
    expect(folded()).toBe(true);
  });

  it('the arrow beside the bar leaves search mode and clears the text', async () => {
    const { input, onClose } = renderSelector();
    input.focus();
    type(input, 'east and west');
    await screen.findByTestId('verse-result-40-8-11');

    fireEvent.click(screen.getByTestId('search-mode-back'));
    expect(folded()).toBe(false);
    expect(input).toHaveValue('');
    expect(document.activeElement).not.toBe(input);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('uses a 16px field so iOS does not zoom in on focus', () => {
    const { input } = renderSelector();
    expect(input.style.fontSize).toBe('16px');
  });

  it("puts the keyboard away on its Search key instead of opening the first result", async () => {
    const { input, onClose } = renderSelector();
    input.focus();
    setKeyboard(320);
    type(input, 'east and west');
    await screen.findByTestId('verse-result-40-8-11');

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(document.activeElement).not.toBe(input);
    expect(onClose).not.toHaveBeenCalled();
    expect(currentUrl).toBe('/bible/john/1');
    expect(folded()).toBe(true);
  });

  it('still jumps to a typed reference on the Search key', async () => {
    const { input } = renderSelector();
    await waitFor(() => expect(bibleService.fetchBooks).toHaveBeenCalled());
    input.focus();
    type(input, 'jn 3.16');
    await screen.findByText('John 3:16');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(currentUrl).toBe('/bible/john/3?v=16');
  });

  it('puts the keyboard away when the results are dragged, staying in search mode', async () => {
    const { input } = renderSelector();
    input.focus();
    setKeyboard(320);
    type(input, 'east and west');
    const row = await screen.findByTestId('verse-result-40-8-11');

    fireEvent.touchMove(row);
    expect(document.activeElement).not.toBe(input);
    expect(folded()).toBe(true);
  });
});
