import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { JesusTopicBrowse } from './JesusTopicParts';
import type { JesusBrowse, JesusEventCard, JesusTopicGroup } from '@/services/types';

function event(overrides: Partial<JesusEventCard> = {}): JesusEventCard {
  return {
    slug: 'nicodemus-by-night',
    title: 'Nicodemus comes by night',
    summary: 'A ruler of the Jews comes after dark and is told he must be born again.',
    period_slug: 'early-ministry',
    period_name: 'Early ministry',
    sequence: 12,
    chronology_confidence: 'high',
    parallel_confidence: 'high',
    gospels: ['John'],
    passages: [
      {
        book_id: 43,
        book_name: 'John',
        chapter: 3,
        verse_start: 1,
        verse_end: 21,
        is_primary: true,
        display: 'John 3:1-21',
      },
    ],
    facet_counts: { words: 3, actions: 0, by_type: { TEACHING: 3 } },
    matched_facets: [
      {
        slug: 'you-must-be-born-again',
        mode: 'WORD',
        type: 'TEACHING',
        type_slug: 'teachings',
        type_label: 'Teaching',
        speaker: 'JESUS',
        actor: null,
        title: 'You must be born again',
        text: 'unless one is born again he cannot see the kingdom of God',
        summary: 'Entry to the Kingdom is a new birth, not a lineage.',
        provenance: 1,
        reference: 'John 3:3',
        book_id: 43,
        chapter: 3,
        verse_start: 3,
        verse_end: 3,
      },
    ],
    themes: [{ slug: 'kingdom', name: 'Kingdom' }],
    ...overrides,
  };
}

function topic(overrides: Partial<JesusTopicGroup> = {}): JesusTopicGroup {
  const events = overrides.events ?? [event()];
  return {
    slug: 'kingdom',
    name: 'Kingdom',
    description: 'The reign of God breaking into the world.',
    sort_order: 1,
    event_count: events.length,
    facet_count: events.length,
    gospels: ['Matthew', 'John'],
    brief: null,
    brief_provenance: null,
    points: events.flatMap((e) =>
      e.matched_facets.map((f) => ({
        slug: f.slug,
        title: f.title,
        text: f.text,
        summary: f.summary,
        reference: f.reference,
        provenance: f.provenance,
      })),
    ),
    ...overrides,
    events,
  };
}

function browse(overrides: Partial<JesusBrowse> = {}): JesusBrowse {
  const topics = overrides.topics ?? [topic()];
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
      intro: 'Jesus taught in synagogues, on hillsides and at dinner tables.',
      event_count: 1,
      facet_count: 1,
    },
    total_events: topics.reduce((sum, t) => sum + t.event_count, 0),
    truncated: false,
    ...overrides,
    topics,
  };
}

function renderBrowse(data: JesusBrowse) {
  return render(
    <MemoryRouter>
      <JesusTopicBrowse browse={data} />
    </MemoryRouter>,
  );
}

