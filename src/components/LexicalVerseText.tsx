import TokenizedVerse from '@/components/TokenizedVerse';
import type { ChapterAlignment } from '@versemate/lexicon';
import type { VerseToken } from '@/services/types';

/**
 * Placeholder alignment passed to TokenizedVerse when the backend supplied
 * Strong's tokens but the legacy lexicon alignment hasn't loaded yet (or
 * doesn't exist for this book — e.g. non-English chapters where backend
 * tokens are the only source). TokenizedVerse short-circuits to the
 * wireTokens path before touching this object, so the empty bookId/verses
 * are never read.
 */
const EMPTY_ALIGNMENT = {
  bookId: 0,
  book: '',
  chapter: 0,
  version: '',
  verses: {},
  lexicon: {},
} as unknown as ChapterAlignment;

interface Props {
  text: string;
  verseNumber: number;
  /** The bundled lexicon overlay for this chapter, once it has loaded. */
  alignment: ChapterAlignment | null;
  /** Backend-emitted Strong's tokens for this verse, when the row has them. */
  wireTokens?: VerseToken[];
}

/**
 * One verse's text, with its words made tappable wherever the lexicon can
 * say something about them.
 *
 * Every scripture surface faces the same three-way choice — backend-tagged
 * tokens when the translation carries them, the bundled lexicon overlay when
 * it doesn't, plain text until either arrives — so the choice lives here
 * rather than in each surface. That is what keeps a word behaving the same
 * whether the reader meets the verse in the reader or in a Jesus passage.
 */
export default function LexicalVerseText({ text, verseNumber, alignment, wireTokens }: Props) {
  if (alignment) {
    return (
      <TokenizedVerse
        text={text}
        verseNumber={verseNumber}
        alignment={alignment}
        wireTokens={wireTokens}
      />
    );
  }
  if (wireTokens && wireTokens.length > 0) {
    // Tagged tokens arrived before the lexicon alignment finished loading (or
    // this book has none) — render them now. TokenizedVerse never reads the
    // alignment on the wireTokens path, so the placeholder is harmless.
    return (
      <TokenizedVerse
        text={text}
        verseNumber={verseNumber}
        alignment={EMPTY_ALIGNMENT}
        wireTokens={wireTokens}
      />
    );
  }
  return <>{text}</>;
}
