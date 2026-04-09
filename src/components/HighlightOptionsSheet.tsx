import { useApp } from '@/contexts/AppContext';
import { Highlight } from '@/services/types';
import { Copy, Share2, Trash2 } from 'lucide-react';

interface Props {
  highlight: Highlight;
  onClose: () => void;
}

/**
 * HighlightOptionsSheet — dark bottom sheet with Copy / Share / Delete
 * action tiles + Cancel. Figma ref: frame 5310:17103 (Highlight Options).
 * No color swatches per the Figma design.
 */
export default function HighlightOptionsSheet({ highlight, onClose }: Props) {
  const { removeHighlight } = useApp();

  const handleRemove = async () => {
    await removeHighlight(highlight.id);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard
      ?.writeText(`${highlight.book} ${highlight.chapter}:${highlight.verse}`)
      .catch(() => undefined);
    onClose();
  };

  const handleShare = async () => {
    try {
      await navigator.share?.({
        text: `${highlight.book} ${highlight.chapter}:${highlight.verse}`,
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
      label: 'Delete',
      icon: Trash2,
      onClick: handleRemove,
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
          Highlight Options
        </h3>

        {/* Action tiles — Figma has just 3 (Copy / Share / Delete), no color swatches */}
        <div className="grid grid-cols-3 gap-3 px-5">
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
