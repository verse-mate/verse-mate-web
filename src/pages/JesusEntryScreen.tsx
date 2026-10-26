import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BookSelector from '@/components/BookSelector';
import { InsightHeader, PillTabs } from '@/components/InsightChrome';
import {
  JesusEmpty,
  JesusEntryCard,
  JesusLoading,
  JesusPageBody,
  JesusPill,
  JesusSectionLabel,
} from '@/components/jesus/JesusParts';
import PassageScripture from '@/components/scripture/PassageScripture';
import {
  ReferencePill,
  ReferencePillRow,
  ScriptureSection,
  ScripturePlaceholder,
} from '@/components/scripture/ScriptureBlock';
import {
  ExplanationTab,
  INSIGHT_TABS,
  type InsightTab,
} from '@/components/topic/TopicViewParts';
import { useApp } from '@/contexts/AppContext';
import { useJesusView } from '@/contexts/JesusViewContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useOpenReference } from '@/hooks/useOpenReference';
import { jesusEyebrowStyle } from '@/lib/jesusRows';
import {
  buildJesusLifeUrl,
  buildJesusThemeUrl,
  jesusTestId,
  JESUS_ROOT,
} from '@/lib/jesusSlugs';
import { limitRelated } from '@/lib/jesusRelated';
import { fetchJesusEntry } from '@/services/jesusService';
import type { JesusEntryDetail, JesusPassage } from '@/services/types';
import { vmTokens } from '@/styles/themeStyles';

const FONT = 'Roboto, sans-serif';

/** Phone tabs: the entry itself, then the topic screen's three insight views. */
type PhoneTab = 'content' | InsightTab;
const PHONE_TABS: { id: PhoneTab; label: string }[] = [
  { id: 'content', label: 'Content' },
  ...INSIGHT_TABS,
];

/**
 * JesusEntryScreen — one entry in full (the legacy entry model, still reached
 * from the book selector's Jesus search).
 *
 * An entry reads like a topic: the saying or event and its scripture are the
 * content, and its Summary / By Line / Detailed insight is commentary on it. So
 * it uses the topic's chrome rather than a page of its own:
 *
 *   - Split layout (≥768px): the entry is the left pane; the title sits in the
 *     header's selector slot, the insight tabs in the header's pill group and
 *     the insight in the right pane — DesktopLayout reads all of that from
 *     `JesusViewContext`, the same way it does for an event.
 *   - Phone: the reader's header (title dropdown, Bible / Insight) over a tab
 *     row of Content / Summary / By Line / Detailed, as on a topic.
 *
 * Related entries close the content — parallel gospel accounts first, then
 * entries sharing themes.
 */
