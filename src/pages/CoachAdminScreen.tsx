/**
 * Coach Oversight (/coach for program admins) — the Bible Leader Coach's view
 * across their whole cohort. Recreates the design handoff's four views in the
 * coaching-dashboard design language (see dashboardTheme):
 *
 *   Dashboard (roster)   — program health + every leader, alphabetical
 *   Leader detail        — one leader: strengths/growth, development charts,
 *                          and each class (deep dive = the full session report)
 *                          with a coaching comment thread
 *   Trends (program)     — cohort composite, leaderboard, dimension heat map,
 *                          coaching priority matrix, program initiatives
 *   Class links          — the meeting links the notetaker joins, per leader
 *
 * Wired to the real admin API (useAdminCoaches / useAdminMonthly /
 * useCoachReportsFor / useCoachTrendsFor / useLeaderMonthlySummary /
 * useAdminClasses / useAddLeader / useAddNote).
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import {
  useAdminCoaches,
  useAdminMonthly,
  useCoachReportsFor,
  useCoachTrendsFor,
  useLeaderMonthlySummary,
  useAdminClasses,
  useAddLeader,
  useAddNote,
  coachState,
} from '@/hooks/useCoach';
import type {
  CoachSummary,
  CoachMonthly,
  CoachReport,
  CoachTrends,
  LeaderMonthlySummary,
  AdminCoachClass,
} from '@/services/coachService';
import { CoachGate } from '@/components/coach/CoachDashboardShell';
import CoachSessionDetail from '@/components/coach/CoachSessionDetail';
import { AxisLineChart, BandedTrend, RadarChart, MultiLineChart } from '@/components/coach/oversightCharts';
import { dt, statusBand, firstName } from '@/components/coach/dashboardTheme';

type View = 'leaders' | 'leader' | 'trends' | 'links';

const DIM_SHORT = [
  'Structure & Flow', 'Newcomer Welcome', 'Scripture', 'Facilitation', 'Application', 'Participation',
  'Visual Aids', 'Vulnerability', 'Memory', 'Homework', 'Prayer', 'Leader Dev',
];

// ─── Shared color helpers (handoff scoring model) ───────────────────────────

/** Score chip color for a /100 composite (roster last-3, class badge). */
function compBand(v: number): { c: string; bg: string } {
  if (v >= 85) return { c: '#3E6E9A', bg: '#E4ECF3' };
  if (v >= 72) return { c: '#3E7A54', bg: '#E8EFE6' };
  if (v >= 60) return { c: '#9A6E1F', bg: '#F6EFD8' };
  return { c: '#A94E2B', bg: '#F4E1D7' };
}

/** Heat-map cell color for a 1–5 dimension score. */
function cellColor(v: number | null): { c: string; bg: string } {
  if (v == null) return { c: '#9A9484', bg: '#EFEFED' };
  if (v >= 4.0) return { c: '#2F6A45', bg: '#DDEBDD' };
  if (v >= 3.0) return { c: '#8A6A1F', bg: '#F6EACF' };
  return { c: '#A94E2B', bg: '#F3DDD2' };
}

/** Rating for a 1–5 score in the deep-dive / dimensions-over-time. */
function rate5(v: number): { label: string; c: string; bg: string } {
  if (v >= 4) return { label: 'STRONG', c: '#3E7A54', bg: '#E8EFE6' };
  if (v >= 3) return { label: 'ON TARGET', c: '#9A6E1F', bg: '#F6EFD8' };
  return { label: 'NEEDS WORK', c: '#A94E2B', bg: '#F4E1D7' };
}

function initialsOf(name: string): string {
  const p = (name || '').replace(/&/g, '').trim().split(/\s+/);
  return (((p[0] || '')[0] || '') + ((p[1] || '')[0] || (p[0] || '')[1] || '')).toUpperCase() || '?';
}

/** Fetch the three most recent calendar months of the program rollup (bounded,
 *  cached). Unlocks the roster last-3 chips, the program-composite line, and the
 *  leader-comparison chart from the single-month admin endpoint. */
function useThreeMonths(): { month: string; label: string; data: CoachMonthly | undefined }[] {
  const m0 = monthMinus(0);
  const m1 = monthMinus(1);
  const m2 = monthMinus(2);
  const q0 = useAdminMonthly(m0);
  const q1 = useAdminMonthly(m1);
  const q2 = useAdminMonthly(m2);
  return [
    { month: m2, label: monthLabel(m2), data: q2.data },
    { month: m1, label: monthLabel(m1), data: q1.data },
    { month: m0, label: monthLabel(m0), data: q0.data },
  ];
}

