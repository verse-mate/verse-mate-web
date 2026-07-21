/**
 * One of the 12 coaching dimensions as a tappable line: name + score and a 0–5
 * bar, collapsed by default. Expanding reveals what the dimension measures, its
 * target, and the coach's "why this score" rationale.
 *
 * Shared by <ReportCard> (mobile, `compact`) and <ReportDetail> (desktop,
 * `comfortable`). The comfortable size matches the surrounding report prose
 * (15px body) so the dimensions don't read as smaller than the sections above.
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { vmTokens } from '@/styles/themeStyles';
import type { CoachDimension } from '@/services/coachService';
import { DIMENSION_INFO, scoreBand } from './dimensionInfo';

export type DimensionRowSize = 'compact' | 'comfortable';

// Darker body grey than the token default — matches <ReportDetail>'s prose.
const BODY = 'color-mix(in srgb, var(--fg-secondary) 42%, var(--fg-primary))';

function sizing(size: DimensionRowSize) {
  return size === 'comfortable'
    ? {
        name: 15,
        nameColor: vmTokens.textPrimary,
        score: 14,
        chevron: 16,
        gap: 7,
        barH: 7,
        meta: 12,
        band: 13.5,
        body: 14.5,
        bodyColor: BODY,
        target: 13.5,
        whyLabel: 11,
      }
    : {
        name: 12,
        nameColor: vmTokens.textSecondary,
        score: 12,
        chevron: 13,
        gap: 5,
        barH: 6,
        meta: 11,
        band: 12,
        body: 12.5,
        bodyColor: vmTokens.textSecondary,
        target: 12,
        whyLabel: 11,
      };
}

export default function DimensionRow({
  dim,
  size = 'compact',
}: {
  dim: CoachDimension;
  size?: DimensionRowSize;
}) {
  const [open, setOpen] = useState(false);
  const na = dim.score == null;
  const info = DIMENSION_INFO[dim.n];
  const s = sizing(size);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        data-testid={`coach-dim-${dim.n}`}
        style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3, gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: s.gap, fontSize: s.name, fontWeight: size === 'comfortable' ? 600 : 400, color: s.nameColor }}>
            <ChevronDown
              size={s.chevron}
              style={{ color: vmTokens.textTertiary, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
            />
            {dim.n}. {dim.name}
          </span>
          <span style={{ fontSize: s.score, fontWeight: size === 'comfortable' ? 600 : 400, color: vmTokens.textSecondary, flexShrink: 0 }}>
            {na ? 'N/A' : `${dim.score}/5`}
          </span>
        </div>
        <div style={{ height: s.barH, borderRadius: 3, background: vmTokens.divider, overflow: 'hidden' }}>
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

      {open && info && (
        <div
          style={{
            marginTop: 8,
            marginBottom: 4,
            padding: size === 'comfortable' ? '12px 14px' : '10px 12px',
            borderRadius: 10,
            background: vmTokens.pageBg,
            border: `1px solid ${vmTokens.divider}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: s.meta, fontWeight: 600, color: vmTokens.gold }}>
              {info.cluster} · weight {info.clusterWeight}
            </span>
            <span style={{ fontSize: s.band, fontWeight: 700, color: vmTokens.textPrimary, flexShrink: 0 }}>
              {na ? 'N/A' : `${dim.score}/5`} · {scoreBand(dim.score)}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: s.body, color: s.bodyColor, lineHeight: 1.55 }}>{info.what}</p>
          <p style={{ margin: '8px 0 0', fontSize: s.target, color: vmTokens.textTertiary }}>
            <span style={{ fontWeight: 600 }}>Target:</span> {info.target}
          </p>
          {dim.note && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${vmTokens.divider}` }}>
              <p style={{ margin: '0 0 4px', fontSize: s.whyLabel, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', color: vmTokens.gold }}>
                Why this score
              </p>
              <p style={{ margin: 0, fontSize: s.body, color: s.bodyColor, lineHeight: 1.55 }}>{dim.note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
