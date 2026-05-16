import React from 'react';
import LexiconPopover from './LexiconPopover';
import type { AlignedToken, ChapterAlignment } from '@/data/lexicon/types';

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

function tokenize(text: string, alignments: AlignedToken[]): Chunk[] {
  // Greedy longest-match: sort by surface length descending so multi-word
  // surfaces ("double-minded") win over substrings ("minded").
  const sorted = [...alignments].sort(
    (a, b) => b.surface.length - a.surface.length,
  );

  const chunks: Chunk[] = [];
  let buffer = '';
  let i = 0;

  while (i < text.length) {
    let matched: { len: number; token: AlignedToken } | null = null;

    for (const t of sorted) {
      const surf = t.surface;
      if (surf.length === 0) continue;
      const slice = text.slice(i, i + surf.length);
      if (slice.toLowerCase() !== surf.toLowerCase()) continue;

      // Enforce word boundaries on both sides — but allow trailing
      // punctuation (',' '.' ';' ':' '!' '?' '"' '\'' or end-of-string)
      // and require the char before to NOT be alphanumeric/apostrophe.
      const before = i === 0 ? '' : text[i - 1];
      const after = text[i + surf.length];

      if (isWordCharOrApostrophe(before)) continue;
      if (isWordCharOrApostrophe(after)) continue;

      matched = { len: surf.length, token: t };
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
        if (c.kind === 'text') {
          return <React.Fragment key={idx}>{c.text}</React.Fragment>;
        }
        const entry = alignment.lexicon[c.token!.lemma];
        if (!entry) {
          // Lexicon entry missing — render as plain text rather than crash.
          return <React.Fragment key={idx}>{c.text}</React.Fragment>;
        }
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
