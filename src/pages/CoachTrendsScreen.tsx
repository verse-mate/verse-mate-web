/**
 * Coach trends (/coach/trends) — how a leader's sessions move over time.
 *
 * Three views, all fed by GET /coach/trends:
 *   1. Session score over time (line) + the latest-vs-prior delta.
 *   2. Cluster contribution per session (stacked bars → the base composite).
 *   3. The latest session's dimensions (0–5 bars, N/A shown explicitly).
 *
 * The two headline charts live in <CoachTrendCharts> so the desktop dashboard /
 * leader views can render them open by default.
 */

import { useNavigate, useParams } from 'react-router-dom';
import ScreenHeader from '@/components/ScreenHeader';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { vmTokens } from '@/styles/themeStyles';
import {
  useCoachTrends,
  useCoachReports,
  useCoachTrendsFor,
  useCoachReportsFor,
  coachState,
} from '@/hooks/useCoach';
import { CoachCard, CoachStateBoundary, SectionLabel } from '@/components/coach/CoachUi';
import { ScoreTrendCard, ClusterTrendCard } from '@/components/coach/CoachTrendCharts';

export default function CoachTrendsScreen() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
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
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              padding: isDesktop ? 24 : 16,
              maxWidth: isDesktop ? 1000 : 640,
              margin: '0 auto',
            }}
          >
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

            {/* Score over time + cluster contributions (side-by-side on desktop) */}
            <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 16 }}>
              <ScoreTrendCard trends={trends.data} />
              <ClusterTrendCard trends={trends.data} />
            </div>

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
