import { useMemo, useRef, type TouchEvent } from 'react';
import { suppressVerseInsightClick } from '@/lib/verseInsightGuard';

/**
 * The app's one horizontal swipe gesture.
 *
 * The reader established the feel — a firm, clearly sideways drag pages to the
 * next chapter — and the Jesus event screen pages through the chronology with
 * the same one, so a reader who has learned the gesture in the Bible tab keeps
 * it wherever scripture is set.
 *
 * The two thresholds are what keep it from firing while someone is scrolling:
 * the drag has to cover real distance, and it has to be far more horizontal
 * than vertical.
 */
const SWIPE_MIN_PX = 60;
const SWIPE_DOMINANCE = 2;

/** Which way the content moves: 1 = forward (swipe left), -1 = back. */
export type SwipeDirection = 1 | -1;

export interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
}

/**
 * Spread the result onto whichever element owns the gesture — the scripture
 * body, not the whole screen, so the chrome above it stays inert.
 */
export function useHorizontalSwipe(onSwipe: (direction: SwipeDirection) => void): SwipeHandlers {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  // The handler is read at gesture end, so the latest one always runs without
  // the returned props changing identity on every render.
  const onSwipeRef = useRef(onSwipe);
  onSwipeRef.current = onSwipe;

  return useMemo(
    () => ({
      onTouchStart: (e: TouchEvent) => {
        const t = e.touches[0];
        if (!t) return;
        startRef.current = { x: t.clientX, y: t.clientY };
      },
      onTouchEnd: (e: TouchEvent) => {
        const start = startRef.current;
        startRef.current = null;
        if (!start) return;
        const t = e.changedTouches[0];
        if (!t) return;
        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        if (Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * SWIPE_DOMINANCE) {
          // A swipe crosses verses on its way past. The browser may still fire
          // a click on whichever one the finger lifted over, and that click is
          // not a tap — without this the gesture would page the content *and*
          // pop the Verse Insight card for a verse nobody chose.
          suppressVerseInsightClick();
          onSwipeRef.current(dx < 0 ? 1 : -1);
        }
      },
    }),
    [],
  );
}
