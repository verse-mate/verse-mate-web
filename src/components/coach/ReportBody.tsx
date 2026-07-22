/**
 * Shared full-prose body of a coaching report — the narrative that both the
 * document-style <ReportDetail> and the tap-to-expand <ReportCard> render, so
 * the two presentations never drift apart. It renders everything below a
 * report's score/identity header: Summary & Big Ideas, the full prose
 * feedback (Top Strengths / Areas of Improvement / Recommendations, each
 * falling back to the terse bullets when the pipeline hasn't supplied prose),
 * the PDF-parity pipeline sections (scorecard tables, monologues, key moments,
 * DOK-scored application questions), and the 12 dimensions.
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { vmTokens } from '@/styles/themeStyles';
import {
  type CoachFeedbackPoint,
  type CoachReport,
  type CoachReportSection,
} from '@/services/coachService';
import DimensionRow from './DimensionRow';

// Accents.
const AMBER = '#C2620F';
const BLUE = '#2563A6';
const PURPLE = '#6D28D9';
// Darker body grey than the token default, for readability on dense reports.
const BODY = 'color-mix(in srgb, var(--fg-secondary) 42%, var(--fg-primary))';

export default function ReportBody({ report }: { report: CoachReport }) {
  // Drop the pipeline's "Score composition" section — that content is the ring
  // breakdown / cluster bars now, so it must not render inline as well.
  const sections = (report.sections ?? []).filter(
    (s) => !/^score composition$/i.test((s.title ?? '').trim()),
  );

  return (
    <>
      {/* Summary + Big Ideas — one collapse for both, side by side on wide screens. */}
      {(report.feedback?.headline || report.feedback?.overview?.length || report.bigIdeas.length > 0) && (
        <CollapsibleSection title="Summary & Big Ideas" accent={vmTokens.gold}>
          <div style={summaryGrid}>
            {(report.feedback?.headline || report.feedback?.overview?.length) && (
              <div>
                <p style={subHeading}>Summary</p>
                {report.feedback?.headline && (
                  <p style={{ fontSize: 17, fontWeight: 600, color: vmTokens.textPrimary, lineHeight: 1.55, margin: '0 0 10px' }}>
                    {report.feedback.headline}
                  </p>
                )}
                {report.feedback?.overview?.map((para, i) => (
                  <p key={i} style={proseParagraph}>{para}</p>
                ))}
              </div>
            )}
            {report.bigIdeas.length > 0 && (
              <div>
                <p style={subHeading}>Big Ideas</p>
                <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {report.bigIdeas.map((b, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8, fontSize: 15, color: BODY, lineHeight: 1.55 }}>
                      <span aria-hidden style={{ color: vmTokens.gold, fontWeight: 700, flexShrink: 0 }}>◆</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Full prose feedback. */}
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

      {/* The 12 dimensions as a single tappable list. */}
      {report.dimensions?.length > 0 && (
        <CollapsibleSection title="The 12 Dimensions · tap a row for detail" accent={BLUE}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {report.dimensions.map((d) => (
              <DimensionRow key={d.n} dim={d} />
            ))}
          </div>
        </CollapsibleSection>
      )}
    </>
  );
}

/** A pronounced, accented, collapsible section shell. Open by default; the
 *  header (accent bar + bold title + chevron) toggles the body. */
function CollapsibleSection({
  title,
  accent = vmTokens.gold,
  defaultOpen = true,
  children,
}: {
  title: string;
  accent?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section style={{ marginTop: 22, borderTop: `1px solid ${vmTokens.divider}`, paddingTop: 8 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          background: 'none',
          border: 'none',
          padding: '4px 0',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
          <span style={{ width: 4, height: 22, borderRadius: 2, background: accent, flexShrink: 0 }} />
          <span style={headingText}>{title}</span>
        </span>
        <ChevronDown
          size={20}
          style={{
            color: vmTokens.textTertiary,
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform .15s ease',
          }}
        />
      </button>
      {open && <div style={{ marginTop: 12 }}>{children}</div>}
    </section>
  );
}

/** Dispatch a pipeline section to the right presentation. */
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
  if (/\bapplication questions?\b/i.test(title) && section.bullets?.length) {
    return <ApplicationQuestionsSection section={section} />;
  }
  return <GenericSection section={section} />;
}

/** Scorecard table — one metric per row, zebra-striped with a tinted header
 *  and a colour-coded rating badge, laid out like the PDF's scorecard. */
function ScorecardSection({ section }: { section: CoachReportSection }) {
  const rows = (section.bullets ?? []).map(parseScorecardRow);
  return (
    <CollapsibleSection title={section.title} accent={BLUE}>
      <div style={{ overflowX: 'auto', border: `1px solid ${vmTokens.divider}`, borderRadius: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'color-mix(in srgb, var(--vm-dust) 12%, transparent)' }}>
              <th style={thStyle}>Metric</th>
              <th style={thStyle}>This session</th>
              <th style={{ ...thStyle, whiteSpace: 'nowrap' }}>Target</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                style={{
                  verticalAlign: 'top',
                  background: i % 2 ? 'color-mix(in srgb, var(--vm-dust) 4%, transparent)' : 'transparent',
                }}
              >
                <td style={{ ...tdStyle, fontWeight: 700, color: vmTokens.textPrimary, width: '22%' }}>{r.metric}</td>
                <td style={{ ...tdStyle, color: BODY }}>{r.value || '—'}</td>
                <td style={{ ...tdStyle, color: vmTokens.textTertiary }}>{r.target || '—'}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  {r.rating ? <RatingBadge rating={r.rating} /> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CollapsibleSection>
  );
}

/** Monologues — an intro line plus one card per monologue. */
function MonologuesSection({ section }: { section: CoachReportSection }) {
  return (
    <CollapsibleSection title={section.title} accent={AMBER}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(section.paragraphs ?? []).map((p, i) => {
          if (/^Monologue\b/i.test(p)) {
            const m = p.match(/^(.+?\)):\s+([\s\S]*)$/);
            const lead = m ? m[1] : p;
            const body = m ? m[2] : '';
            return (
              <div key={i} style={cardStyle(AMBER)}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: vmTokens.textPrimary, lineHeight: 1.45 }}>
                  {lead}
                </p>
                {body && <p style={{ ...proseParagraph, margin: '6px 0 0' }}>{body}</p>}
              </div>
            );
          }
          return <p key={i} style={proseParagraph}>{p}</p>;
        })}
      </div>
    </CollapsibleSection>
  );
}

