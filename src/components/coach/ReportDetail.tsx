/**
 * Full, document-style rendering of a single coaching report — the desktop
 * counterpart to the compact, tap-to-expand <ReportCard>.
 *
 * Where the mobile card hides the whole report behind a collapsed shell, this
 * lays the writing out as prose: the headline, the full strengths / growth /
 * recommendations, any additional pipeline sections (key moments, timeline…),
 * the cluster breakdown, and the 12 dimensions as tappable lines that expand
 * for detail. Used for the most-recent session on the desktop dashboard /
 * leader views; mobile keeps <ReportCard>.
 */

import { Download } from 'lucide-react';
import { vmTokens } from '@/styles/themeStyles';
import {
  type CoachFeedbackPoint,
  type CoachReport,
  type CoachReportSection,
} from '@/services/coachService';
import { downloadReportPdf } from '@/lib/printReport';
import { CoachCard, ScoreRing, StatusPill } from './CoachUi';
import DimensionRow from './DimensionRow';

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

      {/* Additional pipeline sections — key moments, timeline, etc. */}
      {report.sections?.map((section, i) => (
        <ReportSection key={i} section={section} />
      ))}

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

      {/* The 12 dimensions as tappable lines — collapsed by default, expand
          for the measure, target, and "why this score" rationale. */}
      {report.dimensions?.length > 0 && (
        <>
          <p style={sectionLabel}>The 12 dimensions · tap for detail</p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '10px 32px',
              alignItems: 'start',
            }}
          >
            {report.dimensions.map((d) => (
              <DimensionRow key={d.n} dim={d} />
            ))}
          </div>
        </>
      )}
    </CoachCard>
  );
}

/** A free-form pipeline section (key moments, timeline, …): title plus any of
 *  prose paragraphs, bullets, and timestamped moments. */
function ReportSection({ section }: { section: CoachReportSection }) {
  const hasBody =
    section.paragraphs?.length || section.bullets?.length || section.moments?.length;
  if (!hasBody) return null;
  return (
    <>
      <p style={sectionLabel}>{section.title}</p>
      {section.paragraphs?.map((para, i) => (
        <p key={`p${i}`} style={proseParagraph}>{para}</p>
      ))}
      {section.bullets?.length ? (
        <ul style={{ margin: '0 0 8px', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {section.bullets.map((b, i) => (
            <li key={`b${i}`} style={{ fontSize: 13.5, color: vmTokens.textSecondary, lineHeight: 1.55 }}>{b}</li>
          ))}
        </ul>
      ) : null}
      {section.moments?.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {section.moments.map((m, i) => (
            <div key={`m${i}`} style={{ display: 'flex', gap: 10 }}>
              {m.timestamp && (
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: vmTokens.gold,
                    fontVariantNumeric: 'tabular-nums',
                    paddingTop: 1,
                  }}
                >
                  {m.timestamp}
                </span>
              )}
              <span style={{ fontSize: 13.5, color: vmTokens.textSecondary, lineHeight: 1.55 }}>{m.detail}</span>
            </div>
          ))}
        </div>
      ) : null}
    </>
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
