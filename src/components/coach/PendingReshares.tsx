import { useCallback, useEffect, useState } from 'react';

import { vmTokens } from '@/styles/themeStyles';
import {
  type PendingReshare,
  fetchPendingReshares,
  resolveReshareRequest,
  sendReshareRequest,
} from '@/services/coachService';

/**
 * Sessions waiting on a re-shared recording (change: port-coach-pipeline,
 * task 8.5a).
 *
 * A session that exhausts its retrieval budget produces NO report, by design,
 * because a report from partial material would mean something different from
 * every other report. So the queue has to be visible, or those sessions simply
 * disappear and the leader is left wondering why one week has no feedback.
 *
 * Two actions, matching the two ways back in (task 4.9a): ask the leader, or
 * mark it resolved and let retrieval try again.
 */
export default function PendingReshares() {
  const [requests, setRequests] = useState<PendingReshare[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRequests(await fetchPendingReshares());
      setError(null);
    } catch {
      // A non-admin gets a 403 here; that is not an error worth showing them.
      setRequests([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const act = useCallback(
    async (id: string, action: 'send' | 'resolve') => {
      setBusy(id);
      setError(null);
      try {
        if (action === 'send') await sendReshareRequest(id);
        else await resolveReshareRequest(id);
        await load();
      } catch {
        setError(
          action === 'send'
            ? 'The request could not be sent. Nothing was recorded as asked.'
            : 'The request could not be resolved.',
        );
      } finally {
        setBusy(null);
      }
    },
    [load],
  );

  // An empty queue is the normal case; a permanent empty panel is noise.
  if (!requests || requests.length === 0) return null;

  return (
    <section
      data-testid="coach-pending-reshares"
      style={{
        marginTop: 22,
        padding: 16,
        borderRadius: 12,
        border: `1px solid ${vmTokens.divider}`,
      }}
    >
      <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 14 }}>
        Waiting on a re-shared recording
      </p>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: vmTokens.textTertiary }}>
        No report is produced for these sessions until the recording can be
        retrieved.
      </p>
      {error && (
        <p
          data-testid="coach-reshare-error"
          style={{ margin: '0 0 10px', fontSize: 13, color: '#B91C1C' }}
        >
          {error}
        </p>
      )}
      {requests.map((r) => (
        <div
          key={r.sourceSessionId}
          data-testid={`coach-reshare-${r.sourceSessionId}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '10px 0',
            borderTop: `1px solid ${vmTokens.divider}`,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {r.title || 'Untitled session'}
            </div>
            <div style={{ fontSize: 12.5, color: vmTokens.textTertiary }}>
              {r.coachId ?? 'unattributed'} · {r.sessionDate} · {r.attempts}{' '}
              attempts
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {/* Asked already? The backend refuses a second send, so an
                enabled button here would just produce an error the admin
                cannot act on. */}
            <button
              type="button"
              onClick={() => act(r.sourceSessionId, 'send')}
              disabled={busy === r.sourceSessionId || r.asked}
              data-testid={`coach-reshare-send-${r.sourceSessionId}`}
              style={r.asked ? { ...btn, color: vmTokens.textTertiary, cursor: 'default' } : btn}
            >
              {r.asked ? 'Asked' : 'Ask the leader'}
            </button>
            <button
              type="button"
              onClick={() => act(r.sourceSessionId, 'resolve')}
              disabled={busy === r.sourceSessionId}
              data-testid={`coach-reshare-resolve-${r.sourceSessionId}`}
              style={btn}
            >
              Mark re-shared
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}

const btn = {
  fontSize: 13,
  fontWeight: 600,
  padding: '6px 10px',
  borderRadius: 8,
  border: `1px solid ${vmTokens.divider}`,
  background: 'none',
  color: vmTokens.gold,
  cursor: 'pointer',
};
