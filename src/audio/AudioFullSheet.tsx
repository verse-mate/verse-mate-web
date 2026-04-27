/**
 * Full-sheet modal player. ±15s skip, speed menu, scrubber, resume row.
 *
 * a11y (TASK-016): focus trap on open, restore on close, Esc closes,
 * Space toggles play/pause when focus is inside the sheet.
 *
 * z-index 1002 — above the dock (1001) + the desktop split-view content.
 */
import { ChevronDown, ExternalLink, Pause, Play } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useAudioPlayer } from './AudioPlayerContext';
import { AudioResumeChip } from './AudioResumeChip';
import { useAudioProgress } from './useAudioProgress';

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

function formatTime(seconds: number): string {
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60);
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export function AudioFullSheet() {
  const player = useAudioPlayer();
  const open = player.fullSheetOpen;
  const track = player.currentTrack;
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const { resumeProgress, consumeResume, dismissResume } = useAudioProgress();

  // Focus trap + Esc + Space.
  useEffect(() => {
    if (!open || !sheetRef.current) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const sheet = sheetRef.current;
    getFocusableElements(sheet)[0]?.focus();

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        player.closeFullSheet();
        return;
      }
      if (event.key === ' ' || event.code === 'Space') {
        if (!sheet.contains(document.activeElement)) return;
        const target = event.target as HTMLElement | null;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'BUTTON')) return;
        event.preventDefault();
        if (player.playbackState === 'playing') player.pause();
        else player.play();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = getFocusableElements(sheet);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      previouslyFocusedRef.current?.focus();
    };
  }, [open, player]);

  if (!open || !track) return null;

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-label="Full audio player"
      className="fixed inset-0 z-[1002] flex flex-col bg-background px-4 py-6"
    >
      <header className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Close full player"
          className="flex h-11 w-11 items-center justify-center rounded-md text-foreground hover:bg-accent"
          onClick={() => player.closeFullSheet()}
        >
          <ChevronDown size={24} />
        </button>
        <a
          href={track.source_href}
          aria-label="Go to source explanation"
          className="inline-flex min-h-[44px] items-center gap-1 text-primary hover:underline"
          onClick={() => player.closeFullSheet()}
        >
          Go to source <ExternalLink size={16} />
        </a>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-5">
        <div className="text-center">
          <div className="text-xl font-semibold capitalize">{track.explanation_type}</div>
          <div className="text-sm text-muted-foreground">Chapter {track.chapter_number}</div>
        </div>

        <input
          type="range"
          min={0}
          max={player.durationSeconds || 0}
          step={0.1}
          value={player.elapsedSeconds}
          onChange={(e) => player.seek(Number(e.target.value))}
          aria-label="Playback position"
          className="w-full max-w-[480px]"
        />

        <div className="flex items-center gap-5">
          <button
            type="button"
            aria-label="Rewind 15 seconds"
            className="flex h-11 min-w-[44px] items-center justify-center rounded-md text-sm font-semibold text-foreground hover:bg-accent"
            onClick={() => player.seekRelative(-15)}
          >
            -15s
          </button>
          <button
            type="button"
            aria-label={player.playbackState === 'playing' ? 'Pause' : 'Play'}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-card text-foreground shadow-md hover:bg-accent"
            onClick={() => (player.playbackState === 'playing' ? player.pause() : player.play())}
          >
            {player.playbackState === 'playing' ? <Pause size={32} /> : <Play size={32} />}
          </button>
          <button
            type="button"
            aria-label="Forward 15 seconds"
            className="flex h-11 min-w-[44px] items-center justify-center rounded-md text-sm font-semibold text-foreground hover:bg-accent"
            onClick={() => player.seekRelative(15)}
          >
            +15s
          </button>
        </div>

        {resumeProgress && player.playbackState !== 'playing' ? (
          <AudioResumeChip
            progress={resumeProgress}
            onResume={() => consumeResume()}
            onRestart={() => dismissResume()}
          />
        ) : null}

        <div className="flex flex-wrap justify-center gap-2">
          {SPEEDS.map((s) => {
            const active = player.speed === s;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                aria-label={`Set playback speed to ${s} times`}
                className={`min-h-[44px] min-w-[44px] rounded-md border text-sm ${
                  active
                    ? 'border-primary bg-primary font-bold text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:bg-accent'
                }`}
                onClick={() => player.setSpeed(s)}
              >
                {s}×
              </button>
            );
          })}
        </div>

        <div className="text-sm text-muted-foreground">
          {formatTime(player.elapsedSeconds)} / {formatTime(player.durationSeconds)}
        </div>
      </main>
    </div>
  );
}
