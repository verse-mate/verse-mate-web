import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Note } from '@/services/types';
import { Copy, Share2, Trash2 } from 'lucide-react';

interface Props {
  note: Note;
  onClose: () => void;
}

/**
 * EditNoteSheet — dark bottom sheet. Figma: 5310:15970.
 * Title = "{Book} {Chapter}", 3 action tiles (Copy / Share / Delete red),
 * editable textarea preloaded with the note text, gold "Save Note" button,
 * bordered "Cancel" button below.
 */
export default function EditNoteSheet({ note, onClose }: Props) {
  const { updateNote, removeNote } = useApp();
  const [text, setText] = useState(note.text);
  const [saving, setSaving] = useState(false);
  const maxChars = 500;

  const handleSave = async () => {
    if (text.trim().length === 0) return;
    setSaving(true);
    try {
      await updateNote(note.id, text);
    } finally {
      setSaving(false);
      onClose();
    }
  };

  const handleDelete = async () => {
    await removeNote(note.id);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(text).catch(() => undefined);
  };

  const handleShare = async () => {
    try {
      await navigator.share?.({
        title: `${note.book} ${note.chapter}`,
        text,
      });
    } catch {
      handleCopy();
    }
  };

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
        <h3 className="text-center text-[18px] text-dark-fg mt-4 mb-5">
          {note.book} {note.chapter}
        </h3>

        {/* 3 action tiles */}
        <div className="grid grid-cols-3 gap-3 px-5">
          <SheetTile icon={<Copy size={20} strokeWidth={1.5} />} label="Copy" onClick={handleCopy} />
          <SheetTile icon={<Share2 size={20} strokeWidth={1.5} />} label="Share" onClick={handleShare} />
          <SheetTile
            icon={<Trash2 size={20} strokeWidth={1.5} />}
            label="Delete"
            onClick={handleDelete}
            destructive
          />
        </div>

        {/* Textarea */}
        <div className="px-5 pt-4">
          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, maxChars))}
            rows={5}
            className="w-full rounded-2xl bg-dark-raised border border-dark px-4 py-3 text-[14px] text-dark-fg placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] resize-none"
            placeholder="Write your note..."
          />
        </div>

        {/* Gold Save Note */}
        <div className="px-5 pt-4 pb-3">
          <button
            onClick={handleSave}
            disabled={text.trim().length === 0 || saving}
            className="w-full h-12 rounded-xl bg-gold text-[#1A1A1A] font-medium text-[15px] disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save Note'}
          </button>
        </div>

        {/* Bordered Cancel */}
        <div className="px-5 pb-6">
          <button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-dark-surface border border-dark text-dark-fg text-[14px] font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

function SheetTile({
  icon,
  label,
  onClick,
  destructive,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-[88px] rounded-2xl border flex flex-col items-center justify-center gap-1.5 ${
        destructive
          ? 'bg-[#2a1617] border-[#4d1f22] text-red-400'
          : 'bg-dark-raised border-dark text-dark-fg'
      }`}
    >
      {icon}
      <span className="text-[13px] font-normal">{label}</span>
    </button>
  );
}
