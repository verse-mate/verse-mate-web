import { useApp } from '@/contexts/AppContext';
import { Note } from '@/services/types';
import { X, Pencil, Trash2, Share2, Copy } from 'lucide-react';

interface Props {
  note: Note;
  onClose: () => void;
  onEdit: () => void;
}

export default function NoteOptionsSheet({ note, onClose, onEdit }: Props) {
  const { dispatch } = useApp();

  const handleDelete = () => {
    dispatch({ type: 'REMOVE_NOTE', id: note.id });
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${note.book} ${note.chapter}:${note.verse}\n${note.text}`);
    onClose();
  };

  const handleShare = async () => {
    try {
      await navigator.share({ text: `${note.book} ${note.chapter}:${note.verse}\n${note.text}` });
    } catch {
      handleCopy();
    }
    onClose();
  };

  const actions = [
    { label: 'Edit', icon: Pencil, action: () => { onClose(); onEdit(); } },
    { label: 'Delete', icon: Trash2, action: handleDelete, destructive: true },
    { label: 'Share', icon: Share2, action: handleShare },
    { label: 'Copy', icon: Copy, action: handleCopy },
  ];

  return (
    <>
      <div className="absolute inset-0 z-40 bg-foreground/20" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 z-50 bg-card rounded-t-2xl shadow-lg border-t border-border animate-slide-up">
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-8 h-1 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <h3 className="font-semibold text-foreground text-[15px]">{note.book} {note.chapter}:{note.verse}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary">
            <X size={18} />
          </button>
        </div>
        <div className="py-1">
          {actions.map(a => (
            <button
              key={a.label}
              onClick={a.action}
              className={`flex items-center gap-3 w-full px-4 py-3.5 hover:bg-secondary transition-colors ${
                a.destructive ? 'text-destructive' : 'text-foreground'
              }`}
            >
              <a.icon size={18} />
              <span className="font-medium text-[14px]">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