export default function JesusEntryScreen() {
  const { entrySlug } = useParams<{ entrySlug: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const openReference = useOpenReference();
  const inSplit = useMediaQuery('(min-width: 768px)');
  const { setEntry, entryTab, setEntryTab } = useJesusView();

  const [detail, setDetail] = useState<JesusEntryDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [phoneTab, setPhoneTab] = useState<PhoneTab>('content');
  const [showBookSelector, setShowBookSelector] = useState(false);

  useEffect(() => {
    if (!entrySlug) {
      setNotFound(true);
      return;
    }
    let cancelled = false;
    setDetail(null);
    setNotFound(false);
    setEntryTab('summary');

    fetchJesusEntry(entrySlug, state.version).then((data) => {
      if (cancelled) return;
      if (!data) {
        setNotFound(true);
        return;
      }
      setDetail(data);
    });

    return () => {
      cancelled = true;
    };
  }, [entrySlug, state.version, setEntryTab]);

  // Publish the entry so the split-view chrome can render it, and clear it on
  // the way out so a stale title never survives navigation away.
  useEffect(() => {
    setEntry(detail ? { title: detail.entry.title, explanation: detail.explanation } : null);
  }, [detail, setEntry]);
  useEffect(() => () => setEntry(null), [setEntry]);

  const entry = detail?.entry;

  const content = notFound ? (
    <div style={{ paddingTop: 32 }}>
      <JesusEmpty label="We couldn't find that entry." />
      <button
        type="button"
        onClick={() => navigate(JESUS_ROOT)}
        style={{
          display: 'block',
          margin: '0 auto',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: FONT,
          fontSize: 13,
          fontWeight: 500,
          color: vmTokens.gold,
        }}
      >
        Back to Jesus
      </button>
    </div>
  ) : !detail || !entry ? (
    <JesusLoading />
  ) : (
    <>
      <p data-testid="jesus-entry-kind" style={jesusEyebrowStyle}>
        {entry.kind_label}
      </p>

      <h1
        data-testid="jesus-entry-title"
        style={{
          fontFamily: FONT,
          fontSize: 28,
          fontWeight: 500,
          lineHeight: '36px',
          color: vmTokens.textPrimary,
          margin: '6px 0 0',
        }}
      >
        {entry.title}
      </h1>

      {entry.period_name && (
        <button
          type="button"
          onClick={() => entry.period_slug && navigate(buildJesusLifeUrl(entry.period_slug))}
          data-testid="jesus-entry-period"
          style={{
            marginTop: 2,
            // Small text, full-size tap target.
            padding: '2px 0',
            minHeight: 24,
            background: 'none',
            border: 'none',
            cursor: entry.period_slug ? 'pointer' : 'default',
            fontFamily: FONT,
            fontSize: 13,
            lineHeight: '20px',
            color: vmTokens.gold,
          }}
        >
          {entry.period_name}
        </button>
      )}

      {entry.quote && (
        <blockquote
          data-testid="jesus-entry-quote"
          style={{
            margin: '16px 0 0',
            padding: '4px 0 4px 16px',
            borderLeft: `3px solid ${vmTokens.gold}`,
            fontFamily: "'Roboto Serif', Georgia, serif",
            fontSize: 17,
            lineHeight: '27px',
            fontStyle: 'italic',
            fontWeight: 300,
            color: vmTokens.textPrimary,
          }}
        >
          “{entry.quote}”
          {entry.quote_reference && (
            <cite
              style={{
                display: 'block',
                marginTop: 6,
                fontFamily: FONT,
                fontSize: 13,
                fontStyle: 'normal',
                color: vmTokens.textSecondary,
              }}
            >
              — {entry.quote_reference}
            </cite>
          )}
        </blockquote>
      )}

      {entry.summary && (
        <p
          data-testid="jesus-entry-summary"
          style={{
            marginTop: 12,
            fontFamily: FONT,
            fontSize: 14,
            lineHeight: '21px',
            color: vmTokens.textSecondary,
          }}
        >
          {entry.summary}
        </p>
      )}

      {entry.themes.length > 0 && (
        <div
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}
          data-testid="jesus-entry-themes"
        >
          {entry.themes.map((theme) => (
            <JesusPill
              key={theme.slug}
              label={theme.name}
              onClick={() => navigate(buildJesusThemeUrl(theme.slug))}
              testId={jesusTestId('jesus-entry-theme', theme.slug)}
            />
          ))}
        </div>
      )}

      {/* Scripture */}
      <JesusSectionLabel>
        {entry.references.length > 1 ? 'In the gospels' : 'Scripture'}
      </JesusSectionLabel>

      {detail.passages.length > 0 ? (
        <div className="space-y-6" data-testid="jesus-entry-passages">
          {detail.passages.map((passage, i) => (
            <PassageBlock
              key={passage.reference}
              passage={passage}
              isLast={i === detail.passages.length - 1}
              onOpen={() =>
                openReference({
                  book_id: passage.book_id,
                  book_name: passage.book_name,
                  chapter: passage.chapter,
                })
              }
            />
          ))}
        </div>
      ) : (
        // No verse text (version not loaded / offline) — the references
        // themselves still work as links into the reader.
        <div data-testid="jesus-entry-references-fallback">
          <ReferencePillRow>
            {entry.references.map((ref) => (
              <ReferencePill
                key={ref.display}
                label={ref.display}
                onClick={() => openReference(ref)}
                testId={jesusTestId('jesus-reference-link', ref.display)}
              />
            ))}
          </ReferencePillRow>
        </div>
      )}

      {/* Read next */}
      {limitRelated(detail.related).length > 0 && (
        <>
          <JesusSectionLabel>Read next</JesusSectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column' }} data-testid="jesus-entry-related">
            {limitRelated(detail.related).map((related) => (
              <JesusEntryCard key={related.slug} entry={related} onOpenReference={openReference} />
            ))}
          </div>
        </>
      )}
    </>
  );

  // ── split layout: the entry is the left pane; DesktopLayout renders the
  //    title, the insight tabs and the insight itself ──
  if (inSplit) {
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
        <JesusPageBody wide>{content}</JesusPageBody>
      </div>
    );
  }

  // ── phone: the topic screen's chrome ──
  const insightText = detail ? detail.explanation[phoneTab === 'content' ? entryTab : phoneTab] : '';

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.chromeBg }}>
      <InsightHeader
        title={entry?.title || 'Jesus'}
        titleTestId="jesus-entry-selector-button"
        onTitleClick={() => setShowBookSelector(true)}
        onBible={() => navigate('/read')}
      />

      <PillTabs
        tabs={PHONE_TABS}
        active={phoneTab}
        onSelect={(id) => {
          setPhoneTab(id);
          if (id !== 'content') setEntryTab(id);
        }}
        testIdPrefix="jesus-insight-tab-"
        ariaLabel="Jesus entry view"
        containerTestId="jesus-insight-tabs"
      />

      <JesusPageBody>
        {phoneTab === 'content' ? (
          content
        ) : !detail ? (
          <JesusLoading />
        ) : (
          <div data-testid="jesus-insight-body" style={{ color: vmTokens.textPrimary }}>
            {insightText.trim() ? (
              <ExplanationTab text={insightText} kind={phoneTab} loading={false} />
            ) : (
              <JesusEmpty
                label={`No ${INSIGHT_TABS.find((t) => t.id === phoneTab)?.label.toLowerCase()} insight for this entry yet.`}
              />
            )}
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

/**
 * One passage, set the way the Topics section sets scripture — reference pill
 * over serif verse text, ruled off rather than boxed. The verses carry the
 * reader's interactions: tap a verse for its Verse Insight card, right-click or
 * press and hold a word for its definition.
 */
function PassageBlock({
  passage,
  onOpen,
  isLast = false,
}: {
  passage: JesusPassage;
  onOpen: () => void;
  isLast?: boolean;
}) {
  return (
    <ScriptureSection testId={jesusTestId('jesus-passage', passage.reference)} isLast={isLast}>
      <ReferencePillRow>
        <ReferencePill
          label={passage.reference}
          onClick={onOpen}
          testId={jesusTestId('jesus-passage-reference', passage.reference)}
        />
      </ReferencePillRow>

      {passage.verses.length > 0 ? (
        <PassageScripture
          bookId={passage.book_id}
          bookName={passage.book_name}
          chapter={passage.chapter}
          verses={passage.verses.map((verse) => ({
            number: verse.verse_number,
            text: verse.text,
          }))}
        />
      ) : (
        <ScripturePlaceholder>Open in the reader to view this passage.</ScripturePlaceholder>
      )}
    </ScriptureSection>
  );
}
