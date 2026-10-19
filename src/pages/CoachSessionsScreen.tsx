/**
 * Coaching dashboard — Sessions (/coach/sessions).
 *
 * Two jobs from the design handoff: manage the leader's recurring classes
 * and revisit past coaching reports. The classes are the VerseMate notetaker's
 * schedule: each one's link, first or next date, start time and zone are what
 * it joins by, and the card under the heading suggests connecting Zoom so it
 * joins as the leader's guest. Multiple recurring classes per week are
 * supported; adding, editing and removing are live. Choosing a past session
 * opens it on Home's Full report tab.
 *
 * An admin drilling into a leader (/coach/leader/:coachId/sessions) schedules,
 * edits and removes that leader's classes through the admin class routes.
 *
 * Wired to the real /coach API: classes via /coach/classes (or
 * /coach/admin/classes for an admin) and past sessions via
 * /coach/reports/summary, one page at a time. The mock's /55 grade is shown as the live /100 + status.
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, CircleOff } from 'lucide-react';
import {
  useAdminLeader,
  useCoachReportSummaries,
  useCoachClasses,
  useAdminClasses,
  coachKeys,
  coachState,
} from '@/hooks/useCoach';
import {
  createAdminCoachClass,
  createCoachClass,
  deleteAdminCoachClass,
  deleteCoachClass,
  updateAdminCoachClass,
  updateCoachClass,
  type CoachClass,
  type CoachClassInput,
  type CoachClassRecurrence,
  type CoachReportSummary,
} from '@/services/coachService';
import CoachDashboardShell, { CoachGate } from '@/components/coach/CoachDashboardShell';
import { TimeZoneOptions } from '@/components/coach/ClassSchedule';
import { NotetakerConnectPanel } from '@/components/coach/NotetakerConnectCard';
import { dt, letterGrade, statusBand } from '@/components/coach/dashboardTheme';
import { PipelineCopyTag } from '@/components/coach/CoachUi';
import { useRubric } from '@/hooks/useRubric';
import {
  RECURRENCE_OPTIONS,
  classDraft,
  classInput,
  classSaveProblem,
  classWhen,
  draftProblems,
  notetakerState,
  notetakerText,
  zoomLinkHintText,
  type ClassDraft,
} from '@/lib/coachClassSchedule';

export default function CoachSessionsScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Admin drill-in when a :coachId is present: the admin manages this leader's
  // classes through the admin routes, which take the same roster id.
  const { coachId } = useParams();
  const admin = !!coachId;
  const base = admin ? `/coach/leader/${coachId}` : '/coach';

  const summaries = useCoachReportSummaries({ coachId });
  const adminLeader = useAdminLeader(coachId);
  const selfClasses = useCoachClasses({ enabled: !admin });
  const adminClasses = useAdminClasses({ enabled: admin });

  const reports = coachState(summaries);
  const reportList: CoachReportSummary[] | undefined = summaries.data?.pages.flatMap((p) => p.items);
  const classesState = admin ? coachState(adminClasses) : coachState(selfClasses);
  const classList: CoachClass[] = admin
    ? (adminClasses.data || []).filter((c) => c.leader.id === coachId)
    : selfClasses.data || [];
  const leaderName = adminLeader?.name || '';

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: coachKeys.classes });
    queryClient.invalidateQueries({ queryKey: coachKeys.adminClasses });
    if (admin) queryClient.invalidateQueries({ queryKey: coachKeys.notetakerZoom });
  };
  const createMutation = useMutation({
    mutationFn: (input: CoachClassInput) => (admin ? createAdminCoachClass(coachId, input) : createCoachClass(input)),
    onSuccess: () => {
      invalidate();
      setShowAdd(false);
      toast.success(admin ? 'Class scheduled' : 'Class added');
    },
    onError: (err) => toast.error(classSaveProblem(err, 'Could not add the class')),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CoachClassInput }) =>
      admin ? updateAdminCoachClass(id, input) : updateCoachClass(id, input),
    onSuccess: () => {
      invalidate();
      setEditing(null);
      toast.success('Class saved');
    },
    onError: (err) => toast.error(classSaveProblem(err, 'Could not save the class')),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => (admin ? deleteAdminCoachClass(id) : deleteCoachClass(id)),
    onSuccess: () => {
      invalidate();
      toast.success('Class removed');
    },
    onError: () => toast.error('Could not remove the class'),
  });

  const sessionList = [...(reportList || [])].sort(byDateDesc);

  return (
    <CoachDashboardShell active="sessions" coachId={coachId} leaderName={leaderName}>
      <CoachGate
        loading={reports.loading || classesState.loading}
        authError={reports.authError || classesState.authError}
        error={reports.error || classesState.error}
        onRetry={() => {
          summaries.refetch();
          (admin ? adminClasses : selfClasses).refetch();
        }}
      >
        <div style={{ padding: '36px 0 6px' }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 40, lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 8px' }}>
              Sessions
            </h1>
            <p style={{ fontSize: 16, color: dt.textMuted, margin: 0 }}>
              {admin
                ? 'This leader’s classes and past coaching reports. Schedule, edit or remove a class for them here.'
                : 'Manage your recurring classes and revisit past coaching reports.'}
            </p>
          </div>

          {!admin && <NotetakerConnectPanel />}

          {/* Recurring classes */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
            <h2 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 23, margin: 0 }}>Recurring classes</h2>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setShowAdd((v) => !v);
              }}
              data-testid="coach-sessions-add"
              style={{ background: dt.darkBg, color: dt.goldChip, fontWeight: 700, fontSize: 13.5, padding: '10px 16px', borderRadius: 9, border: 'none', cursor: 'pointer' }}
            >
              {admin ? '+ Schedule a class' : '+ Add a class'}
            </button>
          </div>

          {showAdd && (
            <ClassForm
              title={admin ? 'NEW CLASS FOR THIS LEADER' : 'NEW RECURRING CLASS'}
              submitLabel={admin ? 'Schedule class' : 'Add class'}
              footnote="Add as many as you need — multiple recurring classes per week are supported."
              busy={createMutation.isPending}
              onCancel={() => setShowAdd(false)}
              onSubmit={(input) => createMutation.mutate(input)}
            />
          )}

          {classList.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 14, marginBottom: 44 }}>
              {classList.map((c) =>
                editing === c.id ? (
                  <div key={c.id} style={{ gridColumn: '1 / -1' }}>
                    <ClassForm
                      initial={classDraft(c)}
                      title="EDIT CLASS"
                      submitLabel="Save"
                      busy={updateMutation.isPending}
                      onCancel={() => setEditing(null)}
                      onSubmit={(input) => updateMutation.mutate({ id: c.id, input })}
                    />
                  </div>
                ) : (
                  <ClassCard
                    key={c.id}
                    cls={c}
                    onEdit={() => {
                      setShowAdd(false);
                      setEditing(c.id);
                    }}
                    onRemove={() => {
                      if (window.confirm(`Remove “${c.name}”? The notetaker stops joining it. This can’t be undone.`)) {
                        deleteMutation.mutate(c.id);
                      }
                    }}
                  />
                ),
              )}
            </div>
          ) : (
            !showAdd && (
              <div style={{ background: dt.innerBg, border: `1px dashed ${dt.dashed}`, borderRadius: 13, padding: '20px 22px', marginBottom: 44, fontSize: 14, color: dt.textMuted }}>
                {admin
                  ? 'This leader has no classes yet. Schedule one so their sessions get recorded and coached.'
                  : 'No classes yet. Add your first class so your sessions get recorded and coached.'}
              </div>
            )
          )}

          {/* Past sessions */}
          <h2 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 23, margin: '0 0 14px' }}>Past sessions</h2>
          {sessionList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sessionList.map((s) => (
                <PastSessionRow key={s.id} report={s} onView={() => navigate(`${base}?s=${encodeURIComponent(s.id)}`)} />
              ))}
              {summaries.hasNextPage && (
                <button
                  type="button"
                  onClick={() => summaries.fetchNextPage()}
                  disabled={summaries.isFetchingNextPage}
                  data-testid="coach-sessions-more"
                  style={{ alignSelf: 'center', marginTop: 8, cursor: 'pointer', fontSize: 13.5, fontWeight: 700, color: dt.gold2, background: dt.goldChip, border: `1px solid ${dt.goldChipBorder}`, padding: '9px 16px', borderRadius: 8 }}
                >
                  {summaries.isFetchingNextPage ? 'Loading…' : 'Show more sessions'}
                </button>
              )}
              {summaries.isFetchNextPageError && (
                <div style={{ fontSize: 13, color: dt.rust, textAlign: 'center' }}>Could not load more sessions. Try again.</div>
              )}
            </div>
          ) : (
            <div style={{ background: dt.innerBg, border: `1px dashed ${dt.dashed}`, borderRadius: 13, padding: '20px 22px', fontSize: 14, color: dt.textMuted }}>
              No coached sessions yet.
            </div>
          )}
        </div>
      </CoachGate>
    </CoachDashboardShell>
  );
}

