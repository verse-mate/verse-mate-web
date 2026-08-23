/**
 * The topic-led view of a category.
 *
 * A browse screen that answers "what did He teach?" with 29 undifferentiated
 * cards leaves the reader to do the synthesis. These pieces put the synthesis
 * first: the category says what it is, each topic says what it is about and
 * quotes what He says there, and the events follow as the examples. Every
 * category tab — Teachings, Questions, Commands, Claims, Miracles and the rest
 * — renders through here, so the shape of the screen never depends on which
 * tab was opened.
 */

import { useCallback } from 'react';
import {
  JesusEventCardView,
  JesusProvenanceChip,
} from '@/components/jesus/JesusEventParts';
import { JesusEmpty, JesusPill } from '@/components/jesus/JesusParts';
import {
  categoryStats,
  topicAnchorId,
  topicCount,
  topicGospels,
} from '@/lib/jesusBrowse';
import { jesusTestId } from '@/lib/jesusSlugs';
import type { JesusBrowse, JesusTopicGroup } from '@/services/types';
import { vmTokens } from '@/styles/themeStyles';

const FONT = 'Roboto, sans-serif';

/** Words are said, actions are done — the points panel is labelled accordingly. */
function pointsHeading(mode: string): string {
  return mode === 'ACTION' ? 'What He does here' : 'What He says here';
}

/**
 * The category's own introduction: what this is, how much of it there is, and
 * a jump list of the topics it covers.
 */
