import { describe, expect, it } from 'vitest';

import {
  categoryStats,
  countLabel,
  topicAnchorId,
  topicCount,
  topicGospels,
} from './jesusBrowse';
import type { JesusBrowse, JesusTopicGroup } from '@/services/types';

function topic(overrides: Partial<JesusTopicGroup> = {}): JesusTopicGroup {
  return {
    slug: 'kingdom',
    name: 'Kingdom',
    description: 'The reign of God breaking into the world.',
    sort_order: 1,
    event_count: 4,
    facet_count: 6,
    gospels: ['Matthew', 'Mark'],
    points: [],
    events: [],
    brief: null,
    brief_provenance: null,
    ...overrides,
  };
}

function browse(overrides: Partial<JesusBrowse> = {}): JesusBrowse {
  return {
    type: {
      type: 'TEACHING',
      mode: 'WORD',
      slug: 'teachings',
      label: 'Teachings',
      singular: 'Teaching',
      plural: 'teachings',
      section: 'words',
      blurb: 'What He taught, and what it means',
      intro: 'Jesus taught in synagogues…',
      event_count: 29,
      facet_count: 41,
    },
    topics: [topic()],
    total_events: 29,
    truncated: false,
    ...overrides,
  };
}

describe('countLabel', () => {
  it('uses the singular for one', () => {
    expect(countLabel(1, 'Teaching', 'teachings')).toBe('1 teaching');
  });

  it('uses the plural for anything else', () => {
    expect(countLabel(0, 'Teaching', 'teachings')).toBe('0 teachings');
    expect(countLabel(8, 'Teaching', 'teachings')).toBe('8 teachings');
  });

  it('keeps the taxonomy nouns that do not pluralize by suffix', () => {
    expect(countLabel(3, 'Act of compassion', 'acts of compassion')).toBe(
      '3 acts of compassion',
    );
    expect(countLabel(1, 'Act of compassion', 'acts of compassion')).toBe(
      '1 act of compassion',
    );
  });
});

describe('categoryStats', () => {
  it('names the sayings, the moments and the topics separately', () => {
    expect(categoryStats(browse())).toBe('41 teachings · 29 moments · 1 topic');
  });

  it('pluralizes topics and moments', () => {
    expect(categoryStats(browse({ topics: [topic(), topic({ slug: 'faith' })] }))).toBe(
      '41 teachings · 29 moments · 2 topics',
    );
  });

  it('falls back to the event count when facets are not counted', () => {
    const data = browse();
    data.type.facet_count = 0;
    expect(categoryStats(data)).toBe('29 teachings · 29 moments · 1 topic');
  });

  it('says nothing about moments or topics for an empty category', () => {
    expect(
      categoryStats(
        browse({
          topics: [],
          total_events: 0,
          type: { ...browse().type, facet_count: 0 },
        }),
      ),
    ).toBe('0 teachings');
  });
});

describe('topicCount', () => {
  it('counts the sayings inside the topic', () => {
    expect(topicCount(topic(), 'Teaching', 'teachings')).toBe('6 teachings');
  });

  it('falls back to the event count', () => {
    expect(topicCount(topic({ facet_count: 0 }), 'Teaching', 'teachings')).toBe(
      '4 teachings',
    );
  });
});

describe('topicGospels', () => {
  it('joins the Gospels covering the topic', () => {
    expect(topicGospels(topic({ gospels: ['Matthew', 'Mark', 'Luke'] }))).toBe(
      'Matthew · Mark · Luke',
    );
  });

  it('stays quiet when there is nothing to compare', () => {
    expect(topicGospels(topic({ gospels: ['John'] }))).toBe('');
    expect(topicGospels(topic({ gospels: [] }))).toBe('');
  });
});

describe('topicAnchorId', () => {
  it('is derived from the topic slug', () => {
    expect(topicAnchorId(topic())).toBe('jesus-topic-kingdom');
  });

  it('names the untagged catch-all', () => {
    expect(topicAnchorId(topic({ slug: null }))).toBe('jesus-topic-other');
  });
});
