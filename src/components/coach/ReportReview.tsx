import { Fragment, useRef, useState } from 'react';

import { useAmendReport, useReportReview, useReportRevisions, useSendRevision, useSetFirstLesson } from '@/hooks/useCoach';
import { useRubric } from '@/hooks/useRubric';
import { REPLAY_BLOCK_CLASS } from '@/lib/analyticsPrivacy';
import {
  AMENDABLE_BODY_FIELDS,
  type AmendableBodyField,
  type CoachReport,
  refusalText,
  type ReportAmendment,
  type ReportReviewState,
  type ReportRevision,
  type RevisionResult,
  type RevisionSendResult,
  type RevisionSends,
} from '@/services/coachService';
import { dt } from './dashboardTheme';

type Outcome = { tone: 'ok' | 'pending' | 'refused'; text: string };
type Change = { label: string; from: string; to: string };
type Draft = {
  dims: Record<number, { score: number | null; rationale: string }>;
  firstLesson: boolean;
  body: Record<AmendableBodyField, string>;
};

const MEMORY_REINFORCEMENT = 9;

const LEGACY_TEXT =
  'This is a legacy report, which is read-only. Change it at its source and it arrives through the backfill.';

const BODY_LABELS: Record<AmendableBodyField, string> = {
  headline: 'Headline',
  overview: 'Overview',
  strengths: 'Strengths',
  improvements: 'Improvements',
  recommendations: 'Recommendations',
};

const PENDING_TEXT: Record<string, string> = {
  'parallel-run':
    'is stored but not sent: the pipeline is in its parallel run, so nothing goes out until cutover. Send it from the kept versions once the pipeline is live.',
  'no-mailer': 'is stored but not sent: no mailer is configured. Send it from the kept versions once one is.',
  'send-failed': 'is stored, but the send failed. Send it again from the kept versions.',
  'in-flight': 'is stored, and another request is sending it right now.',
};

function lines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function textOf(value: unknown): string {
  if (Array.isArray(value)) return value.join('\n');
  return value == null ? '' : String(value);
}

function scored(d: { score: number | null; rationale: string }): string {
  return `${d.score ?? 'N/A'} · ${d.rationale}`;
}

function initialDraft(review: ReportReviewState, report: CoachReport): Draft {
  const feedback = (report.feedback ?? {}) as unknown as Record<string, unknown>;
  return {
    dims: Object.fromEntries(review.dimensions.map((d) => [d.n, { score: d.score, rationale: d.rationale }])),
    firstLesson: review.firstLesson,
    body: Object.fromEntries(AMENDABLE_BODY_FIELDS.map((f) => [f, textOf(feedback[f])])) as Record<AmendableBodyField, string>,
  };
}

function amendmentOf(initial: Draft, draft: Draft): ReportAmendment {
  const amendment: ReportAmendment = {};
  const dimensions = Object.keys(draft.dims)
    .map(Number)
    .filter((n) => {
      const a = initial.dims[n];
      const b = draft.dims[n];
      return a.score !== b.score || a.rationale.trim() !== b.rationale.trim();
    })
    .map((n) => ({ n, score: draft.dims[n].score, rationale: draft.dims[n].rationale.trim() }));
  if (dimensions.length) amendment.dimensions = dimensions;
  if (draft.firstLesson !== initial.firstLesson) amendment.firstLesson = draft.firstLesson;
  const body: ReportAmendment['body'] = {};
  for (const field of AMENDABLE_BODY_FIELDS) {
    if (field === 'headline') {
      if (draft.body.headline.trim() !== initial.body.headline.trim()) body.headline = draft.body.headline.trim();
    } else if (JSON.stringify(lines(draft.body[field])) !== JSON.stringify(lines(initial.body[field]))) {
      body[field] = lines(draft.body[field]);
    }
  }
  if (Object.keys(body).length) amendment.body = body;
  return amendment;
}

function changesOf(revision: ReportRevision['changes'], dimName: (n: number) => string): Change[] {
  const out: Change[] = (revision.dimensions ?? []).map((d) => ({
    label: dimName(d.n),
    from: scored(d.from),
    to: scored(d.to),
  }));
  if (revision.firstLesson) {
    out.push({
      label: 'First lesson',
      from: revision.firstLesson.from ? 'Yes' : 'No',
      to: revision.firstLesson.to ? 'Yes' : 'No',
    });
  }
  for (const field of AMENDABLE_BODY_FIELDS) {
    const change = revision.body?.[field];
    if (change) out.push({ label: BODY_LABELS[field], from: textOf(change.from), to: textOf(change.to) });
  }
  return out;
}

