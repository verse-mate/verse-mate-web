import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTopics } from '@/services/bibleService';
import { Topic } from '@/services/types';
import { ChevronRight, Search } from 'lucide-react';
import ScreenHeader from '@/components/ScreenHeader';

/**
 * TopicsScreen — dark list of topic categories, Figma ref frame 5895:4982.
 * Matches the Topics tab of the Search screen: plain list rows with chevrons.
 */
export default function TopicsScreen() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics().then(setTopics);
  }, []);

  const filtered = useMemo(
    () => topics.filter(t => t.name.toLowerCase().includes(query.toLowerCase())),
    [topics, query]
  );

  return (
    <div className="flex flex-col h-full bg-dark-surface text-dark-fg">
      <ScreenHeader title="Topics" />

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
        {filtered.map(topic => (
          <button
            key={topic.id}
            onClick={() => navigate(`/topics/${topic.id}`)}
            className="flex items-center justify-between w-full h-[56px] border-b border-dark text-left"
          >
            <span className="text-[16px] text-dark-fg">{topic.name}</span>
            <ChevronRight size={18} className="text-dark-muted" />
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-[14px] text-dark-muted text-center py-8">No topics found</p>
        )}
      </div>
    </div>
  );
}
