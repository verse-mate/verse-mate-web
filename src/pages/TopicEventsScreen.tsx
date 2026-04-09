import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTopicEvents, fetchTopics } from '@/services/bibleService';
import { TopicEvent, Topic } from '@/services/types';
import { ChevronRight, Search } from 'lucide-react';
import ScreenHeader from '@/components/ScreenHeader';

/**
 * TopicEventsScreen — dark list of events for a topic, each row showing
 * a bold title + 2-line muted description + chevron.
 * Figma ref: frames 5895:5369, 5895:5632 (Mobile App section).
 */
export default function TopicEventsScreen() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [events, setEvents] = useState<TopicEvent[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (topicId) {
      fetchTopicEvents(topicId).then(setEvents);
      fetchTopics().then(ts => setTopic(ts.find(t => t.id === topicId) || null));
    }
  }, [topicId]);

  const filtered = useMemo(
    () => events.filter(e => e.title.toLowerCase().includes(query.toLowerCase())),
    [events, query]
  );

  return (
    <div className="flex flex-col h-full bg-dark-surface text-dark-fg">
      <ScreenHeader title={topic?.name || 'Events'} />

      {/* Search */}
      <div className="px-4 pt-1">
        <div className="flex items-center gap-2 h-12 px-4 rounded-full bg-dark-raised border border-dark">
          <Search size={18} className="text-dark-muted" strokeWidth={2} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent text-[15px] text-dark-fg placeholder:text-dark-muted focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6">
        {filtered.map(ev => (
          <button
            key={ev.id}
            onClick={() => navigate(`/topics/${topicId}/${ev.id}`)}
            className="flex items-center justify-between gap-3 w-full py-4 border-b border-dark text-left"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-semibold text-dark-fg mb-1">{ev.title}</h3>
              <p className="text-[13px] text-dark-muted leading-snug line-clamp-2">
                {ev.description}
              </p>
            </div>
            <ChevronRight size={18} className="text-dark-muted shrink-0" />
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-dark-muted py-8 text-[14px]">No events for this topic yet.</p>
        )}
      </div>
    </div>
  );
}
