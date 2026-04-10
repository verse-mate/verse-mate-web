import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTopicEvents, fetchTopics } from '@/services/bibleService';
import { TopicEvent, Topic } from '@/services/types';
import { Search, BookOpen } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ScreenHeader from '@/components/ScreenHeader';

/**
 * TopicEventsScreen — dark list of sections for a topic. Every section is
 * rendered fully expanded inline (no accordion / pull-down) so the user can
 * scroll through all the content at once. Tapping a reference jumps to the
 * Reading screen at that passage.
 * Figma ref: frames 5895:5369, 5895:5632 (Mobile App section).
 */
export default function TopicEventsScreen() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { dispatch } = useApp();
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
    () =>
      events.filter(
        e =>
          e.title.toLowerCase().includes(query.toLowerCase()) ||
          e.description.toLowerCase().includes(query.toLowerCase())
      ),
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
    <div className="flex flex-col h-full bg-white text-[#1B1B1B]">
      <ScreenHeader title={topic?.name || 'Events'} />

      {/* Search */}
      <div className="px-4 pt-1">
        <div className="flex items-center gap-2 h-12 px-4 rounded-full bg-[#f8f9fa] border border-[#dce0e380]">
          <Search size={18} className="text-[#818990]" strokeWidth={2} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent text-[15px] text-[#1B1B1B] placeholder:text-[#818990] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
        {filtered.length === 0 ? (
          <p className="text-center text-[#818990] py-8 text-[14px]">
            {events.length === 0 ? 'Loading…' : `No sections match "${query}"`}
          </p>
        ) : (
          <div className="space-y-6">
            {filtered.map(ev => (
              <section key={ev.id} className="pb-5 border-b border-[#dce0e380] last:border-b-0">
                <h3 className="text-[16px] font-semibold text-[#1B1B1B] mb-2">{ev.title}</h3>
                {ev.description && (
                  <p className="text-[13px] text-[#818990] leading-relaxed">
                    {ev.description}
                  </p>
                )}
                {ev.references.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] uppercase tracking-wide text-[#818990]/70 mb-2">
                      References
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {ev.references.map(ref => (
                        <button
                          key={ref}
                          onClick={() => openReference(ref)}
                          className="flex items-center gap-1.5 text-[12px] text-[#1B1B1B] bg-[#f8f9fa] border border-[#dce0e380] rounded-full px-3 py-1.5 hover:border-gold transition-colors"
                        >
                          <BookOpen size={12} strokeWidth={1.75} />
                          {ref}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
