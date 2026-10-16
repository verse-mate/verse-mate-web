/**
 * /coach entry point. Branches on the signed-in account:
 *   - program admin  → the all-leaders roster (CoachAdminScreen)
 *   - evaluated leader → their own dashboard (CoachDashboardScreen)
 * Signed-out / not-a-coach states fall through to the shared boundary.
 *
 * A coachee who is ALSO an admin lands on the roster (they can still open
 * their own record from it, since the roster lists every leader).
 */

import { useCoachMe, coachState } from '@/hooks/useCoach';
import CoachDashboardShell, { CoachGate } from '@/components/coach/CoachDashboardShell';
import CoachDashboardScreen from '@/pages/CoachDashboardScreen';
import CoachAdminScreen from '@/pages/CoachAdminScreen';

export default function CoachHome() {
  const meQuery = useCoachMe();
  const me = coachState(meQuery);

  if (me.loading || me.authError || me.error) {
    return (
      <CoachDashboardShell active="home">
        <CoachGate loading={me.loading} authError={me.authError} error={me.error} onRetry={() => meQuery.refetch()}>
          {null}
        </CoachGate>
      </CoachDashboardShell>
    );
  }

  if (me.data?.isAdmin) return <CoachAdminScreen />;
  return <CoachDashboardScreen />;
}
