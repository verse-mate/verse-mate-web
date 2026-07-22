/**
 * Coaching dashboard — Sessions (/coach/sessions).
 *
 * Two jobs from the design handoff: manage the leader's recurring classes
 * (the meeting links the coaching notetaker joins) and revisit past coaching
 * reports. Multiple recurring classes per week are supported; adding/removing
 * is live. Choosing a past session opens it on Home's Full report tab.
 *
 * Wired to the real /coach API: classes via /coach/classes (CoachClassInput —
 * name, next date, recurrence, meeting link) and past sessions via
 * /coach/reports. The mock's /55 grade is shown as the live /100 + status.
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  useCoachReports,
  useCoachReportsFor,
  useCoachClasses,
  useAdminClasses,
  coachKeys,
  coachState,
} from '@/hooks/useCoach';
import {
  createCoachClass,
  deleteCoachClass,
  type CoachClass,
  type CoachClassInput,
  type CoachClassRecurrence,
  type CoachReport,
} from '@/services/coachService';
import CoachDashboardShell, { CoachGate } from '@/components/coach/CoachDashboardShell';
import { dt, statusBand } from '@/components/coach/dashboardTheme';

const RECURRENCE_OPTIONS: { value: CoachClassRecurrence; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every other week' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'daily', label: 'Daily' },
  { value: 'none', label: 'One-time (no repeat)' },
];

export default function CoachSessionsScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Admin drill-in when a :coachId is present — classes are read-only (an admin
  // views a leader's registered classes; only the leader manages their own).
  const { coachId } = useParams();
  const admin = !!coachId;
  const base = admin ? `/coach/leader/${coachId}` : '/coach';

  const selfReports = useCoachReports({ enabled: !admin });
  const forReports = useCoachReportsFor(coachId ?? '');
  const selfClasses = useCoachClasses({ enabled: !admin });
  const adminClasses = useAdminClasses({ enabled: admin });

  const reports = admin ? coachState(forReports) : coachState(selfReports);
  const reportList = admin ? forReports.data?.reports : selfReports.data;
  const classesState = admin ? coachState(adminClasses) : coachState(selfClasses);
  const classList: CoachClass[] = admin
    ? (adminClasses.data || []).filter((c) => c.leader.id === coachId)
    : selfClasses.data || [];
  const leaderName = admin ? forReports.data?.profile?.name || '' : '';

  const [showAdd, setShowAdd] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: coachKeys.classes });
  const createMutation = useMutation({
    mutationFn: (input: CoachClassInput) => createCoachClass(input),
    onSuccess: () => {
      invalidate();
      setShowAdd(false);
      toast.success('Class added');
    },
    onError: () => toast.error('Could not add the class — check the fields and try again'),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCoachClass(id),
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
          (admin ? forReports : selfReports).refetch();
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
                ? 'This leader’s registered classes and past coaching reports.'
                : 'Manage your recurring classes and revisit past coaching reports.'}
            </p>
          </div>

          {/* Recurring classes */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
            <h2 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 23, margin: 0 }}>Recurring classes</h2>
            {!admin && (
              <button
                type="button"
                onClick={() => setShowAdd((v) => !v)}
                data-testid="coach-sessions-add"
                style={{ background: dt.darkBg, color: dt.goldChip, fontWeight: 700, fontSize: 13.5, padding: '10px 16px', borderRadius: 9, border: 'none', cursor: 'pointer' }}
              >
                + Add a class
              </button>
            )}
          </div>

          {!admin && showAdd && (
            <AddClassForm
              busy={createMutation.isPending}
              onCancel={() => setShowAdd(false)}
              onSubmit={(input) => createMutation.mutate(input)}
            />
          )}

          {classList.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 14, marginBottom: 44 }}>
              {classList.map((c) => (
                <ClassCard
                  key={c.id}
                  cls={c}
                  onRemove={
                    admin
                      ? undefined
                      : () => {
                          if (window.confirm(`Remove “${c.name}”? This can’t be undone.`)) deleteMutation.mutate(c.id);
                        }
                  }
                />
              ))}
            </div>
          ) : (
            !showAdd && (
              <div style={{ background: dt.innerBg, border: `1px dashed ${dt.dashed}`, borderRadius: 13, padding: '20px 22px', marginBottom: 44, fontSize: 14, color: dt.textMuted }}>
                {admin ? 'This leader hasn’t registered any classes yet.' : 'No classes yet. Add your first class so your sessions get recorded and coached.'}
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

function ClassCard({ cls, onRemove }: { cls: CoachClass; onRemove?: () => void }) {
  return (
    <div style={{ background: dt.innerBg, border: `1px solid ${dt.border2}`, borderRadius: 13, padding: '20px 22px' }} data-testid="coach-class-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11.5, fontWeight: 700, letterSpacing: '.03em', color: dt.gold2, background: dt.goldChip, padding: '5px 11px', borderRadius: 99 }}>
          ● {classPill(cls)}
        </div>
        {onRemove && (
          <button type="button" onClick={onRemove} data-testid="coach-class-remove" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: dt.rust }}>
            Remove
          </button>
        )}
      </div>
      <h3 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 20, margin: '14px 0 10px', lineHeight: 1.2 }}>{cls.name}</h3>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 13 }}>
        <span style={{ fontWeight: 700, color: dt.gold, flex: 'none' }}>Link</span>
        {cls.zoomLink ? (
          <a href={cls.zoomLink} target="_blank" rel="noreferrer" style={{ wordBreak: 'break-all', color: dt.gold }}>
            {cls.zoomLink}
          </a>
        ) : (
          <span style={{ color: dt.rust }}>No meeting link yet</span>
        )}
      </div>
    </div>
  );
}

