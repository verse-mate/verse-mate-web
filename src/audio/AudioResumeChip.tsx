/**
 * Resume / Restart chip — shown beside Play in AudioFullSheet when
 * useAudioProgress returns a saved position. Resume calls
 * playFromResume so AUDIO_PLAYBACK_STARTED carries isResume=true
 * (br-audio-014); Restart starts from 0.
 *
 * Theming: explicit dark colors (see ./theme).
 */
import { useAudioPlayer } from './AudioPlayerContext';
import type { ResumeProgress } from './audioApi';
import { COLORS, FONT } from './theme';

function formatTime(seconds: number): string {
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60);
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

const resumeBtnStyle: React.CSSProperties = {
  minHeight: 44,
  padding: '0 14px',
  borderRadius: 8,
  border: 'none',
  background: COLORS.accent,
  color: COLORS.accentText,
  fontWeight: 600,
  fontSize: 14,
  fontFamily: FONT,
  cursor: 'pointer',
  transition: 'background 120ms ease',
};

const restartBtnStyle: React.CSSProperties = {
  minHeight: 44,
  padding: '0 14px',
  borderRadius: 8,
  border: `1px solid ${COLORS.border}`,
  background: 'transparent',
  color: COLORS.text,
  fontSize: 14,
  fontFamily: FONT,
  cursor: 'pointer',
  transition: 'background 120ms ease',
};

export interface AudioResumeChipProps {
  progress: ResumeProgress;
  onResume?: (progress: ResumeProgress) => void;
  onRestart?: () => void;
}

export function AudioResumeChip(props: AudioResumeChipProps) {
  const player = useAudioPlayer();
  const { progress } = props;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <button
        type="button"
        style={resumeBtnStyle}
        onClick={() => {
          player.playFromResume(progress.position_seconds);
          props.onResume?.(progress);
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = COLORS.accentHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = COLORS.accent;
        }}
      >
        Resume at {formatTime(progress.position_seconds)}
      </button>
      <button
        type="button"
        style={restartBtnStyle}
        onClick={() => {
          player.seek(0);
          player.play();
          props.onRestart?.();
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = COLORS.bgHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        Restart
      </button>
    </div>
  );
}
