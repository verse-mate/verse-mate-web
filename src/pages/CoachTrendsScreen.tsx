/**
 * Coach trends (/coach/trends) — how a leader's sessions move over time.
 *
 * Three views, all fed by GET /coach/trends:
 *   1. Session score over time (line) + the latest-vs-prior delta.
 *   2. Cluster contribution per session (stacked bars → the base composite).
 *   3. The latest session's dimensions (0–5 bars, N/A shown explicitly).
 */

import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ScreenHeader from '@/components/ScreenHeader';
import { vmTokens } from '@/styles/themeStyles';
import {
  useCoachTrends,
  useCoachReports,
  useCoachTrendsFor,
  useCoachReportsFor,
  coachState,
} from '@/hooks/useCoach';
import { CoachCard, CoachStateBoundary, SectionLabel } from '@/components/coach/CoachUi';

// Cluster palette — mid-tone hues that read on both light and dark surfaces.
const CLUSTER_COLORS: Record<string, string> = {
  'Teaching Craft': '#B09A6D', // brand gold
  'Building Ministry': '#4F86C6',
  'Engaging People': '#5FA777',
  'Being Real': '#C77DA6',
};
const CLUSTER_ORDER = ['Teaching Craft', 'Building Ministry', 'Engaging People', 'Being Real'];

const AXIS = '#9a9a9a';
const GRID = 'rgba(150,150,150,0.2)';

export default function CoachTrendsScreen() {
  const navigate = useNavigate();
  // When a :coachId param is present this is an admin drilling into a specific
  // leader (admin-only endpoints); otherwise it's the signed-in coach's own
  // trends. Only the active pair of queries is enabled.
  const { coachId } = useParams();
  const adminView = !!coachId;

  const selfTrends = useCoachTrends({ enabled: !adminView });
  const selfReports = useCoachReports({ enabled: !adminView });
  const forTrends = useCoachTrendsFor(coachId ?? '');
  const forReports = useCoachReportsFor(coachId ?? '');

  const trendsQuery = adminView ? forTrends : selfTrends;
  const trends = coachState(trendsQuery);
  // coachState is called per-branch: the admin reports query ({ profile,
  // reports }) and the self query (CoachReport[]) have different data shapes,
  // so they can't be unioned before coachState. Only loading/auth/error are
  // read here — the report list is normalized separately below.
  const reports = adminView ? coachState(forReports) : coachState(selfReports);

  // Self reports query returns CoachReport[]; the admin one returns
  // { profile, reports }. Normalize to the report list for the dimension bars.
  const reportList = adminView ? forReports.data?.reports : selfReports.data;
  const latest = reportList && reportList.length ? reportList[0] : null;
  const backTo = adminView ? `/coach/leader/${coachId}` : '/coach';

  const scoreData = useMemo(
    () => (trends.data?.scoreSeries || []).map((p) => ({ ...p, label: shortDate(p.date) })),
    [trends.data],
  );
  const clusterData = useMemo(
    () => (trends.data?.clusterSeries || []).map((r) => ({ ...r, label: shortDate(String(r.date)) })),
    [trends.data],
  );

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader title="Trends" onBack={() => navigate(backTo)} backTestId="coach-trends-back-button" />

      <div
        data-testid="coach-trends"
        style={{ flex: 1, overflowY: 'auto', borderTop: `1px solid ${vmTokens.divider}` }}
      >
        <CoachStateBoundary
          loading={trends.loading || reports.loading}
          authError={trends.authError || reports.authError}
          error={trends.error || reports.error}
          onRetry={() => {
            trendsQuery.refetch();
            (adminView ? forReports : selfReports).refetch();
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, maxWidth: 640, margin: '0 auto' }}>
            {/* Delta summary */}
            {trends.data?.delta && (
              <CoachCard testId="coach-trends-delta">
                <SectionLabel>Since last session</SectionLabel>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span
                    style={{
                      fontSize: 30,
                      fontWeight: 700,
                      color: trends.data.delta.score >= 0 ? vmTokens.statusSuccess : vmTokens.statusError,
                    }}
                  >
                    {trends.data.delta.score >= 0 ? '+' : ''}
                    {trends.data.delta.score.toFixed(1)}
                  </span>
                  <span style={{ fontSize: 13, color: vmTokens.textTertiary }}>
                    {trends.data.delta.from.toFixed(1)} → {trends.data.delta.to.toFixed(1)} points
                  </span>
                </div>
              </CoachCard>
            )}

            {/* Score over time */}
            <CoachCard>
              <SectionLabel>Session score over time</SectionLabel>
              {scoreData.length >= 2 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={scoreData} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke={GRID} vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={{ stroke: GRID }} />
                    <YAxis domain={[0, 100]} tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                    <Tooltip content={<ScoreTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke={vmTokens.gold}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: vmTokens.gold }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart>One session so far — the trend line appears after your next scored session.</EmptyChart>
              )}
            </CoachCard>

            {/* Cluster contributions */}
            <CoachCard>
              <SectionLabel>Cluster contributions per session</SectionLabel>
              {clusterData.length >= 1 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={clusterData} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke={GRID} vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={{ stroke: GRID }} />
                      <YAxis domain={[0, 100]} tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                      <Tooltip content={<ClusterTooltip />} cursor={{ fill: 'rgba(150,150,150,0.08)' }} />
                      {CLUSTER_ORDER.map((name) => (
                        <Bar key={name} dataKey={name} stackId="c" fill={CLUSTER_COLORS[name]} radius={[0, 0, 0, 0]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                  <Legend />
                </>
              ) : (
                <EmptyChart>No sessions yet.</EmptyChart>
              )}
            </CoachCard>

            {/* Latest session dimensions */}
            {latest && (
              <CoachCard>
                <SectionLabel>Latest session — 12 dimensions</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {latest.dimensions.map((d) => (
                    <div key={d.n}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 12.5, color: vmTokens.textSecondary }}>{d.name}</span>
                        <span style={{ fontSize: 12, color: vmTokens.textTertiary }}>
                          {d.score == null ? 'N/A' : `${d.score}/5`}
                        </span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: vmTokens.divider, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: d.score == null ? '0%' : `${(d.score / 5) * 100}%`,
                            height: '100%',
                            background: vmTokens.gold,
                            borderRadius: 3,
                          }}
                        />
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

function Legend() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12, justifyContent: 'center' }}>
      {CLUSTER_ORDER.map((name) => (
        <span key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: vmTokens.textSecondary }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: CLUSTER_COLORS[name] }} />
          {name}
        </span>
      ))}
    </div>
  );
}

