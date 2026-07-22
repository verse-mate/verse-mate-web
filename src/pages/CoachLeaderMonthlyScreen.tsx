/**
 * Per-leader monthly summary (full parity with the individual monthly PDF).
 *
 * Two modes, one screen:
 *   - a leader viewing their OWN monthly     → /coach/monthly-summary
 *     (no :coachId param → useMyMonthlySummary)
 *   - an admin viewing a leader's monthly    → /coach/leader/:coachId/monthly
 *     (:coachId param → useLeaderMonthlySummary)
 *
 * All content (tables + prose) is generated once by the coaching pipeline and
 * passed straight through the backend, so this reads the same as the PDF.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import ScreenHeader from '@/components/ScreenHeader';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { vmTokens } from '@/styles/themeStyles';
import { useMyMonthlySummary, useLeaderMonthlySummary, coachState } from '@/hooks/useCoach';
import { CoachCard, CoachStateBoundary, SectionLabel, StatusPill } from '@/components/coach/CoachUi';
import type { LeaderMonthlySummary } from '@/services/coachService';

export default function CoachLeaderMonthlyScreen() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { coachId } = useParams();
  const admin = !!coachId;
  const [month, setMonth] = useState(currentMonth());

  const selfQuery = useMyMonthlySummary(admin ? '' : month);
  const adminQuery = useLeaderMonthlySummary(coachId ?? '', admin ? month : '');
  const query = admin ? adminQuery : selfQuery;
  const state = coachState(query);
  const data = state.data;
  const summary = data?.summary ?? null;

  const [knownMonths, setKnownMonths] = useState<string[]>([]);
  const availableMonths = data?.availableMonths;
  useEffect(() => {
    if (availableMonths && availableMonths.length > 0) setKnownMonths(availableMonths);
  }, [availableMonths]);

  // Land on the most recent completed month when the current month has no
  // summary yet (only fires for the initial default month).
  useEffect(() => {
    if (data && !data.summary && knownMonths.length > 0 && !knownMonths.includes(month)) {
      setMonth(knownMonths[0]);
    }
  }, [data, knownMonths, month]);

  const idx = knownMonths.indexOf(month);
  const newerMonth = idx > 0 ? knownMonths[idx - 1] : null;
  const olderMonth = idx >= 0 && idx < knownMonths.length - 1 ? knownMonths[idx + 1] : null;

  const title = admin ? `${data?.profile.name ?? 'Leader'} — Monthly` : 'Monthly summary';

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader
        title={title}
        onBack={() => navigate(admin ? `/coach/leader/${coachId}` : '/coach')}
        backTestId="coach-leader-monthly-back-button"
      />

      <div
        data-testid="coach-leader-monthly"
        style={{ flex: 1, overflowY: 'auto', borderTop: `1px solid ${vmTokens.divider}` }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            padding: isDesktop ? 24 : 16,
            maxWidth: 1000,
            margin: '0 auto',
          }}
        >
          {/* Month selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BarChart3 size={20} style={{ color: vmTokens.gold }} strokeWidth={1.9} />
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: vmTokens.textPrimary }}>
                {summary?.monthLabel ?? labelFor(month)}
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {knownMonths.length > 0 && (
                <select
                  value={knownMonths.includes(month) ? month : ''}
                  onChange={(e) => setMonth(e.target.value)}
                  aria-label="Select month"
                  data-testid="coach-leader-monthly-select"
                  style={monthSelect}
                >
                  {!knownMonths.includes(month) && (
                    <option value="" disabled>
                      {labelFor(month)}
                    </option>
                  )}
                  {knownMonths.map((m) => (
                    <option key={m} value={m}>
                      {labelFor(m)}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={() => olderMonth && setMonth(olderMonth)}
                aria-label="Previous month"
                disabled={!olderMonth}
                style={{ ...navBtn, opacity: olderMonth ? 1 : 0.4, cursor: olderMonth ? 'pointer' : 'default' }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => newerMonth && setMonth(newerMonth)}
                aria-label="Next month"
                disabled={!newerMonth}
                style={{ ...navBtn, opacity: newerMonth ? 1 : 0.4, cursor: newerMonth ? 'pointer' : 'default' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <CoachStateBoundary loading={state.loading} authError={state.authError} error={state.error} onRetry={() => query.refetch()}>
            {data && !summary ? (
              <CoachCard style={{ padding: 24 }}>
                <p style={{ margin: 0, fontSize: 14.5, color: vmTokens.textTertiary }}>
                  No monthly summary for {labelFor(month)}.
                </p>
              </CoachCard>
            ) : summary ? (
              <Summary summary={summary} isDesktop={isDesktop} />
            ) : null}
          </CoachStateBoundary>
        </div>
      </div>
    </div>
  );
}

function Summary({ summary: s, isDesktop }: { summary: LeaderMonthlySummary; isDesktop: boolean }) {
  return (
    <>
      {/* Headline */}
      <CoachCard style={{ padding: isDesktop ? 24 : 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 40, fontWeight: 800, color: vmTokens.textPrimary, lineHeight: 1 }}>
            {s.composite.toFixed(1)}
          </span>
          <span style={{ fontSize: 16, color: vmTokens.textTertiary }}>/ 100</span>
          <StatusPill status={s.status.label} emoji={s.status.emoji} />
        </div>
        <p style={{ margin: '10px 0 0', fontSize: 13.5, color: vmTokens.textSecondary }}>
          {s.sessionsCount} session{s.sessionsCount === 1 ? '' : 's'} in {s.monthLabel}
          {s.delta != null && s.priorComposite != null ? (
            <>
              {' · '}
              <span style={{ fontWeight: 600, color: s.delta >= 0 ? vmTokens.statusSuccess : vmTokens.statusError }}>
                {s.delta >= 0 ? '▲' : '▼'} {Math.abs(s.delta).toFixed(1)}
              </span>{' '}
              vs. {s.priorMonthLabel} (~{Math.round(s.priorComposite)})
            </>
          ) : null}
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {(['tc', 'bm', 'ep', 'br'] as const).map((k) => (
            <ClusterChip key={k} label={CLUSTER_SHORT[k]} pct={s.clusterAvg[k]} />
          ))}
        </div>
      </CoachCard>

      {/* Month at a Glance */}
      <Section label="Month at a glance">
        <ScrollTable>
          <thead>
            <tr style={theadRow}>
              <th style={{ ...th, textAlign: 'left' }}>Date</th>
              <th style={{ ...th, textAlign: 'left' }}>Session</th>
              <th style={th}>BM%</th>
              <th style={th}>TC%</th>
              <th style={th}>EP%</th>
              <th style={th}>BR%</th>
              <th style={th}>Composite</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {s.glance.rows.map((r, i) => (
              <tr key={`${r.date}-${r.session}`} style={zebra(i)}>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{r.date.slice(5)}</td>
                <td style={td}>{r.session}</td>
                <PctCell v={r.bm} />
                <PctCell v={r.tc} />
                <PctCell v={r.ep} />
                <PctCell v={r.br} />
                <td style={{ ...td, textAlign: 'center', fontWeight: 700, color: vmTokens.textPrimary }}>{r.composite.toFixed(1)}</td>
                <td style={{ ...td, textAlign: 'center' }}>{r.status}</td>
              </tr>
            ))}
            <tr style={{ background: 'color-mix(in srgb, var(--vm-dust) 12%, transparent)' }}>
              <td style={{ ...td, fontWeight: 800 }} colSpan={2}>
                Monthly average
              </td>
              <PctCell v={s.glance.avg.bm} bold />
              <PctCell v={s.glance.avg.tc} bold />
              <PctCell v={s.glance.avg.ep} bold />
              <PctCell v={s.glance.avg.br} bold />
              <td style={{ ...td, textAlign: 'center', fontWeight: 800, color: vmTokens.textPrimary }}>{s.glance.avg.composite.toFixed(1)}</td>
              <td style={{ ...td, textAlign: 'center', fontWeight: 700 }}>{s.glance.avg.status}</td>
            </tr>
          </tbody>
        </ScrollTable>
      </Section>

      {/* Score Trajectory */}
      {s.trajectory.length > 1 ? (
        <Section label="Score trajectory">
          <ScrollTable>
            <thead>
              <tr style={theadRow}>
                <th style={{ ...th, textAlign: 'left' }}>Date</th>
                <th style={{ ...th, textAlign: 'left' }}>Session</th>
                <th style={th}>Composite</th>
                <th style={th}>Δ vs prior</th>
              </tr>
            </thead>
            <tbody>
              {s.trajectory.map((t, i) => (
                <tr key={`${t.date}-${t.session}`} style={zebra(i)}>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{t.date.slice(5)}</td>
                  <td style={td}>{t.session}</td>
                  <td style={{ ...td, textAlign: 'center', fontWeight: 700, color: vmTokens.textPrimary }}>{t.composite.toFixed(1)}</td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    {t.delta == null ? (
                      <span style={{ color: vmTokens.textTertiary }}>—</span>
                    ) : (
                      <span style={{ fontWeight: 600, color: t.delta >= 0 ? vmTokens.statusSuccess : vmTokens.statusError }}>
                        {t.delta >= 0 ? '+' : ''}
                        {t.delta.toFixed(1)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </ScrollTable>
        </Section>
      ) : null}

      {/* Cluster Deep Dive */}
      <Section label="Cluster deep dive">
        <CoachCard style={{ padding: isDesktop ? 20 : 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {s.clusters.map((c) => (
            <div key={c.key} style={{ borderTop: `1px solid ${vmTokens.divider}`, paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, color: vmTokens.textPrimary }}>
                  {c.name} <span style={{ color: vmTokens.textTertiary, fontWeight: 400 }}>· weight {c.weight}</span>
                </span>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: heatText(c.avgPct) }}>
                  {c.avgPct == null ? 'N/A' : `${c.avgPct}%`} {c.statusLabel ? `· ${c.statusLabel}` : ''}
                </span>
              </div>
              {c.strongestDim && c.weakestDim ? (
                <p style={{ margin: '6px 0 0', fontSize: 12.5, color: vmTokens.textTertiary }}>
                  Strongest: {c.strongestDim.name} ({c.strongestDim.val.toFixed(1)}/5) · Weakest: {c.weakestDim.name} ({c.weakestDim.val.toFixed(1)}/5)
                </p>
              ) : null}
              <p style={{ margin: '6px 0 0', fontSize: 13.5, lineHeight: 1.55, color: vmTokens.textSecondary }}>{c.insight}</p>
            </div>
          ))}
        </CoachCard>
      </Section>

      {/* Strengths + Growth */}
      {s.strengths.length > 0 ? (
        <Section label="Key strengths">
          <BulletCard items={s.strengths} accent={vmTokens.statusSuccess} isDesktop={isDesktop} />
        </Section>
      ) : null}
      {s.growth.length > 0 ? (
        <Section label="Key growth areas">
          <BulletCard items={s.growth} accent="#C2620F" isDesktop={isDesktop} />
        </Section>
      ) : null}

      {/* Trends & Patterns */}
      {s.trends.length > 0 ? (
        <Section label="Trends & patterns">
          <CoachCard style={{ padding: isDesktop ? 20 : 16 }}>
            {s.trends.map((p) => (
              <p key={p} style={prose}>
                {p}
              </p>
            ))}
          </CoachCard>
        </Section>
      ) : null}

      {/* Coaching Conversation Guide */}
      {s.conversationGuide.length > 0 ? (
        <Section label="Coaching conversation guide">
          <CoachCard style={{ padding: isDesktop ? 20 : 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {s.conversationGuide.map((q) => (
              <div key={q.label}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: vmTokens.gold }}>
                  {q.label}
                </p>
                <p style={{ margin: '3px 0 0', fontSize: 13.5, lineHeight: 1.55, color: vmTokens.textSecondary }}>{q.q}</p>
              </div>
            ))}
          </CoachCard>
        </Section>
      ) : null}

      {/* Recommended Focus */}
      <Section label={`Recommended focus`}>
        <CoachCard style={{ padding: isDesktop ? 20 : 16 }}>
          <p style={{ margin: '0 0 8px', fontSize: 13.5, color: vmTokens.textSecondary }}>
            Lowest-scoring cluster this month: <strong style={{ color: vmTokens.textPrimary }}>{s.focus.clusterName}</strong>
            {s.focus.clusterPct != null ? ` (${s.focus.clusterPct}%)` : ''}. Focus there.
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {s.focus.goals.map((g) => (
              <li key={g} style={{ fontSize: 13.5, lineHeight: 1.5, color: vmTokens.textSecondary }}>
                {g}
              </li>
            ))}
          </ul>
        </CoachCard>
      </Section>

      {/* Per-session appendix */}
      <Section label="Per-session detail">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {s.sessions.map((sess) => (
            <CoachCard key={`${sess.date}-${sess.session}`} style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', borderBottom: `1px solid ${vmTokens.divider}` }}>
                <span style={{ fontWeight: 700, color: vmTokens.textPrimary }}>{sess.date}</span>
                <span style={{ color: vmTokens.textTertiary }}> — {sess.session}</span>
                <span style={{ float: 'right', fontWeight: 700, color: vmTokens.textPrimary }}>
                  {sess.composite.toFixed(1)} · {sess.status}
                </span>
              </div>
              <ScrollTable>
                <thead>
                  <tr style={theadRow}>
                    <th style={th}>#</th>
                    <th style={{ ...th, textAlign: 'left' }}>Dimension</th>
                    <th style={{ ...th, textAlign: 'left' }}>Cluster</th>
                    <th style={th}>Score</th>
                    <th style={{ ...th, textAlign: 'left' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sess.dimensions.map((d, i) => (
                    <tr key={d.n} style={zebra(i)}>
                      <td style={{ ...td, textAlign: 'center', color: vmTokens.textTertiary }}>{d.n}</td>
                      <td style={{ ...td, fontWeight: 600 }}>{d.name}</td>
                      <td style={{ ...td, color: vmTokens.textTertiary }}>{d.cluster}</td>
                      <td style={{ ...td, textAlign: 'center', fontWeight: 700 }}>{d.score == null ? 'N/A' : `${d.score}/5`}</td>
                      <td style={{ ...td, color: vmTokens.textSecondary }}>{d.note}</td>
                    </tr>
                  ))}
                </tbody>
              </ScrollTable>
            </CoachCard>
          ))}
        </div>
      </Section>
    </>
  );
}

// ─── Small building blocks ───────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  );
}

function ScrollTable({ children }: { children: React.ReactNode }) {
  return (
    <CoachCard style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>{children}</table>
      </div>
    </CoachCard>
  );
}

function BulletCard({
  items,
  accent,
  isDesktop,
}: {
  items: { text: string; session: string }[];
  accent: string;
  isDesktop: boolean;
}) {
  return (
    <CoachCard style={{ padding: isDesktop ? 20 : 16 }}>
      <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((it) => (
          <li key={it.text} style={{ display: 'flex', gap: 8, fontSize: 13.5, lineHeight: 1.5, color: vmTokens.textSecondary }}>
            <span style={{ color: accent, fontWeight: 700 }}>•</span>
            <span>
              {it.text} <span style={{ color: vmTokens.textTertiary, fontSize: 12 }}>({it.session})</span>
            </span>
          </li>
        ))}
      </ul>
    </CoachCard>
  );
}

function ClusterChip({ label, pct }: { label: string; pct: number | null }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: '6px 10px',
        borderRadius: 8,
        background: 'color-mix(in srgb, var(--vm-dust) 8%, transparent)',
        minWidth: 62,
      }}
    >
      <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, color: vmTokens.textTertiary }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 800, color: heatText(pct) }}>{pct == null ? 'N/A' : `${pct}%`}</span>
    </div>
  );
}

