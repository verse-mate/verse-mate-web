/**
 * URL helpers for the Jesus tab.
 *
 * URL shapes (all flat and shareable):
 *   /jesus                          hub
 *   /jesus/life                     Follow His Life
 *   /jesus/life/<periodSlug>        one period of the timeline
 *   /jesus/browse/<kindSlug>        every miracle / question / parable / …
 *   /jesus/theme/<themeSlug>        Explore by Topic
 *   /jesus/study/<collectionSlug>   a Popular Study
 *   /jesus/entry/<entrySlug>        one entry
 *
 * The `/browse/`, `/theme/`, `/study/` and `/entry/` segments are literal so a
 * kind slug can never collide with `life` or with a future top-level route.
 */

export const JESUS_ROOT = '/jesus';

export function buildJesusHubUrl(): string {
  return JESUS_ROOT;
}

export function buildJesusLifeUrl(periodSlug?: string): string {
  return periodSlug ? `${JESUS_ROOT}/life/${periodSlug}` : `${JESUS_ROOT}/life`;
}

export function buildJesusKindUrl(kindSlug: string): string {
  return `${JESUS_ROOT}/browse/${kindSlug}`;
}

export function buildJesusThemeUrl(themeSlug: string): string {
  return `${JESUS_ROOT}/theme/${themeSlug}`;
}

export function buildJesusStudyUrl(collectionSlug: string): string {
  return `${JESUS_ROOT}/study/${collectionSlug}`;
}

export function buildJesusEntryUrl(entrySlug: string): string {
  return `${JESUS_ROOT}/entry/${entrySlug}`;
}

/**
 * Turn an entry slug into a stable `data-testid` suffix. Slugs are already
 * lowercase-hyphenated, so this is a guard against hand-written ids rather
 * than a transformation most of the time.
 */
export function jesusTestId(prefix: string, slug: string): string {
  return `${prefix}-${slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}