describe('JesusTopicBrowse', () => {
  it('introduces the category before any events', () => {
    renderBrowse(browse());

    expect(screen.getByTestId('jesus-category-intro')).toHaveTextContent(
      /Jesus taught in synagogues/,
    );
    expect(screen.getByTestId('jesus-category-stats')).toHaveTextContent(
      '1 teaching · 1 moment · 1 topic',
    );
  });

  it('names each topic and says what it is about', () => {
    renderBrowse(
      browse({
        topics: [
          topic(),
          topic({
            slug: 'faith',
            name: 'Faith',
            description: 'Trust that acts.',
            sort_order: 2,
          }),
        ],
      }),
    );

    expect(screen.getByTestId('jesus-topic-name-kingdom')).toHaveTextContent('Kingdom');
    expect(screen.getByTestId('jesus-topic-description-kingdom')).toHaveTextContent(
      'The reign of God breaking into the world.',
    );
    expect(screen.getByTestId('jesus-topic-name-faith')).toHaveTextContent('Faith');
  });

  it('leads with the brief when the topic has one, and hedges it', () => {
    renderBrowse(
      browse({
        topics: [
          topic({
            brief:
              'He treats the Kingdom as something entered rather than earned.',
            brief_provenance: 2,
          }),
        ],
      }),
    );

    expect(screen.getByTestId('jesus-topic-brief-kingdom')).toHaveTextContent(
      /something entered rather than earned/,
    );
    // Level 2 is an interpretation and is labelled as one.
    expect(screen.getByTestId('jesus-provenance-2')).toBeInTheDocument();
    // The generic theme blurb steps aside rather than stacking under it.
    expect(screen.queryByTestId('jesus-topic-description-kingdom')).toBeNull();
  });

  it('falls back to the theme blurb until the brief is generated', () => {
    renderBrowse(browse());

    expect(screen.queryByTestId('jesus-topic-brief-kingdom')).toBeNull();
    expect(
      screen.getByTestId('jesus-topic-description-kingdom'),
    ).toHaveTextContent('The reign of God breaking into the world.');
  });

  it('lists the sayings as cards rather than digesting them first', () => {
    renderBrowse(browse());

    // The topic used to repeat its sayings in a "What He says here" panel
    // above the cards. The cards carry them now, so nothing stands between
    // the topic's blurb and the examples themselves.
    expect(screen.queryByTestId('jesus-topic-points-kingdom')).toBeNull();
    expect(screen.queryByText('What He says here')).toBeNull();

    const events = within(screen.getByTestId('jesus-topic-events-kingdom'));
    expect(events.getByText(/unless one is born again/)).toBeInTheDocument();
  });

  it('shows each example with its scripture and its summary', () => {
    renderBrowse(browse());

    const card = within(screen.getByTestId('jesus-topic-events-kingdom'));
    expect(card.getByText(/You must be born again/)).toBeInTheDocument();
    expect(card.getByText(/John 3:1-21/)).toBeInTheDocument();
    expect(
      card.getByText(/A ruler of the Jews comes after dark/),
    ).toBeInTheDocument();
  });

  it('quotes each saying exactly once, on its own card', () => {
    renderBrowse(browse());

    expect(
      screen.getAllByText(/unless one is born again/),
    ).toHaveLength(1);
    // The card carries the saying's title and the episode it sits in too.
    const events = within(screen.getByTestId('jesus-topic-events-kingdom'));
    expect(events.getByText('You must be born again')).toBeInTheDocument();
    expect(events.getByText('in Nicodemus comes by night')).toBeInTheDocument();
  });

  it('quotes every example in the topic, not just the first', () => {
    const spare = event({
      slug: 'the-two-debtors',
      title: 'Simon and the two debtors',
      matched_facets: [
        {
          ...event().matched_facets[0],
          slug: 'he-who-is-forgiven-little',
          title: 'He who is forgiven little, loves little',
          text: 'but he who is forgiven little, loves little',
        },
      ],
    });
    const data = browse();
    data.topics = [topic({ events: [event(), spare], points: topic().points })];
    renderBrowse(data);

    expect(
      screen.getByText(/but he who is forgiven little, loves little/),
    ).toBeInTheDocument();
  });

  it('offers a jump list only when there is more than one topic', () => {
    renderBrowse(browse());
    expect(screen.queryByTestId('jesus-topic-nav')).toBeNull();

    renderBrowse(
      browse({
        topics: [topic(), topic({ slug: 'faith', name: 'Faith', sort_order: 2 })],
      }),
    );
    expect(screen.getByTestId('jesus-topic-nav')).toBeInTheDocument();
    expect(screen.getByTestId('jesus-topic-chip-faith')).toBeInTheDocument();
  });

  it('falls back to an empty state for a category with nothing in it', () => {
    renderBrowse(browse({ topics: [], total_events: 0 }));

    expect(screen.getByTestId('jesus-empty')).toBeInTheDocument();
  });

  it('says so when the category was cut short', () => {
    renderBrowse(browse({ truncated: true }));

    expect(screen.getByTestId('jesus-topic-truncated')).toHaveTextContent(
      /larger than one page/i,
    );
  });
});
