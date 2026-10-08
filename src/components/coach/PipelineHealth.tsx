import { useEffect, useState } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  useAdminCoaches,
  useAttributeSession,
  useCoverage,
  useLeaderAttribution,
  usePipelineFailures,
  useReleaseHeldReport,
  useRequeuePipelineFailure,
  useSaveLeaderAttribution,
  useSetNotTeaching,
  useUpdateLeaderEmail,
} from '@/hooks/useCoach';
import { REPLAY_BLOCK_CLASS } from '@/lib/analyticsPrivacy';
import {
  CoachAuthError,
  type CoverageLeader,
  EMAIL_RULE,
  badAddressText,
  isPlaceholderAddress,
  needsBenchmarkConfirm,
  PIPELINE_PAGE_SIZE,
  type PipelineFailure,
  refusalText,
  type ReleaseOutcome,
} from '@/services/coachService';
import { dt } from './dashboardTheme';

type Outcome = { tone: 'ok' | 'refused'; text: string; held?: string[] };

const COLD_RECALL_HOLD = 'held: a first lesson with a cold-recall improvement: ';
const FAILED_SEND = /^(send failed to |no recipient has a deliverable address)/;
const COLD_RECALL_WHY = 'a first lesson cannot carry an improvement that asks for recall of earlier lessons';
const COLD_RECALL_FIX =
  "To clear it, open the report's review (the leader, then this session), replace the held items under Improvements, and release it again from this list. If it is not a first lesson, clear the first-lesson flag there instead and release it again.";

function ColdRecallHeld({ items }: { items: string[] }) {
  return (
    <>
      <ul className={REPLAY_BLOCK_CLASS} style={{ margin: '4px 0', paddingLeft: 18 }}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div>{COLD_RECALL_FIX}</div>
    </>
  );
}