function EmptyChart({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '24px 8px', textAlign: 'center', fontSize: 13, color: vmTokens.textTertiary }}>{children}</div>
  );
}

interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: { dateLabel?: string; session?: string; status?: string };
}

function ScoreTooltip({ active, payload }: { active?: boolean; payload?: TooltipEntry[] }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  return (
    <TooltipBox>
      <p style={tipTitle}>{p?.dateLabel}</p>
      <p style={tipRow}>{p?.session}</p>
      <p style={tipRow}>
        <strong style={{ color: vmTokens.textPrimary }}>{Number(payload[0].value).toFixed(1)}</strong> · {p?.status}
      </p>
    </TooltipBox>
  );
}

function ClusterTooltip({ active, payload }: { active?: boolean; payload?: TooltipEntry[] }) {
  if (!active || !payload || !payload.length) return null;
  const total = payload.reduce((a, e) => a + (Number(e.value) || 0), 0);
  return (
    <TooltipBox>
      <p style={tipTitle}>{payload[0].payload?.dateLabel}</p>
      {payload.map((e) => (
        <p key={e.name} style={{ ...tipRow, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: e.color }} />
          {e.name}: {Number(e.value).toFixed(1)}
        </p>
      ))}
      <p style={{ ...tipRow, marginTop: 4, color: vmTokens.textPrimary }}>Base: {total.toFixed(1)}</p>
    </TooltipBox>
  );
}

function TooltipBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: vmTokens.surfaceRaisedBg,
        border: `1px solid ${vmTokens.divider}`,
        borderRadius: 10,
        padding: '8px 10px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        maxWidth: 220,
      }}
    >
      {children}
    </div>
  );
}

const tipTitle: React.CSSProperties = { margin: 0, fontSize: 12, fontWeight: 700, color: vmTokens.textPrimary };
const tipRow: React.CSSProperties = { margin: '3px 0 0', fontSize: 11.5, color: vmTokens.textSecondary };

function shortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}
