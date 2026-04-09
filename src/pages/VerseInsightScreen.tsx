import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchVerseInsights, fetchChapter } from '@/services/bibleService';
import { VerseInsight, Chapter } from '@/services/types';
import { ChevronLeft, ChevronRight, Copy, Share2, Bookmark } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

/**
 * VerseInsightScreen — dark bottom-sheet-style full screen that shows an
 * "Analysis" panel for a single verse, with prev/next arrows to walk through
 * verses, action buttons (Copy / Share / Save as My Highlight), and a gold
 * Close button at the bottom.
 *
 * Figma references: Verse Insight 1 (6040:16024) + Verse Insight 2 (6040:16069).
 */
export default function VerseInsightScreen() {
  const { book, chapter, verseNumber } = useParams<{
    book: string;
    chapter: string;
    verseNumber: string;
  }>();
  const navigate = useNavigate();
  const { state } = useApp();
  const [insights, setInsights] = useState<VerseInsight[]>([]);
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [currentVerse, setCurrentVerse] = useState<number>(1);

  const decodedBook = decodeURIComponent(book || state.book);
  const chapterNum = parseInt(chapter || String(state.chapter), 10);

  useEffect(() => {
    fetchVerseInsights(decodedBook, chapterNum).then(setInsights);
    fetchChapter(decodedBook, chapterNum, state.version).then(setChapterData);
  }, [decodedBook, chapterNum, state.version]);

  useEffect(() => {
    setCurrentVerse(parseInt(verseNumber || '1', 10));
  }, [verseNumber]);

  const insight = insights.find(i => i.verse === currentVerse);
  const verseText = chapterData?.verses.find(v => v.number === currentVerse)?.text || '';
  const maxVerse = chapterData?.verses.length || 1;

  const step = (delta: number) => {
    const next = currentVerse + delta;
    if (next >= 1 && next <= maxVerse) setCurrentVerse(next);
  };

  return (
    <div className="flex flex-col h-full bg-dark-surface text-dark-fg">
      {/* Drag handle */}
      <div className="shrink-0 pt-3 flex justify-center">
        <div className="w-10 h-1 rounded-full bg-dark-muted/40" />
      </div>

      {/* Title */}
      <h2 className="text-center text-[15px] text-gold font-medium mt-3">Verse Insight</h2>

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
          {decodedBook} {chapterNum}:{currentVerse}
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
        <p className="px-6 mt-4 text-center text-[13px] italic text-dark-muted leading-snug">
          "{verseText}"
        </p>
      )}

      {/* Analysis panel */}
      <div className="flex-1 overflow-y-auto px-5 mt-4 pb-4">
        <h3 className="text-center text-[15px] font-semibold text-dark-fg mb-3">Analysis</h3>
        <div className="rounded-2xl bg-dark-raised border border-dark p-4">
          {insight ? (
            <p className="text-[13px] text-dark-muted leading-relaxed">
              {insight.historicalContext}
            </p>
          ) : (
            <p className="text-[13px] text-dark-muted text-center">
              No insight available for this verse.
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0 px-5 pb-3 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigator.clipboard?.writeText(verseText).catch(() => undefined)}
            className="h-[72px] rounded-xl bg-dark-raised border border-dark flex flex-col items-center justify-center gap-1"
          >
            <Copy size={18} className="text-dark-fg" strokeWidth={1.5} />
            <span className="text-[13px] text-dark-fg">Copy</span>
          </button>
          <button
            onClick={() =>
              navigator.share?.({
                title: `${decodedBook} ${chapterNum}:${currentVerse}`,
                text: verseText,
              }).catch(() => undefined)
            }
            className="h-[72px] rounded-xl bg-dark-raised border border-dark flex flex-col items-center justify-center gap-1"
          >
            <Share2 size={18} className="text-dark-fg" strokeWidth={1.5} />
            <span className="text-[13px] text-dark-fg">Share</span>
          </button>
        </div>
        <button className="w-full h-12 rounded-xl bg-dark-raised border border-dark flex items-center justify-center gap-2">
          <Bookmark size={18} className="text-dark-fg" strokeWidth={1.5} />
          <span className="text-[14px] text-dark-fg">Save as My Highlight</span>
        </button>
      </div>

      {/* Close button */}
      <div className="shrink-0 px-5 pb-6 safe-bottom">
        <button
          onClick={() => navigate(-1)}
          className="w-full h-12 rounded-xl bg-gold text-[#1A1A1A] font-medium text-[15px]"
        >
          Close
        </button>
      </div>
    </div>
  );
}
