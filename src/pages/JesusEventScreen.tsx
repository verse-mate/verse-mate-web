import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import BookSelector from '@/components/BookSelector';
import { InsightHeader, PillTabs } from '@/components/InsightChrome';
import {
  JesusEmpty,
  JesusLoading,
  JesusPageBody,
  JesusPill,
  JesusSectionLabel,
} from '@/components/jesus/JesusParts';
import {
  JesusEventCardView,
  JesusPassageBlock,
} from '@/components/jesus/JesusEventParts';
import JesusTabBodies from '@/components/jesus/JesusTabBodies';
import { ScriptureSectionList } from '@/components/scripture/ScriptureBlock';
import { useApp } from '@/contexts/AppContext';
import { useJesusView } from '@/contexts/JesusViewContext';
import { JESUS_TABS, isJesusTab, type JesusTab } from '@/lib/jesusTabs';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useOpenReference } from '@/hooks/useOpenReference';
import { buildJesusLifeUrl, buildJesusThemeUrl, jesusTestId } from '@/lib/jesusSlugs';
import { fetchJesusEvent } from '@/services/jesusService';
import { vmTokens } from '@/styles/themeStyles';

const FONT = 'Roboto, sans-serif';

/**
 * Phone puts the event itself behind a Content pill, the way a topic puts its
 * scripture behind one — on a single column there is no second pane for the
 * commentary to live in, so the views take turns.
 */
type PhoneTab = 'content' | JesusTab;

const PHONE_TABS: { id: PhoneTab; label: string }[] = [
  { id: 'content', label: 'Content' },
  ...JESUS_TABS.map((t) => ({ id: t.id as PhoneTab, label: t.label })),
];

/**
 * JesusEventScreen — the event's scripture column.
 *
 * At ≥768px this renders into the left pane of `DesktopLayout`, which owns the
 * chrome: the event title sits in the chapter-selector slot, the Summary /
 * By-Line / Study / Compare pills sit over the right pane, and the right pane
 * renders the active tab. That is the same arrangement the Bible and topic
 * routes already use — an event behaves like a Bible reference for navigation,
 * so it gets the reference's chrome rather than a second pattern.
 *
 * Below 768px there is no split, so this screen renders the same phone chrome
 * the reader and the topic screen wear — event-name dropdown, Bible / Insight
 * toggle, and a pill group whose first view, Content, is the event itself.
 *
 * Either way the passage is the left-hand content and the commentary is the
 * right-hand content, which is what keeps the Jesus tab feeling like the rest
 * of the app rather than a separate product.
 */
