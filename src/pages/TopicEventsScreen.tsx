import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTopicDetails, fetchTopics } from '@/services/bibleService';
import { TopicDetails, Topic, TopicSection, TopicVerse } from '@/services/types';
import { Search, BookOpen } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import ScreenHeader from '@/components/ScreenHeader';
import MarkdownBlock from '@/components/MarkdownBlock';
import { generateTopicSlug, getCategoryFromSlug } from '@/lib/topicSlugs';
import { vmTokens } from '@/styles/themeStyles';

type Tab = 'content' | 'summary' | 'byline' | 'detailed';
type InsightTab = Exclude<Tab, 'content'>;

const TABS: { id: Tab; label: string }[] = [
  { id: 'content', label: 'Content' },
  { id: 'summary', label: 'Summary' },
  { id: 'byline', label: 'By Line' },
  { id: 'detailed', label: 'Detailed' },
];

const INSIGHT_TABS: { id: InsightTab; label: string }[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'byline', label: 'By Line' },
  { id: 'detailed', label: 'Detailed' },
];

// Same split ratio DesktopLayout uses for the Bible side so topics and
// the reader feel like the same product.
const DESKTOP_LEFT_PCT = 65;

/**
 * TopicEventsScreen — per-topic view. Mirrors the Bible CommentaryScreen
 * layout: a row of tabs at the top, then either the topic body (verse
 * sections + clickable reference pills) or one of the AI explanation
 * variants. Reaches the same `GET /topics/:id` endpoint the old FE uses
 * for its split-view, so Summary / By-Line / Detailed map straight to
 * `explanation.{summary,byline,detailed}`.
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
  const [tab, setTab] = useState<Tab>('content');
  const [topic, setTopic] = useState<Topic | null>(null);
  const [details, setDetails] = useState<TopicDetails | null>(null);
  const [query, setQuery] = useState('');

  // Resolve the topic ID from whichever route shape we're on, then
  // fetch the full details (sections + explanations) for that topic in
  // a single round-trip.
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
          const match =
            topics.find(
              (t) =>
                t.category === backendCategory &&
                (t.slug === topicSlug || generateTopicSlug(t.name) === topicSlug),
            ) || null;
          resolvedTopic = match;
          resolvedId = match?.id ?? null;
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
  }, [topicId, categorySlug, topicSlug, state.version]);

  const sections: TopicSection[] = details?.sections ?? [];

  const filteredSections = useMemo(() => {
    if (!query) return sections;
    const q = query.toLowerCase();
    return sections.filter(
      (s) =>
        s.subtitle.toLowerCase().includes(q) ||
        s.verses.some((v) => v.text.toLowerCase().includes(q)) ||
        s.references.some((r) => r.toLowerCase().includes(q)),
    );
  }, [sections, query]);

  // "Book Ch:Verse" or "Book Ch" → SET_PASSAGE + navigate to /read. Drops
  // the verse part (the reader doesn't deep-link to verses today).
  const openReference = (ref: string) => {
    const m = ref.match(/^(\d?\s?[A-Za-z]+)\s+(\d+)/);
    if (m) {
      dispatch({ type: 'SET_PASSAGE', book: m[1].trim(), chapter: parseInt(m[2], 10) });
      navigate('/read');
    }
  };

  const isInitialLoading = details === null;
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // On desktop the LEFT pane always shows Content, so the `tab` state
  // is only used to pick which explanation the RIGHT pane is showing —
  // it should never be 'content' there. Default to summary the first
  // time the user crosses the breakpoint so the right pane has
  // something to display.
  useEffect(() => {
    if (isDesktop && tab === 'content') setTab('summary');
  }, [isDesktop, tab]);

  const insightTab: InsightTab = tab === 'content' ? 'summary' : tab;
  const explanationText =
    insightTab === 'summary'
      ? details?.explanation.summary || ''
      : insightTab === 'byline'
        ? details?.explanation.byline || ''
        : details?.explanation.detailed || '';

  // ─── Desktop split view — mirrors DesktopLayout's left/right split
  //     so topics and the Bible reader feel like the same product.
  if (isDesktop) {
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
        <ScreenHeader title={topic?.name || 'Topic'} onBack={() => navigate('/topics')} />
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT — Content sections */}
          <div
            className="overflow-y-auto px-4 pb-8"
            style={{
              width: `${DESKTOP_LEFT_PCT}%`,
              backgroundColor: vmTokens.commentaryBg,
              color: vmTokens.textPrimary,
            }}
            data-testid="topic-content-pane"
          >
            <ContentTab
              sections={filteredSections}
              allCount={sections.length}
              query={query}
              setQuery={setQuery}
              onOpenReference={openReference}
              loading={isInitialLoading}
            />
          </div>

          {/* Divider — matches DesktopLayout's vertical seam */}
          <div
            style={{
              width: 1,
              backgroundColor: vmTokens.divider,
              flexShrink: 0,
            }}
            aria-hidden="true"
          />

          {/* RIGHT — Insight tabs (Summary / By-Line / Detailed) */}
          <div
            className="flex-1 flex flex-col overflow-hidden"
            data-testid="topic-insight-pane"
          >
            <TabPills
              tabs={INSIGHT_TABS}
              active={insightTab}
              onChange={setTab as (id: InsightTab) => void}
            />
            <div
              className="flex-1 overflow-y-auto px-4 pb-8"
              style={{ backgroundColor: vmTokens.commentaryBg, color: vmTokens.textPrimary }}
            >
              <ExplanationTab
                text={explanationText}
                kind={insightTab}
                loading={isInitialLoading}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Mobile — single column with all four tabs (Content + insights)
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader title={topic?.name || 'Topic'} onBack={() => navigate('/topics')} />

      <TabPills tabs={TABS} active={tab} onChange={setTab} />

      <div
        className="flex-1 overflow-y-auto px-4 pb-8"
        style={{ backgroundColor: vmTokens.commentaryBg, color: vmTokens.textPrimary }}
      >
        {tab === 'content' ? (
          <ContentTab
            sections={filteredSections}
            allCount={sections.length}
            query={query}
            setQuery={setQuery}
            onOpenReference={openReference}
            loading={isInitialLoading}
          />
        ) : (
          <ExplanationTab
            text={explanationText}
            kind={insightTab}
            loading={isInitialLoading}
          />
        )}
      </div>
    </div>
  );
}

