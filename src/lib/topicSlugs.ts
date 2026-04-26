/**
 * Topic slug utilities — ported from verse-mate/apps/frontend-next/src/lib/topicSlugs.ts.
 * URL shape: /topic/<categorySlug>/<topicSlug>
 *   categorySlug ∈ events | prophecies | parables | themes
 *   topicSlug    = slugified topic title (e.g. "Birth of Jesus" → "birth-of-jesus")
 */

export const TOPIC_CATEGORY_SLUGS: Record<string, string> = {
  EVENT: 'events',
  PROPHECY: 'prophecies',
  PARABLE: 'parables',
  THEME: 'themes',
};

const SLUG_TO_CATEGORY: Record<string, string> = {
  events: 'EVENT',
  prophecies: 'PROPHECY',
  parables: 'PARABLE',
  themes: 'THEME',
};

export function getCategorySlug(category: string): string | null {
  return TOPIC_CATEGORY_SLUGS[category] ?? null;
}

export function getCategoryFromSlug(slug: string): string | null {
  return SLUG_TO_CATEGORY[slug] ?? null;
}

export function generateTopicSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, ''); // Trim leading/trailing hyphens
}

/**
 * Build the canonical topic URL (`/topic/<categorySlug>/<topicSlug>`).
 * Falls back to the legacy ID-based URL only if the topic has no
 * resolvable category — frontend-next's URL shape is preferred for
 * everything else so deep links are shareable and SEO-friendly.
 */
export function buildTopicUrl(topic: {
  id: string;
  name: string;
  slug?: string;
  category?: string;
}): string {
  const categorySlug = topic.category ? getCategorySlug(topic.category) : null;
  if (!categorySlug) return `/topics/${topic.id}`;
  const topicSlug = topic.slug || generateTopicSlug(topic.name);
  return `/topic/${categorySlug}/${topicSlug}`;
}
