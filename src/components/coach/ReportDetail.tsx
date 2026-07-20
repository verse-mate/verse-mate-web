/**
 * Full, document-style rendering of a single coaching report — the desktop
 * counterpart to the compact, tap-to-expand <ReportCard>.
 *
 * Where the mobile card hides most of the writing behind a collapsed shell and
 * per-dimension taps, this lays the whole report out as prose: the headline,
 * the full strengths / growth / recommendations, the cluster breakdown, and —
 * critically — every dimension's "what it measures", its target, AND the
 * coach's "why this score" rationale, all inline. Nothing is truncated or
 * gated. Used for the most-recent session on the desktop dashboard / leader
 * views; mobile keeps <ReportCard>.
 */

import { Download } from 'lucide-react';
import { vmTokens } from '@/styles/themeStyles';
import { type CoachDimension, type CoachFeedbackPoint, type CoachReport } from '@/services/coachService';
import { downloadReportPdf } from '@/lib/printReport';
import { DIMENSION_INFO, scoreBand } from './dimensionInfo';
import { CoachCard, ScoreRing, StatusPill } from './CoachUi';

export default function ReportDetail({
  report,
  leaderName = '',
  delta = null,
}: {
  report: CoachReport;
  leaderName?: string;
  delta?: number | null;
}) {
  return (
    <CoachCard testId={`coach-report-detail-${report.id}`} style={{ padding: 24 }}>
      {/* Header: score + session identity */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <ScoreRing value={report.score} status={report.status} diameter={104} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: vmTokens.textPrimary, lineHeight: 1.25 }}>
            {report.session}
          </h3>
          <p style={{ margin: '4px 0 10px', fontSize: 13.5, color: vmTokens.textTertiary }}>
            {report.dateLabel} · {report.topic}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <StatusPill status={report.status} emoji={report.statusEmoji} />
            {delta !== null && (
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: delta >= 0 ? vmTokens.statusSuccess : vmTokens.statusError,
                }}
              >
                {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)} vs. prior
              </span>
            )}
            <button
              onClick={() => downloadReportPdf(report, leaderName)}
              data-testid={`coach-report-pdf-${report.id}`}
              style={pdfBtn}
            >
              <Download size={15} strokeWidth={2} /> Download PDF
            </button>
          </div>
        </div>
      </div>

      <p style={metaLine}>
        {report.duration} · {report.attendees} attending · {report.newcomers} newcomer
        {report.newcomers === 1 ? '' : 's'}
      </p>

      {report.feedback?.headline && (
        <p style={{ fontSize: 16, fontWeight: 600, color: vmTokens.textPrimary, lineHeight: 1.5, margin: '14px 0 4px' }}>
          {report.feedback.headline}
        </p>
      )}

      {/* Overall narrative straight from the pipeline (when present). */}
      {report.feedback?.overview?.length ? (
        <div style={{ marginTop: 8 }}>
          {report.feedback.overview.map((para, i) => (
            <p key={i} style={proseParagraph}>{para}</p>
          ))}
        </div>
      ) : null}

      {/* Full prose feedback. Each section renders the pipeline's titled
          write-up when available, otherwise the terse one-line bullets. */}
      <ProseSection
        label="Top strengths"
        accent={vmTokens.statusSuccess}
        points={report.feedback?.strengthsProse}
        bullets={report.feedback?.strengths}
      />
      <ProseSection
        label="Growth areas"
        accent="#C2620F"
        points={report.feedback?.improvementsProse}
        bullets={report.feedback?.improvements}
      />
      <ProseSection
        label="Recommendations for next session"
        accent={vmTokens.gold}
        points={report.feedback?.recommendationsProse}
        bullets={report.feedback?.recommendations}
      />

      {/* Cluster breakdown + big ideas, side-by-side on wide screens. */}
      <div style={proseGrid}>
        <div>
          <p style={sectionLabel}>Cluster breakdown</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {report.clusters.map((c) => {
              const pct = c.scorePct == null ? 0 : c.scorePct;
              return (
                <div key={c.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12.5, color: vmTokens.textSecondary }}>{c.name}</span>
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
        </div>

        {report.bigIdeas.length > 0 && (
          <div>
            <p style={sectionLabel}>Big ideas</p>
            <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {report.bigIdeas.map((b, i) => (
                <li key={i} style={{ fontSize: 13.5, color: vmTokens.textSecondary, lineHeight: 1.5 }}>{b}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* All 12 dimensions, fully expanded — measure, target, and rationale. */}
      {report.dimensions?.length > 0 && (
        <>
          <p style={sectionLabel}>The 12 dimensions</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
            {report.dimensions.map((d) => (
              <DimensionDetail key={d.n} dim={d} />
            ))}
          </div>
        </>
      )}
    </CoachCard>
  );
}

function DimensionDetail({ dim }: { dim: CoachDimension }) {
  const na = dim.score == null;
  const info = DIMENSION_INFO[dim.n];
  const pct = na ? 0 : ((dim.score as number) / 5) * 100;
  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: 12,
        background: vmTokens.pageBg,
        border: `1px solid ${vmTokens.divider}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: vmTokens.textPrimary }}>
          {dim.n}. {dim.name}
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: vmTokens.textPrimary, flexShrink: 0 }}>
          {na ? 'N/A' : `${dim.score}/5`}
          {!na && info ? ` · ${scoreBand(dim.score)}` : ''}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: vmTokens.divider, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: vmTokens.gold, borderRadius: 3 }} />
      </div>
      {info && (
        <>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: vmTokens.gold }}>
            {info.cluster} · weight {info.clusterWeight}
          </p>
          <p style={{ margin: '5px 0 0', fontSize: 12.5, color: vmTokens.textSecondary, lineHeight: 1.5 }}>{info.what}</p>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: vmTokens.textTertiary }}>
            <span style={{ fontWeight: 600 }}>Target:</span> {info.target}
          </p>
        </>
      )}
      {dim.note && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${vmTokens.divider}` }}>
          <p style={{ margin: '0 0 4px', fontSize: 10.5, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', color: vmTokens.gold }}>
            Why this score
          </p>
          <p style={{ margin: 0, fontSize: 12.5, color: vmTokens.textSecondary, lineHeight: 1.55 }}>{dim.note}</p>
        </div>
      )}
    </div>
  );
}

/** A feedback section (strengths / growth / recommendations). Prefers the
 *  pipeline's full titled prose; falls back to the terse bullets when a report
 *  predates prose export. Renders nothing when neither is available. */
function ProseSection({
  label,
  accent,
  points,
  bullets,
}: {
  label: string;
  accent: string;
  points?: CoachFeedbackPoint[];
  bullets?: string[];
}) {
  if (points?.length) {
    return (
      <>
        <p style={sectionLabel}>{label}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {points.map((pt, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${accent}`, paddingLeft: 14 }}>
              {pt.title && (
                <p style={{ margin: '0 0 4px', fontSize: 14.5, fontWeight: 700, color: vmTokens.textPrimary, lineHeight: 1.4 }}>
                  {pt.title}
                </p>
              )}
              {pt.paragraphs.map((para, j) => (
                <p key={j} style={proseParagraph}>{para}</p>
              ))}
            </div>
          ))}
        </div>
      </>
    );
  }

  if (bullets?.length) {
    return (
      <>
        <p style={sectionLabel}>{label}</p>
        <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {bullets.map((t, i) => (
            <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13.5, color: vmTokens.textSecondary, lineHeight: 1.55 }}>
              <span aria-hidden style={{ color: accent, fontWeight: 700, flexShrink: 0 }}>•</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return null;
}

const proseParagraph: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: 13.5,
  color: vmTokens.textSecondary,
  lineHeight: 1.6,
};

const proseGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '4px 32px',
  marginTop: 10,
};

const metaLine: React.CSSProperties = {
  fontSize: 12.5,
  color: vmTokens.textTertiary,
  margin: '16px 0 0',
};

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
  color: vmTokens.textTertiary,
  margin: '18px 0 8px',
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
};
