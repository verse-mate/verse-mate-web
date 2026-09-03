import { useCallback, useRef, useState } from 'react';

import { vmTokens } from '@/styles/themeStyles';
import { mintRecordingUrl } from '@/services/coachService';

/**
 * A session's retained recording (change: port-coach-pipeline, task 8.5).
 *
 * VerseMate holds the recording for sessions it ingested, so there is no admin
 * attachment step any more. The address is MINTED when playback starts, never
 * when the component renders: minting on render would sign a URL for every
 * session a list shows, each live for a day, and an address minted when a
 * detail view opened is already spent by the time someone comes back to the tab.
 *
 * A failed load re-mints once, which is what makes a long-open detail view
 * still play rather than showing a dead video element.
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
  const [src, setSrc] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const remintedRef = useRef(false);
  const [renderedFor, setRenderedFor] = useState(reportId);

  // A detail view that swaps one session for another keeps this component
  // mounted in the same position, so React reuses the instance and every piece
  // of state above survives the swap. The leader then saw the PREVIOUS
  // session's recording playing under the new session's heading. Resetting in
  // render (rather than in an effect) means the wrong src never paints.
  if (renderedFor !== reportId) {
    setRenderedFor(reportId);
    setSrc(null);
    setState('idle');
    remintedRef.current = false;
  }

  const attached = attachedUrl?.trim();

  const start = useCallback(async () => {
    setState('loading');
    // A fresh press is a fresh attempt, so it gets its own re-mint budget.
    remintedRef.current = false;
    const minted = await mintRecordingUrl(reportId);
    if (!minted) {
      setState('error');
      return;
    }
    setSrc(minted.url);
    setState('idle');
  }, [reportId]);

  const handleError = useCallback(async () => {
    // Re-mint ONCE. Looping would hammer the endpoint when the failure is the
    // recording itself rather than an expired address.
    if (remintedRef.current) {
      // Drop the src with it. Left in place, the `if (src)` branch below kept
      // rendering the broken <video> and the failure message never reached the
      // screen, which is exactly the dead player this component exists to
      // avoid.
      setSrc(null);
      setState('error');
      return;
    }
    remintedRef.current = true;
    const minted = await mintRecordingUrl(reportId);
    if (!minted) {
      setSrc(null);
      setState('error');
      return;
    }
    setSrc(minted.url);
  }, [reportId]);

  // An admin attached a link deliberately, usually because it is the better
  // copy, so it wins over anything retained.
  if (attached) {
    return (
      <a
        href={attached}
        target="_blank"
        rel="noopener noreferrer"
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
        src={src}
        controls
        autoPlay
        onError={handleError}
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