export function JesusCategoryIntro({
  browse,
  onJumpToTopic,
}: {
  browse: JesusBrowse;
  onJumpToTopic: (topic: JesusTopicGroup) => void;
}) {
  const { type, topics } = browse;

  return (
    <div style={{ paddingTop: 16 }}>
      <p
        data-testid="jesus-category-intro"
        style={{
          fontFamily: FONT,
          fontSize: 15,
          lineHeight: '23px',
          color: vmTokens.textSecondary,
        }}
      >
        {type.intro}
      </p>

      <p
        data-testid="jesus-category-stats"
        style={{
          marginTop: 10,
          fontFamily: FONT,
          fontSize: 12,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: vmTokens.textTertiary,
        }}
      >
        {categoryStats(browse)}
      </p>

      {topics.length > 1 && (
        <div
          data-testid="jesus-topic-nav"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 14,
          }}
        >
          {topics.map((topic) => (
            <JesusPill
              key={topic.slug ?? 'other'}
              label={topic.name}
              count={topic.facet_count || topic.event_count}
              onClick={() => onJumpToTopic(topic)}
              testId={jesusTestId('jesus-topic-chip', topic.slug ?? 'other')}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** One topic: what it is about, what He says in it, then the examples. */
export function JesusTopicSection({
  topic,
  singular,
  plural,
  mode,
}: {
  topic: JesusTopicGroup;
  singular: string;
  plural: string;
  mode: string;
}) {
  const gospels = topicGospels(topic);
  const testKey = topic.slug ?? 'other';
  // Sayings already quoted in the panel above are not quoted again on their
  // own card a few hundred pixels below.
  const quoted = new Set(topic.points.map((point) => point.slug));

  return (
    <section
      id={topicAnchorId(topic)}
      data-testid={jesusTestId('jesus-topic-section', testKey)}
      style={{ marginTop: 28, scrollMarginTop: 12 }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <h2
          data-testid={jesusTestId('jesus-topic-name', testKey)}
          style={{
            fontFamily: FONT,
            fontSize: 19,
            fontWeight: 600,
            lineHeight: '25px',
            letterSpacing: '-0.01em',
            color: vmTokens.textPrimary,
          }}
        >
          {topic.name}
        </h2>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 12,
            color: vmTokens.textTertiary,
            whiteSpace: 'nowrap',
          }}
        >
          {topicCount(topic, singular, plural)}
        </span>
      </div>

      {/*
        The brief says what He addresses here; the theme's own blurb says what
        the theme is. Where a brief exists it replaces the blurb rather than
        stacking on top of it — two descriptions under one heading is one more
        than the reader will read, and the specific one is the reason this
        screen exists.
      */}
      {topic.brief ? (
        <p
          data-testid={jesusTestId('jesus-topic-brief', testKey)}
          style={{
            marginTop: 6,
            fontFamily: FONT,
            fontSize: 15,
            lineHeight: '23px',
            color: vmTokens.textSecondary,
          }}
        >
          {topic.brief}
          {topic.brief_provenance !== null && (
            <JesusProvenanceChip level={topic.brief_provenance} />
          )}
        </p>
      ) : (
        topic.description && (
          <p
            data-testid={jesusTestId('jesus-topic-description', testKey)}
            style={{
              marginTop: 4,
              fontFamily: FONT,
              fontSize: 14,
              lineHeight: '21px',
              color: vmTokens.textSecondary,
            }}
          >
            {topic.description}
          </p>
        )
      )}

      {gospels && (
        <p
          style={{
            marginTop: 6,
            fontFamily: FONT,
            fontSize: 12,
            color: vmTokens.textTertiary,
          }}
        >
          {gospels}
        </p>
      )}

      {topic.points.length > 0 && (
        <div
          data-testid={jesusTestId('jesus-topic-points', testKey)}
          style={{
            marginTop: 12,
            padding: 14,
            borderRadius: 12,
            backgroundColor: 'rgba(176,154,109,0.08)',
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
            }}
          >
            {pointsHeading(mode)}
          </p>

          <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none' }}>
            {topic.points.map((point) => (
              <li
                key={point.slug}
                style={{
                  paddingLeft: 10,
                  borderLeft: `2px solid ${vmTokens.gold}`,
                  marginBottom: 10,
                }}
              >
                <p
                  style={{
                    fontFamily: FONT,
                    fontSize: 14,
                    lineHeight: '21px',
                    fontStyle: point.text ? 'italic' : 'normal',
                    color: vmTokens.textPrimary,
                  }}
                >
                  {point.text ? `“${point.text}”` : point.title}
                </p>
                {(point.reference || (point.text && point.summary)) && (
                  <p
                    style={{
                      marginTop: 2,
                      fontFamily: FONT,
                      fontSize: 12,
                      lineHeight: '18px',
                      color: vmTokens.textTertiary,
                    }}
                  >
                    {[point.text ? point.summary : null, point.reference]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        data-testid={jesusTestId('jesus-topic-events', testKey)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          marginTop: 12,
        }}
      >
        {topic.events.map((event) => (
          <JesusEventCardView
            key={event.slug}
            event={event}
            detail
            hideQuote={quoted.has(event.matched_facets[0]?.slug)}
          />
        ))}
      </div>
    </section>
  );
}

/** The whole category: intro, jump list, then a section per topic. */
export function JesusTopicBrowse({ browse }: { browse: JesusBrowse }) {
  const jumpToTopic = useCallback((topic: JesusTopicGroup) => {
    document
      .getElementById(topicAnchorId(topic))
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <>
      <JesusCategoryIntro browse={browse} onJumpToTopic={jumpToTopic} />

      {browse.topics.length === 0 && <JesusEmpty label="Nothing here yet." />}

      <div data-testid="jesus-topic-list">
        {browse.topics.map((topic) => (
          <JesusTopicSection
            key={topic.slug ?? 'other'}
            topic={topic}
            singular={browse.type.singular}
            plural={browse.type.plural}
            mode={browse.type.mode}
          />
        ))}
      </div>

      {browse.truncated && (
        <p
          data-testid="jesus-topic-truncated"
          style={{
            marginTop: 20,
            fontFamily: FONT,
            fontSize: 12,
            fontStyle: 'italic',
            color: vmTokens.textTertiary,
          }}
        >
          Showing the first {browse.total_events} — this category is larger than
          one page.
        </p>
      )}
    </>
  );
}