function PctCell({ v, bold }: { v: number | null; bold?: boolean }) {
  return (
    <td style={{ ...td, textAlign: 'center', fontWeight: bold ? 800 : 500, color: heatText(v) }}>
      {v == null ? '—' : `${v}%`}
    </td>
  );
}

const CLUSTER_SHORT = { tc: 'TEACHING', bm: 'MINISTRY', ep: 'ENGAGING', br: 'BEING REAL' } as const;

function heatText(pct: number | null): string {
  if (pct == null) return vmTokens.textTertiary;
  if (pct >= 85) return '#15803D';
  if (pct >= 72) return '#4D7C0F';
  if (pct >= 60) return '#B08900';
  return '#B91C1C';
}

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function labelFor(m: string): string {
  const [y, mo] = m.split('-').map(Number);
  const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return mo >= 1 && mo <= 12 ? `${names[mo - 1]} ${y}` : m;
}

const navBtn: React.CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  width: 34,
  height: 34,
  borderRadius: 9,
  border: `1px solid ${vmTokens.divider}`,
  background: vmTokens.surfaceRaisedBg,
  color: vmTokens.textSecondary,
  cursor: 'pointer',
};

const monthSelect: React.CSSProperties = {
  height: 34,
  borderRadius: 9,
  border: `1px solid ${vmTokens.divider}`,
  background: vmTokens.surfaceRaisedBg,
  color: vmTokens.textPrimary,
  fontSize: 13.5,
  fontWeight: 600,
  padding: '0 10px',
  cursor: 'pointer',
};

const theadRow: React.CSSProperties = { background: 'color-mix(in srgb, var(--vm-dust) 12%, transparent)' };

const th: React.CSSProperties = {
  textAlign: 'center',
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: 0.3,
  textTransform: 'uppercase',
  color: vmTokens.textSecondary,
  padding: '9px 10px',
  whiteSpace: 'nowrap',
};

const td: React.CSSProperties = { padding: '9px 10px', verticalAlign: 'middle', color: vmTokens.textSecondary };

const prose: React.CSSProperties = { margin: '0 0 10px', fontSize: 13.5, lineHeight: 1.6, color: vmTokens.textSecondary };

function zebra(i: number): React.CSSProperties {
  return {
    background: i % 2 === 1 ? 'color-mix(in srgb, var(--vm-dust) 4%, transparent)' : 'transparent',
    borderTop: `1px solid ${vmTokens.divider}`,
  };
}
