import { useState, useEffect } from 'react';
import { BookOpen, Copy, Check } from 'lucide-react';
import MarkdownBlock from '@/components/MarkdownBlock';
import ShareIcon from '@/components/ShareIcon';
import { useApp } from '@/contexts/AppContext';
import { type InductiveStudy } from '@versemate/studies';
import { fetchStudy } from '@/services/bibleService';
import { usePreferredLanguage } from '@/hooks/usePreferredLanguage';
import { useStudyLabels } from '@/hooks/useStudyLabels';
import { vmTokens } from '@/styles/themeStyles';
import { buildStudyCopyText } from '@/lib/studyCopy';
import { StepCard } from '@/components/study/StudySteps';
import { Card, SectionHeading } from '@/components/study/StudyPrimitives';
import { ApplicationCard, MovementCard } from '@/components/study/StudySections';
import {
  cardHeadingTitleStyle,
  renderInlineItalic,
  sectionIntroStyle,
  titleStyle,
} from '@/components/study/studyStyles';

interface Props {
  book: string;
  bookId: number | null;
  chapter: number;
}

/**
 * StudyPanel — renders the Precept inductive Bible study for a given chapter.
 * Header matches the Line-by-Line tab (just title + Expand All / Collapse
 * All, no subtitle banner). Each top-level step is a collapsible card; some
 * step kinds (qa, segments) nest collapsibles for each sub-item.
 */
