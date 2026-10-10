import { useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import { vmTokens } from '@/styles/themeStyles';
import { useRubric } from '@/hooks/useRubric';
import { useCoachReportDetail } from '@/hooks/useCoach';
import { statusColor, type CoachReport, type CoachReportSummary } from '@/services/coachService';
import { CoachCard, PipelineCopyTag, StatusPill } from './CoachUi';
import ReportBody from './ReportBody';
import SessionNotes from './SessionNotes';

export default function ReportCard({
  report,
  leaderName = '',
  admin = false,
  coachId,
  held,
}: {
  report: CoachReport | CoachReportSummary;
  held?: boolean;
  leaderName?: string;
  /** When true (admin drill-in) the recording + notes are editable. */
  admin?: boolean;
  /** The leader whose report this is, required for admin edits. */
  coachId?: string;
}) {
  const [open, setOpen] = useState(false);
  const { rubric } = useRubric();
  const bandLabels = (rubric?.statusBands ?? []).map((b) => b.label);
  const color = statusColor(report.status, bandLabels);

  return (
    <CoachCard testId={`coach-report-${report.id}`} style={{ padding: 0, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          padding: 14,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            display: 'grid',
            placeItems: 'center',
            background: `color-mix(in srgb, ${color} 14%, transparent)`,
            color,
            flexShrink: 0,
          }}
        >
          <FileText size={20} strokeWidth={1.75} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: vmTokens.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {report.dateLabel}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: vmTokens.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {report.session}
          </p>
          <PipelineCopyTag reportId={report.id} held={held} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: vmTokens.textPrimary, lineHeight: 1 }}>
            {Math.round(report.score)}
          </span>
          <StatusPill status={report.status} emoji={report.statusEmoji} size="sm" />
        </div>
        <ChevronDown
          size={18}
          style={{ color: vmTokens.textTertiary, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
        />
      </button>

      {open &&
        ('clusters' in report ? (
          <ExpandedReport report={report} admin={admin} coachId={coachId} leaderName={leaderName} />
        ) : (
          <FetchedReport id={report.id} admin={admin} coachId={coachId} leaderName={leaderName} />
        ))}
    </CoachCard>
  );
}

type BodyProps = { admin: boolean; coachId?: string; leaderName: string };

function FetchedReport({ id, ...props }: BodyProps & { id: string }) {
  const detail = useCoachReportDetail(id, props.coachId);
  if (!detail.data) {
    return (
      <p style={{ ...metaLine, padding: '0 14px 16px' }}>
        {detail.isLoading ? 'Loading the report…' : 'Could not load this report.'}
      </p>
    );
  }
  return <ExpandedReport report={detail.data} {...props} />;
}

function ExpandedReport({ report, admin, coachId, leaderName }: BodyProps & { report: CoachReport }) {
  return (
    <div style={{ padding: '0 14px 16px', borderTop: `1px solid ${vmTokens.divider}` }}>
      <p style={metaLine}>
        {report.duration} · {report.attendees === null ? 'attendance not recorded' : `${report.attendees} attending`} · {report.newcomers} newcomer
        {report.newcomers === 1 ? '' : 's'}
      </p>

      <p style={sectionLabel}>Cluster breakdown</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {report.clusters.map((c) => {
          const pct = c.scorePct == null ? 0 : c.scorePct;
          return (
            <div key={c.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 12, color: vmTokens.textSecondary }}>{c.name}</span>
                <span style={{ fontSize: 12, color: vmTokens.textTertiary }}>
                  {c.scorePct == null ? 'N/A' : `${c.scorePct}%`} · {c.contribution.toFixed(1)} pts
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: vmTokens.divider, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: vmTokens.gold, borderRadius: 3 }} />
              </div>
            </div>
          );
        })}
      </div>

      <ReportBody report={report} />

      <SessionNotes report={report} admin={admin} coachId={coachId} leaderName={leaderName} compact />
    </div>
  );
}

const metaLine: React.CSSProperties = {
  fontSize: 12,
  color: vmTokens.textTertiary,
  margin: '12px 0 4px',
};

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
  color: vmTokens.textTertiary,
  margin: '14px 0 8px',
};
