import { publicClient, unwrap } from '@/api/client';
import { getVisitLanguage } from '@/hooks/usePreferredLanguage';
import {
  getJesusCollections,
  getJesusCollectionsBySlug,
  getJesusEntries,
  getJesusEntriesBySlug,
  getJesusEvents,
  getJesusEventsBrowseByType,
  getJesusEventsBySlug,
  getJesusEventsBySlugCompare,
  getJesusEventsCollectionsBySlug,
  getJesusEventsLife,
  getJesusEventsOverview,
  getJesusForPassage,
  getJesusLife,
  getJesusOverview,
  getJesusThemes,
} from '@/api/generated/sdk.gen';
import type {
  JesusEntry,
  JesusEntryDetail,
  JesusEntryList,
  JesusLifePeriod,
  JesusOverview,
  JesusThemeSummary,
  JesusCollectionSummary,
  JesusCompare,
  JesusEventCard,
  JesusEventCollection,
  JesusEventDetail,
  JesusEventLifePeriod,
  JesusEventList,
  JesusEventOverview,
  JesusBrowse,
} from './types';

export interface JesusEntryQuery {
  kind?: string;
  section?: string;
  theme?: string;
  period?: string;
  collection?: string;
  book_id?: number;
  q?: string;
  limit?: number;
  offset?: number;
}

const EMPTY_OVERVIEW: JesusOverview = {
  total_entries: 0,
  sections: [],
  periods: [],
  themes: [],
  collections: [],
};

function compact<T extends Record<string, string | number | undefined>>(query: T): T {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== ''),
  ) as T;
}

function versioned(bibleVersion?: string) {
  return compact({ bible_version: bibleVersion, lang: getVisitLanguage() ?? undefined });
}

export async function fetchJesusOverview(bibleVersion?: string): Promise<JesusOverview> {
  return unwrap(getJesusOverview({ client: publicClient, query: versioned(bibleVersion) })).catch(
    () => EMPTY_OVERVIEW,
  );
}

export async function fetchJesusEntries(
  query: JesusEntryQuery = {},
  bibleVersion?: string,
): Promise<JesusEntryList> {
  const limit = query.limit ?? 100;
  const offset = query.offset ?? 0;
  return unwrap(
    getJesusEntries({
      client: publicClient,
      query: compact({ ...query, limit, offset, bible_version: bibleVersion, lang: getVisitLanguage() ?? undefined }),
    }),
  ).catch(() => ({ entries: [], total: 0, limit, offset }));
}

export async function fetchJesusEntry(
  slug: string,
  bibleVersion?: string,
): Promise<JesusEntryDetail | null> {
  return unwrap(getJesusEntriesBySlug({ client: publicClient, path: { slug }, query: versioned(bibleVersion) })).catch(
    () => null,
  );
}

export async function fetchJesusLife(bibleVersion?: string): Promise<JesusLifePeriod[]> {
  return unwrap(getJesusLife({ client: publicClient, query: versioned(bibleVersion) }))
    .then((data) => data.periods)
    .catch(() => []);
}

export async function fetchJesusThemes(bibleVersion?: string): Promise<JesusThemeSummary[]> {
  return unwrap(getJesusThemes({ client: publicClient, query: versioned(bibleVersion) }))
    .then((data) => data.themes)
    .catch(() => []);
}

export async function fetchJesusCollections(bibleVersion?: string): Promise<JesusCollectionSummary[]> {
  return unwrap(getJesusCollections({ client: publicClient, query: versioned(bibleVersion) }))
    .then((data) => data.collections)
    .catch(() => []);
}

export async function fetchJesusCollection(
  slug: string,
  bibleVersion?: string,
): Promise<{ collection: JesusCollectionSummary; entries: JesusEntry[] } | null> {
  return unwrap(
    getJesusCollectionsBySlug({ client: publicClient, path: { slug }, query: versioned(bibleVersion) }),
  ).catch(() => null);
}

export interface JesusEventQuery {
  type?: string;
  section?: string;
  mode?: string;
  theme?: string;
  period?: string;
  collection?: string;
  person?: string;
  book_id?: number;
  q?: string;
  limit?: number;
  offset?: number;
}

const EMPTY_EVENT_OVERVIEW: JesusEventOverview = {
  total_events: 0,
  total_facets: 0,
  sections: [],
  periods: [],
  themes: [],
  collections: [],
};

export async function fetchJesusEventOverview(bibleVersion?: string): Promise<JesusEventOverview> {
  return unwrap(getJesusEventsOverview({ client: publicClient, query: versioned(bibleVersion) })).catch(
    () => EMPTY_EVENT_OVERVIEW,
  );
}

export async function fetchJesusEvents(
  query: JesusEventQuery = {},
  bibleVersion?: string,
): Promise<JesusEventList> {
  const limit = query.limit ?? 50;
  const offset = query.offset ?? 0;
  return unwrap(
    getJesusEvents({
      client: publicClient,
      query: compact({ ...query, limit, offset, bible_version: bibleVersion, lang: getVisitLanguage() ?? undefined }),
    }),
  ).catch(() => ({ events: [], total: 0, limit, offset }));
}

export async function fetchJesusBrowse(typeSlug: string, bibleVersion?: string): Promise<JesusBrowse | null> {
  return unwrap(
    getJesusEventsBrowseByType({ client: publicClient, path: { type: typeSlug }, query: versioned(bibleVersion) }),
  ).catch(() => null);
}

export async function fetchJesusEvent(slug: string, bibleVersion?: string): Promise<JesusEventDetail | null> {
  return unwrap(getJesusEventsBySlug({ client: publicClient, path: { slug }, query: versioned(bibleVersion) })).catch(
    () => null,
  );
}

export async function fetchJesusCompare(slug: string, bibleVersion?: string): Promise<JesusCompare | null> {
  return unwrap(
    getJesusEventsBySlugCompare({ client: publicClient, path: { slug }, query: versioned(bibleVersion) }),
  ).catch(() => null);
}

export async function fetchJesusEventsForPassage(
  bookId: number,
  chapter: number,
  verse?: number,
  bibleVersion?: string,
): Promise<JesusEventCard[]> {
  return unwrap(
    getJesusForPassage({
      client: publicClient,
      query: compact({ book_id: bookId, chapter, verse, bible_version: bibleVersion, lang: getVisitLanguage() ?? undefined }),
    }),
  )
    .then((data) => data.events)
    .catch(() => []);
}

export async function fetchJesusEventLife(bibleVersion?: string): Promise<JesusEventLifePeriod[]> {
  return unwrap(getJesusEventsLife({ client: publicClient, query: versioned(bibleVersion) }))
    .then((data) => data.periods)
    .catch(() => []);
}

export async function fetchJesusEventCollection(
  slug: string,
  bibleVersion?: string,
): Promise<JesusEventCollection | null> {
  return unwrap(
    getJesusEventsCollectionsBySlug({ client: publicClient, path: { slug }, query: versioned(bibleVersion) }),
  ).catch(() => null);
}
