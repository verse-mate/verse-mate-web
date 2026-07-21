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

import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import ScreenHeader from '@/components/ScreenHeader';
import CoachProfileAvatar from '@/components/coach/CoachProfileAvatar';
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
  // Newest first by session date — primary sort for the latest-session detail
  // and the earlier-documents list alike.
  const reports = [...(state.data?.reports || [])].sort(byDateDesc);
  const latest = reports[0] || null;

  // Which session the full report shows — defaults to the latest; tapping a
  // trend point opens that session here.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const selected = (selectedId && reports.find((r) => r.id === selectedId)) || latest;
  const selIdx = selected ? reports.findIndex((r) => r.id === selected.id) : -1;
  const selPrev = selIdx >= 0 ? reports[selIdx + 1] : undefined;
  const delta =
    selected && selPrev ? Math.round((selected.score - selPrev.score) * 100) / 100 : null;

  const openByDate = (isoDate: string) => {
    const match = reports.find((r) => r.date === isoDate);
    if (match) {
      setSelectedId(match.id);
      requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  };

  const header = profile && (
    <div>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: vmTokens.textPrimary }}>{profile.name}</h2>
      <p style={{ margin: '4px 0 0', fontSize: 13, color: vmTokens.textTertiary }}>
        {profile.group}
        {profile.coachName ? ` · Coached by ${profile.coachName}` : ''}
      </p>
    </div>
  );

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader title={profile?.name || 'Leader'} onBack={() => navigate('/coach')} backTestId="coach-leader-back-button" rightAction={<CoachProfileAvatar />} />

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

              {/* No standalone hero on desktop — the latest-session detail below
                  already leads with the score, status, and delta. */}

              {/* Trends over time — open by default on desktop. Tapping a point
                  opens that session's report below. */}
              {reports.length > 0 && (
                <div>
                  <SectionLabel>Trends over time</SectionLabel>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <ScoreTrendCard trends={trendsQuery.data} onSelectDate={openByDate} />
                    <ClusterTrendCard trends={trendsQuery.data} onSelectDate={openByDate} />
                  </div>
                </div>
              )}

              {/* Selected session in full detail (defaults to the latest). */}
              {selected && (
                <div ref={detailRef} style={{ scrollMarginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <SectionLabel>
                      {selected.id === latest?.id ? 'Latest session — full report' : 'Selected session — full report'}
                    </SectionLabel>
                    {selected.id !== latest?.id && (
                      <button onClick={() => setSelectedId(null)} style={leaderLinkBtn} data-testid="coach-leader-view-latest">
                        View latest
                      </button>
                    )}
                  </div>
                  <ReportDetail report={selected} leaderName={profile?.name || ''} delta={delta} />
                </div>
              )}

              {/* Earlier sessions, compact */}
              {reports.length > 1 && (
                <div>
                  <SectionLabel>Earlier feedback documents</SectionLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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

/** Sort reports newest-first by ISO session date (yyyy-mm-dd sorts lexically). */
function byDateDesc(a: { date: string }, b: { date: string }): number {
  return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
}

const leaderLinkBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  color: vmTokens.gold,
  fontWeight: 600,
  fontSize: 12.5,
  cursor: 'pointer',
  textDecoration: 'underline',
  whiteSpace: 'nowrap',
};
