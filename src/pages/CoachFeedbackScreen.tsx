/**
 * Coach feedback (/coach/feedback) — placeholder for the two-way thread where
 * a leader's coach leaves personal notes on each session. The full experience
 * ships in a later page; this stub wires the navigation end-to-end and keeps
 * the same auth gating as the rest of the portal.
 */

import { useNavigate } from 'react-router-dom';
import { MessageSquareText } from 'lucide-react';
import ScreenHeader from '@/components/ScreenHeader';
import { vmTokens } from '@/styles/themeStyles';
import { useCoachMe, coachState } from '@/hooks/useCoach';
import { CoachCard, CoachStateBoundary } from '@/components/coach/CoachUi';

export default function CoachFeedbackScreen() {
  const navigate = useNavigate();
  const meQuery = useCoachMe();
  const me = coachState(meQuery);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader title="Coach feedback" onBack={() => navigate('/coach')} backTestId="coach-feedback-back-button" />

      <div
        data-testid="coach-feedback"
        style={{ flex: 1, overflowY: 'auto', borderTop: `1px solid ${vmTokens.divider}` }}
      >
        <CoachStateBoundary
          loading={me.loading}
          authError={me.authError}
          error={me.error}
          onRetry={() => meQuery.refetch()}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, maxWidth: 640, margin: '0 auto' }}>
            <CoachCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, padding: 28 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'color-mix(in srgb, var(--vm-dust) 14%, transparent)',
                  color: vmTokens.gold,
                }}
              >
                <MessageSquareText size={26} strokeWidth={1.75} />
              </div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: vmTokens.textPrimary }}>Coming soon</h2>
              <p style={{ margin: 0, fontSize: 14, color: vmTokens.textSecondary, lineHeight: 1.5, maxWidth: 380 }}>
                This is where {me.data ? me.data.profile.coachName : 'your coach'} will leave personal, session-by-session
                notes and you’ll be able to reply. For now, your scored feedback documents live on the{' '}
                <button onClick={() => navigate('/coach')} style={linkBtn}>coaching dashboard</button>.
              </p>
            </CoachCard>
          </div>
        </CoachStateBoundary>
      </div>
    </div>
  );
}

const linkBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  color: vmTokens.gold,
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
  textDecoration: 'underline',
};
