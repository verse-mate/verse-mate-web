import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { X, BookOpen, Lightbulb, Settings } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function OptionsSheet({ onClose }: Props) {
  const navigate = useNavigate();
  const { state } = useApp();

  const actions = [
    {
      label: 'View Commentary',
      icon: BookOpen,
      action: () => {
        navigate(`/read/${encodeURIComponent(state.book)}/${state.chapter}/commentary`);
        onClose();
      },
    },
    {
      label: 'View Verse Insight',
      icon: Lightbulb,
      action: () => {
        const verse = state.selectedVerse || 1;
        navigate(`/read/${encodeURIComponent(state.book)}/${state.chapter}/verse/${verse}/insight`);
        onClose();
      },
    },
    {
      label: 'Settings',
      icon: Settings,
      action: () => {
        navigate('/menu/settings');
        onClose();
      },
    },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/20" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-2xl shadow-lg border-t border-border animate-slide-up max-w-lg mx-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Options</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary">
            <X size={18} />
          </button>
        </div>
        <div className="py-2">
          {actions.map(a => (
            <button
              key={a.label}
              onClick={a.action}
              className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-secondary transition-colors text-foreground"
            >
              <a.icon size={18} className="text-muted-foreground" />
              <span className="font-medium text-sm">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
