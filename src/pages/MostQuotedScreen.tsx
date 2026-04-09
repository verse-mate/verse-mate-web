import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMostQuoted } from '@/services/bibleService';
import { MostQuotedVerse } from '@/services/types';
import { Search } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ScreenHeader from '@/components/ScreenHeader';

/**
 * MostQuotedScreen — dark list of verses with reference (bold) + quote (muted),
 * rows separated by thin dividers. Figma ref: frame 5895:5782 (Mobile App section).
 */
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
    <div className="flex flex-col h-full bg-dark-surface text-dark-fg">
      <ScreenHeader title="Most quoted / memorized" />

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
        {filtered.map(v => (
          <button
            key={v.reference}
            onClick={() => goToVerse(v)}
            className="block w-full py-4 border-b border-dark text-left"
          >
            <p className="text-[15px] font-semibold text-dark-fg mb-1">{v.reference}</p>
            <p className="text-[13px] text-dark-muted line-clamp-2 leading-snug">
              "{v.text}"
            </p>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-dark-muted py-8 text-[14px]">No verses found.</p>
        )}
      </div>
    </div>
  );
}
