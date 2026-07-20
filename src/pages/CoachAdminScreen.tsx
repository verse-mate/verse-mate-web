/**
 * Admin oversight roster (/coach for program admins). Lists every leader
 * with their latest score + status; tapping a row drills into that leader's
 * dashboard (/coach/leader/:id). Read-only — admins view feedback, they don't
 * edit a leader's meeting link.
 */

import { useNavigate } from 'react-router-dom';
import { ChevronRight, Users } from 'lucide-react';
import ScreenHeader from '@/components/ScreenHeader';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { vmTokens } from '@/styles/themeStyles';
import { useAdminCoaches, coachState } from '@/hooks/useCoach';
import { CoachCard, CoachStateBoundary, SectionLabel, StatusPill } from '@/components/coach/CoachUi';
import { statusColor, type CoachSummary } from '@/services/coachService';

export default function CoachAdminScreen() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const coachesQuery = useAdminCoaches();
  const coaches = coachState(coachesQuery);

  const sorted = [...(coaches.data || [])].sort(byScoreDesc);
  const scored = sorted.filter((c) => c.latest);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader title="All leaders" onBack={() => navigate('/read')} backTestId="coach-admin-back-button" />

      <div
        data-testid="coach-admin"
        style={{ flex: 1, overflowY: 'auto', borderTop: `1px solid ${vmTokens.divider}` }}
      >
        <CoachStateBoundary
          loading={coaches.loading}
          authError={coaches.authError}
          error={coaches.error}
          onRetry={() => coachesQuery.refetch()}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Users size={20} style={{ color: vmTokens.gold }} strokeWidth={1.9} />
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: vmTokens.textPrimary }}>Coaching oversight</h2>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: vmTokens.textTertiary }}>
                  {sorted.length} leader{sorted.length === 1 ? '' : 's'}
                  {scored.length ? ` · avg ${avgScore(scored)}` : ''}
                </p>
              </div>
            </div>

            <div>
              <SectionLabel>Leaders</SectionLabel>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
                  gap: isDesktop ? 12 : 10,
                  alignItems: 'start',
                }}
              >
                {sorted.map((c) => (
                  <RosterRow key={c.id} coach={c} onOpen={() => navigate(`/coach/leader/${c.id}`)} />
                ))}
              </div>
            </div>
          </div>
        </CoachStateBoundary>
      </div>
    </div>
  );
}

function RosterRow({ coach, onOpen }: { coach: CoachSummary; onOpen: () => void }) {
  const color = coach.latest ? statusColor(coach.latest.status) : vmTokens.textTertiary;
  return (
    <CoachCard testId={`coach-roster-${coach.id}`} style={{ padding: 0 }}>
      <button
        onClick={onOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          padding: 14,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            display: 'grid',
            placeItems: 'center',
            background: `color-mix(in srgb, ${color} 15%, transparent)`,
            color,
            fontWeight: 700,
            fontSize: 15,
            flexShrink: 0,
          }}
        >
          {initials(coach.name)}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: vmTokens.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {coach.name}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: vmTokens.textTertiary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {coach.group} · {coach.sessionCount} session{coach.sessionCount === 1 ? '' : 's'}
          </p>
        </div>
        {coach.latest ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: vmTokens.textPrimary, lineHeight: 1 }}>
              {Math.round(coach.latest.score)}
            </span>
            <StatusPill status={coach.latest.status} emoji={coach.latest.statusEmoji} size="sm" />
          </div>
        ) : (
          <span style={{ fontSize: 12, color: vmTokens.textTertiary, flexShrink: 0 }}>No sessions</span>
        )}
        <ChevronRight size={18} style={{ color: vmTokens.textTertiary, flexShrink: 0 }} />
      </button>
    </CoachCard>
  );
}

function byScoreDesc(a: CoachSummary, b: CoachSummary): number {
  const av = a.latest?.score ?? -1;
  const bv = b.latest?.score ?? -1;
  return bv - av;
}

function avgScore(scored: CoachSummary[]): string {
  const sum = scored.reduce((a, c) => a + (c.latest?.score ?? 0), 0);
  return (sum / scored.length).toFixed(1);
}

function initials(name: string): string {
  const parts = (name || '').trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}
