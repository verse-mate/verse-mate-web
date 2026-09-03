/**
 * Which session a `?s=<id>` deep link opens (change: port-coach-pipeline).
 *
 * Its own module because the dashboard is not the only thing that has to agree
 * with it: the test does too. `Math.max(0, list.findIndex(...))` turned "not
 * found" (-1) into index 0, so an emailed link carrying a stale id rendered the
 * LATEST session under the linked session's heading, with nothing on the page
 * revealing the substitution. Every unit test passed, because none of them ever
 * asked for an id the list did not hold.
 */
export interface DeepLinkResolution<T> {
  /** The link named a session this leader cannot see. */
  missing: boolean;
  selected: T | null;
  /** Index of the selection, for finding the session before it. */
  index: number;
}

export function resolveDeepLink<T extends { id: string }>(
  list: readonly T[],
  selId: string | null,
): DeepLinkResolution<T> {
  const found = selId ? list.findIndex((r) => r.id === selId) : 0;
  // An empty list is the empty state, not a broken link: a leader with no
  // sessions yet should not be told their link is wrong.
  const missing = selId != null && list.length > 0 && found === -1;
  const index = found === -1 ? 0 : found;
  return { missing, index, selected: missing ? null : (list[index] ?? null) };
}
