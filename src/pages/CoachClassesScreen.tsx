/**
 * Class Setup (/coach/classes) — a leader registers each study they run.
 *
 * Every class carries a name, an optional next-meeting date, a recurrence, and
 * the Zoom / Meet / Teams link the coaching Notetaker bot (Fireflies) joins.
 * A leader can add several; the program admin reads the whole set to configure
 * which meetings the bot auto-joins. Persisted via the /coach/classes API.
 *
 * Signed-out / not-a-coach states are handled by <CoachStateBoundary> — the
 * same gate the rest of the portal uses.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Check, Pencil, Plus, Trash2, Video, X } from 'lucide-react';
import { toast } from 'sonner';
import ScreenHeader from '@/components/ScreenHeader';
import { vmTokens } from '@/styles/themeStyles';
import { useCoachMe, useCoachClasses, coachKeys, coachState } from '@/hooks/useCoach';
import {
  CoachCard,
  CoachStateBoundary,
  SectionLabel,
} from '@/components/coach/CoachUi';
import {
  createCoachClass,
  updateCoachClass,
  deleteCoachClass,
  type CoachClass,
  type CoachClassInput,
  type CoachClassRecurrence,
} from '@/services/coachService';

const RECURRENCE_OPTIONS: { value: CoachClassRecurrence; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every other week' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'daily', label: 'Daily' },
  { value: 'none', label: 'One-time (no repeat)' },
];

function recurrenceLabel(value: string): string {
  return RECURRENCE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function formatDate(iso: string | null): string {
  if (!iso) return 'No date set';
  // Parse as a plain calendar date (avoid TZ shifting the day).
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CoachClassesScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const meQuery = useCoachMe();
  const classesQuery = useCoachClasses();

  const me = coachState(meQuery);
  const classes = coachState(classesQuery);
  const loading = me.loading || classes.loading;

  // Which row is being edited (id), or 'new' for the add form, or null.
  const [editing, setEditing] = useState<string | 'new' | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: coachKeys.classes });

  const createMutation = useMutation({
    mutationFn: (input: CoachClassInput) => createCoachClass(input),
    onSuccess: () => {
      invalidate();
      setEditing(null);
      toast.success('Class added');
    },
    onError: () => toast.error('Could not add the class — check the fields and try again'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CoachClassInput }) => updateCoachClass(id, input),
    onSuccess: () => {
      invalidate();
      setEditing(null);
      toast.success('Class saved');
    },
    onError: () => toast.error('Could not save the class — check the fields and try again'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCoachClass(id),
    onSuccess: () => {
      invalidate();
      toast.success('Class removed');
    },
    onError: () => toast.error('Could not remove the class'),
  });

  const list = classes.data || [];
  const busy = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader title="Class Setup" onBack={() => navigate('/coach')} backTestId="coach-classes-back-button" />

      <div
        data-testid="coach-classes"
        style={{ flex: 1, overflowY: 'auto', borderTop: `1px solid ${vmTokens.divider}` }}
      >
        <CoachStateBoundary
          loading={loading}
          authError={me.authError || classes.authError}
          error={me.error || classes.error}
          onRetry={() => {
            meQuery.refetch();
            classesQuery.refetch();
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              padding: 16,
              maxWidth: 720,
              margin: '0 auto',
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: vmTokens.textPrimary }}>
                Your classes
              </h2>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: vmTokens.textSecondary, lineHeight: 1.5 }}>
                Add each study you lead. The meeting link you set is where your coaching notetaker joins and records
                the session automatically — so keep it current for every class.
              </p>
            </div>

            {list.length === 0 && editing !== 'new' && (
              <CoachCard testId="coach-classes-empty">
                <p style={{ margin: 0, fontSize: 14, color: vmTokens.textSecondary }}>
                  No classes yet. Add your first class so your sessions get recorded and coached.
                </p>
              </CoachCard>
            )}

            {list.length > 0 && <SectionLabel>Registered classes</SectionLabel>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {list.map((cls) =>
                editing === cls.id ? (
                  <ClassForm
                    key={cls.id}
                    initial={cls}
                    busy={busy}
                    onCancel={() => setEditing(null)}
                    onSubmit={(input) => updateMutation.mutate({ id: cls.id, input })}
                  />
                ) : (
                  <ClassRow
                    key={cls.id}
                    cls={cls}
                    onEdit={() => setEditing(cls.id)}
                    onDelete={() => {
                      if (window.confirm(`Remove “${cls.name}”? This can’t be undone.`)) {
                        deleteMutation.mutate(cls.id);
                      }
                    }}
                    deleting={deleteMutation.isPending && deleteMutation.variables === cls.id}
                  />
                ),
              )}
            </div>

            {editing === 'new' ? (
              <ClassForm
                busy={busy}
                onCancel={() => setEditing(null)}
                onSubmit={(input) => createMutation.mutate(input)}
              />
            ) : (
              <button
                type="button"
                data-testid="coach-classes-add"
                onClick={() => setEditing('new')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: `1px dashed ${vmTokens.inputBorder}`,
                  background: 'transparent',
                  color: vmTokens.gold,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Plus size={17} strokeWidth={2} /> Add a class
              </button>
            )}
          </div>
        </CoachStateBoundary>
      </div>
    </div>
  );
}

// ─── One class, read-only row ────────────────────────────────────────────────

function ClassRow({
  cls,
  onEdit,
  onDelete,
  deleting,
}: {
  cls: CoachClass;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <CoachCard testId="coach-class-row">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: vmTokens.textPrimary }}>{cls.name}</h3>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px 14px',
              marginTop: 6,
              fontSize: 12.5,
              color: vmTokens.textSecondary,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <CalendarDays size={14} style={{ color: vmTokens.textTertiary }} /> {formatDate(cls.classDate)}
            </span>
            <span>{recurrenceLabel(cls.recurrence)}</span>
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

function ClassForm({
  initial,
  busy,
  onCancel,
  onSubmit,
}: {
  initial?: CoachClass;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (input: CoachClassInput) => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [classDate, setClassDate] = useState(initial?.classDate ?? '');
  const [recurrence, setRecurrence] = useState<CoachClassRecurrence>(initial?.recurrence ?? 'weekly');
  const [zoomLink, setZoomLink] = useState(initial?.zoomLink ?? '');

  const nameEmpty = name.trim() === '';
  const linkInvalid = zoomLink.trim() !== '' && !/^https?:\/\/\S+$/i.test(zoomLink.trim());
  const canSave = !nameEmpty && !linkInvalid && !busy;

  const submit = () => {
    if (!canSave) return;
    onSubmit({
      name: name.trim(),
      classDate: classDate.trim(),
      recurrence,
      zoomLink: zoomLink.trim(),
    });
  };

  return (
    <CoachCard testId="coach-class-form">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Class name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Thursday Evening — James"
            data-testid="coach-class-name"
            style={inputStyle(false)}
          />
        </Field>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Field label="Next meeting date" style={{ flex: '1 1 180px' }}>
            <input
              type="date"
              value={classDate}
              onChange={(e) => setClassDate(e.target.value)}
              data-testid="coach-class-date"
              style={inputStyle(false)}
            />
          </Field>
          <Field label="Repeats" style={{ flex: '1 1 180px' }}>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as CoachClassRecurrence)}
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

        <Field label="Meeting link (Zoom, Google Meet, or Teams)">
          <input
            value={zoomLink}
            onChange={(e) => setZoomLink(e.target.value)}
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
        </Field>

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
            <Check size={15} /> {busy ? 'Saving…' : initial ? 'Save' : 'Add class'}
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
