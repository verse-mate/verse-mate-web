/**
 * useAudioProgress — fetch saved resume position on track change,
 * persist progress on the playback lifecycle. Hosted by AudioPlayerRoot
 * so the saver runs for the entire playback (not just while the full
 * sheet is open).
 *
 * Server-side rules in br-audio-004 gate save validity (>30s elapsed,
 * <95% of duration). Client just reports.
 */
import { useEffect, useRef, useState } from 'react';
import { useAudioPlayer } from './AudioPlayerContext';
import {
  fetchProgress,
  saveProgress,
  type ResumeProgress,
} from './audioApi';

const SAVE_INTERVAL_MS = 15_000;

export interface UseAudioProgressResult {
  resumeProgress: ResumeProgress | null;
  consumeResume: () => ResumeProgress | null;
  dismissResume: () => void;
}

export function useAudioProgress(): UseAudioProgressResult {
  const player = useAudioPlayer();
  const track = player.currentTrack;
  const playbackState = player.playbackState;

  const [resumeProgress, setResumeProgress] = useState<ResumeProgress | null>(
    null,
  );
  const dismissedForIdRef = useRef<number | null>(null);

  // Fetch resume on track change (br-audio-004 validate-on-read).
  useEffect(() => {
    if (!track) {
      setResumeProgress(null);
      return;
    }
    const explanationId = track.explanation_id;
    if (dismissedForIdRef.current === explanationId) return;

    let cancelled = false;
    fetchProgress(explanationId)
      .then((data) => {
        if (!cancelled) setResumeProgress(data);
      })
      .catch(() => {
        if (!cancelled) setResumeProgress(null);
      });

    return () => {
      cancelled = true;
    };
  }, [track]);

  // Periodic save while playing.
  useEffect(() => {
    if (!track || playbackState !== 'playing') return;
    const interval = window.setInterval(() => {
      saveProgress({
        explanationId: track.explanation_id,
        positionSeconds: player.elapsedSeconds,
        durationSeconds: track.duration_seconds,
        reason: 'pause',
      });
    }, SAVE_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [playbackState, track, player.elapsedSeconds]);

  // Save on pause + complete.
  const prevStateRef = useRef(playbackState);
  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = playbackState;
    if (!track) return;
    if (prev === 'playing' && playbackState === 'paused') {
      saveProgress({
        explanationId: track.explanation_id,
        positionSeconds: player.elapsedSeconds,
        durationSeconds: track.duration_seconds,
        reason: 'pause',
      });
    } else if (playbackState === 'ended') {
      saveProgress({
        explanationId: track.explanation_id,
        positionSeconds: player.elapsedSeconds,
        durationSeconds: track.duration_seconds,
        reason: 'complete',
      });
    }
  }, [playbackState, track, player.elapsedSeconds]);

  // Save on beforeunload via sendBeacon — survives page tear-down.
  useEffect(() => {
    if (!track) return;
    const handler = () => {
      const state = playbackState;
      if (state !== 'playing' && state !== 'paused') return;
      const body = JSON.stringify({
        position_seconds: player.elapsedSeconds,
        duration_seconds: track.duration_seconds,
        reason: 'navigation',
      });
      navigator.sendBeacon?.(
        `${import.meta.env.VITE_API_URL ?? 'https://api.versemate.org'}/bible/explanation/audio/${track.explanation_id}/progress`,
        new Blob([body], { type: 'application/json' }),
      );
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [track, playbackState, player.elapsedSeconds]);

  return {
    resumeProgress,
    consumeResume: () => {
      const r = resumeProgress;
      setResumeProgress(null);
      return r;
    },
    dismissResume: () => {
      if (track) dismissedForIdRef.current = track.explanation_id;
      setResumeProgress(null);
    },
  };
}
