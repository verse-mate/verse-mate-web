import { describe, expect, it } from 'vitest';
import { ReferenceParser } from '@versemate/bible-search';
import { splitBookScope } from './bookScope';

const parser = new ReferenceParser([
  { bookId: 1, name: 'Genesis', chapters: 50 },
  { bookId: 19, name: 'Psalms', chapters: 150 },
  { bookId: 22, name: 'Song of Solomon', chapters: 8 },
  { bookId: 23, name: 'Isaiah', chapters: 66 },
  { bookId: 30, name: 'Amos', chapters: 9 },
  { bookId: 41, name: 'Mark', chapters: 16 },
  { bookId: 43, name: 'John', chapters: 21 },
  { bookId: 62, name: '1 John', chapters: 5 },
]);

describe('splitBookScope', () => {
  it('searches the words after a book name within that book', () => {
    expect(splitBookScope('Amos day of the Lord', parser)).toEqual({
      bookId: 30,
      bookName: 'Amos',
      text: 'day of the Lord',
    });
  });

  it('understands numbered books, the start of a name and case', () => {
    expect(splitBookScope('1 john love', parser)?.bookId).toBe(62);
    expect(splitBookScope('gen light', parser)?.bookId).toBe(1);
    expect(splitBookScope('psalm shepherd', parser)?.bookId).toBe(19);
  });

  it('keeps the trailing space that marks a finished word', () => {
    expect(splitBookScope('Amos justice ', parser)?.text).toBe('justice ');
  });

  it('leaves references and book names alone', () => {
    expect(splitBookScope('John 3:16', parser)).toBeNull();
    expect(splitBookScope('1 John 4', parser)).toBeNull();
    expect(splitBookScope('Song of Solomon', parser)).toBeNull();
    expect(splitBookScope('Amos', parser)).toBeNull();
  });

  it('does not take ordinary words or short abbreviations for a book', () => {
    expect(splitBookScope('love your neighbor', parser)).toBeNull();
    expect(splitBookScope('is the light', parser)).toBeNull();
    expect(splitBookScope('Amos a', parser)).toBeNull();
  });
});
