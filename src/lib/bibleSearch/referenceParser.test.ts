import { describe, expect, it } from 'vitest';
import { ReferenceParser, type BookInfo } from './referenceParser';

// Chapter counts of the Protestant canon, in book-id order.
const CHAPTERS = [
  50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150, 31, 12, 8, 66, 52,
  5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4, 28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5,
  3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22,
];
const NAMES = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah',
  'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah',
  'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark',
  'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
  'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation',
];
const BOOKS: BookInfo[] = NAMES.map((name, i) => ({ bookId: i + 1, name, chapters: CHAPTERS[i] }));

const parser = new ReferenceParser(BOOKS);
const one = (input: string) => {
  const refs = parser.parse(input);
  return refs.length === 1 ? refs[0] : null;
};
const display = (input: string) => parser.parse(input).map((r) => r.display);

describe('ReferenceParser', () => {
  it.each([
    ['John 3:16', 'John 3:16'],
    ['jn 3.16', 'John 3:16'],
    ['john 3 16', 'John 3:16'],
    ['JHN 3:16', 'John 3:16'],
    ['1 Cor 13', '1 Corinthians 13'],
    ['1co 13:4-7', '1 Corinthians 13:4–7'],
    ['1 Co 13:4 - 7', '1 Corinthians 13:4–7'],
    ['First John 4', '1 John 4'],
    ['I John 4', '1 John 4'],
    ['1st jn 4:8', '1 John 4:8'],
    ['II Tim 3:16', '2 Timothy 3:16'],
    ['Rom 8:28-39', 'Romans 8:28–39'],
    ['Gen 1:1-2:3', 'Genesis 1:1–2:3'],
    ['Gen 1:1–2:3', 'Genesis 1:1–2:3'],
    ['Ps 23', 'Psalms 23'],
    ['psalm 119:105', 'Psalms 119:105'],
    ['Song of Songs 2:4', 'Song of Solomon 2:4'],
    ['Jude 3', 'Jude 3'],
    ['Jude 1:3', 'Jude 3'],
    ['Phm 6', 'Philemon 6'],
    ['Phil 4:13', 'Philippians 4:13'],
    ['Revelations 21:4', 'Revelation 21:4'],
    ['Philipians 4:13', 'Philippians 4:13'],
    ['Genisis 1', 'Genesis 1'],
    ['revel 3:20', 'Revelation 3:20'],
    ['Romans', 'Romans'],
  ])('%s → %s', (input, expected) => {
    expect(one(input)?.display).toBe(expected);
  });

  it('reads the parts of a reference', () => {
    expect(one('Rom 8:28-39')).toMatchObject({
      bookId: 45,
      chapter: 8,
      verseStart: 28,
      verseEnd: 39,
    });
    expect(one('Gen 1:1-2:3')).toMatchObject({
      bookId: 1,
      chapter: 1,
      verseStart: 1,
      chapterEnd: 2,
      verseEnd: 3,
    });
    expect(one('Jude 3')).toMatchObject({ bookId: 65, chapter: 1, verseStart: 3 });
  });

  it('reads several references separated by semicolons', () => {
    expect(display('Ps 23; Isa 53:5')).toEqual(['Psalms 23', 'Isaiah 53:5']);
  });

  it('rejects text that is not a reference', () => {
    expect(parser.parse('east and west')).toEqual([]);
    expect(parser.parse('love')).toEqual([]);
    expect(parser.parse('God so loved the world')).toEqual([]);
    expect(parser.parse('Ps 23; love')).toEqual([]);
  });

  it('rejects a chapter past the end of the book', () => {
    expect(parser.parse('John 22')).toEqual([]);
    expect(parser.parse('Ps 151')).toEqual([]);
  });

  it('keeps short abbreviations for chapter references only', () => {
    expect(parser.parse('is')).toEqual([]);
    expect(parser.parse('so')).toEqual([]);
    expect(one('is 53:5')?.display).toBe('Isaiah 53:5');
  });

  it('still reads book names that are ordinary words', () => {
    expect(one('job')?.display).toBe('Job');
    expect(one('acts')?.display).toBe('Acts');
  });

  it('does not guess between two books from an ambiguous prefix', () => {
    expect(parser.parse('phi')).toEqual([]); // Philippians or Philemon
    expect(one('philip')?.display).toBe('Philippians');
  });

  it('reads localized book names, accents optional', () => {
    const ro = new ReferenceParser(BOOKS, { 1: 'Geneza', 50: 'Filipeni', 2: 'Exodul' });
    expect(ro.parse('Geneza 1:1')[0]?.display).toBe('Genesis 1:1');
    expect(ro.parse('filipeni 4:13')[0]?.bookId).toBe(50);
    const fr = new ReferenceParser(BOOKS, { 1: 'Genèse', 66: 'Apocalypse' });
    expect(fr.parse('genese 3')[0]?.bookId).toBe(1);
    const de = new ReferenceParser(BOOKS, { 1: '1. Mose' });
    expect(de.parse('1. Mose 1:1')[0]?.bookId).toBe(1);
  });
});
