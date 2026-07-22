/**
 * Coaching dashboard — Trends.
 *
 * Two modes, one route family:
 *   • The signed-in leader's own trends (/coach/trends) render the design
 *     handoff's monthly view — month pills, a dark month-summary band, a score
 *     trajectory, month-at-a-glance table, cluster deep dive, strengths /
 *     growth, recommended focus, and expandable per-session detail — wired to
 *     the real /coach/monthly-summary API.
 *   • An admin drilling into a leader (/coach/leader/:coachId/trends) keeps the
 *     existing score / cluster / dimension chart view unchanged.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ScreenHeader from '@/components/ScreenHeader';
import CoachProfileAvatar from '@/components/coach/CoachProfileAvatar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { vmTokens } from '@/styles/themeStyles';
import {
  useCoachTrendsFor,
  useCoachReportsFor,
  useMyMonthlySummary,
  coachState,
} from '@/hooks/useCoach';
import { CoachCard, CoachStateBoundary, SectionLabel } from '@/components/coach/CoachUi';
import { ScoreTrendCard, ClusterTrendCard } from '@/components/coach/CoachTrendCharts';
import CoachDashboardShell, { CoachGate } from '@/components/coach/CoachDashboardShell';
import CoachLineChart from '@/components/coach/CoachLineChart';
import { dt, statusBand, clusterCode, clusterMeta } from '@/components/coach/dashboardTheme';
import type { LeaderMonthlySummary } from '@/services/coachService';

export default function CoachTrendsScreen() {
  const { coachId } = useParams();
  if (coachId) return <AdminTrends coachId={coachId} />;
  return <LeaderTrends />;
}

// ─── Leader's own monthly trends (design handoff) ───────────────────────────

function LeaderTrends() {
  const [month, setMonth] = useState(currentMonth());
  const [openApp, setOpenApp] = useState<number | null>(null);

  const query = useMyMonthlySummary(month);
  const state = coachState(query);
  const data = state.data;
  const summary = data?.summary ?? null;

  const [knownMonths, setKnownMonths] = useState<string[]>([]);
  const availableMonths = data?.availableMonths;
  useEffect(() => {
    if (availableMonths && availableMonths.length > 0) setKnownMonths(availableMonths);
  }, [availableMonths]);

  // Land on the most recent completed month when the current month is empty.
  useEffect(() => {
    if (data && !data.summary && knownMonths.length > 0 && !knownMonths.includes(month)) {
      setMonth(knownMonths[0]);
    }
  }, [data, knownMonths, month]);

  const months = knownMonths.length > 0 ? knownMonths : [month];

  return (
    <CoachDashboardShell active="trends">
      <div style={{ padding: '36px 0 6px' }}>
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 40, lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 8px' }}>
            Trends
          </h1>
          <p style={{ fontSize: 16, color: dt.textMuted, margin: 0 }}>
            Monthly coaching summaries across your ministry. Click a month to open its full breakdown.
          </p>
        </div>

        {/* Month pills */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          {months.map((m) => {
            const active = m === month;
            const isLoaded = summary && summary.month === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMonth(m);
                  setOpenApp(null);
                }}
                data-testid={`coach-month-${m}`}
                style={{
                  cursor: 'pointer',
                  textAlign: 'left',
                  background: active ? dt.darkBg : dt.innerBg,
                  color: active ? dt.goldChip : dt.textPrimary,
                  border: `1px solid ${active ? dt.darkBg : dt.cardBorder}`,
                  borderRadius: 12,
                  padding: '12px 18px',
                  minWidth: 132,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14 }}>{labelFor(m)}</div>
                <div style={{ fontSize: 12.5, opacity: 0.72, marginTop: 2 }}>
                  {isLoaded ? `${summary.composite.toFixed(1)} · ${summary.sessionsCount} sessions` : 'View summary'}
                </div>
              </button>
            );
          })}
        </div>

        <CoachGate loading={state.loading} authError={state.authError} error={state.error} onRetry={() => query.refetch()}>
          {summary ? (
            <MonthDetail summary={summary} openApp={openApp} setOpenApp={setOpenApp} />
          ) : (
            <div style={{ background: dt.innerBg, border: `1px dashed ${dt.dashed}`, borderRadius: 12, padding: 24, fontSize: 14.5, color: dt.textMuted, lineHeight: 1.65 }}>
              No monthly summary for {labelFor(month)} yet. Monthly breakdowns appear once a month has scored sessions.
            </div>
          )}
        </CoachGate>
      </div>
    </CoachDashboardShell>
  );
}

