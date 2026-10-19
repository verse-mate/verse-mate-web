/**
 * The class add / edit form and the class row, shared by the leader's Class
 * Setup (/coach/classes) and the admin class schedule (/coach/admin/classes).
 * A class is the notetaker's schedule: its link, first or next date, start
 * time and zone are what the VerseMate notetaker joins by. The words for "when"
 * and "can the notetaker join" live in lib/coachClassSchedule.
 */

import { useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, Check, CheckCircle2, CircleOff, Pencil, Trash2, Video, X } from 'lucide-react';
import { vmTokens } from '@/styles/themeStyles';
import { CoachCard } from './CoachUi';
import type { CoachClass, CoachClassInput, CoachClassRecurrence } from '@/services/coachService';
import {
  COMMON_TIME_ZONES,
  RECURRENCE_OPTIONS,
  classDraft,
  classInput,
  classWhen,
  notetakerState,
  notetakerText,
  otherTimeZones,
  timeZoneLabel,
  zoomLinkHint,
  type ClassDraft,
} from '@/lib/coachClassSchedule';

// ─── One class, read-only row ────────────────────────────────────────────────

export function ClassRow({
  cls,
  onEdit,
  onDelete,
  deleting,
  testId = 'coach-class-row',
}: {
  cls: CoachClass;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
  testId?: string;
}) {
  const state = notetakerState(cls);
  const stateColor =
    state.kind === 'ready' ? vmTokens.statusSuccess : state.kind === 'off' ? vmTokens.textTertiary : vmTokens.statusError;
  const StateIcon = state.kind === 'ready' ? CheckCircle2 : state.kind === 'off' ? CircleOff : AlertTriangle;
  return (
    <CoachCard testId={testId}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: vmTokens.textPrimary }}>{cls.name}</h3>
          <div
            data-testid="coach-class-when"
            style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 12.5, color: vmTokens.textSecondary }}
          >
            <CalendarDays size={14} style={{ color: vmTokens.textTertiary, flexShrink: 0 }} /> {classWhen(cls)}
          </div>
          <div
            data-testid="coach-class-notetaker-state"
            data-state={state.kind}
            style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 12.5, color: stateColor }}
          >
            <StateIcon size={14} style={{ flexShrink: 0 }} /> {notetakerText(state)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, minWidth: 0 }}>
            <Video size={14} style={{ color: cls.zoomLink ? vmTokens.gold : vmTokens.textTertiary, flexShrink: 0 }} />
            {cls.zoomLink ? (
              <a
                href={cls.zoomLink}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 12.5,
                  color: vmTokens.gold,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {cls.zoomLink}
              </a>
            ) : (
              <span style={{ fontSize: 12.5, color: vmTokens.statusError }}>No meeting link yet</span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <IconButton label="Edit class" onClick={onEdit} testId="coach-class-edit">
            <Pencil size={16} strokeWidth={1.9} />
          </IconButton>
          <IconButton label="Remove class" onClick={onDelete} disabled={deleting} testId="coach-class-delete">
            <Trash2 size={16} strokeWidth={1.9} />
          </IconButton>
        </div>
      </div>
    </CoachCard>
  );
}

// ─── Add / edit form ─────────────────────────────────────────────────────────

/**
 * With `leaders`, the form starts with a leader picker (an admin scheduling a
 * class for someone) and `onSubmit` gets the chosen roster id.
 */
