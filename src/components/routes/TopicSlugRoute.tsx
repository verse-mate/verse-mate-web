import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { generateTopicSlug, getCategoryFromSlug } from '@/lib/topicSlugs';
import { fetchTopics } from '@/services/bibleService';

/**
 * Handles `/topic/<categorySlug>/<topicSlug>` — the production URL shape
 * from frontend-next. Resolves the slug to a topic ID against the API,
 * then redirects to Lovable's existing `/topics/<topicId>` route.
 *
 * This is a client-side redirect, so search engines that crawl the slug
 * URL will be redirected. If preserving the slug URL in the index becomes
 * important, Phase 6 can add a CF Worker rule to do an edge-side 301.
 */
export default function TopicSlugRoute() {
  const { categorySlug, topicSlug } = useParams<{
    categorySlug: string;
    topicSlug: string;
  }>();
  const [topicId, setTopicId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!categorySlug || !topicSlug) {
      setNotFound(true);
      return;
    }
    const backendCategory = getCategoryFromSlug(categorySlug);
    if (!backendCategory) {
      setNotFound(true);
      return;
    }

    let cancelled = false;
    (async () => {
      const topics = await fetchTopics();
      if (cancelled) return;
      const match = topics.find(
        (t) =>
          t.category === backendCategory &&
          (t.slug === topicSlug || generateTopicSlug(t.name) === topicSlug),
      );
      if (!match) {
        setNotFound(true);
        return;
      }
      setTopicId(String(match.id));
    })();

    return () => {
      cancelled = true;
    };
  }, [categorySlug, topicSlug]);

  if (notFound) return <Navigate to="/topics" replace />;
  if (topicId) return <Navigate to={`/topics/${topicId}`} replace />;
  return null;
}
