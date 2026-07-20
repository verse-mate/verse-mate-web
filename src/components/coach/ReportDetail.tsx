/**
 * Full, document-style rendering of a single coaching report — the desktop
 * counterpart to the compact, tap-to-expand <ReportCard>.
 *
 * Where the mobile card hides the whole report behind a collapsed shell, this
 * lays the writing out as prose: a Summary, the full strengths / growth /
 * recommendations, and the pipeline's PDF-parity sections (scorecard tables,
 * monologues, key moments, application questions), each under a bold section
 * heading. The score ring is tappable and reveals the score breakdown; the 12
 * dimensions render as a single tappable list.
 */

import { useState } from 'react';
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

// Amber "attention" accent (also used for the growth-areas rail).
const AMBER = '#C2620F';

export default function ReportDetail({
  report,
  leaderName = '',
  delta = null,
}: {
  report: CoachReport;
  leaderName?: string;
  delta?: number | null;
}) {
  // The score breakdown lives behind the ring now (tap to reveal), so it is
  // no longer duplicated as a standalone "Cluster breakdown" block or an
  // inline "Score composition" section.
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Drop the pipeline's "Score composition" section — that content is the ring
  // breakdown now, so it must not render inline as well.
  const sections = (report.sections ?? []).filter(
    (s) => !/^score composition$/i.test((s.title ?? '').trim()),
  );

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
          <span style={{ fontSize: 11, fontWeight: 600, color: vmTokens.gold }}>
            {showBreakdown ? 'Hide breakdown' : 'Score breakdown'}
          </span>
        </button>
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

      {/* Score breakdown — revealed by tapping the ring. */}
      {showBreakdown && <ScoreBreakdown report={report} />}

      <p style={metaLine}>
        {report.duration} · {report.attendees} attending · {report.newcomers} newcomer
        {report.newcomers === 1 ? '' : 's'}
      </p>

      {/* Summary — headline + the pipeline's overall narrative. */}
      {(report.feedback?.headline || report.feedback?.overview?.length) && (
        <>
          <SectionHeading>Summary</SectionHeading>
          {report.feedback?.headline && (
            <p style={{ fontSize: 16, fontWeight: 600, color: vmTokens.textPrimary, lineHeight: 1.5, margin: '0 0 8px' }}>
              {report.feedback.headline}
            </p>
          )}
          {report.feedback?.overview?.map((para, i) => (
            <p key={i} style={proseParagraph}>{para}</p>
          ))}
        </>
      )}

      {/* Full prose feedback. Each section renders the pipeline's titled
          write-up when available, otherwise the terse one-line bullets. */}
      <ProseSection
        label="Top Strengths"
        accent={vmTokens.statusSuccess}
        points={report.feedback?.strengthsProse}
        bullets={report.feedback?.strengths}
      />
      <ProseSection
        label="Areas of Improvement"
        accent={AMBER}
        points={report.feedback?.improvementsProse}
        bullets={report.feedback?.improvements}
      />
      <ProseSection
        label="Recommendations for Next Session"
        accent={vmTokens.gold}
        points={report.feedback?.recommendationsProse}
        bullets={report.feedback?.recommendations}
      />

      {/* PDF-parity pipeline sections — scorecard tables, monologues, key
          moments, application questions, in order. */}
      {sections.map((section, i) => (
        <ReportSection key={i} section={section} />
      ))}

      {/* Big ideas. */}
      {report.bigIdeas.length > 0 && (
        <>
          <SectionHeading>Big Ideas</SectionHeading>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {report.bigIdeas.map((b, i) => (
              <li key={i} style={{ fontSize: 13.5, color: vmTokens.textSecondary, lineHeight: 1.5 }}>{b}</li>
            ))}
          </ul>
        </>
      )}

      {/* The 12 dimensions as a single tappable list — collapsed by default,
          expand for the measure, target, and "why this score" rationale. */}
      {report.dimensions?.length > 0 && (
        <>
          <SectionHeading>The 12 Dimensions · tap for detail</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {report.dimensions.map((d) => (
              <DimensionRow key={d.n} dim={d} />
            ))}
          </div>
        </>
      )}
    </CoachCard>
  );
}

/** The score composition — how each weighted cluster and the session bonuses
 *  produced the composite. Shown when the score ring is tapped. */
