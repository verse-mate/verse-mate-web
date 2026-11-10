import type * as Api from '@/api/generated/types.gen';
// VerseMate domain types — aligned to the real API (api.versemate.org)
// plus backward-compat fields so existing UI code keeps working unchanged.

// A Bible version key (e.g. "NASB1995", "LSG", "SCH51"). Versions are now
// served dynamically by the backend (GET /bible/versions), so this is a free
// string rather than a fixed union. Canonical keys live in
// src/constants/bible-versions.ts and the backend's ingest manifest.
export type BibleVersion = string;

/**
 * One token on a Strong's-tagged verse. Joining each token's `text` field
 * reproduces the verse's `text` byte-for-byte — the lossless-join invariant
 * the backend enforces when seeding `verses.tokens`. Tokens with a `strongs`
 * value are tappable content words; tokens without are passthrough
 * (whitespace, punctuation, translator-supplied function words).
 */
export interface VerseToken {
  text: string;
  /** Strong's number in canonical G####/H#### form (4-digit padded). */
  strongs?: string;
  /** Secondary Strong's for compound surface words (e.g. "Jesucristo"). */
  strongs_alt?: string[];
  /** Optional LLM-alignment confidence 0..1 (omitted for published sources). */
  confidence?: number;
}

export interface Verse {
  number: number; // mirrors API verseNumber
  text: string;
  /**
   * Strong's-tagged token array. Present only when the chapter was fetched
   * with `tagged=1` AND the row had tokens seeded in the backend. Consumers
   * that ignore this field keep reading `text` exactly as before — no
   * regression.
   */
  tokens?: VerseToken[];
}

export interface ChapterSubtitle {
  subtitle: string;
  start_verse: number;
  end_verse: number;
}

export interface Chapter {
  book: string; // display name
  bookId: number; // API numeric id
  chapter: number;
  verses: Verse[];
  subtitles?: ChapterSubtitle[];
}

export interface BibleBook {
  bookId: number;
  name: string;
  shortName: string;
  testament: 'OT' | 'NT';
  chapters: number; // count
}

export interface Bookmark {
  id: string;
  favoriteId?: number;
  bookId: number;
  book: string;
  chapter: number;
  verse?: number;
  version: BibleVersion;
}

