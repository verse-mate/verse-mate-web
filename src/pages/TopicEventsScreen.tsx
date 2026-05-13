import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu } from 'lucide-react';
import { fetchTopicDetails, fetchTopics } from '@/services/bibleService';
import type { Topic, TopicSection } from '@/services/types';
import { useApp } from '@/contexts/AppContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTopicView, type InsightTab } from '@/contexts/TopicViewContext';
import BookSelector from '@/components/BookSelector';
import {
  ContentTab,
  ExplanationTab,
  INSIGHT_TABS,
} from '@/components/topic/TopicViewParts';
import { generateTopicSlug, getCategoryFromSlug } from '@/lib/topicSlugs';
import { vmTokens } from '@/styles/themeStyles';

type Tab = 'content' | InsightTab;

const PHONE_TABS: { id: Tab; label: string }[] = [
  { id: 'content', label: 'Content' },
  ...INSIGHT_TABS,
];

/**
 * TopicEventsScreen — per-topic view.
 *
 * Treated like a Bible chapter (per the alignment ask): no in-page
 * ScreenHeader / back arrow on desktop or mobile. The topic name lives
 * in the same dropdown-button slot as the chapter name does on the
 * reader, and clicking it opens BookSelector with the Topics tab
 * pre-selected.
 *
 * Desktop:
 *   - This component renders only the Content left pane.
 *   - DesktopLayout reads the topic + active insight tab off the
 *     TopicViewContext and renders the chapter-selector label,
 *     Summary / By-Line / Detailed pill-group, and the right-pane
 *     explanation body so the chrome matches the Bible side exactly.
 *
 * Phone:
 *   - Single column. A CommentaryScreen-style header (topic-name
 *     dropdown + Bible/Insight pills + hamburger) replaces the old
 *     ScreenHeader. Tab pills sit below for Content / Summary /
 *     By-Line / Detailed.
 */
