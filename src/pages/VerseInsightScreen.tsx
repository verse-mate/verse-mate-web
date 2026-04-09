import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchVerseInsights } from '@/services/bibleService';
import { VerseInsight } from '@/services/types';
import { ChevronLeft, BookOpen, Languages, Clock } from 'lucide-react';

export default function VerseInsightScreen() {
  const { book, chapter, verseNumber } = useParams<{ book: string; chapter: string; verseNumber: string }>();
  const navigate = useNavigate();
  const [insights, setInsights] = useState<VerseInsight[]>([]);
  const [panel, setPanel] = useState(0);

  const decodedBook = decodeURIComponent(book || '');
  const chapterNum = parseInt(chapter || '1', 10);
  const verseNum = parseInt(verseNumber || '1', 10);

  useEffect(() => {
    fetchVerseInsights(decodedBook, chapterNum).then(setInsights);
  }, [decodedBook, chapterNum]);

  const insight = insights.find(i => i.verse === verseNum) || insights[0];

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-secondary">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{decodedBook} {chapterNum}:{verseNum} Insight</h1>
      </header>

      {!insight ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No insight available for this verse.</p>
        </div>
      ) : (
        <>
          {/* Panel tabs */}
          <div className="flex border-b border-border bg-card">
            {['References & Language', 'Historical Context'].map((label, i) => (
              <button
                key={label}
                onClick={() => setPanel(i)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  panel === i ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {panel === 0 ? (
              <>
                {/* Cross references */}
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                    <BookOpen size={16} className="text-accent" /> Cross References
                  </h3>
                  <div className="space-y-2">
                    {insight.crossReferences.map(ref => (
                      <div key={ref} className="px-4 py-3 rounded-lg bg-secondary text-sm text-foreground font-medium">
                        {ref}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Original language */}
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                    <Languages size={16} className="text-accent" /> Original Language
                  </h3>
                  <p className="text-sm text-foreground font-scripture leading-relaxed bg-secondary rounded-lg px-4 py-3">
                    {insight.originalLanguage}
                  </p>
                </section>
              </>
            ) : (
              <section>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                  <Clock size={16} className="text-accent" /> Historical Context
                </h3>
                <p className="text-sm text-foreground font-scripture leading-relaxed">
                  {insight.historicalContext}
                </p>
              </section>
            )}
          </div>
        </>
      )}
    </div>
  );
}
