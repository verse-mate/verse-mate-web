/**
 * Book slug utilities — ported from verse-mate/apps/frontend-next/src/lib/bookSlugs.ts.
 * Source-of-truth for the URL slug ↔ canonical book ID mapping. These slugs
 * are what's indexed in Google for app.versemate.org URLs like
 * /bible/genesis/1, so we MUST match them exactly.
 */

export const BOOK_SLUGS: Record<number, string> = {
  // Old Testament
  1: 'genesis',
  2: 'exodus',
  3: 'leviticus',
  4: 'numbers',
  5: 'deuteronomy',
  6: 'joshua',
  7: 'judges',
  8: 'ruth',
  9: '1-samuel',
  10: '2-samuel',
  11: '1-kings',
  12: '2-kings',
  13: '1-chronicles',
  14: '2-chronicles',
  15: 'ezra',
  16: 'nehemiah',
  17: 'esther',
  18: 'job',
  19: 'psalms',
  20: 'proverbs',
  21: 'ecclesiastes',
  22: 'song-of-solomon',
  23: 'isaiah',
  24: 'jeremiah',
  25: 'lamentations',
  26: 'ezekiel',
  27: 'daniel',
  28: 'hosea',
  29: 'joel',
  30: 'amos',
  31: 'obadiah',
  32: 'jonah',
  33: 'micah',
  34: 'nahum',
  35: 'habakkuk',
  36: 'zephaniah',
  37: 'haggai',
  38: 'zechariah',
  39: 'malachi',
  // New Testament
  40: 'matthew',
  41: 'mark',
  42: 'luke',
  43: 'john',
  44: 'acts',
  45: 'romans',
  46: '1-corinthians',
  47: '2-corinthians',
  48: 'galatians',
  49: 'ephesians',
  50: 'philippians',
  51: 'colossians',
  52: '1-thessalonians',
  53: '2-thessalonians',
  54: '1-timothy',
  55: '2-timothy',
  56: 'titus',
  57: 'philemon',
  58: 'hebrews',
  59: 'james',
  60: '1-peter',
  61: '2-peter',
  62: '1-john',
  63: '2-john',
  64: '3-john',
  65: 'jude',
  66: 'revelation',
};

const SLUG_TO_BOOK_ID: Record<string, number> = Object.entries(BOOK_SLUGS).reduce(
  (acc, [id, slug]) => {
    acc[slug] = Number(id);
    return acc;
  },
  {} as Record<string, number>,
);

export function getBookSlug(bookId: number): string | null {
  return BOOK_SLUGS[bookId] ?? null;
}

export function getBookIdFromSlug(slug: string): number | null {
  return SLUG_TO_BOOK_ID[slug.toLowerCase()] ?? null;
}

/**
 * Convert a display name (e.g. "2 Kings", "Song of Solomon") to its canonical
 * URL slug ("2-kings", "song-of-solomon"). Spaces become hyphens; everything
 * is lowercased. Use this whenever you have a `book.name` (display form) and
 * need to match it against the slug-keyed maps (BOOKS_WITH_VISUALS, etc.).
 *
 * Why this exists: state.book is the API's display name. Latent bug
 * `ffdb4d3` hid the Visuals tab on every hyphenated-slug book because a raw
 * .toLowerCase() turns "2 Kings" into "2 kings" — space, not hyphen — and
 * misses the registry key "2-kings".
 */
export function nameToSlug(name: string | null | undefined): string {
  return (name || '').toLowerCase().replace(/ /g, '-');
}

/**
 * Accepts either a numeric book ID (1–66) or a slug, returns the canonical
 * numeric ID. Used by the /bible/<bookId>/<chapter> route to support both
 * legacy numeric URLs (which we 301-redirect to slug URLs) and slug URLs.
 */
export function parseBookParam(param: string): number | null {
  // Pure-digit input only — otherwise slugs like `1-john` would be parsed
  // as 1 (Genesis), because Number.parseInt stops at the first non-digit.
  if (/^\d+$/.test(param)) {
    const numericId = Number.parseInt(param, 10);
    if (numericId >= 1 && numericId <= 66) return numericId;
    return null;
  }
  return getBookIdFromSlug(param);
}
