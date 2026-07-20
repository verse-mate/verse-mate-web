/**
 * Admin drill-in: one leader's dashboard (/coach/leader/:coachId), reached
 * from the oversight roster. Same feedback view a leader sees of themselves —
 * latest score, delta, and the full list of feedback documents — but
 * read-only (no meeting-link editor). Access is gated by the admin-only
 * /coach/admin/* endpoints; a non-admin hitting this route gets the
 * not-a-coach boundary.
 */

import { useNavigate, useParams } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import ScreenHeader from '@/components/ScreenHeader';
import { vmTokens } from '@/styles/themeStyles';
import { useCoachReportsFor, coachState } from '@/hooks/useCoach';
import { CoachCard, CoachStateBoundary, ScoreRing, SectionLabel, StatusPill } from '@/components/coach/CoachUi';
import ReportCard from '@/components/coach/ReportCard';

export default function CoachLeaderScreen() {
  const navigate = useNavigate();
  const { coachId = '' } = useParams();
  const query = useCoachReportsFor(coachId);
  const state = coachState(query);

  const profile = state.data?.profile;
  const reports = state.data?.reports || [];
  const latest = reports[0] || null;
  const prev = reports[1] || null;
  const delta = latest && prev ? Math.round((latest.score - prev.score) * 100) / 100 : null;

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, maxWidth: 640, margin: '0 auto' }}>
            {profile && (
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: vmTokens.textPrimary }}>{profile.name}</h2>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: vmTokens.textTertiary }}>
                  {profile.group} · Coached by {profile.coachName}
                </p>
              </div>
            )}

            {latest && (
              <CoachCard testId="coach-leader-latest" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <ScoreRing value={latest.score} status={latest.status} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <SectionLabel>Latest session</SectionLabel>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: vmTokens.textPrimary }}>{latest.session}</p>
                  <p style={{ margin: '2px 0 8px', fontSize: 12.5, color: vmTokens.textTertiary }}>{latest.dateLabel}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <StatusPill status={latest.status} emoji={latest.statusEmoji} />
                    {delta !== null && (
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: delta >= 0 ? vmTokens.statusSuccess : vmTokens.statusError,
                        }}
                      >
                        {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)} vs. prior
                      </span>
                    )}
                  </div>
                </div>
              </CoachCard>
            )}

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
        </CoachStateBoundary>
      </div>
    </div>
  );
}
