import React from 'react';
import LexiconPopover from './LexiconPopover';
import type { AlignedToken, ChapterAlignment } from '@versemate/lexicon';

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
}

export default function TokenizedVerse({
  text,
  verseNumber,
  alignment,
}: TokenizedVerseProps) {
  const tokens = alignment.verses[verseNumber] ?? [];
  if (tokens.length === 0) {
    return <>{text}</>;
  }

  const chunks = React.useMemo(() => tokenize(text, tokens), [text, tokens]);

  return (
    <>
      {chunks.map((c, idx) => {
        if (c.kind === 'text') return <React.Fragment key={idx}>{c.text}</React.Fragment>;
        const entry = alignment.lexicon[c.token!.lemma];
        if (!entry) return <React.Fragment key={idx}>{c.text}</React.Fragment>;
        const isTheme = alignment.themeLemmas?.includes(c.token!.lemma) ?? false;
        return (
          <LexiconPopover
            key={idx}
            surface={c.text}
            entry={entry}
            token={c.token!}
            isTheme={isTheme}
          >
            {c.text}
          </LexiconPopover>
        );
      })}
    </>
  );
}
