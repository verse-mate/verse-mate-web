/**
 * Coaching dashboard — Home (/coach for an evaluated leader).
 *
 * The morning landing view from the design handoff: a greeting + streak, two
 * stat tiles (latest score, this week's focus), a dark "Next class" band with
 * focus reminders drawn from last week's weakest dimensions, a trajectory chart
 * with a dimension selector, and the most-recent session in full depth
 * (Full report · Scorecard · Question coaching · Next steps).
 *
 * Wired to the real /coach API (profile, reports, trends, classes). The mock's
 * /55 letter grade is presented as the live /100 composite + status label.
 * Choosing a session from the Sessions page opens it here via ?s=<id>.
 */

import { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  useCoachMe,
  useCoachReports,
  useCoachReportsFor,
  useCoachTrends,
  useCoachTrendsFor,
  useCoachClasses,
  useAdminClasses,
  coachState,
} from '@/hooks/useCoach';
import type { CoachClass, CoachReport, CoachTrends } from '@/services/coachService';
import CoachDashboardShell, { CoachGate } from '@/components/coach/CoachDashboardShell';
import CoachSessionDetail from '@/components/coach/CoachSessionDetail';
import CoachLineChart from '@/components/coach/CoachLineChart';
import { dt, firstName, ratingForScore } from '@/components/coach/dashboardTheme';

