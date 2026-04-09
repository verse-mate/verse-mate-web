import { useApp } from '@/contexts/AppContext';
import { Highlight, HighlightColor } from '@/services/types';
import { Copy, Share2, Trash2 } from 'lucide-react';

interface Props {
  highlight: Highlight;
  onClose: () => void;
}

const COLOR_SWATCHES: { color: HighlightColor; className: string }[] = [
  { color: 'yellow', className: 'bg-yellow-400' },
  { color: 'green', className: 'bg-green-400' },
  { color: 'blue', className: 'bg-blue-400' },
  { color: 'pink', className: 'bg-pink-400' },
  { color: 'orange', className: 'bg-orange-400' },
];

/**
 * HighlightOptionsSheet — dark bottom sheet with Copy / Share / Delete action tiles,
 * a row of color swatches to change the highlight color, and a Cancel button.
 * Figma ref: frame 5310:17103 (Highlight Options).
 */
export default function HighlightOptionsSheet({ highlight, onClose }: Props) {
  const { updateHighlight, removeHighlight } = useApp();

  const handleColorChange = async (color: HighlightColor) => {
    await updateHighlight(highlight.id, color);
    onClose();
  };

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

        {/* Color swatches */}
        <div className="flex items-center justify-center gap-3 px-5 mb-4">
          {COLOR_SWATCHES.map(s => (
            <button
              key={s.color}
              onClick={() => handleColorChange(s.color)}
              aria-label={`Set ${s.color} highlight`}
              className={`w-11 h-11 rounded-full ${s.className} ${
                highlight.color === s.color
                  ? 'ring-2 ring-gold ring-offset-2 ring-offset-[#1A1A1A]'
                  : ''
              }`}
            />
          ))}
        </div>

        {/* Action tiles */}
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
