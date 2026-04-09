import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCommentary } from '@/services/bibleService';
import { Commentary } from '@/services/types';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';

export default function CommentaryScreen() {
  const { book, chapter } = useParams<{ book: string; chapter: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'summary' | 'byline'>('summary');
  const [commentaries, setCommentaries] = useState<Commentary[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  const decodedBook = decodeURIComponent(book || '');
  const chapterNum = parseInt(chapter || '1', 10);

  useEffect(() => {
    fetchCommentary(decodedBook, chapterNum).then(setCommentaries);
  }, [decodedBook, chapterNum]);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-secondary">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{decodedBook} {chapterNum} Commentary</h1>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border bg-card">
        {(['summary', 'byline'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === t ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground'
            }`}
          >
            {t === 'summary' ? 'Summary' : 'By Line'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {commentaries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No commentary available for this chapter.</p>
        ) : tab === 'summary' ? (
          <div className="space-y-6">
            <h2 className="text-base font-semibold text-foreground">Chapter Commentary</h2>
            {commentaries.map(c => (
              <div key={c.verse} className="space-y-1">
                <h3 className="text-sm font-semibold text-accent">Verse {c.verse}: {c.summary}</h3>
                <p className="text-sm text-foreground font-scripture leading-relaxed">{c.detail}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {commentaries.map(c => {
              const isExpanded = expanded === c.verse;
              return (
                <div key={c.verse} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : c.verse)}
                    className="flex items-center justify-between w-full px-4 py-3.5 hover:bg-secondary transition-colors text-left"
                  >
                    <span className="font-medium text-sm text-foreground">
                      <span className="text-accent mr-1.5">v{c.verse}</span>
                      {c.summary}
                    </span>
                    {isExpanded ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1">
                      <p className="text-sm text-foreground font-scripture leading-relaxed">{c.detail}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
