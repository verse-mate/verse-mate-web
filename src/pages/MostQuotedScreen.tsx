import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMostQuoted, fetchTopicEvent } from '@/services/bibleService';
import { MostQuotedVerse, TopicEvent } from '@/services/types';
import { ChevronLeft } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export default function MostQuotedScreen() {
  const { topicId, eventId } = useParams<{ topicId: string; eventId: string }>();
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [verses, setVerses] = useState<MostQuotedVerse[]>([]);
  const [event, setEvent] = useState<TopicEvent | null>(null);

  useEffect(() => {
    if (eventId) fetchMostQuoted(eventId).then(setVerses);
    if (topicId && eventId) fetchTopicEvent(topicId, eventId).then(e => setEvent(e || null));
  }, [eventId, topicId]);

  const goToVerse = (v: MostQuotedVerse) => {
    dispatch({ type: 'SET_PASSAGE', book: v.book, chapter: v.chapter });
    navigate('/read');
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <button onClick={() => navigate(`/topics/${topicId}/${eventId}`)} className="p-2 -ml-2 rounded-full hover:bg-secondary">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-foreground truncate">Most Quoted</h1>
      </header>

      {event && (
        <div className="px-4 py-3 border-b border-border bg-card">
          <p className="text-sm text-muted-foreground">{event.title}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {verses.map((v, i) => (
          <button
            key={v.reference}
            onClick={() => goToVerse(v)}
            className="flex items-start gap-3 w-full p-4 rounded-lg bg-card border border-border hover:bg-secondary transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-accent">#{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-foreground text-sm">{v.reference}</p>
                <span className="text-xs text-muted-foreground">{v.quoteCount.toLocaleString()} quotes</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 font-scripture">{v.text}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
