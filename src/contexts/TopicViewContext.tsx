import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import type { Topic, TopicDetails } from '@/services/types';

/**
 * Shared state for the topic view, so the topic page chrome that lives
 * inside `DesktopLayout` (chapter-selector label, Summary/By-Line/Detailed
 * pill-group, right-pane explanation body) can stay in sync with the
 * `TopicEventsScreen` that the router renders into the left pane.
 *
 * On phone, TopicEventsScreen is the only consumer; the same provider
 * still wraps it so the API is uniform.
 *
 * Lifecycle:
 *  - TopicEventsScreen `setTopic` / `setDetails` once the data resolves
 *    and clears them in its unmount cleanup so the chrome doesn't show
 *    stale state if the user navigates back to a Bible chapter.
 *  - The pill state (`insightTab`) is owned here so the desktop pill-
 *    group in `DesktopLayout` and the body render in `TopicEventsScreen`
 *    point at the same explanation.
 */

export type InsightTab = 'summary' | 'byline' | 'detailed';

interface TopicViewContextValue {
  topic: Topic | null;
  details: TopicDetails | null;
  insightTab: InsightTab;
  setTopic: (topic: Topic | null) => void;
  setDetails: (details: TopicDetails | null) => void;
  setInsightTab: (tab: InsightTab) => void;
}

const TopicViewContext = createContext<TopicViewContextValue | null>(null);

export function TopicViewProvider({ children }: { children: ReactNode }) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [details, setDetails] = useState<TopicDetails | null>(null);
  const [insightTab, setInsightTab] = useState<InsightTab>('summary');

  const setTopicStable = useCallback((t: Topic | null) => setTopic(t), []);
  const setDetailsStable = useCallback((d: TopicDetails | null) => setDetails(d), []);
  const setInsightTabStable = useCallback((t: InsightTab) => setInsightTab(t), []);

  const value = useMemo<TopicViewContextValue>(
    () => ({
      topic,
      details,
      insightTab,
      setTopic: setTopicStable,
      setDetails: setDetailsStable,
      setInsightTab: setInsightTabStable,
    }),
    [topic, details, insightTab, setTopicStable, setDetailsStable, setInsightTabStable]
  );

  return <TopicViewContext.Provider value={value}>{children}</TopicViewContext.Provider>;
}

/**
 * Read the topic view state. Falls back to inert no-op setters when
 * called outside the provider so consumers that mount briefly during
 * route transitions don't crash.
 */
export function useTopicView(): TopicViewContextValue {
  const ctx = useContext(TopicViewContext);
  if (ctx) return ctx;
  return {
    topic: null,
    details: null,
    insightTab: 'summary',
    setTopic: () => {},
    setDetails: () => {},
    setInsightTab: () => {},
  };
}
