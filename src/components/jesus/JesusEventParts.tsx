/**
 * Shared pieces for the event graph UI.
 *
 * Split from `JesusParts` because these render events and facets, while those
 * render the superseded entry model. The two coexist while the entry endpoints
 * are still served.
 */

import { BookOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { JesusEmpty } from '@/components/jesus/JesusParts';
import {
  ReferencePill,
  ReferencePillRow,
  ScriptureSection,
  ScriptureText,
  ScripturePlaceholder,
} from '@/components/scripture/ScriptureBlock';
import type { useOpenReference } from '@/hooks/useOpenReference';
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
        fontSize: 10,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        verticalAlign: 'middle',
        color: vmTokens.textTertiary,
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
        <ScriptureText
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
 */
export function JesusFacetList({
  facets,
  emptyLabel,
  onOpenReference,
  testId,
}: {
  facets: JesusFacet[];
  emptyLabel: string;
  onOpenReference: ReturnType<typeof useOpenReference>;
  testId: string;
}) {
  if (facets.length === 0) return <JesusEmpty label={emptyLabel} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} data-testid={testId}>
      {facets.map((facet) => (
        <article
          key={facet.slug}
          data-testid={jesusTestId('jesus-facet', facet.slug)}
          style={{
            padding: 14,
            borderRadius: 12,
            backgroundColor: vmTokens.surfaceRaisedBg,
            border: `1px solid ${vmTokens.divider}`,
          }}
        >
          <p
            style={{
              fontFamily: FONT,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: vmTokens.gold,
              marginBottom: 4,
            }}
          >
            {facet.type_label}
          </p>

          <h3
            style={{
              fontFamily: FONT,
              fontSize: 16,
              fontWeight: 500,
              lineHeight: '22px',
              color: vmTokens.textPrimary,
            }}
          >
            {facet.title}
          </h3>

          {facet.text && (
            <blockquote
              style={{
                margin: '8px 0 0',
                paddingLeft: 10,
                borderLeft: `2px solid ${vmTokens.gold}`,
                fontFamily: FONT,
                fontSize: 15,
                lineHeight: '23px',
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
                fontFamily: FONT,
                fontSize: 14,
                lineHeight: '20px',
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
                  gap: 5,
                  padding: '3px 10px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  backgroundColor: vmTokens.pageBg,
                  border: `1px solid ${vmTokens.divider}`,
                  fontFamily: FONT,
                  fontSize: 12,
                  color: vmTokens.textSecondary,
                }}
              >
                <BookOpen size={11} strokeWidth={1.75} />
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

/** An event, as it appears in every list. */
export function JesusEventCardView({
  event,
  index,
}: {
  event: JesusEventCard;
  index?: number;
}) {
  const navigate = useNavigate();
  // On a filtered list the API labels which facets matched, so a Questions
  // browse shows the question rather than just the episode's name.
  const highlight = event.matched_facets[0];

  return (
    <article
      data-testid={jesusTestId('jesus-event-card', event.slug)}
      style={{
        position: 'relative',
        padding: 14,
        borderRadius: 12,
        backgroundColor: vmTokens.surfaceRaisedBg,
        border: `1px solid ${vmTokens.divider}`,
        width: '100%',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {index !== undefined && (
          <span
            aria-hidden="true"
            style={{
              flexShrink: 0,
              width: 24,
              height: 24,
              borderRadius: 999,
              backgroundColor: vmTokens.pageBg,
              border: `1px solid ${vmTokens.divider}`,
              color: vmTokens.textTertiary,
              fontFamily: FONT,
              fontSize: 11,
              lineHeight: '22px',
              textAlign: 'center',
            }}
          >
            {index}
          </span>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {highlight && (
            <p
              style={{
                fontFamily: FONT,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: vmTokens.gold,
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
                lineHeight: '22px',
                color: vmTokens.textPrimary,
              }}
            >
              {/* Stretches the title's hit area over the card without nesting
                  a button inside a button. */}
              <span aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: 12 }} />
              {highlight && highlight.title !== event.title ? highlight.title : event.title}
            </button>
          </h3>

          {highlight && highlight.title !== event.title && (
            <p
              style={{
                marginTop: 3,
                fontFamily: FONT,
                fontSize: 12,
                color: vmTokens.textTertiary,
              }}
            >
              in {event.title}
            </p>
          )}

          {highlight?.text && (
            <blockquote
              style={{
                margin: '8px 0 0',
                paddingLeft: 10,
                borderLeft: `2px solid ${vmTokens.gold}`,
                fontFamily: FONT,
                fontSize: 14,
                lineHeight: '21px',
                fontStyle: 'italic',
                color: vmTokens.textPrimary,
              }}
            >
              “{highlight.text}”
            </blockquote>
          )}

          {!highlight && event.summary && (
            <p
              style={{
                marginTop: 8,
                fontFamily: FONT,
                fontSize: 14,
                lineHeight: '20px',
                color: vmTokens.textSecondary,
              }}
            >
              {event.summary}
            </p>
          )}

          <p
            style={{
              marginTop: 10,
              fontFamily: FONT,
              fontSize: 12,
              color: vmTokens.textTertiary,
            }}
          >
            {event.passages.map((p) => p.display).join(' · ')}
            {event.gospels.length > 1 && (
              <span style={{ color: vmTokens.gold }}> · {event.gospels.length} accounts</span>
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