/** Per-leader composite across the loaded months (oldest→newest), keyed by id. */
function leaderMonthlySeries(months: { data: CoachMonthly | undefined }[]): Map<string, number[]> {
  const out = new Map<string, number[]>();
  for (const m of months) {
    for (const l of m.data?.leaders ?? []) {
      if (l.avgScore == null) continue;
      const arr = out.get(l.id) ?? [];
      arr.push(Math.round(l.avgScore * 10) / 10);
      out.set(l.id, arr);
    }
  }
  return out;
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function CoachAdminScreen() {
  const navigate = useNavigate();
  const { state } = useApp();

  const [view, setView] = useState<View>('leaders');
  const [selLeader, setSelLeader] = useState<string | null>(null);
  const [invite, setInvite] = useState(false);

  const coachesQuery = useAdminCoaches();
  const coaches = coachState(coachesQuery);
  const roster = useMemo(() => [...(coaches.data || [])], [coaches.data]);

  const initials = (() => {
    const f = (state.userFirstName || '').trim();
    const l = (state.userLastName || '').trim();
    return ((f ? f[0] : '') + (l ? l[0] : '') || (state.userEmail || '?')[0] || '?').toUpperCase();
  })();

  const openLeader = (id: string) => {
    setSelLeader(id);
    setView('leader');
  };

  return (
    <div style={shellRoot}>
      <div style={{ width: 1240, maxWidth: '100%', padding: '0 clamp(14px, 4vw, 44px)' }}>
        <div style={card}>
          {/* Top nav */}
          <div style={topbar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={logoMark} aria-hidden>V</div>
              <span style={{ fontFamily: dt.serif, fontSize: 20, fontWeight: 600, letterSpacing: '-.01em' }}>VerseMate</span>
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.14em', color: dt.gold, borderLeft: '1px solid #DEDEDC', paddingLeft: 11 }}>COACHING</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 14, fontWeight: 500, color: dt.textMuted }}>
              <NavItem label="Dashboard" active={view === 'leaders' || view === 'leader'} onClick={() => setView('leaders')} testId="oversight-nav-dashboard" />
              <NavItem label="Trends" active={view === 'trends'} onClick={() => setView('trends')} testId="oversight-nav-trends" />
              <NavItem label="Class links" active={view === 'links'} onClick={() => setView('links')} testId="oversight-nav-links" />
              <button type="button" onClick={() => navigate('/coach/settings')} aria-label="Coach settings" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A9484', fontSize: 16 }}>⚙</button>
              <div style={avatarChip}>{state.userAvatarUrl ? <img src={state.userAvatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : initials}</div>
            </div>
          </div>

          <CoachGate loading={coaches.loading} authError={coaches.authError} error={coaches.error} onRetry={() => coachesQuery.refetch()}>
            {view === 'leaders' && <RosterView roster={roster} onOpenLeader={openLeader} onInvite={() => setInvite(true)} onViewTrends={() => setView('trends')} />}
            {view === 'leader' && selLeader && <LeaderDetailView leaderId={selLeader} summary={roster.find((r) => r.id === selLeader)} onBack={() => setView('leaders')} />}
            {view === 'trends' && <TrendsView onOpenLeader={openLeader} onBack={() => setView('leaders')} />}
            {view === 'links' && <ClassLinksView roster={roster} onBack={() => setView('leaders')} onInvite={() => setInvite(true)} />}
          </CoachGate>
        </div>
      </div>

      {invite && <InviteModal onClose={() => setInvite(false)} />}
    </div>
  );
}

// ─── View 1 · Roster ────────────────────────────────────────────────────────

function RosterView({
  roster,
  onOpenLeader,
  onInvite,
  onViewTrends,
}: {
  roster: CoachSummary[];
  onOpenLeader: (id: string) => void;
  onInvite: () => void;
  onViewTrends: () => void;
}) {
  const month = currentMonth();
  const monthlyQuery = useAdminMonthly(month);
  const monthly = monthlyQuery.data;
  const threeMonths = useThreeMonths();
  const series = useMemo(() => leaderMonthlySeries(threeMonths), [threeMonths]);

  const alpha = [...roster].sort((a, b) => a.name.localeCompare(b.name));
  const scored = roster.filter((r) => r.latest);
  const avg = scored.length ? (scored.reduce((s, r) => s + (r.latest?.score ?? 0), 0) / scored.length).toFixed(1) : '—';

  const strongPlus = roster.filter((r) => r.latest && (r.latest.status === 'Strong' || r.latest.status === 'Exceptional')).length;
  const onTarget = roster.filter((r) => r.latest?.status === 'On Target').length;
  const developing = roster.filter((r) => r.latest && r.latest.status !== 'Strong' && r.latest.status !== 'Exceptional' && r.latest.status !== 'On Target').length;
  const total = roster.length || 1;
  const dist = [
    { band: 'Strong or better', count: strongPlus, pct: Math.round((strongPlus / total) * 100), c: '#3E7A54' },
    { band: 'On Target', count: onTarget, pct: Math.round((onTarget / total) * 100), c: '#9A6E1F' },
    { band: 'Developing / new', count: developing, pct: Math.round((developing / total) * 100), c: '#A94E2B' },
  ];
  const needs = onTarget + developing;

  const composite = monthly?.program.avgScore ?? (scored.length ? Number(avg) : null);
  const delta = monthly?.program.delta ?? null;

  return (
    <div style={{ paddingTop: 28 }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap', marginBottom: 26 }}>
        <div>
          <h1 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 34, lineHeight: 1, letterSpacing: '-.02em', margin: '0 0 6px' }}>Bible Leader Coach</h1>
          <div style={{ fontSize: 14, color: dt.textMuted }}>{roster.length} leaders · avg {avg}</div>
        </div>
        <button type="button" onClick={onInvite} data-testid="oversight-add-leader" style={goldPill}>+ Add leader</button>
      </div>

      {/* Program summary hero */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 28, flexWrap: 'wrap', marginBottom: 26 }}>
        <div style={{ maxWidth: 560 }}>
          <div style={kicker}>PROGRAM HEALTH · {monthLabel(month).toUpperCase()}</div>
          <h2 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 30, lineHeight: 1.12, letterSpacing: '-.01em', margin: '0 0 8px' }}>
            Your {roster.length} leaders are averaging {avg}{composite != null ? ' — a Strong program month.' : '.'}
          </h2>
          <p style={{ fontSize: 15, color: dt.textMuted, margin: 0 }}>{strongPlus} Strong or better · {needs} worth a check-in this week.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <StatBox label="PROGRAM COMPOSITE" labelC={dt.gold}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: dt.serif, fontSize: 30, lineHeight: 1, color: dt.gold2 }}>{composite != null ? composite.toFixed(1) : '—'}</span>
              <span style={{ fontSize: 14, color: dt.textLight, fontWeight: 600 }}>/ 100</span>
            </div>
            {delta != null && <div style={{ fontSize: 13, fontWeight: 600, color: delta >= 0 ? dt.green : dt.rust, marginTop: 6 }}>{delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)} vs. prior</div>}
          </StatBox>
          <StatBox label="NEEDS ATTENTION" labelC={dt.rust}>
            <div style={{ fontFamily: dt.serif, fontSize: 30, lineHeight: 1, color: dt.textPrimary }}>{needs}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: dt.rust, marginTop: 6 }}>leaders to check in with</div>
          </StatBox>
        </div>
      </div>

      {/* Status mix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 20, marginBottom: 34 }}>
        <div style={innerCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <span style={{ ...kicker, marginBottom: 0 }}>PROGRAM AT A GLANCE</span>
            <button type="button" onClick={onViewTrends} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700, color: dt.gold }}>View full trends →</button>
          </div>
          <p style={{ fontSize: 14, color: dt.textMuted, lineHeight: 1.6, margin: 0 }}>
            {scored.length} of {roster.length} leaders have a scored session. Open <strong>Trends</strong> for the cohort leaderboard, dimension heat map, and coaching priorities.
          </p>
        </div>
        <div style={innerCard}>
          <div style={{ ...kicker, marginBottom: 14 }}>STATUS MIX</div>
          {dist.map((d) => (
            <div key={d.band} style={{ marginBottom: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                <span style={{ color: dt.textMuted }}>{d.band}</span>
                <span style={{ fontWeight: 700, color: d.c }}>{d.count}</span>
              </div>
              <div style={{ height: 7, background: dt.barTrack, borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${d.pct}%`, background: d.c }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roster */}
      <div style={{ ...kicker, color: dt.textLighter, marginBottom: 14 }}>ALL LEADERS</div>
      {alpha.length === 0 ? (
        <div style={dashedNote}>No leaders yet. Use “+ Add leader” to invite your first leader.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {alpha.map((l) => (
            <RosterRow key={l.id} leader={l} last3={(series.get(l.id) ?? []).slice(-3)} onOpen={() => onOpenLeader(l.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function RosterRow({ leader, last3, onOpen }: { leader: CoachSummary; last3: number[]; onOpen: () => void }) {
  const st = leader.latest ? statusBand(leader.latest.status) : statusBand('');
  const score = leader.latest ? Math.round(leader.latest.score) : null;
  // Prefer the real last-3 monthly composites; fall back to the latest score.
  const chips = (last3.length > 0 ? last3 : score != null ? [score] : []).map((v) => ({ v: Math.round(v), ...compBand(v) }));
  return (
    <button type="button" onClick={onOpen} data-testid={`oversight-roster-${leader.id}`} style={rosterRow}>
      <div style={{ width: 52, height: 52, borderRadius: 12, background: st.bg, color: st.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15 }}>{initialsOf(leader.name)}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 17 }}>{leader.name}</div>
        <div style={{ fontSize: 13.5, color: dt.textLight, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{leader.group} · {leader.sessionCount} session{leader.sessionCount === 1 ? '' : 's'}</div>
      </div>
      <div>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.08em', color: dt.textLighter, marginBottom: 5 }}>LAST 3 CLASSES</div>
        {chips.length > 0 ? (
          <div style={{ display: 'flex', gap: 6 }}>
            {chips.map((s, i) => (
              <div key={i} style={{ minWidth: 38, textAlign: 'center', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: s.c, background: s.bg, padding: '5px 0', borderRadius: 7 }}>{s.v}</div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 12.5, color: '#B0A992' }}>Awaiting first session</div>
        )}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 700, fontSize: 22, fontVariantNumeric: 'tabular-nums', lineHeight: 1, marginBottom: 6 }}>{score ?? '—'}</div>
        {leader.latest && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: st.c, background: st.bg, padding: '4px 10px', borderRadius: 99 }}>{leader.latest.status}</div>
        )}
      </div>
      <div style={{ color: '#C4BDAE', fontSize: 16 }}>›</div>
    </button>
  );
}

// ─── View 2 · Leader detail ─────────────────────────────────────────────────

function LeaderDetailView({
  leaderId,
  summary,
  onBack,
}: {
  leaderId: string;
  summary?: CoachSummary;
  onBack: () => void;
}) {
  const month = currentMonth();
  const reportsQuery = useCoachReportsFor(leaderId);
  const trendsQuery = useCoachTrendsFor(leaderId);
  const monthlyQuery = useLeaderMonthlySummary(leaderId, month);

  const state = coachState(reportsQuery);
  const profile = reportsQuery.data?.profile;
  const reports = useMemo(() => [...(reportsQuery.data?.reports || [])].sort(byDateDesc), [reportsQuery.data]);
  const trends = trendsQuery.data;
  const monthly = monthlyQuery.data?.summary ?? null;

  const name = profile?.name || summary?.name || 'Leader';
  const study = profile?.group || summary?.group || '';
  const status = summary?.latest?.status || (reports[0] ? deriveStatus(reports[0].score) : 'On Target');
  const st = statusBand(status);

  const [page, setPage] = useState(0);
  const [openClass, setOpenClass] = useState<string | null>(null);
  const CPP = 5;
  const totalPages = Math.max(1, Math.ceil(reports.length / CPP));
  const pageReports = reports.slice(page * CPP, page * CPP + CPP);

  return (
    <div style={{ paddingTop: 22 }}>
      <button type="button" onClick={onBack} data-testid="oversight-back" style={backLink}>← All leaders</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap', margin: '16px 0 24px' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, background: st.bg, color: st.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>{initialsOf(name)}</div>
          <div>
            <h2 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 28, margin: '0 0 4px', letterSpacing: '-.01em' }}>{name}</h2>
            <div style={{ fontSize: 14, color: dt.textMuted }}>{study}{study ? ' · ' : ''}{reports.length} session{reports.length === 1 ? '' : 's'}</div>
          </div>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: st.c, background: st.bg, padding: '5px 12px', borderRadius: 99 }}>{status}</div>
      </div>

      <CoachGate loading={state.loading} authError={state.authError} error={state.error} onRetry={() => reportsQuery.refetch()}>
        {reports.length === 0 ? (
          <div style={dashedNote}>No sessions scored for {firstName(name)} yet. Once a session is recorded and coached, it appears here.</div>
        ) : (
          <>
            {monthly && <StrengthsGrowth summary={monthly} />}

            <Development trends={trends} latest={reports[0]} monthly={monthly} />

            {/* Classes + comments */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, margin: '6px 0 6px' }}>
              <h3 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 22, margin: 0 }}>Classes</h3>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: dt.gold2, background: dt.goldChip, padding: '4px 10px', borderRadius: 99 }}>Comment to coach</span>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: dt.textLight }}>Leave coaching notes on a session — {firstName(name)} sees them on their session report.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {pageReports.map((r) => (
                <ClassCard
                  key={r.id}
                  report={r}
                  study={study}
                  leaderId={leaderId}
                  open={openClass === r.id}
                  onToggle={() => setOpenClass((o) => (o === r.id ? null : r.id))}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                <button type="button" onClick={() => { if (page > 0) { setPage(page - 1); setOpenClass(null); } }} style={{ background: 'none', border: 'none', cursor: page > 0 ? 'pointer' : 'default', fontSize: 13, fontWeight: 700, color: page > 0 ? dt.textPrimary : '#C4BDAE' }}>← Newer</button>
                <span style={{ fontSize: 12.5, color: dt.textLight }}>Page {page + 1} of {totalPages} · {reports.length} classes</span>
                <button type="button" onClick={() => { if (page < totalPages - 1) { setPage(page + 1); setOpenClass(null); } }} style={{ background: 'none', border: 'none', cursor: page < totalPages - 1 ? 'pointer' : 'default', fontSize: 13, fontWeight: 700, color: page < totalPages - 1 ? dt.textPrimary : '#C4BDAE' }}>Older →</button>
              </div>
            )}
          </>
        )}
      </CoachGate>
    </div>
  );
}

