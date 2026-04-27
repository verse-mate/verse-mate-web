/**
 * Full-sheet modal player. ±15s skip, speed menu, scrubber, resume row.
 *
 * a11y (TASK-016): focus trap on open, restore on close, Esc closes,
 * Space toggles play/pause when focus is inside the sheet.
 *
 * z-index 1002 — above the dock (1001) + the desktop split-view content.
 *
 * Theming: explicit dark colors (see ./theme) so the sheet matches the
 * #1B1B1B reader shell. Tailwind ShadCN tokens render light here
 * because the app doesn't activate `.dark` mode.
 */
import { ChevronDown, ExternalLink, Pause, Play } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useAudioPlayer } from './AudioPlayerContext';
import { AudioResumeChip } from './AudioResumeChip';
import { COLORS, FONT } from './theme';
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

const sheetStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1002,
  display: 'flex',
  flexDirection: 'column',
  background: COLORS.surface,
  color: COLORS.text,
  padding: '24px 16px',
  paddingTop: 'max(24px, env(safe-area-inset-top))',
  paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
  fontFamily: FONT,
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const iconBtnBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 44,
  height: 44,
  minWidth: 44,
  borderRadius: 8,
  border: 'none',
  background: 'transparent',
  color: COLORS.text,
  cursor: 'pointer',
  transition: 'background 120ms ease',
};

const linkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  minHeight: 44,
  padding: '0 8px',
  color: COLORS.accent,
  textDecoration: 'none',
  fontFamily: FONT,
};

const mainStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 20,
  flex: 1,
};

const titleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  textTransform: 'capitalize',
  textAlign: 'center',
  color: COLORS.text,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 14,
  color: COLORS.textMuted,
  textAlign: 'center',
};

const scrubberStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 480,
  accentColor: COLORS.accent,
};

const skipBtnStyle: React.CSSProperties = {
  ...iconBtnBase,
  fontSize: 14,
  fontWeight: 600,
  padding: '0 12px',
  width: 'auto',
};

const playBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 64,
  height: 64,
  borderRadius: 999,
  border: 'none',
  background: COLORS.accent,
  color: COLORS.accentText,
  cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(176,154,109,0.35)',
  transition: 'background 120ms ease, transform 120ms ease',
};

const speedRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: 8,
};

const elapsedStyle: React.CSSProperties = {
  fontSize: 14,
  color: COLORS.textMuted,
  fontVariantNumeric: 'tabular-nums',
};

function hover(e: React.MouseEvent<HTMLButtonElement>, on: boolean) {
  e.currentTarget.style.background = on ? COLORS.bgHover : 'transparent';
}

export function AudioFullSheet() {
  const player = useAudioPlayer();
  const open = player.fullSheetOpen;
  const track = player.currentTrack;
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const { resumeProgress, consumeResume, dismissResume } = useAudioProgress();

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

  const playing = player.playbackState === 'playing';

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-label="Full audio player"
      style={sheetStyle}
    >
      <header style={headerStyle}>
        <button
          type="button"
          aria-label="Close full player"
          style={iconBtnBase}
          onClick={() => player.closeFullSheet()}
          onMouseEnter={(e) => hover(e, true)}
          onMouseLeave={(e) => hover(e, false)}
        >
          <ChevronDown size={24} />
        </button>
        <a
          href={track.source_href}
          aria-label="Go to source explanation"
          style={linkStyle}
          onClick={() => player.closeFullSheet()}
        >
          Go to source <ExternalLink size={16} />
        </a>
      </header>

      <main style={mainStyle}>
        <div style={{ textAlign: 'center' }}>
          <div style={titleStyle}>{track.explanation_type}</div>
          <div style={subtitleStyle}>Chapter {track.chapter_number}</div>
        </div>

        <input
          type="range"
          min={0}
          max={player.durationSeconds || 0}
          step={0.1}
          value={player.elapsedSeconds}
          onChange={(e) => player.seek(Number(e.target.value))}
          aria-label="Playback position"
          style={scrubberStyle}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button
            type="button"
            aria-label="Rewind 15 seconds"
            style={skipBtnStyle}
            onClick={() => player.seekRelative(-15)}
            onMouseEnter={(e) => hover(e, true)}
            onMouseLeave={(e) => hover(e, false)}
          >
            -15s
          </button>
          <button
            type="button"
            aria-label={playing ? 'Pause' : 'Play'}
            style={playBtnStyle}
            onClick={() => (playing ? player.pause() : player.play())}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLORS.accentHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = COLORS.accent;
            }}
          >
            {playing ? <Pause size={32} /> : <Play size={32} />}
          </button>
          <button
            type="button"
            aria-label="Forward 15 seconds"
            style={skipBtnStyle}
            onClick={() => player.seekRelative(15)}
            onMouseEnter={(e) => hover(e, true)}
            onMouseLeave={(e) => hover(e, false)}
          >
            +15s
          </button>
        </div>

        {resumeProgress && !playing ? (
          <AudioResumeChip
            progress={resumeProgress}
            onResume={() => consumeResume()}
            onRestart={() => dismissResume()}
          />
        ) : null}

        <div style={speedRowStyle}>
          {SPEEDS.map((s) => {
            const active = player.speed === s;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                aria-label={`Set playback speed to ${s} times`}
                style={{
                  minHeight: 44,
                  minWidth: 44,
                  padding: '0 12px',
                  borderRadius: 8,
                  border: `1px solid ${active ? COLORS.accent : COLORS.border}`,
                  background: active ? COLORS.accent : 'transparent',
                  color: active ? COLORS.accentText : COLORS.text,
                  fontWeight: active ? 700 : 500,
                  fontSize: 14,
                  fontFamily: FONT,
                  cursor: 'pointer',
                  transition: 'background 120ms ease, color 120ms ease',
                }}
                onClick={() => player.setSpeed(s)}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = COLORS.bgHover;
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = 'transparent';
                }}
              >
                {s}×
              </button>
            );
          })}
        </div>

        <div style={elapsedStyle}>
          {formatTime(player.elapsedSeconds)} / {formatTime(player.durationSeconds)}
        </div>
      </main>
    </div>
  );
}
