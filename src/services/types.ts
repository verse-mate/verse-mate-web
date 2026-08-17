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
  createdAt: string;
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

// ─── Jesus tab ────────────────────────────────────────────────────────────
//
// Mirrors the backend's /jesus/* contract. The hub is rendered from
// `JesusOverview` rather than from hardcoded section names, so a taxonomy
// change on the backend reaches web and mobile without a client release.

/** The nine kinds an entry can take. */
export type JesusKind =
  | 'TEACHING'
  | 'QUESTION'
  | 'COMMAND'
  | 'CLAIM'
  | 'MIRACLE'
  | 'ENCOUNTER'
  | 'COMPASSION'
  | 'CONFRONTATION'
  | 'PARABLE';

/** Top-level groupings on the hub: His Words, His Actions, Parables. */
export type JesusSection = 'words' | 'actions' | 'parables';

/**
 * A scripture reference in both machine and human form. `book_id`/`chapter`
 * drive the deep link into the reader; `display` is what the pill shows.
 */
export interface JesusReference {
  book_id: number;
  book_name: string;
  chapter: number;
  verse_start: number | null;
  verse_end: number | null;
  is_primary: boolean;
  display: string;
}

export interface JesusThemeRef {
  slug: string;
  name: string;
}

/** The card shape every Jesus list endpoint returns. */
export interface JesusEntry {
  slug: string;
  kind: JesusKind | string;
  kind_slug: string;
  kind_label: string;
  section: JesusSection | string | null;
  title: string;
  summary: string | null;
  /** The saying itself, when the entry is a saying. */
  quote: string | null;
  quote_reference: string | null;
  period_slug: string | null;
  period_name: string | null;
  is_translated: boolean;
  references: JesusReference[];
  themes: JesusThemeRef[];
}

export interface JesusKindSummary {
  kind: string;
  slug: string;
  label: string;
  singular: string;
  blurb: string;
  entry_count: number;
}

export interface JesusSectionSummary {
  section: string;
  label: string;
  blurb: string;
  sort_order: number;
  entry_count: number;
  kinds: JesusKindSummary[];
}

export interface JesusPeriodSummary {
  slug: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  sort_order: number;
  entry_count: number;
}

export interface JesusThemeSummary {
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  entry_count: number;
}

export interface JesusCollectionSummary {
  slug: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  is_featured?: boolean;
  sort_order: number;
  entry_count: number;
}

/** Everything the hub screen needs, in one request. */
export interface JesusOverview {
  total_entries: number;
  sections: JesusSectionSummary[];
  periods: JesusPeriodSummary[];
  themes: JesusThemeSummary[];
  collections: JesusCollectionSummary[];
}

export interface JesusPassage {
  reference: string;
  book_id: number;
  book_name: string;
  chapter: number;
  verse_start: number | null;
  verse_end: number | null;
  is_primary: boolean;
  verses: { verse_number: number; text: string }[];
}

export interface JesusEntryDetail {
  entry: JesusEntry & {
    harmony_key: string | null;
    chronology_order: number | null;
  };
  /** Scripture resolved into the reader's Bible version. */
  passages: JesusPassage[];
  explanation: {
    summary: string;
    byline: string;
    detailed: string;
  };
  related: JesusEntry[];
}

export interface JesusLifePeriod extends JesusPeriodSummary {
  entries: JesusEntry[];
}

export interface JesusEntryList {
  entries: JesusEntry[];
  total: number;
  limit: number;
  offset: number;
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
