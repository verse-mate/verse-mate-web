/**
 * Admin drill-in: one leader's dashboard (/coach/leader/:coachId), reached
 * from the oversight roster. Same feedback view a leader sees of themselves —
 * latest score, delta, and the full list of feedback documents — but
 * read-only (no meeting-link editor). Access is gated by the admin-only
 * /coach/admin/* endpoints; a non-admin hitting this route gets the
 * not-a-coach boundary.
 *
 * Responsive: on desktop (≥1024px) the view expands to use the width — the
 * two trend charts open by default and the most-recent session is rendered in
 * full prose (<ReportDetail>), with older sessions as compact cards below. On
 * mobile it stays the single-column, tap-to-expand experience.
 */

import { useNavigate, useParams } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import ScreenHeader from '@/components/ScreenHeader';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { vmTokens } from '@/styles/themeStyles';
import { useCoachReportsFor, useCoachTrendsFor, coachState } from '@/hooks/useCoach';
import {
  CoachStateBoundary,
  LatestSessionHero,
  SectionLabel,
} from '@/components/coach/CoachUi';
import { ScoreTrendCard, ClusterTrendCard } from '@/components/coach/CoachTrendCharts';
import ReportCard from '@/components/coach/ReportCard';
import ReportDetail from '@/components/coach/ReportDetail';

export default function CoachLeaderScreen() {
  const navigate = useNavigate();
  const { coachId = '' } = useParams();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const query = useCoachReportsFor(coachId);
  const trendsQuery = useCoachTrendsFor(coachId);
  const state = coachState(query);

  const profile = state.data?.profile;
  const reports = state.data?.reports || [];
  const latest = reports[0] || null;
  const prev = reports[1] || null;
  const delta = latest && prev ? Math.round((latest.score - prev.score) * 100) / 100 : null;

  const header = profile && (
    <div>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: vmTokens.textPrimary }}>{profile.name}</h2>
      <p style={{ margin: '4px 0 0', fontSize: 13, color: vmTokens.textTertiary }}>
        {profile.group} · Coached by {profile.coachName}
      </p>
    </div>
  );

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader title={profile?.name || 'Leader'} onBack={() => navigate('/coach')} backTestId="coach-leader-back-button" />

      <div
        data-testid="coach-leader"
        style={{ flex: 1, overflowY: 'auto', borderTop: `1px solid ${vmTokens.divider}` }}
      >
        <CoachStateBoundary
          loading={state.loading}
          authError={state.authError}
          error={state.error}
          onRetry={() => query.refetch()}
        >
          {isDesktop ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 24, maxWidth: 1180, margin: '0 auto' }}>
              {header}

              {latest && <LatestSessionHero latest={latest} delta={delta} testId="coach-leader-latest" />}

              {/* Trends over time — open by default on desktop */}
              {reports.length > 0 && (
                <div>
                  <SectionLabel>Trends over time</SectionLabel>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <ScoreTrendCard trends={trendsQuery.data} />
                    <ClusterTrendCard trends={trendsQuery.data} />
                  </div>
                </div>
              )}

              {/* Most-recent session in full detail */}
              {latest && (
                <div>
                  <SectionLabel>Latest session — full report</SectionLabel>
                  <ReportDetail report={latest} leaderName={profile?.name || ''} delta={delta} />
                </div>
              )}

              {/* Earlier sessions, compact */}
              {reports.length > 1 && (
                <div>
                  <SectionLabel>Earlier feedback documents</SectionLabel>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
                    {reports.slice(1).map((r) => (
                      <ReportCard key={r.id} report={r} leaderName={profile?.name || ''} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, maxWidth: 640, margin: '0 auto' }}>
              {header}

              {latest && <LatestSessionHero latest={latest} delta={delta} testId="coach-leader-latest" />}

              <button
                onClick={() => navigate(`/coach/leader/${coachId}/trends`)}
                disabled={reports.length === 0}
                data-testid="coach-leader-trends"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '14px',
                  borderRadius: 12,
                  border: `1px solid ${vmTokens.divider}`,
                  background: vmTokens.surfaceRaisedBg,
                  color: reports.length ? vmTokens.textPrimary : vmTokens.textTertiary,
                  cursor: reports.length ? 'pointer' : 'default',
                  opacity: reports.length ? 1 : 0.6,
                }}
              >
                <TrendingUp size={18} style={{ color: vmTokens.gold }} strokeWidth={1.9} />
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>Trends over time</span>
              </button>

              {reports.length > 0 && (
                <div>
                  <SectionLabel>Feedback documents</SectionLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {reports.map((r) => (
                      <ReportCard key={r.id} report={r} leaderName={profile?.name || ''} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CoachStateBoundary>
      </div>
    </div>
  );
}