export default function TopicEventsScreen() {
  // Two route shapes hit this screen:
  //   /topics/:topicId                            (legacy, ID-based)
  //   /topic/:categorySlug/:topicSlug             (canonical, SEO-friendly)
  const { topicId, categorySlug, topicSlug } = useParams<{
    topicId?: string;
    categorySlug?: string;
    topicSlug?: string;
  }>();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const isTabletOrDesktop = useMediaQuery('(min-width: 768px)');
  const { setTopic, setDetails, insightTab, setInsightTab, topic, details } = useTopicView();

  const [phoneTab, setPhoneTab] = useState<Tab>('content');
  const [showBookSelector, setShowBookSelector] = useState(false);

  // Resolve topic from whichever route shape and push to context so
  // DesktopLayout's chrome can label the chapter-selector with it.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let resolvedId: string | null = null;
      let resolvedTopic: Topic | null = null;

      if (topicId) {
        resolvedId = topicId;
      } else if (categorySlug && topicSlug) {
        const topics = await fetchTopics();
        if (cancelled) return;
        const backendCategory = getCategoryFromSlug(categorySlug);
        if (backendCategory) {
          resolvedTopic =
            topics.find(
              (t) =>
                t.category === backendCategory &&
                (t.slug === topicSlug || generateTopicSlug(t.name) === topicSlug),
            ) || null;
          resolvedId = resolvedTopic?.id ?? null;
        }
      }

      if (!resolvedId) return;
      if (resolvedTopic) setTopic(resolvedTopic);
      const fetched = await fetchTopicDetails(resolvedId, state.version);
      if (cancelled) return;
      setDetails(fetched);
      if (fetched.topic) setTopic(fetched.topic);
    })();
    return () => {
      cancelled = true;
    };
  }, [topicId, categorySlug, topicSlug, state.version, setTopic, setDetails]);

  // Clear the topic context when the screen leaves so the chrome
  // doesn't briefly show the previous topic's name on a fresh Bible
  // chapter visit.
  useEffect(() => {
    return () => {
      setTopic(null);
      setDetails(null);
    };
  }, [setTopic, setDetails]);

  const sections: TopicSection[] = details?.sections ?? [];

  // "Book Ch:Verse" or "Book Ch" → SET_PASSAGE + navigate to /read.
  const openReference = (ref: string) => {
    const m = ref.match(/^(\d?\s?[A-Za-z]+)\s+(\d+)/);
    if (m) {
      dispatch({ type: 'SET_PASSAGE', book: m[1].trim(), chapter: parseInt(m[2], 10) });
      navigate('/read');
    }
  };

  const isInitialLoading = details === null;

  // ─── Desktop / Tablet — render only the Content pane. DesktopLayout
  //     owns the header chrome and the right-pane explanation render.
  if (isTabletOrDesktop) {
    return (
      <div
        className="flex flex-col h-full overflow-y-auto px-4 pb-8"
        style={{ backgroundColor: vmTokens.commentaryBg, color: vmTokens.textPrimary }}
        data-testid="topic-content-pane"
      >
        <ContentTab
          sections={sections}
          allCount={sections.length}
          onOpenReference={openReference}
          loading={isInitialLoading}
        />
      </div>
    );
  }

  // ─── Phone — full single-column view.

  // When the phone insight tabs change, mirror to the context so that
  // anything else reading insightTab stays in sync. We also let the
  // user toggle the Bible/Insight pill in the mobile header to jump
  // back to the reader.
  const handlePhoneTabChange = (next: Tab) => {
    setPhoneTab(next);
    if (next !== 'content') setInsightTab(next as InsightTab);
  };

  const explanationText =
    insightTab === 'summary'
      ? details?.explanation.summary || ''
      : insightTab === 'byline'
        ? details?.explanation.byline || ''
        : details?.explanation.detailed || '';

  const handleSelectFromPicker = (book: string, chapter: number, bookId?: number) => {
    setShowBookSelector(false);
    dispatch({ type: 'SET_PASSAGE', book, chapter, bookId });
    navigate('/read');
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.chromeBg }}>
      {/* Phone header — mirrors CommentaryScreen pattern.
          Topic name acts as the chapter-selector dropdown; Bible /
          Insight pills sit on the right with Insight active. No
          standalone back arrow (the topic is the page, not a sub-screen). */}
      <header
        className="reading-screen-header shrink-0 safe-top"
        style={{
          backgroundColor: vmTokens.headerBg,
          paddingTop: 'max(env(safe-area-inset-top, 0px), 24px)',
        }}
      >
        <div
          className="flex items-center justify-between px-4"
          style={{ height: 56 }}
        >
          <button
            onClick={() => setShowBookSelector(true)}
            data-testid="topic-selector-button"
            className="flex items-center gap-1.5 min-h-[44px] pr-2 -ml-1"
            style={{ color: vmTokens.headerFg }}
          >
            <span
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '24px',
                color: vmTokens.headerFg,
                maxWidth: 180,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {topic?.name || 'Topic'}
            </span>
            <ChevronDown size={18} style={{ color: vmTokens.headerFg }} strokeWidth={2} />
          </button>

          <div className="flex items-center gap-2">
            <div
              style={{
                display: 'flex',
                backgroundColor: vmTokens.pillBg,
                borderRadius: 100,
                padding: '3px',
              }}
            >
              <button
                aria-label="Bible"
                data-testid="bible-view-icon"
                onClick={() => navigate('/read')}
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: '24px',
                  padding: '2px 12px',
                  borderRadius: 100,
                  backgroundColor: 'transparent',
                  color: vmTokens.headerFg,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Bible
              </button>
              <button
                aria-label="Insight"
                data-testid="commentary-view-icon"
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: '24px',
                  padding: '2px 12px',
                  borderRadius: 100,
                  backgroundColor: vmTokens.gold,
                  color: vmTokens.pageBg,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Insight
              </button>
            </div>
            <button
              onClick={() => navigate('/menu')}
              aria-label="Open menu"
              data-testid="hamburger-menu-button"
              className="flex items-center justify-center w-[44px] h-[44px] -mr-2"
            >
              <Menu size={22} style={{ color: vmTokens.headerFg }} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Topic tab pills */}
      <div
        className="shrink-0"
        style={{
          backgroundColor: vmTokens.headerBg,
          display: 'flex',
          justifyContent: 'center',
          padding: '12px 16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            backgroundColor: vmTokens.pillBg,
            borderRadius: 100,
            padding: '3px',
            gap: 0,
          }}
        >
          {PHONE_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => handlePhoneTabChange(t.id)}
              data-testid={`topic-tab-${t.id}`}
              style={{
                borderRadius: 100,
                padding: '4px 16px',
                fontFamily: 'Roboto, sans-serif',
                fontSize: 14,
                fontWeight: 400,
                lineHeight: '24px',
                whiteSpace: 'nowrap',
                backgroundColor: phoneTab === t.id ? vmTokens.gold : 'transparent',
                color: phoneTab === t.id ? vmTokens.headerBg : vmTokens.headerFg,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 pb-8"
        style={{ backgroundColor: vmTokens.commentaryBg, color: vmTokens.textPrimary }}
      >
        {phoneTab === 'content' ? (
          <ContentTab
            sections={sections}
            allCount={sections.length}
            onOpenReference={openReference}
            loading={isInitialLoading}
          />
        ) : (
          <ExplanationTab
            text={explanationText}
            kind={phoneTab}
            loading={isInitialLoading}
          />
        )}
      </div>

      {showBookSelector && (
        <BookSelector
          initialTab="Topics"
          onClose={() => setShowBookSelector(false)}
          onSelect={handleSelectFromPicker}
        />
      )}
    </div>
  );
}
