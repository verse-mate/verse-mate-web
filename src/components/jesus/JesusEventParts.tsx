/**
 * Shared pieces for the event graph UI.
 *
 * Split from `JesusParts` because these render events and facets, while those
 * render the superseded entry model. The two coexist while the entry endpoints
 * are still served.
 */

import { BookOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PassageScripture from '@/components/scripture/PassageScripture';
import {
  ReferencePill,
  ReferencePillRow,
  ScriptureSection,
  ScripturePlaceholder,
} from '@/components/scripture/ScriptureBlock';
import { JesusRowIndex } from '@/components/jesus/JesusParts';
import type { useOpenReference } from '@/hooks/useOpenReference';
import { jesusEyebrowStyle, jesusHeadline, jesusQuoteStyle, jesusRowStyle } from '@/lib/jesusRows';
import { buildJesusEventUrl, jesusTestId } from '@/lib/jesusSlugs';
import type {
  JesusConfidence,
  JesusEventCard,
  JesusEventPassage,
  JesusFacet,
} from '@/services/types';
import { vmTokens } from '@/styles/themeStyles';

const FONT = 'Roboto, sans-serif';

/**
 * Provenance badge — the answer to "how do you know that?".
 *
 * Level 1 is deliberately unlabelled: scripture-derived is the baseline and
 * badging every factual statement would be noise. Only inference is marked.
 */
export function JesusProvenanceChip({ level }: { level: number }) {
  if (level <= 1) return null;
  const label = level === 2 ? 'Interpretation' : 'Synthesis';
  return (
    <span
      data-testid={`jesus-provenance-${level}`}
      title={
        level === 2
          ? 'A reading of the passage in its own context.'
          : 'A theological conclusion drawn across passages.'
      }
      style={{
        display: 'inline-block',
        marginLeft: 8,
        padding: '1px 7px',
        borderRadius: 999,
        fontFamily: FONT,
        fontSize: 11,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        verticalAlign: 'middle',
        color: vmTokens.textSecondary,
        border: `1px solid ${vmTokens.divider}`,
      }}
    >
      {label}
    </span>
  );
}

/**
 * Hedge a reconstruction rather than presenting it as certain.
 *
 * Renders nothing when both confidences are `high` — a caveat on every event
 * would train readers to ignore the one that matters.
 */
export function JesusConfidenceNote({
  chronology,
  parallel,
  gospelCount,
}: {
  chronology: JesusConfidence;
  parallel: JesusConfidence;
  gospelCount: number;
}) {
  const notes: string[] = [];
  if (chronology !== 'high') {
    notes.push(`Chronological placement: ${chronology}`);
  }
  // A single-account event involves no harmonization, so its parallel
  // confidence is not a claim about anything.
  if (parallel !== 'high' && gospelCount > 1) {
    notes.push(`Parallel identification: ${parallel}`);
  }
  if (notes.length === 0) return null;

  return (
    <p
      data-testid="jesus-confidence-note"
      style={{
        marginTop: 10,
        fontFamily: FONT,
        fontSize: 12,
        lineHeight: '18px',
        color: vmTokens.textTertiary,
        fontStyle: 'italic',
      }}
    >
      {notes.join(' · ')}
    </p>
  );
}

/**
 * One passage, set the way the Topics section sets scripture: a reference pill
 * above serif verse text, ruled off from the next passage rather than boxed.
 *
 * Parallel accounts of the same event stack as sibling sections, so a reader
 * comparing Matthew and Mark scans one continuous column instead of a run of
 * cards.
 *
 * The verses are live, not a quotation: tapping one opens its Verse Insight
 * card and tapping a word opens its definition, exactly as in the reader.
 */
export function JesusPassageBlock({
  passage,
  onOpen,
  isLast = false,
}: {
  passage: JesusEventPassage;
  onOpen: () => void;
  isLast?: boolean;
}) {
  return (
    <ScriptureSection testId={jesusTestId('jesus-passage', passage.display)} isLast={isLast}>
      <ReferencePillRow>
        <ReferencePill
          label={passage.display}
          onClick={onOpen}
          testId={jesusTestId('jesus-passage-reference', passage.display)}
        />
      </ReferencePillRow>

      {passage.verses && passage.verses.length > 0 ? (
        <PassageScripture
          bookId={passage.book_id}
          bookName={passage.book_name}
          chapter={passage.chapter}
          verses={passage.verses.map((verse) => ({
            number: verse.verse_number,
            text: verse.text,
          }))}
        />
      ) : (
        <ScripturePlaceholder>Open in the reader to view this passage.</ScripturePlaceholder>
      )}
    </ScriptureSection>
  );
}

/**
 * The Words / Actions tabs.
 *
 * A WORD facet leads with the saying; an ACTION facet leads with the deed.
 * That difference is the reason the two tabs exist rather than one list.
 *
 * It lives in the insight pane, so it is set the way that pane sets its rows —
 * hairline-separated like the Study tab's steps, sized in `em` so it follows
 * the reading font size — rather than as boxed cards.
 */
export function JesusFacetList({
  facets,
  onOpenReference,
  testId,
}: {
  facets: JesusFacet[];
  onOpenReference: ReturnType<typeof useOpenReference>;
  testId: string;
}) {
  // Nothing to say is said by omitting the row, not by a placeholder inside it.
  if (facets.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }} data-testid={testId}>
      {facets.map((facet, i) => (
        <article
          key={facet.slug}
          data-testid={jesusTestId('jesus-facet', facet.slug)}
          style={{
            padding: '12px 0 14px',
            borderTop: `1px solid ${vmTokens.divider}`,
            borderBottom: i === facets.length - 1 ? `1px solid ${vmTokens.divider}` : undefined,
          }}
        >
          <p style={{ ...jesusEyebrowStyle, marginBottom: 4 }}>{facet.type_label}</p>

          <h3
            style={{
              fontFamily: FONT,
              fontSize: '0.8em',
              fontWeight: 600,
              lineHeight: 1.4,
              color: vmTokens.textPrimary,
            }}
          >
            {jesusHeadline(facet.title)}
          </h3>

          {facet.text && (
            <blockquote
              style={{
                margin: '8px 0 0',
                padding: '2px 0 2px 16px',
                borderLeft: `3px solid ${vmTokens.gold}`,
                fontFamily: "'Roboto Serif', Georgia, serif",
                fontSize: '0.85em',
                lineHeight: 1.6,
                fontStyle: 'italic',
                color: vmTokens.textPrimary,
              }}
            >
              “{facet.text}”
            </blockquote>
          )}

          {facet.summary && facet.summary !== facet.title && (
            <p
              style={{
                marginTop: 8,
                fontFamily: "'Roboto Serif', Georgia, serif",
                fontSize: '0.75em',
                lineHeight: 1.55,
                color: vmTokens.textSecondary,
              }}
            >
              {facet.summary}
            </p>
          )}

          <div
            style={{
              marginTop: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            {facet.reference && facet.book_id && facet.chapter && (
              <button
                type="button"
                onClick={() =>
                  onOpenReference({
                    book_id: facet.book_id as number,
                    book_name: facet.reference?.replace(/\s+\d+.*$/, '') ?? '',
                    chapter: facet.chapter as number,
                  })
                }
                data-testid={jesusTestId('jesus-facet-reference', facet.slug)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  backgroundColor: vmTokens.surfaceRaisedBg,
                  border: `1px solid ${vmTokens.divider}`,
                  fontFamily: FONT,
                  fontSize: 12,
                  color: vmTokens.textPrimary,
                }}
              >
                <BookOpen size={12} strokeWidth={1.75} />
                {facet.reference}
              </button>
            )}
            <JesusProvenanceChip level={facet.provenance} />
          </div>
        </article>
      ))}
    </div>
  );
}

