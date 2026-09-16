/**
 * The topic-led view of a category.
 *
 * A browse screen that answers "what did He teach?" with 29 undifferentiated
 * cards leaves the reader to do the synthesis. These pieces put the synthesis
 * first: the category says what it is and each topic says what it is about,
 * then the sayings themselves follow as the cards. Every category tab —
 * Teachings, Questions, Commands, Claims, Miracles and the rest — renders
 * through here, so the shape of the screen never depends on which tab was
 * opened.
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

/** One topic: what it is about, then the sayings themselves. */
export function JesusTopicSection({
  topic,
  singular,
  plural,
}: {
  topic: JesusTopicGroup;
  singular: string;
  plural: string;
}) {
  const gospels = topicGospels(topic);
  const testKey = topic.slug ?? 'other';

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
          <JesusEventCardView key={event.slug} event={event} detail />
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
