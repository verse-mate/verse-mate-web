import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTopicEvent } from '@/services/bibleService';
import { TopicEvent } from '@/services/types';
import { ChevronLeft, ChevronRight, BookOpen, Trophy } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export default function TopicEventDetailScreen() {
  const { topicId, eventId } = useParams<{ topicId: string; eventId: string }>();
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [event, setEvent] = useState<TopicEvent | null>(null);

  useEffect(() => {
    if (topicId && eventId) {
      fetchTopicEvent(topicId, eventId).then(e => setEvent(e || null));
    }
  }, [topicId, eventId]);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <button onClick={() => navigate(`/topics/${topicId}`)} className="p-2 -ml-2 rounded-full hover:bg-secondary">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-foreground truncate">{event?.title || 'Event'}</h1>
      </header>

      {event && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <p className="text-sm text-foreground leading-relaxed">{event.description}</p>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              <BookOpen size={14} /> References
            </h3>
            <div className="flex flex-wrap gap-2">
              {event.references.map(ref => (
                <span key={ref} className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">
                  {ref}
                </span>
              ))}
            </div>
          </section>

          <button
            onClick={() => navigate(`/topics/${topicId}/${eventId}/most-quoted`)}
            className="flex items-center justify-between w-full p-4 rounded-lg bg-card border border-border hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-3">
              <Trophy size={18} className="text-accent" />
              <span className="font-medium text-foreground text-sm">Most Quoted Verses</span>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}
