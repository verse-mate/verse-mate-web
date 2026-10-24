/**
 * Bible reference parser for the search box: turns "jn 3.16", "1co 13:4-7",
 * "First John 4", "Ps 23; Isa 53:5" or "Philipians 4" into references.
 *
 * Self-contained (no imports) so it can move into a shared package when the
 * mobile app adopts search. Book ids follow the reader's books.book_id
 * (1 = Genesis … 66 = Revelation).
 *
 * Book names it knows:
 *   - the English names and common abbreviations below,
 *   - localized names passed in by the caller (the version's
 *     version_book_names, e.g. "Geneza", "1. Mose"),
 *   - small typos in either ("Revelations", "Philipians"), by edit distance.
 *
 * Book names that are also ordinary words ("job", "mark", "acts", "numbers")
 * still parse as books. The search screen shows them as a "Go to" row next to
 * the verse results, so the word search is not lost. Two-letter
 * abbreviations ("is", "so", "am") only count when a chapter follows them.
 */

export interface BookInfo {
  bookId: number;
  name: string;
  /** Number of chapters, used to validate and to spot one-chapter books. */
  chapters: number;
}

export interface BibleReference {
  bookId: number;
  bookName: string;
  /** Absent for a book-only reference ("Romans"). */
  chapter?: number;
  verseStart?: number;
  /** Last verse of a range; with `chapterEnd`, a verse in a later chapter. */
  verseEnd?: number;
  chapterEnd?: number;
  /** "John 3:16", "1 Corinthians 13:4–7", "Genesis 1:1–2:3". */
  display: string;
}

/** English abbreviations and alternate names, by book id. Lower case, no dots. */
const ALIASES: Record<number, string[]> = {
  1: ['gen', 'ge', 'gn'],
  2: ['exod', 'exo', 'ex'],
  3: ['lev', 'le', 'lv'],
  4: ['num', 'nu', 'nm', 'nb'],
  5: ['deut', 'deu', 'dt'],
  6: ['josh', 'jos', 'jsh'],
  7: ['judg', 'jdg', 'jg', 'jdgs'],
  8: ['rut', 'ru', 'rth'],
  9: ['1 sam', '1 sa', '1 sm', '1 samuel', '1 kingdoms'],
  10: ['2 sam', '2 sa', '2 sm', '2 kingdoms'],
  11: ['1 kgs', '1 ki', '1 kin', '1 kg'],
  12: ['2 kgs', '2 ki', '2 kin', '2 kg'],
  13: ['1 chron', '1 chr', '1 ch'],
  14: ['2 chron', '2 chr', '2 ch'],
  15: ['ezr', 'ez'],
  16: ['neh', 'ne'],
  17: ['esth', 'est', 'es'],
  18: ['jb'],
  19: ['ps', 'psa', 'psalm', 'pss', 'psm', 'pslm'],
  20: ['prov', 'pro', 'prv', 'pr'],
  21: ['eccl', 'ecc', 'eccles', 'ec', 'qoh', 'qoheleth'],
  22: ['song', 'song of songs', 'sos', 'so', 'sg', 'canticles', 'cant'],
  23: ['isa', 'is'],
  24: ['jer', 'je', 'jr'],
  25: ['lam', 'la'],
  26: ['ezek', 'eze', 'ezk'],
  27: ['dan', 'da', 'dn'],
  28: ['hos', 'ho'],
  29: ['joe', 'jl'],
  30: ['amo', 'am'],
  31: ['obad', 'oba', 'ob'],
  32: ['jnh', 'jon'],
  33: ['mic', 'mc'],
  34: ['nah', 'na'],
  35: ['hab', 'hb'],
  36: ['zeph', 'zep', 'zp'],
  37: ['hag', 'hg'],
  38: ['zech', 'zec', 'zc'],
  39: ['mal', 'ml'],
  40: ['matt', 'mat', 'mt'],
  41: ['mrk', 'mar', 'mk', 'mr'],
  42: ['luk', 'lk'],
  43: ['joh', 'jhn', 'jn'],
  44: ['act', 'ac'],
  45: ['rom', 'ro', 'rm'],
  46: ['1 cor', '1 co'],
  47: ['2 cor', '2 co'],
  48: ['gal', 'ga'],
  49: ['eph', 'ephes'],
  50: ['phil', 'php', 'pp'],
  51: ['col'],
  52: ['1 thess', '1 thes', '1 th'],
  53: ['2 thess', '2 thes', '2 th'],
  54: ['1 tim', '1 ti', '1 tm'],
  55: ['2 tim', '2 ti', '2 tm'],
  56: ['tit', 'ti'],
  57: ['philem', 'phm', 'pm'],
  58: ['heb'],
  59: ['jas', 'jm'],
  60: ['1 pet', '1 pe', '1 pt', '1 p'],
  61: ['2 pet', '2 pe', '2 pt', '2 p'],
  62: ['1 jn', '1 jhn', '1 joh', '1 jo', '1 j'],
  63: ['2 jn', '2 jhn', '2 joh', '2 jo', '2 j'],
  64: ['3 jn', '3 jhn', '3 joh', '3 jo', '3 j'],
  65: ['jud', 'jd'],
  66: ['rev', 're', 'rv', 'revelation of john', 'apocalypse', 'apoc'],
};

