/**
 * Address confirmation (/coach/confirm-address?token=…), the page the
 * confirmation email links to. Public: no sign-in, the token is the proof.
 *
 * Opening the page only READS the change. A mail scanner or link preview that
 * fetches the URL must never confirm it, so the change is applied only by the
 * explicit Confirm button, which POSTs the token.
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import ScreenHeader from '@/components/ScreenHeader';
import { CoachCard } from '@/components/coach/CoachUi';
import {
  type AddressChangeDescription,
  confirmAddressChange,
  fetchAddressChange,
  refusalCode,
  refusalText,
  shortDate,
} from '@/services/coachService';
import { vmTokens } from '@/styles/themeStyles';

const STATES = ['pending', 'expired', 'superseded', 'confirmed', 'refused', 'invalid'] as const;
type Shown = (typeof STATES)[number];

function isShown(state: string | undefined): state is Shown {
  return (STATES as readonly string[]).includes(state ?? '');
}

const CONFIRM_REFUSAL_STATE: Record<string, Shown> = {
  'invalid-link': 'invalid',
  expired: 'expired',
  superseded: 'superseded',
  'already-confirmed': 'confirmed',
  taken: 'refused',
};

const INVALID = 'This confirmation link is not valid. Check that you opened the whole link from the email, or ask your program admin to send a new one.';

function stateWords(state: Shown, change: AddressChangeDescription | undefined): string {
  switch (state) {
    case 'expired':
      return `This link expired${change ? ` on ${shortDate(change.expiresAt)}` : ''}, so the address was not changed. Ask your program admin to send a new one.`;
    case 'superseded':
      return 'A newer address change replaced this one, so this link no longer works. Use the most recent confirmation email.';
    case 'confirmed':
      return change
        ? `This change is already confirmed. ${change.leaderName}'s coaching reports go to ${change.newEmail}.`
        : 'This change is already confirmed.';
    case 'refused':
      return 'This change was not made: another leader already uses that address. Your program admin has been shown why.';
    default:
      return INVALID;
  }
}

export default function CoachConfirmAddressScreen() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const change = useQuery({
    queryKey: ['coach', 'confirm-address', token],
    queryFn: () => fetchAddressChange(token),
    enabled: token !== '',
    retry: false,
  });
  const confirm = useMutation({ mutationFn: () => confirmAddressChange(token) });

  const refusedAs = CONFIRM_REFUSAL_STATE[refusalCode(confirm.error) ?? ''];
  const loadedAs = isShown(change.data?.state) ? change.data.state : undefined;
  const invalid = token === '' || refusalCode(change.error) === 'invalid-link';
  const shown: Shown | undefined = invalid ? 'invalid' : refusedAs ?? loadedAs;
  const data = change.data;

  let body: React.ReactNode;
  if (confirm.isSuccess && data) {
    body = (
      <div data-testid="coach-confirm-address-confirmed" role="status">
        <h2 style={h2}>Address confirmed</h2>
        <p style={p}>
          Confirmed. {data.leaderName}'s coaching reports now go to {data.newEmail}.
          {confirm.data.noticeSent ? ' A notice went to the previous address.' : ''}
        </p>
      </div>
    );
  } else if (change.isLoading) {
    body = <p style={p}>Loading the address change…</p>;
  } else if (!shown) {
    body = (
      <div data-testid="coach-confirm-address-load-failed" role="alert">
        <p style={p}>
          {change.data
            ? `This address change is in a state this page does not know (${change.data.state}). Ask your program admin.`
            : `Could not load this address change. ${refusalText(change.error)}`}
        </p>
        <button type="button" onClick={() => change.refetch()} style={button}>
          Try again
        </button>
      </div>
    );
  } else if (shown === 'pending' && data) {
    body = (
      <div data-testid="coach-confirm-address-pending">
        <h2 style={h2}>Confirm your coaching address</h2>
        <p style={p}>
          A program admin asked for {data.leaderName}'s VerseMate coaching reports to go to <strong>{data.newEmail}</strong> instead of{' '}
          {data.currentEmail}.
        </p>
        <p style={p}>
          Nothing changes until you confirm. Reports keep going to the current address until then. This link works once and expires on{' '}
          {shortDate(data.expiresAt)}.
        </p>
        <button
          type="button"
          onClick={() => confirm.mutate()}
          disabled={confirm.isPending}
          data-testid="coach-confirm-address-submit"
          style={button}
        >
          {confirm.isPending ? 'Confirming…' : 'Confirm this address'}
        </button>
        {confirm.error && (
          <p role="alert" data-testid="coach-confirm-address-error" style={{ ...p, color: vmTokens.statusError }}>
            The address was not confirmed. {refusalText(confirm.error)}
          </p>
        )}
      </div>
    );
  } else {
    body = (
      <div data-testid={`coach-confirm-address-${shown}`} role="status">
        <h2 style={h2}>{shown === 'confirmed' ? 'Already confirmed' : 'Address not changed'}</h2>
        <p style={p}>{stateWords(shown, data)}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader title="Coaching address" backTestId="coach-confirm-address-back-button" />
      <div data-testid="coach-confirm-address" style={{ flex: 1, overflowY: 'auto', borderTop: `1px solid ${vmTokens.divider}` }}>
        <div style={{ padding: 16, maxWidth: 560, margin: '0 auto' }}>
          <CoachCard style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 24 }}>{body}</CoachCard>
        </div>
      </div>
    </div>
  );
}

const h2: React.CSSProperties = { margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: vmTokens.textPrimary };
const p: React.CSSProperties = { margin: '0 0 12px', fontSize: 14, lineHeight: 1.55, color: vmTokens.textSecondary };
const button: React.CSSProperties = {
  alignSelf: 'flex-start',
  fontSize: 14,
  fontWeight: 600,
  padding: '9px 16px',
  borderRadius: 8,
  border: 'none',
  background: vmTokens.gold,
  color: vmTokens.goldOnLight,
  cursor: 'pointer',
};