export default function JesusEventScreen() {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const openReference = useOpenReference();
  const inSplit = useMediaQuery('(min-width: 768px)');

  const { detail, setDetail, setTab } = useJesusView();
  const [showBookSelector, setShowBookSelector] = useState(false);

  const tabParam = searchParams.get('tab');
  const urlTab: JesusTab = isJesusTab(tabParam) ? tabParam : 'summary';

  // The query string is the source of truth so a link to an event's Compare tab
  // is shareable; the context mirrors it so DesktopLayout's pills can read it.
  useEffect(() => {
    setTab(urlTab);
  }, [urlTab, setTab]);

  /**
   * `null` means the phone's Content view. The param is written for every real
   * tab — including Summary — because an absent `tab` means Content on phone
   * and Summary on the split, so Summary can't also be "no param".
   */
  const selectTab = (next: JesusTab | null) => {
    const params = new URLSearchParams(searchParams);
    if (next) params.set('tab', next);
    else params.delete('tab');
    setSearchParams(params, { replace: true });
  };

  // Publish the resolved event so the surrounding chrome can render it, and
  // clear it on unmount so a stale title never survives navigation away.
  useEffect(() => {
    if (!eventSlug) return;
    let cancelled = false;
    setDetail(null);

    fetchJesusEvent(eventSlug, state.version).then((data) => {
      if (!cancelled) setDetail(data ?? null);
    });

    return () => {
      cancelled = true;
      setDetail(null);
    };
  }, [eventSlug, state.version, setDetail]);

  const event = detail?.event ?? null;
  const notFound = !!eventSlug && detail === null;

  const passages = useMemo(() => detail?.passages ?? [], [detail]);

  const column = (
    <>
      {!detail ? (
        <JesusLoading />
      ) : !event ? (
        <JesusEmpty label="That event doesn't exist." />
      ) : (
        <>
          {/* On the split layout the title lives in the header's selector slot,
              so repeating it here would duplicate it on screen. */}
          {!inSplit && (
            <h1
              data-testid="jesus-event-title"
              style={{
                fontFamily: FONT,
                fontSize: 24,
                fontWeight: 500,
                lineHeight: '30px',
                color: vmTokens.textPrimary,
                paddingTop: 16,
              }}
            >
              {event.title}
            </h1>
          )}

          {event.period_name && (
            <button
              type="button"
              onClick={() => event.period_slug && navigate(buildJesusLifeUrl(event.period_slug))}
              data-testid="jesus-event-period"
              style={{
                marginTop: inSplit ? 20 : 8,
                padding: 0,
                background: 'none',
                border: 'none',
                cursor: event.period_slug ? 'pointer' : 'default',
                fontFamily: FONT,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
                color: vmTokens.gold,
                display: 'block',
              }}
            >
              {event.period_name}
            </button>
          )}

          {inSplit && (
            <h1
              data-testid="jesus-event-title"
              style={{
                fontFamily: FONT,
                fontSize: 26,
                fontWeight: 500,
                lineHeight: '32px',
                color: vmTokens.textPrimary,
                margin: '6px 0 0',
              }}
            >
              {event.title}
            </h1>
          )}

          {event.summary && (
            <p
              style={{
                marginTop: 8,
                fontFamily: FONT,
                fontSize: 14,
                lineHeight: '21px',
                color: vmTokens.textSecondary,
              }}
            >
              {event.summary}
            </p>
          )}

          {/* The scripture itself — the left column everywhere else in the app,
              set with the same sections/pills/serif the Topics pane uses. */}
          <div style={{ marginTop: 18 }} data-testid="jesus-event-passages">
            <ScriptureSectionList>
              {passages.map((p, i) => (
                <JesusPassageBlock
                  key={p.display}
                  passage={p}
                  onOpen={() => openReference(p)}
                  isLast={i === passages.length - 1}
                />
              ))}
            </ScriptureSectionList>
          </div>

          {event.themes.length > 0 && (
            <>
              <JesusSectionLabel>Themes</JesusSectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} data-testid="jesus-event-themes">
                {event.themes.map((t) => (
                  <JesusPill
                    key={t.slug}
                    label={t.name}
                    onClick={() => navigate(buildJesusThemeUrl(t.slug))}
                    testId={jesusTestId('jesus-event-theme', t.slug)}
                  />
                ))}
              </div>
            </>
          )}

          {detail.related.length > 0 && (
            <>
              <JesusSectionLabel>Related events</JesusSectionLabel>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                data-testid="jesus-event-related"
              >
                {detail.related.map((r) => (
                  <JesusEventCardView key={r.slug} event={r} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </>
  );

  // ── split layout: the left pane only; DesktopLayout renders the rest ──
  if (inSplit) {
    return (
      <div
        data-testid="jesus-event-column"
        className="flex flex-col h-full overflow-y-auto px-4 pb-8"
        style={{ backgroundColor: vmTokens.commentaryBg, color: vmTokens.textPrimary }}
      >
        <div className="pt-4">{column}</div>
      </div>
    );
  }

  // ── phone: the topic screen's chrome — title dropdown, Bible / Insight,
  //    then a pill group whose first view is the event itself ──
  const phoneTab: PhoneTab = isJesusTab(tabParam) ? tabParam : 'content';

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.chromeBg }}>
      <InsightHeader
        title={event?.title || 'Jesus'}
        titleTestId="jesus-selector-button"
        onTitleClick={() => setShowBookSelector(true)}
        onBible={() => navigate('/read')}
      />

      <PillTabs
        tabs={PHONE_TABS}
        active={phoneTab}
        onSelect={(id) => selectTab(id === 'content' ? null : id)}
        testIdPrefix="jesus-event-tab-"
        ariaLabel="Jesus event view"
        containerTestId="jesus-event-tabs"
      />

      {/* JesusPageBody is the scroll container — don't nest it in another. */}
      <JesusPageBody>
        {phoneTab === 'content' ? (
          notFound && !detail ? (
            <JesusEmpty label="That event doesn't exist." />
          ) : (
            column
          )
        ) : !detail ? (
          <JesusLoading />
        ) : (
          <div data-testid={`jesus-event-panel-${phoneTab}`} style={{ paddingTop: 8 }}>
            <JesusTabBodies tab={phoneTab} detail={detail} />
          </div>
        )}
      </JesusPageBody>

      {showBookSelector && (
        <BookSelector
          initialTab="Jesus"
          onClose={() => setShowBookSelector(false)}
          onSelect={(book, chapter, bookId) => {
            setShowBookSelector(false);
            dispatch({ type: 'SET_PASSAGE', book, chapter, bookId });
            navigate('/read');
          }}
        />
      )}
    </div>
  );
}
