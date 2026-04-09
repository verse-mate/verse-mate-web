import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCommentary } from '@/services/bibleService';
import { Commentary } from '@/services/types';
import { ChevronDown, ChevronUp, Menu, Share2 } from 'lucide-react';
import MarkdownBlock from '@/components/MarkdownBlock';

type Tab = 'summary' | 'byline' | 'detailed';

/**
 * CommentaryScreen — full dark with Bible/Insight pill in header + Summary/By Line/Detailed tabs.
 * Figma references: Commentary - Summary (5147:5119 / 5147:5164), Commentary - By Line (5147:5194),
 * By Line Expandable (5983:5379). Mobile App section.
 */
export default function CommentaryScreen() {
  const { book, chapter } = useParams<{ book: string; chapter: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('summary');
  const [commentaries, setCommentaries] = useState<Commentary[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  const decodedBook = decodeURIComponent(book || '');
  const chapterNum = parseInt(chapter || '1', 10);

  useEffect(() => {
    fetchCommentary(decodedBook, chapterNum).then(setCommentaries);
  }, [decodedBook, chapterNum]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'byline', label: 'By Line' },
    { id: 'detailed', label: 'Detailed' },
  ];

  return (
    <div className="flex flex-col h-full bg-dark-surface text-dark-fg">
      {/* Header — matches Reading header pattern but Insight is selected */}
      <header
        className="shrink-0 bg-dark-surface safe-top border-b border-dark"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 24px)' }}
      >
        <div className="flex items-center justify-between px-4" style={{ height: 56 }}>
          <button
            onClick={() => navigate(`/read`)}
            className="flex items-center gap-1.5 text-dark-fg min-h-[44px] pr-2 -ml-1"
          >
            <span className="text-[18px] font-medium tracking-tight">
              {decodedBook} {chapterNum}
            </span>
            <ChevronDown size={18} className="text-dark-fg/90" strokeWidth={2} />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full bg-dark-raised p-0.5">
              <button
                onClick={() => navigate('/read')}
                className="px-3.5 h-8 rounded-full text-[13px] font-medium text-dark-fg/80"
              >
                Bible
              </button>
              <button className="px-3.5 h-8 rounded-full text-[13px] font-medium bg-gold text-[#1A1A1A]">
                Insight
              </button>
            </div>
            <button
              onClick={() => navigate('/menu')}
              aria-label="Open menu"
              className="flex items-center justify-center w-[44px] h-[44px] -mr-2"
            >
              <Menu size={22} className="text-dark-fg" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Tab pills */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-3">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 h-9 rounded-full text-[13px] font-medium transition-colors ${
              tab === t.id
                ? 'bg-gold text-[#1A1A1A]'
                : 'bg-dark-raised text-dark-fg/80 border border-dark'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Dark body */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {commentaries.length === 0 ? (
          <p className="text-[14px] text-dark-muted text-center py-8">
            No commentary available for this chapter.
          </p>
        ) : tab === 'summary' ? (
          <div className="pt-2">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-[20px] font-bold text-dark-fg">
                Summary of {decodedBook} {chapterNum}
              </h2>
              <button aria-label="Share" className="w-8 h-8 flex items-center justify-center">
                <Share2 size={18} className="text-dark-fg" strokeWidth={1.5} />
              </button>
            </div>
            {(() => {
              const summary = commentaries.find(c => c.type === 'summary');
              return summary ? (
                <MarkdownBlock text={summary.detail} />
              ) : (
                <p className="text-[14px] text-dark-muted">No summary available.</p>
              );
            })()}
          </div>
        ) : tab === 'byline' ? (
          <div className="space-y-2 pt-2">
            {commentaries.filter(c => c.type === 'byline').map(c => {
              const isExpanded = expanded === c.verse;
              return (
                <div
                  key={c.verse}
                  className="rounded-xl overflow-hidden bg-dark-raised border border-dark"
                >
                  <button
                    onClick={() => setExpanded(isExpanded ? null : c.verse)}
                    className="flex items-center justify-between w-full px-4 py-3.5 text-left"
                  >
                    <span className="text-[14px] text-dark-fg pr-3">
                      <span className="text-gold mr-2">v{c.verse}</span>
                      {c.summary}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-dark-muted shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="text-dark-muted shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-dark">
                      <MarkdownBlock text={c.detail} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          (() => {
            const detailed = commentaries.find(c => c.type === 'detailed');
            return detailed ? (
              <div className="pt-2">
                <MarkdownBlock text={detailed.detail} />
              </div>
            ) : (
              <p className="text-[14px] text-dark-muted py-8 text-center">
                Detailed commentary not available.
              </p>
            );
          })()
        )}
      </div>
    </div>
  );
}
