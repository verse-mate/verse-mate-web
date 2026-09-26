import { useState } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  useCoverage,
  usePipelineFailures,
  useReleaseHeldReport,
  useRequeuePipelineFailure,
} from '@/hooks/useCoach';
import {
  CoachApiError,
  CoachAuthError,
  type PipelineFailure,
  type ReleaseOutcome,
} from '@/services/coachService';
import { dt } from './dashboardTheme';

type Outcome = { tone: 'ok' | 'refused'; text: string };

function refusalText(err: unknown): string {
  if (err instanceof CoachAuthError) return 'Refused: this account does not have admin access.';
  if (err instanceof CoachApiError) {
    const kind = err.status >= 500 ? 'Server error' : 'Refused';
    return `${kind} (${err.status})${err.serverMessage ? `: ${err.serverMessage}` : ''}`;
  }
  return 'The request failed.';
}

function releaseText(outcome: ReleaseOutcome): Outcome {
  if (outcome.delivered) return { tone: 'ok', text: 'Released and delivered to the leader.' };
  const reasons = [...(outcome.violations ?? []), ...(outcome.shortfalls ?? [])];
  return {
    tone: 'refused',
    text: `Not delivered: ${outcome.refusal ?? 'refused'}${reasons.length ? ` (${reasons.join(', ')})` : ''}`,
  };
}

function QueryState<T>({
  query,
  name,
  label,
  children,
}: {
  query: UseQueryResult<T>;
  name: string;
  label: string;
  children: (data: T) => React.ReactNode;
}) {
  if (query.isLoading) {
    return <div style={note}>Loading {label}…</div>;
  }
  if (query.error instanceof CoachAuthError) {
    return (
      <div data-testid={`coach-${name}-refused`} style={{ ...note, color: dt.rust }}>
        The server refused to show {label} to this account.
      </div>
    );
  }
  if (query.error || query.data === undefined) {
    return (
      <div data-testid={`coach-${name}-failed`} style={{ ...note, color: dt.rust }}>
        Could not load {label}. {query.error ? refusalText(query.error) : ''}{' '}
        <button type="button" onClick={() => query.refetch()} style={linkBtn}>
          Try again
        </button>
      </div>
    );
  }
  return <>{children(query.data)}</>;
}

