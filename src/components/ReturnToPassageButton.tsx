import { ArrowLeft } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

/**
 * "Back to <book> <chapter>" pill — appears at the top of the reading column
 * after the user jumps to a different passage via the Search / book selector.
 * Clicking it returns to the passage they were reading before the jump
 * (AppContext.previousPassage). Renders nothing when there's nowhere to
 * return to.
 *
 * Placed inside ReadingScreen's `.reading-inner`, which is shared by both the
 * phone layout and the desktop split-view left panel, so a single mount
 * covers every reading viewport.
 */
export default function ReturnToPassageButton() {
  const { state, dispatch } = useApp();
  const prev = state.previousPassage;
  if (!prev) return null;
  // Guard against a no-op jump (the user picked the chapter they were on).
  if (prev.bookId === state.bookId && prev.chapter === state.chapter) return null;
  return (
    <button
      type="button"
      onClick={() => dispatch({ type: 'RETURN_TO_PREVIOUS' })}
      data-testid="return-to-passage-button"
      className="inline-flex items-center gap-1.5 mb-4 px-3 h-8 rounded-full bg-secondary border border-border text-foreground text-[13px] font-medium hover:opacity-80 transition-opacity"
    >
      <ArrowLeft size={15} strokeWidth={2} />
      <span>
        Back to {prev.book} {prev.chapter}
      </span>
    </button>
  );
}
