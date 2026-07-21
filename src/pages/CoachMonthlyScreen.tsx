/**
 * Monthly cross-leader analysis (/coach/monthly, program admins only).
 *
 * Replicates the coaching pipeline's monthly summary in the portal: a
 * program-wide rollup (sessions, active leaders, newcomers, average composite +
 * month-over-month delta, cluster averages) and a per-leader table with each
 * leader's monthly composite, status, delta, and a 12-dimension heatmap. Data
 * is computed live by the backend from the same report dataset, so it always
 * reflects the current v3 weighted model.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import ScreenHeader from '@/components/ScreenHeader';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { vmTokens } from '@/styles/themeStyles';
import { useAdminMonthly, coachState } from '@/hooks/useCoach';
import { CoachCard, CoachStateBoundary, SectionLabel, StatusPill } from '@/components/coach/CoachUi';
import { statusColor, type MonthlyLeader } from '@/services/coachService';

export default function CoachMonthlyScreen() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [month, setMonth] = useState(currentMonth());
  const query = useAdminMonthly(month);
  const state = coachState(query);
  const data = state.data;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader title="Monthly summary" onBack={() => navigate('/coach')} backTestId="coach-monthly-back-button" />

      <div
        data-testid="coach-monthly"
        style={{ flex: 1, overflowY: 'auto', borderTop: `1px solid ${vmTokens.divider}` }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            padding: isDesktop ? 24 : 16,
            maxWidth: 1100,
            margin: '0 auto',
          }}
        >
          {/* Month selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BarChart3 size={20} style={{ color: vmTokens.gold }} strokeWidth={1.9} />
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: vmTokens.textPrimary }}>
                {data?.monthLabel ?? labelFor(month)}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setMonth((m) => shiftMonth(m, -1))} aria-label="Previous month" data-testid="coach-monthly-prev" style={navBtn}>
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setMonth((m) => shiftMonth(m, 1))}
                aria-label="Next month"
                data-testid="coach-monthly-next"
                disabled={month >= currentMonth()}
                style={{ ...navBtn, opacity: month >= currentMonth() ? 0.4 : 1 }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <CoachStateBoundary
            loading={state.loading}
            authError={state.authError}
            error={state.error}
            onRetry={() => query.refetch()}
          >
            {data && data.leaders.length === 0 ? (
              <CoachCard style={{ padding: 24 }}>
                <p style={{ margin: 0, fontSize: 14.5, color: vmTokens.textTertiary }}>
                  No sessions recorded in {data.monthLabel}.
                </p>
              </CoachCard>
            ) : data ? (
              <>
                {/* Program-wide rollup */}
                <div>
                  <SectionLabel>Program summary</SectionLabel>
                  <CoachCard style={{ padding: isDesktop ? 22 : 16 }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: 14,
                      }}
                    >
                      <Stat label="Avg composite" value={fmt(data.program.avgScore)} delta={data.program.delta} />
                      <Stat label="Sessions" value={String(data.program.sessions)} />
                      <Stat label="Active leaders" value={String(data.program.activeLeaders)} />
                      <Stat label="Newcomers" value={String(data.program.newcomers)} />
                    </div>

                    <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {data.program.clusters.map((c) => {
                        const pct = c.avg == null ? 0 : c.avg;
                        return (
                          <div key={c.name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                              <span style={{ fontSize: 13, color: vmTokens.textSecondary }}>
                                {c.name} <span style={{ color: vmTokens.textTertiary }}>· weight {c.weight}</span>
                              </span>
                              <span style={{ fontSize: 12.5, color: vmTokens.textTertiary, fontVariantNumeric: 'tabular-nums' }}>
                                {c.avg == null ? 'N/A' : `${c.avg}%`}
                              </span>
                            </div>
                            <div style={{ height: 6, borderRadius: 3, background: vmTokens.divider, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: vmTokens.gold, borderRadius: 3 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CoachCard>
                </div>

                {/* Per-leader table + heatmap */}
                <div>
                  <SectionLabel>Leaders this month</SectionLabel>
                  <CoachCard style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                        <thead>
                          <tr style={{ background: 'color-mix(in srgb, var(--vm-dust) 12%, transparent)' }}>
                            <th style={{ ...th, textAlign: 'left' }}>Leader</th>
                            <th style={th}>Sessions</th>
                            <th style={th}>Avg</th>
                            <th style={th}>Δ</th>
                            <th style={{ ...th, textAlign: 'left' }}>12-dimension heatmap</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.leaders.map((l, i) => (
                            <LeaderRow
                              key={l.id}
                              leader={l}
                              zebra={i % 2 === 1}
                              onOpen={() => navigate(`/coach/leader/${l.id}`)}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CoachCard>
                  <p style={{ margin: '10px 2px 0', fontSize: 12, color: vmTokens.textTertiary }}>
                    Heatmap cells are each dimension's average (1–5) for the month —{' '}
                    <HeatSwatch color={HEAT.strong} /> ≥ 4 · <HeatSwatch color={HEAT.mid} /> 3–3.9 ·{' '}
                    <HeatSwatch color={HEAT.low} /> &lt; 3.
                  </p>
                </div>
              </>
            ) : null}
          </CoachStateBoundary>
        </div>
      </div>
    </div>
  );
}

function LeaderRow({
  leader,
  zebra,
  onOpen,
}: {
  leader: MonthlyLeader;
  zebra: boolean;
  onOpen: () => void;
}) {
  return (
    <tr
      onClick={onOpen}
      data-testid={`coach-monthly-row-${leader.id}`}
      style={{
        cursor: 'pointer',
        background: zebra ? 'color-mix(in srgb, var(--vm-dust) 4%, transparent)' : 'transparent',
        borderTop: `1px solid ${vmTokens.divider}`,
      }}
    >
      <td style={{ ...td, minWidth: 150 }}>
        <span style={{ fontWeight: 700, color: vmTokens.textPrimary }}>{leader.name}</span>
        <span style={{ display: 'block', fontSize: 11.5, color: vmTokens.textTertiary }}>{leader.group}</span>
      </td>
      <td style={{ ...td, textAlign: 'center', color: vmTokens.textSecondary }}>{leader.sessions}</td>
      <td style={{ ...td, textAlign: 'center' }}>
        {leader.avgScore == null ? (
          '—'
        ) : (
          <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <span style={{ fontWeight: 700, color: vmTokens.textPrimary }}>{Math.round(leader.avgScore)}</span>
            {leader.status ? <StatusPill status={leader.status} emoji={leader.statusEmoji} size="sm" /> : null}
          </span>
        )}
      </td>
      <td style={{ ...td, textAlign: 'center' }}>
        {leader.delta == null ? (
          <span style={{ color: vmTokens.textTertiary }}>—</span>
        ) : (
          <span style={{ fontWeight: 600, color: leader.delta >= 0 ? vmTokens.statusSuccess : vmTokens.statusError }}>
            {leader.delta >= 0 ? '▲' : '▼'} {Math.abs(leader.delta).toFixed(1)}
          </span>
        )}
      </td>
      <td style={{ ...td }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {leader.dimensions.map((d) => (
            <span
              key={d.n}
              title={`${d.name}: ${d.avg == null ? 'N/A' : d.avg.toFixed(1)}`}
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                display: 'grid',
                placeItems: 'center',
                fontSize: 10.5,
                fontWeight: 700,
                color: d.avg == null ? vmTokens.textTertiary : '#0b0b0b',
                background: heatColor(d.avg),
                flexShrink: 0,
              }}
            >
              {d.avg == null ? '·' : Math.round(d.avg)}
            </span>
          ))}
        </div>
      </td>
    </tr>
  );
}

function Stat({ label, value, delta }: { label: string; value: string; delta?: number | null }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: vmTokens.textPrimary, lineHeight: 1.1 }}>{value}</p>
      <p style={{ margin: '3px 0 0', fontSize: 12, color: vmTokens.textTertiary }}>{label}</p>
      {delta != null && (
        <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 600, color: delta >= 0 ? vmTokens.statusSuccess : vmTokens.statusError }}>
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)} vs. prior
        </p>
      )}
    </div>
  );
}

function HeatSwatch({ color }: { color: string }) {
  return (
    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: color, verticalAlign: 'middle' }} />
  );
}

const HEAT = { strong: '#86EFAC', mid: '#FDE68A', low: '#FCA5A5', na: 'color-mix(in srgb, var(--fg-primary) 8%, transparent)' };

function heatColor(avg: number | null): string {
  if (avg == null) return HEAT.na;
  if (avg >= 4) return HEAT.strong;
  if (avg >= 3) return HEAT.mid;
  return HEAT.low;
}

function fmt(n: number | null): string {
  return n == null ? '—' : String(Math.round(n * 10) / 10);
}

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(m: string, delta: number): string {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(y, mo - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function labelFor(m: string): string {
  const [y, mo] = m.split('-').map(Number);
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
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

const th: React.CSSProperties = {
  textAlign: 'center',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
  color: vmTokens.textSecondary,
  padding: '10px 12px',
  whiteSpace: 'nowrap',
};

const td: React.CSSProperties = {
  padding: '11px 12px',
  verticalAlign: 'middle',
};