export function ClassForm({
  initial,
  leaders,
  initialLeader = '',
  busy,
  submitLabel,
  error,
  onCancel,
  onSubmit,
}: {
  initial?: ClassDraft;
  leaders?: { id: string; name: string }[];
  initialLeader?: string;
  busy: boolean;
  submitLabel: string;
  error?: string | null;
  onCancel: () => void;
  onSubmit: (input: CoachClassInput, leaderId: string) => void;
}) {
  const [draft, setDraft] = useState<ClassDraft>(() => initial ?? classDraft());
  const [leader, setLeader] = useState(initialLeader);
  const set = <K extends keyof ClassDraft>(key: K, value: ClassDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const otherZones = useMemo(() => otherTimeZones(initial?.timeZone), [initial?.timeZone]);

  const nameEmpty = draft.name.trim() === '';
  const linkInvalid = draft.zoomLink.trim() !== '' && !/^https?:\/\/\S+$/i.test(draft.zoomLink.trim());
  const zoneMissing = draft.startTime.trim() !== '' && draft.timeZone === '';
  const leaderMissing = !!leaders && leader === '';
  const canSave = !nameEmpty && !linkInvalid && !zoneMissing && !leaderMissing && !busy;
  const hint = draft.notetaker ? zoomLinkHint(draft.zoomLink) : null;

  const submit = () => {
    if (!canSave) return;
    onSubmit(classInput(draft), leader);
  };

  return (
    <CoachCard testId="coach-class-form">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {leaders && (
          <Field label="Leader">
            <select
              value={leader}
              onChange={(e) => setLeader(e.target.value)}
              data-testid="coach-class-leader"
              style={inputStyle(false)}
            >
              <option value="">Choose a leader</option>
              {leaders.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Class name">
          <input
            value={draft.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Thursday Evening — James"
            data-testid="coach-class-name"
            style={inputStyle(false)}
          />
        </Field>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Field label="First or next class date" style={{ flex: '1 1 180px' }}>
            <input
              type="date"
              value={draft.classDate}
              onChange={(e) => set('classDate', e.target.value)}
              data-testid="coach-class-date"
              style={inputStyle(false)}
            />
          </Field>
          <Field label="Repeats" style={{ flex: '1 1 180px' }}>
            <select
              value={draft.recurrence}
              onChange={(e) => set('recurrence', e.target.value as CoachClassRecurrence)}
              data-testid="coach-class-recurrence"
              style={inputStyle(false)}
            >
              {RECURRENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Field label="Start time" style={{ flex: '1 1 140px' }}>
            <input
              type="time"
              value={draft.startTime}
              onChange={(e) => set('startTime', e.target.value)}
              data-testid="coach-class-time"
              style={inputStyle(false)}
            />
          </Field>
          <Field label="Time zone" style={{ flex: '2 1 220px' }}>
            <select
              value={draft.timeZone}
              onChange={(e) => set('timeZone', e.target.value)}
              data-testid="coach-class-zone"
              style={inputStyle(zoneMissing)}
            >
              {draft.timeZone === '' && <option value="">Choose a time zone</option>}
              <optgroup label="United States">
                {COMMON_TIME_ZONES.map((z) => (
                  <option key={z.value} value={z.value}>
                    {timeZoneLabel(z.value)}
                  </option>
                ))}
              </optgroup>
              <optgroup label="All time zones">
                {otherZones.map((z) => (
                  <option key={z} value={z}>
                    {timeZoneLabel(z)}
                  </option>
                ))}
              </optgroup>
            </select>
          </Field>
        </div>

        {draft.classDate && (
          <p data-testid="coach-class-when-preview" style={hintStyle}>
            When: {classWhen(draft)}
          </p>
        )}

        <Field label="Meeting link">
          <input
            value={draft.zoomLink}
            onChange={(e) => set('zoomLink', e.target.value)}
            placeholder="https://zoom.us/j/…"
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            data-testid="coach-class-zoom"
            style={inputStyle(linkInvalid)}
          />
          {linkInvalid && (
            <p style={{ margin: '6px 0 0', fontSize: 12, color: vmTokens.statusError }}>Enter a valid http(s) link.</p>
          )}
          {!linkInvalid && hint === 'passcode' && (
            <p data-testid="coach-class-link-hint" style={{ ...hintStyle, marginTop: 6 }}>
              If your meeting has a passcode, paste the invite link that includes it (…?pwd=…).
            </p>
          )}
          {!linkInvalid && hint === 'not-zoom' && (
            <p data-testid="coach-class-link-hint" style={{ ...hintStyle, marginTop: 6 }}>
              The notetaker joins Zoom meetings only for now.
            </p>
          )}
        </Field>

        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13.5, color: vmTokens.textPrimary }}>
          <input
            type="checkbox"
            checked={draft.notetaker}
            onChange={(e) => set('notetaker', e.target.checked)}
            data-testid="coach-class-notetaker"
            style={{ width: 16, height: 16, accentColor: vmTokens.gold }}
          />
          Record this class with the VerseMate notetaker
        </label>

        {error && (
          <p role="alert" data-testid="coach-class-error" style={{ margin: 0, fontSize: 13, color: vmTokens.statusError }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 2 }}>
          <button type="button" onClick={onCancel} data-testid="coach-class-cancel" style={ghostBtnStyle}>
            <X size={15} /> Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSave}
            data-testid="coach-class-save"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 18px',
              borderRadius: 10,
              border: 'none',
              background: canSave ? vmTokens.gold : vmTokens.divider,
              color: canSave ? vmTokens.goldOnLight : vmTokens.textTertiary,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: canSave ? 'pointer' : 'default',
            }}
          >
            <Check size={15} /> {busy ? 'Saving…' : submitLabel}
          </button>
        </div>
      </div>
    </CoachCard>
  );
}

// ─── Small building blocks ───────────────────────────────────────────────────

function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: vmTokens.textSecondary }}>{label}</span>
      {children}
    </label>
  );
}

function inputStyle(invalid: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: `1px solid ${invalid ? vmTokens.statusError : vmTokens.inputBorder}`,
    background: vmTokens.inputBg,
    color: vmTokens.textPrimary,
    fontSize: 14,
    outline: 'none',
  };
}

const hintStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: vmTokens.textSecondary,
  lineHeight: 1.45,
};

const ghostBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '9px 14px',
  borderRadius: 10,
  border: `1px solid ${vmTokens.divider}`,
  background: 'transparent',
  color: vmTokens.textSecondary,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: 'pointer',
};

function IconButton({
  children,
  label,
  onClick,
  disabled,
  testId,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  testId?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 34,
        height: 34,
        borderRadius: 9,
        border: `1px solid ${vmTokens.divider}`,
        background: vmTokens.surfaceRaisedBg,
        color: vmTokens.textSecondary,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}
