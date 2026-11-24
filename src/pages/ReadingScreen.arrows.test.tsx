import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { location, nextArrow, previousArrow, renderAt } from './readingScreenArrows.harness';
import * as bibleService from '@/services/bibleService';

vi.hoisted(() => {
  window.history.replaceState(null, '', '/bible/romans/12');
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

beforeEach(() => vi.clearAllMocks());

function followedByBrowser(arrow: HTMLElement, init: MouseEventInit) {
  let prevented: boolean | null = null;
  const record = (event: Event) => {
    prevented = event.defaultPrevented;
    event.preventDefault();
  };
  document.addEventListener('click', record);
  fireEvent.click(arrow, init);
  document.removeEventListener('click', record);
  return prevented === false;
}

describe('the reader chapter arrows', () => {
  it('are links to the neighbouring chapters, with the names they had as buttons', async () => {
    renderAt('/bible/romans/12');

    const next = await nextArrow();
    const previous = await previousArrow();

    expect(next.tagName).toBe('A');
    expect(next.getAttribute('href')).toBe('/bible/romans/13');
    expect(next.getAttribute('aria-label')).toBe('Next chapter');
    expect(previous.tagName).toBe('A');
    expect(previous.getAttribute('href')).toBe('/bible/romans/11');
    expect(previous.getAttribute('aria-label')).toBe('Previous chapter');
  });

  it('move to the next chapter inside the reader on a plain click', async () => {
    renderAt('/bible/romans/12');
    const next = await nextArrow();

    expect(followedByBrowser(next, {})).toBe(false);
    await waitFor(() => expect(location()).toBe('/bible/romans/13'));
    expect(vi.mocked(bibleService.fetchChapter)).toHaveBeenCalledWith('Romans', 13, expect.anything());
  });

  it('leave a modified click to the browser, so the chapter opens in a new tab', async () => {
    renderAt('/bible/romans/12');
    const next = await nextArrow();

    for (const modifier of [{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }]) {
      expect(followedByBrowser(next, modifier), JSON.stringify(modifier)).toBe(true);
    }
    expect(location()).toBe('/bible/romans/12');
  });

  it('leave Enter to the link itself, which follows it as a click', async () => {
    renderAt('/bible/romans/12');
    const next = await nextArrow();
    next.focus();

    expect(fireEvent.keyDown(next, { key: 'Enter', code: 'Enter' })).toBe(true);
    expect(location()).toBe('/bible/romans/12');
  });

  it('move to the next chapter on Space without scrolling the page', async () => {
    renderAt('/bible/romans/12');
    const next = await nextArrow();
    next.focus();

    const scrolled = fireEvent.keyDown(next, { key: ' ', code: 'Space' });

    expect(scrolled).toBe(false);
    await waitFor(() => expect(location()).toBe('/bible/romans/13'));
  });

  it('move one chapter, not several, while Space is held down', async () => {
    renderAt('/bible/romans/12');
    const next = await nextArrow();
    next.focus();

    fireEvent.keyDown(next, { key: ' ', code: 'Space' });
    await waitFor(() => expect(location()).toBe('/bible/romans/13'));
    const held = await nextArrow();
    expect(fireEvent.keyDown(held, { key: ' ', code: 'Space', repeat: true })).toBe(false);
    expect(fireEvent.keyDown(held, { key: ' ', code: 'Space', repeat: true })).toBe(false);

    expect(location()).toBe('/bible/romans/13');
  });

  it('show no next arrow on the last chapter of a book and no previous arrow on the first', async () => {
    const last = renderAt('/bible/romans/16');
    await previousArrow();
    expect(screen.queryByTestId('next-chapter-button')).toBeNull();
    last.unmount();

    renderAt('/bible/romans/1');
    await nextArrow();
    expect(screen.queryByTestId('previous-chapter-button')).toBeNull();
  });

  it('link the /bible address from the /read route too', async () => {
    renderAt('/read');

    expect((await nextArrow()).getAttribute('href')).toBe('/bible/romans/13');
  });
});