function StrengthsGrowth({ summary }: { summary: LeaderMonthlySummary }) {
  const strengths = summary.strengths.slice(0, 3);
  const growth = summary.growth.slice(0, 3);
  if (strengths.length === 0 && growth.length === 0) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 14, marginBottom: 28 }}>
      <div style={{ background: dt.greenBg, borderRadius: 12, padding: '16px 18px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: dt.green, marginBottom: 10 }}>STRENGTHS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {strengths.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 9, fontSize: 13, lineHeight: 1.5, color: dt.darkBorder }}><span style={{ color: dt.green, flex: 'none', fontWeight: 700 }}>↑</span><span>{s.text}</span></div>
          ))}
        </div>
      </div>
      <div style={{ background: dt.rustBg, borderRadius: 12, padding: '16px 18px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: dt.rust, marginBottom: 10 }}>GROWTH AREAS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {growth.map((g, i) => (
            <div key={i} style={{ display: 'flex', gap: 9, fontSize: 13, lineHeight: 1.5, color: dt.darkBorder }}><span style={{ color: dt.rust, flex: 'none', fontWeight: 700 }}>↓</span><span>{g.text}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Development({ trends, latest, monthly }: { trends: CoachTrends | undefined; latest: CoachReport; monthly: LeaderMonthlySummary | null }) {
  const scoreSeries = trends?.scoreSeries ?? [];
  const trendValues = scoreSeries.slice(-7).map((p) => Math.round(p.score));
  const trendLabels = scoreSeries.slice(-7).map((p) => shortDate(p.date));

  // Radar: latest session's 12 dimensions (0 for N/A) + 3-session rolling avg.
  const vals = latest.dimensions.map((d) => d.score ?? 0);
  const recent = (trends?.dimensionSeries ?? []).slice(-3);
  const avg = latest.dimensions.map((d) => {
    const nums = recent.map((r) => Number(r[d.name])).filter((n) => Number.isFinite(n));
    return nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : (d.score ?? 0);
  });

  const clusters = monthly
    ? [
        { name: 'Building Ministry', pct: monthly.clusterAvg.bm },
        { name: 'Teaching Craft', pct: monthly.clusterAvg.tc },
        { name: 'Engaging People', pct: monthly.clusterAvg.ep },
        { name: 'Being Real', pct: monthly.clusterAvg.br },
      ]
    : [];

  // Dimensions over time — last 4 dated columns from the dimension series.
  const dimSeries = (trends?.dimensionSeries ?? []).slice(-4);
  const matrixDates = dimSeries.map((r) => shortDate(String(r.date)));

  return (
    <div style={{ borderTop: `1px solid ${dt.rowDivider}`, marginTop: 28, paddingTop: 24, marginBottom: 28 }}>
      <h3 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 22, margin: '0 0 4px' }}>Development · the coaching conversation</h3>
      <p style={{ margin: '0 0 18px', fontSize: 14, color: dt.textLight }}>How this leader is trending, where the shape of their teaching is strong or thin, and what moved session to session.</p>

      <div style={{ ...innerCard, padding: '20px 22px 12px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
          <span style={{ ...kicker, marginBottom: 0 }}>SESSION SCORE OVER TIME</span>
          <span style={{ fontSize: 11.5, color: dt.textLight }}>Bands · 🔷85+ · 🟢72 · 🟡60 · 🟠45 · 🔴</span>
        </div>
        {trendValues.length > 0 ? <BandedTrend values={trendValues} labels={trendLabels} /> : <div style={{ padding: '30px 0', textAlign: 'center', color: dt.textLight, fontSize: 13 }}>Trend appears after a couple of scored sessions.</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 380px) minmax(0, 1fr)', gap: 16, marginBottom: 16 }}>
        <div style={innerCard}>
          <div style={{ ...kicker, marginBottom: 6 }}>12-DIMENSION SHAPE</div>
          <RadarChart vals={vals} avg={avg} />
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: 12, color: dt.textMuted, marginTop: 4 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 3, background: dt.gold, display: 'inline-block' }} />This session</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 0, borderTop: '2px dashed #8A8272', display: 'inline-block' }} />3-session avg</span>
          </div>
        </div>
        <div style={innerCard}>
          <div style={{ ...kicker, marginBottom: 14 }}>CLUSTER MIX · {monthLabel(currentMonth()).toUpperCase()}</div>
          {clusters.length > 0 ? clusters.map((c) => (
            <div key={c.name} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}><span style={{ color: dt.textMuted }}>{c.name}</span><span style={{ fontWeight: 700 }}>{c.pct == null ? 'N/A' : `${c.pct}%`}</span></div>
              <div style={{ height: 8, background: dt.barTrack, borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: 99, width: `${c.pct ?? 0}%`, background: dt.brightGold }} /></div>
            </div>
          )) : <p style={{ fontSize: 13, color: dt.textLight, margin: 0 }}>Cluster mix appears once a monthly summary is available.</p>}
        </div>
      </div>

      {matrixDates.length > 0 && (
        <>
          <div style={{ ...kicker, margin: '4px 0 10px' }}>DIMENSIONS OVER TIME</div>
          <div style={{ border: `1px solid ${dt.cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: 520 }}>
                <div style={{ display: 'grid', gridTemplateColumns: `1fr repeat(${matrixDates.length}, 62px)`, gap: 8, padding: '10px 16px', background: '#F6EFD8', fontSize: 10.5, fontWeight: 700, letterSpacing: '.03em', color: dt.gold }}>
                  <div>DIMENSION</div>
                  {matrixDates.map((d, i) => <div key={i} style={{ textAlign: 'center' }}>{d}</div>)}
                </div>
                {latest.dimensions.map((dim) => (
                  <div key={dim.n} style={{ display: 'grid', gridTemplateColumns: `1fr repeat(${matrixDates.length}, 62px)`, gap: 8, padding: '6px 16px', borderTop: `1px solid ${dt.rowDivider}`, fontSize: 13, alignItems: 'center' }}>
                    <div style={{ fontWeight: 600 }}>{DIM_SHORT[dim.n - 1] ?? dim.name}</div>
                    {dimSeries.map((r, i) => {
                      const raw = Number(r[dim.name]);
                      const v = Number.isFinite(raw) ? Math.round(raw) : null;
                      const cc = cellColor(v);
                      return <div key={i} style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: cc.c, background: cc.bg, padding: '5px 0', borderRadius: 5 }}>{v ?? 'N/A'}</div>;
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ClassCard({
  report,
  study,
  leaderId,
  open,
  onToggle,
}: {
  report: CoachReport;
  study: string;
  leaderId: string;
  open: boolean;
  onToggle: () => void;
}) {
  const cb = compBand(report.score);
  const scored = report.dimensions.filter((d) => d.score != null) as { n: number; name: string; score: number; note?: string }[];
  const sortedDesc = [...scored].sort((a, b) => b.score - a.score);
  const strong = sortedDesc[0]?.name ?? '—';
  const weak = sortedDesc[sortedDesc.length - 1]?.name ?? '—';
  const improveList = sortedDesc.slice(-3).reverse();
  const micro = report.feedback?.headline ? report.feedback.headline.split('. ')[0] + '.' : '';

  return (
    <div style={{ border: `1px solid ${dt.cardBorder}`, borderRadius: 13, overflow: 'hidden' }}>
      <button type="button" onClick={onToggle} data-testid={`oversight-class-${report.id}`} style={{ padding: '16px 20px', background: dt.innerBg, borderBottom: `1px solid ${dt.rowDivider}`, cursor: 'pointer', width: '100%', border: 'none', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <div style={{ flex: 'none', width: 48, height: 48, borderRadius: 11, background: cb.bg, color: cb.c, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 17, lineHeight: 1 }}>{Math.round(report.score)}</span>
              <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.04em', opacity: 0.7 }}>/100</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{report.dateLabel}</div>
              <div style={{ fontSize: 12.5, color: dt.textLight }}>{report.session}{report.topic ? ` · ${report.topic}` : ''}{study ? ` · ${study}` : ''}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 'none' }}>
            <span style={{ fontSize: 12.5, color: dt.gold, fontWeight: 600 }}>{report.notes?.length ?? 0} comments</span>
            <span style={{ fontSize: 12.5, color: dt.textPrimary, fontWeight: 700 }}>Deep dive {open ? '▾' : '▸'}</span>
          </div>
        </div>
        {micro && <div style={{ fontSize: 12.5, color: dt.body, lineHeight: 1.5, marginTop: 11 }}>{micro}</div>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 11 }}>
          <span style={{ fontSize: 11.5, color: dt.body }}><strong style={{ color: dt.textPrimary }}>Takeaway ·</strong> {strong} carried the hour; sharpen {weak} next.</span>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.03em', color: dt.green, background: dt.greenBg, padding: '3px 8px', borderRadius: 5 }}>↑ {strong}</span>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.03em', color: dt.rust, background: dt.rustBg, padding: '3px 8px', borderRadius: 5 }}>↓ {weak}</span>
        </div>
        {improveList.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 11, borderTop: `1px solid ${dt.rowDivider}` }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.05em', color: dt.rust, textTransform: 'uppercase', marginBottom: 8 }}>Key improvement areas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {improveList.map((d) => (
                <div key={d.n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ flex: 'none', fontSize: 10, fontWeight: 700, color: dt.rust, background: dt.rustBg, padding: '3px 7px', borderRadius: 5 }}>{d.name} · {d.score}/5</span>
                  <span style={{ fontSize: 12, color: dt.body, lineHeight: 1.45 }}>{d.note?.trim() || `Pick one concrete move for ${d.name.toLowerCase()} next week and name it before you close.`}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </button>

      {open && (
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${dt.rowDivider}` }}>
          <CoachSessionDetail report={report} delta={null} label="FULL SESSION REPORT" />
        </div>
      )}

      <CommentThread report={report} leaderId={leaderId} />
    </div>
  );
}

