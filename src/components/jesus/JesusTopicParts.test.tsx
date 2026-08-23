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

  it('quotes what He says in the topic before listing the examples', () => {
    renderBrowse(browse());

    const points = screen.getByTestId('jesus-topic-points-kingdom');
    expect(points).toHaveTextContent('What He says here');
    expect(points).toHaveTextContent(/unless one is born again/);
    expect(points).toHaveTextContent('John 3:3');
  });

  it('labels the panel for actions rather than words on an action category', () => {
    const data = browse();
    data.type.mode = 'ACTION';
    renderBrowse(data);

    expect(screen.getByTestId('jesus-topic-points-kingdom')).toHaveTextContent(
      'What He does here',
    );
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

  it('does not repeat a saying the panel above already quoted', () => {
    renderBrowse(browse());

    // Quoted once, in the topic's digest — not again on the card below it.
    expect(
      screen.getAllByText(/unless one is born again/),
    ).toHaveLength(1);
    // The card still carries the saying's title and the episode it sits in.
    const events = within(screen.getByTestId('jesus-topic-events-kingdom'));
    expect(events.getByText('You must be born again')).toBeInTheDocument();
  });

  it('still quotes an example the digest had no room for', () => {
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
    // The topic's digest covers only the first saying; the second card has to
    // speak for itself.
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
