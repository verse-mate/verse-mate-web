import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMostQuoted } from '@/services/bibleService';
import { MostQuotedVerse } from '@/services/types';
import { Search } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ScreenHeader from '@/components/ScreenHeader';
import { vmTokens } from '@/styles/themeStyles';

export default function MostQuotedScreen() {
  const { topicId, eventId } = useParams<{ topicId: string; eventId: string }>();
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [verses, setVerses] = useState<MostQuotedVerse[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (eventId) fetchMostQuoted(eventId).then(setVerses);
  }, [eventId, topicId]);

  const filtered = useMemo(
    () => verses.filter(v => v.reference.toLowerCase().includes(query.toLowerCase())),
    [verses, query]
  );

  const goToVerse = (v: MostQuotedVerse) => {
    dispatch({ type: 'SET_PASSAGE', book: v.book, chapter: v.chapter });
    navigate('/read');
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.chromeBg }}>
      <ScreenHeader title="Most quoted / memorized" onBack={() => navigate(`/topics/${topicId}`)} />

      {/* Search */}
      <div className="px-4 pt-1" style={{ backgroundColor: vmTokens.pageBg }}>
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

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6" style={{ backgroundColor: vmTokens.pageBg }}>
        {filtered.map(v => (
          <button
            key={v.reference}
            onClick={() => goToVerse(v)}
            className="block w-full py-4 text-left"
            style={{ borderBottom: `1px solid ${vmTokens.divider}` }}
          >
            <p className="text-[15px] font-semibold mb-1" style={{ color: vmTokens.textPrimary }}>{v.reference}</p>
            <p className="text-[13px] line-clamp-2 leading-snug" style={{ color: vmTokens.textTertiary }}>
              "{v.text}"
            </p>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center py-8 text-[14px]" style={{ color: vmTokens.textTertiary }}>No verses found.</p>
        )}
      </div>
    </div>
  );
}
