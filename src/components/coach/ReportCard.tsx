/**
 * One coaching "feedback document" in the reports list. Collapsed it shows
 * date / session / status / score; expanded it renders the coaching feedback
 * directly on the page (headline, strengths, growth areas, recommendations),
 * the 4-cluster breakdown, and big ideas — plus a per-session PDF download.
 * No Google Docs hop.
 */

import { useState } from 'react';
import { ChevronDown, Download, FileText } from 'lucide-react';
import { vmTokens } from '@/styles/themeStyles';
import { statusColor, type CoachReport } from '@/services/coachService';
import { downloadReportPdf } from '@/lib/printReport';
import { CoachCard, StatusPill } from './CoachUi';
import DimensionRow from './DimensionRow';
import SessionNotes from './SessionNotes';

export default function ReportCard({
  report,
  leaderName = '',
  admin = false,
  coachId,
}: {
  report: CoachReport;
  leaderName?: string;
  /** When true (admin drill-in) the recording + notes are editable. */
  admin?: boolean;
  /** The leader whose report this is — required for admin edits. */
  coachId?: string;
}) {
  const [open, setOpen] = useState(false);
  const color = statusColor(report.status);

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

      {open && (
        <div style={{ padding: '0 14px 16px', borderTop: `1px solid ${vmTokens.divider}` }}>
          <p style={metaLine}>
            {report.duration} · {report.attendees} attending · {report.newcomers} newcomer
            {report.newcomers === 1 ? '' : 's'}
          </p>

          {report.feedback?.headline && (
            <p style={{ fontSize: 14, fontWeight: 600, color: vmTokens.textPrimary, lineHeight: 1.45, margin: '10px 0 2px' }}>
              {report.feedback.headline}
            </p>
          )}

          {report.feedback?.strengths?.length > 0 && (
            <FeedbackList label="Top strengths" items={report.feedback.strengths} accent={vmTokens.statusSuccess} />
          )}
          {report.feedback?.improvements?.length > 0 && (
            <FeedbackList label="Growth areas" items={report.feedback.improvements} accent="#C2620F" />
          )}
          {report.feedback?.recommendations?.length > 0 && (
            <FeedbackList label="Recommendations for next session" items={report.feedback.recommendations} accent={vmTokens.gold} />
          )}

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

          {report.dimensions?.length > 0 && (
            <>
              <p style={sectionLabel}>12 dimensions · tap for detail</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {report.dimensions.map((d) => (
                  <DimensionRow key={d.n} dim={d} />
                ))}
              </div>
            </>
          )}

          {report.bigIdeas.length > 0 && (
            <>
              <p style={sectionLabel}>Big ideas</p>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {report.bigIdeas.map((b, i) => (
                  <li key={i} style={{ fontSize: 13, color: vmTokens.textSecondary, lineHeight: 1.4 }}>{b}</li>
                ))}
              </ul>
            </>
          )}

          <button
            onClick={() => downloadReportPdf(report, leaderName)}
            data-testid={`coach-report-pdf-${report.id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 16,
              padding: '8px 14px',
              borderRadius: 9,
              border: `1px solid ${vmTokens.gold}`,
              background: 'transparent',
              color: vmTokens.gold,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Download size={15} strokeWidth={2} /> Download PDF
          </button>

          <SessionNotes report={report} admin={admin} coachId={coachId} leaderName={leaderName} compact />
        </div>
      )}
    </CoachCard>
  );
}

function FeedbackList({ label, items, accent }: { label: string; items: string[]; accent: string }) {
  return (
    <>
      <p style={sectionLabel}>{label}</p>
      <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((t, i) => (
          <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: vmTokens.textSecondary, lineHeight: 1.45 }}>
            <span aria-hidden style={{ color: accent, fontWeight: 700, flexShrink: 0 }}>•</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </>
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
