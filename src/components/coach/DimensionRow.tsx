/**
 * One of the 12 coaching dimensions as a compact, tappable line: name + score
 * and a 0–5 bar, collapsed by default. Expanding reveals what the dimension
 * measures, its target, and the coach's "why this score" rationale.
 *
 * Shared by <ReportCard> (mobile) and <ReportDetail> (desktop) so the two stay
 * identical and the "lines, expand for detail" interaction lives in one place.
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { vmTokens } from '@/styles/themeStyles';
import type { CoachDimension } from '@/services/coachService';
import { useRubric } from '@/hooks/useRubric';
import { dimensionBandLabel } from '@/services/rubric';

export default function DimensionRow({ dim }: { dim: CoachDimension }) {
  const [open, setOpen] = useState(false);
  const na = dim.score == null;
  // From the SERVED rubric, not a local copy: the explainer a leader reads is
  // the same definition that computed the score they are looking at.
  const { rubric } = useRubric();
  const info = rubric?.dimensions.find((d) => d.n === dim.n);
  const bandLabel = dimensionBandLabel(dim.score, rubric?.dimensionBands ?? []);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        data-testid={`coach-dim-${dim.n}`}
        style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3, gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, color: vmTokens.textSecondary }}>
            <ChevronDown
              size={15}
              style={{ color: vmTokens.textTertiary, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
            />
            {dim.n}. {dim.name}
          </span>
          <span style={{ fontSize: 14, color: vmTokens.textTertiary, flexShrink: 0 }}>{na ? 'N/A' : `${dim.score}/5`}</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: vmTokens.divider, overflow: 'hidden' }}>
          <div
            style={{
              width: na ? '0%' : `${((dim.score as number) / 5) * 100}%`,
              height: '100%',
              background: vmTokens.gold,
              borderRadius: 3,
            }}
          />
        </div>
      </button>

      {/* Opens on `open` alone, NOT on the rubric having loaded. The coach's
          "why this score" is the leader's own content; a failed explainer fetch
          must not take it with it. The rubric-derived parts below are each
          conditional instead. */}
      {open && (
        <div
          style={{
            marginTop: 8,
            marginBottom: 4,
            padding: '10px 12px',
            borderRadius: 10,
            background: vmTokens.pageBg,
            border: `1px solid ${vmTokens.divider}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: vmTokens.gold }}>
              {info ? `${info.cluster} · weight ${info.clusterWeight}` : ''}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: vmTokens.textPrimary, flexShrink: 0 }}>
              {na ? 'N/A' : `${dim.score}/5`}{bandLabel ? ` · ${bandLabel}` : ''}
            </span>
          </div>
          {info && (
            <>
              <p style={{ margin: 0, fontSize: 15, color: vmTokens.textSecondary, lineHeight: 1.6 }}>{info.what}</p>
              <p style={{ margin: '8px 0 0', fontSize: 14, color: vmTokens.textTertiary }}>
                <span style={{ fontWeight: 600 }}>Target:</span> {info.target}
              </p>
            </>
          )}
          {dim.note && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${vmTokens.divider}` }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', color: vmTokens.gold }}>
                Why this score
              </p>
              <p style={{ margin: 0, fontSize: 15, color: vmTokens.textSecondary, lineHeight: 1.6 }}>{dim.note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
