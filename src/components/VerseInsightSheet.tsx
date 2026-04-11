import { useState, useEffect } from 'react';
import { fetchVerseInsights, fetchChapter } from '@/services/bibleService';
import { VerseInsight, Chapter, BibleVersion } from '@/services/types';
import { ChevronLeft, ChevronRight, Copy, Bookmark, Check } from 'lucide-react';
import MarkdownBlock from '@/components/MarkdownBlock';
import { useApp } from '@/contexts/AppContext';
import ShareIcon from '@/components/ShareIcon';

interface Props {
  book: string;
  chapter: number;
  verse: number;
  version: BibleVersion;
  onClose: () => void;
}

/**
 * VerseInsightSheet — bottom-sheet overlay that slides up from the bottom of
 * the Reading screen and shows per-verse insight. Not full-screen — the user
 * should still see the top of the Reading chrome peek through above.
 *
 * Figma refs: Verse Insight 1 (6040:16024), Verse Insight 2 (6040:16069).
 */
export default function VerseInsightSheet({
  book,
  chapter,
  verse,
  version,
  onClose,
}: Props) {
  const { state, addHighlight } = useApp();
  const [insights, setInsights] = useState<VerseInsight[]>([]);
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [currentVerse, setCurrentVerse] = useState<number>(verse);
  const [copiedAt, setCopiedAt] = useState<number>(0);
  const [savedAt, setSavedAt] = useState<number>(0);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchVerseInsights(book, chapter).then(setInsights);
    fetchChapter(book, chapter, version).then(setChapterData);
  }, [book, chapter, version]);

  useEffect(() => {
    setCurrentVerse(verse);
  }, [verse]);

  const insight = insights.find(i => i.verse === currentVerse);
  const verseText =
    chapterData?.verses.find(v => v.number === currentVerse)?.text || '';
  const maxVerse = chapterData?.verses.length || 1;

  const step = (delta: number) => {
    const next = currentVerse + delta;
    if (next >= 1 && next <= maxVerse) setCurrentVerse(next);
  };

  const quoteText = verseText
    ? `"${verseText}" — ${book} ${chapter}:${currentVerse}`
    : `${book} ${chapter}:${currentVerse}`;

  const handleCopy = async () => {
    setActionError(null);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(quoteText);
      } else {
        // Fallback for older/iframe-restricted environments
        const ta = document.createElement('textarea');
        ta.value = quoteText;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedAt(Date.now());
      setTimeout(() => setCopiedAt(0), 1500);
    } catch {
      setActionError('Copy failed — clipboard not available here');
    }
  };

  const handleShare = async () => {
    setActionError(null);
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${book} ${chapter}:${currentVerse}`,
          text: quoteText,
        });
      } else {
        // No Web Share API → fall back to copy
        await handleCopy();
      }
    } catch (err) {
      // User-cancelled share is an AbortError, don't show as error
      if ((err as Error)?.name !== 'AbortError') {
        setActionError('Share failed');
      }
    }
  };

  const handleSaveHighlight = async () => {
    setActionError(null);
    if (!state.isSignedIn) {
      setActionError('Sign in to save highlights');
      return;
    }
    try {
      await addHighlight({
        bookId: state.bookId,
        book,
        chapter,
        verse: currentVerse,
        startVerse: currentVerse,
        endVerse: currentVerse,
        color: 'yellow',
      });
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(0), 1500);
    } catch {
      setActionError('Save failed — please try again');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-40 bg-black/60 animate-fade-in"
        onClick={onClose}
      />
      {/* Sheet — slides up from bottom, takes ~75% of frame; narrower on desktop */}
      <div
        className="verse-insight-sheet absolute inset-x-0 bottom-0 z-50 bg-dark-surface text-dark-fg rounded-t-[24px] border-t border-dark shadow-[0_-10px_30px_rgba(0,0,0,0.5)] animate-slide-up flex flex-col"
        style={{ maxHeight: '80%' }}
        role="dialog"
        aria-label="Verse Insight"
      >
        {/* Drag handle */}
        <div className="shrink-0 pt-3 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-dark-muted/40" />
        </div>

        {/* Title */}
        <h2 className="text-center text-[15px] text-gold font-medium mt-3">
          Verse Insight
        </h2>

        {/* Verse stepper */}
        <div className="flex items-center justify-between px-6 mt-3">
          <button
            onClick={() => step(-1)}
            disabled={currentVerse <= 1}
            aria-label="Previous verse"
            className="w-10 h-10 rounded-full bg-dark-raised border border-dark flex items-center justify-center disabled:opacity-30"
          >
            <ChevronLeft size={18} className="text-dark-fg" />
          </button>
          <div className="text-[16px] font-medium text-dark-fg">
            {book} {chapter}:{currentVerse}
          </div>
          <button
            onClick={() => step(1)}
            disabled={currentVerse >= maxVerse}
            aria-label="Next verse"
            className="w-10 h-10 rounded-full bg-dark-raised border border-dark flex items-center justify-center disabled:opacity-30"
          >
            <ChevronRight size={18} className="text-dark-fg" />
          </button>
        </div>

        {/* Quoted verse */}
        {verseText && (
          <p className="px-6 mt-3 text-center text-[13px] italic text-dark-muted leading-snug">
            "{verseText}"
          </p>
        )}

        {/* Analysis panel — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 mt-4 pb-3 min-h-0">
          <h3 className="text-[13px] uppercase tracking-wide text-dark-muted/70 mb-2">
            Analysis
          </h3>
          <div className="rounded-2xl bg-dark-raised border border-dark p-4">
            {insight ? (
              <MarkdownBlock text={insight.historicalContext} />
            ) : (
              <p className="text-[13px] text-dark-muted text-center py-4">
                No insight available for this verse.
              </p>
            )}
            {insight && insight.crossReferences.length > 0 && (
              <div className="mt-4 pt-4 border-t border-dark">
                <p className="text-[11px] uppercase tracking-wide text-dark-muted/70 mb-2">
                  Cross references
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {insight.crossReferences.map(ref => (
                    <span
                      key={ref}
                      className="text-[11px] text-dark-fg/90 bg-dark-surface rounded px-2 py-0.5 border border-dark"
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 px-5 pb-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="h-12 rounded-xl bg-dark-raised border border-dark flex items-center justify-center gap-2"
            >
              {copiedAt ? (
                <>
                  <Check size={16} className="text-gold" strokeWidth={1.75} />
                  <span className="text-[13px] text-gold">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={16} className="text-dark-fg" strokeWidth={1.5} />
                  <span className="text-[13px] text-dark-fg">Copy</span>
                </>
              )}
            </button>
            <button
              onClick={handleShare}
              className="h-12 rounded-xl bg-dark-raised border border-dark flex items-center justify-center gap-2"
            >
              <ShareIcon size={16} color="currentColor" />
              <span className="text-[13px] text-dark-fg">Share</span>
            </button>
          </div>
          <button
            onClick={handleSaveHighlight}
            className="w-full h-12 rounded-xl bg-dark-raised border border-dark flex items-center justify-center gap-2"
          >
            {savedAt ? (
              <>
                <Check size={16} className="text-gold" strokeWidth={1.75} />
                <span className="text-[13px] text-gold">Saved as highlight</span>
              </>
            ) : (
              <>
                <Bookmark size={16} className="text-dark-fg" strokeWidth={1.5} />
                <span className="text-[13px] text-dark-fg">Save as My Highlight</span>
              </>
            )}
          </button>
          {actionError && (
            <p className="text-[11px] text-red-400 text-center">{actionError}</p>
          )}
        </div>

        {/* Close button */}
        <div className="shrink-0 px-5 pb-5 safe-bottom">
          <button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-gold text-[#1A1A1A] font-medium text-[15px]"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
