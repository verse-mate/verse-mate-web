/**
 * Editable Zoom / Meet link card. The saved link is where the coaching bot
 * (Fireflies Notetaker) joins the leader's session, so keeping it current is
 * how a leader stays on the auto-ingest path.
 */

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Video } from 'lucide-react';
import { toast } from 'sonner';
import { vmTokens } from '@/styles/themeStyles';
import { saveCoachZoomLink } from '@/services/coachService';
import { coachKeys } from '@/hooks/useCoach';
import { CoachCard } from './CoachUi';

export default function ZoomLinkCard({ initialLink }: { initialLink: string }) {
  const [value, setValue] = useState(initialLink);
  const queryClient = useQueryClient();

  // Keep the field in sync if the query refetches a newer stored value.
  useEffect(() => setValue(initialLink), [initialLink]);

  const mutation = useMutation({
    mutationFn: (link: string) => saveCoachZoomLink(link),
    onSuccess: (saved) => {
      setValue(saved);
      queryClient.setQueryData(coachKeys.me, (prev: unknown) =>
        prev && typeof prev === 'object' ? { ...prev, zoomLink: saved } : prev,
      );
      toast.success('Meeting link saved');
    },
    onError: () => toast.error('Could not save — check the link and try again'),
  });

  const dirty = value.trim() !== (initialLink || '').trim();
  const invalid = value.trim() !== '' && !/^https?:\/\/\S+$/i.test(value.trim());

  return (
    <CoachCard testId="coach-zoom-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <Video size={18} style={{ color: vmTokens.gold }} strokeWidth={1.75} />
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: vmTokens.textPrimary }}>Your meeting link</h3>
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 12.5, color: vmTokens.textSecondary, lineHeight: 1.45 }}>
        Paste your recurring Zoom, Google Meet, or Teams link. Your coaching notetaker uses it to join and record
        your session automatically.
      </p>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://zoom.us/j/…"
        inputMode="url"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        data-testid="coach-zoom-input"
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 10,
          border: `1px solid ${invalid ? vmTokens.statusError : vmTokens.inputBorder}`,
          background: vmTokens.inputBg,
          color: vmTokens.textPrimary,
          fontSize: 14,
          outline: 'none',
        }}
      />
      {invalid && (
        <p style={{ margin: '6px 0 0', fontSize: 12, color: vmTokens.statusError }}>Enter a valid http(s) link.</p>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <button
          onClick={() => mutation.mutate(value.trim())}
          disabled={!dirty || invalid || mutation.isPending}
          data-testid="coach-zoom-save"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 18px',
            borderRadius: 10,
            border: 'none',
            background: !dirty || invalid ? vmTokens.divider : vmTokens.gold,
            color: !dirty || invalid ? vmTokens.textTertiary : vmTokens.goldOnLight,
            fontSize: 13.5,
            fontWeight: 600,
            cursor: !dirty || invalid || mutation.isPending ? 'default' : 'pointer',
          }}
        >
          <Check size={15} /> {mutation.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </CoachCard>
  );
}
