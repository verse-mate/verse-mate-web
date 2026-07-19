/**
 * /coach entry point. Branches on the signed-in account:
 *   - program admin  → the all-leaders roster (CoachAdminScreen)
 *   - evaluated leader → their own dashboard (CoachDashboardScreen)
 * Signed-out / not-a-coach states fall through to the shared boundary.
 *
 * A coachee who is ALSO an admin lands on the roster (they can still open
 * their own record from it, since the roster lists every leader).
 */

import ScreenHeader from '@/components/ScreenHeader';
import { useNavigate } from 'react-router-dom';
import { vmTokens } from '@/styles/themeStyles';
import { useCoachMe, coachState } from '@/hooks/useCoach';
import { CoachStateBoundary } from '@/components/coach/CoachUi';
import CoachDashboardScreen from '@/pages/CoachDashboardScreen';
import CoachAdminScreen from '@/pages/CoachAdminScreen';

export default function CoachHome() {
  const navigate = useNavigate();
  const meQuery = useCoachMe();
  const me = coachState(meQuery);

  // While loading or gated, render a bare header + the boundary so admins and
  // coachees see the same shell before their branch is known.
  if (me.loading || me.authError || me.error) {
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
        <ScreenHeader title="Coaching" onBack={() => navigate('/menu')} backTestId="coach-back-button" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderTop: `1px solid ${vmTokens.divider}` }}>
          <CoachStateBoundary
            loading={me.loading}
            authError={me.authError}
            error={me.error}
            onRetry={() => meQuery.refetch()}
          >
            {null}
          </CoachStateBoundary>
        </div>
      </div>
    );
  }

  if (me.data?.isAdmin) return <CoachAdminScreen />;
  return <CoachDashboardScreen />;
}
