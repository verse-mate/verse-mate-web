import type React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { vmTokens } from '@/styles/themeStyles';

/**
 * The inductive-study renderer's shared chrome — cards, pills, tables and the
 * style constants that go with them.
 *
 * Extracted from `StudyPanel` so the Jesus event's Study tab renders the same
 * study, in the same skin, from the same code. Nothing here knows where its
 * content came from; both callers pass an `InductiveStudy`.
 */

// ─── Cards, pills, tables ───────────────────────────────────────────────


export function SectionHeading({ label }: { label: string }) {
  return (
    <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700, color: vmTokens.gold, textTransform: 'uppercase', letterSpacing: '0.6px', margin: 0, marginTop: 22, marginBottom: 10 }}>
      {label}
    </h3>
  );
}

export function Card({
  open,
  onToggle,
  heading,
  subheading,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  heading: React.ReactNode;
  subheading?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ borderBottom: `1px solid ${vmTokens.divider}` }}>
      <button
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', padding: '14px 0', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', gap: 12 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, color: vmTokens.textPrimary, flex: 1, minWidth: 0 }}>
          <span style={{ width: '100%' }}>{heading}</span>
          {subheading && (
            // Subheading rendered identically whether the card is open or
            // closed so its size + position never shift on toggle.
            // paddingLeft 40 aligns under the step title (28px circle + 12px
            // gap). On non-step cards the alignment is naturally flush.
            <span style={{ fontSize: 14, fontStyle: 'italic', color: vmTokens.textSecondary, fontWeight: 400, lineHeight: '22px', paddingLeft: 40 }}>{subheading}</span>
          )}
        </div>
        {open ? (
          <ChevronUp size={18} color={vmTokens.textSecondary} style={{ flexShrink: 0, marginTop: 2 }} />
        ) : (
          <ChevronDown size={18} color={vmTokens.textSecondary} style={{ flexShrink: 0, marginTop: 2 }} />
        )}
      </button>
      {open && (
        <div style={{ paddingBottom: 18, paddingLeft: 0 }}>
          {children}
        </div>
      )}
    </div>
  );
}

export function NestedCard({
  open,
  onToggle,
  heading,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  heading: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ borderTop: `1px solid ${vmTokens.divider}` }}>
      <button
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 0', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', gap: 12 }}
      >
        <span style={{ flex: 1, minWidth: 0 }}>{heading}</span>
        {open ? (
          <ChevronUp size={16} color={vmTokens.textSecondary} style={{ flexShrink: 0 }} />
        ) : (
          <ChevronDown size={16} color={vmTokens.textSecondary} style={{ flexShrink: 0 }} />
        )}
      </button>
      {open && (
        <div style={{ paddingBottom: 12, paddingLeft: 0 }}>
          {children}
        </div>
      )}
    </div>
  );
}

export function Tag({ label }: { label: string }) {
  // Prototype's .obs-pill — solid gold pill with white text + uppercase
  // tracking. Used for POSTURE / EYES / WILL row labels inside the
  // Observation steps.
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 72,
        height: 22,
        borderRadius: 999,
        backgroundColor: vmTokens.gold,
        border: `1px solid ${vmTokens.gold}`,
        color: vmTokens.goldOnLight,
        fontFamily: 'Roboto, sans-serif',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.04em',
        padding: '0 10px',
        flexShrink: 0,
        textAlign: 'center',
      }}
    >
      {label}
    </span>
  );
}

export function RangePill({ range }: { range: string }) {
  // Prototype's .study-pill — solid gold pill with white text. Used for
  // verse-range labels like "4:1-3" on the left of each Interpretation
  // movement row. min-width / no-wrap so longer ranges (e.g. "1:12-18",
  // "1:19-27") don't wrap mid-pill.
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 64,
        height: 22,
        borderRadius: 999,
        backgroundColor: vmTokens.gold,
        border: `1px solid ${vmTokens.gold}`,
        color: vmTokens.goldOnLight,
        fontFamily: 'Roboto, sans-serif',
        fontSize: 11,
        fontWeight: 600,
        padding: '0 10px',
        flexShrink: 0,
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      {range}
    </span>
  );
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8, fontSize: 14 }}>
      {children}
    </table>
  );
}

export function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th
      style={{
        textAlign: 'left',
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: vmTokens.gold,
        borderBottom: `1px solid ${vmTokens.divider}`,
        padding: '8px 10px',
        ...style,
      }}
    >
      {children}
    </th>
  );
}

export function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td
      style={{
        padding: '10px',
        verticalAlign: 'top',
        borderBottom: `1px solid ${vmTokens.divider}`,
        color: vmTokens.textPrimary,
        lineHeight: '22px',
        ...style,
      }}
    >
      {children}
    </td>
  );
}
