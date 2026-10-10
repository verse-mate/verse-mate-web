import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import ScreenHeader from '@/components/ScreenHeader';
import { vmTokens } from '@/styles/themeStyles';
import { confirmEmail, sendVerificationEmail, type ConfirmOutcome } from '@/services/emailVerification';

export default function EmailVerifiedScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const key = useSearchParams()[0].get('key') ?? '';
  const [outcome, setOutcome] = useState<ConfirmOutcome | 'checking'>('checking');
  const [resent, setResent] = useState<'idle' | 'sent' | 'failed'>('idle');
  const asked = useRef(false);

  useEffect(() => {
    if (asked.current) return;
    asked.current = true;
    if (!key) {
      setOutcome('invalid');
      return;
    }
    confirmEmail(key).then((o) => {
      setOutcome(o);
      if (o === 'confirmed' || o === 'already') queryClient.invalidateQueries();
    });
  }, [key, queryClient]);

  const resend = () =>
    sendVerificationEmail().then(
      () => setResent('sent'),
      () => setResent('failed'),
    );

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader title="Confirm your email" onBack={() => navigate('/menu')} backTestId="email-verified-back-button" />
      <div data-testid="email-verified" data-outcome={outcome} style={{ padding: 24, maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {outcome === 'checking' && <p style={text}>Confirming your email…</p>}
        {(outcome === 'confirmed' || outcome === 'already') && (
          <>
            <h2 style={heading}>Your email is confirmed</h2>
            <p style={text}>If you lead a coached group, your reports are ready to open.</p>
            <Link to="/coach" data-testid="email-verified-coach-link" style={link}>
              Open your coaching reports
            </Link>
          </>
        )}
        {outcome === 'signed-out' && (
          <>
            <h2 style={heading}>Sign in to confirm</h2>
            <p style={text}>Sign in with the account the email was sent to. You come back here afterwards.</p>
            <button type="button" data-testid="email-verified-signin" onClick={() => navigate('/login')} style={button}>
              Sign in
            </button>
          </>
        )}
        {(outcome === 'invalid' || outcome === 'failed') && (
          <>
            <h2 style={heading}>{outcome === 'invalid' ? 'This link does not work any more' : 'Your email could not be confirmed'}</h2>
            <p style={text}>
              {outcome === 'invalid'
                ? 'A confirmation link works for one hour, once, and only for the account it was sent to. Send a new one and open it in this browser.'
                : 'Something went wrong on our side. Send a new link and try again.'}
            </p>
            {resent === 'sent' ? (
              <p style={text} role="status" data-testid="email-verified-resent">
                Sent. Check your inbox for the new link.
              </p>
            ) : (
              <button type="button" data-testid="email-verified-resend" onClick={resend} style={button}>
                Send a new link
              </button>
            )}
            {resent === 'failed' && (
              <p style={text} role="alert">
                The email could not be sent. Try again in a moment.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const heading = { margin: 0, fontSize: 20, fontWeight: 700, color: vmTokens.textPrimary };
const text = { margin: 0, fontSize: 14, lineHeight: 1.55, color: vmTokens.textSecondary };
const link = { fontSize: 14, fontWeight: 600, color: vmTokens.gold };
const button = {
  alignSelf: 'flex-start' as const,
  padding: '10px 18px',
  borderRadius: 10,
  border: 'none',
  background: vmTokens.gold,
  color: vmTokens.goldOnLight,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};
