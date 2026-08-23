/**
 * A passage that behaves like the reader's chapter.
 *
 * `ScriptureText` sets scripture; this wraps it in the two interactions a
 * reader has learned from the Bible tab and expects to keep wherever a verse
 * appears:
 *
 *  - tap the verse → the Verse Insight card for that verse
 *  - tap a word   → its lexical (Strong's) definition card
 *
 * Everything it needs comes from the reference itself, which the Jesus event
 * graph already stores structurally (book id + chapter), so a passage block
 * only has to say which passage it is showing.
 */

import { useEffect, useMemo, useState } from 'react';
import { loadAlignmentFor, type ChapterAlignment } from '@versemate/lexicon';
import LexicalVerseText from '@/components/LexicalVerseText';
import VerseInsightSheet from '@/components/VerseInsightSheet';
import { ScriptureText, type ScriptureVerse } from '@/components/scripture/ScriptureBlock';
import { useApp } from '@/contexts/AppContext';
import { shouldSuppressVerseInsightClick } from '@/lib/verseInsightGuard';
import { fetchChapterById } from '@/services/bibleService';
import type { VerseToken } from '@/services/types';

interface Props {
  bookId: number;
  /** Display fallback only — the reference's own book id does the lookups. */
  bookName: string;
  chapter: number;
  verses: ScriptureVerse[];
  fontSize?: number;
}

/**
 * `ScriptureVerse.number` is rendered verbatim, so it can be a stitched range
 * ("3-4") on surfaces that quote across verses. Verse Insight and the token
 * lookup both need a single verse, so those runs stay non-interactive rather
 * than guessing which verse of the run the reader meant.
 */
function singleVerseNumber(verse: ScriptureVerse): number | null {
  if (typeof verse.number === 'number') return Number.isFinite(verse.number) ? verse.number : null;
  return /^\d+$/.test(verse.number.trim()) ? Number(verse.number) : null;
}

export default function PassageScripture({ bookId, bookName, chapter, verses, fontSize }: Props) {
  const { state } = useApp();
  const [alignment, setAlignment] = useState<ChapterAlignment | null>(null);
  const [tokensByVerse, setTokensByVerse] = useState<Record<number, VerseToken[]>>({});
  const [insightVerse, setInsightVerse] = useState<number | null>(null);

  // The bundled lexicon overlay — how English translations get their word
  // cards. Cached inside the package, so passages sharing a chapter (parallel
  // gospel accounts) resolve the second one without any work.
  useEffect(() => {
    setAlignment(null);
    if (!bookId || !chapter) return;
    let cancelled = false;
    loadAlignmentFor(bookId, chapter).then(a => {
      if (!cancelled) setAlignment(a);
    });
    return () => {
      cancelled = true;
    };
  }, [bookId, chapter]);

  // Backend-tagged Strong's tokens — how the translations that carry them
  // (Spanish, German, French, Russian…) get theirs, since the bundled overlay
  // only scans English surfaces. The chapter fetch is cached in bibleService,
  // so this also warms the copy the Verse Insight sheet asks for on open.
  useEffect(() => {
    setTokensByVerse({});
    if (!bookId || !chapter) return;
    let cancelled = false;
    fetchChapterById(bookId, bookName, chapter, state.version).then(ch => {
      if (cancelled) return;
      const byVerse: Record<number, VerseToken[]> = {};
      for (const v of ch.verses) {
        if (v.tokens && v.tokens.length > 0) byVerse[v.number] = v.tokens;
      }
      setTokensByVerse(byVerse);
    });
    return () => {
      cancelled = true;
    };
  }, [bookId, bookName, chapter, state.version]);

  const insightsEnabled = state.settings.verseInsightsPopup !== false;

  const openInsight = useMemo(
    () =>
      insightsEnabled
        ? (verse: ScriptureVerse) => {
            // A click that dismisses an open word card lands on the scripture
            // behind it; that same click must not also open Verse Insight.
            if (shouldSuppressVerseInsightClick()) return;
            const number = singleVerseNumber(verse);
            if (number !== null) setInsightVerse(number);
          }
        : undefined,
    [insightsEnabled],
  );

  return (
    <>
      <ScriptureText
        verses={verses}
        fontSize={fontSize}
        onVerseClick={openInsight}
        renderVerseText={verse => {
          const number = singleVerseNumber(verse);
          if (number === null) return verse.text;
          return (
            <LexicalVerseText
              text={verse.text}
              verseNumber={number}
              alignment={alignment}
              wireTokens={tokensByVerse[number]}
            />
          );
        }}
      />
      {insightVerse !== null && (
        <VerseInsightSheet
          book={bookName}
          bookId={bookId}
          chapter={chapter}
          verse={insightVerse}
          version={state.version}
          onClose={() => setInsightVerse(null)}
        />
      )}
    </>
  );
}
