/**
 * Coach dashboard (/coach) — the portal home for a Bible-study leader.
 *
 * Shows the latest session at a glance (score ring + status + delta), a link
 * into the trends view, the editable meeting link, an entry point to the
 * (coming-soon) coach-feedback thread, and the full list of feedback
 * documents. Signed-out / not-a-coach states are handled by
 * <CoachStateBoundary>.
 */

import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, MessageSquareText, TrendingUp } from 'lucide-react';
import ScreenHeader from '@/components/ScreenHeader';
import { vmTokens } from '@/styles/themeStyles';
import { useCoachMe, useCoachReports, coachState } from '@/hooks/useCoach';
import { CoachCard, CoachStateBoundary, ScoreRing, SectionLabel, StatusPill } from '@/components/coach/CoachUi';
import ReportCard from '@/components/coach/ReportCard';
import ZoomLinkCard from '@/components/coach/ZoomLinkCard';

export default function CoachDashboardScreen() {
  const navigate = useNavigate();
  const meQuery = useCoachMe();
  const reportsQuery = useCoachReports();

  const me = coachState(meQuery);
  const reports = coachState(reportsQuery);

  // The boundary reads whichever query is gating: auth errors match across
  // both (same token), so `me` is the canonical signal.
  const loading = me.loading || reports.loading;

  const latest = reports.data && reports.data.length > 0 ? reports.data[0] : null;
  const prev = reports.data && reports.data.length > 1 ? reports.data[1] : null;
  const delta = latest && prev ? Math.round((latest.score - prev.score) * 100) / 100 : null;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader title="Coaching" onBack={() => navigate('/menu')} backTestId="coach-back-button" />

      <div
        data-testid="coach-dashboard"
        style={{ flex: 1, overflowY: 'auto', borderTop: `1px solid ${vmTokens.divider}` }}
      >
        <CoachStateBoundary
          loading={loading}
          authError={me.authError || reports.authError}
          error={me.error || reports.error}
          onRetry={() => {
            meQuery.refetch();
            reportsQuery.refetch();
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, maxWidth: 640, margin: '0 auto' }}>
            {/* Greeting */}
            {me.data?.profile && (
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: vmTokens.textPrimary }}>
                  {firstName(me.data.profile.name)}’s coaching
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: vmTokens.textTertiary }}>
                  {me.data.profile.group} · Coached by {me.data.profile.coachName}
                </p>
              </div>
            )}

            {/* Latest session hero */}
            {latest ? (
              <CoachCard testId="coach-latest-card" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
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
            ) : (
              !loading && (
                <CoachCard>
                  <p style={{ margin: 0, fontSize: 14, color: vmTokens.textSecondary }}>
                    No sessions scored yet. Once your first session is recorded, your feedback and scores appear here.
                  </p>
                </CoachCard>
              )
            )}

            {/* Quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <ActionTile
                icon={<TrendingUp size={18} strokeWidth={1.9} />}
                label="Trends over time"
                testId="coach-action-trends"
                disabled={!reports.data || reports.data.length === 0}
                onClick={() => navigate('/coach/trends')}
              />
              <ActionTile
                icon={<MessageSquareText size={18} strokeWidth={1.9} />}
                label="Coach feedback"
                testId="coach-action-feedback"
                onClick={() => navigate('/coach/feedback')}
              />
            </div>

            {/* Meeting link */}
            {me.data?.isCoach && <ZoomLinkCard initialLink={me.data.zoomLink} />}

            {/* Feedback documents */}
            {reports.data && reports.data.length > 0 && (
              <div>
                <SectionLabel>Feedback documents</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {reports.data.map((r) => (
                    <ReportCard key={r.id} report={r} leaderName={me.data?.profile?.name || ''} />
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

function firstName(name: string): string {
  return (name || '').trim().split(/\s+/)[0] || name;
}

function ActionTile({
  icon,
  label,
  onClick,
  disabled,
  testId,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  testId?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '14px 14px',
        borderRadius: 12,
        border: `1px solid ${vmTokens.divider}`,
        background: vmTokens.surfaceRaisedBg,
        color: disabled ? vmTokens.textTertiary : vmTokens.textPrimary,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        textAlign: 'left',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: vmTokens.gold }}>{icon}</span>
        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</span>
      </span>
      <ArrowUpRight size={16} style={{ color: vmTokens.textTertiary }} />
    </button>
  );
}
