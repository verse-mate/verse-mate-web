import React from 'react';
import LexiconPopover from './LexiconPopover';
import type { AlignedToken, ChapterAlignment, LexEntry } from '@versemate/lexicon';
import { loadStrongsIndex } from '@versemate/lexicon';
import { shouldUnderlineLexeme } from '@/lib/lexiconImportance';
import type { VerseToken } from '@/services/types';

interface Chunk {
  kind: 'text' | 'word';
  text: string;
  token?: AlignedToken;
}

// Word-boundary check that treats apostrophes and curly quotes as
// "still inside a word" so we don't break "doesn't" or "James's" wrongly.
function isWordCharOrApostrophe(ch: string | undefined): boolean {
  if (!ch) return false;
  if (/\w/.test(ch)) return true;
  return ch === "'" || ch === '’';
}

// AlignedToken.surface can be either a single string (legacy / generated
// alignments) or a string[] (cross-translation aliases attached by the
// lexicon loader). Normalize both to an array of surfaces for matching.
function surfacesOf(token: AlignedToken): readonly string[] {
  const s = token.surface;
  return typeof s === 'string' ? [s] : s;
}

function tokenize(text: string, alignments: AlignedToken[]): Chunk[] {
  // Expand each token into one match candidate per surface variant. We sort
  // ALL candidates by surface length (descending) so multi-word matches like
  // "double-minded" beat single-word substrings like "minded", regardless
  // of which translation-alias the longer form came from.
  type Candidate = { surface: string; token: AlignedToken };
  const candidates: Candidate[] = [];
  for (const t of alignments) {
    for (const s of surfacesOf(t)) {
      if (s.length > 0) candidates.push({ surface: s, token: t });
    }
  }
  candidates.sort((a, b) => b.surface.length - a.surface.length);

  const chunks: Chunk[] = [];
  let buffer = '';
  let i = 0;

  while (i < text.length) {
    let matched: { len: number; token: AlignedToken } | null = null;

    for (const c of candidates) {
      const surf = c.surface;
      const slice = text.slice(i, i + surf.length);
      if (slice.toLowerCase() !== surf.toLowerCase()) continue;

      // Enforce word boundaries on both sides — but allow trailing
      // punctuation (',' '.' ';' ':' '!' '?' '"' '\'' or end-of-string)
      // and require the char before to NOT be alphanumeric/apostrophe.
      const before = i === 0 ? '' : text[i - 1];
      const after = text[i + surf.length];

      if (isWordCharOrApostrophe(before)) continue;
      if (isWordCharOrApostrophe(after)) continue;

      matched = { len: surf.length, token: c.token };
      break;
    }

    if (matched) {
      if (buffer) {
        chunks.push({ kind: 'text', text: buffer });
        buffer = '';
      }
      chunks.push({
        kind: 'word',
        text: text.slice(i, i + matched.len),
        token: matched.token,
      });
      i += matched.len;
    } else {
      buffer += text[i];
      i += 1;
    }
  }

  if (buffer) chunks.push({ kind: 'text', text: buffer });
  return chunks;
}

interface TokenizedVerseProps {
  text: string;
  verseNumber: number;
  alignment: ChapterAlignment;
  /**
   * Backend-emitted Strong's tokens for this verse, present when the
   * chapter was fetched with `?tagged=1` AND the row had tokens seeded.
   * When supplied AND non-empty, takes precedence over the legacy
   * English-surface scan: each token's `strongs` is looked up directly
   * in `STRONGS_INDEX`, no surface matching needed.
   */
  wireTokens?: VerseToken[];
}

/**
 * Render branch for backend-tagged verses (Spanish RVR09, German SCH51,
 * French LSG, Russian SYN — plus the LLM-aligned non-Latin translations
 * once they land). Walks `wireTokens` in order; each token with a
 * `strongs` value becomes a `LexiconPopover` looked up by Strong's ID,
 * each passthrough renders as plain text. Joining each token's `text`
 * field reproduces the verse exactly (the lossless-join invariant the
 * backend enforces at seed time), so the visible text is identical to
 * what the legacy renderer would have produced.
 */
function TaggedVerse({ tokens }: { tokens: VerseToken[] }) {
  // `loadStrongsIndex` is cached, so concurrent verses share one fetch.
  // Suspense-style ergonomics aren't available here without a refactor,
  // so we render plain text on the first tick, then hydrate to popovers
  // once the index resolves. Hot reloads + repeat chapter visits skip the
  // round-trip entirely thanks to the in-module promise cache.
  const [index, setIndex] = React.useState<Readonly<Record<string, LexEntry>> | null>(
    null,
  );
  React.useEffect(() => {
    let cancelled = false;
    loadStrongsIndex().then((idx) => {
      if (!cancelled) setIndex(idx);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {tokens.map((tok, idx) => {
        if (!tok.strongs || !index) {
          return <React.Fragment key={idx}>{tok.text}</React.Fragment>;
        }
        const entry = index[tok.strongs];
        if (!entry) return <React.Fragment key={idx}>{tok.text}</React.Fragment>;
        // Synthesize a minimal AlignedToken so LexiconPopover (currently
        // shaped around the lexicon-overlay path) keeps working. The
        // `surface` field is the displayed text; `lemma` is the slug-style
        // key. This shape may be simplified once the lexicon overlay path
        // is retired for non-English translations.
        const aligned: AlignedToken = {
          surface: tok.text,
          lemma: entry.translit,
        };
        return (
          <LexiconPopover
            key={idx}
            surface={tok.text}
            entry={entry}
            token={aligned}
            underline={shouldUnderlineLexeme(entry)}
          >
            {tok.text}
          </LexiconPopover>
        );
      })}
    </>
  );
}

export default function TokenizedVerse({
  text,
  verseNumber,
  alignment,
  wireTokens,
}: TokenizedVerseProps) {
  // Hooks must run in the same order every render — hoist the useMemo
  // above the early-return branches.
  const tokens = alignment.verses[verseNumber] ?? [];
  const chunks = React.useMemo(
    () => (tokens.length === 0 ? [] : tokenize(text, tokens)),
    [text, tokens],
  );

  // When the backend supplied Strong's-tagged tokens, prefer those — they
  // come from hand-edited or LLM-aligned sources and don't need surface
  // scanning. Fall through to the legacy lexicon-overlay path otherwise
  // (English versions whose alignment ships via `loadAlignmentFor`, or
  // non-English versions whose backend rows haven't been seeded yet).
  if (wireTokens && wireTokens.length > 0) {
    return <TaggedVerse tokens={wireTokens} />;
  }
  if (tokens.length === 0) {
    return <>{text}</>;
  }

  return (
    <>
      {chunks.map((c, idx) => {
        if (c.kind === 'text') return <React.Fragment key={idx}>{c.text}</React.Fragment>;
        const entry = alignment.lexicon[c.token!.lemma];
        if (!entry) return <React.Fragment key={idx}>{c.text}</React.Fragment>;
        return (
          <LexiconPopover
            key={idx}
            surface={c.text}
            entry={entry}
            token={c.token!}
            underline={shouldUnderlineLexeme(entry)}
          >
            {c.text}
          </LexiconPopover>
        );
      })}
    </>
  );
}
