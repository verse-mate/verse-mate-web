import { useState, type CSSProperties } from 'react';
import { MailCheck } from 'lucide-react';
import { sendVerificationEmail } from '@/services/emailVerification';

export default function ConfirmEmailGate({
  container,
  title,
  body,
  button,
  iconColor,
}: {
  container: CSSProperties;
  title: CSSProperties;
  body: CSSProperties;
  button: CSSProperties;
  iconColor: string;
}) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const send = async () => {
    setState('sending');
    try {
      await sendVerificationEmail();
      setState('sent');
    } catch {
      setState('failed');
    }
  };
  return (
    <div style={container} data-testid="coach-confirm-email">
      <MailCheck size={44} style={{ color: iconColor }} strokeWidth={1.5} />
      <h2 style={title}>Confirm your email</h2>
      <p style={body}>
        Your coaching reports open once this account's email address is confirmed. We send a link to the address you signed up
        with; open it in this browser.
      </p>
      {state === 'sent' ? (
        <p style={body} role="status" data-testid="coach-confirm-email-sent">
          Sent. Check your inbox for the confirmation link. It works for one hour.
        </p>
      ) : (
        <button style={button} onClick={send} disabled={state === 'sending'} data-testid="coach-confirm-email-send">
          Send the confirmation email
        </button>
      )}
      {state === 'failed' && (
        <p style={body} role="alert" data-testid="coach-confirm-email-failed">
          The email could not be sent. Try again in a moment.
        </p>
      )}
    </div>
  );
}
