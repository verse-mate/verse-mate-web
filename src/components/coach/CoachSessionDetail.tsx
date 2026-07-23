/**
 * The "Most recent session" detail block on the coaching dashboard Home:
 * a session header (identity, Download PDF, status + delta, score badge) and a
 * tab bar — Full report · Scorecard · Question coaching · Next steps.
 *
 * Recreated from the design handoff, wired to the real /coach report shape
 * (CoachReport): the mock's /55 letter grade is presented as the live /100
 * composite + status; the full narrative comes from the report's prose
 * feedback, PDF-parity sections (key moments, application questions), 12
 * dimensions, clusters and big ideas.
 */

import { useMemo, useState } from 'react';
import {
  type CoachReport,
  type CoachReportSection,
  pdfDownloadUrl,
} from '@/services/coachService';
import { DIMENSION_INFO } from './dimensionInfo';
import { dt, letterGrade, ratingForScore, statusBand } from './dashboardTheme';

type Tab = 'report' | 'scorecard' | 'questions' | 'nextsteps';

export default function CoachSessionDetail({
  report,
  delta,
  prev,
  label = 'MOST RECENT SESSION',
}: {
  report: CoachReport;
  delta: number | null;
  prev?: CoachReport;
  label?: string;
}) {
  const [tab, setTab] = useState<Tab>('report');
  const pdfHref = pdfDownloadUrl(report.pdfUrl);
  const band = statusBand(report.status);
  const deltaText =
    delta == null ? '' : delta > 0 ? `▲ ${delta} pts` : delta < 0 ? `▼ ${Math.abs(delta)} pts` : 'no change';

  const TABS: { key: Tab; label: string }[] = [
    { key: 'report', label: 'Full report' },
    { key: 'scorecard', label: 'Scorecard' },
    { key: 'questions', label: 'Question coaching' },
    { key: 'nextsteps', label: 'Next steps' },
  ];

  return (
    <div style={{ marginTop: 34, borderTop: `1px solid ${dt.border2}`, paddingTop: 30 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', color: dt.gold, marginBottom: 6 }}>
            {label}
          </div>
          <h2 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 27, margin: '0 0 4px', letterSpacing: '-.01em' }}>
            {report.session}
          </h2>
          <div style={{ fontSize: 14, color: dt.textMuted }}>
            {[report.topic, report.dateLabel].filter(Boolean).join(' · ')}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {pdfHref && (
            <a
              href={pdfHref}
              target="_blank"
              rel="noopener noreferrer"
              download
              data-testid={`coach-report-pdf-${report.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                fontSize: 13,
                fontWeight: 700,
                color: dt.gold2,
                background: dt.goldChip,
                border: `1px solid ${dt.goldChipBorder}`,
                padding: '10px 15px',
                borderRadius: 9,
                textDecoration: 'none',
              }}
            >
              ↓ Download PDF
            </a>
          )}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', color: band.c }}>{band.label}</div>
            {deltaText && <div style={{ fontSize: 12.5, color: dt.textLight }}>{deltaText} vs. last</div>}
          </div>
          <div
            style={{
              width: 74,
              height: 74,
              borderRadius: '50%',
              background: dt.goldChip,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${dt.goldChipBorder}`,
            }}
          >
            <span style={{ fontFamily: dt.serif, fontWeight: 600, fontSize: 26, lineHeight: 1, color: dt.gold2 }}>
              {letterGrade(report.score)}
            </span>
            <span style={{ fontSize: 12, color: dt.gold, fontWeight: 600 }}>{Math.round(report.score)}/100</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, margin: '22px 0 4px', borderBottom: `1px solid ${dt.border2}`, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            data-testid={`coach-tab-${t.key}`}
            style={{
              padding: '11px 16px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              borderBottom: `2px solid ${tab === t.key ? dt.brightGold : 'transparent'}`,
              color: tab === t.key ? dt.textPrimary : dt.textLighter,
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'report' && <FullReport report={report} />}
      {tab === 'scorecard' && <Scorecard report={report} />}
      {tab === 'questions' && <QuestionCoaching report={report} />}
      {tab === 'nextsteps' && <NextSteps report={report} />}
    </div>
  );
}

// ─── Full report ─────────────────────────────────────────────────────────────

function FullReport({ report }: { report: CoachReport }) {
  const pdfHref = pdfDownloadUrl(report.pdfUrl);
  const snapshot = buildSnapshot(report);
  const strengths = feedbackPoints(report.feedback?.strengthsProse, report.feedback?.strengths);
  const improvements = feedbackPoints(report.feedback?.improvementsProse, report.feedback?.improvements);
  const plays = feedbackPoints(report.feedback?.recommendationsProse, report.feedback?.recommendations);
  const moments = useMemo(() => keyMoments(report.sections), [report.sections]);

  return (
    <div style={{ paddingTop: 20 }}>
      {report.feedback?.headline && (
        <p style={{ fontFamily: dt.serif, fontSize: 21, lineHeight: 1.55, color: dt.darkBorder, margin: '0 0 26px' }}>
          {report.feedback.headline}
        </p>
      )}
      {report.feedback?.overview?.map((p, i) => (
        <p key={i} style={{ fontSize: 15, lineHeight: 1.65, color: dt.body, margin: '0 0 14px' }}>
          {p}
        </p>
      ))}

      {/* Snapshot */}
      {snapshot.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            background: dt.border2,
            border: `1px solid ${dt.border2}`,
            borderRadius: 12,
            overflow: 'hidden',
            margin: '20px 0 28px',
          }}
        >
          {snapshot.map((s) => (
            <div key={s.k} style={{ background: dt.innerBg, padding: '14px 16px' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', color: dt.gold, marginBottom: 4 }}>
                {s.k}
              </div>
              <div style={{ fontSize: 13.5, color: dt.darkBorder, lineHeight: 1.4 }}>{s.v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Big ideas */}
      {report.bigIdeas.length > 0 && (
        <>
          <SectionKicker>BIG IDEAS FROM THIS SESSION</SectionKicker>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, margin: '12px 0 30px' }}>
            {report.bigIdeas.map((b, i) => (
              <div key={i} style={{ background: dt.darkBg, color: dt.darkText, borderRadius: 12, padding: '20px 22px' }}>
                <div style={{ fontFamily: dt.serif, fontStyle: 'italic', fontSize: 18, lineHeight: 1.35 }}>“{b}”</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Cluster breakdown */}
      {report.clusters.length > 0 && (
        <>
          <SectionKicker>CLUSTER BREAKDOWN · BASE {report.base.toFixed(1)}</SectionKicker>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, margin: '14px 0 34px' }}>
            {report.clusters.map((c) => {
              const pct = c.scorePct == null ? 0 : c.scorePct;
              return (
                <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 52px', gap: 16, alignItems: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: 14.5 }}>{c.name}</div>
                  <div style={{ height: 9, background: dt.barTrack, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: dt.brightGold }} />
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 14 }}>
                    {c.scorePct == null ? 'N/A' : `${Math.round(c.scorePct)}%`}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <>
          <SectionHeading title="Areas of strength" pill={`Top ${strengths.length}`} pillC={dt.green} pillBg={dt.greenBg} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 38 }}>
            {strengths.map((x, i) => (
              <NumberedCard key={i} n={i + 1} badgeC={dt.green} badgeBg={dt.greenBg} title={x.title} body={x.body} />
            ))}
          </div>
        </>
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <>
          <SectionHeading title="Areas for improvement" pill={`Top ${improvements.length}`} pillC={dt.rust} pillBg={dt.rustBg} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 38 }}>
            {improvements.map((x, i) => (
              <NumberedCard key={i} n={i + 1} badgeC={dt.rust} badgeBg={dt.rustBg} title={x.title} body={x.body} fix={x.fix} />
            ))}
          </div>
        </>
      )}

      {/* Key moments */}
      {moments.length > 0 && (
        <>
          <SectionHeading title="Key moments" pill={`${moments.length} pivots`} pillC={dt.gold} pillBg={dt.goldChip} />
          <p style={{ margin: '0 0 16px', fontSize: 14, color: dt.textLight }}>
            The pivot points that shaped what this group will remember, believe, and do this week.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 38 }}>
            {moments.map((m, i) => (
              <MomentCard key={i} moment={m} />
            ))}
          </div>
        </>
      )}

      {/* Playbook / recommendations */}
      {plays.length > 0 && (
        <>
          <SectionHeading title="This week's playbook" pill={`${plays.length} plays`} pillC={dt.gold2} pillBg={dt.goldChip} />
          <p style={{ margin: '0 0 16px', fontSize: 14, color: dt.textLight }}>
            Concrete, transferable changes for next session — each one testable in a single class.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {plays.map((r, i) => (
              <PlayCard key={i} n={i + 1} title={r.title} body={r.body} />
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: 24, fontSize: 13.5, color: dt.textLight, borderTop: `1px dashed ${dt.dashed}`, paddingTop: 16 }}>
        Full metrics — Score Composition & the appendix (attendance, timeline, talk ratio, engagement, monologues,
        vulnerability, the full dimension scorecard, cross-references, drift log) — are in the downloadable report.{' '}
        {pdfHref ? (
          <a href={pdfHref} target="_blank" rel="noopener noreferrer" download style={{ color: dt.gold, fontWeight: 600 }}>
            Download the full PDF →
          </a>
        ) : null}
      </div>
    </div>
  );
}

// ─── Scorecard ───────────────────────────────────────────────────────────────

function Scorecard({ report }: { report: CoachReport }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!report.dimensions?.length) {
    return <EmptyPanel>No dimension scorecard is available for this session yet.</EmptyPanel>;
  }
  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ fontSize: 12.5, color: dt.textLight, marginBottom: 4 }}>
        Tap any dimension to read the session-specific coaching behind its score.
      </div>
      {report.dimensions.map((d) => {
        const r = ratingForScore(d.score);
        const isOpen = open === d.n;
        const pct = d.score == null ? 0 : (d.score / 5) * 100;
        const desc = DIMENSION_INFO[d.n]?.target ?? '';
        return (
          <div key={d.n} style={{ borderBottom: `1px solid ${dt.rowDivider}` }}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : d.n)}
              data-testid={`coach-dim-${d.n}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 2fr 52px 108px 16px',
                gap: 16,
                alignItems: 'center',
                padding: '13px 4px',
                cursor: 'pointer',
                width: '100%',
                background: 'none',
                border: 'none',
                textAlign: 'left',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: dt.textPrimary }}>{d.name}</div>
                {desc && <div style={{ fontSize: 12.5, color: dt.textLight }}>{desc}</div>}
              </div>
              <div style={{ height: 8, background: dt.barTrack, borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: r.c }} />
              </div>
              <div style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, textAlign: 'right', color: dt.textPrimary }}>
                {d.score == null ? 'N/A' : `${d.score}/5`}
              </div>
              <div
                style={{
                  justifySelf: 'end',
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '.04em',
                  padding: '5px 9px',
                  borderRadius: 6,
                  color: r.c,
                  background: r.bg,
                }}
              >
                {r.label}
              </div>
              <div style={{ textAlign: 'right', color: '#BCAD8E', fontSize: 11 }}>{isOpen ? '▾' : '▸'}</div>
            </button>
            {isOpen && (
              <div style={{ padding: '0 4px 18px' }}>
                <div style={{ background: dt.innerBg, border: `1px solid ${dt.border2}`, borderRadius: 11, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.04em', color: r.c, background: r.bg, padding: '4px 8px', borderRadius: 5 }}>
                      {r.label} · {d.score == null ? 'N/A' : `${d.score}/5`}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: dt.gold }}>COACH FEEDBACK</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: d.note?.trim() ? dt.body : dt.textLight }}>
                    {d.note?.trim() || 'No session-specific coach note recorded for this dimension.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Question coaching ───────────────────────────────────────────────────────

function QuestionCoaching({ report }: { report: CoachReport }) {
  const section = (report.sections ?? []).find(
    (s) => /\bapplication questions?\b/i.test(s.title ?? '') && s.bullets?.length,
  );
  const questions = (section?.bullets ?? []).map(parseQuestionRow);
  if (questions.length === 0) {
    return (
      <EmptyPanel>
        No graded Big-Idea questions were captured for this session. When the pipeline scores the session's
        application questions, they appear here with DOK levels and coaching.
      </EmptyPanel>
    );
  }
  return (
    <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {questions.map((q, i) => {
        const c = dokBand(q.dok);
        return (
          <div key={i} style={{ background: dt.innerBg, border: `1px solid ${dt.border2}`, borderRadius: 11, padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ fontFamily: dt.serif, fontStyle: 'italic', fontSize: 17, lineHeight: 1.35, color: dt.textPrimary }}>
                “{q.question}”
              </div>
              {q.dok && (
                <div style={{ flex: 'none', fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', padding: '5px 9px', borderRadius: 6, color: c.c, background: c.bg }}>
                  DOK {q.dok}
                </div>
              )}
            </div>
            {q.note && (
              <div style={{ fontSize: 13.5, color: dt.textMuted, lineHeight: 1.5, marginTop: 9, borderTop: `1px dashed ${dt.dashed}`, paddingTop: 9 }}>
                {q.note}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Next steps ──────────────────────────────────────────────────────────────

function NextSteps({ report }: { report: CoachReport }) {
  const steps = feedbackPoints(report.feedback?.recommendationsProse, report.feedback?.recommendations).slice(0, 3);
  if (steps.length === 0) {
    return <EmptyPanel>No next steps were captured for this session yet.</EmptyPanel>;
  }
  return (
    <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, background: dt.innerBg, border: `1px solid ${dt.border2}`, borderRadius: 11, padding: '16px 18px', alignItems: 'flex-start' }}>
          <div style={{ fontFamily: dt.serif, fontSize: 26, color: dt.brightGold, lineHeight: 1 }}>
            {String(i + 1).padStart(2, '0')}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 3, color: dt.textPrimary }}>{s.title}</div>
            {s.body && <div style={{ fontSize: 13.5, color: dt.textMuted, lineHeight: 1.5 }}>{s.body}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Shared bits ─────────────────────────────────────────────────────────────

function SectionKicker({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', color: dt.gold }}>{children}</div>;
}

function SectionHeading({ title, pill, pillC, pillBg }: { title: string; pill: string; pillC: string; pillBg: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, margin: '6px 0 15px' }}>
      <h3 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 23, margin: 0 }}>{title}</h3>
      <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.04em', color: pillC, background: pillBg, padding: '4px 10px', borderRadius: 99 }}>
        {pill}
      </span>
    </div>
  );
}

function NumberedCard({
  n,
  badgeC,
  badgeBg,
  title,
  body,
  fix,
}: {
  n: number;
  badgeC: string;
  badgeBg: string;
  title: string;
  body: string;
  fix?: string;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: 16, background: dt.innerBg, border: `1px solid ${dt.border2}`, borderRadius: 13, padding: '18px 22px' }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: badgeBg, color: badgeC, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15 }}>
        {n}
      </div>
      <div>
        {title && <div style={{ fontWeight: 700, fontSize: 16.5, marginBottom: 6, lineHeight: 1.3, color: dt.textPrimary }}>{title}</div>}
        <p style={{ margin: fix ? '0 0 12px' : 0, fontSize: 14.5, lineHeight: 1.65, color: dt.body }}>{body}</p>
        {fix && (
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', background: dt.fill2, borderRadius: 10, padding: '12px 15px' }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: dt.gold, background: '#F0E2C4', padding: '4px 8px', borderRadius: 5, flex: 'none', marginTop: 1 }}>
              FIX
            </span>
            <span style={{ fontSize: 13.5, lineHeight: 1.6, color: dt.body2 }}>{fix}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayCard({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div style={{ background: dt.innerBg, border: `1px solid ${dt.border2}`, borderRadius: 13, padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: body ? 12 : 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: dt.darkBg, color: dt.brightGold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dt.serif, fontWeight: 600, fontSize: 18, flex: 'none' }}>
          {n}
        </div>
        <div style={{ fontWeight: 700, fontSize: 16.5, lineHeight: 1.25, color: dt.textPrimary }}>{title}</div>
      </div>
      {body && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: dt.body }}>{body}</p>}
    </div>
  );
}

function MomentCard({ moment }: { moment: ParsedMoment }) {
  return (
    <div style={{ background: dt.innerBg, border: `1px solid ${dt.border2}`, borderRadius: 13, padding: '22px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: moment.blocks.length ? 15 : 0, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: dt.serif, fontSize: 19, fontWeight: 500, lineHeight: 1.2, color: dt.textPrimary }}>{moment.head}</span>
        {moment.timestamp && (
          <span style={{ fontSize: 11, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: dt.gold, background: dt.goldChip, padding: '4px 9px', borderRadius: 6 }}>
            {moment.timestamp}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {moment.blocks.map((b, i) => {
          const isBigger = /bigger|make it bigger|next time/i.test(b.label);
          return (
            <div
              key={i}
              style={
                isBigger
                  ? { background: dt.greenBg, borderRadius: 10, padding: '13px 16px' }
                  : undefined
              }
            >
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', color: isBigger ? dt.green : dt.textLight, marginBottom: 4, textTransform: 'uppercase' }}>
                {b.label}
              </div>
              <div style={{ fontSize: 14.5, lineHeight: 1.6, color: isBigger ? '#3A5A42' : dt.body }}>{b.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyPanel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingTop: 16 }}>
      <div style={{ fontSize: 14, color: dt.textLight, background: dt.innerBg, border: `1px dashed ${dt.dashed}`, borderRadius: 11, padding: '18px 20px', lineHeight: 1.55 }}>
        {children}
      </div>
    </div>
  );
}

// ─── Data helpers ────────────────────────────────────────────────────────────

interface Point {
  title: string;
  body: string;
  fix?: string;
}

/** Normalize either the pipeline's titled prose or terse bullets to cards. */
function feedbackPoints(
  prose: { title: string; paragraphs: string[] }[] | undefined,
  bullets: string[] | undefined,
): Point[] {
  if (prose?.length) {
    return prose.map((p) => ({
      title: p.title,
      body: (p.paragraphs || []).join('\n\n'),
    }));
  }
  if (bullets?.length) {
    // Terse bullets sometimes read "Title — body"; split on the first em/en dash.
    return bullets.map((b) => {
      const m = b.match(/^(.{3,60}?)\s+[—–-]\s+([\s\S]+)$/);
      return m ? { title: m[1].trim(), body: m[2].trim() } : { title: b.trim(), body: '' };
    });
  }
  return [];
}

function buildSnapshot(report: CoachReport): { k: string; v: string }[] {
  const rows: { k: string; v: string }[] = [];
  if (report.dateLabel) rows.push({ k: 'DATE', v: report.dateLabel });
  if (report.topic) rows.push({ k: 'TOPIC', v: report.topic });
  if (report.duration) rows.push({ k: 'DURATION', v: report.duration });
  rows.push({ k: 'ATTENDEES', v: `${report.attendees}` });
  rows.push({
    k: 'NEWCOMERS',
    v: report.newcomers ? `${report.newcomers} first-timer${report.newcomers === 1 ? '' : 's'}` : 'None this week',
  });
  if (report.session) rows.push({ k: 'SESSION', v: report.session });
  return rows;
}

interface ParsedMoment {
  timestamp?: string;
  head: string;
  blocks: { label: string; text: string }[];
}

/** Pull "Key moments" section(s) into structured cards. Each moment's detail is
 *  a head line plus "Label: body" blocks separated by blank lines (matching the
 *  pipeline's format used by ReportBody). */
function keyMoments(sections: CoachReportSection[] | undefined): ParsedMoment[] {
  const section = (sections ?? []).find((s) => /\bkey moments?\b/i.test(s.title ?? '') && s.moments?.length);
  if (!section?.moments) return [];
  return section.moments.map((m) => {
    const parts = m.detail.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
    const [head, ...rest] = parts;
    const blocks = rest.map((block) => {
      const lm = block.match(/^([A-Za-z][^:]{1,40}):\s+([\s\S]*)$/);
      return lm ? { label: lm[1], text: lm[2] } : { label: '', text: block };
    });
    return { timestamp: m.timestamp, head: head || '', blocks };
  });
}

function parseQuestionRow(bullet: string): { question: string; dok: string; note: string } {
  const m = bullet
    .trim()
    .match(/^([\s\S]*?)\s+[—-]\s+Level\s+(\d)\s+[—-]\s+([^—]+?)(?:\s+[—-]\s+([\s\S]*))?$/i);
  if (!m) return { question: bullet.trim(), dok: '', note: '' };
  return { question: m[1].trim(), dok: m[2], note: (m[4] || '').trim() };
}

function dokBand(dok: string): { c: string; bg: string } {
  if (dok === '4') return { c: dt.purple, bg: dt.purpleBg };
  if (dok === '3') return { c: dt.blue, bg: dt.blueBg };
  if (dok === '2') return { c: dt.green, bg: dt.greenBg };
  return { c: dt.textLight, bg: dt.fill1 };
}
