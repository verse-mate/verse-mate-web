/**
 * One coaching "feedback document" in the reports list. Collapsed it shows
 * date / session / status / score; expanded (tap the chevron) it renders the
 * SAME full coaching narrative as the document-style <ReportDetail> — Summary
 * & Big Ideas, full-prose strengths / growth areas / recommendations, the
 * pipeline's PDF-parity sections, and the 12 dimensions — via the shared
 * <ReportBody>, plus a compact cluster breakdown, coaching notes, and a
 * per-session PDF download. No Google Docs hop.
 */

import { useState } from 'react';
import { ChevronDown, Download, FileText } from 'lucide-react';
import { vmTokens } from '@/styles/themeStyles';
import { statusColor, type CoachReport } from '@/services/coachService';
import { CoachCard, StatusPill } from './CoachUi';
import ReportBody from './ReportBody';
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

          {/* Compact cluster breakdown — the card's at-a-glance score visual. */}
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

          {/* The full coaching narrative — identical to <ReportDetail>. */}
          <ReportBody report={report} />

          {report.pdfUrl && (
            <a
              href={report.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
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
                textDecoration: 'none',
              }}
            >
              <Download size={15} strokeWidth={2} /> Download PDF
            </a>
          )}

          <SessionNotes report={report} admin={admin} coachId={coachId} leaderName={leaderName} compact />
        </div>
      )}
    </CoachCard>
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
