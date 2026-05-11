import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTopicEvent } from '@/services/bibleService';
import { TopicEvent } from '@/services/types';
import { ChevronRight, Trophy, BookOpen } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ScreenHeader from '@/components/ScreenHeader';
import { vmTokens } from '@/styles/themeStyles';

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

  const openReference = (ref: string) => {
    const m = ref.match(/^(\d?\s?[A-Za-z]+)\s+(\d+)/);
    if (m) {
      dispatch({ type: 'SET_PASSAGE', book: m[1].trim(), chapter: parseInt(m[2], 10) });
      navigate('/read');
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.chromeBg }}>
      <ScreenHeader
        title={event?.title || 'Event'}
        onBack={() => navigate(`/topics/${topicId}`)}
      />

      <div className="flex-1 overflow-y-auto px-5 pb-8" style={{ backgroundColor: vmTokens.pageBg }}>
        {event ? (
          <>
            <p className="text-[14px] leading-relaxed mt-2" style={{ color: vmTokens.textTertiary }}>
              {event.description}
            </p>

            <h3 className="text-[13px] uppercase tracking-wide mt-6 mb-2" style={{ color: vmTokens.textMuted }}>
              References
            </h3>
            <div className="space-y-2">
              {event.references.map(ref => (
                <button
                  key={ref}
                  onClick={() => openReference(ref)}
                  className="flex items-center justify-between w-full h-[56px] px-4 rounded-xl"
                  style={{ backgroundColor: vmTokens.surfaceRaisedBg, border: `1px solid ${vmTokens.divider}` }}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen size={18} style={{ color: vmTokens.textTertiary }} strokeWidth={1.5} />
                    <span className="text-[14px]" style={{ color: vmTokens.textPrimary }}>{ref}</span>
                  </div>
                  <ChevronRight size={18} style={{ color: vmTokens.textTertiary }} />
                </button>
              ))}
            </div>

            <button
              onClick={() => navigate(`/topics/${topicId}/${eventId}/most-quoted`)}
              className="flex items-center justify-between w-full h-[56px] px-4 mt-6 rounded-xl"
              style={{ backgroundColor: vmTokens.surfaceRaisedBg, border: `1px solid ${vmTokens.divider}` }}
            >
              <div className="flex items-center gap-3">
                <Trophy size={18} style={{ color: vmTokens.gold }} strokeWidth={1.5} />
                <span className="text-[14px]" style={{ color: vmTokens.textPrimary }}>Most Quoted Verses</span>
              </div>
              <ChevronRight size={18} style={{ color: vmTokens.textTertiary }} />
            </button>
          </>
        ) : (
          <p className="text-center py-8 text-[14px]" style={{ color: vmTokens.textTertiary }}>Loading...</p>
        )}
      </div>
    </div>
  );
}
