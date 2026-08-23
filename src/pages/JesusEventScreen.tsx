import { useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ScreenHeader from '@/components/ScreenHeader';
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
import { buildJesusLifeUrl, buildJesusThemeUrl, jesusTestId, JESUS_ROOT } from '@/lib/jesusSlugs';
import { fetchJesusEvent } from '@/services/jesusService';
import { vmTokens } from '@/styles/themeStyles';

const FONT = 'Roboto, sans-serif';

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
 * Below 768px there is no split, so this screen renders its own header and the
 * tab bodies inline.
 *
 * Either way the passage is the left-hand content and the commentary is the
 * right-hand content, which is what keeps the Jesus tab feeling like the rest
 * of the app rather than a separate product.
 */
export default function JesusEventScreen() {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const openReference = useOpenReference();
  const inSplit = useMediaQuery('(min-width: 768px)');

  const { detail, setDetail, tab, setTab } = useJesusView();

  const tabParam = searchParams.get('tab');
  const urlTab: JesusTab = isJesusTab(tabParam) ? tabParam : 'summary';

  // The query string is the source of truth so a link to an event's Compare tab
  // is shareable; the context mirrors it so DesktopLayout's pills can read it.
  useEffect(() => {
    setTab(urlTab);
  }, [urlTab, setTab]);

  const selectTab = (next: JesusTab) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'summary') params.delete('tab');
    else params.set('tab', next);
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

  // ── phone: header, passage, then the tabs inline ──
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader
        title="Jesus"
        onBack={() => navigate(JESUS_ROOT)}
        backTestId="jesus-event-back-button"
        titleTestId="jesus-event-header-title"
      />
      <JesusPageBody>
        {notFound && !detail ? <JesusEmpty label="That event doesn't exist." /> : column}

        {detail && event && (
          <>
            <div
              data-testid="jesus-event-tabs"
              style={{
                display: 'flex',
                gap: 2,
                marginTop: 24,
                marginBottom: 4,
                overflowX: 'auto',
                borderBottom: `1px solid ${vmTokens.divider}`,
                scrollbarWidth: 'none',
              }}
            >
              {JESUS_TABS.map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => selectTab(t.id)}
                    data-testid={`jesus-event-tab-${t.id}`}
                    aria-pressed={active}
                    style={{
                      padding: '10px 14px',
                      whiteSpace: 'nowrap',
                      background: 'none',
                      border: 'none',
                      borderBottom: `2px solid ${active ? vmTokens.gold : 'transparent'}`,
                      cursor: 'pointer',
                      fontFamily: FONT,
                      fontSize: 14,
                      fontWeight: active ? 600 : 400,
                      color: active ? vmTokens.textPrimary : vmTokens.textSecondary,
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            <div data-testid={`jesus-event-panel-${tab}`} style={{ paddingTop: 8 }}>
              <JesusTabBodies tab={tab} detail={detail} />
            </div>
          </>
        )}
      </JesusPageBody>
    </div>
  );
}
