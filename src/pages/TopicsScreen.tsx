import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTopics } from '@/services/bibleService';
import { Topic } from '@/services/types';
import { Sparkles, Heart, MessageCircle, Shield, Eye, Zap, BookOpen, ChevronRight } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Sparkles, Heart, MessageCircle, Shield, Eye, Zap, BookOpen,
};

export default function TopicsScreen() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics().then(setTopics);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 py-3 border-b border-border bg-card">
        <h1 className="text-lg font-semibold text-foreground">Topics</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {topics.map(topic => {
          const Icon = iconMap[topic.icon] || BookOpen;
          return (
            <button
              key={topic.id}
              onClick={() => navigate(`/topics/${topic.id}`)}
              className="flex items-center gap-3 w-full p-4 rounded-lg bg-card border border-border hover:bg-secondary transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Icon size={18} className="text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{topic.name}</p>
                <p className="text-sm text-muted-foreground">{topic.description}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
