/**
 * Persistent docked mini-player at the viewport bottom. Survives route
 * changes because AudioPlayerRoot mounts above the route Outlet
 * (br-audio-011). Tap body opens the full sheet; close button stops
 * playback and tears down the audio element.
 *
 * z-index 1001 — above the desktop split-view content (which has its
 * own stacking context up to ~1000) so the dock stays clickable.
 */
import { Pause, Play, X } from 'lucide-react';
import { useAudioPlayer } from './AudioPlayerContext';

function formatTime(seconds: number): string {
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60);
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

export function AudioDockBar() {
  const player = useAudioPlayer();
  const track = player.currentTrack;
  if (!track || !player.dockVisible) return null;

  const isPlaying = player.playbackState === 'playing';
  const progress =
    player.durationSeconds > 0
      ? Math.min(1, player.elapsedSeconds / player.durationSeconds)
      : 0;

  return (
    <div
      data-testid="audio-dock-bar"
      role="toolbar"
      aria-label="Audio playback controls"
      className="fixed inset-x-0 bottom-0 z-[1001] flex justify-center border-t border-border bg-background px-4 py-3 shadow-lg"
    >
      <div className="flex w-full max-w-[1200px] items-center gap-3">
        <button
          type="button"
          aria-label={`Open full player: ${track.explanation_type}, chapter ${track.chapter_number}`}
          className="flex-1 cursor-pointer bg-transparent text-left text-foreground"
          onClick={() => player.openFullSheet()}
        >
          <div className="text-sm font-semibold">
            {track.explanation_type} · Chapter {track.chapter_number}
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-primary transition-[width] duration-200"
              style={{ width: `${progress * 100}%` }}
              role="progressbar"
              aria-label="Playback progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
            />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {formatTime(player.elapsedSeconds)} / {formatTime(player.durationSeconds)}
          </div>
        </button>
        <button
          type="button"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="flex h-11 w-11 items-center justify-center rounded-md text-foreground hover:bg-accent"
          onClick={() => (isPlaying ? player.pause() : player.play())}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} />}
        </button>
        <button
          type="button"
          aria-label="Close audio player"
          className="flex h-11 w-11 items-center justify-center rounded-md text-foreground hover:bg-accent"
          onClick={() => player.close()}
        >
          <X size={22} />
        </button>
      </div>
    </div>
  );
}
