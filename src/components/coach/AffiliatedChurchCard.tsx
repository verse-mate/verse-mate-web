/**
 * Editable "Affiliated church" card — part of the coach setup area. Captures
 * the church a leader's Bible study is connected to, so the coaching program
 * can group and report on leaders by congregation.
 */

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Church } from 'lucide-react';
import { toast } from 'sonner';
import { vmTokens } from '@/styles/themeStyles';
import { saveCoachAffiliatedChurch } from '@/services/coachService';
import { coachKeys } from '@/hooks/useCoach';
import { CoachCard } from './CoachUi';

export default function AffiliatedChurchCard({ initialChurch }: { initialChurch: string }) {
  const [value, setValue] = useState(initialChurch);
  const queryClient = useQueryClient();

  // Keep the field in sync if the query refetches a newer stored value.
  useEffect(() => setValue(initialChurch), [initialChurch]);

  const mutation = useMutation({
    mutationFn: (church: string) => saveCoachAffiliatedChurch(church),
    onSuccess: (saved) => {
      setValue(saved);
      queryClient.setQueryData(coachKeys.me, (prev: unknown) =>
        prev && typeof prev === 'object' ? { ...prev, affiliatedChurch: saved } : prev,
      );
      toast.success('Affiliated church saved');
    },
    onError: () => toast.error('Could not save — try again'),
  });

  const dirty = value.trim() !== (initialChurch || '').trim();

  return (
    <CoachCard testId="coach-church-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <Church size={18} style={{ color: vmTokens.gold }} strokeWidth={1.75} />
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: vmTokens.textPrimary }}>Affiliated church</h3>
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 12.5, color: vmTokens.textSecondary, lineHeight: 1.45 }}>
        The church your Bible study is connected to. We use it to group leaders by congregation.
      </p>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. Austin Ridge Church"
        maxLength={200}
        autoCapitalize="words"
        spellCheck={false}
        data-testid="coach-church-input"
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 10,
          border: `1px solid ${vmTokens.inputBorder}`,
          background: vmTokens.inputBg,
          color: vmTokens.textPrimary,
          fontSize: 14,
          outline: 'none',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <button
          onClick={() => mutation.mutate(value.trim())}
          disabled={!dirty || mutation.isPending}
          data-testid="coach-church-save"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 18px',
            borderRadius: 10,
            border: 'none',
            background: !dirty ? vmTokens.divider : vmTokens.gold,
            color: !dirty ? vmTokens.textTertiary : vmTokens.goldOnLight,
            fontSize: 13.5,
            fontWeight: 600,
            cursor: !dirty || mutation.isPending ? 'default' : 'pointer',
          }}
        >
          <Check size={15} /> {mutation.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </CoachCard>
  );
}
