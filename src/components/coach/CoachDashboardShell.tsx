/**
 * Outer chrome for the Bible-Leader Coaching dashboard (Home / Sessions /
 * Trends): the page background, the centered white card with its soft shadow,
 * and the single top nav — VerseMate wordmark + "COACHING" label on the left,
 * Home · Sessions · Trends links + profile avatar on the right.
 *
 * Recreated from the design handoff with its fixed warm palette (see
 * dashboardTheme). The three leader screens each wrap their body in this shell
 * so the nav and card frame stay identical across routes. Loading / signed-out
 * / not-a-coach / error states render inside the same frame via <CoachGate>.
 */

import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import type { CoachAuthReason } from '@/services/coachService';
import { dt } from './dashboardTheme';

type Page = 'home' | 'sessions' | 'trends';

const NAV: { page: Page; label: string; to: string }[] = [
  { page: 'home', label: 'Home', to: '/coach' },
  { page: 'sessions', label: 'Sessions', to: '/coach/sessions' },
  { page: 'trends', label: 'Trends', to: '/coach/trends' },
];

export default function CoachDashboardShell({
  active,
  children,
}: {
  active: Page;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        // Fill the fixed-height AppLayout column and scroll internally.
        flex: '1 1 auto',
        minHeight: 0,
        background: dt.pageBg,
        color: dt.textPrimary,
        fontFamily: dt.sans,
        WebkitFontSmoothing: 'antialiased',
        padding: 'clamp(20px, 4vw, 44px) clamp(14px, 4vw, 44px) 80px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflowY: 'auto',
      }}
    >
      <div style={{ width: 1240, maxWidth: '100%' }}>
        <div
          style={{
            background: dt.cardBg,
            border: `1px solid ${dt.cardBorder}`,
            borderRadius: 18,
            padding: '32px clamp(18px, 4vw, 44px) 46px',
            boxShadow: dt.shadow,
          }}
        >
          <TopBar active={active} />
          {children}
        </div>
      </div>
    </div>
  );
}

function TopBar({ active }: { active: Page }) {
  const navigate = useNavigate();
  const { state } = useApp();

  const initials = (() => {
    const f = (state.userFirstName || '').trim();
    const l = (state.userLastName || '').trim();
    const a = f ? f[0] : '';
    const b = l ? l[0] : '';
    return (a + b || (state.userEmail || '?')[0] || '?').toUpperCase();
  })();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
        paddingBottom: 26,
        borderBottom: `1px solid ${dt.border2}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: dt.darkBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: dt.goldChip,
            fontFamily: dt.serif,
            fontWeight: 600,
            fontSize: 17,
          }}
          aria-hidden
        >
          V
        </div>
        <span style={{ fontFamily: dt.serif, fontSize: 20, fontWeight: 600, letterSpacing: '-.01em' }}>
          VerseMate
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '.14em',
            color: dt.gold,
            borderLeft: '1px solid #DEDEDC',
            paddingLeft: 11,
          }}
        >
          COACHING
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 14, fontWeight: 500 }}>
        {NAV.map((n) => (
          <NavLink
            key={n.page}
            to={n.to}
            end={n.page === 'home'}
            data-testid={`coach-nav-${n.page}`}
            style={{
              color: active === n.page ? dt.textPrimary : dt.textMuted,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            {n.label}
          </NavLink>
        ))}
        {state.isSignedIn && (
          <button
            type="button"
            onClick={() => navigate('/coach/settings')}
            aria-label="Open coach settings"
            title="Coach settings"
            data-testid="coach-profile-avatar"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#E8E8E6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: dt.gold2,
              fontSize: 13,
              border: 'none',
              cursor: 'pointer',
              overflow: 'hidden',
              padding: 0,
            }}
          >
            {state.userAvatarUrl ? (
              <img src={state.userAvatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initials
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Gate (loading / signed-out / not-a-coach / error) ───────────────────────

export function CoachGate({
  loading,
  authError,
  error,
  onRetry,
  children,
}: {
  loading: boolean;
  authError: CoachAuthReason | null;
  error: boolean;
  onRetry?: () => void;
  children: ReactNode;
}) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={centered} data-testid="coach-loading">
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: `3px solid ${dt.barTrack}`,
            borderTopColor: dt.gold,
            animation: 'coach-spin 0.8s linear infinite',
          }}
        />
        <style>{'@keyframes coach-spin{to{transform:rotate(360deg)}}'}</style>
      </div>
    );
  }

  if (authError === 'signed_out') {
    return (
      <div style={centered} data-testid="coach-signed-out">
        <GraduationCap size={44} style={{ color: dt.gold }} strokeWidth={1.5} />
        <h2 style={gateTitle}>Coach sign-in</h2>
        <p style={gateBody}>Sign in to VerseMate to see your coaching feedback, trends, and settings.</p>
        <button style={primaryBtn} onClick={() => navigate('/login')} data-testid="coach-signin-cta">
          Sign in
        </button>
      </div>
    );
  }

  if (authError === 'not_a_coach') {
    return (
      <div style={centered} data-testid="coach-not-a-coach">
        <GraduationCap size={44} style={{ color: dt.textLight }} strokeWidth={1.5} />
        <h2 style={gateTitle}>Not a coaching account</h2>
        <p style={gateBody}>
          This account isn’t set up for Bible-study coaching yet. If you lead a group and expect feedback here,
          reach out to your coach.
        </p>
        <button style={secondaryBtn} onClick={() => navigate('/read')}>
          Back to reading
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div style={centered} data-testid="coach-error">
        <p style={gateBody}>Something went wrong loading your coaching data.</p>
        {onRetry ? (
          <button style={secondaryBtn} onClick={onRetry}>
            Try again
          </button>
        ) : null}
      </div>
    );
  }

  return <>{children}</>;
}

const centered: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  padding: '64px 32px',
  textAlign: 'center',
};

const gateTitle: React.CSSProperties = { fontFamily: dt.serif, fontSize: 24, fontWeight: 500, color: dt.textPrimary, margin: 0 };
const gateBody: React.CSSProperties = { fontSize: 15, color: dt.textMuted, maxWidth: 340, lineHeight: 1.55, margin: 0 };
const primaryBtn: React.CSSProperties = {
  marginTop: 6,
  padding: '10px 22px',
  borderRadius: 10,
  border: 'none',
  background: dt.darkBg,
  color: dt.goldChip,
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
};
const secondaryBtn: React.CSSProperties = {
  marginTop: 6,
  padding: '10px 22px',
  borderRadius: 10,
  border: `1px solid ${dt.inputBorder}`,
  background: dt.cardBg,
  color: dt.textPrimary,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};
