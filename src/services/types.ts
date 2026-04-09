export type BibleVersion = 'ESV' | 'NIV' | 'KJV' | 'NLT';

export interface Verse {
  number: number;
  text: string;
}

export interface Chapter {
  book: string;
  chapter: number;
  verses: Verse[];
}

export interface BibleBook {
  name: string;
  shortName: string;
  testament: 'OT' | 'NT';
  chapters: number;
}

export interface Bookmark {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  version: BibleVersion;
  createdAt: string;
}

export interface Note {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface Highlight {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  color: HighlightColor;
  createdAt: string;
}

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange';

export interface Commentary {
  verse: number;
  summary: string;
  detail: string;
}

export interface VerseInsight {
  verse: number;
  crossReferences: string[];
  originalLanguage: string;
  historicalContext: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface TopicEvent {
  id: string;
  topicId: string;
  title: string;
  description: string;
  references: string[];
}
