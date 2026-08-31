/**
 * How many related events a Jesus screen offers.
 *
 * Three is a suggestion; a longer list is a browse view, and the Jesus feature
 * already has real ones — the theme pages and "Follow His Life" — that a reader
 * reaches by tapping the theme pill rather than by scrolling past ten cards at
 * the foot of the passage they came to read.
 *
 * The API caps its own list too, so this is not what makes the list short. It
 * keeps a cached or older response from making one screen longer than the rest.
 */
export const JESUS_RELATED_LIMIT = 3;

/** The first `JESUS_RELATED_LIMIT` of whatever the API returned. */
export function limitRelated<T>(related: T[]): T[] {
  return related.slice(0, JESUS_RELATED_LIMIT);
}