export default function StudyPanel({ book, bookId, chapter }: Props) {
  const { state } = useApp();
  // Study content is now DB-backed (fetchStudy): the backend serves the
  // translation for the current content language when one exists and falls
  // back to English; fetchStudy additionally falls back to the bundled
  // @versemate/studies content on any API failure. Keyed on language so a
  // picker change refetches. Local state holds the resolved study; a `loading`
  // flag covers the first paint on a chapter we haven't seen yet.
  const language = usePreferredLanguage();
  // Fixed Precept-method UI chrome, localized per language. DB-backed
  // (useStudyLabels) so a new language's chrome ships without an app release,
  // with the bundled @versemate/studies map as offline/English fallback.
  const labels = useStudyLabels(language);
  const [study, setStudy] = useState<InductiveStudy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    if (!bookId) {
      setStudy(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchStudy(bookId, chapter, language).then((s) => {
      if (cancelled) return;
      setStudy(s);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [bookId, chapter, language]);
  // Body text matches the user's reading font size so Study reads at the same
  // weight as the Bible side and the Summary / By Line / Detailed tabs.
  // Sub-elements (pills, tags, captions, definitions) keep their own fixed
  // sizes — the user explicitly OK'd that as long as the main body matches.
  const bodyFontSize = state.settings.fontSize;
  const bodyLineHeight = Math.round(bodyFontSize * 1.55);

  // Bulk state drives the default for every section. Per-card overrides win
  // when the user toggles individually after a bulk action. Default is
  // collapsed so the user lands on a scannable outline of all 9 steps +
  // interpretation + application — and opens what they want to read.
  //
  // Both bulk + overrides are persisted to sessionStorage scoped by
  // `bookId:chapter` so rotation (portrait↔landscape crosses the AppLayout
  // breakpoint and unmounts StudyPanel) doesn't reset everything to
  // collapsed. Switching chapters resets to the default since the keys are
  // chapter-scoped.
  const storageKey = `versemate-study-state:${bookId ?? 'none'}:${chapter}`;
  const [bulkState, setBulkState] = useState<'expanded' | 'collapsed' | null>(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.bulkState === 'expanded' || parsed?.bulkState === 'collapsed' || parsed?.bulkState === null) {
          return parsed.bulkState;
        }
      }
    } catch { /* ignore */ }
    return 'collapsed';
  });
  const [overrides, setOverrides] = useState<Record<string, boolean>>(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.overrides && typeof parsed.overrides === 'object') {
          return parsed.overrides as Record<string, boolean>;
        }
      }
    } catch { /* ignore */ }
    return {};
  });
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ bulkState, overrides }));
    } catch { /* ignore */ }
  }, [storageKey, bulkState, overrides]);
  const [copied, setCopied] = useState(false);

  const isOpen = (id: string): boolean => {
    if (id in overrides) return overrides[id];
    return bulkState !== 'collapsed';
  };
  const toggle = (id: string) => {
    setOverrides(prev => ({ ...prev, [id]: !isOpen(id) }));
  };

  // Loading state — the chapter chunk is being fetched. First visit to a
  // chapter is typically <50ms once the bundle CDN edge is warm. Show a
  // bare placeholder so we don't flash the unavailable state.
  if (loading) {
    return (
      <div>
        <h2 style={titleStyle}>{labels.inductiveStudyOf} {book} {chapter}</h2>
        <div style={{ marginTop: 24, padding: 24, textAlign: 'center', color: vmTokens.textSecondary, fontSize: 14 }}>
          Loading…
        </div>
      </div>
    );
  }

  // Not a roadmap state. Every chapter of the Bible has a study — all 1,189
  // ship in @versemate/studies and fetchStudy falls back to them when the API
  // misses — so reaching here means this particular chapter failed to load,
  // not that its study hasn't been written. Say that, and give the reader the
  // one action that actually helps.
  if (!study) {
    return (
      <div>
        <h2 style={titleStyle}>{labels.inductiveStudyOf} {book} {chapter}</h2>
        <div data-testid="study-unavailable" style={{ marginTop: 24, padding: 24, borderRadius: 12, backgroundColor: vmTokens.surfaceRaisedBg, border: `1px solid ${vmTokens.surfaceRaisedBorder}`, textAlign: 'center' }}>
          <BookOpen size={28} color={vmTokens.gold} style={{ margin: '0 auto 12px' }} strokeWidth={1.5} />
          <p style={{ color: vmTokens.textPrimary, fontSize: 16, fontWeight: 500, marginBottom: 6 }}>Inductive Study didn't load</p>
          <p style={{ color: vmTokens.textSecondary, fontSize: 14, lineHeight: '22px' }}>
            Every chapter has a 9-step Precept inductive study — this one just didn't come through. Reopen the chapter to try again.
          </p>
        </div>
      </div>
    );
  }

  // Build the full id list for bulk Expand-All / Collapse-All. We include
  // sub-ids only for kinds that actually have nested toggles (qa items).
  // Segments render as static cards now, so they don't need ids.
  const allIds: string[] = [];
  allIds.push('observation-intro');
  for (const s of study.steps) {
    allIds.push(`step-${s.number}`);
    if (s.kind === 'qa') s.items.forEach((_, i) => allIds.push(`step-${s.number}-qa-${i}`));
    if (s.kind === 'lists') s.lists.forEach((_, i) => allIds.push(`step-${s.number}-list-${i}`));
  }
  allIds.push('interpretation-intro');
  study.interpretation.movements.forEach((m, i) => {
    allIds.push(`mv-${m.number ?? i}`);
  });
  allIds.push('application');

  const allOpen = allIds.every(id => isOpen(id));

  const setAll = (open: boolean) => {
    setBulkState(open ? 'expanded' : 'collapsed');
    setOverrides({});
  };

  return (
    // Wrap the entire panel in the user's body font size so every section's
    // inherited body text matches the Bible side and the other commentary
    // tabs. Pills, tags, and small captions override locally with fixed sizes;
    // everything else (markdown bodies, prose paragraphs, list items) inherits.
    <div style={{ fontSize: bodyFontSize, lineHeight: `${bodyLineHeight}px` }}>
      {/* Title row — matches Line-by-Line: just the H2 + share. No subtitle / theme banner. */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <h2 style={titleStyle}>{labels.inductiveStudyOf} {study.title}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button
            onClick={async () => {
              const text = buildStudyCopyText(study);
              try {
                if (navigator.clipboard?.writeText) {
                  await navigator.clipboard.writeText(text);
                } else {
                  const ta = document.createElement('textarea');
                  ta.value = text;
                  ta.style.position = 'fixed';
                  ta.style.opacity = '0';
                  document.body.appendChild(ta);
                  ta.select();
                  document.execCommand('copy');
                  document.body.removeChild(ta);
                }
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch { /* ignore */ }
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
            aria-label="Copy study"
            title="Copy study"
          >
            {copied
              ? <Check size={18} color={vmTokens.gold} strokeWidth={2} />
              : <Copy size={18} color={vmTokens.textPrimary} strokeWidth={1.5} />}
          </button>
          <button
            onClick={() => {
              const text = buildStudyCopyText(study);
              navigator.share?.({
                title: `Inductive Study of ${study.title}`,
                text,
                url: window.location.href,
              }).catch(() => {});
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
            aria-label="Share study"
          >
            <ShareIcon size={18} color={vmTokens.textPrimary} />
          </button>
        </div>
      </div>

      {/* Expand All / Collapse All */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          onClick={() => setAll(!allOpen)}
          style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: vmTokens.gold, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {allOpen ? labels.collapseAll : labels.expandAll}
        </button>
      </div>

      <SectionHeading label={labels.observationSection} />
      <Card
        open={isOpen('observation-intro')}
        onToggle={() => toggle('observation-intro')}
        heading={<span style={cardHeadingTitleStyle}>{labels.aboutObservationTitle}</span>}
      >
        <p style={sectionIntroStyle}>
          {renderInlineItalic(labels.aboutObservationBody)}
        </p>
      </Card>
      {study.steps.map(step => (
        <StepCard
          key={step.number}
          step={step}
          isOpen={isOpen}
          toggle={toggle}
        />
      ))}

      <SectionHeading label={labels.interpretationSection} />
      {study.interpretation.intro && (
        <Card
          open={isOpen('interpretation-intro')}
          onToggle={() => toggle('interpretation-intro')}
          heading={<span style={cardHeadingTitleStyle}>{labels.aboutInterpretationTitle}</span>}
        >
          <p style={sectionIntroStyle}>
            {renderInlineItalic(study.interpretation.intro)}
          </p>
        </Card>
      )}
      {study.interpretation.movements.map((mv, mvIdx) => (
        <MovementCard
          key={mv.number ?? mvIdx}
          movement={mv}
          bookName={study.bookName}
          label={labels.movement}
          open={isOpen(`mv-${mv.number ?? mvIdx}`)}
          onToggle={() => toggle(`mv-${mv.number ?? mvIdx}`)}
        />
      ))}

      <SectionHeading label={labels.applicationSection} />
      <ApplicationCard
        intro={study.application.intro}
        questions={study.application.questions}
        labels={labels}
        open={isOpen('application')}
        onToggle={() => toggle('application')}
      />
    </div>
  );
}
