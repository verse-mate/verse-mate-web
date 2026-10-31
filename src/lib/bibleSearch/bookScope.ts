import { normalizeBookText, type ReferenceParser } from '@versemate/bible-search';

/**
 * "Amos day of the Lord" → search "day of the Lord" inside Amos.
 *
 * The search box used to send the whole text to the verse search, so a book
 * name in front of the words ("Amos XYZ") had to appear in the verse itself
 * and nothing matched. When the text starts with a book's name and goes on
 * with words (not numbers — "John 3:16" is a reference), the words are
 * searched within that book instead.
 *
 * To keep ordinary phrases from being taken for a book, the leading words
 * must be the book's full name, the start of it ("Gen", "Psalm", "Rev"), or a
 * multi-word name ("Song of Songs") — not a typo match or a two-letter
 * abbreviation. Text that is itself a reference ("Song of Solomon", "1 John")
 * is left alone.
 *
 * Shared logic with verse-mate-mobile (utils/bible/bookScope.ts).
 */
export interface BookScope {
  bookId: number;
  bookName: string;
  /** The words to look for, as typed (a trailing space is kept). */
  text: string;
}

const MAX_BOOK_WORDS = 4; // "Song of Songs", "Revelation of John"
const MIN_LETTERS = 2;

export function splitBookScope(
  query: string,
  parser: ReferenceParser,
  localizedNames: Record<number, string> = {},
): BookScope | null {
  const trimmed = query.trim();
  const words = trimmed.split(/\s+/);
  if (words.length < 2) return null;
  // The whole text is a book or a reference: nothing to scope.
  if (parser.parse(trimmed).length > 0) return null;

  for (let n = Math.min(MAX_BOOK_WORDS, words.length - 1); n >= 1; n--) {
    const head = words.slice(0, n).join(' ');
    const rest = query.replace(new RegExp(`^\\s*(?:\\S+\\s+){${n}}`), '');
    if (/^\s*\d/.test(rest)) continue; // a chapter / verse follows
    if ((rest.match(/\p{L}/gu) ?? []).length < MIN_LETTERS) continue;
    const refs = parser.parse(head);
    if (refs.length !== 1 || refs[0].chapter !== undefined) continue;
    const ref = refs[0];
    const key = normalizeBookText(head);
    const names = [ref.bookName, localizedNames[ref.bookId]]
      .filter((name): name is string => !!name)
      .map(normalizeBookText);
    const startsName = key.length >= 3 && names.some(name => name.startsWith(key));
    const multiWord = key.includes(' ') && /\p{L}{3,}/u.test(key);
    if (!startsName && !multiWord) continue;
    return { bookId: ref.bookId, bookName: ref.bookName, text: rest };
  }
  return null;
}
