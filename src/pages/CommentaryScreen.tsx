import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCommentary } from '@/services/bibleService';
import { Commentary } from '@/services/types';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';

type Tab = 'summary' | 'byline' | 'detailed';

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
    <div className="flex flex-col h-full">
      {/* Dark header */}
      <header className="shrink-0 flex items-center gap-2 px-3 bg-header" style={{ height: 56 }}>
        <button onClick={() => navigate(-1)} className="flex items-center justify-center w-[44px] h-[44px] -ml-2">
          <ChevronLeft size={22} className="text-gold" />
        </button>
        <h1 className="text-[17px] font-semibold text-header-fg">{decodedBook} {chapterNum}</h1>
      </header>

      {/* Pill tabs — cream bg */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-3 bg-background">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
              tab === t.id
                ? 'bg-gold text-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Cream body */}
      <div className="flex-1 overflow-y-auto bg-background px-5 pb-6">
        {commentaries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No commentary available for this chapter.</p>
        ) : tab === 'summary' ? (
          <div className="space-y-5 pt-2">
            <h2 className="font-scripture italic text-[20px] text-foreground font-medium">Chapter Commentary</h2>
            {commentaries.map(c => (
              <div key={c.verse} className="space-y-1">
                <h3 className="text-[14px] font-semibold text-gold font-sans">Verse {c.verse}: {c.summary}</h3>
                <p className="text-[15px] text-foreground font-scripture leading-relaxed">{c.detail}</p>
              </div>
            ))}
          </div>
        ) : tab === 'byline' ? (
          <div className="space-y-1.5 pt-2">
            {commentaries.map(c => {
              const isExpanded = expanded === c.verse;
              return (
                <div key={c.verse} className="border border-border rounded-lg overflow-hidden bg-card">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : c.verse)}
                    className="flex items-center justify-between w-full px-4 py-3.5 hover:bg-secondary transition-colors text-left"
                  >
                    <span className="font-medium text-[14px] text-foreground">
                      <span className="text-gold mr-1.5 font-sans">v{c.verse}</span>
                      {c.summary}
                    </span>
                    {isExpanded
                      ? <ChevronUp size={16} className="text-muted-foreground shrink-0" />
                      : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1">
                      <p className="text-[15px] text-foreground font-scripture leading-relaxed">{c.detail}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Detailed — show full commentary for every verse */
          <div className="space-y-6 pt-2">
            {commentaries.map(c => (
              <div key={c.verse}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-gold font-sans text-[13px] font-semibold">Verse {c.verse}</span>
                  <span className="text-[14px] font-semibold text-foreground">{c.summary}</span>
                </div>
                <p className="text-[15px] text-foreground font-scripture leading-relaxed">{c.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
