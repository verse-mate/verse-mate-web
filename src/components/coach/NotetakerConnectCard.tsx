/**
 * "Connect your Zoom account", in two looks: the portal's (Class Setup) and the
 * coaching dashboard's (Sessions). A connected account lets the VerseMate
 * notetaker join the leader's classes as their guest: it skips the waiting room
 * and records without anyone allowing it. Without it the bot still joins from
 * the class link, and the host admits it and allows recording.
 *
 * Both render nothing while the status loads, when the notetaker did not
 * answer (`known` false) or when the request failed: the page works either
 * way, so there is nothing to warn about.
 *
 * The dashboard's card connects in the same tab (Zoom brings the leader back to
 * Sessions with `?zoom=connected`) and, once connected, can disconnect.
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ExternalLink, Video } from 'lucide-react';
import { toast } from 'sonner';
import { vmTokens } from '@/styles/themeStyles';
import { coachKeys, useNotetakerStatus } from '@/hooks/useCoach';
import { NOTETAKER_CONNECT, zoomConnectedText } from '@/lib/coachClassSchedule';
import { disconnectNotetaker } from '@/services/coachService';
import { CoachCard } from './CoachUi';
import { dt } from './dashboardTheme';
import { Btn, Dialog, muted } from './learning/ui';

export default function NotetakerConnectCard() {
  const { data: status } = useNotetakerStatus();
  if (!status?.known) return null;

  if (status.connected) {
    return (
      <CoachCard testId="coach-notetaker-connected" style={{ padding: '12px 16px' }}>
        <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: vmTokens.textPrimary }}>
          <CheckCircle2 size={17} style={{ color: vmTokens.statusSuccess, flexShrink: 0 }} />
          {zoomConnectedText(status.zoomEmail)}
        </p>
      </CoachCard>
    );
  }

  return (
    <CoachCard testId="coach-notetaker-connect">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <Video size={18} style={{ color: vmTokens.gold }} strokeWidth={1.75} />
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: vmTokens.textPrimary }}>{NOTETAKER_CONNECT.title}</h3>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: vmTokens.textSecondary, lineHeight: 1.5 }}>{NOTETAKER_CONNECT.why}</p>
      <p style={{ margin: '6px 0 0', fontSize: 12.5, color: vmTokens.textTertiary, lineHeight: 1.5 }}>
        {NOTETAKER_CONNECT.without}
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
          href={NOTETAKER_CONNECT.explainerUrl}
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

/** The same card in the coaching dashboard's look (dashboardTheme). */
export function NotetakerConnectPanel() {
  const queryClient = useQueryClient();
  const { data: status } = useNotetakerStatus();
  const [confirming, setConfirming] = useState(false);
  const disconnect = useMutation({
    mutationFn: disconnectNotetaker,
    onSuccess: (result) => {
      setConfirming(false);
      if (!result.available) toast.error('The notetaker isn’t reachable right now, so Zoom is still connected. Try again later.');
      else toast.success(result.disconnected ? 'Zoom disconnected' : 'No Zoom account was connected');
      queryClient.invalidateQueries({ queryKey: coachKeys.notetakerStatus });
      queryClient.invalidateQueries({ queryKey: coachKeys.notetakerMeetings });
    },
    onError: () => toast.error('Could not disconnect Zoom. Try again.'),
  });
  if (!status?.known) return null;

  if (status.connected) {
    return (
      <>
        <div
          data-testid="coach-notetaker-connected"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 9, background: dt.greenBg, borderRadius: 11, padding: '12px 16px', marginBottom: 22, fontSize: 14, fontWeight: 600, color: dt.green }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <CheckCircle2 size={17} style={{ flexShrink: 0 }} /> {zoomConnectedText(status.zoomEmail)}
          </span>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            data-testid="coach-notetaker-disconnect"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: dt.rust }}
          >
            Disconnect
          </button>
        </div>
        {confirming && (
          <Dialog title="Disconnect your Zoom account?" onClose={() => !disconnect.isPending && setConfirming(false)}>
            <p style={{ ...muted, color: dt.body, margin: '0 0 18px' }}>{NOTETAKER_CONNECT.disconnectConsequence}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Btn kind="danger" onClick={() => disconnect.mutate()} disabled={disconnect.isPending}>
                {disconnect.isPending ? 'Disconnecting…' : 'Disconnect Zoom'}
              </Btn>
              <Btn kind="outline" onClick={() => setConfirming(false)} disabled={disconnect.isPending}>
                Keep it connected
              </Btn>
            </div>
          </Dialog>
        )}
      </>
    );
  }

  return (
    <div
      data-testid="coach-notetaker-connect"
      style={{ background: dt.innerBg, border: `1px solid ${dt.goldChipBorder}`, borderRadius: 13, padding: '20px 22px', marginBottom: 28 }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: dt.gold, marginBottom: 8 }}>NOTETAKER</div>
      <h3 style={{ fontFamily: dt.serif, fontWeight: 500, fontSize: 20, lineHeight: 1.2, margin: '0 0 8px' }}>{NOTETAKER_CONNECT.title}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.55, color: dt.body, margin: 0, maxWidth: '62ch' }}>{NOTETAKER_CONNECT.why}</p>
      <p style={{ fontSize: 13, lineHeight: 1.55, color: dt.textMuted, margin: '6px 0 0', maxWidth: '62ch' }}>{NOTETAKER_CONNECT.without}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
        <a
          href={status.portalConnectUrl || status.connectUrl}
          data-testid="coach-notetaker-connect-button"
          style={{ background: dt.brightGold, color: dt.textPrimary, fontWeight: 700, fontSize: 13.5, padding: '10px 18px', borderRadius: 9, textDecoration: 'none' }}
        >
          Connect Zoom
        </a>
        <a
          href={NOTETAKER_CONNECT.explainerUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="coach-notetaker-how"
          style={{ border: `1px solid ${dt.inputBorder}`, color: dt.textMuted, fontWeight: 600, fontSize: 13.5, padding: '10px 18px', borderRadius: 9, textDecoration: 'none' }}
        >
          How it works →
        </a>
      </div>
    </div>
  );
}
