import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTopicEvents, fetchTopics } from '@/services/bibleService';
import { TopicEvent, Topic } from '@/services/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TopicEventsScreen() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [events, setEvents] = useState<TopicEvent[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);

  useEffect(() => {
    if (topicId) {
      fetchTopicEvents(topicId).then(setEvents);
      fetchTopics().then(ts => setTopic(ts.find(t => t.id === topicId) || null));
    }
  }, [topicId]);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <button onClick={() => navigate('/topics')} className="p-2 -ml-2 rounded-full hover:bg-secondary">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{topic?.name || 'Events'}</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {events.map(ev => (
          <div key={ev.id} className="p-4 rounded-lg bg-card border border-border">
            <h3 className="font-semibold text-foreground mb-1">{ev.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{ev.description}</p>
            <div className="flex flex-wrap gap-1">
              {ev.references.map(ref => (
                <span key={ref} className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                  {ref}
                </span>
              ))}
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">No events for this topic yet.</p>
        )}
      </div>
    </div>
  );
}