// ─── Class card ──────────────────────────────────────────────────────────────

function ClassCard({ cls, onEdit, onRemove }: { cls: CoachClass; onEdit: () => void; onRemove: () => void }) {
  const state = notetakerState(cls);
  const stateColor = state.kind === 'ready' ? dt.green : state.kind === 'off' ? dt.textLight : dt.rust;
  const StateIcon = state.kind === 'ready' ? CheckCircle2 : state.kind === 'off' ? CircleOff : AlertTriangle;
  return (
    <div style={{ background: dt.innerBg, border: `1px solid ${dt.border2}`, borderRadius: 13, padding: '20px 22px' }} data-testid="coach-class-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11.5, fontWeight: 700, letterSpacing: '.03em', color: dt.gold2, background: dt.goldChip, padding: '5px 11px', borderRadius: 99 }}>
          ● {recurrenceWord(cls.recurrence)}
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <button type="button" onClick={onEdit} data-testid="coach-class-edit" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: dt.gold, padding: 0 }}>
            Edit
          </button>
          <button type="button" onClick={onRemove} data-testid="coach-class-remove" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: dt.rust, padding: 0 }}>
            Remove
          </button>
        </div>
      </div>
      <h3 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 20, margin: '14px 0 10px', lineHeight: 1.2 }}>{cls.name}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={cardLabel}>When</span>
          <span data-testid="coach-class-when" style={{ color: dt.body }}>{classWhen(cls)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={cardLabel}>Link</span>
          {cls.zoomLink ? (
            <a href={cls.zoomLink} target="_blank" rel="noreferrer" style={{ wordBreak: 'break-all', color: dt.gold }}>
              {cls.zoomLink}
            </a>
          ) : (
            <span style={{ color: dt.rust }}>No meeting link yet</span>
          )}
        </div>
        <div
          data-testid="coach-class-notetaker-state"
          data-state={state.kind}
          style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 4, color: stateColor, fontWeight: state.kind === 'off' ? 500 : 600 }}
        >
          <StateIcon size={15} style={{ flexShrink: 0 }} /> {notetakerText(state)}
        </div>
      </div>
    </div>
  );
}

