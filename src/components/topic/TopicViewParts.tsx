/**
 * Shared subviews for the topic screen so both the standalone mobile
 * page (`TopicEventsScreen`) and the desktop split (`DesktopLayout`'s
 * right pane on a topic route) render the same content.
 *
 * `ContentTab` is the section + verse-by-verse listing with clickable
 * reference pills. `ExplanationTab` is the markdown renderer for the
 * Summary / By-Line / Detailed insights.
 */

import { BookOpen } from 'lucide-react';
import MarkdownBlock from '@/components/MarkdownBlock';
import type { TopicSection, TopicVerse } from '@/services/types';
import { vmTokens } from '@/styles/themeStyles';

export type InsightTab = 'summary' | 'byline' | 'detailed';

export const INSIGHT_TABS: { id: InsightTab; label: string }[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'byline', label: 'By Line' },
  { id: 'detailed', label: 'Detailed' },
];

interface ContentTabProps {
  sections: TopicSection[];
  allCount: number;
  onOpenReference: (ref: string) => void;
  loading: boolean;
}

export function ContentTab({
  sections,
  allCount,
  onOpenReference,
  loading,
}: ContentTabProps) {
  return (
    <div data-testid="topic-content-body">
      <div className="pt-4">
        {loading ? (
          <p className="text-center py-8 text-[14px]" style={{ color: vmTokens.textTertiary }}>
            Loading...
          </p>
        ) : sections.length === 0 ? (
          <p className="text-center py-8 text-[14px]" style={{ color: vmTokens.textTertiary }}>
            No content available for this topic yet.
          </p>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => (
              <section
                key={section.id}
                data-testid={`topic-section-${section.id}`}
                className="pb-5 last:border-b-0"
                style={{ borderBottom: `1px solid ${vmTokens.divider}` }}
              >
                <h3
                  className="text-[18px] font-semibold mb-2"
                  style={{ color: vmTokens.textPrimary }}
                >
                  {section.subtitle}
                </h3>

                {section.references.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {section.references.map((ref) => (
                      <button
                        key={ref}
                        onClick={() => onOpenReference(ref)}
                        className="flex items-center gap-1.5 text-[12px] rounded-full px-3 py-1.5 transition-colors"
                        style={{
                          backgroundColor: vmTokens.surfaceRaisedBg,
                          border: `1px solid ${vmTokens.divider}`,
                          color: vmTokens.textPrimary,
                        }}
                      >
                        <BookOpen size={12} strokeWidth={1.75} />
                        {ref}
                      </button>
                    ))}
                  </div>
                )}

                {section.verses.length > 0 ? (
                  <VerseList verses={section.verses} fontSize={20} />
                ) : (
                  <p className="text-[13px]" style={{ color: vmTokens.textTertiary }}>
                    No verses parsed for this section.
                  </p>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VerseList({ verses, fontSize }: { verses: TopicVerse[]; fontSize: number }) {
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
        <span key={`${v.verseNumber}-${i}`}>
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
            {v.verseNumber}
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

export function ExplanationTab({
  text,
  kind,
  loading,
}: {
  text: string;
  kind: InsightTab;
  loading: boolean;
}) {
  if (loading) {
    return (
      <p className="text-center py-8 text-[14px]" style={{ color: vmTokens.textTertiary }}>
        Loading...
      </p>
    );
  }
  if (
    !text.trim() ||
    /^no\s+(summary|byline|detailed)\s+explanation\s+available/i.test(text.trim())
  ) {
    return (
      <p
        className="text-center py-10 text-[14px]"
        data-testid={`topic-explanation-${kind}-empty`}
        style={{ color: vmTokens.textTertiary }}
      >
        No {kind} explanation available for this topic yet.
      </p>
    );
  }
  return (
    <div
      className="pt-4"
      data-testid={`topic-explanation-${kind}`}
      style={{ color: vmTokens.textPrimary }}
    >
      {kind === 'byline' ? <ByLineBody markdown={text} /> : <MarkdownBlock text={text} />}
    </div>
  );
}

/**
 * Renders the By-Line markdown using the same `byline-*` prototype classes
 * the main Bible reader uses (see DesktopLayout's commentary By-Line block).
 *
 * The byline API returns markdown shaped like:
 *
 *   ## {Book} {Chapter}:{Verse}
 *   > {Verse text}
 *
 *   ### Summary
 *   {Summary body…}
 *
 * If we let MarkdownBlock render that directly, "### Summary" renders as an
 * h6 (bold 15px, no uppercase) instead of the small dimmed `SUMMARY` tracking
 * label the reader has — that's the regression QA caught.
 */
function ByLineBody({ markdown }: { markdown: string }) {
  const entries = parseByLineMarkdown(markdown);
  if (entries.length === 0) {
    return <MarkdownBlock text={markdown} />;
  }
  return (
    <div className="byline-list">
      {entries.map((entry, i) => (
        <div key={`${entry.ref}-${i}`} className="byline-row open">
          <div className="byline-body">
            {entry.ref && <div className="byline-ref-strong">{entry.ref}</div>}
            {entry.verseText && (
              <blockquote className="byline-verse-quote">{entry.verseText}</blockquote>
            )}
            {entry.summary && (
              <>
                <div className="byline-summary-label">Summary</div>
                <div className="byline-summary-text">
                  <MarkdownBlock text={entry.summary} />
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface ByLineEntry {
  ref: string;
  verseText: string;
  summary: string;
}

function parseByLineMarkdown(markdown: string): ByLineEntry[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const entries: ByLineEntry[] = [];
  let current: ByLineEntry | null = null;
  let mode: 'pre' | 'summary' = 'pre';
  const verseBuf: string[] = [];
  const summaryBuf: string[] = [];

  const flush = () => {
    if (!current) return;
    current.verseText = verseBuf.join(' ').trim();
    current.summary = summaryBuf.join('\n').trim();
    if (current.ref || current.verseText || current.summary) {
      entries.push(current);
    }
    verseBuf.length = 0;
    summaryBuf.length = 0;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    // New verse section
    if (/^##\s+/.test(line) && !/^###/.test(line)) {
      flush();
      current = { ref: line.replace(/^##\s+/, ''), verseText: '', summary: '' };
      mode = 'pre';
      continue;
    }
    // Summary heading inside a section
    if (current && /^###\s*summary\s*$/i.test(line)) {
      mode = 'summary';
      continue;
    }
    if (!current) continue;
    if (mode === 'pre') {
      if (line.startsWith('>')) {
        verseBuf.push(line.replace(/^>\s?/, ''));
      }
      // Drop other pre-summary lines (we already have the ref from the heading)
      continue;
    }
    // mode === 'summary': preserve raw lines so MarkdownBlock keeps paragraph breaks
    summaryBuf.push(rawLine);
  }
  flush();
  return entries;
}
