import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import type { JesusTab } from '@/lib/jesusTabs';
import type { JesusEventDetail } from '@/services/types';

/**
 * Shared state for the Jesus event view, so the chrome that lives inside
 * `DesktopLayout` — the chapter-selector label, the Summary / By-Line / Study /
 * Compare pill group, and the right-pane body — stays in sync with the
 * `JesusEventScreen` the router renders into the left pane.
 *
 * This mirrors `TopicViewContext` exactly, and for the same reason: an event
 * behaves like a Bible reference for navigation purposes, so it wants the same
 * chrome the Bible and topic routes already use rather than a second pattern.
 *
 * On phone, JesusEventScreen renders the tabs itself; the provider still wraps
 * it so the API is uniform.
 *
 * Lifecycle: JesusEventScreen sets `detail` once it resolves and clears it in
 * its unmount cleanup, so the chrome never shows a stale event after the user
 * navigates back to a Bible chapter.
 */

interface JesusViewContextValue {
  detail: JesusEventDetail | null;
  tab: JesusTab;
  setDetail: (detail: JesusEventDetail | null) => void;
  setTab: (tab: JesusTab) => void;
}

const JesusViewContext = createContext<JesusViewContextValue | null>(null);

export function JesusViewProvider({ children }: { children: ReactNode }) {
  const [detail, setDetail] = useState<JesusEventDetail | null>(null);
  const [tab, setTab] = useState<JesusTab>('summary');

  const setDetailStable = useCallback((d: JesusEventDetail | null) => setDetail(d), []);
  const setTabStable = useCallback((t: JesusTab) => setTab(t), []);

  const value = useMemo<JesusViewContextValue>(
    () => ({ detail, tab, setDetail: setDetailStable, setTab: setTabStable }),
    [detail, tab, setDetailStable, setTabStable],
  );

  return <JesusViewContext.Provider value={value}>{children}</JesusViewContext.Provider>;
}

/**
 * Read the Jesus view state. Falls back to inert no-op setters when there's no
 * provider above, so a component can be rendered outside the Jesus routes (or
 * in a test) without needing the provider wired up.
 */
export function useJesusView(): JesusViewContextValue {
  const ctx = useContext(JesusViewContext);
  if (ctx) return ctx;
  return {
    detail: null,
    tab: 'summary',
    setDetail: () => undefined,
    setTab: () => undefined,
  };
}