function CommentThread({ report, leaderId }: { report: CoachReport; leaderId: string }) {
  const addNote = useAddNote(leaderId);
  const [draft, setDraft] = useState('');
  const notes = report.notes ?? [];

  const submit = () => {
    const body = draft.trim();
    if (!body) return;
    addNote.mutate(
      { reportId: report.id, body },
      {
        onSuccess: () => {
          setDraft('');
          toast.success('Comment sent to the leader');
        },
        onError: () => toast.error('Could not post the comment'),
      },
    );
  };

  return (
    <div style={{ padding: '14px 20px 18px' }}>
      {notes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          {notes.map((m) => (
            <div key={m.id} style={{ display: 'flex', gap: 11 }}>
              <div style={{ width: 30, height: 30, flex: 'none', borderRadius: '50%', background: dt.goldChip, color: dt.gold2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11 }}>YC</div>
              <div style={{ background: dt.innerBg, border: `1px solid ${dt.cardBorder}`, borderRadius: 10, padding: '10px 13px', flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 2 }}>You (Coach)</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.5, color: dt.darkBorder }}>{m.body}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a coaching comment…"
          rows={2}
          data-testid={`oversight-comment-${report.id}`}
          style={{ flex: 1, resize: 'vertical', fontSize: 13.5, padding: '10px 12px', border: `1px solid ${dt.inputBorder}`, borderRadius: 9, background: dt.cardBg, color: dt.textPrimary, lineHeight: 1.5, fontFamily: dt.sans }}
        />
        <button type="button" onClick={submit} disabled={addNote.isPending || !draft.trim()} style={{ flex: 'none', background: dt.darkBg, color: dt.goldChip, fontWeight: 700, fontSize: 13, padding: '11px 16px', borderRadius: 9, border: 'none', cursor: draft.trim() ? 'pointer' : 'default', opacity: addNote.isPending || !draft.trim() ? 0.6 : 1 }}>
          {addNote.isPending ? 'Sending…' : 'Comment'}
        </button>
      </div>
    </div>
  );
}

// ─── View 3 · Program trends ────────────────────────────────────────────────

function TrendsView({ onOpenLeader, onBack }: { onOpenLeader: (id: string) => void; onBack: () => void }) {
  const [month, setMonth] = useState(currentMonth());
  const [showKey, setShowKey] = useState(false);
  const [compareIds, setCompareIds] = useState<string[] | null>(null);
  const query = useAdminMonthly(month);
  const state = coachState(query);
  const data = query.data;
  const threeMonths = useThreeMonths();

  const [known, setKnown] = useState<string[]>([]);
  const available = data?.availableMonths;
  useEffect(() => {
    if (available && available.length) setKnown(available);
  }, [available]);
  const months = known.length ? known : [month];

  return (
    <div style={{ paddingTop: 22 }}>
      <button type="button" onClick={onBack} style={backLink}>← All leaders</button>
      <div style={{ margin: '14px 0 20px' }}>
        <h2 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 30, margin: '0 0 6px', letterSpacing: '-.01em' }}>Program-wide trends</h2>
        <p style={{ fontSize: 15, color: dt.textMuted, margin: 0 }}>Group coaching health across all your leaders. Click a month for its full breakdown.</p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22 }}>
        {months.map((m) => {
          const active = m === month;
          const loaded = data && data.month === m;
          return (
            <button key={m} type="button" onClick={() => setMonth(m)} data-testid={`oversight-month-${m}`} style={{ cursor: 'pointer', textAlign: 'left', background: active ? dt.darkBg : dt.innerBg, color: active ? dt.goldChip : dt.textPrimary, border: `1px solid ${active ? dt.darkBg : dt.cardBorder}`, borderRadius: 12, padding: '12px 18px', minWidth: 140 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{monthLabel(m)}</div>
              <div style={{ fontSize: 12.5, opacity: 0.72, marginTop: 2 }}>{loaded && data.program.avgScore != null ? `${data.program.avgScore.toFixed(1)} · ${data.program.sessions} sessions` : 'View summary'}</div>
            </button>
          );
        })}
      </div>

      <CoachGate loading={state.loading} authError={state.authError} error={state.error} onRetry={() => query.refetch()}>
        {data ? (
          <TrendsDetail
            data={data}
            threeMonths={threeMonths}
            compareIds={compareIds}
            onToggleCompare={(id) =>
              setCompareIds((cur) => {
                const base = cur ?? defaultCompareIds(threeMonths);
                if (base.includes(id)) return base.filter((x) => x !== id);
                if (base.length >= 8) return base;
                return [...base, id];
              })
            }
            showKey={showKey}
            onToggleKey={() => setShowKey((v) => !v)}
            onOpenLeader={onOpenLeader}
          />
        ) : null}
      </CoachGate>
    </div>
  );
}