// ─── Add form ────────────────────────────────────────────────────────────────

function AddClassForm({
  busy,
  onCancel,
  onSubmit,
}: {
  busy: boolean;
  onCancel: () => void;
  onSubmit: (input: CoachClassInput) => void;
}) {
  const [name, setName] = useState('');
  const [classDate, setClassDate] = useState('');
  const [recurrence, setRecurrence] = useState<CoachClassRecurrence>('weekly');
  const [zoomLink, setZoomLink] = useState('');

  const linkInvalid = zoomLink.trim() !== '' && !/^https?:\/\/\S+$/i.test(zoomLink.trim());
  const canSave = name.trim() !== '' && !linkInvalid && !busy;

  const submit = () => {
    if (!canSave) return;
    onSubmit({ name: name.trim(), classDate: classDate.trim(), recurrence, zoomLink: zoomLink.trim() });
  };

  return (
    <div style={{ background: dt.innerBg, border: `1px solid ${dt.border2}`, borderRadius: 13, padding: '22px 24px', marginBottom: 16 }} data-testid="coach-class-form">
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: dt.gold, marginBottom: 16 }}>NEW RECURRING CLASS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Class title">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. James — Saturday Morning Group" data-testid="coach-class-name" style={inputStyle(false)} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', gap: 14 }}>
          <Field label="Next meeting date">
            <input type="date" value={classDate} onChange={(e) => setClassDate(e.target.value)} data-testid="coach-class-date" style={inputStyle(false)} />
          </Field>
          <Field label="Repeats">
            <select value={recurrence} onChange={(e) => setRecurrence(e.target.value as CoachClassRecurrence)} data-testid="coach-class-recurrence" style={inputStyle(false)}>
              {RECURRENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Meeting link (Zoom, Google Meet, or Teams)">
          <input value={zoomLink} onChange={(e) => setZoomLink(e.target.value)} placeholder="https://zoom.us/j/…" inputMode="url" autoCapitalize="off" autoCorrect="off" spellCheck={false} data-testid="coach-class-zoom" style={inputStyle(linkInvalid)} />
          {linkInvalid && <p style={{ margin: '6px 0 0', fontSize: 12, color: dt.rust }}>Enter a valid http(s) link.</p>}
        </Field>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button type="button" onClick={submit} disabled={!canSave} data-testid="coach-class-save" style={{ background: canSave ? dt.brightGold : dt.barTrack, color: canSave ? dt.textPrimary : dt.textLight, fontWeight: 700, fontSize: 13.5, padding: '10px 18px', borderRadius: 9, border: 'none', cursor: canSave ? 'pointer' : 'default' }}>
          {busy ? 'Saving…' : 'Add class'}
        </button>
        <button type="button" onClick={onCancel} data-testid="coach-class-cancel" style={{ border: `1px solid ${dt.inputBorder}`, color: dt.textMuted, fontWeight: 600, fontSize: 13.5, padding: '10px 18px', borderRadius: 9, background: 'transparent', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
      <div style={{ fontSize: 12, color: dt.textLighter, marginTop: 12 }}>
        Add as many as you need — multiple recurring classes per week are supported.
      </div>
    </div>
  );
}

// ─── Past session row ────────────────────────────────────────────────────────

function PastSessionRow({ report, onView }: { report: CoachReport; onView: () => void }) {
  const band = statusBand(report.status);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '76px 1fr 108px 118px 128px', gap: 16, alignItems: 'center', padding: '15px 18px', border: `1px solid ${dt.border2}`, borderRadius: 12, background: dt.innerBg }}>
      <div style={{ fontSize: 13, color: dt.textLight, fontWeight: 600 }}>{shortDate(report.date)}</div>
      <div style={{ minWidth: 0 }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>{report.session}</span>
        {report.topic && <span style={{ fontSize: 13, color: dt.textLighter }}> · {report.topic}</span>}
      </div>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', padding: '5px 9px', borderRadius: 6, textAlign: 'center', color: band.c, background: band.bg }}>
        {band.label}
      </div>
      <div style={{ textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{Math.round(report.score)}/100</div>
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

function classPill(c: CoachClass): string {
  const rec =
    c.recurrence === 'weekly'
      ? 'Weekly'
      : c.recurrence === 'biweekly'
        ? 'Every other week'
        : c.recurrence === 'monthly'
          ? 'Monthly'
          : c.recurrence === 'daily'
            ? 'Daily'
            : 'One-time';
  if (c.classDate) {
    const [y, m, d] = c.classDate.split('-').map(Number);
    if (y && m && d) {
      const label = new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return `${rec} · next ${label}`;
    }
  }
  return rec;
}

function byDateDesc(a: { date: string }, b: { date: string }): number {
  return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
}

function shortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}
