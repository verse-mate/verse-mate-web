/**
 * The two headline trend charts for the coach portal, extracted so they can be
 * shown both on the dedicated /coach/trends screen AND inline (open by default)
 * on the desktop dashboard / leader views:
 *
 *   • ScoreTrendCard   — session score over time (line, 0–100)
 *   • ClusterTrendCard — per-session cluster contributions (stacked bars)
 *
 * Both take the already-fetched CoachTrends payload so a parent decides how to
 * lay them out (stacked on mobile, side-by-side on desktop).
 */

import { useMemo } from 'react';
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
import { vmTokens } from '@/styles/themeStyles';
import type { CoachTrends } from '@/services/coachService';
import { CoachCard, SectionLabel } from './CoachUi';

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

/** recharts click state carries the clicked row under activePayload[0].payload;
 *  pull the ISO date so the parent can open that session's report. */
function pickDate(state: { activePayload?: { payload?: { date?: string | number } }[] } | null): string | null {
  const d = state?.activePayload?.[0]?.payload?.date;
  return d != null ? String(d) : null;
}

export function ScoreTrendCard({
  trends,
  onSelectDate,
}: {
  trends: CoachTrends | undefined;
  onSelectDate?: (isoDate: string) => void;
}) {
  const scoreData = useMemo(
    () => (trends?.scoreSeries || []).map((p) => ({ ...p, label: shortDate(p.date) })),
    [trends],
  );
  const clickable = !!onSelectDate;
  const handleClick = clickable
    ? (state: Parameters<NonNullable<React.ComponentProps<typeof LineChart>['onClick']>>[0]) => {
        const d = pickDate(state);
        if (d) onSelectDate?.(d);
      }
    : undefined;

  return (
    <CoachCard testId="coach-trend-score">
      <SectionLabel>Session score over time{clickable ? ' · tap a point to open' : ''}</SectionLabel>
      {scoreData.length >= 2 ? (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={scoreData}
            margin={{ top: 6, right: 8, left: -18, bottom: 0 }}
            onClick={handleClick}
            style={clickable ? { cursor: 'pointer' } : undefined}
          >
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
              activeDot={{ r: 6, cursor: clickable ? 'pointer' : undefined }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <EmptyChart>One session so far — the trend line appears after your next scored session.</EmptyChart>
      )}
    </CoachCard>
  );
}

export function ClusterTrendCard({
  trends,
  onSelectDate,
}: {
  trends: CoachTrends | undefined;
  onSelectDate?: (isoDate: string) => void;
}) {
  const clusterData = useMemo(
    () => (trends?.clusterSeries || []).map((r) => ({ ...r, label: shortDate(String(r.date)) })),
    [trends],
  );
  const clickable = !!onSelectDate;
  const handleClick = clickable
    ? (state: Parameters<NonNullable<React.ComponentProps<typeof BarChart>['onClick']>>[0]) => {
        const d = pickDate(state);
        if (d) onSelectDate?.(d);
      }
    : undefined;

  return (
    <CoachCard testId="coach-trend-cluster">
      <SectionLabel>Cluster contributions per session{clickable ? ' · tap a bar to open' : ''}</SectionLabel>
      {clusterData.length >= 1 ? (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={clusterData}
              margin={{ top: 6, right: 8, left: -18, bottom: 0 }}
              onClick={handleClick}
              style={clickable ? { cursor: 'pointer' } : undefined}
            >
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
