/**
 * Audio player context — single source of truth for the docked-hybrid
 * web player. Mounts ONE <audio> element at the AppLayout root so
 * route changes don't unmount it (br-audio-011: cross-nav continuity).
 *
 * Mirrors the proven nanostore-based design in verse-mate's
 * frontend-base/src/hooks/useAudioPlayerStore — translated to plain
 * React Context so we don't add a new state dep to verse-mate-web.
 *
 * Business rules enforced here:
 *   - br-audio-005 — `load()` never auto-plays. The caller must
 *     explicitly call `play()` after.
 *   - br-audio-011 — the <audio> element is mounted at AppLayout
 *     above the Outlet, so React Router navigation doesn't unmount it.
 *   - br-audio-014 — `play / pause / ended` state transitions surface
 *     via the optional analytics callbacks on the provider props.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';

export interface AudioTrack {
  audio_id: string;
  explanation_id: number;
  url: string;
  duration_seconds: number;
  voice: string;
  language_code: string;
  explanation_type: string;
  book_id: number;
  chapter_number: number;
  /** br-audio-007: Reader DTO doesn't expose provider; analytics emits "unknown". */
  tts_provider: string;
  source_href: string;
}

export type AudioPlaybackState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'ended'
  | 'error';

export interface PlayContext {
  isResume: boolean;
  resumePositionSeconds?: number;
}

interface State {
  currentTrack: AudioTrack | null;
  playbackState: AudioPlaybackState;
  elapsedSeconds: number;
  durationSeconds: number;
  speed: number;
  error: string | null;
  dockVisible: boolean;
  fullSheetOpen: boolean;
  lastPlayContext: PlayContext | null;
}

type Action =
  | { type: 'LOAD'; track: AudioTrack }
  | { type: 'PLAY'; ctx: PlayContext }
  | { type: 'PAUSE' }
  | { type: 'SEEK'; seconds: number }
  | { type: 'SPEED'; speed: number }
  | { type: 'CLOSE' }
  | { type: 'ENDED' }
  | { type: 'ERROR'; message: string }
  | { type: 'TIME'; currentTime: number }
  | { type: 'DURATION'; duration: number }
  | { type: 'OPEN_FULL' }
  | { type: 'CLOSE_FULL' };

const initialState: State = {
  currentTrack: null,
  playbackState: 'idle',
  elapsedSeconds: 0,
  durationSeconds: 0,
  speed: 1,
  error: null,
  dockVisible: false,
  fullSheetOpen: false,
  lastPlayContext: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD':
      return {
        ...state,
        currentTrack: action.track,
        playbackState: 'loading',
        elapsedSeconds: 0,
        durationSeconds: action.track.duration_seconds,
        error: null,
        dockVisible: true,
      };
    case 'PLAY':
      return state.currentTrack
        ? {
            ...state,
            playbackState: 'playing',
            error: null,
            lastPlayContext: action.ctx,
          }
        : state;
    case 'PAUSE':
      return { ...state, playbackState: 'paused' };
    case 'SEEK':
      return { ...state, elapsedSeconds: action.seconds };
    case 'SPEED':
      return { ...state, speed: action.speed };
    case 'CLOSE':
      return { ...initialState, speed: state.speed };
    case 'ENDED':
      return { ...state, playbackState: 'ended' };
    case 'ERROR':
      return { ...state, playbackState: 'error', error: action.message };
    case 'TIME':
      return { ...state, elapsedSeconds: action.currentTime };
    case 'DURATION':
      return { ...state, durationSeconds: action.duration };
    case 'OPEN_FULL':
      return { ...state, fullSheetOpen: true };
    case 'CLOSE_FULL':
      return { ...state, fullSheetOpen: false };
    default:
      return state;
  }
}

export interface AudioPlayerContextValue extends State {
  load: (track: AudioTrack) => Promise<void>;
  play: () => Promise<void>;
  playFromResume: (positionSeconds: number) => Promise<void>;
  pause: () => void;
  seek: (seconds: number) => void;
  seekRelative: (delta: number) => void;
  setSpeed: (speed: number) => void;
  close: () => void;
  openFullSheet: () => void;
  closeFullSheet: () => void;
  /** Internal: the <audio> element ref, exposed so AudioPlayerRoot can wire onTimeUpdate etc. */
  _audioRef: React.RefObject<HTMLAudioElement>;
  /** Internal: dispatch from outside, used by AudioPlayerRoot's audio-event listeners. */
  _dispatch: (action: Action) => void;
}

const Ctx = createContext<AudioPlayerContextValue | null>(null);

export interface AudioPlayerProviderProps {
  children: ReactNode;
}

export function AudioPlayerProvider({ children }: AudioPlayerProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const audioRef = useRef<HTMLAudioElement>(null);

  const load = useCallback(async (track: AudioTrack) => {
    dispatch({ type: 'LOAD', track });
    if (audioRef.current) {
      audioRef.current.src = track.url;
      // br-audio-005: never auto-play. Caller must explicitly .play().
    }
  }, []);

  const play = useCallback(async () => {
    if (!audioRef.current || !state.currentTrack) return;
    try {
      await audioRef.current.play();
      dispatch({ type: 'PLAY', ctx: { isResume: false } });
    } catch (err) {
      dispatch({
        type: 'ERROR',
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }, [state.currentTrack]);

  const playFromResume = useCallback(
    async (positionSeconds: number) => {
      if (!audioRef.current || !state.currentTrack) return;
      audioRef.current.currentTime = positionSeconds;
      dispatch({ type: 'SEEK', seconds: positionSeconds });
      try {
        await audioRef.current.play();
        dispatch({
          type: 'PLAY',
          ctx: { isResume: true, resumePositionSeconds: positionSeconds },
        });
      } catch (err) {
        dispatch({
          type: 'ERROR',
          message: err instanceof Error ? err.message : String(err),
        });
      }
    },
    [state.currentTrack],
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
    dispatch({ type: 'PAUSE' });
  }, []);

  const seek = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    dispatch({ type: 'SEEK', seconds });
  }, []);

  const seekRelative = useCallback((delta: number) => {
    if (!audioRef.current) return;
    const next = Math.max(
      0,
      Math.min(
        audioRef.current.duration || 0,
        audioRef.current.currentTime + delta,
      ),
    );
    audioRef.current.currentTime = next;
    dispatch({ type: 'SEEK', seconds: next });
  }, []);

  const setSpeed = useCallback((speed: number) => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
    dispatch({ type: 'SPEED', speed });
  }, []);

  const close = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    dispatch({ type: 'CLOSE' });
  }, []);

  const openFullSheet = useCallback(() => dispatch({ type: 'OPEN_FULL' }), []);
  const closeFullSheet = useCallback(() => dispatch({ type: 'CLOSE_FULL' }), []);

  // Auto-close dock 3s after natural completion (matches web spec D1).
  useEffect(() => {
    if (state.playbackState !== 'ended') return;
    const timer = setTimeout(() => close(), 3000);
    return () => clearTimeout(timer);
  }, [state.playbackState, close]);

  const value = useMemo<AudioPlayerContextValue>(
    () => ({
      ...state,
      load,
      play,
      playFromResume,
      pause,
      seek,
      seekRelative,
      setSpeed,
      close,
      openFullSheet,
      closeFullSheet,
      _audioRef: audioRef,
      _dispatch: dispatch,
    }),
    [
      state,
      load,
      play,
      playFromResume,
      pause,
      seek,
      seekRelative,
      setSpeed,
      close,
      openFullSheet,
      closeFullSheet,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAudioPlayer(): AudioPlayerContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAudioPlayer outside AudioPlayerProvider');
  return v;
}
