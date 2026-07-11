/**
 * Red-letter (words of Jesus) accessor.
 *
 * Thin, framework-agnostic wrapper around the shared `redLetterVerses.json`
 * dataset. The JSON file is the portable source of truth intended to be
 * shared verbatim with the mobile app; this module only adds typed lookup
 * helpers for the web client.
 *
 * The dataset marks every verse that contains any words spoken by Jesus,
 * keyed by canonical bookId (1=Genesis … 66=Revelation) → chapter → verse
 * numbers. It is derived from the World English Bible (public domain) `\wj`
 * markers, so it is translation-independent at the verse level.
 */
import redLetterData from './redLetterVerses.json';

interface RedLetterBook {
  name: string;
  usfm: string;
  chapters: Record<string, number[]>;
}

interface RedLetterDataset {
  name: string;
  description: string;
  source: string;
  color: string;
  totalVerses: number;
  books: Record<string, RedLetterBook>;
}

export const RED_LETTER: RedLetterDataset = redLetterData as RedLetterDataset;

/** Highlight color used for the words of Jesus. */
export const RED_LETTER_COLOR = 'red';

/**
 * Verse numbers in the given chapter that contain words of Jesus.
 * Returns an empty array for chapters with none.
 */
export function getRedLetterVerses(bookId: number, chapter: number): number[] {
  return RED_LETTER.books[String(bookId)]?.chapters[String(chapter)] ?? [];
}

/** Fast membership check for a single verse. */
export function isRedLetterVerse(
  bookId: number,
  chapter: number,
  verse: number
): boolean {
  return getRedLetterVerses(bookId, chapter).includes(verse);
}

/** Whether a book contains any words of Jesus at all. */
export function bookHasRedLetter(bookId: number): boolean {
  return Boolean(RED_LETTER.books[String(bookId)]);
}
