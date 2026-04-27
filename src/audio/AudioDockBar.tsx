/**
 * Persistent docked mini-player at the viewport bottom. Survives route
 * changes because AudioPlayerRoot mounts above the route Outlet
 * (br-audio-011). Tap body opens the full sheet; close button stops
 * playback and tears down the audio element.
 *
 * z-index 1001 — above the desktop split-view content (which has its
 * own stacking context up to ~1000) so the dock stays clickable.
 *
 * Theming: explicit dark colors (see ./theme) because verse-mate-web
 * doesn't activate Tailwind's `.dark` mode — ShadCN tokens would
 * render against a light surface and clash with the #1B1B1B shell.
 */
import { Pause, Play, X } from 'lucide-react';
import { useAudioPlayer } from './AudioPlayerContext';
import { COLORS, FONT } from './theme';

function formatTime(seconds: number): string {
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60);
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

const dockStyle: React.CSSProperties = {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1001,
  display: 'flex',
  justifyContent: 'center',
  background: COLORS.surface,
  borderTop: `1px solid ${COLORS.border}`,
  padding: '12px 16px',
  paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
  boxShadow: '0 -4px 16px rgba(0,0,0,0.45)',
  fontFamily: FONT,
  color: COLORS.text,
};

const innerStyle: React.CSSProperties = {
  display: 'flex',
  width: '100%',
  maxWidth: 1200,
  alignItems: 'center',
  gap: 12,
};

const bodyButtonStyle: React.CSSProperties = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  textAlign: 'left',
  color: COLORS.text,
  cursor: 'pointer',
  padding: 0,
  fontFamily: FONT,
};

const titleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  textTransform: 'capitalize',
};

const trackStyle: React.CSSProperties = {
  marginTop: 6,
  height: 4,
  borderRadius: 999,
  background: COLORS.border,
  overflow: 'hidden',
};

const elapsedStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  color: COLORS.textMuted,
};

const iconBtnBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 44,
  height: 44,
  borderRadius: 8,
  border: 'none',
  background: 'transparent',
  color: COLORS.text,
  cursor: 'pointer',
  transition: 'background 120ms ease, color 120ms ease',
};

function hover(e: React.MouseEvent<HTMLButtonElement>, on: boolean) {
  e.currentTarget.style.background = on ? COLORS.bgHover : 'transparent';
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
      style={dockStyle}
    >
      <div style={innerStyle}>
        <button
          type="button"
          aria-label={`Open full player: ${track.explanation_type}, chapter ${track.chapter_number}`}
          style={bodyButtonStyle}
          onClick={() => player.openFullSheet()}
        >
          <div style={titleStyle}>
            {track.explanation_type} · Chapter {track.chapter_number}
          </div>
          <div style={trackStyle}>
            <div
              role="progressbar"
              aria-label="Playback progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              style={{
                width: `${progress * 100}%`,
                height: '100%',
                background: COLORS.accent,
                transition: 'width 200ms linear',
              }}
            />
          </div>
          <div style={elapsedStyle}>
            {formatTime(player.elapsedSeconds)} / {formatTime(player.durationSeconds)}
          </div>
        </button>
        <button
          type="button"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          style={iconBtnBase}
          onClick={() => (isPlaying ? player.pause() : player.play())}
          onMouseEnter={(e) => hover(e, true)}
          onMouseLeave={(e) => hover(e, false)}
        >
          {isPlaying ? (
            <Pause size={22} color={COLORS.accent} />
          ) : (
            <Play size={22} color={COLORS.accent} />
          )}
        </button>
        <button
          type="button"
          aria-label="Close audio player"
          style={iconBtnBase}
          onClick={() => player.close()}
          onMouseEnter={(e) => hover(e, true)}
          onMouseLeave={(e) => hover(e, false)}
        >
          <X size={22} />
        </button>
      </div>
    </div>
  );
}
