import { useApp } from '@/contexts/AppContext';
import { Note } from '@/services/types';
import { Copy, Share2, Pencil, Trash2 } from 'lucide-react';

interface Props {
  note: Note;
  onClose: () => void;
  onEdit: () => void;
}

/**
 * NoteOptionsSheet — dark bottom sheet with 4 action tiles (Copy / Share / Edit / Delete)
 * and a Cancel button. Figma ref: frame 5310:16518.
 */
export default function NoteOptionsSheet({ note, onClose, onEdit }: Props) {
  const { dispatch } = useApp();

  const handleDelete = () => {
    dispatch({ type: 'REMOVE_NOTE', id: note.id });
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard
      ?.writeText(`${note.book} ${note.chapter}:${note.verse}\n${note.text}`)
      .catch(() => undefined);
    onClose();
  };

  const handleShare = async () => {
    try {
      await navigator.share?.({
        text: `${note.book} ${note.chapter}:${note.verse}\n${note.text}`,
      });
    } catch {
      handleCopy();
      return;
    }
    onClose();
  };

  const tiles = [
    { label: 'Copy', icon: Copy, onClick: handleCopy },
    { label: 'Share', icon: Share2, onClick: handleShare },
    {
      label: 'Edit',
      icon: Pencil,
      onClick: () => {
        onClose();
        onEdit();
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: handleDelete,
      destructive: true,
    },
  ];

  return (
    <>
      <div className="absolute inset-0 z-40 bg-black/60" onClick={onClose} />
      <div
        className="absolute inset-x-0 bottom-0 z-50 bg-dark-surface rounded-t-[24px] border-t border-dark safe-bottom animate-slide-up"
        role="dialog"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3">
          <div className="w-10 h-1 rounded-full bg-dark-muted/40" />
        </div>

        {/* Title */}
        <h3 className="text-center text-[16px] font-semibold text-dark-fg mt-4 mb-4">
          Notes Options
        </h3>

        {/* Action tiles */}
        <div className="grid grid-cols-4 gap-3 px-5">
          {tiles.map(t => (
            <button
              key={t.label}
              onClick={t.onClick}
              className={`h-[88px] rounded-2xl border flex flex-col items-center justify-center gap-1.5 ${
                t.destructive
                  ? 'bg-[#2a1617] border-[#4d1f22] text-red-400'
                  : 'bg-dark-raised border-dark text-dark-fg'
              }`}
            >
              <t.icon size={20} strokeWidth={1.5} />
              <span className="text-[13px] font-normal">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Cancel */}
        <div className="px-5 pt-5 pb-6">
          <button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-dark-raised border border-dark text-dark-fg text-[14px] font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
