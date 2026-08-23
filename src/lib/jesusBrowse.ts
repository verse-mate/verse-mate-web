/**
 * Copy helpers for the topic-grouped category browse.
 *
 * Kept out of the components so the phrasing — which is what the reader
 * actually judges the screen by — can be tested without rendering anything.
 */

import type { JesusBrowse, JesusTopicGroup } from '@/services/types';

/**
 * "8 teachings" / "1 teaching" / "3 acts of compassion".
 *
 * The nouns come from the API rather than being pluralized here: "Compassion"
 * is already a plural label but not a countable one, and only the taxonomy
 * knows that.
 */
export function countLabel(count: number, singular: string, plural: string): string {
  const noun = count === 1 ? singular : plural;
  // Labels arrive title-cased for headings ("Act of compassion"); mid-sentence
  // they read as nouns.
  return `${count} ${noun.charAt(0).toLowerCase()}${noun.slice(1)}`;
}

/**
 * The line under the intro: how much there is and how it is divided.
 *
 * Reports what the screen actually shows. `facet_count` is the count of things
 * He said or did of this type, which is larger than the number of events — one
 * episode can hold several — so the two are named separately rather than
 * blurred into a single number.
 */
export function categoryStats(browse: JesusBrowse): string {
  const { type, topics, total_events } = browse;
  const parts = [
    countLabel(type.facet_count || total_events, type.singular, type.plural),
  ];
  if (total_events) {
    parts.push(total_events === 1 ? '1 moment' : `${total_events} moments`);
  }
  if (topics.length) {
    parts.push(topics.length === 1 ? '1 topic' : `${topics.length} topics`);
  }
  return parts.join(' · ');
}

/**
 * The heading a topic gets: its name plus how much of the category sits there.
 */
export function topicCount(
  topic: JesusTopicGroup,
  singular: string,
  plural: string,
): string {
  return countLabel(topic.facet_count || topic.event_count, singular, plural);
}

/**
 * Where a topic's material sits in the Gospels.
 *
 * Returns an empty string rather than a lone "Matthew" dangling on its own row
 * when there is nothing to compare it against.
 */
export function topicGospels(topic: JesusTopicGroup): string {
  if (topic.gospels.length < 2) return '';
  return topic.gospels.join(' · ');
}

/** The anchor id a topic chip scrolls to. */
export function topicAnchorId(topic: JesusTopicGroup): string {
  return `jesus-topic-${topic.slug ?? 'other'}`;
}
