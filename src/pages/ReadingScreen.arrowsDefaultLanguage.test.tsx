import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { location, nextArrow, previousArrow, renderAt } from './readingScreenArrows.harness';

vi.hoisted(() => {
  window.history.replaceState(null, '', '/bible/romans/12?lang=en-US');
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

describe('the reader chapter arrows during a ?lang=en-US visit', () => {
  it('give the default language no lang in their address', async () => {
    renderAt('/bible/romans/12?lang=en-US');

    expect((await nextArrow()).getAttribute('href')).toBe('/bible/romans/13');
    expect((await previousArrow()).getAttribute('href')).toBe('/bible/romans/11');
  });
});
