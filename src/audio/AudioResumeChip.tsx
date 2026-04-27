/**
 * Resume / Restart chip — shown beside Play in AudioFullSheet when
 * useAudioProgress returns a saved position. Resume calls
 * playFromResume so AUDIO_PLAYBACK_STARTED carries isResume=true
 * (br-audio-014); Restart starts from 0.
 */
import { useAudioPlayer } from './AudioPlayerContext';
import type { ResumeProgress } from './audioApi';

function formatTime(seconds: number): string {
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60);
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

export interface AudioResumeChipProps {
  progress: ResumeProgress;
  onResume?: (progress: ResumeProgress) => void;
  onRestart?: () => void;
}

export function AudioResumeChip(props: AudioResumeChipProps) {
  const player = useAudioPlayer();
  const { progress } = props;
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        className="min-h-[44px] rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        onClick={() => {
          player.playFromResume(progress.position_seconds);
          props.onResume?.(progress);
        }}
      >
        Resume at {formatTime(progress.position_seconds)}
      </button>
      <button
        type="button"
        className="min-h-[44px] rounded-md border border-border bg-background px-3 text-sm hover:bg-accent"
        onClick={() => {
          player.seek(0);
          player.play();
          props.onRestart?.();
        }}
      >
        Restart
      </button>
    </div>
  );
}
