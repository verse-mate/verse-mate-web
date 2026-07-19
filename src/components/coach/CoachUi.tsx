/**
 * Shared visual primitives + state boundary for the Bible-Coach portal
 * screens (/coach, /coach/trends, /coach/feedback).
 *
 * Everything here is styled with the app's `vmTokens` so the portal matches
 * the rest of VerseMate in both light and dark themes. Screens compose these
 * instead of re-deriving card / label / pill styling.
 */

import { CSSProperties, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogIn } from 'lucide-react';
import { vmTokens } from '@/styles/themeStyles';
import { statusColor } from '@/services/coachService';
import type { CoachAuthReason } from '@/services/coachService';

// ─── Card ──────────────────────────────────────────────────────────────────

export function CoachCard({
  children,
  style,
  testId,
}: {
  children: ReactNode;
  style?: CSSProperties;
  testId?: string;
}) {
  return (
    <div
      data-testid={testId}
      style={{
        background: vmTokens.surfaceRaisedBg,
        border: `1px solid ${vmTokens.divider}`,
        borderRadius: 14,
        padding: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        color: vmTokens.textTertiary,
        margin: '0 0 10px 2px',
      }}
    >
      {children}
    </p>
  );
}

// ─── Status pill ─────────────────────────────────────────────────────────────

export function StatusPill({
  status,
  emoji,
  size = 'md',
}: {
  status: string;
  emoji?: string;
  size?: 'sm' | 'md';
}) {
  const color = statusColor(status);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        borderRadius: 999,
        fontSize: size === 'sm' ? 11 : 12,
        fontWeight: 600,
        color,
        background: 'color-mix(in srgb, currentColor 12%, transparent)',
        border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
        whiteSpace: 'nowrap',
      }}
    >
      {emoji ? <span aria-hidden>{emoji}</span> : null}
      {status}
    </span>
  );
}

// ─── Score ring ──────────────────────────────────────────────────────────────

/** A compact circular score gauge (0–100) tinted by status color. */
export function ScoreRing({
  value,
  status,
  diameter = 96,
}: {
  value: number;
  status: string;
  diameter?: number;
}) {
  const color = statusColor(status);
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      style={{
        width: diameter,
        height: diameter,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        background: `conic-gradient(${color} ${pct * 3.6}deg, ${vmTokens.divider} 0deg)`,
        flexShrink: 0,
      }}
      aria-label={`Score ${value} out of 100`}
    >
      <div
        style={{
          width: diameter - 14,
          height: diameter - 14,
          borderRadius: '50%',
          background: vmTokens.surfaceRaisedBg,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <span style={{ fontSize: diameter * 0.28, fontWeight: 700, color: vmTokens.textPrimary, lineHeight: 1 }}>
          {Math.round(value)}
        </span>
        <span style={{ fontSize: 10, color: vmTokens.textTertiary, marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  );
}

// ─── State boundary (loading / signed-out / not-a-coach / error) ─────────────

interface CoachStateProps {
  loading: boolean;
  authError: CoachAuthReason | null;
  error: boolean;
  onRetry?: () => void;
  children: ReactNode;
}

export function CoachStateBoundary({ loading, authError, error, onRetry, children }: CoachStateProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={centeredStyle}>
        <div
          data-testid="coach-loading"
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: `3px solid ${vmTokens.divider}`,
            borderTopColor: vmTokens.gold,
            animation: 'coach-spin 0.8s linear infinite',
          }}
        />
        <style>{'@keyframes coach-spin{to{transform:rotate(360deg)}}'}</style>
      </div>
    );
  }

  if (authError === 'signed_out') {
    return (
      <div style={centeredStyle} data-testid="coach-signed-out">
        <GraduationCap size={44} style={{ color: vmTokens.gold }} strokeWidth={1.5} />
        <h2 style={gateTitle}>Coach sign-in</h2>
        <p style={gateBody}>Sign in to VerseMate to see your coaching feedback, trends, and settings.</p>
        <button style={primaryBtn} onClick={() => navigate('/login')} data-testid="coach-signin-cta">
          <LogIn size={16} strokeWidth={2} /> Sign in
        </button>
      </div>
    );
  }

  if (authError === 'not_a_coach') {
    return (
      <div style={centeredStyle} data-testid="coach-not-a-coach">
        <GraduationCap size={44} style={{ color: vmTokens.textTertiary }} strokeWidth={1.5} />
        <h2 style={gateTitle}>Not a coaching account</h2>
        <p style={gateBody}>
          This account isn’t set up for Bible-study coaching yet. If you lead a group and expect feedback here,
          reach out to your coach.
        </p>
        <button style={secondaryBtn} onClick={() => navigate('/read')}>Back to reading</button>
      </div>
    );
  }

  if (error) {
    return (
      <div style={centeredStyle} data-testid="coach-error">
        <p style={gateBody}>Something went wrong loading your coaching data.</p>
        {onRetry ? (
          <button style={secondaryBtn} onClick={onRetry}>Try again</button>
        ) : null}
      </div>
    );
  }

  return <>{children}</>;
}

const centeredStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  padding: 32,
  textAlign: 'center',
};

const gateTitle: CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: vmTokens.textPrimary,
  margin: 0,
};

const gateBody: CSSProperties = {
  fontSize: 14,
  color: vmTokens.textSecondary,
  maxWidth: 320,
  lineHeight: 1.5,
  margin: 0,
};

const primaryBtn: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  marginTop: 6,
  padding: '10px 20px',
  borderRadius: 10,
  border: 'none',
  background: vmTokens.gold,
  color: vmTokens.goldOnLight,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryBtn: CSSProperties = {
  marginTop: 6,
  padding: '10px 20px',
  borderRadius: 10,
  border: `1px solid ${vmTokens.divider}`,
  background: vmTokens.surfaceRaisedBg,
  color: vmTokens.textPrimary,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};