const ORDINALS: Record<string, string> = {
  first: '1', '1st': '1', i: '1',
  second: '2', '2nd': '2', ii: '2',
  third: '3', '3rd': '3', iii: '3',
};

/** Lower case, accents off, dots dropped, "1co" → "1 co", "I John" → "1 john". */
export function normalizeBookText(s: string): string {
  let t = s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Latin combining accents only
    .toLowerCase()
    .replace(/\./g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const m = t.match(/^(first|second|third|1st|2nd|3rd|iii|ii|i)\s+(.+)$/);
  if (m) t = `${ORDINALS[m[1]]} ${m[2]}`;
  return t.replace(/^([123])\s*(?=\p{L})/u, '$1 ');
}

interface NameEntry {
  key: string;
  bookId: number;
  /** Full names allow typos; short abbreviations must match exactly. */
  fuzzy: boolean;
}

export class ReferenceParser {
  private readonly books = new Map<number, BookInfo>();
  private readonly names: NameEntry[] = [];

  /**
   * @param books the 66 books (English names, chapter counts)
   * @param localizedNames bookId → the current version's name for it
   */
  constructor(books: BookInfo[], localizedNames: Record<number, string> = {}) {
    const seen = new Set<string>();
    const add = (name: string, bookId: number, fuzzy: boolean) => {
      const key = normalizeBookText(name);
      if (!key || seen.has(`${key}|${bookId}`)) return;
      seen.add(`${key}|${bookId}`);
      this.names.push({ key, bookId, fuzzy });
    };
    for (const book of books) {
      this.books.set(book.bookId, book);
      add(book.name, book.bookId, true);
      for (const alias of ALIASES[book.bookId] ?? []) add(alias, book.bookId, false);
    }
    for (const [id, name] of Object.entries(localizedNames)) {
      if (this.books.has(Number(id))) add(name, Number(id), true);
    }
    // Longest first, so "1 john" wins over "john" and "song of songs" over "song".
    this.names.sort((a, b) => b.key.length - a.key.length);
  }

  /**
   * Every reference in the input (separated by ";"), or [] when any part
   * isn't a reference — the input is then a text search.
   */
  parse(input: string): BibleReference[] {
    const parts = input.split(';').map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) return [];
    const refs: BibleReference[] = [];
    for (const part of parts) {
      const ref = this.parseOne(part);
      if (!ref) return [];
      refs.push(ref);
    }
    return refs;
  }

  private parseOne(raw: string): BibleReference | null {
    const text = normalizeBookText(raw);
    // Split "john 3:16" into a book part and a numbers part.
    const m = text.match(/^(.*?\p{L}[^\d]*?)\s*(\d.*)?$/u);
    if (!m) return null;
    const bookText = m[1].trim();
    const numbers = (m[2] ?? '').trim();
    const book = this.findBook(bookText, numbers !== '');
    if (!book) return null;
    if (!numbers) return this.make(book, {});

    // chapter[:verse][-[chapter:]verse], with ":" "." or a space between
    // chapter and verse, and "-" "–" "—" for ranges.
    const n = numbers.replace(/[–—]/g, '-').replace(/\s*-\s*/g, '-');
    const r = n.match(/^(\d+)(?:[:.\s](\d+))?(?:-(\d+)(?:[:.](\d+))?)?$/);
    if (!r) return null;
    const a = Number(r[1]);
    const b = r[2] ? Number(r[2]) : undefined;
    const c = r[3] ? Number(r[3]) : undefined;
    const d = r[4] ? Number(r[4]) : undefined;

    // One-chapter books: "Jude 3" is verse 3, "Jude 3-5" verses 3-5.
    if (book.chapters === 1 && b === undefined) {
      return this.make(book, { chapter: 1, verseStart: a, verseEnd: c });
    }
    if (a < 1 || a > book.chapters) return null;
    if (b === undefined) {
      // "Ps 23" or a chapter range "Ps 23-24": go to the first chapter.
      return c !== undefined && d === undefined
        ? this.make(book, { chapter: a, chapterEnd: c > a ? c : undefined })
        : this.make(book, { chapter: a });
    }
    if (d !== undefined) {
      // "Gen 1:1-2:3"
      if (c === undefined || c < a || c > book.chapters) return null;
      return this.make(book, {
        chapter: a,
        verseStart: b,
        chapterEnd: c === a ? undefined : c,
        verseEnd: d,
      });
    }
    return this.make(book, {
      chapter: a,
      verseStart: b,
      verseEnd: c !== undefined && c > b ? c : undefined,
    });
  }

  private findBook(text: string, hasNumbers: boolean): BookInfo | null {
    if (!text) return null;
    // Exact name or alias.
    for (const entry of this.names) {
      if (entry.key !== text) continue;
      if (!entry.fuzzy && entry.key.length <= 2 && !hasNumbers) return null;
      return this.books.get(entry.bookId) ?? null;
    }
    // Unambiguous prefix of a full name ("revel", "philip" → Philippians is
    // ambiguous with Philemon, so it falls through to the aliases above).
    if (text.length >= 3) {
      const ids = new Set(
        this.names.filter((e) => e.fuzzy && e.key.startsWith(text)).map((e) => e.bookId),
      );
      if (ids.size === 1) return this.books.get([...ids][0]) ?? null;
    }
    // Typos in a full name: 1 edit for 4–6 letters, 2 for longer names.
    if (text.length >= 4) {
      let best: { bookId: number; d: number } | null = null;
      let tie = false;
      for (const entry of this.names) {
        if (!entry.fuzzy) continue;
        const max = entry.key.length >= 7 ? 2 : 1;
        if (Math.abs(entry.key.length - text.length) > max) continue;
        const d = editDistance(text, entry.key, max);
        if (d > max) continue;
        if (!best || d < best.d) {
          best = { bookId: entry.bookId, d };
          tie = false;
        } else if (d === best.d && entry.bookId !== best.bookId) {
          tie = true;
        }
      }
      if (best && !tie) return this.books.get(best.bookId) ?? null;
    }
    return null;
  }

  private make(
    book: BookInfo,
    parts: Omit<BibleReference, 'bookId' | 'bookName' | 'display'>,
  ): BibleReference {
    const { chapter, verseStart, verseEnd, chapterEnd } = parts;
    let display = book.name;
    if (chapter !== undefined) {
      display += book.chapters === 1 && verseStart !== undefined ? ' ' : ` ${chapter}`;
      if (verseStart !== undefined) {
        display += book.chapters === 1 ? `${verseStart}` : `:${verseStart}`;
        if (chapterEnd !== undefined && verseEnd !== undefined) {
          display += `–${chapterEnd}:${verseEnd}`;
        } else if (verseEnd !== undefined) {
          display += `–${verseEnd}`;
        }
      } else if (chapterEnd !== undefined) {
        display += `–${chapterEnd}`;
      }
    }
    return { bookId: book.bookId, bookName: book.name, ...parts, display };
  }
}

/** Optimal-string-alignment distance, giving up once it exceeds `max`. */
function editDistance(a: string, b: string, max: number): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, (_, i) => {
    const row = new Array<number>(cols).fill(0);
    row[0] = i;
    return row;
  });
  for (let j = 0; j < cols; j++) d[0][j] = j;
  for (let i = 1; i < rows; i++) {
    let rowMin = Infinity;
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, d[i - 2][j - 2] + 1);
      }
      d[i][j] = v;
      rowMin = Math.min(rowMin, v);
    }
    if (rowMin > max) return max + 1;
  }
  return d[rows - 1][cols - 1];
}