export default function PipelineHealth() {
  const failures = usePipelineFailures();
  const coverage = useCoverage();
  const requeue = useRequeuePipelineFailure();
  const release = useReleaseHeldReport();
  const [outcomes, setOutcomes] = useState<Record<string, Outcome>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const record = (s: PipelineFailure, outcome: Outcome) => {
    setOutcomes((o) => ({ ...o, [s.sourceSessionId]: outcome }));
    if (outcome.tone === 'ok') toast.success(`${s.title || 'Session'}: ${outcome.text}`);
  };

  const doRequeue = async (s: PipelineFailure) => {
    setBusy(s.sourceSessionId);
    try {
      await requeue.mutateAsync(s.sourceSessionId);
      record(s, { tone: 'ok', text: 'Back in the queue.' });
    } catch (err) {
      record(s, { tone: 'refused', text: refusalText(err) });
    } finally {
      setBusy(null);
    }
  };

  const doRelease = async (s: PipelineFailure, reportId: string) => {
    setBusy(s.sourceSessionId);
    try {
      record(s, releaseText(await release.mutateAsync(reportId)));
    } catch (err) {
      record(s, { tone: 'refused', text: refusalText(err) });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div style={{ paddingTop: 22 }} data-testid="coach-pipeline">
      <h2 style={h2}>Pipeline</h2>
      <p style={{ fontSize: 15, color: dt.textMuted, margin: '0 0 20px' }}>
        Sessions the pipeline could not finish, and whether the recording bot covers every leader.
      </p>

      <h3 style={h3}>Stuck sessions</h3>
      <QueryState query={failures} name="pipeline" label="stuck sessions">
        {(sessions) =>
          sessions.length === 0 ? (
            <div data-testid="coach-pipeline-empty" style={note}>
              Nothing is stuck. Every session reached its leader or is still in progress.
            </div>
          ) : (
            <div style={table}>
              {sessions.map((s) => {
                const outcome = outcomes[s.sourceSessionId];
                const reportId = s.reportId;
                return (
                  <div key={s.sourceSessionId} data-testid={`coach-pipeline-${s.sourceSessionId}`} style={row}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{s.title || 'Untitled session'}</div>
                      <div style={{ fontSize: 12.5, color: dt.textLight }}>
                        {s.coachId ?? 'unattributed'} · {s.sessionDate} · {s.state} · {s.attempts} attempts
                      </div>
                      <div style={{ fontSize: 13, color: dt.body, marginTop: 4 }}>
                        {s.reason ? `Why: ${s.reason}` : 'No reason recorded'}
                      </div>
                      {outcome && (
                        <div
                          data-testid={`coach-pipeline-outcome-${s.sourceSessionId}`}
                          style={{ fontSize: 13, marginTop: 4, color: outcome.tone === 'ok' ? dt.green : dt.rust }}
                        >
                          {outcome.text}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                      {reportId && (
                        <button
                          type="button"
                          onClick={() => doRelease(s, reportId)}
                          disabled={busy === s.sourceSessionId}
                          data-testid={`coach-pipeline-release-${s.sourceSessionId}`}
                          style={btn}
                        >
                          Release report
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => doRequeue(s)}
                        disabled={busy === s.sourceSessionId}
                        data-testid={`coach-pipeline-requeue-${s.sourceSessionId}`}
                        style={btn}
                      >
                        Put back in the queue
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        }
      </QueryState>

      <h3 style={{ ...h3, marginTop: 30 }}>Recording-bot coverage</h3>
      <QueryState query={coverage} name="coverage" label="recording-bot coverage">
        {(report) => {
          const covered = report.leaders.filter((l) => l.covered).length;
          return (
            <>
              <div
                data-testid="coach-coverage-summary"
                style={{ ...note, color: report.allCovered ? dt.green : dt.rust, marginBottom: 12 }}
              >
                {covered} of {report.leaders.length} leaders covered over the last {report.windowDays} days.
                {report.allCovered ? ' Every leader is covered.' : ' Not every leader is covered.'}
              </div>
              <div style={table}>
                {report.leaders.map((l) => (
                  <div key={l.coachId} data-testid={`coach-coverage-${l.coachId}`} style={row}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{l.name}</div>
                      <div style={{ fontSize: 12.5, color: dt.textLight }}>
                        {l.email} · account {l.accountStatus} · {l.observedSessions} observed sessions ·{' '}
                        {l.linkedClassName ?? 'no linked class'}
                        {l.classAlert ? ' · registered class disagrees with what was observed' : ''}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '4px 8px',
                        borderRadius: 6,
                        color: l.covered ? dt.green : dt.rust,
                        background: l.covered ? dt.greenBg : dt.rustBg,
                      }}
                    >
                      {l.covered ? `Covered (${l.basis})` : 'Not covered'}
                    </div>
                  </div>
                ))}
              </div>
            </>
          );
        }}
      </QueryState>
    </div>
  );
}

const h2: React.CSSProperties = {
  fontFamily: dt.serif,
  fontWeight: 500,
  fontSize: 30,
  margin: '14px 0 6px',
  letterSpacing: '-.01em',
};
const h3: React.CSSProperties = { fontFamily: dt.serif, fontWeight: 500, fontSize: 21, margin: '0 0 12px' };
const note: React.CSSProperties = {
  background: dt.innerBg,
  border: `1px dashed ${dt.dashed}`,
  borderRadius: 12,
  padding: 18,
  fontSize: 14,
  color: dt.textMuted,
  lineHeight: 1.6,
};
const table: React.CSSProperties = { border: `1px solid ${dt.cardBorder}`, borderRadius: 12, overflow: 'hidden' };
const row: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
  padding: '12px 16px',
  borderTop: `1px solid ${dt.rowDivider}`,
};
const btn: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  padding: '7px 11px',
  borderRadius: 8,
  border: `1px solid ${dt.cardBorder}`,
  background: dt.cardBg,
  color: dt.gold,
  cursor: 'pointer',
};
const linkBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  fontWeight: 700,
  color: dt.gold,
};