function TabPills<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
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
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            data-testid={`topic-tab-${t.id}`}
            style={{
              borderRadius: 100,
              padding: '4px 16px',
              fontFamily: 'Roboto, sans-serif',
              fontSize: 14,
              fontWeight: 400,
              lineHeight: '24px',
              whiteSpace: 'nowrap',
              backgroundColor: active === t.id ? vmTokens.gold : 'transparent',
              color: active === t.id ? vmTokens.headerBg : vmTokens.headerFg,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Subviews ────────────────────────────────────────────────────────────

interface ContentTabProps {
  sections: TopicSection[];
  allCount: number;
  query: string;
  setQuery: (q: string) => void;
  onOpenReference: (ref: string) => void;
  loading: boolean;
}

function ContentTab({
  sections,
  allCount,
  query,
  setQuery,
  onOpenReference,
  loading,
}: ContentTabProps) {
  return (
    <>
      {/* Search */}
      <div className="pt-3 pb-1">
        <div
          className="flex items-center gap-2 h-12 px-4 rounded-full"
          style={{
            backgroundColor: vmTokens.surfaceRaisedBg,
            border: `1px solid ${vmTokens.divider}`,
          }}
        >
          <Search size={18} style={{ color: vmTokens.textTertiary }} strokeWidth={2} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sections, verses, references..."
            data-testid="topic-content-search"
            className="flex-1 bg-transparent text-[15px] focus:outline-none"
            style={{ color: vmTokens.textPrimary }}
          />
        </div>
      </div>

      {/* Sections */}
      <div className="pt-4">
        {loading ? (
          <p className="text-center py-8 text-[14px]" style={{ color: vmTokens.textTertiary }}>
            Loading...
          </p>
        ) : sections.length === 0 ? (
          <p className="text-center py-8 text-[14px]" style={{ color: vmTokens.textTertiary }}>
            {allCount === 0 ? 'No content available for this topic yet.' : `No sections match "${query}"`}
          </p>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => (
              <section
                key={section.id}
                data-testid={`topic-section-${section.id}`}
                className="pb-5 last:border-b-0"
                style={{ borderBottom: `1px solid ${vmTokens.divider}` }}
              >
                <h3
                  className="text-[18px] font-semibold mb-2"
                  style={{ color: vmTokens.textPrimary }}
                >
                  {section.subtitle}
                </h3>

                {section.references.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {section.references.map((ref) => (
                      <button
                        key={ref}
                        onClick={() => onOpenReference(ref)}
                        className="flex items-center gap-1.5 text-[12px] rounded-full px-3 py-1.5 transition-colors"
                        style={{
                          backgroundColor: vmTokens.surfaceRaisedBg,
                          border: `1px solid ${vmTokens.divider}`,
                          color: vmTokens.textPrimary,
                        }}
                      >
                        <BookOpen size={12} strokeWidth={1.75} />
                        {ref}
                      </button>
                    ))}
                  </div>
                )}

                {section.verses.length > 0 ? (
                  <VerseList verses={section.verses} fontSize={20} />
                ) : (
                  <p className="text-[13px]" style={{ color: vmTokens.textTertiary }}>
                    No verses parsed for this section.
                  </p>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function VerseList({ verses, fontSize }: { verses: TopicVerse[]; fontSize: number }) {
  // Inline verse rendering identical in shape to the old FE's TopicText:
  // superscript verse number + verse text + grayed parenthesised reference.
  return (
    <div
      className="leading-relaxed"
      style={{
        fontSize,
        fontFamily: "'Roboto Serif', Georgia, serif",
        fontWeight: 300,
        lineHeight: '1.7',
        color: vmTokens.textPrimary,
      }}
    >
      {verses.map((v, i) => (
        <span key={`${v.verseNumber}-${i}`}>
          <sup
            style={{
              fontSize: '0.7em',
              marginRight: 2,
              verticalAlign: 'super',
              lineHeight: 0,
              color: vmTokens.gold,
              fontWeight: 500,
            }}
          >
            {v.verseNumber}
          </sup>
          {v.text}
          {v.reference && (
            <>
              {' '}
              <span style={{ color: vmTokens.textTertiary, fontSize: '0.85em' }}>
                ({v.reference})
              </span>
            </>
          )}{' '}
        </span>
      ))}
    </div>
  );
}

function ExplanationTab({
  text,
  kind,
  loading,
}: {
  text: string;
  kind: 'summary' | 'byline' | 'detailed';
  loading: boolean;
}) {
  if (loading) {
    return (
      <p className="text-center py-8 text-[14px]" style={{ color: vmTokens.textTertiary }}>
        Loading...
      </p>
    );
  }
  if (!text.trim() || /^no\s+(summary|byline|detailed)\s+explanation\s+available/i.test(text.trim())) {
    return (
      <p
        className="text-center py-10 text-[14px]"
        data-testid={`topic-explanation-${kind}-empty`}
        style={{ color: vmTokens.textTertiary }}
      >
        No {kind} explanation available for this topic yet.
      </p>
    );
  }
  return (
    <div
      className="pt-4"
      data-testid={`topic-explanation-${kind}`}
      style={{ color: vmTokens.textPrimary }}
    >
      <MarkdownBlock text={text} />
    </div>
  );
}