function draftChanges(amendment: ReportAmendment, initial: Draft): ReportRevision['changes'] {
  return {
    dimensions: (amendment.dimensions ?? []).map((d) => ({ n: d.n, from: initial.dims[d.n], to: d })),
    ...(amendment.firstLesson !== undefined ? { firstLesson: { from: initial.firstLesson, to: amendment.firstLesson } } : {}),
    body: Object.fromEntries(
      Object.entries(amendment.body ?? {}).map(([field, to]) => [field, { from: initial.body[field as AmendableBodyField], to }]),
    ),
  };
}

function skippedText(r: RevisionSends): string {
  const skipped = r.skipped ?? [];
  if (!skipped.length) return '';
  return ` ${skipped.length} placeholder address${skipped.length === 1 ? ' was' : 'es were'} skipped (${skipped.join(', ')}).`;
}

function failedText(r: RevisionSends): string {
  const failed = (r.sends ?? []).filter((s) => !s.delivered);
  return failed.length ? ` Failed: ${failed.map((s) => `${s.email}${s.error ? ` (${s.error})` : ''}`).join(', ')}.` : '';
}

function amendOutcome(r: RevisionResult): Outcome {
  if (!r.applied) {
    if (r.refusal === 'governance-blocked') {
      return {
        tone: 'refused',
        text: 'Not saved and not sent: the amendment breaks a governance rule. The delivered version stays live.',
      };
    }
    if (r.refusal === 'cold-recall-improvement') {
      return {
        tone: 'refused',
        text: 'Not saved and not sent: a first lesson cannot carry an improvement that asks for recall of earlier lessons. Replace the held items under Improvements and submit again.',
      };
    }
    return { tone: 'refused', text: `Not saved: ${r.refusal ?? 'refused'}.` };
  }
  const saved = `Revision ${r.revision}`;
  const score = r.score !== undefined ? ` Score ${r.score} (${r.status}).` : '';
  if (r.sent) {
    return { tone: 'ok', text: `${saved} saved and re-sent, marked revised.${score}${skippedText(r)}${failedText(r)}` };
  }
  const why = PENDING_TEXT[r.pending ?? ''] ?? `is stored but not sent (${r.pending ?? 'no reason given'}).`;
  return { tone: 'pending', text: `${saved} ${why}${score}${skippedText(r)}${failedText(r)}` };
}

function sendOutcome(r: RevisionSendResult): Outcome {
  if (!r.sent) return { tone: 'refused', text: `Not sent: ${r.refusal ?? 'refused'}.${failedText(r)}` };
  const delivered = (r.sends ?? []).filter((s) => s.delivered).length;
  return {
    tone: 'ok',
    text: `Revision ${r.revision} sent to ${delivered} recipient${delivered === 1 ? '' : 's'}.${skippedText(r)}${failedText(r)}`,
  };
}

function newestFirst(rows: ReportRevision[] | undefined): ReportRevision[] {
  return [...(rows ?? [])].sort((a, b) => b.revision - a.revision);
}

