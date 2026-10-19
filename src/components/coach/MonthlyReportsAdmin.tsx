import { useState, type CSSProperties } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vmTokens } from '@/styles/themeStyles';
import { CoachCard, SectionLabel } from '@/components/coach/CoachUi';
import { coachKeys } from '@/hooks/useCoach';
import { editMonthlyReport, fetchMonthlyReports, refusalText, releaseMonthlyReport } from '@/services/coachService';
import { editBody, editableFields, type MonthlyReportRow } from '@/services/coachMonthlyEdit';

const STATE_WORDS: Record<MonthlyReportRow['state'], string> = {
  held: 'Held for an admin',
  pending: 'Waiting to send',
  sending: 'Sending',
  sent: 'Sent',
  'parallel-run': 'Parallel run: kept for admins, never sent',
};

export default function MonthlyReportsAdmin({ month, leaderNames }: { month: string; leaderNames: Record<string, string> }) {
  const query = useQuery({ queryKey: coachKeys.monthlyReports(month), queryFn: () => fetchMonthlyReports(month), retry: false });
  const rows = query.data ?? [];
  if (query.isLoading) return null;
  return (
    <div data-testid="coach-monthly-reports">
      <SectionLabel>Monthly summaries and program report</SectionLabel>
      {query.isError ? (
        <p style={muted}>Could not load this month's written summaries.</p>
      ) : rows.length === 0 ? (
        <p style={muted}>No summaries were written for this month.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map((row) => (
            <ReportRow key={row.id} row={row} name={row.kind === 'program' ? 'Program report' : leaderNames[row.coachId ?? ''] ?? row.coachId ?? ''} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportRow({ row, name }: { row: MonthlyReportRow; name: string }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [outcome, setOutcome] = useState<string | null>(null);
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: coachKeys.monthlyReports(row.month) });
    queryClient.invalidateQueries({ queryKey: coachKeys.adminMonthly(row.month) });
  };
  const fields = editableFields(row);
  const correctable = row.state !== 'sent' && row.state !== 'sending';

  const save = useMutation({
    mutationFn: () => editMonthlyReport(row.id, editBody(row, values)),
    onSuccess: () => {
      setEditing(false);
      setOutcome('Saved.');
      refresh();
    },
    onError: (err) => setOutcome(refusalText(err)),
  });
  const release = useMutation({
    mutationFn: () => releaseMonthlyReport(row.id),
    onSuccess: (r) => {
      setOutcome(r.sent ? 'Released and sent.' : 'Released. It goes out with the next send.');
      refresh();
    },
    onError: (err) => setOutcome(refusalText(err)),
  });

  return (
    <CoachCard testId={`coach-monthly-report-${row.id}`} style={{ padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
        <strong style={{ fontSize: 14, color: vmTokens.textPrimary }}>{name}</strong>
        <span data-testid="coach-monthly-report-state" style={{ fontSize: 12.5, color: vmTokens.textSecondary }}>
          {STATE_WORDS[row.state]}
        </span>
      </div>
      {row.holdReason && <p style={{ ...muted, marginTop: 4 }}>{row.holdReason}</p>}
      {row.skipped.length > 0 && <p style={{ ...muted, marginTop: 4 }}>Not sent to: {row.skipped.join(', ')}</p>}
      {editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          {fields.map((f) => (
            <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: vmTokens.textSecondary }}>{f.label}</span>
              <textarea
                data-testid={`coach-monthly-report-field-${f.key}`}
                value={values[f.key] ?? f.value}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                rows={3}
                style={textarea}
              />
            </label>
          ))}
        </div>
      )}
      {outcome && (
        <p data-testid="coach-monthly-report-outcome" role="status" style={{ ...muted, marginTop: 8, color: vmTokens.textPrimary }}>
          {outcome}
        </p>
      )}
      {correctable && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {editing ? (
            <>
              <button type="button" data-testid="coach-monthly-report-save" onClick={() => save.mutate()} disabled={save.isPending} style={primary}>
                Save the correction
              </button>
              <button type="button" onClick={() => setEditing(false)} style={ghost}>
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              data-testid="coach-monthly-report-edit"
              onClick={() => {
                setValues({});
                setOutcome(null);
                setEditing(true);
              }}
              style={ghost}
            >
              Correct the text
            </button>
          )}
          {row.state === 'held' && !editing && (
            <button type="button" data-testid="coach-monthly-report-release" onClick={() => release.mutate()} disabled={release.isPending} style={primary}>
              Release
            </button>
          )}
        </div>
      )}
    </CoachCard>
  );
}

const muted: CSSProperties = { margin: 0, fontSize: 12.5, color: vmTokens.textTertiary };
const textarea: CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  border: `1px solid ${vmTokens.inputBorder}`,
  background: vmTokens.inputBg,
  color: vmTokens.textPrimary,
  fontSize: 13.5,
  lineHeight: 1.5,
  resize: 'vertical',
};
const primary: CSSProperties = {
  padding: '8px 14px',
  borderRadius: 8,
  border: 'none',
  background: vmTokens.gold,
  color: vmTokens.goldOnLight,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};
const ghost: CSSProperties = {
  padding: '8px 14px',
  borderRadius: 8,
  border: `1px solid ${vmTokens.divider}`,
  background: 'transparent',
  color: vmTokens.textPrimary,
  fontSize: 13,
  cursor: 'pointer',
};