function MonthDetail({
  summary: s,
  openApp,
  setOpenApp,
}: {
  summary: LeaderMonthlySummary;
  openApp: number | null;
  setOpenApp: (v: number | null) => void;
}) {
  const band = statusBand(s.status.label);
  const deltaText =
    s.delta == null ? 'Baseline month' : `${s.delta > 0 ? '▲ ' : '▼ '}${Math.abs(s.delta).toFixed(1)} vs. ${s.priorMonthLabel}`;
  const best = [...s.trajectory].sort((a, b) => b.composite - a.composite)[0];

  return (
    <>
      {/* Month header band */}
      <div style={{ background: dt.darkBg, color: dt.darkText, borderRadius: 14, padding: '26px 30px', marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.12em', color: dt.brightGold, marginBottom: 8 }}>MONTHLY COACHING SUMMARY</div>
            <h2 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 30, margin: '0 0 6px' }}>{s.monthLabel}</h2>
            <div style={{ fontSize: 13.5, color: dt.darkMuted }}>
              {s.sessionsCount} session{s.sessionsCount === 1 ? '' : 's'} analyzed · weighted composite (v3 model, 12 dimensions × 4 clusters)
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: dt.serif, fontSize: 40, lineHeight: 1, color: dt.darkText }}>
              {s.composite.toFixed(1)}
              <span style={{ fontSize: 18, color: dt.darkMuted2 }}> / 100</span>
            </div>
            <div style={{ display: 'inline-block', marginTop: 8, fontSize: 11, fontWeight: 700, letterSpacing: '.05em', color: band.c, background: band.bg, padding: '4px 10px', borderRadius: 6 }}>
              {s.status.label}
            </div>
            <div style={{ fontSize: 12.5, color: '#9FCBA8', marginTop: 6 }}>{deltaText}</div>
          </div>
        </div>
      </div>

      {/* Summary prose */}
      {s.trends[0] && (
        <p style={{ fontFamily: dt.serif, fontSize: 20, lineHeight: 1.55, color: dt.darkBorder, margin: '0 0 28px' }}>{s.trends[0]}</p>
      )}

      {/* Score trajectory */}
      {s.trajectory.length > 1 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, margin: '0 0 14px' }}>
            <h3 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 23, margin: 0 }}>Score trajectory</h3>
            {best && <span style={{ fontSize: 12, color: dt.textLight }}>Best · {best.date.slice(5)} {best.session} ({best.composite.toFixed(1)})</span>}
          </div>
          <div style={{ background: dt.innerBg, border: `1px solid ${dt.border2}`, borderRadius: 12, padding: '20px 22px 12px', marginBottom: 14 }}>
            <CoachLineChart values={s.trajectory.map((t) => Math.round(t.composite * 10) / 10)} max={100} color={dt.gold} labels={s.trajectory.map((t) => t.date.slice(5))} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 34 }}>
            {s.trajectory.map((t, i) => {
              const dband = t.delta == null ? statusBand('') : t.delta >= 0 ? { c: dt.green, bg: dt.greenBg } : { c: dt.rust, bg: dt.rustBg };
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: dt.innerBg, border: `1px solid ${dt.border2}`, borderRadius: 9, padding: '8px 12px', fontSize: 12.5 }}>
                  <span style={{ color: dt.textLight, fontWeight: 600 }}>{t.date.slice(5)}</span>
                  <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{t.composite.toFixed(1)}</span>
                  <span style={{ fontSize: 9.5, fontWeight: 700, padding: '3px 6px', borderRadius: 5, color: dband.c, background: dband.bg }}>
                    {t.delta == null ? '—' : `${t.delta >= 0 ? '+' : ''}${t.delta.toFixed(1)}`}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Month at a glance */}
      <h3 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 23, margin: '0 0 14px' }}>Month at a glance</h3>
      <div style={{ border: `1px solid ${dt.border2}`, borderRadius: 12, overflow: 'hidden', marginBottom: 34 }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 620 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '58px 1fr 44px 44px 44px 44px 66px 96px', gap: 10, padding: '11px 16px', background: dt.fill1, fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', color: dt.gold }}>
              <div>DATE</div>
              <div>SESSION</div>
              <div style={{ textAlign: 'right' }}>BM</div>
              <div style={{ textAlign: 'right' }}>TC</div>
              <div style={{ textAlign: 'right' }}>EP</div>
              <div style={{ textAlign: 'right' }}>BR</div>
              <div style={{ textAlign: 'right' }}>COMP</div>
              <div style={{ textAlign: 'right' }}>STATUS</div>
            </div>
            {s.glance.rows.map((g, i) => {
              const gb = statusBand(g.status);
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '58px 1fr 44px 44px 44px 44px 66px 96px', gap: 10, padding: '12px 16px', borderTop: `1px solid ${dt.rowDivider}`, fontSize: 13, alignItems: 'center' }}>
                  <div style={{ color: dt.textLight, fontWeight: 600 }}>{g.date.slice(5)}</div>
                  <div style={{ fontWeight: 600 }}>{g.session}</div>
                  <PctCell v={g.bm} />
                  <PctCell v={g.tc} />
                  <PctCell v={g.ep} />
                  <PctCell v={g.br} />
                  <div style={{ textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{g.composite.toFixed(1)}</div>
                  <div style={{ justifySelf: 'end', fontSize: 9.5, fontWeight: 700, padding: '4px 7px', borderRadius: 5, color: gb.c, background: gb.bg }}>{g.status}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cluster deep dive */}
      {s.clusters.length > 0 && (
        <>
          <h3 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 23, margin: '0 0 14px' }}>Cluster deep dive</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 14, marginBottom: 34 }}>
            {s.clusters.map((c) => {
              const cb = statusBand(c.statusLabel);
              return (
                <div key={c.key} style={{ background: dt.innerBg, border: `1px solid ${dt.border2}`, borderRadius: 13, padding: '20px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h4 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 19, margin: 0 }}>{c.name}</h4>
                    <span style={{ fontSize: 12, color: dt.textLight }}>Weight {c.weight}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0 14px' }}>
                    <div style={{ flex: 1, height: 9, background: dt.barTrack, borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 99, width: `${c.avgPct ?? 0}%`, background: cb.c }} />
                    </div>
                    <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 15 }}>{c.avgPct == null ? 'N/A' : `${c.avgPct}%`}</span>
                    {c.statusLabel && <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 5, color: cb.c, background: cb.bg }}>{c.statusLabel}</span>}
                  </div>
                  {c.strongestDim && c.weakestDim && (
                    <div style={{ fontSize: 13, color: dt.body, lineHeight: 1.7 }}>
                      <div><span style={{ color: dt.green, fontWeight: 700 }}>↑ Strongest</span> · {c.strongestDim.name} ({c.strongestDim.val.toFixed(1)}/5)</div>
                      <div><span style={{ color: dt.rust, fontWeight: 700 }}>↓ Weakest</span> · {c.weakestDim.name} ({c.weakestDim.val.toFixed(1)}/5)</div>
                    </div>
                  )}
                  {c.insight && <p style={{ fontSize: 13, color: dt.textMuted, lineHeight: 1.55, margin: '10px 0 0', borderTop: `1px dashed ${dt.dashed}`, paddingTop: 10 }}>{c.insight}</p>}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Strengths / growth */}
      {(s.strengths.length > 0 || s.growth.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 24, marginBottom: 32 }}>
          {s.strengths.length > 0 && (
            <div>
              <h3 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 20, margin: '0 0 12px' }}>Key strengths</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {s.strengths.map((x, i) => (
                  <BulletLine key={i} color={dt.green} text={x.text} session={x.session} />
                ))}
              </div>
            </div>
          )}
          {s.growth.length > 0 && (
            <div>
              <h3 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 20, margin: '0 0 12px' }}>Key growth areas</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {s.growth.map((x, i) => (
                  <BulletLine key={i} color={dt.rust} text={x.text} session={x.session} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommended focus */}
      {s.focus.goals.length > 0 && (
        <div style={{ background: dt.goldChip, borderRadius: 13, padding: '22px 24px', marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: dt.gold, marginBottom: 12 }}>
            RECOMMENDED FOCUS FOR NEXT MONTH{s.focus.clusterName ? ` · ${s.focus.clusterName}${s.focus.clusterPct != null ? ` (${s.focus.clusterPct}%)` : ''}` : ''}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {s.focus.goals.map((g, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, fontSize: 14, lineHeight: 1.55, color: dt.body }}>
                <span style={{ color: dt.gold, fontWeight: 700, flex: 'none' }}>→</span>
                <span>{g}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-session detail */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, margin: '0 0 4px' }}>
        <h3 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 23, margin: 0 }}>Per-session detail</h3>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: dt.gold2, background: dt.goldChip, padding: '4px 10px', borderRadius: 99 }}>All 12 dimensions</span>
      </div>
      <p style={{ margin: '0 0 16px', fontSize: 14, color: dt.textLight }}>Every session this month, scored across all twelve dimensions. Click a session to expand.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {s.sessions.map((sess, i) => {
          const sb = statusBand(sess.status);
          const isOpen = openApp === i;
          return (
            <div key={i} style={{ border: `1px solid ${dt.border2}`, borderRadius: 12, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setOpenApp(isOpen ? null : i)}
                data-testid={`coach-appendix-${i}`}
                style={{ display: 'grid', gridTemplateColumns: '60px 1fr 66px 100px 16px', gap: 14, alignItems: 'center', padding: '15px 18px', cursor: 'pointer', background: dt.innerBg, width: '100%', border: 'none', textAlign: 'left' }}
              >
                <div style={{ fontSize: 13, color: dt.textLight, fontWeight: 600 }}>{sess.date.slice(5)}</div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{sess.session}</div>
                <div style={{ textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{sess.composite.toFixed(1)}</div>
                <div style={{ justifySelf: 'end', fontSize: 9.5, fontWeight: 700, padding: '4px 8px', borderRadius: 5, color: sb.c, background: sb.bg }}>{sess.status}</div>
                <div style={{ textAlign: 'right', color: '#BCAD8E', fontSize: 11 }}>{isOpen ? '▾' : '▸'}</div>
              </button>
              {isOpen && (
                <div style={{ padding: '4px 18px 16px', background: dt.innerBg, borderTop: `1px solid ${dt.rowDivider}` }}>
                  {sess.dimensions.map((d) => {
                    const cm = clusterMeta(clusterCode(d.cluster));
                    return (
                      <div key={d.n} style={{ display: 'grid', gridTemplateColumns: '20px 1.3fr 138px 48px 2fr', gap: 12, alignItems: 'center', padding: '9px 0', borderTop: `1px solid ${dt.rowDivider}` }}>
                        <div style={{ fontSize: 12, color: '#B7A98A', fontWeight: 600 }}>{d.n}</div>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{d.name}</div>
                        <div>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 5, color: cm.c, background: cm.bg }}>{cm.name}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{d.score == null ? 'N/A' : `${d.score}/5`}</div>
                        <div style={{ fontSize: 12.5, color: dt.textMuted, lineHeight: 1.45 }}>{d.note}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function PctCell({ v }: { v: number | null }) {
  return (
    <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: dt.textMuted }}>{v == null ? '—' : `${v}`}</div>
  );
}

function BulletLine({ color, text, session }: { color: string; text: string; session: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, fontSize: 13.5, lineHeight: 1.55, color: dt.body }}>
      <span style={{ color, flex: 'none' }}>●</span>
      <span>
        {text} {session && <span style={{ color: dt.textLight, fontSize: 12 }}>({session})</span>}
      </span>
    </div>
  );
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

// ─── Admin drill-in: existing score / cluster / dimension chart view ─────────

function AdminTrends({ coachId }: { coachId: string }) {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const trendsQuery = useCoachTrendsFor(coachId);
  const reportsQuery = useCoachReportsFor(coachId);
  const trends = coachState(trendsQuery);
  const reports = coachState(reportsQuery);
  const reportList = reportsQuery.data?.reports;
  const latest = reportList && reportList.length ? reportList[0] : null;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader title="Trends" onBack={() => navigate(`/coach/leader/${coachId}`)} backTestId="coach-trends-back-button" rightAction={<CoachProfileAvatar />} />
      <div data-testid="coach-trends" style={{ flex: 1, overflowY: 'auto', borderTop: `1px solid ${vmTokens.divider}` }}>
        <CoachStateBoundary
          loading={trends.loading || reports.loading}
          authError={trends.authError || reports.authError}
          error={trends.error || reports.error}
          onRetry={() => {
            trendsQuery.refetch();
            reportsQuery.refetch();
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: isDesktop ? 24 : 16, maxWidth: isDesktop ? 1000 : 640, margin: '0 auto' }}>
            {trends.data?.delta && (
              <CoachCard testId="coach-trends-delta">
                <SectionLabel>Since last session</SectionLabel>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontSize: 30, fontWeight: 700, color: trends.data.delta.score >= 0 ? vmTokens.statusSuccess : vmTokens.statusError }}>
                    {trends.data.delta.score >= 0 ? '+' : ''}
                    {trends.data.delta.score.toFixed(1)}
                  </span>
                  <span style={{ fontSize: 13, color: vmTokens.textTertiary }}>
                    {trends.data.delta.from.toFixed(1)} → {trends.data.delta.to.toFixed(1)} points
                  </span>
                </div>
              </CoachCard>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 16 }}>
              <ScoreTrendCard trends={trends.data} />
              <ClusterTrendCard trends={trends.data} />
            </div>
            {latest && (
              <CoachCard>
                <SectionLabel>Latest session — 12 dimensions</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {latest.dimensions.map((d) => (
                    <div key={d.n}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 12.5, color: vmTokens.textSecondary }}>{d.name}</span>
                        <span style={{ fontSize: 12, color: vmTokens.textTertiary }}>{d.score == null ? 'N/A' : `${d.score}/5`}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: vmTokens.divider, overflow: 'hidden' }}>
                        <div style={{ width: d.score == null ? '0%' : `${(d.score / 5) * 100}%`, height: '100%', background: vmTokens.gold, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CoachCard>
            )}
          </div>
        </CoachStateBoundary>
      </div>
    </div>
  );
}