function ScoreBreakdown({ report }: { report: CoachReport }) {
  const bonuses: string[] = [];
  if (report.newcomerBonus) bonuses.push(`Newcomer growth +${report.newcomerBonus}`);
  if (report.sizeBonus) bonuses.push(`Group size +${report.sizeBonus}`);
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
      <p style={{ margin: '0 0 10px', fontSize: 12.5, fontWeight: 700, color: vmTokens.textPrimary }}>
        Score composition
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {report.clusters.map((c) => {
          const pct = c.scorePct == null ? 0 : c.scorePct;
          return (
            <div key={c.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 12.5, color: vmTokens.textSecondary }}>
                  {c.name} <span style={{ color: vmTokens.textTertiary }}>· weight {c.weight}</span>
                </span>
                <span style={{ fontSize: 12, color: vmTokens.textTertiary, fontVariantNumeric: 'tabular-nums' }}>
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
          <BreakdownLine key={b} label={b.replace(/\s\+.*/, '')} value={`+${b.split('+')[1]}`} />
        ))}
        <BreakdownLine label="Session score" value={`${report.score} / 100`} strong />
      </div>
    </div>
  );
}

function BreakdownLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: strong ? 13 : 12.5, fontWeight: strong ? 700 : 500, color: strong ? vmTokens.textPrimary : vmTokens.textSecondary }}>
        {label}
      </span>
      <span style={{ fontSize: strong ? 13 : 12.5, fontWeight: strong ? 700 : 500, color: strong ? vmTokens.textPrimary : vmTokens.textTertiary, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
    </div>
  );
}

/** Dispatch a pipeline section to the right presentation: scorecard → table,
 *  monologues → titled cards, key moments → timestamped cards, otherwise the
 *  generic prose / bullets / moments layout. */
function ReportSection({ section }: { section: CoachReportSection }) {
  const hasBody =
    section.paragraphs?.length || section.bullets?.length || section.moments?.length;
  if (!hasBody) return null;

  const title = (section.title ?? '').trim();
  if (/^scorecard\b/i.test(title) && section.bullets?.length) {
    return <ScorecardSection section={section} />;
  }
  if (/^monologues\b/i.test(title) && section.paragraphs?.length) {
    return <MonologuesSection section={section} />;
  }
  if (/\bkey moments?\b/i.test(title) && section.moments?.length) {
    return <KeyMomentsSection section={section} />;
  }
  return <GenericSection section={section} />;
}

/** Scorecard table — one metric per row: measure · this session · target ·
 *  rating badge — laid out like the PDF's scorecard. */
