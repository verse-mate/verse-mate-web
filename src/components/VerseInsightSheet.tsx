import { useState, useEffect, useRef } from 'react';
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
 * Strip the first heading + first blockquote from the API markdown
 * since we already show the verse reference and text at the top.
 */
function stripDuplicateVerse(text: string): string {
  let result = text;
  // Remove first heading line (e.g. "Genesis 1:6" or "# Genesis 1:6")
  result = result.replace(/^#*\s*\S+\s+\d+:\d+\s*\n?/, '');
  // Remove first blockquote block (the verse text)
  result = result.replace(/^>\s*.*(?:\n>\s*.*)*\n?/, '').trimStart();
  return result;
}

/**
 * Drop the bare-bones markdown the API returns (#, **bold**, *italic*, >)
 * so the clipboard payload reads as plain prose on the recipient side.
 */
function stripInsightMarkdown(text: string): string {
  return text
    .replace(/^#+\s*/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .trim();
}

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
  // Swipe-down-to-dismiss state. The drag is captured on the top "header"
  // region only (drag handle, title, stepper, quoted verse). The scrollable
  // content area below uses native scroll without competing for touches.
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartYRef = useRef<number | null>(null);
  const SWIPE_DISMISS_THRESHOLD_PX = 100;

  const handleDragStart = (e: React.PointerEvent) => {
    dragStartYRef.current = e.clientY;
    setDragOffset(0);
  };
  const handleDragMove = (e: React.PointerEvent) => {
    if (dragStartYRef.current === null) return;
    const dy = e.clientY - dragStartYRef.current;
    setDragOffset(Math.max(0, dy));
  };
  const handleDragEnd = () => {
    if (dragStartYRef.current === null) return;
    const offset = dragOffset;
    dragStartYRef.current = null;
    if (offset > SWIPE_DISMISS_THRESHOLD_PX) {
      onClose();
    } else {
      setDragOffset(0);
    }
  };

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

  // Plain-text payload for Copy / Share: include the verse AND the insight
  // body (markdown stripped) AND the cross-references. The verse alone
  // wasn't useful when sharing the insight panel.
  const insightCopyText = (() => {
    if (!insight) return quoteText;
    const body = stripInsightMarkdown(stripDuplicateVerse(insight.historicalContext));
    const refs = insight.crossReferences.length
      ? `\n\nCross references: ${insight.crossReferences.join(', ')}`
      : '';
    return `${quoteText}\n\n${body}${refs}`;
  })();

  const handleCopy = async () => {
    setActionError(null);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(insightCopyText);
      } else {
        const ta = document.createElement('textarea');
        ta.value = insightCopyText;
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
          text: insightCopyText,
          url: window.location.href,
        });
      } else {
        await handleCopy();
      }
    } catch (err) {
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
      {/* Sheet — slides up from bottom; narrower on desktop */}
      <div
        className="verse-insight-sheet absolute inset-x-0 bottom-0 z-50 bg-background text-foreground rounded-t-[24px] border-t border-border shadow-[0_-10px_30px_rgba(0,0,0,0.5)] animate-slide-up flex flex-col"
        style={{
          maxHeight: '98%',
          minHeight: '80%',
          transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
          transition: dragStartYRef.current === null ? 'transform 0.2s ease' : 'none',
        }}
        role="dialog"
        aria-label="Verse Insight"
      >
        {/* Header region — captures pointer events for swipe-down-to-dismiss.
            touchAction: none stops the browser from intercepting the gesture
            as a page scroll while the user drags the sheet down. */}
        <div
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          style={{ touchAction: 'none' }}
        >
          {/* Drag handle */}
          <div className="shrink-0 pt-2 flex justify-center">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/40" />
          </div>

          {/* Title */}
          <h2 className="text-center text-[16px] text-gold font-medium mt-2">
            Verse Insight
          </h2>

          {/* Verse stepper — arrows at the edges (justify-between) */}
          <div className="flex items-center justify-between px-5 mt-2">
            <button
              onClick={() => step(-1)}
              disabled={currentVerse <= 1}
              aria-label="Previous verse"
              className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center disabled:opacity-30 shrink-0"
            >
              <ChevronLeft size={18} className="text-foreground" />
            </button>
            <div className="text-[17px] font-medium text-foreground">
              {book} {chapter}:{currentVerse}
            </div>
            <button
              onClick={() => step(1)}
              disabled={currentVerse >= maxVerse}
              aria-label="Next verse"
              className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center disabled:opacity-30 shrink-0"
            >
              <ChevronRight size={18} className="text-foreground" />
            </button>
          </div>
        </div>

        {/* Analysis panel — outer px-4 aligns with action-button row below.
            Inner grey box is content-sized (no flex-1) so short commentary
            doesn't stretch an empty grey card down to the buttons. Outer
            keeps flex-1 + scroll for long commentary. touch-action pan-y
            and overscroll-behavior contain make iOS Safari give us native
            momentum scroll without rubber-banding the parent. */}
        <div
          // Stronger bottom buffer: the inner grey card carries its own
          // margin-bottom (mb-6 = 24px) AND the scroll container adds pb-12
          // (48px), so the visible gap between the card's bottom edge and
          // the action-button row is unmistakable at any scroll position.
          className="flex-1 overflow-y-auto px-4 mt-4 pb-12"
          style={{
            minHeight: 0,
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y',
          }}
        >
          {/* Quoted verse — scrolls with the content so it never permanently
              eats header space on short / zoomed-in viewports. */}
          {verseText && (
            <p className="vis-quote px-2 mb-4 text-center text-[14px] italic text-muted-foreground leading-snug">
              "{verseText}"
            </p>
          )}
          <div
            className="rounded-xl bg-secondary border border-border p-5 mb-6"
            // Inherit the user's reading font size so commentary matches the
            // scripture body (set in ReadingScreen via state.settings.fontSize).
            // Without this the panel hardcoded 15px while the bible side
            // defaulted to 20px, making the insight feel cramped.
            style={{ fontSize: `${state.settings.fontSize}px` }}
          >
            {insight ? (
              <MarkdownBlock text={stripDuplicateVerse(insight.historicalContext)} />
            ) : (
              <p className="text-muted-foreground text-center py-4" style={{ fontSize: `${state.settings.fontSize}px` }}>
                No insight available for this verse.
              </p>
            )}
            {insight && insight.crossReferences.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground/70 mb-1.5">
                  Cross references
                </p>
                <div className="flex flex-wrap gap-1">
                  {insight.crossReferences.map(ref => (
                    <span
                      key={ref}
                      className="text-[11px] text-foreground/90 bg-background rounded px-1.5 py-0.5 border border-border"
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions — one compact row: Copy | Share | Save | Close. A single
            small strip along the bottom keeps the chrome from crowding out the
            summary on short / zoomed-in viewports. */}
        <div className="vis-actions shrink-0 px-3 pb-2 pt-2 border-t border-border safe-bottom">
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={handleCopy}
              className="h-9 rounded-lg bg-secondary border border-border flex items-center justify-center gap-1"
            >
              {copiedAt ? <Check size={13} className="text-gold" strokeWidth={2} /> : <Copy size={13} className="text-foreground" strokeWidth={1.5} />}
              <span className="text-[12px]" style={{ color: copiedAt ? 'var(--vm-dust)' : 'var(--fg-primary)' }}>{copiedAt ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleShare}
              className="h-9 rounded-lg bg-secondary border border-border flex items-center justify-center gap-1"
            >
              <ShareIcon size={13} color="#ccc" />
              <span className="text-[12px] text-foreground">Share</span>
            </button>
            <button
              onClick={handleSaveHighlight}
              className="h-9 rounded-lg bg-secondary border border-border flex items-center justify-center gap-1"
            >
              {savedAt ? <Check size={13} className="text-gold" strokeWidth={2} /> : <Bookmark size={13} className="text-foreground" strokeWidth={1.5} />}
              <span className="text-[12px]" style={{ color: savedAt ? 'var(--vm-dust)' : 'var(--fg-primary)' }}>{savedAt ? 'Saved' : 'Save'}</span>
            </button>
            <button
              onClick={onClose}
              className="h-9 rounded-lg bg-gold text-foreground font-medium text-[12px] flex items-center justify-center"
            >
              Close
            </button>
          </div>
          {actionError && <p className="text-[11px] text-destructive text-center mt-1">{actionError}</p>}
        </div>
      </div>
    </>
  );
}
