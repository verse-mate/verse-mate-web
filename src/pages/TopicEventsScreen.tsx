import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTopicEvents, fetchTopics } from '@/services/bibleService';
import { TopicEvent, Topic } from '@/services/types';
import { ChevronDown, ChevronUp, Search, BookOpen } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ScreenHeader from '@/components/ScreenHeader';

/**
 * TopicEventsScreen — dark list of sections for a topic. Each section
 * expands inline (accordion) to show its description + scripture references,
 * matching the Figma mobile-app behavior. No separate detail route.
 * Figma ref: frames 5895:5369, 5895:5632 (Mobile App section).
 */
export default function TopicEventsScreen() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [events, setEvents] = useState<TopicEvent[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

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

  const openReference = (ref: string) => {
    // "Genesis 1:26-28" or "Genesis 1" → dispatch SET_PASSAGE to jump
    const m = ref.match(/^(\d?\s?[A-Za-z]+)\s+(\d+)/);
    if (m) {
      dispatch({ type: 'SET_PASSAGE', book: m[1].trim(), chapter: parseInt(m[2], 10) });
      navigate('/read');
    }
  };

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
        {filtered.map(ev => {
          const isOpen = expanded === ev.id;
          return (
            <div key={ev.id} className="border-b border-dark">
              <button
                onClick={() => setExpanded(isOpen ? null : ev.id)}
                className="flex items-start justify-between gap-3 w-full py-4 text-left"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-dark-fg mb-1">{ev.title}</h3>
                  {!isOpen && (
                    <p className="text-[13px] text-dark-muted leading-snug line-clamp-2">
                      {ev.description}
                    </p>
                  )}
                </div>
                {isOpen ? (
                  <ChevronUp size={18} className="text-dark-muted shrink-0 mt-1" />
                ) : (
                  <ChevronDown size={18} className="text-dark-muted shrink-0 mt-1" />
                )}
              </button>

              {isOpen && (
                <div className="pb-4 pr-1 pl-0 space-y-3">
                  {ev.description && (
                    <p className="text-[13px] text-dark-muted leading-relaxed">
                      {ev.description}
                    </p>
                  )}
                  {ev.references.length > 0 && (
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-dark-muted/70 mb-2">
                        References
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {ev.references.map(ref => (
                          <button
                            key={ref}
                            onClick={() => openReference(ref)}
                            className="flex items-center gap-1.5 text-[12px] text-dark-fg bg-dark-raised border border-dark rounded-full px-3 py-1.5 hover:border-gold transition-colors"
                          >
                            <BookOpen size={12} strokeWidth={1.75} />
                            {ref}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-dark-muted py-8 text-[14px]">
            No events for this topic yet.
          </p>
        )}
      </div>
    </div>
  );
}