/**
 * An event, as it appears in every list — a divider row, the shape of a Topics
 * row, not a boxed card.
 */
export function JesusEventCardView({
  event,
  index,
  detail = false,
  showKind = true,
}: {
  event: JesusEventCard;
  index?: number;
  /**
   * Show the episode's summary underneath the matched saying rather than only
   * as a fallback for it. The topic browse sets this: there the row is the
   * worked example, so what He said and what was going on both belong on it.
   */
  detail?: boolean;
  /**
   * Label the matched saying's kind above the title. A list that is already one
   * kind (the Teachings page) turns it off — "TEACHING" on every row says
   * nothing the page title doesn't.
   */
  showKind?: boolean;
}) {
  const navigate = useNavigate();
  // On a filtered list the API labels which facets matched, so a Questions
  // browse shows the question rather than just the episode's name.
  const highlight = event.matched_facets[0];

  return (
    <article
      data-testid={jesusTestId('jesus-event-card', event.slug)}
      style={{
        ...jesusRowStyle,
        position: 'relative',
        padding: '14px 0',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {index !== undefined && <JesusRowIndex n={index} />}

        <div style={{ flex: 1, minWidth: 0 }}>
          {highlight && showKind && (
            <p
              style={{
                fontFamily: FONT,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: vmTokens.textSecondary,
                marginBottom: 4,
              }}
            >
              {highlight.type_label}
            </p>
          )}

          <h3>
            <button
              type="button"
              onClick={() => navigate(buildJesusEventUrl(event.slug))}
              data-testid={jesusTestId('jesus-event-link', event.slug)}
              style={{
                padding: 0,
                background: 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: FONT,
                fontSize: 16,
                fontWeight: 500,
                lineHeight: '24px',
                color: vmTokens.textPrimary,
              }}
            >
              {/* Stretches the title's hit area over the row without nesting
                  a button inside a button. */}
              <span aria-hidden="true" style={{ position: 'absolute', inset: 0 }} />
              {jesusHeadline(
                highlight && highlight.title !== event.title ? highlight.title : event.title,
              )}
            </button>
          </h3>

          {highlight && highlight.title !== event.title && (
            <p
              style={{
                marginTop: 2,
                fontFamily: FONT,
                fontSize: 13,
                lineHeight: '20px',
                color: vmTokens.textSecondary,
              }}
            >
              in {event.title}
            </p>
          )}

          {highlight?.text && (
            <blockquote style={jesusQuoteStyle}>
              “{highlight.text}”
            </blockquote>
          )}

          {(detail || !highlight) && event.summary && (
            <p
              style={{
                marginTop: 6,
                fontFamily: FONT,
                fontSize: 14,
                lineHeight: '21px',
                color: vmTokens.textSecondary,
              }}
            >
              {event.summary}
            </p>
          )}

          <p
            style={{
              marginTop: 6,
              fontFamily: FONT,
              fontSize: 13,
              lineHeight: '20px',
              color: vmTokens.textSecondary,
              fontFeatureSettings: "'tnum'",
            }}
          >
            {event.passages.map((p) => p.display).join(' · ')}
            {event.gospels.length > 1 && (
              <span> · {event.gospels.length} accounts</span>
            )}
          </p>
        </div>

        <ChevronRight
          size={18}
          style={{ color: vmTokens.textTertiary, flexShrink: 0, marginTop: 2 }}
        />
      </div>
    </article>
  );
}
