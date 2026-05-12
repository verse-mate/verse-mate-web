import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTopicEvents, fetchTopics } from '@/services/bibleService';
import { TopicEvent, Topic } from '@/services/types';
import { Search, BookOpen } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ScreenHeader from '@/components/ScreenHeader';
import { generateTopicSlug, getCategoryFromSlug } from '@/lib/topicSlugs';
import { vmTokens } from '@/styles/themeStyles';

export default function TopicEventsScreen() {
  // Two route shapes hit this screen:
  //   /topics/:topicId                            (legacy, ID-based)
  //   /topic/:categorySlug/:topicSlug             (canonical, SEO-friendly)
  // Both end up here so we can keep one component for both URL shapes.
  const { topicId, categorySlug, topicSlug } = useParams<{
    topicId?: string;
    categorySlug?: string;
    topicSlug?: string;
  }>();
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [events, setEvents] = useState<TopicEvent[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const topics = await fetchTopics();
      if (cancelled) return;

      let resolved: Topic | null = null;
      if (topicId) {
        resolved = topics.find((t) => t.id === topicId) || null;
      } else if (categorySlug && topicSlug) {
        const backendCategory = getCategoryFromSlug(categorySlug);
        if (backendCategory) {
          resolved =
            topics.find(
              (t) =>
                t.category === backendCategory &&
                (t.slug === topicSlug || generateTopicSlug(t.name) === topicSlug),
            ) || null;
        }
      }

      if (resolved) {
        setTopic(resolved);
        const evts = await fetchTopicEvents(resolved.id);
        if (!cancelled) setEvents(evts);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [topicId, categorySlug, topicSlug]);

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
    const m = ref.match(/^(\d?\s?[A-Za-z]+)\s+(\d+)/);
    if (m) {
      dispatch({ type: 'SET_PASSAGE', book: m[1].trim(), chapter: parseInt(m[2], 10) });
      navigate('/read');
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader title={topic?.name || 'Events'} onBack={() => navigate('/topics')} />

      {/* Search */}
      <div className="px-4 pt-1" style={{ backgroundColor: vmTokens.commentaryBg }}>
        <div className="flex items-center gap-2 h-12 px-4 rounded-full" style={{ backgroundColor: vmTokens.surfaceRaisedBg, border: `1px solid ${vmTokens.divider}` }}>
          <Search size={18} style={{ color: vmTokens.textTertiary }} strokeWidth={2} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent text-[15px] focus:outline-none"
            style={{ color: vmTokens.textPrimary }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6" style={{ backgroundColor: vmTokens.commentaryBg }}>
        {filtered.length === 0 ? (
          <p className="text-center py-8 text-[14px]" style={{ color: vmTokens.textTertiary }}>
            {events.length === 0 ? 'Loading...' : `No sections match "${query}"`}
          </p>
        ) : (
          <div className="space-y-6">
            {filtered.map(ev => (
              <section key={ev.id} className="pb-5 last:border-b-0" style={{ borderBottom: `1px solid ${vmTokens.divider}` }}>
                <h3 className="text-[16px] font-semibold mb-2" style={{ color: vmTokens.textPrimary }}>{ev.title}</h3>
                {ev.description && (
                  <p className="text-[13px] leading-relaxed" style={{ color: vmTokens.textTertiary }}>
                    {ev.description}
                  </p>
                )}
                {ev.references.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] uppercase tracking-wide mb-2" style={{ color: vmTokens.textMuted }}>
                      References
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {ev.references.map(ref => (
                        <button
                          key={ref}
                          onClick={() => openReference(ref)}
                          className="flex items-center gap-1.5 text-[12px] rounded-full px-3 py-1.5 transition-colors"
                          style={{ backgroundColor: vmTokens.surfaceRaisedBg, border: `1px solid ${vmTokens.divider}`, color: vmTokens.textPrimary }}
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