// ─── Add / edit form ─────────────────────────────────────────────────────────

function ClassForm({
  initial,
  title,
  submitLabel,
  footnote,
  busy,
  onCancel,
  onSubmit,
}: {
  initial?: ClassDraft;
  title: string;
  submitLabel: string;
  footnote?: string;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (input: CoachClassInput) => void;
}) {
  const [draft, setDraft] = useState<ClassDraft>(() => initial ?? classDraft());
  const set = <K extends keyof ClassDraft>(key: K, value: ClassDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const { nameEmpty, linkInvalid, zoneMissing } = draftProblems(draft);
  const canSave = !nameEmpty && !linkInvalid && !zoneMissing && !busy;
  const hint = draft.notetaker && !linkInvalid ? zoomLinkHintText(draft.zoomLink) : null;

  const submit = () => {
    if (!canSave) return;
    onSubmit(classInput(draft));
  };

  return (
    <div style={{ background: dt.innerBg, border: `1px solid ${dt.border2}`, borderRadius: 13, padding: '22px 24px', marginBottom: 16 }} data-testid="coach-class-form">
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: dt.gold, marginBottom: 16 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Class title">
          <input value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. James — Saturday Morning Group" data-testid="coach-class-name" style={inputStyle(false)} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', gap: 14 }}>
          <Field label="First or next class date">
            <input type="date" value={draft.classDate} onChange={(e) => set('classDate', e.target.value)} data-testid="coach-class-date" style={inputStyle(false)} />
          </Field>
          <Field label="Repeats">
            <select value={draft.recurrence} onChange={(e) => set('recurrence', e.target.value as CoachClassRecurrence)} data-testid="coach-class-recurrence" style={inputStyle(false)}>
              {RECURRENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', gap: 14 }}>
          <Field label="Start time">
            <input type="time" value={draft.startTime} onChange={(e) => set('startTime', e.target.value)} data-testid="coach-class-time" style={inputStyle(false)} />
          </Field>
          <Field label="Time zone">
            <select value={draft.timeZone} onChange={(e) => set('timeZone', e.target.value)} data-testid="coach-class-zone" style={inputStyle(zoneMissing)}>
              <TimeZoneOptions keep={initial?.timeZone} empty={draft.timeZone === ''} />
            </select>
          </Field>
        </div>
        {draft.classDate && (
          <div data-testid="coach-class-when-preview" style={{ fontSize: 13, color: dt.body }}>
            <span style={{ fontWeight: 700, color: dt.gold }}>When</span> {classWhen(draft)}
          </div>
        )}
        <Field label="Meeting link">
          <input value={draft.zoomLink} onChange={(e) => set('zoomLink', e.target.value)} placeholder="https://zoom.us/j/…" inputMode="url" autoCapitalize="off" autoCorrect="off" spellCheck={false} data-testid="coach-class-zoom" style={inputStyle(linkInvalid)} />
          {linkInvalid && <p style={{ margin: '6px 0 0', fontSize: 12, color: dt.rust }}>Enter a valid http(s) link.</p>}
          {hint && (
            <p data-testid="coach-class-link-hint" style={{ margin: '6px 0 0', fontSize: 12, color: dt.textMuted, lineHeight: 1.45 }}>
              {hint}
            </p>
          )}
        </Field>
        <NotetakerSwitch on={draft.notetaker} onChange={(on) => set('notetaker', on)} />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button type="button" onClick={submit} disabled={!canSave} data-testid="coach-class-save" style={{ background: canSave ? dt.brightGold : dt.barTrack, color: canSave ? dt.textPrimary : dt.textLight, fontWeight: 700, fontSize: 13.5, padding: '10px 18px', borderRadius: 9, border: 'none', cursor: canSave ? 'pointer' : 'default' }}>
          {busy ? 'Saving…' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} data-testid="coach-class-cancel" style={{ border: `1px solid ${dt.inputBorder}`, color: dt.textMuted, fontWeight: 600, fontSize: 13.5, padding: '10px 18px', borderRadius: 9, background: 'transparent', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
      {footnote && <div style={{ fontSize: 12, color: dt.textLighter, marginTop: 12 }}>{footnote}</div>}
    </div>
  );
}

function NotetakerSwitch({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      data-testid="coach-class-notetaker"
      style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: dt.sans, fontSize: 14, color: dt.textPrimary, textAlign: 'left' }}
    >
      <span aria-hidden style={{ position: 'relative', flex: 'none', width: 36, height: 20, borderRadius: 99, background: on ? dt.brightGold : dt.barTrack, transition: 'background .15s' }}>
        <span style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: dt.cardBg, boxShadow: '0 1px 2px rgba(0,0,0,.2)', transition: 'left .15s' }} />
      </span>
      Record this class with the VerseMate notetaker
    </button>
  );
}

