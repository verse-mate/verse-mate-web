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

// ─── Jesus event graph ────────────────────────────────────────────────────
//
// Supersedes the entry types above. An event is the Gospel pericope; facets are
// the typed things Jesus said and did within it. Categories are views over
// facets, which is why a card carries `matched_facets` — browsing Questions
// shows the storm event labelled with the question inside it.

/** How much weight a claim carries. See specs/jesus-event-graph.md §5. */
export type JesusProvenance = 1 | 2 | 3;

/** Hedging on a reconstruction. `high` needs no caveat in the UI. */
export type JesusConfidence = 'high' | 'probable' | 'disputed';

export interface JesusEventPassage {
  book_id: number;
  book_name: string;
  chapter: number;
  verse_start: number | null;
  verse_end: number | null;
  is_primary: boolean;
  display: string;
  /** Present once the passage has been hydrated with scripture. */
  verses?: { verse_number: number; text: string }[];
  emphasis?: string | null;
  unique_to_account?: string | null;
}

export interface JesusFacet {
  slug: string;
  mode: 'WORD' | 'ACTION';
  type: string;
  type_slug: string;
  type_label: string;
  /** Set on WORD facets — who spoke. */
  speaker: string | null;
  /** Set on ACTION facets — who acted. */
  actor: string | null;
  title: string;
  text: string | null;
  summary: string | null;
  provenance: number;
  reference: string | null;
  book_id: number | null;
  chapter: number | null;
  verse_start: number | null;
  verse_end: number | null;
}

export interface JesusEventCard {
  slug: string;
  title: string;
  summary: string | null;
  period_slug: string | null;
  period_name: string | null;
  sequence: number | null;
  chronology_confidence: JesusConfidence;
  parallel_confidence: JesusConfidence;
  gospels: string[];
  passages: JesusEventPassage[];
  facet_counts: {
    words: number;
    actions: number;
    by_type: Record<string, number>;
  };
  matched_facets: JesusFacet[];
  themes: JesusThemeRef[];
}

export interface JesusReveal {
  content: string;
  source_ref: string | null;
  provenance: number;
}

export interface JesusEventDetail {
  event: JesusEventCard & {
    location: string | null;
    approximate_date: string | null;
    people: { person: string; role: string | null }[];
  };
  words: JesusFacet[];
  actions: JesusFacet[];
  passages: JesusEventPassage[];
  /** Kept apart so the narrator's voice is never merged into Jesus'. */
  reveals: {
    says_about_himself: JesusReveal[];
    demonstrates: JesusReveal[];
    others_say: JesusReveal[];
    narrator_says: JesusReveal[];
  };
  reactions: { who: string; what: string; source_ref: string | null; provenance: number }[];
  explanation: Record<string, string>;
  related: JesusEventCard[];
}

export interface JesusCompareAccount {
  book_id: number;
  gospel: string;
  records_it: boolean;
  passages: JesusEventPassage[];
}

export interface JesusCompare {
  event: JesusEventCard;
  accounts: JesusCompareAccount[];
  shared_by: string[];
  note: string;
  note_provenance: number | null;
  parallel_confidence: JesusConfidence;
}

export interface JesusFacetTypeSummary {
  type: string;
  mode: 'WORD' | 'ACTION';
  slug: string;
  label: string;
  singular: string;
  blurb: string;
  facet_count: number;
}

export interface JesusEventSection {
  section: string;
  label: string;
  blurb: string;
  sort_order: number;
  facet_count: number;
  types: JesusFacetTypeSummary[];
}

export interface JesusEventOverview {
  total_events: number;
  total_facets: number;
  sections: JesusEventSection[];
  periods: (JesusPeriodSummary & { event_count: number })[];
  themes: (JesusThemeSummary & { event_count: number })[];
  collections: (JesusCollectionSummary & { event_count: number })[];
}

export interface JesusEventLifePeriod {
  slug: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  sort_order: number;
  event_count: number;
  events: JesusEventCard[];
}

export interface JesusEventList {
  events: JesusEventCard[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Topic-grouped category browse ────────────────────────────────────────
//
// `GET /jesus/events/browse/:type` returns the same corpus as `?type=` on
// /jesus/events, reorganised: the category is introduced, then each topic says
// what it is about and quotes what He says there, then the events follow. Every
// category — Teachings, Questions, Commands, Claims and the rest — comes back
// in this one shape.

/** One "what He says here" line, lifted from a matched facet. */
export interface JesusTopicPoint {
  slug: string;
  title: string;
  text: string | null;
  summary: string | null;
  reference: string | null;
  provenance: number;
}

export interface JesusTopicGroup {
  /** null on the catch-all group for events carrying no theme. */
  slug: string | null;
  name: string;
  description: string | null;
  sort_order: number;
  event_count: number;
  facet_count: number;
  gospels: string[];
  points: JesusTopicPoint[];
  events: JesusEventCard[];
}

export interface JesusBrowseCategory {
  type: string;
  mode: 'WORD' | 'ACTION' | string;
  slug: string;
  label: string;
  singular: string;
  /** The noun to count with, lower-case: "8 teachings", "3 acts of compassion". */
  plural: string;
  section: string;
  blurb: string;
  /** The paragraph under the title: what this category is and how it's laid out. */
  intro: string;
  event_count: number;
  facet_count: number;
}

export interface JesusBrowse {
  type: JesusBrowseCategory;
  topics: JesusTopicGroup[];
  total_events: number;
  /** True when the category hit the server's ceiling and was cut short. */
  truncated: boolean;
}
