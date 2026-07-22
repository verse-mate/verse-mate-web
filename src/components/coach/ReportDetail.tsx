/**
 * Full, document-style rendering of a single coaching report — the desktop
 * counterpart to the compact, tap-to-expand <ReportCard>.
 *
 * The score/identity header (tappable score ring → breakdown) and the session
 * notes live here; the coaching narrative below — Summary & Big Ideas, the
 * full prose feedback, the pipeline's PDF-parity sections, and the 12
 * dimensions — is rendered by the shared <ReportBody>, so the expanded card
 * and this document view stay identical.
 */

import { useState } from 'react';
import { Download } from 'lucide-react';
import { vmTokens } from '@/styles/themeStyles';
import { type CoachReport } from '@/services/coachService';
import { CoachCard, ScoreRing, StatusPill } from './CoachUi';
import ReportBody from './ReportBody';
import SessionNotes from './SessionNotes';

// Darker body grey than the token default — matches the shared <ReportBody>.
const BODY = 'color-mix(in srgb, var(--fg-secondary) 42%, var(--fg-primary))';

export default function ReportDetail({
  report,
  leaderName = '',
  delta = null,
  admin = false,
  coachId,
}: {
  report: CoachReport;
  leaderName?: string;
  delta?: number | null;
  /** When true (admin drill-in), the recording link + notes are editable. */
  admin?: boolean;
  /** The leader whose report this is — required for admin edits. */
  coachId?: string;
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <CoachCard testId={`coach-report-detail-${report.id}`} style={{ padding: 24 }}>
      {/* Header: score + session identity */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setShowBreakdown((v) => !v)}
          aria-expanded={showBreakdown}
          data-testid={`coach-score-toggle-${report.id}`}
          title="Tap for score breakdown"
          style={{
            border: 'none',
            background: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <ScoreRing value={report.score} status={report.status} diameter={104} />
          <span style={{ fontSize: 12, fontWeight: 600, color: vmTokens.gold }}>
            {showBreakdown ? 'Hide breakdown' : 'Score breakdown'}
          </span>
        </button>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: vmTokens.textPrimary, lineHeight: 1.25 }}>
            {report.session}
          </h3>
          <p style={{ margin: '5px 0 10px', fontSize: 14.5, color: vmTokens.textSecondary }}>
            {report.dateLabel} · {report.topic}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <StatusPill status={report.status} emoji={report.statusEmoji} />
            {delta !== null && (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: delta >= 0 ? vmTokens.statusSuccess : vmTokens.statusError,
                }}
              >
                {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)} vs. prior
              </span>
            )}
            {report.pdfUrl && (
              <a
                href={report.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`coach-report-pdf-${report.id}`}
                style={pdfBtn}
              >
                <Download size={15} strokeWidth={2} /> Download PDF
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Score breakdown — revealed by tapping the ring. */}
      {showBreakdown && <ScoreBreakdown report={report} />}

      <p style={metaLine}>
        {report.duration} · {report.attendees} attending · {report.newcomers} newcomer
        {report.newcomers === 1 ? '' : 's'}
      </p>

      {/* Recording link + coaching notes — editable for admins, read-only for
          the leader. */}
      <SessionNotes report={report} admin={admin} coachId={coachId} leaderName={leaderName} />

      {/* The coaching narrative — shared with the expanded <ReportCard>. */}
      <ReportBody report={report} />
    </CoachCard>
  );
}

/** The score composition — shown when the score ring is tapped. */
function ScoreBreakdown({ report }: { report: CoachReport }) {
  const bonuses: { label: string; value: number }[] = [];
  if (report.newcomerBonus) bonuses.push({ label: 'Newcomer growth', value: report.newcomerBonus });
  if (report.sizeBonus) bonuses.push({ label: 'Group size', value: report.sizeBonus });
  return (
    <div
      data-testid={`coach-score-breakdown-${report.id}`}
      style={{
        marginTop: 14,
        padding: '14px 16px',
        borderRadius: 12,
        border: `1px solid ${vmTokens.divider}`,
        background: 'color-mix(in srgb, var(--vm-dust) 6%, transparent)',
      }}
    >
      <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: vmTokens.textPrimary }}>
        Score composition
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {report.clusters.map((c) => {
          const pct = c.scorePct == null ? 0 : c.scorePct;
          return (
            <div key={c.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 13, color: BODY }}>
                  {c.name} <span style={{ color: vmTokens.textTertiary }}>· weight {c.weight}</span>
                </span>
                <span style={{ fontSize: 12.5, color: vmTokens.textTertiary, fontVariantNumeric: 'tabular-nums' }}>
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
      <div
        style={{
          marginTop: 12,
          paddingTop: 10,
          borderTop: `1px solid ${vmTokens.divider}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <BreakdownLine label="Base (clusters)" value={`${report.base.toFixed(1)} / 100`} />
        {bonuses.map((b) => (
          <BreakdownLine key={b.label} label={b.label} value={`+${b.value}`} />
        ))}
        <BreakdownLine label="Session score" value={`${report.score} / 100`} strong />
      </div>
    </div>
  );
}

function BreakdownLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: strong ? 14 : 13, fontWeight: strong ? 700 : 500, color: strong ? vmTokens.textPrimary : BODY }}>
        {label}
      </span>
      <span style={{ fontSize: strong ? 14 : 13, fontWeight: strong ? 700 : 500, color: strong ? vmTokens.textPrimary : vmTokens.textTertiary, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
    </div>
  );
}

const metaLine: React.CSSProperties = {
  fontSize: 13.5,
  color: vmTokens.textTertiary,
  margin: '16px 0 0',
};

const pdfBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '7px 13px',
  borderRadius: 9,
  border: `1px solid ${vmTokens.gold}`,
  background: 'transparent',
  color: vmTokens.gold,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
};