function when(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ReportReview({ report, coachId }: { report: CoachReport; coachId: string }) {
  const review = useReportReview(report.id);
  if (review.isLoading) return <div style={note}>Loading the review…</div>;
  if (review.error) {
    return (
      <div data-testid="coach-review-failed" style={{ ...note, color: dt.rust }}>
        Could not load the review. {refusalText(review.error)}{' '}
        <button type="button" onClick={() => review.refetch()} style={linkBtn}>
          Try again
        </button>
      </div>
    );
  }
  if (!review.data) {
    return (
      <div data-testid="coach-review-readonly" style={note}>
        {LEGACY_TEXT}
      </div>
    );
  }
  if (!review.data.delivered) return <FirstLessonPanel review={review.data} reportId={report.id} coachId={coachId} />;
  return <AmendPanel review={review.data} report={report} coachId={coachId} />;
}

function FirstLessonState({ review }: { review: ReportReviewState }) {
  const source =
    review.firstLessonSource === 'admin' ? ', set by hand' : review.firstLessonSource === 'detected' ? ', detected by the pipeline' : '';
  const book = review.passageBook ? `Passage book: ${review.passageBook}.` : 'Passage book not known.';
  return (
    <p data-testid="coach-first-lesson-state" style={muted}>
      First lesson: {review.firstLesson ? `yes${source}` : 'no'}. {book}
    </p>
  );
}

function firstLessonOutcome(r: RevisionResult, mr: string, clearedScore?: number): Outcome {
  if (!r.applied) return amendOutcome(r);
  const score = r.score !== undefined ? ` Score ${r.score} (${r.status}).` : '';
  return r.firstLesson
    ? { tone: 'ok', text: `Marked a first lesson. ${mr} is not applicable.${score}` }
    : { tone: 'ok', text: `First-lesson flag cleared. ${mr} is scored ${clearedScore}, recorded as corrected by hand.${score}` };
}

function FirstLessonPanel({ review, reportId, coachId }: { review: ReportReviewState; reportId: string; coachId: string }) {
  const { rubric } = useRubric();
  const mr = rubric?.dimensions.find((d) => d.n === MEMORY_REINFORCEMENT)?.name ?? `Dimension ${MEMORY_REINFORCEMENT}`;
  const set = useSetFirstLesson(coachId, reportId);
  const [clearing, setClearing] = useState<{ score: number | null; rationale: string } | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const flying = useRef(false);

  const submit = (input: { firstLesson: boolean; score?: number; rationale?: string }) => {
    if (flying.current) return;
    flying.current = true;
    setOutcome(null);
    set.mutate(input, {
      onSuccess: (r) => {
        setOutcome(firstLessonOutcome(r, mr, input.score));
        if (r.applied) setClearing(null);
      },
      onError: (err) => setOutcome({ tone: 'refused', text: refusalText(err) }),
      onSettled: () => {
        flying.current = false;
      },
    });
  };

  return (
    <div data-testid={`coach-review-${reportId}`} className={REPLAY_BLOCK_CLASS} style={panel}>
      <h3 style={h3}>First lesson</h3>
      <FirstLessonState review={review} />
      {outcome && (
        <div data-testid="coach-first-lesson-outcome" role="status" style={{ ...outcomeStyle, color: toneColor(outcome.tone) }}>
          {outcome.text}
        </div>
      )}
      {!review.firstLesson && (
        <button
          type="button"
          onClick={() => submit({ firstLesson: true })}
          disabled={set.isPending}
          data-testid="coach-first-lesson-set"
          style={btn}
        >
          Mark as first lesson
        </button>
      )}
      {review.firstLesson && !clearing && (
        <button
          type="button"
          onClick={() => setClearing({ score: null, rationale: '' })}
          data-testid="coach-first-lesson-clear"
          style={btn}
        >
          Clear first lesson
        </button>
      )}
      {review.firstLesson && clearing && (
        <div>
          <p style={muted}>Clearing the flag scores {mr} again. Give its score and rationale.</p>
          <select
            value={clearing.score ?? ''}
            onChange={(e) => {
              const score = e.target.value === '' ? null : Number(e.target.value);
              setClearing((c) => (c ? { ...c, score } : c));
            }}
            aria-label={`${mr} score`}
            data-testid="coach-first-lesson-score"
            style={input}
          >
            <option value="">Score…</option>
            {[1, 2, 3, 4, 5].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <textarea
            value={clearing.rationale}
            onChange={(e) => {
              const rationale = e.target.value;
              setClearing((c) => (c ? { ...c, rationale } : c));
            }}
            rows={3}
            aria-label={`${mr} rationale`}
            data-testid="coach-first-lesson-rationale"
            style={{ ...textarea, marginTop: 8 }}
          />
          <div style={actions}>
            <button
              type="button"
              onClick={() =>
                clearing.score !== null && submit({ firstLesson: false, score: clearing.score, rationale: clearing.rationale.trim() })
              }
              disabled={set.isPending || clearing.score === null || !clearing.rationale.trim()}
              data-testid="coach-first-lesson-save"
              style={primaryBtn}
            >
              {set.isPending ? 'Saving…' : 'Clear the flag'}
            </button>
            <button type="button" onClick={() => setClearing(null)} disabled={set.isPending} style={linkBtn}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AmendPanel({ review, report, coachId }: { review: ReportReviewState; report: CoachReport; coachId: string }) {
  const { rubric } = useRubric();
  const dimName = (n: number) => rubric?.dimensions.find((d) => d.n === n)?.name ?? `Dimension ${n}`;
  const amend = useAmendReport(coachId, report.id);
  const [latest] = newestFirst(useReportRevisions(report.id, true).data);
  const latestUnsent = latest !== undefined && !latest.sentAt;
  const flying = useRef(false);
  const [edit, setEdit] = useState<{ initial: Draft; draft: Draft; confirming: boolean } | null>(null);
  const [last, setLast] = useState<{ outcome: Outcome; held?: string[]; violations?: string[] } | null>(null);

  const open = () => {
    const initial = initialDraft(review, report);
    setEdit({ initial, draft: initial, confirming: false });
    setLast(null);
  };
  const update = (next: (d: Draft) => Draft) => setEdit((e) => (e ? { ...e, draft: next(e.draft) } : e));
  const amendment = edit ? amendmentOf(edit.initial, edit.draft) : {};
  const changed = Object.keys(amendment).length > 0;

  const confirm = () => {
    if (flying.current) return;
    flying.current = true;
    amend.mutate(amendment, {
      onSuccess: (result) => {
        setLast({ outcome: amendOutcome(result), held: result.coldRecall, violations: result.violations });
        setEdit((e) => (result.applied || !e ? null : { ...e, confirming: false }));
      },
      onError: (err) => {
        setLast({ outcome: { tone: 'refused', text: refusalText(err) } });
        setEdit((e) => (e ? { ...e, confirming: false } : e));
      },
      onSettled: () => {
        flying.current = false;
      },
    });
  };

  return (
    <div data-testid={`coach-review-${report.id}`} className={REPLAY_BLOCK_CLASS} style={panel}>
      <h3 style={h3}>Amend the delivered report</h3>
      <p style={muted}>
        An amendment is kept as a new version and re-sent to the same recipients under the same link, marked revised.
        Leaders see only the latest version.
      </p>
      <FirstLessonState review={review} />

      {last && (
        <div data-testid="coach-amend-outcome" role="status" style={{ ...outcomeStyle, color: toneColor(last.outcome.tone) }}>
          {last.outcome.text}
          {last.violations?.length ? (
            <ul data-testid="coach-amend-violations" style={list}>
              {last.violations.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          ) : null}
        </div>
      )}

      {!edit && (
        <button type="button" onClick={open} data-testid="coach-amend-open" style={btn}>
          Amend this report
        </button>
      )}

      {edit && edit.confirming && (
        <div>
          <p style={muted}>
            {latestUnsent
              ? 'Check the latest version, which was not sent, against the amended one.'
              : 'Check the delivered version against the amended one.'}{' '}
            Confirming saves the revision and re-sends the report.
          </p>
          <ChangeTable
            testId="coach-amend-diff"
            columns={[latestUnsent ? 'Latest, not sent' : 'Delivered', 'Amended']}
            changes={changesOf(draftChanges(amendment, edit.initial), dimName)}
          />
          <div style={actions}>
            <button type="button" onClick={confirm} disabled={amend.isPending} data-testid="coach-amend-confirm" style={primaryBtn}>
              {amend.isPending ? 'Saving…' : 'Confirm and re-send'}
            </button>
            <button
              type="button"
              onClick={() => setEdit((e) => (e ? { ...e, confirming: false } : e))}
              disabled={amend.isPending}
              data-testid="coach-amend-back"
              style={linkBtn}
            >
              Back to editing
            </button>
          </div>
        </div>
      )}

      {edit && !edit.confirming && (
        <div data-testid="coach-amend-editor">
          <label style={{ ...fieldLabel, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={edit.draft.firstLesson}
              onChange={(e) => {
                const firstLesson = e.target.checked;
                update((d) => ({ ...d, firstLesson }));
              }}
              data-testid="coach-amend-first-lesson"
            />
            First lesson of a new book ({dimName(MEMORY_REINFORCEMENT)} is not applicable)
          </label>
          {edit.initial.firstLesson && !edit.draft.firstLesson && (
            <p style={muted}>Clearing the flag needs a {dimName(MEMORY_REINFORCEMENT)} score and rationale below.</p>
          )}

          <h4 style={h4}>Dimensions</h4>
          {review.dimensions.map((d) => {
            const value = edit.draft.dims[d.n];
            return (
              <div key={d.n} style={dimRow}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>{dimName(d.n)}</span>
                  <select
                    value={value.score ?? ''}
                    onChange={(e) => {
                      const score = e.target.value === '' ? null : Number(e.target.value);
                      update((dr) => ({ ...dr, dims: { ...dr.dims, [d.n]: { ...dr.dims[d.n], score } } }));
                    }}
                    aria-label={`${dimName(d.n)} score`}
                    data-testid={`coach-amend-dim-score-${d.n}`}
                    style={input}
                  >
                    <option value="">N/A</option>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={value.rationale}
                  onChange={(e) => {
                    const rationale = e.target.value;
                    update((dr) => ({ ...dr, dims: { ...dr.dims, [d.n]: { ...dr.dims[d.n], rationale } } }));
                  }}
                  rows={2}
                  aria-label={`${dimName(d.n)} rationale`}
                  data-testid={`coach-amend-dim-rationale-${d.n}`}
                  style={textarea}
                />
              </div>
            );
          })}

          <h4 style={h4}>Report text</h4>
          {AMENDABLE_BODY_FIELDS.map((field) => (
            <div key={field} style={{ marginBottom: 12 }}>
              <label style={fieldLabel} htmlFor={`amend-${report.id}-${field}`}>
                {BODY_LABELS[field]}
                {field === 'headline' ? '' : ', one item per line'}
              </label>
              {field === 'improvements' && last?.held?.length ? (
                <div data-testid="coach-amend-held" style={{ ...outcomeStyle, color: dt.rust }}>
                  Held for a first lesson, replace these:
                  <ul style={list}>
                    {last.held.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {field === 'headline' ? (
                <input
                  id={`amend-${report.id}-${field}`}
                  value={edit.draft.body.headline}
                  onChange={(e) => {
                    const headline = e.target.value;
                    update((d) => ({ ...d, body: { ...d.body, headline } }));
                  }}
                  data-testid="coach-amend-headline"
                  style={{ ...input, width: '100%' }}
                />
              ) : (
                <textarea
                  id={`amend-${report.id}-${field}`}
                  value={edit.draft.body[field]}
                  onChange={(e) => {
                    const text = e.target.value;
                    update((d) => ({ ...d, body: { ...d.body, [field]: text } }));
                  }}
                  rows={4}
                  data-testid={`coach-amend-${field}`}
                  style={textarea}
                />
              )}
            </div>
          ))}

          <div style={actions}>
            <button
              type="button"
              onClick={() => setEdit((e) => (e ? { ...e, confirming: true } : e))}
              disabled={!changed}
              data-testid="coach-amend-review"
              style={primaryBtn}
            >
              Review changes
            </button>
            <button type="button" onClick={() => setEdit(null)} data-testid="coach-amend-cancel" style={linkBtn}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <KeptVersions reportId={report.id} coachId={coachId} dimName={dimName} />
    </div>
  );
}

function KeptVersions({ reportId, coachId, dimName }: { reportId: string; coachId: string; dimName: (n: number) => string }) {
  const revisions = useReportRevisions(reportId, true);
  const send = useSendRevision(coachId, reportId);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const flying = useRef(false);
  const rows = newestFirst(revisions.data);
  if (revisions.error) {
    return (
      <div style={{ ...note, color: dt.rust, marginTop: 16 }}>
        Could not load the kept versions. {refusalText(revisions.error)}
      </div>
    );
  }
  if (!rows.length) return null;

  const doSend = () => {
    if (flying.current) return;
    flying.current = true;
    setOutcome(null);
    send.mutate(undefined, {
      onSuccess: (r) => setOutcome(sendOutcome(r)),
      onError: (err) => setOutcome({ tone: 'refused', text: refusalText(err) }),
      onSettled: () => {
        flying.current = false;
      },
    });
  };

  return (
    <div data-testid="coach-revisions" style={{ marginTop: 20 }}>
      <h4 style={h4}>Kept versions</h4>
      {outcome && (
        <div data-testid="coach-revision-outcome" role="status" style={{ ...outcomeStyle, color: toneColor(outcome.tone) }}>
          {outcome.text}
        </div>
      )}
      {rows.map((r, i) => (
        <div key={r.revision} data-testid={`coach-revision-${r.revision}`} style={revisionRow}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ fontSize: 13.5 }}>
              <strong>Revision {r.revision}</strong> · {when(r.amendedAt)} · by {r.amendedBy ?? 'an admin'}
            </div>
            {i === 0 && !r.sentAt && (
              <button type="button" onClick={doSend} disabled={send.isPending} data-testid={`coach-revision-send-${r.revision}`} style={btn}>
                {send.isPending ? 'Sending…' : 'Send this revision'}
              </button>
            )}
          </div>
          <div style={{ fontSize: 12.5, color: r.sentAt ? dt.green : dt.rust, margin: '4px 0 8px' }}>
            {r.sentAt ? `Sent ${when(r.sentAt)} to ${r.sentTo.join(', ') || 'no one'}` : 'Not sent'}
            {r.skipped.length ? ` · Skipped placeholder: ${r.skipped.join(', ')}` : ''}
          </div>
          <ChangeTable columns={['Before', 'This version']} changes={changesOf(r.changes, dimName)} />
        </div>
      ))}
    </div>
  );
}

function ChangeTable({ changes, columns, testId }: { changes: Change[]; columns: [string, string]; testId?: string }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <div data-testid={testId} style={changeGrid}>
        <span />
        <span style={colHead}>{columns[0]}</span>
        <span style={colHead}>{columns[1]}</span>
        {changes.map((c) => (
          <Fragment key={c.label}>
            <span style={{ fontWeight: 600 }}>{c.label}</span>
            <span style={cell}>{c.from || '(empty)'}</span>
            <span style={cell}>{c.to || '(empty)'}</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function toneColor(tone: Outcome['tone']): string {
  if (tone === 'ok') return dt.green;
  if (tone === 'pending') return dt.gold;
  return dt.rust;
}

const panel: React.CSSProperties = {
  marginTop: 18,
  padding: 18,
  border: `1px solid ${dt.cardBorder}`,
  borderRadius: 12,
  background: dt.innerBg,
  color: dt.textPrimary,
};
const h3: React.CSSProperties = { fontFamily: dt.serif, fontWeight: 500, fontSize: 20, margin: '0 0 6px' };
const h4: React.CSSProperties = { fontSize: 13, fontWeight: 700, letterSpacing: '.04em', margin: '16px 0 8px', color: dt.textMuted };
const muted: React.CSSProperties = { fontSize: 13, color: dt.textMuted, margin: '0 0 12px', lineHeight: 1.5 };
const note: React.CSSProperties = {
  marginTop: 18,
  background: dt.innerBg,
  border: `1px dashed ${dt.dashed}`,
  borderRadius: 12,
  padding: 16,
  fontSize: 13.5,
  color: dt.textMuted,
  lineHeight: 1.5,
};
const outcomeStyle: React.CSSProperties = { fontSize: 13, lineHeight: 1.5, margin: '0 0 12px' };
const list: React.CSSProperties = { margin: '4px 0 0', paddingLeft: 18 };
const fieldLabel: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 };
const dimRow: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 };
const actions: React.CSSProperties = { display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 };
const revisionRow: React.CSSProperties = { borderTop: `1px solid ${dt.rowDivider}`, padding: '10px 0' };
const changeGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(90px, max-content) minmax(140px, 1fr) minmax(140px, 1fr)',
  gap: '6px 12px',
  fontSize: 12.5,
};
const colHead: React.CSSProperties = { fontWeight: 700, color: dt.textLight, fontSize: 11.5, letterSpacing: '.05em' };
const cell: React.CSSProperties = { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', color: dt.body };
const input: React.CSSProperties = {
  fontSize: 13,
  padding: '6px 9px',
  border: `1px solid ${dt.inputBorder}`,
  borderRadius: 8,
  background: dt.cardBg,
  color: dt.textPrimary,
  boxSizing: 'border-box',
};
const textarea: React.CSSProperties = { ...input, width: '100%', resize: 'vertical', lineHeight: 1.5, fontFamily: dt.sans };
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
const primaryBtn: React.CSSProperties = { ...btn, background: dt.darkBg, color: dt.goldChip, border: 'none' };
const linkBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 700,
  color: dt.gold,
};
