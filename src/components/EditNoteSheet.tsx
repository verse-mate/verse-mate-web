import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Note } from '@/services/types';
import { Copy, Share2, Trash2 } from 'lucide-react';

interface Props {
  note: Note;
  onClose: () => void;
}

/**
 * EditNoteSheet — dark bottom sheet with chapter title, Copy/Share/Delete tiles,
 * a large textarea, gold Save Note button, and a Cancel button.
 * Figma ref: frame 5310:15970 (Edit Note).
 */
export default function EditNoteSheet({ note, onClose }: Props) {
  const { dispatch } = useApp();
  const [text, setText] = useState(note.text);
  const maxChars = 500;

  const handleSave = () => {
    if (text.trim().length === 0) return;
    dispatch({ type: 'UPDATE_NOTE', id: note.id, text });
    onClose();
  };

  const handleDelete = () => {
    dispatch({ type: 'REMOVE_NOTE', id: note.id });
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(text).catch(() => undefined);
    onClose();
  };

  const handleShare = async () => {
    try {
      await navigator.share?.({
        title: `${note.book} ${note.chapter}`,
        text,
      });
    } catch {
      handleCopy();
      return;
    }
    onClose();
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
        <h3 className="text-center text-[16px] font-semibold text-dark-fg mt-4 mb-4">
          {note.book} {note.chapter}
        </h3>

        {/* Action tiles */}
        <div className="grid grid-cols-3 gap-3 px-5">
          <button
            onClick={handleCopy}
            className="h-[88px] rounded-2xl bg-dark-raised border border-dark flex flex-col items-center justify-center gap-1.5 text-dark-fg"
          >
            <Copy size={20} strokeWidth={1.5} />
            <span className="text-[13px] font-normal">Copy</span>
          </button>
          <button
            onClick={handleShare}
            className="h-[88px] rounded-2xl bg-dark-raised border border-dark flex flex-col items-center justify-center gap-1.5 text-dark-fg"
          >
            <Share2 size={20} strokeWidth={1.5} />
            <span className="text-[13px] font-normal">Share</span>
          </button>
          <button
            onClick={handleDelete}
            className="h-[88px] rounded-2xl bg-[#2a1617] border border-[#4d1f22] flex flex-col items-center justify-center gap-1.5 text-red-400"
          >
            <Trash2 size={20} strokeWidth={1.5} />
            <span className="text-[13px] font-normal">Delete</span>
          </button>
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
          <div className="text-right text-[11px] text-dark-muted mt-1">
            {text.length}/{maxChars}
          </div>
        </div>

        {/* Save Note (gold) + Cancel */}
        <div className="px-5 pt-2 pb-6 space-y-3">
          <button
            onClick={handleSave}
            disabled={text.trim().length === 0}
            className="w-full h-12 rounded-xl bg-gold text-[#1A1A1A] font-medium text-[15px] disabled:opacity-40"
          >
            Save Note
          </button>
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
