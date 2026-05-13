// VerseMate domain types — aligned to the real API (api.versemate.org)
// plus backward-compat fields so existing UI code keeps working unchanged.

export type BibleVersion = 'ESV' | 'NIV' | 'KJV' | 'NLT' | 'NASB1995';

export interface Verse {
  number: number; // mirrors API verseNumber
  text: string;
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
  originalLanguage: string;
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
