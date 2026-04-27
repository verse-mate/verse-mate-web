/**
 * Inline "Listen · 3:47" chip rendered above the explanation body.
 * Themed to match the verse-mate-web dark shell (#1B1B1B bg / #B09A6D
 * gold accent / off-white text) — uses explicit colors rather than
 * Tailwind ShadCN tokens because the app doesn't activate a `.dark`
 * Tailwind theme.
 *
 * 5 states (br-audio-014 surface alignment):
 *   - GENERATING — spinner + "Generating… ~Xs"
 *   - ERROR      — red border, tap to retry (invalidates query)
 *   - POPULATED  — Play icon + "Listen · mm:ss"
 *   - PLAYING    — gold accent + "Playing…"
 *   - GUEST_SCOPE_EXCEEDED — "Sign in to listen to other chapters"
 *
 * br-audio-005: tap loads the track + explicitly plays. Never auto.
 */
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Lock, Music, Play } from 'lucide-react';
import { type AudioTrack, useAudioPlayer } from './AudioPlayerContext';
import { GuestScopeExceededError } from './audioApi';
import { COLORS, FONT } from './theme';
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

const baseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  alignSelf: 'flex-start',
  minHeight: 44,
  padding: '8px 14px',
  borderRadius: 8,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.bg,
  color: COLORS.text,
  fontSize: 14,
  fontFamily: FONT,
  cursor: 'pointer',
  transition: 'background 120ms ease, border-color 120ms ease',
};

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
        style={baseStyle}
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
        <Lock size={16} aria-hidden color={COLORS.textMuted} />
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
        style={{
          ...baseStyle,
          borderColor: COLORS.danger,
          color: COLORS.danger,
        }}
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
        style={{
          ...baseStyle,
          color: COLORS.textMuted,
          cursor: 'progress',
        }}
      >
        <Loader2 size={16} className="animate-spin" aria-hidden color={COLORS.accent} />
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

  const playingStyle = playingThis
    ? {
        borderColor: COLORS.accent,
        color: COLORS.accent,
      }
    : {};

  return (
    <button
      type="button"
      data-testid="audio-inline-entry"
      data-state={playingThis ? 'playing' : 'populated'}
      aria-label={playingThis ? 'Playing audio explanation' : 'Play audio explanation'}
      onClick={startTrack}
      style={{ ...baseStyle, ...playingStyle }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = COLORS.bgHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = COLORS.bg;
      }}
    >
      {playingThis ? (
        <Music size={16} aria-hidden color={COLORS.accent} />
      ) : (
        <Play size={16} aria-hidden color={COLORS.accent} />
      )}
      {playingThis ? 'Playing…' : `Listen · ${formatDuration(audio.duration_seconds)}`}
    </button>
  );
}
