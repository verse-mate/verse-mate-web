import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import MarkdownBlock from '@/components/MarkdownBlock';
import ScreenHeader from '@/components/ScreenHeader';
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
import { useApp } from '@/contexts/AppContext';
import { useOpenReference } from '@/hooks/useOpenReference';
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

type InsightTab = 'summary' | 'byline' | 'detailed';

/**
 * Insight tabs, matching the topic screen's vocabulary exactly so the two
 * study surfaces read the same.
 */
const INSIGHT_TABS: { id: InsightTab; label: string }[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'byline', label: 'By Line' },
  { id: 'detailed', label: 'Detailed' },
];

/**
 * JesusEntryScreen — one entry in full.
 *
 * Three layers, in the order a reader wants them: the saying or event itself,
 * then the actual scripture (fetched in the reader's own Bible version so the
 * words match the rest of the app), then the AI insight. Related entries close
 * the page — parallel gospel accounts first, then entries sharing themes.
 */
export default function JesusEntryScreen() {
  const { entrySlug } = useParams<{ entrySlug: string }>();
  const navigate = useNavigate();
  const { state } = useApp();
  const openReference = useOpenReference();

  const [detail, setDetail] = useState<JesusEntryDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<InsightTab>('summary');

  useEffect(() => {
    if (!entrySlug) {
      setNotFound(true);
      return;
    }
    let cancelled = false;
    setDetail(null);
    setNotFound(false);

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
  }, [entrySlug, state.version]);

  const entry = detail?.entry;
  const insight = detail ? detail.explanation[tab] : '';
  const hasInsight = !!insight.trim();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader
        title={entry?.kind_label ?? 'Jesus'}
        onBack={() => navigate(-1)}
        backTestId="jesus-entry-back-button"
        titleTestId="jesus-entry-kind"
      />

      <JesusPageBody>
        {notFound ? (
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
                fontSize: 14,
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
            <h1
              data-testid="jesus-entry-title"
              style={{
                fontFamily: FONT,
                fontSize: 24,
                fontWeight: 500,
                lineHeight: '30px',
                color: vmTokens.textPrimary,
                paddingTop: 16,
              }}
            >
              {entry.title}
            </h1>

            {entry.period_name && (
              <button
                type="button"
                onClick={() =>
                  entry.period_slug && navigate(buildJesusLifeUrl(entry.period_slug))
                }
                data-testid="jesus-entry-period"
                style={{
                  marginTop: 6,
                  padding: 0,
                  background: 'none',
                  border: 'none',
                  cursor: entry.period_slug ? 'pointer' : 'default',
                  fontFamily: FONT,
                  fontSize: 13,
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
                  padding: '4px 0 4px 14px',
                  borderLeft: `3px solid ${vmTokens.gold}`,
                  fontFamily: FONT,
                  fontSize: 18,
                  lineHeight: '27px',
                  fontStyle: 'italic',
                  color: vmTokens.textPrimary,
                }}
              >
                “{entry.quote}”
                {entry.quote_reference && (
                  <cite
                    style={{
                      display: 'block',
                      marginTop: 6,
                      fontSize: 13,
                      fontStyle: 'normal',
                      color: vmTokens.textTertiary,
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
                  marginTop: 16,
                  fontFamily: FONT,
                  fontSize: 16,
                  lineHeight: '24px',
                  color: vmTokens.textSecondary,
                }}
              >
                {entry.summary}
              </p>
            )}

            {entry.themes.length > 0 && (
              <div
                style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}
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
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                data-testid="jesus-entry-references-fallback"
              >
                {entry.references.map((ref) => (
                  <button
                    key={ref.display}
                    type="button"
                    onClick={() => openReference(ref)}
                    data-testid={jesusTestId('jesus-reference-link', ref.display)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: 12,
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: 12,
                      backgroundColor: vmTokens.surfaceRaisedBg,
                      border: `1px solid ${vmTokens.divider}`,
                      fontFamily: FONT,
                      fontSize: 15,
                      color: vmTokens.textPrimary,
                    }}
                  >
                    <BookOpen size={15} strokeWidth={1.75} style={{ color: vmTokens.gold }} />
                    {ref.display}
                  </button>
                ))}
              </div>
            )}

            {/* Insight */}
            <JesusSectionLabel>Insight</JesusSectionLabel>
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: vmTokens.pillBg,
                borderRadius: 999,
                padding: 3,
                marginBottom: 12,
              }}
              data-testid="jesus-insight-tabs"
            >
              {INSIGHT_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  data-testid={`jesus-insight-tab-${t.id}`}
                  aria-pressed={tab === t.id}
                  style={{
                    padding: '4px 14px',
                    borderRadius: 999,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: FONT,
                    fontSize: 14,
                    lineHeight: '22px',
                    backgroundColor: tab === t.id ? vmTokens.gold : 'transparent',
                    color: tab === t.id ? vmTokens.headerBg : vmTokens.headerFg,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div
              data-testid="jesus-insight-body"
              style={{
                fontFamily: FONT,
                fontSize: 15,
                lineHeight: '24px',
                color: vmTokens.textPrimary,
              }}
            >
              {hasInsight ? (
                <MarkdownBlock text={insight} />
              ) : (
                <p style={{ color: vmTokens.textTertiary, fontStyle: 'italic' }}>
                  No {INSIGHT_TABS.find((t) => t.id === tab)?.label.toLowerCase()}{' '}
                  insight for this entry yet.
                </p>
              )}
            </div>

            {/* Read next */}
            {limitRelated(detail.related).length > 0 && (
              <>
                <JesusSectionLabel>Read next</JesusSectionLabel>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                  data-testid="jesus-entry-related"
                >
                  {limitRelated(detail.related).map((related) => (
                    <JesusEntryCard
                      key={related.slug}
                      entry={related}
                      onOpenReference={openReference}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </JesusPageBody>
    </div>
  );
}

/**
 * One passage, set the way the Topics section sets scripture — reference pill
 * over serif verse text, ruled off rather than boxed. The verses carry the
 * reader's interactions: tap a verse for its Verse Insight card, tap a word
 * for its definition.
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
