/**
 * Clickable profile avatar for the Bible-Coach portal header.
 *
 * Pulls the signed-in user's avatar (falling back to their initials) from the
 * app context — the same source the Settings screen uses — and doubles as the
 * entry point to Coach Settings: tapping it navigates to /coach/settings,
 * where the leader can update their name + email, church affiliation, and
 * Bible coach. Back from there returns to the coach dashboard (not the app
 * Menu), which is the bug this navigation target fixes.
 *
 * Rendered as the ScreenHeader `rightAction` across the coach screens. Renders
 * nothing when signed out (the coach gate handles that state separately).
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useApp } from '@/contexts/AppContext';
import { vmTokens } from '@/styles/themeStyles';

export default function CoachProfileAvatar() {
  const navigate = useNavigate();
  const { state } = useApp();

  const initials = useMemo(() => {
    const f = (state.userFirstName || '').trim();
    const l = (state.userLastName || '').trim();
    const a = f ? f[0]! : '';
    const b = l ? l[0]! : '';
    return (a + b || (state.userEmail || '?')[0]!).toUpperCase();
  }, [state.userFirstName, state.userLastName, state.userEmail]);

  if (!state.isSignedIn) return null;

  return (
    <button
      type="button"
      onClick={() => navigate('/coach/settings')}
      aria-label="Open coach settings"
      title="Coach settings"
      data-testid="coach-profile-avatar"
      style={{
        display: 'inline-flex',
        padding: 0,
        border: 'none',
        background: 'none',
        borderRadius: '9999px',
        cursor: 'pointer',
      }}
    >
      <Avatar
        className="h-9 w-9"
        style={{ boxShadow: `0 0 0 2px ${vmTokens.headerBg}, 0 0 0 3px ${vmTokens.gold}` }}
      >
        {state.userAvatarUrl ? (
          <AvatarImage src={state.userAvatarUrl} alt="Profile picture" />
        ) : null}
        {/* Fallback bg is the brand dark so initials always read on a #1B1B1B chip. */}
        <AvatarFallback className="bg-[#1B1B1B] text-white text-sm">{initials}</AvatarFallback>
      </Avatar>
    </button>
  );
}