/** Key moments — one card per moment: timestamp chip, bold title, and the
 *  What / Why / Bigger blocks with bold labels. */
function KeyMomentsSection({ section }: { section: CoachReportSection }) {
  return (
    <CollapsibleSection title={section.title} accent={vmTokens.gold}>
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
                      fontSize: 12,
                      fontWeight: 700,
                      color: vmTokens.gold,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {m.timestamp}
                  </span>
                )}
                {head && (
                  <span style={{ fontSize: 15, fontWeight: 700, color: vmTokens.textPrimary, lineHeight: 1.45 }}>
                    {head}
                  </span>
                )}
              </div>
              {rest.map((block, j) => {
                const lm = block.match(/^([A-Za-z][^:]{1,40}):\s+([\s\S]*)$/);
                return (
                  <p key={j} style={{ ...proseParagraph, margin: '7px 0 0' }}>
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
    </CollapsibleSection>
  );
}

/** Application questions — one card per Big-Idea question: a DOK badge, the
 *  question text, and the coach's note. */
function ApplicationQuestionsSection({ section }: { section: CoachReportSection }) {
  const questions = (section.bullets ?? []).map(parseQuestionRow);
  return (
    <CollapsibleSection title={section.title} accent={PURPLE}>
      {section.paragraphs?.map((para, i) => (
        <p key={`p${i}`} style={proseParagraph}>{para}</p>
      ))}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {questions.map((q, i) => {
          const accent = dokColor(q.dok);
          return (
            <div key={i} style={cardStyle(accent)}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 4 }}>
                {q.dok ? (
                  <span
                    style={{
                      flexShrink: 0,
                      padding: '2px 9px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 0.2,
                      whiteSpace: 'nowrap',
                      color: accent,
                      background: `color-mix(in srgb, ${accent} 12%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${accent} 35%, transparent)`,
                    }}
                  >
                    DOK {q.dok}{q.dokDesc ? ` · ${q.dokDesc}` : ''}
                  </span>
                ) : null}
                <span style={{ fontSize: 15, fontWeight: 700, color: vmTokens.textPrimary, lineHeight: 1.45 }}>
                  {q.question}
                </span>
              </div>
              {q.note && <p style={{ ...proseParagraph, margin: 0 }}>{q.note}</p>}
            </div>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}

/** A generic pipeline section: title plus paragraphs / bullets / moments. */
function GenericSection({ section }: { section: CoachReportSection }) {
  return (
    <CollapsibleSection title={section.title} accent={vmTokens.gold}>
      {section.paragraphs?.map((para, i) => (
        <p key={`p${i}`} style={proseParagraph}>{para}</p>
      ))}
      {section.bullets?.length ? (
        <ul style={{ margin: '0 0 8px', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 7 }}>
          {section.bullets.map((b, i) => (
            <li key={`b${i}`} style={{ fontSize: 15, color: BODY, lineHeight: 1.6 }}>{b}</li>
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
                    fontSize: 12,
                    fontWeight: 600,
                    color: vmTokens.gold,
                    fontVariantNumeric: 'tabular-nums',
                    paddingTop: 1,
                  }}
                >
                  {m.timestamp}
                </span>
              )}
              <span style={{ fontSize: 15, color: BODY, lineHeight: 1.6 }}>{m.detail}</span>
            </div>
          ))}
        </div>
      ) : null}
    </CollapsibleSection>
  );
}

/** A feedback section (strengths / growth / recommendations). Prefers the
 *  pipeline's full titled prose; falls back to terse bullets. */
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
      <CollapsibleSection title={label} accent={accent}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {points.map((pt, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${accent}`, paddingLeft: 14 }}>
              {pt.title && (
                <p style={{ margin: '0 0 5px', fontSize: 16, fontWeight: 700, color: vmTokens.textPrimary, lineHeight: 1.4 }}>
                  {pt.title}
                </p>
              )}
              {pt.paragraphs.map((para, j) => (
                <p key={j} style={proseParagraph}>{para}</p>
              ))}
            </div>
          ))}
        </div>
      </CollapsibleSection>
    );
  }

  if (bullets?.length) {
    return (
      <CollapsibleSection title={label} accent={accent}>
        <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
          {bullets.map((t, i) => (
            <li key={i} style={{ display: 'flex', gap: 8, fontSize: 15, color: BODY, lineHeight: 1.6 }}>
              <span aria-hidden style={{ color: accent, fontWeight: 700, flexShrink: 0 }}>•</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </CollapsibleSection>
    );
  }

  return null;
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

function parseQuestionRow(bullet: string): {
  question: string;
  dok: string;
  dokDesc: string;
  note: string;
} {
  const m = bullet
    .trim()
    .match(/^([\s\S]*?)\s+[—-]\s+Level\s+(\d)\s+[—-]\s+([^—]+?)(?:\s+[—-]\s+([\s\S]*))?$/i);
  if (!m) return { question: bullet.trim(), dok: '', dokDesc: '', note: '' };
  return {
    question: m[1].trim(),
    dok: m[2],
    dokDesc: (m[3] || '').trim(),
    note: (m[4] || '').trim(),
  };
}

function dokColor(dok: string): string {
  if (dok === '4') return PURPLE;
  if (dok === '3') return BLUE;
  if (dok === '2') return '#0E7490';
  return vmTokens.textTertiary;
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
        padding: '3px 9px',
        borderRadius: 999,
        fontSize: 11,
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
    padding: '12px 15px',
    borderRadius: 8,
    background: 'color-mix(in srgb, var(--vm-dust) 5%, transparent)',
  };
}

const proseParagraph: React.CSSProperties = {
  margin: '0 0 9px',
  fontSize: 15,
  color: BODY,
  lineHeight: 1.65,
};

const summaryGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '4px 32px',
};

const subHeading: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  color: vmTokens.textTertiary,
};

const headingText: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  letterSpacing: 0.2,
  color: vmTokens.textPrimary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
  color: vmTokens.textSecondary,
  padding: '9px 12px',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  lineHeight: 1.55,
};
