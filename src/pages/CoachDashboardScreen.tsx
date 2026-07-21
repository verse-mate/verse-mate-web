/**
 * Coach dashboard (/coach) — the portal home for a Bible-study leader.
 *
 * Shows the latest session at a glance (score ring + status + delta), a link
 * into the trends view, the editable meeting link, an entry point to the
 * (coming-soon) coach-feedback thread, and the full list of feedback
 * documents. Signed-out / not-a-coach states are handled by
 * <CoachStateBoundary>.
 *
 * Responsive: on desktop (≥1024px) the view expands to use the width — the two
 * trend charts open by default and the most-recent session is rendered in full
 * prose (<ReportDetail>), with older sessions as compact cards below. On
 * mobile it stays the single-column, tap-to-expand experience.
 */

import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, CalendarCog, MessageSquareText, TrendingUp } from 'lucide-react';
import ScreenHeader from '@/components/ScreenHeader';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { vmTokens } from '@/styles/themeStyles';
import { useCoachMe, useCoachReports, useCoachTrends, coachState } from '@/hooks/useCoach';
import {
  CoachCard,
  CoachStateBoundary,
  LatestSessionHero,
  SectionLabel,
} from '@/components/coach/CoachUi';
import { ScoreTrendCard, ClusterTrendCard } from '@/components/coach/CoachTrendCharts';
import CoachProfileAvatar from '@/components/coach/CoachProfileAvatar';
import ReportCard from '@/components/coach/ReportCard';
import ReportDetail from '@/components/coach/ReportDetail';
import ZoomLinkCard from '@/components/coach/ZoomLinkCard';

export default function CoachDashboardScreen() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const meQuery = useCoachMe();
  const reportsQuery = useCoachReports();
  const trendsQuery = useCoachTrends();

  const me = coachState(meQuery);
  const reports = coachState(reportsQuery);

  // The boundary reads whichever query is gating: auth errors match across
  // both (same token), so `me` is the canonical signal.
  const loading = me.loading || reports.loading;

  // Newest first by session date — the primary sort for the latest-session
  // detail and the earlier-documents list alike.
  const list = [...(reports.data || [])].sort(byDateDesc);
  const latest = list.length > 0 ? list[0] : null;
  const leaderName = me.data?.profile?.name || '';

  // Which session the full report shows. Defaults to the latest; tapping a
  // point on a trend chart (or an earlier document) opens that session here.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const selected = (selectedId && list.find((r) => r.id === selectedId)) || latest;
  const selIdx = selected ? list.findIndex((r) => r.id === selected.id) : -1;
  const selPrev = selIdx >= 0 ? list[selIdx + 1] : undefined;
  const delta =
    selected && selPrev ? Math.round((selected.score - selPrev.score) * 100) / 100 : null;

  const openReport = (id: string) => {
    setSelectedId(id);
    // Let the state commit, then bring the full report into view.
    requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const openByDate = (isoDate: string) => {
    const match = list.find((r) => r.date === isoDate);
    if (match) openReport(match.id);
  };

  const greeting = me.data?.profile && (
    <div>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: vmTokens.textPrimary }}>
        {firstName(me.data.profile.name)}’s coaching
      </h2>
      <p style={{ margin: '4px 0 0', fontSize: 13, color: vmTokens.textTertiary }}>
        {me.data.profile.group}
        {me.data.profile.coachName ? ` · Coached by ${me.data.profile.coachName}` : ''}
      </p>
    </div>
  );

  const emptyState = !loading && (
    <CoachCard>
      <p style={{ margin: 0, fontSize: 14, color: vmTokens.textSecondary }}>
        No sessions scored yet. Once your first session is recorded, your feedback and scores appear here.
      </p>
    </CoachCard>
  );

  const feedbackTile = (
    <ActionTile
      icon={<MessageSquareText size={18} strokeWidth={1.9} />}
      label="Coach feedback"
      testId="coach-action-feedback"
      onClick={() => navigate('/coach/feedback')}
    />
  );

  // Coaches manage the classes/meeting links the notetaker bot joins here.
  const classSetupAction = me.data?.isCoach ? (
    <button
      type="button"
      onClick={() => navigate('/coach/classes')}
      data-testid="coach-class-setup-button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 999,
        border: `1px solid ${vmTokens.headerFg}55`,
        background: 'transparent',
        color: vmTokens.headerFg,
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      <CalendarCog size={15} strokeWidth={2} /> Class Setup
    </button>
  ) : undefined;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader
        title="Coaching"
        onBack={() => navigate('/read')}
        backTestId="coach-back-button"
        rightAction={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {classSetupAction}
            <CoachProfileAvatar />
          </div>
        }
      />

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
          {isDesktop ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 24, maxWidth: 1180, margin: '0 auto' }}>
              {greeting}

              {/* No standalone hero on desktop — the latest-session detail below
                  already leads with the score, status, and delta. */}
              {!latest && emptyState}

              {/* Trends over time — open by default on desktop. Tapping a point
                  opens that session's report below. */}
              {list.length > 0 && (
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
                      <button onClick={() => setSelectedId(null)} style={linkBtn} data-testid="coach-view-latest">
                        View latest
                      </button>
                    )}
                  </div>
                  <ReportDetail report={selected} leaderName={leaderName} delta={delta} />
                </div>
              )}

              {/* Meeting link + coach-feedback entry (church + Bible coach now
                  live in Coach Settings, reached via the header avatar). */}
              <div style={{ display: 'grid', gridTemplateColumns: me.data?.isCoach ? '2fr 1fr' : '1fr', gap: 12, alignItems: 'start' }}>
                {me.data?.isCoach && <ZoomLinkCard initialLink={me.data.zoomLink} />}
                {feedbackTile}
              </div>

              {/* Earlier sessions, compact */}
              {list.length > 1 && (
                <div>
                  <SectionLabel>Earlier feedback documents</SectionLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {list.slice(1).map((r) => (
                      <ReportCard key={r.id} report={r} leaderName={leaderName} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, maxWidth: 640, margin: '0 auto' }}>
              {greeting}

              {latest ? <LatestSessionHero latest={latest} delta={delta} /> : emptyState}

              {/* Quick actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <ActionTile
                  icon={<TrendingUp size={18} strokeWidth={1.9} />}
                  label="Trends over time"
                  testId="coach-action-trends"
                  disabled={list.length === 0}
                  onClick={() => navigate('/coach/trends')}
                />
                {feedbackTile}
              </div>

              {/* Meeting link (church + Bible coach live in Coach Settings) */}
              {me.data?.isCoach && <ZoomLinkCard initialLink={me.data.zoomLink} />}

              {/* Feedback documents */}
              {list.length > 0 && (
                <div>
                  <SectionLabel>Feedback documents</SectionLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {list.map((r) => (
                      <ReportCard key={r.id} report={r} leaderName={leaderName} />
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

function firstName(name: string): string {
  return (name || '').trim().split(/\s+/)[0] || name;
}

const linkBtn: React.CSSProperties = {
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

/** Sort reports newest-first by ISO session date (yyyy-mm-dd sorts lexically). */
function byDateDesc(a: { date: string }, b: { date: string }): number {
  return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
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
