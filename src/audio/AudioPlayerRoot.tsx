/**
 * AudioPlayerRoot — mounts the singleton <audio> element + dock + sheet.
 *
 * Mounts at AppLayout above the route Outlet so React Router navigation
 * doesn't unmount it (br-audio-011 cross-nav continuity). Wires audio
 * element events back into the context reducer.
 *
 * Calling site (App.tsx):
 *   <AudioPlayerProvider>
 *     <AudioPlayerRoot>
 *       <Outlet />          // route content here
 *     </AudioPlayerRoot>
 *   </AudioPlayerProvider>
 */
import type { ReactNode } from 'react';
import { AudioDockBar } from './AudioDockBar';
import { AudioFullSheet } from './AudioFullSheet';
import { useAudioPlayer } from './AudioPlayerContext';

export interface AudioPlayerRootProps {
  children: ReactNode;
}

export function AudioPlayerRoot({ children }: AudioPlayerRootProps) {
  const player = useAudioPlayer();

  return (
    <>
      {children}
      {/* biome-ignore lint/a11y/useMediaCaption: TTS audio — no captions applicable */}
      <audio
        ref={player._audioRef}
        preload="metadata"
        onTimeUpdate={(e) =>
          player._dispatch({ type: 'TIME', currentTime: e.currentTarget.currentTime })
        }
        onDurationChange={(e) =>
          player._dispatch({ type: 'DURATION', duration: e.currentTarget.duration })
        }
        onEnded={() => player._dispatch({ type: 'ENDED' })}
        onError={(e) =>
          player._dispatch({
            type: 'ERROR',
            message: e.currentTarget.error?.message ?? 'audio error',
          })
        }
      />
      <AudioDockBar />
      <AudioFullSheet />
    </>
  );
}