// ─── Past session row ────────────────────────────────────────────────────────

function PastSessionRow({ report, onView }: { report: CoachReportSummary; onView: () => void }) {
  const { rubric } = useRubric();
  const band = statusBand(
    report.status,
    (rubric?.statusBands ?? []).map((b) => b.label),
  );
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '76px 1fr 108px 118px 128px', gap: 16, alignItems: 'center', padding: '15px 18px', border: `1px solid ${dt.border2}`, borderRadius: 12, background: dt.innerBg }}>
      <div style={{ fontSize: 13, color: dt.textLight, fontWeight: 600 }}>{shortDate(report.date)}</div>
      <div style={{ minWidth: 0 }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>{report.session}</span>
        {report.topic && <span style={{ fontSize: 13, color: dt.textLighter }}> · {report.topic}</span>}
        <div>
          <PipelineCopyTag reportId={report.id} held={report.held} />
        </div>
      </div>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', padding: '5px 9px', borderRadius: 6, textAlign: 'center', color: band.c, background: band.bg }}>
        {band.label}
      </div>
      <div style={{ textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
        {Math.round(report.score)}/100 · {letterGrade(report.score)}
      </div>
      <button type="button" onClick={onView} data-testid="coach-view-report" style={{ justifySelf: 'end', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: dt.gold2, background: dt.goldChip, border: `1px solid ${dt.goldChipBorder}`, padding: '8px 14px', borderRadius: 8 }}>
        View report →
      </button>
    </div>
  );
}

// ─── Small building blocks ───────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: dt.textMuted, display: 'block', marginBottom: 6 }}>{label}</span>
      {children}
    </label>
  );
}

function inputStyle(invalid: boolean): React.CSSProperties {
  return {
    width: '100%',
    fontSize: 14,
    padding: '10px 12px',
    border: `1px solid ${invalid ? dt.rust : dt.inputBorder}`,
    borderRadius: 9,
    background: dt.inputBg,
    color: dt.textPrimary,
    fontFamily: dt.sans,
    outline: 'none',
    boxSizing: 'border-box',
  };
}

function recurrenceWord(r: string): string {
  return r === 'none' ? 'One-time' : (RECURRENCE_OPTIONS.find((o) => o.value === r)?.label ?? r);
}

const cardLabel: React.CSSProperties = { fontWeight: 700, color: dt.gold, flex: 'none', width: 44 };

function byDateDesc(a: { date: string }, b: { date: string }): number {
  return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
}

function shortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}
