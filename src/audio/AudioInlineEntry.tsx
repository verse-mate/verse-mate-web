/**
 * Inline "Listen · 3:47" chip rendered above the explanation body.
 * 5 states (br-audio-014 surface alignment):
 *   - GENERATING — spinner + "Generating… ~Xs"
 *   - ERROR      — danger color, tap to retry (invalidates query)
 *   - POPULATED  — Play icon + "Listen · mm:ss"
 *   - PLAYING    — primary color + "Playing…"
 *   - GUEST_SCOPE_EXCEEDED — "Sign in to listen to other chapters"
 *
 * br-audio-005: tap loads the track + explicitly plays. Never auto.
 */
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Lock, Music, Play } from 'lucide-react';
import { type AudioTrack, useAudioPlayer } from './AudioPlayerContext';
import { GuestScopeExceededError } from './audioApi';
import { useExplanationAudio } from './useExplanationAudio';

export interface AudioInlineEntryProps {
  explanationId: number | null;
  explanationType: string;
  bookId: number;
  chapterNumber: number;
  language?: string;
  voice?: string;
  /** Deep-link back used by the dock/full-sheet "Go to source" affordance. */
  sourceHref: string;
}

function formatDuration(seconds: number): string {
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60);
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

const baseChip =
  'inline-flex items-center gap-2 self-start min-h-[44px] px-3 py-2 rounded-md border text-sm transition-colors';

export function AudioInlineEntry(props: AudioInlineEntryProps) {
  const queryClient = useQueryClient();
  const player = useAudioPlayer();
  const { audio, isGenerating, estimatedReadySeconds, error } =
    useExplanationAudio({
      explanationId: props.explanationId,
      voice: props.voice,
      language: props.language,
    });

  if (props.explanationId === null) return null;

  if (error instanceof GuestScopeExceededError) {
    return (
      <button
        type="button"
        data-testid="audio-inline-entry"
        data-state="guest-blocked"
        className={`${baseChip} border-border bg-background text-foreground hover:bg-accent`}
        onClick={() =>
          queryClient.invalidateQueries({
            queryKey: [
              'explanation-audio',
              props.explanationId,
              props.voice,
              props.language,
            ],
          })
        }
      >
        <Lock size={16} aria-hidden />
        Sign in to listen to other chapters
      </button>
    );
  }

  if (error) {
    return (
      <button
        type="button"
        data-testid="audio-inline-entry"
        data-state="error"
        aria-label={`Audio unavailable — retry (${error.message})`}
        className={`${baseChip} border-destructive text-destructive hover:bg-destructive/10`}
        onClick={() =>
          queryClient.invalidateQueries({
            queryKey: [
              'explanation-audio',
              props.explanationId,
              props.voice,
              props.language,
            ],
          })
        }
      >
        Audio unavailable — Retry
      </button>
    );
  }

  if (isGenerating || !audio) {
    return (
      <div
        data-testid="audio-inline-entry"
        data-state="loading"
        aria-live="polite"
        className={`${baseChip} border-border bg-background text-muted-foreground opacity-80`}
      >
        <Loader2 size={16} className="animate-spin" aria-hidden />
        Generating… ~{estimatedReadySeconds ?? 8}s
      </div>
    );
  }

  const isThisTrack = player.currentTrack?.explanation_id === props.explanationId;
  const playingThis = isThisTrack && player.playbackState === 'playing';

  const startTrack = async () => {
    if (!isThisTrack) {
      const track: AudioTrack = {
        audio_id: `exp-${props.explanationId}`,
        explanation_id: props.explanationId as number,
        url: audio.url,
        duration_seconds: audio.duration_seconds,
        voice: audio.voice,
        language_code: audio.language_code,
        explanation_type: props.explanationType,
        book_id: props.bookId,
        chapter_number: props.chapterNumber,
        // br-audio-007: Reader DTO does not expose provider; analytics surfaces "unknown".
        tts_provider: 'unknown',
        source_href: props.sourceHref,
      };
      await player.load(track);
    }
    await player.play();
  };

  return (
    <button
      type="button"
      data-testid="audio-inline-entry"
      data-state={playingThis ? 'playing' : 'populated'}
      aria-label={playingThis ? 'Playing audio explanation' : 'Play audio explanation'}
      onClick={startTrack}
      className={`${baseChip} ${
        playingThis
          ? 'border-primary text-primary'
          : 'border-border bg-background text-foreground hover:bg-accent'
      }`}
    >
      {playingThis ? (
        <Music size={16} className="text-primary" aria-hidden />
      ) : (
        <Play size={16} aria-hidden />
      )}
      {playingThis ? 'Playing…' : `Listen · ${formatDuration(audio.duration_seconds)}`}
    </button>
  );
}
