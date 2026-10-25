import { useEffect, useState } from 'react';

/** Less than this is browser chrome (URL bar) moving, not a keyboard. */
const MIN_KEYBOARD_PX = 120;

/**
 * Where the on-screen keyboard starts, in layout-viewport pixels from the
 * top, or null when no keyboard is open.
 *
 * Mobile Safari and Chrome (by default) lay the keyboard OVER the page: the
 * layout viewport, and with it every `inset: 0` overlay, keeps its full
 * height while only the visual viewport shrinks. So content anchored to the
 * bottom of the screen sits behind the keyboard, and a scroll list can't
 * bring its last rows above it. The visual viewport tells us how much is
 * covered. A pinch zoom shrinks it too, so a scale other than 1 is ignored.
 */
export function useKeyboardTop(): number | null {
  const [top, setTop] = useState<number | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const visibleBottom = vv.offsetTop + vv.height;
      const covered = window.innerHeight - visibleBottom;
      const zoomed = Math.abs(vv.scale - 1) > 0.01;
      setTop(!zoomed && covered >= MIN_KEYBOARD_PX ? Math.round(visibleBottom) : null);
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return top;
}