function ScorecardSection({ section }: { section: CoachReportSection }) {
  const rows = (section.bullets ?? []).map(parseScorecardRow);
  return (
    <>
      <SectionHeading>{section.title}</SectionHeading>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={thStyle}>Metric</th>
              <th style={thStyle}>This session</th>
              <th style={{ ...thStyle, whiteSpace: 'nowrap' }}>Target</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${vmTokens.divider}`, verticalAlign: 'top' }}>
                <td style={{ ...tdStyle, fontWeight: 600, color: vmTokens.textPrimary }}>{r.metric}</td>
                <td style={{ ...tdStyle, color: vmTokens.textSecondary }}>{r.value || '—'}</td>
                <td style={{ ...tdStyle, color: vmTokens.textTertiary }}>{r.target || '—'}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  {r.rating ? <RatingBadge rating={r.rating} /> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/** Monologues — an intro line plus one card per monologue, its lead (name +
 *  timestamp + length) bolded ahead of the fix. */
function MonologuesSection({ section }: { section: CoachReportSection }) {
  return (
    <>
      <SectionHeading>{section.title}</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(section.paragraphs ?? []).map((p, i) => {
          if (/^Monologue\b/i.test(p)) {
            const m = p.match(/^(.+?\)):\s+([\s\S]*)$/);
            const lead = m ? m[1] : p;
            const body = m ? m[2] : '';
            return (
              <div key={i} style={cardStyle(AMBER)}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: vmTokens.textPrimary, lineHeight: 1.4 }}>
                  {lead}
                </p>
                {body && <p style={{ ...proseParagraph, margin: '4px 0 0' }}>{body}</p>}
              </div>
            );
          }
          return <p key={i} style={proseParagraph}>{p}</p>;
        })}
      </div>
    </>
  );
}

/** Key moments — an intro line plus one card per moment: a timestamp chip, a
 *  bold title line, and the What / Why / Bigger blocks with bold labels. */
function KeyMomentsSection({ section }: { section: CoachReportSection }) {
  return (
    <>
      <SectionHeading>{section.title}</SectionHeading>
      {section.paragraphs?.map((para, i) => (
        <p key={`p${i}`} style={proseParagraph}>{para}</p>
      ))}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(section.moments ?? []).map((m, i) => {
          const blocks = m.detail.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
          const [head, ...rest] = blocks;
          return (
            <div key={i} style={cardStyle(vmTokens.gold)}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
                {m.timestamp && (
                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: vmTokens.gold,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {m.timestamp}
                  </span>
                )}
                {head && (
                  <span style={{ fontSize: 14, fontWeight: 700, color: vmTokens.textPrimary, lineHeight: 1.4 }}>
                    {head}
                  </span>
                )}
              </div>
              {rest.map((block, j) => {
                const lm = block.match(/^([A-Za-z][^:]{1,40}):\s+([\s\S]*)$/);
                return (
                  <p key={j} style={{ ...proseParagraph, margin: '6px 0 0' }}>
                    {lm ? (
                      <>
                        <strong style={{ color: vmTokens.textPrimary }}>{lm[1]}:</strong> {lm[2]}
                      </>
                    ) : (
                      block
                    )}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}

/** A generic pipeline section: title plus any of prose paragraphs, bullets,
 *  and timestamped moments. */
function GenericSection({ section }: { section: CoachReportSection }) {
  return (
    <>
      <SectionHeading>{section.title}</SectionHeading>
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
        <SectionHeading>{label}</SectionHeading>
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
        <SectionHeading>{label}</SectionHeading>
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

/** Bold, larger section heading with a divider rule — one visual system for
 *  Summary, Top Strengths, Areas of Improvement, the scorecard tables,
 *  Monologues, Key Moments, Application Questions, Recommendations, etc. */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h4 style={sectionHeading}>{children}</h4>;
}

function parseScorecardRow(bullet: string): {
  metric: string;
  value: string;
  target: string;
  rating: string;
} {
  let rest = bullet.trim();
  let rating = '';
  const rm = rest.match(/[→>]\s*(STRONG|ON TARGET|NEEDS WORK|N\/A)\s*$/i);
  if (rm) {
    rating = rm[1].toUpperCase();
    rest = rest.slice(0, rm.index).trim();
  }
  let target = '';
  const ti = rest.indexOf('(Target:');
  if (ti >= 0) {
    let t = rest.slice(ti + '(Target:'.length).trim();
    if (t.endsWith(')')) t = t.slice(0, -1).trim();
    target = t;
    rest = rest.slice(0, ti).trim();
  }
  const ci = rest.indexOf(': ');
  const metric = ci >= 0 ? rest.slice(0, ci).trim() : rest;
  const value = ci >= 0 ? rest.slice(ci + 2).trim() : '';
  return { metric, value, target, rating };
}

function ratingColor(rating: string): string {
  const r = rating.toUpperCase();
  if (r === 'STRONG') return vmTokens.statusSuccess;
  if (r === 'NEEDS WORK') return vmTokens.statusError;
  if (r === 'ON TARGET') return AMBER;
  return vmTokens.textTertiary; // N/A
}

function RatingBadge({ rating }: { rating: string }) {
  const color = ratingColor(rating);
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: 0.3,
        whiteSpace: 'nowrap',
        color,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
      }}
    >
      {rating}
    </span>
  );
}

function cardStyle(accent: string): React.CSSProperties {
  return {
    borderLeft: `3px solid ${accent}`,
    padding: '10px 14px',
    borderRadius: 8,
    background: 'color-mix(in srgb, var(--vm-dust) 5%, transparent)',
  };
}

const proseParagraph: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: 13.5,
  color: vmTokens.textSecondary,
  lineHeight: 1.6,
};

const metaLine: React.CSSProperties = {
  fontSize: 12.5,
  color: vmTokens.textTertiary,
  margin: '16px 0 0',
};

const sectionHeading: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  letterSpacing: 0.2,
  color: vmTokens.textPrimary,
  margin: '26px 0 12px',
  paddingBottom: 6,
  borderBottom: `2px solid ${vmTokens.divider}`,
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
  color: vmTokens.textTertiary,
  padding: '0 10px 6px 0',
};

const tdStyle: React.CSSProperties = {
  padding: '8px 10px 8px 0',
  lineHeight: 1.5,
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