function releaseText(outcome: ReleaseOutcome): Outcome {
  if (outcome.delivered) {
    const skipped = outcome.skipped?.length ?? 0;
    return {
      tone: 'ok',
      text: skipped
        ? `Released and delivered. ${skipped} placeholder address${skipped === 1 ? ' was' : 'es were'} skipped.`
        : 'Released and delivered to the leader.',
    };
  }
  if (outcome.refusal === 'cold-recall-improvement') {
    return { tone: 'refused', text: `Not delivered: ${COLD_RECALL_WHY}.`, held: outcome.coldRecall ?? [] };
  }
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
  const [offset, setOffset] = useState(0);
  const failures = usePipelineFailures(offset);
  const shown = failures.data;
  useEffect(() => {
    if (shown && shown.offset === offset && offset > 0 && offset >= shown.total) {
      setOffset(Math.max(0, Math.ceil(shown.total / PIPELINE_PAGE_SIZE) - 1) * PIPELINE_PAGE_SIZE);
    }
  }, [shown, offset]);
  const coverage = useCoverage();
  const requeue = useRequeuePipelineFailure();
  const release = useReleaseHeldReport();
  const attribute = useAttributeSession();
  const roster = useAdminCoaches();
  const leaders = [...(roster.data ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  const nameOf = (coachId: string) => leaders.find((l) => l.id === coachId)?.name ?? coachId;
  const emailOf = (coachId: string) => coverage.data?.leaders.find((l) => l.coachId === coachId)?.email ?? '';
  const [assignTo, setAssignTo] = useState<Record<string, string>>({});
  const [outcomes, setOutcomes] = useState<Record<string, Outcome>>({});
  const [busy, setBusy] = useState<ReadonlySet<string>>(() => new Set());

  const record = (s: PipelineFailure, outcome: Outcome) => {
    setOutcomes((o) => ({ ...o, [s.sourceSessionId]: outcome }));
    if (outcome.tone === 'ok') toast.success(outcome.text);
  };

  const run = async (s: PipelineFailure, act: () => Promise<Outcome>) => {
    const id = s.sourceSessionId;
    setBusy((b) => new Set(b).add(id));
    try {
      record(s, await act());
    } catch (err) {
      record(s, { tone: 'refused', text: refusalText(err) });
    } finally {
      setBusy((b) => {
        const next = new Set(b);
        next.delete(id);
        return next;
      });
    }
  };

  const doRequeue = (s: PipelineFailure) =>
    run(s, async () => {
      await requeue.mutateAsync(s.sourceSessionId);
      return { tone: 'ok', text: 'Back in the queue.' };
    });

  const doRelease = (s: PipelineFailure, reportId: string) =>
    run(s, async () => releaseText(await release.mutateAsync(reportId)));

  const doAttribute = (s: PipelineFailure, coachId: string) =>
    run(s, async () => {
      const { state } = await attribute.mutateAsync({ sourceSessionId: s.sourceSessionId, coachId, expectedCoachId: s.coachId });
      return {
        tone: 'ok',
        text: `Assigned to ${nameOf(coachId)}. It is ${state} now: a later pipeline run scores it for them, and it is then held until an admin releases it from this list.`,
      };
    });

  return (
    <div style={{ paddingTop: 22 }} data-testid="coach-pipeline">
      <h2 style={h2}>Pipeline</h2>
      <p style={{ fontSize: 15, color: dt.textMuted, margin: '0 0 20px' }}>
        Sessions the pipeline could not finish, and whether the recording bot covers every leader.
      </p>

      <h3 style={h3}>Stuck sessions</h3>
      <QueryState query={failures} name="pipeline" label="stuck sessions">
        {({ sessions, total }) =>
          total === 0 ? (
            <div data-testid="coach-pipeline-empty" style={note}>
              Nothing is stuck. Every session reached its leader or is still in progress.
            </div>
          ) : (
            <>
            {total > PIPELINE_PAGE_SIZE && (
              <div data-testid="coach-pipeline-paging" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10, fontSize: 13, color: dt.textLight }}>
                <button
                  type="button"
                  onClick={() => setOffset(Math.max(0, offset - PIPELINE_PAGE_SIZE))}
                  disabled={offset === 0}
                  data-testid="coach-pipeline-newer"
                  style={btn}
                >
                  Newer
                </button>
                <span>
                  {Math.min(offset + 1, total)} to {Math.min(offset + PIPELINE_PAGE_SIZE, total)} of {total}
                </span>
                <button
                  type="button"
                  onClick={() => setOffset(offset + PIPELINE_PAGE_SIZE)}
                  disabled={offset + PIPELINE_PAGE_SIZE >= total}
                  data-testid="coach-pipeline-older"
                  style={btn}
                >
                  Older
                </button>
              </div>
            )}
            <div style={table}>
              {sessions.map((s) => {
                const outcome = outcomes[s.sourceSessionId];
                const reportId = s.reportId;
                const busyRow = busy.has(s.sourceSessionId);
                const picked = assignTo[s.sourceSessionId] ?? '';
                return (
                  <div key={s.sourceSessionId} data-testid={`coach-pipeline-${s.sourceSessionId}`} style={row}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{s.title || 'Untitled session'}</div>
                      <div style={{ fontSize: 12.5, color: dt.textLight }}>
                        {s.coachId ? nameOf(s.coachId) : 'unattributed'} · {s.sessionDate} · {s.state} · {s.attempts} attempts
                      </div>
                      <div className={REPLAY_BLOCK_CLASS} style={{ fontSize: 13, color: dt.body, marginTop: 4 }}>
                        {s.reason?.startsWith(COLD_RECALL_HOLD) ? (
                          <>
                            Why: held, because {COLD_RECALL_WHY}.
                            <ColdRecallHeld items={s.reason.slice(COLD_RECALL_HOLD.length).split('; ')} />
                          </>
                        ) : s.reason ? (
                          `Why: ${s.reason}`
                        ) : (
                          'No reason recorded'
                        )}
                      </div>
                      {s.coachId && (s.state === 'delivered' || FAILED_SEND.test(s.reason ?? '')) && (
                        <LeaderAddress coachId={s.coachId} email={emailOf(s.coachId)} />
                      )}
                      {outcome && (
                        <div
                          data-testid={`coach-pipeline-outcome-${s.sourceSessionId}`}
                          style={{ fontSize: 13, marginTop: 4, color: outcome.tone === 'ok' ? dt.green : dt.rust }}
                        >
                          {outcome.text}
                          {outcome.held && <ColdRecallHeld items={outcome.held} />}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                      {s.action === 'attribute' && (
                        <>
                          <select
                            value={picked}
                            onChange={(e) => setAssignTo((a) => ({ ...a, [s.sourceSessionId]: e.target.value }))}
                            disabled={busyRow}
                            aria-label="Leader to assign this session to"
                            data-testid={`coach-pipeline-assign-to-${s.sourceSessionId}`}
                            style={input}
                          >
                            <option value="">Pick a leader…</option>
                            {leaders.filter((l) => l.id !== s.coachId).map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => doAttribute(s, picked)}
                            disabled={busyRow || !picked}
                            data-testid={`coach-pipeline-assign-${s.sourceSessionId}`}
                            style={btn}
                          >
                            Assign
                          </button>
                        </>
                      )}
                      {s.action === 'release' && reportId && (
                        <button
                          type="button"
                          onClick={() => doRelease(s, reportId)}
                          disabled={busyRow}
                          data-testid={`coach-pipeline-release-${s.sourceSessionId}`}
                          style={btn}
                        >
                          Release report
                        </button>
                      )}
                      {s.action === 'requeue' && (
                        <button
                          type="button"
                          onClick={() => doRequeue(s)}
                          disabled={busyRow}
                          data-testid={`coach-pipeline-requeue-${s.sourceSessionId}`}
                          style={btn}
                        >
                          Put back in the queue
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            </>
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
                      <LeaderAddress coachId={l.coachId} email={l.email} />
                      <LeaderAttribution coachId={l.coachId} />
                      <div style={{ fontSize: 12.5, color: dt.textLight }}>
                        {ACCOUNT_TEXT[l.accountStatus] ?? `account ${l.accountStatus}`} · {l.observedSessions} observed sessions ·{' '}
                        {l.linkedClassName ?? 'no linked class'}
                        {l.classAlert ? ' · registered class disagrees with what was observed' : ''}
                      </div>
                      {l.attestedAt && (
                        <div data-testid={`coach-coverage-attested-${l.coachId}`} style={{ fontSize: 12.5, color: dt.textLight }}>
                          Marked not teaching by{' '}
                          <span className={REPLAY_BLOCK_CLASS}>{l.attestedBy ?? 'an admin'}</span> on{' '}
                          {new Date(l.attestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                    <NotTeaching leader={l} />
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

const ACCOUNT_TEXT: Record<string, string> = {
  'has-account': 'has a VerseMate account',
  'no-account': 'no VerseMate account',
};

function coverageBadge(l: CoverageLeader): { text: string; ok: boolean } {
  if (l.basis === 'attested-not-teaching') return { text: 'Not teaching (attested)', ok: true };
  if (l.covered) return { text: `Covered · ${l.observedSessions} observed`, ok: true };
  return { text: 'Not covered · Not observed', ok: false };
}

function NotTeaching({ leader }: { leader: CoverageLeader }) {
  const set = useSetNotTeaching();
  const [error, setError] = useState<string | null>(null);
  const attested = Boolean(leader.attestedAt);
  const badge = coverageBadge(leader);

  const toggle = () => {
    setError(null);
    set.mutate(
      { coachId: leader.coachId, attested: !attested },
      { onError: (err) => setError(refusalText(err)) },
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
      <div
        data-testid={`coach-coverage-basis-${leader.coachId}`}
        style={{
          fontSize: 12,
          fontWeight: 700,
          padding: '4px 8px',
          borderRadius: 6,
          color: badge.ok ? dt.green : dt.rust,
          background: badge.ok ? dt.greenBg : dt.rustBg,
        }}
      >
        {badge.text}
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={set.isPending}
        data-testid={`coach-coverage-not-teaching-${leader.coachId}`}
        style={btn}
      >
        {set.isPending ? 'Saving…' : attested ? 'Clear not teaching' : 'Mark not teaching'}
      </button>
      {error && (
        <div role="alert" data-testid={`coach-coverage-error-${leader.coachId}`} style={{ fontSize: 12.5, color: dt.rust }}>
          {error}
        </div>
      )}
    </div>
  );
}

function LeaderAddress({ coachId, email }: { coachId: string; email: string }) {
  const update = useUpdateLeaderEmail();
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const placeholder = !email || isPlaceholderAddress(email);
  const badDraft = draft === null ? null : badAddressText(draft);
  const shownError = error ?? badDraft;

  const save = (confirm: boolean) => {
    if (draft === null || badDraft) return;
    setError(null);
    setConfirming(false);
    update.mutate(
      { coachId, email: draft.trim(), confirm },
      {
        onSuccess: (saved) => {
          setDraft(null);
          toast.success(
            saved.noticeSent
              ? 'Address saved. The next report goes to it, and a notice went to the old address.'
              : 'Address saved. The next report goes to it.',
          );
        },
        onError: (err) => (needsBenchmarkConfirm(err) ? setConfirming(true) : setError(refusalText(err))),
      },
    );
  };

  return (
    <div style={{ fontSize: 12.5, color: dt.textLight, margin: '2px 0' }}>
      {placeholder ? (
        <span data-testid={`coach-address-${coachId}`} style={{ color: dt.rust, fontWeight: 600 }}>
          No real address yet
        </span>
      ) : (
        <span data-testid={`coach-address-${coachId}`} className={REPLAY_BLOCK_CLASS}>
          {email}
        </span>
      )}{' '}
      {draft === null ? (
        <button
          type="button"
          onClick={() => setDraft(placeholder ? '' : email)}
          data-testid={`coach-address-edit-${coachId}`}
          style={linkBtn}
        >
          {placeholder ? 'Set address' : 'Change address'}
        </button>
      ) : (
        <span className={REPLAY_BLOCK_CLASS} style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="email"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setConfirming(false);
              setError(null);
            }}
            placeholder="name@church.org"
            aria-label="New email address"
            data-testid={`coach-address-input-${coachId}`}
            style={input}
          />
          <button
            type="button"
            onClick={() => save(false)}
            disabled={update.isPending || !draft.trim() || badDraft !== null}
            data-testid={`coach-address-save-${coachId}`}
            style={btn}
          >
            {update.isPending ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={() => { setDraft(null); setError(null); setConfirming(false); }} disabled={update.isPending} style={linkBtn}>
            Cancel
          </button>
        </span>
      )}
      {confirming && draft !== null && (
        <div role="alert" data-testid={`coach-address-confirm-${coachId}`} className={REPLAY_BLOCK_CLASS} style={{ color: dt.rust, marginTop: 4 }}>
          This is the benchmark leader, whose address receives every leader's reports. Change it to {draft.trim()}?{' '}
          <button
            type="button"
            onClick={() => save(true)}
            disabled={update.isPending}
            data-testid={`coach-address-confirm-save-${coachId}`}
            style={btn}
          >
            Yes, change it
          </button>
        </div>
      )}
      {shownError && (
        <div role="alert" data-testid={`coach-address-error-${coachId}`} style={{ color: dt.rust, marginTop: 4 }}>
          {shownError}
        </div>
      )}
    </div>
  );
}

function listLines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function LeaderAttribution({ coachId }: { coachId: string }) {
  const [open, setOpen] = useState(false);
  const current = useLeaderAttribution(coachId, open);
  const save = useSaveLeaderAttribution(coachId);
  const [draft, setDraft] = useState<{ keywords: string; emails: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const shown = draft ?? {
    keywords: (current.data?.titleMatch ?? []).join('\n'),
    emails: (current.data?.altEmails ?? []).join('\n'),
  };
  const short = listLines(shown.keywords).filter((k) => k.length < 3);
  const badAlt = listLines(shown.emails).find((e) => badAddressText(e));
  const invalid =
    (short.length ? `Each title keyword needs at least three characters: ${short.join(', ')}` : null) ??
    (badAlt !== undefined ? `Alternate address "${badAlt}": ${EMAIL_RULE}` : null);
  const shownError = error ?? invalid;

  const submit = () => {
    setError(null);
    setSaved(null);
    save.mutate(
      { titleMatch: listLines(shown.keywords), altEmails: listLines(shown.emails) },
      {
        onSuccess: (r) => {
          setDraft(null);
          setSaved(`Saved. ${r.resolved} unattributed session${r.resolved === 1 ? '' : 's'} now match${r.resolved === 1 ? 'es' : ''} a leader.`);
        },
        onError: (err) => setError(refusalText(err)),
      },
    );
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} data-testid={`coach-attribution-edit-${coachId}`} style={{ ...linkBtn, fontSize: 12.5 }}>
        Title keywords and other addresses
      </button>
    );
  }

  return (
    <div className={REPLAY_BLOCK_CLASS} style={{ fontSize: 12.5, color: dt.textLight, margin: '6px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {current.isLoading ? (
        <span>Loading keywords and addresses…</span>
      ) : current.error ? (
        <div role="alert" data-testid={`coach-attribution-error-${coachId}`} style={{ color: dt.rust }}>
          Could not load the keywords and addresses. {refusalText(current.error)}
        </div>
      ) : (
        <>
          <label htmlFor={`attribution-keywords-${coachId}`}>Session title keywords, one per line (at least three characters)</label>
          <textarea
            id={`attribution-keywords-${coachId}`}
            value={shown.keywords}
            onChange={(e) => {
              setDraft({ ...shown, keywords: e.target.value });
              setError(null);
            }}
            rows={3}
            data-testid={`coach-attribution-keywords-${coachId}`}
            style={input}
          />
          <label htmlFor={`attribution-emails-${coachId}`}>Other addresses the leader records from, one per line</label>
          <textarea
            id={`attribution-emails-${coachId}`}
            value={shown.emails}
            onChange={(e) => {
              setDraft({ ...shown, emails: e.target.value });
              setError(null);
            }}
            rows={2}
            data-testid={`coach-attribution-emails-${coachId}`}
            style={input}
          />
          <span style={{ display: 'inline-flex', gap: 10, alignItems: 'center' }}>
            <button
              type="button"
              onClick={submit}
              disabled={save.isPending || invalid !== null}
              data-testid={`coach-attribution-save-${coachId}`}
              style={btn}
            >
              {save.isPending ? 'Saving…' : 'Save keywords and addresses'}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setDraft(null);
                setError(null);
              }}
              disabled={save.isPending}
              style={linkBtn}
            >
              Close
            </button>
          </span>
          {shownError && (
            <div role="alert" data-testid={`coach-attribution-error-${coachId}`} style={{ color: dt.rust }}>
              {shownError}
            </div>
          )}
          {saved && (
            <div data-testid={`coach-attribution-saved-${coachId}`} style={{ color: dt.green }}>
              {saved}
            </div>
          )}
        </>
      )}
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
const input: React.CSSProperties = {
  fontSize: 13,
  padding: '6px 9px',
  border: `1px solid ${dt.inputBorder}`,
  borderRadius: 8,
  background: dt.cardBg,
  color: dt.textPrimary,
  minWidth: 220,
};
