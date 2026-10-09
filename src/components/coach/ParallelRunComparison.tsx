import { useState } from 'react';

import { useAdminCoaches, useParallelRunComparison } from '@/hooks/useCoach';
import { useRubric } from '@/hooks/useRubric';
import type { ComparedSession, ParallelRunComparison as Comparison } from '@/services/coachService';
import { dt } from './dashboardTheme';
import { h2, h3, note, row, table } from './adminStyles';
import { QueryState } from './PipelineHealth';

const score = (n: number | null) => (n === null ? 'N/A' : String(n));
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function isEmpty(c: Comparison): boolean {
  return !c.sessions.length && !c.needsPairing.length && !c.unmatched.backend.length && !c.unmatched.host.length;
}

export default function ParallelRunComparison() {
  const comparison = useParallelRunComparison();
  const roster = useAdminCoaches();
  const { rubric } = useRubric();
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  const nameOf = (coachId: string) => roster.data?.find((l) => l.id === coachId)?.name ?? coachId;
  const dimName = (n: number) => rubric?.dimensions.find((d) => d.n === n)?.name ?? `Dimension ${n}`;

  return (
    <div style={{ paddingTop: 22 }} data-testid="coach-parallel">
      <h2 style={h2}>Parallel run</h2>
      <p style={{ fontSize: 15, color: dt.textMuted, margin: '0 0 20px' }}>
        The backend's machine scores beside the host's reports, matched on leader and session date, as they stand now. The
        backend side is its machine score, before any admin correction.
      </p>
      <QueryState query={comparison} name="parallel" label="the parallel-run comparison">
        {(c) =>
          isEmpty(c) ? (
            <div data-testid="coach-parallel-empty" style={note}>
              Nothing has been compared yet. A session appears here once the backend has scored it during the parallel run.
            </div>
          ) : (
            <>
              <Summary c={c} />

              <h3 style={{ ...h3, marginTop: 26 }}>Compared sessions</h3>
              {c.sessions.length === 0 ? (
                <div style={note}>No session has been scored by both systems yet.</div>
              ) : (
                <>
                  <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontSize: 13.5, color: dt.body, marginBottom: 10 }}>
                    <input
                      type="checkbox"
                      checked={onlyFlagged}
                      onChange={(e) => setOnlyFlagged(e.target.checked)}
                      data-testid="coach-parallel-only-flagged"
                    />
                    Only flagged sessions
                  </label>
                  <div style={table}>
                    {[...c.sessions]
                      .filter((s) => !onlyFlagged || s.flagged)
                      .sort((a, b) => Number(b.flagged) - Number(a.flagged) || b.date.localeCompare(a.date))
                      .map((s) => (
                        <SessionRow key={s.backend.sourceSessionId} s={s} leader={nameOf(s.coachId)} dimName={dimName} />
                      ))}
                  </div>
                </>
              )}

              <h3 style={{ ...h3, marginTop: 26 }}>To pair</h3>
              {c.needsPairing.length === 0 ? (
                <div style={note}>No leader has more than one session on one date.</div>
              ) : (
                <>
                  <p style={{ fontSize: 13.5, color: dt.textMuted, margin: '0 0 10px' }}>
                    More than one session for a leader on one date. They are not paired by guess, so none of them is compared yet.
                  </p>
                  <div style={table}>
                    {c.needsPairing.map((p) => (
                      <div key={`${p.coachId}-${p.date}`} data-testid={`coach-parallel-pairing-${p.coachId}-${p.date}`} style={row}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>
                            {nameOf(p.coachId)} · {p.date}
                          </div>
                          <div style={{ fontSize: 12.5, color: dt.textLight }}>
                            {plural(p.backend.length, 'backend session')} ({p.backend.map((b) => b.sourceSessionId).join(', ')}) ·{' '}
                            {plural(p.host.length, 'host report')} ({p.host.map((h) => h.reportId).join(', ')})
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <h3 style={{ ...h3, marginTop: 26 }}>Scored on one side only</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                <Unmatched
                  testId="coach-parallel-unmatched-backend"
                  title="By the backend only"
                  empty="Every session the backend scored has a host report."
                  lines={c.unmatched.backend.map((u) => `${nameOf(u.coachId)} · ${u.date} · session ${u.sourceSessionId}`)}
                />
                <Unmatched
                  testId="coach-parallel-unmatched-host"
                  title="On the host only"
                  empty="Every host report has a backend session."
                  lines={c.unmatched.host.map((u) => `${nameOf(u.coachId)} · ${u.date} · report ${u.reportId}`)}
                />
              </div>
            </>
          )
        }
      </QueryState>
    </div>
  );
}

function Summary({ c }: { c: Comparison }) {
  const { share, counts } = c;
  return (
    <div style={{ ...note, color: dt.body }}>
      <div data-testid="coach-parallel-share" style={{ fontWeight: 600, fontSize: 15 }}>
        {share.ratio === null
          ? 'No dimension has been compared yet.'
          : `${share.withinOne} of ${plural(share.comparable, 'dimension')} within one point (${Math.round(share.ratio * 100)}%)`}
      </div>
      <div data-testid="coach-parallel-counts" style={{ fontSize: 13, color: dt.textMuted, marginTop: 4 }}>
        {counts.compared} compared · <span style={{ color: counts.flagged ? dt.rust : undefined }}>{counts.flagged} flagged</span> ·{' '}
        {counts.needsPairing} to pair · {counts.unmatchedBackend} scored by the backend only · {counts.unmatchedHost} on the host only
      </div>
    </div>
  );
}

function SessionRow({ s, leader, dimName }: { s: ComparedSession; leader: string; dimName: (n: number) => string }) {
  const id = s.backend.sourceSessionId;
  return (
    <div
      data-testid={`coach-parallel-session-${id}`}
      style={{ ...row, display: 'block', background: s.flagged ? dt.rustBg : undefined }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>
          {leader} · {s.date}
        </span>
        {s.flagged && (
          <span data-testid={`coach-parallel-flagged-${id}`} style={{ fontSize: 12, fontWeight: 700, color: dt.rust }}>
            Flagged for the cutover read
          </span>
        )}
      </div>
      <div style={{ fontSize: 13, color: dt.body, margin: '2px 0 6px' }}>
        Composite: Backend {s.backend.composite.toFixed(1)} · Host {s.host.composite.toFixed(1)} · {s.compositeDifference.toFixed(1)} apart ·{' '}
        {s.withinOne} of {plural(s.comparable, 'dimension')} within one point
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 12.5, color: dt.body }}>
          <thead>
            <tr style={{ color: dt.textLight, textAlign: 'left' }}>
              <th style={cell}>Dimension</th>
              <th style={cell}>Host</th>
              <th style={cell}>Backend</th>
              <th style={cell}>Apart</th>
            </tr>
          </thead>
          <tbody>
            {s.dimensions.map((d) => (
              <tr key={d.n} data-testid={`coach-parallel-dim-${id}-${d.n}`}>
                <td style={cell}>{dimName(d.n)}</td>
                <td style={cell}>{score(d.host)}</td>
                <td style={cell}>{score(d.backend)}</td>
                <td style={cell}>{d.difference === null ? 'N/A, left out of the share' : d.difference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 12, color: dt.textLight, marginTop: 4 }}>
        Backend session {id}, report {s.backend.reportId} · host report {s.host.reportId}
      </div>
    </div>
  );
}

function Unmatched({ testId, title, empty, lines }: { testId: string; title: string; empty: string; lines: string[] }) {
  return (
    <div data-testid={testId}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
        {title} ({lines.length})
      </div>
      {lines.length === 0 ? (
        <div style={{ ...note, padding: 12 }}>{empty}</div>
      ) : (
        <div style={table}>
          {lines.map((line) => (
            <div key={line} style={{ ...row, fontSize: 13 }}>
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const cell: React.CSSProperties = { padding: '3px 14px 3px 0', borderBottom: `1px solid ${dt.rowDivider}` };