const CLUSTER_KEY = 'BM = Building Ministry · TC = Teaching Craft · EP = Engaging People · BR = Being Real · SESS = Sessions · COMP = Composite (out of 100)';
const DIM_KEY = 'D1 Structure & Flow · D2 Newcomer Welcome · D3 Scripture · D4 Facilitation · D5 Application · D6 Participation · D7 Visual Aids · D8 Vulnerability · D9 Memory · D10 Homework · D11 Prayer · D12 Leader Dev';

function TrendsDetail({
  data,
  threeMonths,
  compareIds,
  onToggleCompare,
  showKey,
  onToggleKey,
  onOpenLeader,
}: {
  data: CoachMonthly;
  threeMonths: { month: string; label: string; data: CoachMonthly | undefined }[];
  compareIds: string[] | null;
  onToggleCompare: (id: string) => void;
  showKey: boolean;
  onToggleKey: () => void;
  onOpenLeader: (id: string) => void;
}) {
  const composite = data.program.avgScore;
  const band = statusBand(compositeStatus(composite));
  const leaders = [...data.leaders].sort((a, b) => (b.avgScore ?? 0) - (a.avgScore ?? 0));
  const top = leaders[0];

  // Multi-month program composite + per-leader comparison.
  const loadedMonths = threeMonths.filter((m) => m.data);
  const programLine = loadedMonths.map((m) => Math.round((m.data?.program.avgScore ?? 0) * 10) / 10);
  const programLabels = loadedMonths.map((m) => m.label.split(' ')[0]);
  const series = leaderMonthlySeries(threeMonths);
  const nameFor = (id: string) => leaders.find((l) => l.id === id)?.name ?? id;
  const activeCompare = compareIds ?? defaultCompareIds(threeMonths);
  const compareSeries = activeCompare
    .map((id, i) => ({ name: nameFor(id), color: CLUSTER_PALETTE[i % CLUSTER_PALETTE.length], values: series.get(id) ?? [] }))
    .filter((s) => s.values.length > 1);

  // Score distribution by status.
  const distribution = ['Exceptional', 'Strong', 'On Target', 'Developing'].map((label) => {
    const rows = leaders.filter((l) => l.status === label);
    const bd = statusBand(label);
    return { label, count: rows.length, names: rows.map((r) => r.name).join(', ') || '—', c: bd.c, bg: bd.bg };
  });

  return (
    <>
      {/* Month header band */}
      <div style={{ background: dt.darkBg, color: dt.darkText, borderRadius: 14, padding: '26px 30px', marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.12em', color: dt.brightGold, marginBottom: 8 }}>PROGRAM-WIDE MONTHLY SUMMARY</div>
            <h3 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 28, margin: '0 0 6px' }}>{data.monthLabel}</h3>
            <div style={{ fontSize: 13.5, color: dt.darkMuted }}>{data.program.sessions} sessions · {data.program.activeLeaders} leaders evaluated</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: dt.serif, fontSize: 40, lineHeight: 1, color: dt.darkText }}>{composite != null ? composite.toFixed(1) : '—'}<span style={{ fontSize: 18, color: dt.darkMuted2 }}> / 100</span></div>
            <div style={{ display: 'inline-block', marginTop: 8, fontSize: 11, fontWeight: 700, letterSpacing: '.05em', color: band.c, background: band.bg, padding: '4px 10px', borderRadius: 6 }}>{compositeStatus(composite)}</div>
            {data.program.delta != null && <div style={{ fontSize: 12.5, color: '#9FCBA8', marginTop: 6 }}>{data.program.delta >= 0 ? '▲ ' : '▼ '}{Math.abs(data.program.delta).toFixed(1)} vs. prior month</div>}
          </div>
        </div>
        {top && <div style={{ fontSize: 13.5, color: '#CFC6B4', marginTop: 14 }}>Top leader this month · <span style={{ color: dt.darkText, fontWeight: 600 }}>{top.name} · {top.avgScore?.toFixed(1)}</span></div>}
      </div>

      {/* Executive summary prose */}
      {data.narrative?.executiveSummary?.length ? (
        <p style={{ fontFamily: dt.serif, fontSize: 18, lineHeight: 1.55, color: dt.darkBorder, margin: '0 0 26px' }}>{data.narrative.executiveSummary[0]}</p>
      ) : null}

      {/* Leader trajectories */}
      {compareSeries.length > 0 && (
        <div style={{ ...innerCard, padding: '20px 22px 14px', marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
            <span style={{ ...kicker, marginBottom: 0 }}>LEADER TRAJECTORIES · {loadedMonths.map((m) => m.label.split(' ')[0]).join(' → ')}</span>
            <span style={{ fontSize: 12, color: dt.textLight }}>Tap a leader to add or remove their line</span>
          </div>
          <MultiLineChart series={compareSeries} min={50} max={100} labels={loadedMonths.map((m) => m.label.split(' ')[0])} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {leaders.filter((l) => (series.get(l.id) ?? []).length > 1).map((l) => {
              const idx = activeCompare.indexOf(l.id);
              const on = idx >= 0;
              return (
                <button key={l.id} type="button" onClick={() => onToggleCompare(l.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, padding: '6px 11px', borderRadius: 99, background: on ? dt.darkBg : dt.innerBg, color: on ? dt.goldChip : dt.textMuted, border: `1px solid ${on ? dt.darkBg : dt.cardBorder}` }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: on ? CLUSTER_PALETTE[idx % CLUSTER_PALETTE.length] : '#C4BDAE' }} />{l.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Program composite line */}
      {programLine.length > 1 && (
        <div style={{ ...innerCard, padding: '20px 22px 12px', marginBottom: 26 }}>
          <div style={{ ...kicker, marginBottom: 4 }}>PROGRAM COMPOSITE · LAST {programLine.length} MONTHS</div>
          <AxisLineChart values={programLine} min={50} max={100} color={dt.gold} labels={programLabels} />
        </div>
      )}

      {/* Leaderboard */}
      <h3 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 22, margin: '0 0 12px' }}>Leader leaderboard</h3>
      <div style={{ border: `1px solid ${dt.cardBorder}`, borderRadius: 12, overflow: 'hidden', marginBottom: 30 }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 640 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '34px 1fr 54px 46px 46px 46px 46px 64px 96px', gap: 8, padding: '11px 16px', background: '#F6EFD8', fontSize: 10.5, fontWeight: 700, letterSpacing: '.03em', color: dt.gold }}>
              <div>#</div><div>LEADER</div>
              {['SESS', 'BM', 'TC', 'EP', 'BR', 'COMP'].map((h) => (
                <button key={h} type="button" onClick={onToggleKey} style={{ textAlign: 'right', cursor: 'pointer', background: 'none', border: 'none', font: 'inherit', color: 'inherit', textDecoration: 'underline dotted', textUnderlineOffset: 3 }}>{h}</button>
              ))}
              <div style={{ textAlign: 'right' }}>STATUS</div>
            </div>
            {showKey && <div style={{ padding: '10px 16px', background: '#FBF7EE', borderTop: `1px solid ${dt.rowDivider}`, fontSize: 12, color: dt.gold2, lineHeight: 1.6 }}>{CLUSTER_KEY}</div>}
            {leaders.map((l, i) => {
              const b = statusBand(l.status);
              const cl = clusterAvgs(l);
              return (
                <button key={l.id} type="button" onClick={() => onOpenLeader(l.id)} style={{ display: 'grid', gridTemplateColumns: '34px 1fr 54px 46px 46px 46px 46px 64px 96px', gap: 8, padding: '8px 16px', borderTop: `1px solid ${dt.rowDivider}`, fontSize: 13, alignItems: 'center', cursor: 'pointer', width: '100%', background: 'none', border: 'none', textAlign: 'left' }}>
                  <div style={{ color: dt.textLighter, fontWeight: 700 }}>{i + 1}</div>
                  <div style={{ fontWeight: 600 }}>{l.name}</div>
                  <div style={{ textAlign: 'right', color: dt.textLight }}>{l.sessions}</div>
                  <div style={{ textAlign: 'right', color: dt.textMuted, fontVariantNumeric: 'tabular-nums' }}>{cl.bm ?? '—'}</div>
                  <div style={{ textAlign: 'right', color: dt.textMuted, fontVariantNumeric: 'tabular-nums' }}>{cl.tc ?? '—'}</div>
                  <div style={{ textAlign: 'right', color: dt.textMuted, fontVariantNumeric: 'tabular-nums' }}>{cl.ep ?? '—'}</div>
                  <div style={{ textAlign: 'right', color: dt.textMuted, fontVariantNumeric: 'tabular-nums' }}>{cl.br ?? '—'}</div>
                  <div style={{ textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{l.avgScore?.toFixed(1) ?? '—'}</div>
                  <div style={{ justifySelf: 'end', fontSize: 9.5, fontWeight: 700, padding: '4px 7px', borderRadius: 5, color: b.c, background: b.bg }}>{l.status}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Score distribution */}
      <h3 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 22, margin: '0 0 12px' }}>Score distribution</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 12, marginBottom: 30 }}>
        {distribution.map((d) => (
          <div key={d.label} style={{ ...innerCard, padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', color: d.c, background: d.bg, padding: '4px 9px', borderRadius: 6 }}>{d.label}</span>
              <span style={{ fontWeight: 700, fontSize: 18 }}>{d.count}</span>
            </div>
            <div style={{ fontSize: 12.5, color: dt.textLight, lineHeight: 1.5 }}>{d.names}</div>
          </div>
        ))}
      </div>

      {/* Heat map */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, margin: '0 0 6px' }}>
        <h3 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 22, margin: 0 }}>Dimension heat map</h3>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: dt.textLight }}>Green ≥ 4.0 · Amber 3.0–3.9 · Red ≤ 2.9</span>
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 12.5, color: dt.textLight }}>Tap any <strong style={{ color: dt.gold }}>D#</strong> column header to see what it measures.</p>
      <div style={{ overflowX: 'auto', border: `1px solid ${dt.cardBorder}`, borderRadius: 12, marginBottom: 30 }}>
        <div style={{ minWidth: 760 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '150px repeat(12, 1fr)', gap: 3, padding: '10px 12px', background: '#F6EFD8', fontSize: 10, fontWeight: 700, color: dt.gold }}>
            <div>LEADER</div>
            {Array.from({ length: 12 }, (_, i) => (
              <button key={i} type="button" onClick={onToggleKey} style={{ textAlign: 'center', cursor: 'pointer', background: 'none', border: 'none', font: 'inherit', color: 'inherit', textDecoration: 'underline dotted', textUnderlineOffset: 3 }}>D{i + 1}</button>
            ))}
          </div>
          {showKey && <div style={{ padding: '10px 12px', background: '#FBF7EE', borderTop: `1px solid ${dt.rowDivider}`, fontSize: 12, color: dt.gold2, lineHeight: 1.7 }}>{DIM_KEY}</div>}
          {leaders.map((l) => (
            <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '150px repeat(12, 1fr)', gap: 3, padding: '5px 12px', borderTop: `1px solid ${dt.rowDivider}`, alignItems: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name}</div>
              {l.dimensions.map((d) => {
                const v = d.avg;
                const cc = cellColor(v);
                return <div key={d.n} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: cc.c, background: cc.bg, padding: '5px 0', borderRadius: 4 }}>{v == null ? 'N/A' : v.toFixed(1)}</div>;
              })}
            </div>
          ))}
        </div>
      </div>

      {/* What's moving */}
      {data.narrative?.trends?.length ? (
        <>
          <h3 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 22, margin: '0 0 12px' }}>What's moving</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 30 }}>
            {data.narrative.trends.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, fontSize: 14, lineHeight: 1.55, color: dt.body }}><span style={{ color: dt.gold, flex: 'none' }}>●</span><span>{t}</span></div>
            ))}
          </div>
        </>
      ) : null}

      {/* Coaching priority matrix */}
      <h3 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 22, margin: '0 0 12px' }}>Coaching priority matrix</h3>
      <div style={{ border: `1px solid ${dt.cardBorder}`, borderRadius: 12, overflow: 'hidden', marginBottom: 30 }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 620 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 56px 110px 1.4fr', gap: 12, padding: '11px 16px', background: '#F6EFD8', fontSize: 10.5, fontWeight: 700, letterSpacing: '.03em', color: dt.gold }}>
              <div>LEADER</div><div style={{ textAlign: 'right' }}>COMP</div><div>PRIORITY</div><div>KEY AREA TO WORK ON</div>
            </div>
            {leaders.map((l) => {
              const pri = priorityFor(l);
              const weak = [...l.dimensions].filter((d) => d.avg != null).sort((a, b) => (a.avg ?? 0) - (b.avg ?? 0))[0];
              return (
                <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '150px 56px 110px 1.4fr', gap: 12, padding: '12px 16px', borderTop: `1px solid ${dt.rowDivider}`, fontSize: 13, alignItems: 'start' }}>
                  <div style={{ fontWeight: 600, paddingTop: 1 }}>{l.name}</div>
                  <div style={{ textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums', paddingTop: 1 }}>{l.avgScore?.toFixed(1) ?? '—'}</div>
                  <div><span style={{ fontSize: 10.5, fontWeight: 700, color: pri.c, background: pri.bg, padding: '4px 8px', borderRadius: 6, display: 'inline-block' }}>{pri.label}</span></div>
                  <div style={{ fontSize: 12.5, color: dt.body, lineHeight: 1.5 }}>{weak ? `${weak.name} is the lowest dimension (${weak.avg?.toFixed(1)}/5) — the clearest place to focus next.` : 'Sustain the gains; broaden participation beyond the core voices.'}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Program initiatives */}
      {data.narrative?.executiveSummary && data.narrative.executiveSummary.length > 1 ? (
        <div style={{ background: dt.goldChip, borderRadius: 13, padding: '22px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: dt.gold, marginBottom: 12 }}>RECOMMENDED PROGRAM INITIATIVES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {data.narrative.executiveSummary.slice(1).map((n, i) => (
              <div key={i} style={{ display: 'flex', gap: 11, fontSize: 14, lineHeight: 1.55, color: dt.body }}><span style={{ color: dt.gold, fontWeight: 700, flex: 'none' }}>→</span><span>{n}</span></div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

// ─── View 4 · Class links ───────────────────────────────────────────────────

function ClassLinksView({ roster, onBack, onInvite }: { roster: CoachSummary[]; onBack: () => void; onInvite: () => void }) {
  const classesQuery = useAdminClasses();
  const state = coachState(classesQuery);
  const classes = useMemo(() => classesQuery.data || [], [classesQuery.data]);

  const groups = useMemo(() => {
    const map = new Map<string, { name: string; classes: AdminCoachClass[] }>();
    for (const c of classes) {
      const key = c.leader.id || c.leader.name;
      const g = map.get(key) || { name: c.leader.name, classes: [] };
      g.classes.push(c);
      map.set(key, g);
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [classes]);

  return (
    <div style={{ paddingTop: 22 }}>
      <button type="button" onClick={onBack} style={backLink}>← All leaders</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', margin: '14px 0 20px' }}>
        <div>
          <h2 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 30, margin: '0 0 6px', letterSpacing: '-.01em' }}>Class links</h2>
          <p style={{ fontSize: 15, color: dt.textMuted, margin: 0 }}>The meeting links your notetaker joins, grouped by leader. Click a link to copy it.</p>
        </div>
        <button type="button" onClick={onInvite} style={{ background: dt.darkBg, color: dt.goldChip, fontWeight: 700, fontSize: 13.5, padding: '11px 16px', borderRadius: 9, border: 'none', cursor: 'pointer' }}>+ Add leader</button>
      </div>

      <CoachGate loading={state.loading} authError={state.authError} error={state.error} onRetry={() => classesQuery.refetch()}>
        {groups.length === 0 ? (
          <div style={dashedNote}>No class links yet. Leaders register their classes from their own Class Setup screen.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {groups.map((g) => (
              <div key={g.name} style={{ border: `1px solid ${dt.cardBorder}`, borderRadius: 13, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '14px 18px', background: dt.innerBg, borderBottom: `1px solid ${dt.rowDivider}` }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: dt.goldChip, color: dt.gold2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12.5 }}>{initialsOf(g.name)}</div>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{g.name}</span>
                </div>
                <div style={{ padding: '8px 18px 14px' }}>
                  {g.classes.map((c) => (
                    <div key={c.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1.6fr) 60px', gap: 10, alignItems: 'center', padding: '10px 0', borderTop: `1px solid ${dt.rowDivider}` }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</span>
                      <span style={{ fontSize: 13, color: dt.textMuted }}>{recurrenceLabel(c.recurrence)}{c.classDate ? ` · ${c.classDate.slice(5)}` : ''}</span>
                      {c.zoomLink ? (
                        <a href={c.zoomLink} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: dt.gold, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.zoomLink}</a>
                      ) : (
                        <span style={{ fontSize: 13, color: dt.rust }}>No link yet</span>
                      )}
                      <button type="button" onClick={() => { try { navigator.clipboard.writeText(c.zoomLink); toast.success('Link copied'); } catch { /* ignore */ } }} style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 700, color: dt.gold, background: 'none', border: 'none', cursor: 'pointer' }}>Copy</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CoachGate>
    </div>
  );
}

// ─── Invite modal ───────────────────────────────────────────────────────────

function InviteModal({ onClose }: { onClose: () => void }) {
  const addLeader = useAddLeader();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [study, setStudy] = useState('');

  const submit = () => {
    const e = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) {
      toast.error('Enter a valid email address');
      return;
    }
    addLeader.mutate(
      { email: e, name: name.trim() || undefined, group: study.trim() || undefined },
      {
        onSuccess: (c) => { toast.success(`${c.name} added — invite sent`); onClose(); },
        onError: (err) => toast.error(/409|already/i.test(String(err?.message)) ? 'That email is already a leader' : 'Could not add the leader'),
      },
    );
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(20,18,16,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} data-testid="oversight-invite-modal" style={{ width: 460, maxWidth: '100%', background: dt.cardBg, borderRadius: 16, padding: '28px 30px', boxShadow: '0 30px 70px -20px rgba(20,18,16,.6)' }}>
        <h3 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 24, margin: '0 0 4px' }}>Invite a leader</h3>
        <p style={{ fontSize: 14, color: dt.textMuted, margin: '0 0 20px' }}>They'll get an email to connect their class recordings and start receiving coaching.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ModalField label="Leader name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" data-testid="oversight-invite-name" style={modalInput} /></ModalField>
          <ModalField label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@church.org" data-testid="oversight-invite-email" style={modalInput} /></ModalField>
          <ModalField label="Study / group"><input value={study} onChange={(e) => setStudy(e.target.value)} placeholder="e.g. Men's Study" style={modalInput} /></ModalField>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button type="button" onClick={submit} disabled={addLeader.isPending} data-testid="oversight-invite-send" style={{ ...goldPill, opacity: addLeader.isPending ? 0.6 : 1 }}>{addLeader.isPending ? 'Sending…' : 'Send invite'}</button>
          <button type="button" onClick={onClose} style={{ border: `1px solid ${dt.inputBorder}`, color: dt.textMuted, fontWeight: 600, fontSize: 14, padding: '11px 20px', borderRadius: 9, background: 'transparent', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Small building blocks ──────────────────────────────────────────────────

function NavItem({ label, active, onClick, testId }: { label: string; active: boolean; onClick: () => void; testId: string }) {
  return (
    <button type="button" onClick={onClick} data-testid={testId} style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: active ? dt.textPrimary : dt.textMuted, fontWeight: 500 }}>{label}</button>
  );
}

function StatBox({ label, labelC, children }: { label: string; labelC: string; children: React.ReactNode }) {
  return (
    <div style={{ minWidth: 180, background: dt.innerBg, border: `1px solid ${dt.cardBorder}`, borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: labelC, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: dt.textMuted, display: 'block', marginBottom: 6 }}>{label}</span>
      {children}
    </label>
  );
}

// ─── Data helpers ───────────────────────────────────────────────────────────

function byDateDesc(a: { date: string }, b: { date: string }): number {
  return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
}

function deriveStatus(score: number): string {
  return compositeStatus(score);
}

function compositeStatus(score: number | null): string {
  if (score == null) return 'On Target';
  if (score >= 85) return 'Exceptional';
  if (score >= 72) return 'Strong';
  if (score >= 60) return 'On Target';
  return 'Developing';
}

/** Per-cluster average % for a monthly leader row (rounded whole numbers). */
function clusterAvgs(l: CoachMonthly['leaders'][number]): { bm: number | null; tc: number | null; ep: number | null; br: number | null } {
  const buckets: Record<string, number[]> = { BM: [], TC: [], EP: [], BR: [] };
  for (const d of l.dimensions) {
    if (d.avg == null) continue;
    buckets[clusterForDim(d.n)]?.push(d.avg);
  }
  const pct = (arr: number[]) => (arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length / 5) * 100) : null);
  return { bm: pct(buckets.BM), tc: pct(buckets.TC), ep: pct(buckets.EP), br: pct(buckets.BR) };
}

/** Which cluster (code) a dimension number belongs to (v3 model). */
function clusterForDim(n: number): string {
  // TC: 1,3,5,7,9 · BM: 2,10,12 · EP: 4,6 · BR: 8,11
  if ([1, 3, 5, 7, 9].includes(n)) return 'TC';
  if ([2, 10, 12].includes(n)) return 'BM';
  if ([4, 6].includes(n)) return 'EP';
  return 'BR';
}

/** Default comparison lines: the top leaders (by newest month) with ≥2 points. */
function defaultCompareIds(threeMonths: { data: CoachMonthly | undefined }[]): string[] {
  const series = leaderMonthlySeries(threeMonths);
  const newest = [...(threeMonths[threeMonths.length - 1]?.data?.leaders ?? [])].sort((a, b) => (b.avgScore ?? 0) - (a.avgScore ?? 0));
  return newest.filter((l) => (series.get(l.id) ?? []).length > 1).slice(0, 5).map((l) => l.id);
}

function priorityFor(l: CoachMonthly['leaders'][number]): { label: string; c: string; bg: string } {
  const s = l.avgScore ?? 0;
  if (s < 70) return { label: 'HIGH', c: '#A94E2B', bg: '#F4E1D7' };
  if (s < 80) return { label: 'MEDIUM', c: '#9A6E1F', bg: '#F6EFD8' };
  return { label: 'SUSTAIN', c: '#3E7A54', bg: '#E8EFE6' };
}

function recurrenceLabel(r: string): string {
  switch (r) {
    case 'weekly': return 'Weekly';
    case 'biweekly': return 'Every other week';
    case 'monthly': return 'Monthly';
    case 'daily': return 'Daily';
    default: return 'One-time';
  }
}

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** The month string `back` calendar months before the current one. */
function monthMinus(back: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - back);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const CLUSTER_PALETTE = ['#9A6E1F', '#3E7A54', '#3E6E9A', '#A94E2B', '#8A5A9A', '#2F8F86', '#C9A24B', '#B07A3D'];

function monthLabel(m: string): string {
  const [y, mo] = m.split('-').map(Number);
  const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return mo >= 1 && mo <= 12 ? `${names[mo - 1]} ${y}` : m;
}

function shortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const shellRoot: React.CSSProperties = {
  flex: '1 1 auto',
  minHeight: 0,
  background: dt.pageBg,
  color: dt.textPrimary,
  fontFamily: dt.sans,
  WebkitFontSmoothing: 'antialiased',
  padding: '0 0 80px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  overflowY: 'auto',
};

const card: React.CSSProperties = {
  background: dt.cardBg,
  border: `1px solid ${dt.cardBorder}`,
  borderRadius: 18,
  padding: '36px clamp(18px, 4vw, 40px) 44px',
  marginTop: 32,
  boxShadow: '0 18px 48px -30px rgba(50,40,20,.35)',
};

const topbar: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 16,
  flexWrap: 'wrap',
  paddingBottom: 26,
  borderBottom: `1px solid ${dt.rowDivider}`,
};

const logoMark: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 8, background: dt.darkBg,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: dt.goldChip, fontFamily: dt.serif, fontWeight: 600, fontSize: 17,
};

const avatarChip: React.CSSProperties = {
  width: 34, height: 34, borderRadius: '50%', background: '#E8E8E6',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: 700, color: dt.textMuted, fontSize: 13, overflow: 'hidden',
};

const kicker: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: dt.gold, marginBottom: 10,
};

const innerCard: React.CSSProperties = {
  background: dt.innerBg, border: `1px solid ${dt.cardBorder}`, borderRadius: 13, padding: '18px 20px',
};

const rosterRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '52px 1fr 150px 128px 20px',
  gap: 18,
  alignItems: 'center',
  background: dt.cardBg,
  border: `1px solid ${dt.cardBorder}`,
  borderRadius: 14,
  padding: '16px 22px',
  cursor: 'pointer',
  width: '100%',
  textAlign: 'left',
};

const goldPill: React.CSSProperties = {
  background: dt.brightGold, color: dt.textPrimary, fontWeight: 700, fontSize: 14,
  padding: '11px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
};

const backLink: React.CSSProperties = {
  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
  fontSize: 13.5, fontWeight: 600, color: dt.gold,
};

const dashedNote: React.CSSProperties = {
  background: dt.innerBg, border: `1px dashed ${dt.dashed}`, borderRadius: 12,
  padding: 24, fontSize: 14.5, color: dt.textMuted, lineHeight: 1.65,
};

const modalInput: React.CSSProperties = {
  width: '100%', fontSize: 14, padding: '10px 12px', border: `1px solid ${dt.inputBorder}`,
  borderRadius: 9, background: dt.cardBg, color: dt.textPrimary, fontFamily: dt.sans, boxSizing: 'border-box',
};