export interface Note {
  id: string;
  bookId: number;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export type HighlightColor =
  | 'yellow'
  | 'green'
  | 'blue'
  | 'pink'
  | 'purple'
  | 'orange'
  | 'red'
  | 'teal'
  | 'brown';

export interface Highlight {
  id: string;
  highlightId?: number;
  bookId: number;
  book: string;
  chapter: number;
  verse: number; // start_verse (for single-verse UI)
  startVerse?: number;
  endVerse?: number;
  startChar?: number | null;
  endChar?: number | null;
  /** The highlighted words, for a word highlight (sent on create). */
  selectedText?: string;
  color: HighlightColor;
  createdAt: string;
}

export type ExplanationType = 'summary' | 'byline' | 'detailed';

export interface Commentary {
  verse: number; // 0 for chapter-level, specific verse for byline
  summary: string;
  detail: string;
  type?: ExplanationType;
  /**
   * Source explanation row id — surfaced for AudioInlineEntry. Null
   * when the source (legacy fallback path) doesn't carry one.
   */
  explanationId?: number | null;
}

export interface VerseInsight {
  verse: number;
  crossReferences: string[];
  historicalContext: string;
}

export type TopicCategory = 'EVENT' | 'PARABLE' | 'PROPHECY' | 'THEME';

export interface Topic {
  id: string; // UUID
  name: string;
  description: string;
  category?: TopicCategory | string;
  slug?: string;
  icon?: string;
}

export interface TopicEvent {
  id: string;
  topicId: string;
  title: string;
  description: string;
  references: string[];
}

/**
 * One verse inside a topic section. Mirrors verse-mate (old FE)'s
 * ParsedTopicVerse — `verseNumber` is the source-book verse number,
 * `text` is the verse body without the trailing "(Book Ch:Verse)"
 * citation, and `reference` is that citation (may be empty if the
 * source markdown omitted it).
 */
export interface TopicVerse {
  verseNumber: string;
  text: string;
  reference: string;
}

/**
 * One subtitle section of a topic — produced by parsing the markdown
 * the backend returns at GET /topics/:id/references. Mirrors the
 * verse-mate (old FE) parser plus the per-section reference list we
 * surface as clickable pills.
 */
export interface TopicSection {
  id: string;
  topicId: string;
  subtitle: string;
  /** Raw reference list ("(Genesis 11:1-9)" or "Genesis 11:1-9"). */
  referenceList: string;
  /** Same references parsed into individual "Book Ch:Verse" strings. */
  references: string[];
  verses: TopicVerse[];
}

/**
 * GET /topics/:id?bible_version=… response — the topic record itself,
 * its references markdown, and the three AI explanation variants used
 * by the Summary / By-Line / Detailed tabs on TopicEventsScreen.
 */
export interface TopicDetails {
  topic: Topic | null;
  sections: TopicSection[];
  explanation: {
    summary: string;
    byline: string;
    detailed: string;
  };
}

export interface MostQuotedVerse {
  reference: string;
  book: string;
  bookId?: number;
  chapter: number;
  verse: number;
  text: string;
  quoteCount: number;
}

export type JesusEntryList = Api.GetJesusEntriesResponse;
export type JesusEntry = JesusEntryList['entries'][number];
export type JesusKind = JesusEntry['kind'];
export type JesusSection = NonNullable<JesusEntry['section']>;
export type JesusReference = JesusEntry['references'][number];
export type JesusThemeRef = JesusEntry['themes'][number];
export type JesusOverview = Api.GetJesusOverviewResponse;
export type JesusSectionSummary = JesusOverview['sections'][number];
export type JesusKindSummary = JesusSectionSummary['kinds'][number];
export type JesusPeriodSummary = JesusOverview['periods'][number];
export type JesusThemeSummary = Api.GetJesusThemesResponse['themes'][number];
export type JesusCollectionSummary = Api.GetJesusCollectionsResponse['collections'][number];
export type JesusEntryDetail = Api.GetJesusEntriesBySlugResponse;
export type JesusPassage = JesusEntryDetail['passages'][number];
export type JesusLifePeriod = Api.GetJesusLifeResponse['periods'][number];

export type JesusEventList = Api.GetJesusEventsResponse;
export type JesusEventCard = JesusEventList['events'][number];
export type JesusConfidence = JesusEventCard['chronology_confidence'];
export type JesusEventPassage = JesusEventCard['passages'][number];
export type JesusFacet = JesusEventCard['matched_facets'][number];
export type JesusProvenance = JesusFacet['provenance'];
export type JesusEventDetail = Api.GetJesusEventsBySlugResponse;
export type JesusHydratedPassage = JesusEventDetail['passages'][number];
export type JesusReveal = JesusEventDetail['reveals']['says_about_himself'][number];
export type JesusCompare = Api.GetJesusEventsBySlugCompareResponse;
export type JesusCompareAccount = JesusCompare['accounts'][number];
export type JesusEventOverview = Api.GetJesusEventsOverviewResponse;
export type JesusEventSection = JesusEventOverview['sections'][number];
export type JesusFacetTypeSummary = JesusEventSection['types'][number];
export type JesusEventLifePeriod = Api.GetJesusEventsLifeResponse['periods'][number];
export type JesusEventCollection = Api.GetJesusEventsCollectionsBySlugResponse;
export type JesusBrowse = Api.GetJesusEventsBrowseByTypeResponse;
export type JesusBrowseCategory = JesusBrowse['type'];
export type JesusTopicGroup = JesusBrowse['topics'][number];
export type JesusTopicPoint = JesusTopicGroup['points'][number];
