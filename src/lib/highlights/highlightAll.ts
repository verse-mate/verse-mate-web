/**
 * "Highlight all": every place a word or phrase occurs in a book.
 *
 * Highlighting a book's repeated words and phrases is a common study method — "I am" through
 * John. The reader selects the words once and the selection toolbar's "All in John" highlights
 * each occurrence. Same matching as the mobile app (lib/highlights/highlight-all.ts there), so a
 * phrase highlights the same places on both.
 *
 * Matches are found in the same verse text the reader shows and stores highlight offsets against
 * (the chapter fetch), not through search: search's exact match is a stemmed full-text phrase, so
 * a short phrase of common words is exactly what it handles worst.
 */

export interface PhraseOccurrence {
  chapter: number;
  verse: number;
  /** Offset into the verse's own text, inclusive. */
  start: number;
  /** Offset into the verse's own text, exclusive. */
  end: number;
  /** The words as they appear there (case can differ from the selection). */
  text: string;
}

export interface ChapterVerses {
  verseNumber: number;
  text: string;
}

const REGEX_SPECIAL = /[.*+?^${}()|[\]\\]/g;
const APOSTROPHES = /['’‘]/g;

/**
 * A pattern for the phrase: case-insensitive, any run of whitespace between words, either
 * apostrophe, and whole words only — "am" must not match inside "Amos" or "lamb".
 */
function phrasePattern(phrase: string): RegExp | null {
  const words = phrase.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;
  const body = words
    .map((word) => word.replace(REGEX_SPECIAL, '\\$&').replace(APOSTROPHES, "['’‘]"))
    .join('\\s+');
  // The end is a lookahead; the start is checked by hand in findPhraseOccurrences (kept the same
  // as the mobile app, whose engine is not trusted with lookbehind).
  return new RegExp(`${body}(?![\\p{L}\\p{N}])`, 'giu');
}

const WORD_CHAR = /[\p{L}\p{N}]/u;

/** Every whole-word occurrence of `phrase` in `text`, as [start, end) offsets. */
export function findPhraseOccurrences(
  text: string,
  phrase: string
): { start: number; end: number; text: string }[] {
  const pattern = phrasePattern(phrase);
  if (!pattern) return [];
  const found: { start: number; end: number; text: string }[] = [];
  let match = pattern.exec(text);
  while (match) {
    const start = match.index;
    if (start > 0 && WORD_CHAR.test(text[start - 1])) {
      // Inside a word: retry from the next character, so a real match that begins within this
      // one is not skipped.
      pattern.lastIndex = start + 1;
    } else {
      found.push({ start, end: start + match[0].length, text: match[0] });
    }
    match = pattern.exec(text);
  }
  return found;
}

/**
 * Every occurrence of `phrase` in a book, chapter by chapter, in Bible order.
 *
 * `loadChapter` returns a chapter's verses, or null when it cannot be read; such a chapter is
 * skipped and counted in `missingChapters`, so the caller can say the result is partial. Chapters
 * load a few at a time; the result is still in chapter order.
 */
export async function collectBookOccurrences({
  phrase,
  chapterCount,
  loadChapter,
  signal,
  concurrency = 6,
}: {
  phrase: string;
  chapterCount: number;
  loadChapter: (chapter: number) => Promise<ChapterVerses[] | null>;
  signal?: AbortSignal;
  concurrency?: number;
}): Promise<{ occurrences: PhraseOccurrence[]; missingChapters: number[] }> {
  const byChapter: (ChapterVerses[] | null)[] = new Array(chapterCount + 1).fill(null);
  let next = 1;
  const worker = async () => {
    while (next <= chapterCount) {
      if (signal?.aborted) return;
      const chapter = next++;
      try {
        byChapter[chapter] = await loadChapter(chapter);
      } catch {
        byChapter[chapter] = null;
      }
    }
  };
  await Promise.all(
    Array.from({ length: Math.max(1, Math.min(concurrency, chapterCount)) }, worker)
  );

  const occurrences: PhraseOccurrence[] = [];
  const missingChapters: number[] = [];
  for (let chapter = 1; chapter <= chapterCount; chapter++) {
    const verses = byChapter[chapter];
    if (!verses) {
      missingChapters.push(chapter);
      continue;
    }
    for (const verse of verses) {
      for (const hit of findPhraseOccurrences(verse.text, phrase)) {
        occurrences.push({ chapter, verse: verse.verseNumber, ...hit });
      }
    }
  }
  return { occurrences, missingChapters };
}

/** More than this asks the reader first: "and" in Genesis would paint the whole book. */
export const HIGHLIGHT_ALL_CONFIRM_ABOVE = 100;

/** Longest selection "All in <book>" is offered for: a word or a phrase, not a sentence. */
export const HIGHLIGHT_ALL_MAX_WORDS = 6;

/** Whether "All in <book>" applies: words within one verse, at most HIGHLIGHT_ALL_MAX_WORDS. */
export function canHighlightAll(text: string, startVerse: number, endVerse: number): boolean {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return startVerse === endVerse && words.length > 0 && words.length <= HIGHLIGHT_ALL_MAX_WORDS;
}
