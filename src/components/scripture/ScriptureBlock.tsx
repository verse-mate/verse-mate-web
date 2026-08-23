/**
 * The app's one way of putting scripture on a page.
 *
 * The Topics section established the shape: a row of reference pills, then
 * the verse text set in the serif reading face with gold verse numbers, each
 * passage separated by a hairline rather than boxed in a card. The Jesus tab
 * had grown its own card-and-sans-serif variant; both now render through
 * these pieces so a passage looks the same wherever the reader meets it.
 *
 * Kept deliberately dumb — no data fetching, no route knowledge — so the
 * topic parser's `TopicVerse` and the Jesus event graph's passage verses can
 * both be mapped onto `ScriptureVerse` at the call site.
 */

import { BookOpen } from 'lucide-react';
import { vmTokens } from '@/styles/themeStyles';

/** Scripture surfaces render this shape whatever API produced it. */
export interface ScriptureVerse {
  /** Rendered verbatim as the superscript, so "3" and "3-4" both work. */
  number: string | number;
  text: string;
  /**
   * Trailing citation for verse runs stitched from several places (the topic
   * parser emits these). Omit when the surrounding pill already says it.
   */
  reference?: string;
}

/**
 * A clickable "Genesis 12:1-3" pill. The tap target into the reader — the
 * reference is the link, so scripture text itself stays non-interactive.
 */
export function ReferencePill({
  label,
  onClick,
  testId,
}: {
  label: string;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className="flex items-center gap-1.5 text-[12px] rounded-full px-3 py-1.5 transition-colors"
      style={{
        backgroundColor: vmTokens.surfaceRaisedBg,
        border: `1px solid ${vmTokens.divider}`,
        color: vmTokens.textPrimary,
      }}
    >
      <BookOpen size={12} strokeWidth={1.75} />
      {label}
    </button>
  );
}

/** The pill row above a passage. Renders nothing when there are no pills. */
export function ReferencePillRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-1.5 mb-3">{children}</div>;
}

/**
 * The verses themselves, run together as prose the way a printed Bible sets
 * them — one flowing paragraph with superscript numbers, not a list of rows.
 */
export function ScriptureText({
  verses,
  fontSize = 20,
}: {
  verses: ScriptureVerse[];
  /** Defaults to the reading size a content pane uses. */
  fontSize?: number;
}) {
  return (
    <div
      className="leading-relaxed"
      style={{
        fontSize,
        fontFamily: "'Roboto Serif', Georgia, serif",
        fontWeight: 300,
        lineHeight: '1.7',
        color: vmTokens.textPrimary,
      }}
    >
      {verses.map((v, i) => (
        <span key={`${v.number}-${i}`}>
          <sup
            style={{
              fontSize: '0.7em',
              marginRight: 2,
              verticalAlign: 'super',
              lineHeight: 0,
              color: vmTokens.gold,
              fontWeight: 500,
            }}
          >
            {v.number}
          </sup>
          {v.text}
          {v.reference && (
            <>
              {' '}
              <span style={{ color: vmTokens.textTertiary, fontSize: '0.85em' }}>
                ({v.reference})
              </span>
            </>
          )}{' '}
        </span>
      ))}
    </div>
  );
}

/**
 * One passage block: optional heading, pill row, verses — divided from the
 * next by a hairline. The last section drops its rule so a pane never ends
 * on a stray line.
 */
export function ScriptureSection({
  subtitle,
  testId,
  isLast = false,
  children,
}: {
  subtitle?: string;
  testId?: string;
  /**
   * Drops the trailing rule. Passed rather than derived from `:last-child`
   * because the rule is an inline style, which a `last:` utility can't win
   * against — the reason panes used to end on a stray hairline.
   */
  isLast?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      data-testid={testId}
      className="pb-5"
      style={{ borderBottom: isLast ? 'none' : `1px solid ${vmTokens.divider}` }}
    >
      {subtitle && (
        <h3 className="text-[18px] font-semibold mb-2" style={{ color: vmTokens.textPrimary }}>
          {subtitle}
        </h3>
      )}
      {children}
    </section>
  );
}

/** Vertical rhythm between passage blocks — matches the topic content pane. */
export function ScriptureSectionList({ children, testId }: { children: React.ReactNode; testId?: string }) {
  return (
    <div className="space-y-6" data-testid={testId}>
      {children}
    </div>
  );
}

/** The note a passage shows when scripture hasn't been hydrated onto it. */
export function ScripturePlaceholder({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px]" style={{ color: vmTokens.textTertiary }}>
      {children}
    </p>
  );
}