export default function CoachDashboardScreen() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  // When a :coachId is present this is an admin drilling into a specific leader
  // (admin-only endpoints); otherwise it's the signed-in leader's own dashboard.
  const { coachId } = useParams();
  const admin = !!coachId;
  const base = admin ? `/coach/leader/${coachId}` : '/coach';

  // Only the active branch's queries are enabled.
  const meQuery = useCoachMe();
  const selfReports = useCoachReports({ enabled: !admin });
  const forReports = useCoachReportsFor(coachId ?? '');
  const selfTrends = useCoachTrends({ enabled: !admin });
  const forTrends = useCoachTrendsFor(coachId ?? '');
  const selfClasses = useCoachClasses({ enabled: !admin });
  const adminClasses = useAdminClasses({ enabled: admin });

  const me = coachState(meQuery);
  const reports = admin ? coachState(forReports) : coachState(selfReports);
  const reportList = admin ? forReports.data?.reports : selfReports.data;
  const trends: CoachTrends | undefined = admin ? forTrends.data : selfTrends.data;
  const classes: CoachClass[] = admin
    ? (adminClasses.data || []).filter((c) => c.leader.id === coachId)
    : selfClasses.data || [];

  const list = useMemo(() => [...(reportList || [])].sort(byDateDesc), [reportList]);
  const selId = params.get('s');
  const selectedIdx = selId ? Math.max(0, list.findIndex((r) => r.id === selId)) : 0;
  const selected: CoachReport | null = list[selectedIdx] ?? null;
  const prev = list[selectedIdx + 1];
  const latest = list[0] ?? null;
  const delta = selected && prev ? Math.round((selected.score - prev.score) * 100) / 100 : null;

  const leaderName = admin ? forReports.data?.profile?.name || '' : me.data?.profile?.name || '';

  return (
    <CoachDashboardShell active="home" coachId={coachId} leaderName={leaderName}>
      <CoachGate
        loading={admin ? reports.loading : me.loading || reports.loading}
        authError={me.authError || reports.authError}
        error={me.error || reports.error}
        onRetry={() => {
          meQuery.refetch();
          (admin ? forReports : selfReports).refetch();
        }}
      >
        {!latest || !selected ? (
          <EmptyHome leaderName={leaderName} admin={admin} onAddClass={() => navigate(`${base}/sessions`)} />
        ) : (
          <>
            <Hero
              leaderName={leaderName}
              sessionCount={list.length}
              latest={latest}
              delta={list.length > 1 ? Math.round((latest.score - list[1].score) * 100) / 100 : null}
            />
            <NextClassBand
              nextClass={pickNextClass(classes)}
              latest={latest}
              admin={admin}
              onManage={() => navigate(`${base}/sessions`)}
            />
            <Trajectory trends={trends} selected={selected} prev={prev} onViewTrends={() => navigate(`${base}/trends`)} />
            <CoachSessionDetail
              report={selected}
              delta={delta}
              prev={prev}
              label={selected.id === latest.id ? 'MOST RECENT SESSION' : 'SELECTED SESSION'}
            />
            {selected.id !== latest.id && (
              <div style={{ marginTop: 16 }}>
                <button type="button" onClick={() => setParams({}, { replace: true })} style={linkBtn}>
                  ← Back to the most recent session
                </button>
              </div>
            )}
          </>
        )}
      </CoachGate>
    </CoachDashboardShell>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero({
  leaderName,
  sessionCount,
  latest,
  delta,
}: {
  leaderName: string;
  sessionCount: number;
  latest: CoachReport;
  delta: number | null;
}) {
  const weakest = weakestDimension(latest);
  const deltaText = delta == null ? '—' : delta > 0 ? `▲ ${delta} pts` : delta < 0 ? `▼ ${Math.abs(delta)} pts` : 'no change';
  const deltaColor = delta == null ? dt.textLight : delta >= 0 ? dt.green : dt.rust;

  return (
    <div style={{ padding: '34px 0 6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32, flexWrap: 'wrap', marginBottom: 26 }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12.5,
              fontWeight: 600,
              letterSpacing: '.03em',
              color: dt.gold2,
              background: dt.goldChip,
              padding: '6px 12px',
              borderRadius: 99,
              marginBottom: 16,
            }}
          >
            ● {sessionCount} session{sessionCount === 1 ? '' : 's'} coached
          </div>
          <h1 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 44, lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 10px' }}>
            {greeting()}
            {leaderName ? `, ${firstName(leaderName)}` : ''}
          </h1>
          <p style={{ fontSize: 16.5, lineHeight: 1.5, color: dt.textMuted, margin: 0 }}>
            {subgreeting(latest, delta)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <StatTile label="LATEST SESSION" labelColor={dt.gold}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: dt.serif, fontSize: 30, lineHeight: 1, color: dt.gold2 }}>{Math.round(latest.score)}</span>
              <span style={{ fontSize: 14, color: dt.textLight, fontWeight: 600 }}>/100 · {latest.status}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: deltaColor, marginTop: 6 }}>{deltaText} vs. last</div>
          </StatTile>
          <StatTile label="THIS WEEK'S FOCUS" labelColor={dt.rust}>
            <div style={{ fontFamily: dt.serif, fontSize: 20, lineHeight: 1.1, color: dt.textPrimary }}>
              {weakest ? weakest.name : 'All dimensions solid'}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: dt.rust, marginTop: 6 }}>
              {weakest ? `${weakest.score}/5 · ${ratingForScore(weakest.score).label.toLowerCase()}` : 'no weak spot this week'}
            </div>
          </StatTile>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, labelColor, children }: { label: string; labelColor: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, minWidth: 190, background: dt.innerBg, border: `1px solid ${dt.border2}`, borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: labelColor, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

// ─── Next class band ─────────────────────────────────────────────────────────

function NextClassBand({
  nextClass,
  latest,
  admin,
  onManage,
}: {
  nextClass: CoachClass | null;
  latest: CoachReport;
  admin?: boolean;
  onManage: () => void;
}) {
  const focus = focusReminders(latest);
  return (
    <div style={{ background: dt.darkBg, color: dt.darkText, borderRadius: 14, padding: '26px 30px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 30 }}>
        <div style={{ borderRight: `1px solid ${dt.darkBorder}`, paddingRight: 28 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.14em', color: dt.brightGold, marginBottom: 12 }}>NEXT CLASS</div>
          {nextClass ? (
            <>
              <h2 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 25, lineHeight: 1.15, margin: '0 0 12px' }}>{nextClass.name}</h2>
              <div style={{ fontSize: 13.5, color: dt.darkMuted, lineHeight: 1.7 }}>
                {classDateLine(nextClass)}
                <br />
                {recurrenceLabel(nextClass.recurrence)}
              </div>
              {nextClass.zoomLink && (
                <a href={nextClass.zoomLink} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, fontWeight: 700, color: dt.brightGold }}>
                  Join meeting →
                </a>
              )}
            </>
          ) : (
            <>
              <h2 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 22, lineHeight: 1.15, margin: '0 0 12px' }}>
                {admin ? 'No classes registered' : 'No class scheduled'}
              </h2>
              <button type="button" onClick={onManage} style={{ fontSize: 13, fontWeight: 700, color: dt.brightGold, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {admin ? 'View sessions →' : 'Add a recurring class →'}
              </button>
            </>
          )}
        </div>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.1em', color: dt.darkMuted2, marginBottom: 10 }}>
            FOCUS ON, BASED ON LAST WEEK
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '4px 28px' }}>
            {focus.map((f, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '84px 1fr', gap: 11, padding: '9px 0', borderTop: `1px solid ${dt.darkBorder}`, alignItems: 'start' }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.03em', textAlign: 'center', color: f.c, background: f.bg, padding: '4px 0', borderRadius: 5, width: '100%' }}>
                  {f.band}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: dt.darkText, lineHeight: 1.3 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: dt.darkMuted, lineHeight: 1.4, marginTop: 2 }}>{f.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Trajectory ──────────────────────────────────────────────────────────────

function Trajectory({
  trends,
  selected,
  prev,
  onViewTrends,
}: {
  trends: CoachTrends | undefined;
  selected: CoachReport;
  prev?: CoachReport;
  onViewTrends: () => void;
}) {
  const [dim, setDim] = useSelectedTrendDim();

  const dims = selected.dimensions;
  const options = [{ key: 'overall', label: 'Overall (per session)' }, ...dims.map((d) => ({ key: d.name, label: d.name }))];

  let values: number[];
  let max: number;
  let color: string;
  let labels: string[];
  let trendLabel: string;
  let trendSub: string;

  if (dim === 'overall') {
    const series = trends?.scoreSeries ?? [];
    values = series.map((p) => Math.round(p.score * 10) / 10);
    labels = series.map((p) => shortDate(p.date));
    max = 100;
    color = dt.gold;
    trendLabel = 'Overall score (per session, /100)';
    const d = prev ? Math.round((selected.score - prev.score) * 10) / 10 : null;
    trendSub = d == null ? '' : `${d >= 0 ? '▲ ' : '▼ '}${Math.abs(d)} vs. last session`;
  } else {
    const series = trends?.dimensionSeries ?? [];
    values = series.map((r) => numberOr0(r[dim]));
    labels = series.map((r) => shortDate(String(r.date)));
    max = 5;
    color = dt.green;
    trendLabel = `${dim} (per session, /5)`;
    const n = values.length;
    const d = n >= 2 ? Math.round((values[n - 1] - values[n - 2]) * 10) / 10 : null;
    trendSub = d == null ? '' : `${d >= 0 ? '▲ ' : '▼ '}${Math.abs(d)} vs. last session`;
  }

  const cards = statCards(selected, prev);

  return (
    <div style={{ marginTop: 34, borderTop: `1px solid ${dt.border2}`, paddingTop: 30 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', color: dt.gold, marginBottom: 6 }}>YOUR TRAJECTORY</div>
          <h2 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 27, margin: 0, letterSpacing: '-.01em' }}>
            Sessions, at a glance
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button type="button" onClick={onViewTrends} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 700, color: dt.gold }}>
            View full trends →
          </button>
          <select
            value={dim}
            onChange={(e) => setDim(e.target.value)}
            aria-label="Trend series"
            data-testid="coach-trend-select"
            style={{ fontFamily: dt.sans, fontSize: 14, fontWeight: 600, color: dt.textPrimary, background: dt.fill1, border: `1px solid ${dt.inputBorder}`, borderRadius: 9, padding: '9px 13px', cursor: 'pointer' }}
          >
            {options.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 260px', gap: 26, alignItems: 'center' }}>
        <div style={{ background: dt.innerBg, border: `1px solid ${dt.border2}`, borderRadius: 12, padding: '20px 22px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: dt.textMuted }}>{trendLabel}</span>
            {trendSub && <span style={{ fontSize: 13, fontWeight: 600, color: dt.green }}>{trendSub}</span>}
          </div>
          {values.length > 0 ? (
            <CoachLineChart values={values} max={max} color={color} labels={labels} />
          ) : (
            <div style={{ padding: '30px 0', textAlign: 'center', color: dt.textLight, fontSize: 13 }}>
              Your trend line appears once you have a couple of scored sessions.
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <MiniCard label="STRONGEST" labelC={dt.green} bg={dt.greenBg} name={cards.strongest.name} sub={`${cards.strongest.score}/5`} subC="#5C7A5F" />
          <MiniCard label="MOST IMPROVED" labelC={dt.gold} bg={dt.goldChip} name={cards.improved.name} sub={cards.improved.diff > 0 ? `▲ ${cards.improved.diff} since last` : 'holding steady'} subC={dt.gold} />
          <MiniCard label="NEEDS WORK" labelC={dt.rust} bg={dt.rustBg} name={cards.weakest.name} sub={`${cards.weakest.score}/5`} subC={dt.rust} />
        </div>
      </div>
    </div>
  );
}

function MiniCard({ label, labelC, bg, name, sub, subC }: { label: string; labelC: string; bg: string; name: string; sub: string; subC: string }) {
  return (
    <div style={{ background: bg, borderRadius: 11, padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: labelC }}>{label}</div>
      <div style={{ fontFamily: dt.serif, fontSize: 18, marginTop: 3 }}>{name}</div>
      <div style={{ fontSize: 13, color: subC, fontWeight: 600 }}>{sub}</div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyHome({ leaderName, admin, onAddClass }: { leaderName: string; admin?: boolean; onAddClass: () => void }) {
  return (
    <div style={{ padding: '48px 0' }}>
      <h1 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 40, margin: '0 0 12px', letterSpacing: '-.02em' }}>
        {admin ? leaderName || 'This leader' : `${greeting()}${leaderName ? `, ${firstName(leaderName)}` : ''}`}
      </h1>
      <p style={{ fontSize: 16, color: dt.textMuted, margin: '0 0 20px', maxWidth: 560, lineHeight: 1.6 }}>
        {admin
          ? 'No sessions have been scored for this leader yet. Once a session is recorded and coached, its feedback, scores, and trends appear here.'
          : 'No sessions have been scored yet. Once your first session is recorded and coached, your feedback, scores, and trends appear here. Register the classes your notetaker should join to get started.'}
      </p>
      <button
        type="button"
        onClick={onAddClass}
        style={{ background: dt.darkBg, color: dt.goldChip, fontWeight: 700, fontSize: 13.5, padding: '10px 16px', borderRadius: 9, border: 'none', cursor: 'pointer' }}
      >
        {admin ? 'View sessions →' : '+ Add a class'}
      </button>
    </div>
  );
}

// ─── Data helpers ────────────────────────────────────────────────────────────

const DARK_CHIP: Record<string, { c: string; bg: string }> = {
  'NEEDS WORK': { c: '#E8A87C', bg: '#4A3227' },
  'ON TARGET': { c: '#E4C878', bg: '#403820' },
  STRONG: { c: '#9FCBA8', bg: '#2A3A2E' },
  'N/A': { c: '#B7AD98', bg: '#33302A' },
};

function focusReminders(latest: CoachReport): { band: string; c: string; bg: string; title: string; note: string }[] {
  const scored = latest.dimensions.filter((d) => d.score != null);
  const sorted = [...scored].sort((a, b) => (a.score ?? 0) - (b.score ?? 0)).slice(0, 5);
  return sorted.map((d) => {
    const band = ratingForScore(d.score).label;
    const chip = DARK_CHIP[band] ?? DARK_CHIP['N/A'];
    return {
      band,
      c: chip.c,
      bg: chip.bg,
      title: d.name,
      note: truncate(d.note?.trim() || 'Focus here to lift next week’s composite.', 120),
    };
  });
}

function weakestDimension(report: CoachReport): { name: string; score: number } | null {
  const scored = report.dimensions.filter((d) => d.score != null) as { name: string; score: number }[];
  if (scored.length === 0) return null;
  return scored.reduce((min, d) => (d.score < min.score ? d : min));
}

function statCards(report: CoachReport, prev?: CoachReport) {
  const scored = report.dimensions.filter((d) => d.score != null) as { n: number; name: string; score: number }[];
  const strongest = scored.reduce((m, d) => (d.score > m.score ? d : m), scored[0] ?? { name: '—', score: 0 });
  const weakest = scored.reduce((m, d) => (d.score < m.score ? d : m), scored[0] ?? { name: '—', score: 0 });
  let improved = { name: '—', diff: 0 };
  if (prev) {
    let best = -Infinity;
    for (const d of report.dimensions) {
      const p = prev.dimensions.find((x) => x.n === d.n);
      if (d.score == null || p?.score == null) continue;
      const diff = Math.round((d.score - p.score) * 10) / 10;
      if (diff > best) {
        best = diff;
        improved = { name: d.name, diff };
      }
    }
  }
  return { strongest, weakest, improved };
}

function pickNextClass(classes: CoachClass[] | undefined): CoachClass | null {
  if (!classes || classes.length === 0) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dated = classes
    .filter((c) => c.classDate)
    .map((c) => ({ c, t: dateValue(c.classDate!) }))
    .filter((x) => x.t >= today.getTime())
    .sort((a, b) => a.t - b.t);
  if (dated.length) return dated[0].c;
  // No future-dated class → the first recurring one is the "next" class.
  return classes.find((c) => c.recurrence !== 'none') ?? classes[0];
}

function classDateLine(c: CoachClass): string {
  if (!c.classDate) return 'Recurring — no date pinned';
  const [y, m, d] = c.classDate.split('-').map(Number);
  if (!y || !m || !d) return c.classDate;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

function recurrenceLabel(r: string): string {
  switch (r) {
    case 'weekly':
      return 'Repeats weekly';
    case 'biweekly':
      return 'Repeats every other week';
    case 'monthly':
      return 'Repeats monthly';
    case 'daily':
      return 'Repeats daily';
    default:
      return 'One-time class';
  }
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function subgreeting(latest: CoachReport, delta: number | null): string {
  if (delta != null && delta > 0) return `${latest.session} just landed your best score in a while — up ${delta} points.`;
  return `Here's where you stand after ${latest.session}.`;
}

function useSelectedTrendDim(): [string, (v: string) => void] {
  const [params, setParams] = useSearchParams();
  const dim = params.get('t') || 'overall';
  const setDim = (v: string) => {
    const next = new URLSearchParams(params);
    if (v === 'overall') next.delete('t');
    else next.set('t', v);
    setParams(next, { replace: true });
  };
  return [dim, setDim];
}

function byDateDesc(a: { date: string }, b: { date: string }): number {
  return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
}

function shortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function dateValue(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1).getTime();
}

function numberOr0(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;
}

const linkBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  color: dt.gold,
  fontWeight: 700,
  fontSize: 13.5,
  cursor: 'pointer',
};
