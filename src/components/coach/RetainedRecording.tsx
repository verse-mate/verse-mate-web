import { useCallback, useRef, useState, type SyntheticEvent } from 'react';

import { vmTokens } from '@/styles/themeStyles';
import { mintRecordingUrl } from '@/services/coachService';
import { REPLAY_BLOCK_CLASS } from '@/lib/analyticsPrivacy';

const SPENT_REMINTS_WITHOUT_PROGRESS = 3;

/**
 * A session's retained recording (change: port-coach-pipeline, task 8.5).
 *
 * VerseMate holds the recording for sessions it ingested, so there is no admin
 * attachment step any more. The address is MINTED when playback starts, never
 * when the component renders: minting on render would sign a URL for every
 * session a list shows, and an address minted when a detail view opened is
 * already spent by the time someone comes back to the tab.
 */
export default function RetainedRecording({
  reportId,
  hasRetained,
  attachedUrl,
}: {
  reportId: string;
  hasRetained: boolean;
  /** An admin's pasted external link. Takes precedence when present. */
  attachedUrl?: string;
}) {
  const [src, setSrc] = useState<{ url: string; load: number } | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const remintedRef = useRef(false);
  const spentRemintsRef = useRef(0);
  const expiresAtRef = useRef(0);
  const [resumeAt, setResumeAt] = useState<{ time: number; playing: boolean } | null>(null);
  const [renderedFor, setRenderedFor] = useState(reportId);
  const openReportRef = useRef(reportId);
  openReportRef.current = reportId;

  // A detail view that swaps one session for another keeps this component
  // mounted in the same position, so React reuses the instance and every piece
  // of state above survives the swap. The leader then saw the PREVIOUS
  // session's recording playing under the new session's heading. Resetting in
  // render (rather than in an effect) means the wrong src never paints.
  if (renderedFor !== reportId) {
    setRenderedFor(reportId);
    setSrc(null);
    setResumeAt(null);
    setState('idle');
    remintedRef.current = false;
    spentRemintsRef.current = 0;
  }

  const attached = attachedUrl?.trim();

  // The expiry is counted from when the request left, which is never later than
  // when the server issued the address, so an error past it is always a spent
  // address and never a recording that is broken.
  const mint = useCallback(async () => {
    const requestedAt = Date.now();
    const minted = await mintRecordingUrl(reportId);
    if (openReportRef.current !== reportId) return undefined;
    if (minted) expiresAtRef.current = requestedAt + minted.expiresInSeconds * 1000;
    return minted;
  }, [reportId]);

  const start = useCallback(async () => {
    setState('loading');
    remintedRef.current = false;
    spentRemintsRef.current = 0;
    const minted = await mint();
    if (minted === undefined) return;
    if (!minted) {
      setState('error');
      return;
    }
    setResumeAt(null);
    setSrc((prev) => ({ url: minted.url, load: (prev?.load ?? 0) + 1 }));
    setState('idle');
  }, [mint]);

  const reminting = useRef(false);
  const remint = useCallback(
    async (video: HTMLVideoElement) => {
      if (reminting.current) return;
      const position =
        video.readyState === HTMLMediaElement.HAVE_NOTHING && resumeAt
          ? resumeAt
          : { time: video.currentTime, playing: !video.paused };
      const expired = Date.now() >= expiresAtRef.current;
      if (position.time > (resumeAt?.time ?? 0)) spentRemintsRef.current = 0;
      const outOfBudget = expired
        ? spentRemintsRef.current >= SPENT_REMINTS_WITHOUT_PROGRESS
        : remintedRef.current;
      if (outOfBudget) {
        setSrc(null);
        setState('error');
        return;
      }
      if (expired) spentRemintsRef.current += 1;
      else remintedRef.current = true;
      reminting.current = true;
      const minted = await mint().finally(() => {
        reminting.current = false;
      });
      if (minted === undefined) return;
      if (!minted) {
        setSrc(null);
        setState('error');
        return;
      }
      setResumeAt(position);
      setSrc((prev) => ({ url: minted.url, load: (prev?.load ?? 0) + 1 }));
    },
    [mint, resumeAt],
  );

  const handleError = useCallback((event: SyntheticEvent<HTMLVideoElement>) => remint(event.currentTarget), [remint]);

  // iOS Safari never fires `error` on an expired address: it retries the refused
  // range requests and sits waiting. So a spent address is renewed as soon as the
  // player starts, waits or stalls past the expiry, whatever the browser reports.
  const handleSpent = useCallback(
    (event: SyntheticEvent<HTMLVideoElement>) => {
      if (Date.now() >= expiresAtRef.current) void remint(event.currentTarget);
    },
    [remint],
  );

  const handleLoadedMetadata = useCallback(
    (event: SyntheticEvent<HTMLVideoElement>) => {
      if (resumeAt) event.currentTarget.currentTime = resumeAt.time;
    },
    [resumeAt],
  );

  // An admin attached a link deliberately, usually because it is the better
  // copy, so it wins over anything retained.
  if (attached) {
    return (
      <a
        href={attached}
        target="_blank"
        rel="noopener noreferrer"
        className={REPLAY_BLOCK_CLASS}
        data-testid={`coach-recording-attached-${reportId}`}
        style={{ fontSize: 14, fontWeight: 600, color: vmTokens.gold }}
      >
        Watch the recording →
      </a>
    );
  }

  // Nothing to offer. Rendering an empty player would suggest the recording is
  // broken rather than absent.
  if (!hasRetained) return null;

  if (src) {
    return (
      // biome-ignore lint/a11y/useMediaCaption: the transcript is the caption track we do not yet publish
      <video
        key={src.load}
        src={src.url}
        controls
        autoPlay={resumeAt ? resumeAt.playing : true}
        onError={handleError}
        onPlay={handleSpent}
        onWaiting={handleSpent}
        onStalled={handleSpent}
        onLoadedMetadata={handleLoadedMetadata}
        className={REPLAY_BLOCK_CLASS}
        data-testid={`coach-recording-player-${reportId}`}
        style={{ width: '100%', borderRadius: 10, background: '#000' }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={start}
      disabled={state === 'loading'}
      data-testid={`coach-recording-play-${reportId}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        fontSize: 14,
        fontWeight: 600,
        color: vmTokens.gold,
        background: 'none',
        border: `1px solid ${vmTokens.divider}`,
        borderRadius: 8,
        padding: '8px 12px',
        cursor: state === 'loading' ? 'default' : 'pointer',
      }}
    >
      {state === 'loading'
        ? 'Opening the recording…'
        : state === 'error'
          ? 'Recording unavailable, try again'
          : 'Play the recording'}
    </button>
  );
}
