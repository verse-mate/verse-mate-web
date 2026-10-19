/**
 * "Connect your Zoom account" on Class Setup. A connected account lets the
 * VerseMate notetaker join the leader's classes as their guest: it skips the
 * waiting room and records without anyone allowing it. Without it the bot still
 * joins from the class link, and the host admits it and allows recording.
 *
 * Renders nothing while the status loads, when the notetaker did not answer
 * (`known` false) or when the request failed: the page works either way, so
 * there is nothing to warn about.
 */

import { CheckCircle2, ExternalLink, Video } from 'lucide-react';
import { vmTokens } from '@/styles/themeStyles';
import { useNotetakerStatus } from '@/hooks/useCoach';
import { CoachCard } from './CoachUi';

export const NOTETAKER_EXPLAINER_URL = 'https://versemate.org/coach/notetaker';

export default function NotetakerConnectCard() {
  const { data: status } = useNotetakerStatus();
  if (!status?.known) return null;

  if (status.connected) {
    return (
      <CoachCard testId="coach-notetaker-connected" style={{ padding: '12px 16px' }}>
        <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: vmTokens.textPrimary }}>
          <CheckCircle2 size={17} style={{ color: vmTokens.statusSuccess, flexShrink: 0 }} />
          {status.zoomEmail ? `Zoom connected as ${status.zoomEmail}` : 'Zoom connected'}
        </p>
      </CoachCard>
    );
  }

  return (
    <CoachCard testId="coach-notetaker-connect">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <Video size={18} style={{ color: vmTokens.gold }} strokeWidth={1.75} />
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: vmTokens.textPrimary }}>
          Connect your Zoom account (recommended)
        </h3>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: vmTokens.textSecondary, lineHeight: 1.5 }}>
        Connect once, and the notetaker joins your classes as your guest. It skips the waiting room and records
        without anyone clicking “Allow”.
      </p>
      <p style={{ margin: '6px 0 0', fontSize: 12.5, color: vmTokens.textTertiary, lineHeight: 1.5 }}>
        Without it, the notetaker still joins from your meeting link, but the host has to admit it and allow
        recording.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        <a
          href={status.connectUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="coach-notetaker-connect-button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 18px',
            borderRadius: 10,
            background: vmTokens.gold,
            color: vmTokens.goldOnLight,
            fontSize: 13.5,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Connect Zoom
        </a>
        <a
          href={NOTETAKER_EXPLAINER_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="coach-notetaker-how"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 14px',
            borderRadius: 10,
            border: `1px solid ${vmTokens.divider}`,
            color: vmTokens.textSecondary,
            fontSize: 13.5,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          How it works <ExternalLink size={14} />
        </a>
      </div>
    </CoachCard>
  );
}
