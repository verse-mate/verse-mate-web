/**
 * Jesus tab API client.
 *
 * Every call is anonymous-friendly (`auth: false`) because the content is
 * public — a signed-in reader still gets their preferred language because the
 * backend reads the bearer token when one happens to be present.
 *
 * Each function degrades to an empty-but-valid shape on failure rather than
 * throwing, matching how `bibleService` treats topics: a network blip should
 * render an empty state, not a white screen.
 */

import { api } from './api';
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
  JesusEventDetail,
  JesusEventLifePeriod,
  JesusEventList,
  JesusEventOverview,
  JesusBrowse,
} from './types';

/** Filters accepted by `GET /jesus/entries`. All are AND-ed by the backend. */
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

type QueryValue = string | number | boolean;

/** Drop undefined/empty values so they don't reach the query string as "undefined". */
function compact(
  query: Record<string, QueryValue | undefined>,
): Record<string, QueryValue> {
  return Object.fromEntries(
    Object.entries(query).filter(
      (pair): pair is [string, QueryValue] =>
        pair[1] !== undefined && pair[1] !== '',
    ),
  );
}

export async function fetchJesusOverview(bibleVersion?: string): Promise<JesusOverview> {
  try {
    const data = await api.get<JesusOverview>(
      '/jesus/overview',
      compact({ bible_version: bibleVersion }),
      { auth: false },
    );
    return data ?? EMPTY_OVERVIEW;
  } catch {
    return EMPTY_OVERVIEW;
  }
}

export async function fetchJesusEntries(
  query: JesusEntryQuery = {},
  bibleVersion?: string,
): Promise<JesusEntryList> {
  const limit = query.limit ?? 100;
  const offset = query.offset ?? 0;
  try {
    const data = await api.get<JesusEntryList>(
      '/jesus/entries',
      compact({ ...query, limit, offset, bible_version: bibleVersion }),
      { auth: false },
    );
    return data ?? { entries: [], total: 0, limit, offset };
  } catch {
    return { entries: [], total: 0, limit, offset };
  }
}

/** Returns null when the slug doesn't exist, so the screen can show a 404 state. */
export async function fetchJesusEntry(
  slug: string,
  bibleVersion?: string,
): Promise<JesusEntryDetail | null> {
  try {
    const data = await api.get<JesusEntryDetail>(
      `/jesus/entries/${encodeURIComponent(slug)}`,
      compact({ bible_version: bibleVersion }),
      { auth: false },
    );
    return data?.entry ? data : null;
  } catch {
    return null;
  }
}

export async function fetchJesusLife(
  bibleVersion?: string,
): Promise<JesusLifePeriod[]> {
  try {
    const data = await api.get<{ periods: JesusLifePeriod[] }>(
      '/jesus/life',
      compact({ bible_version: bibleVersion }),
      { auth: false },
    );
    return data?.periods ?? [];
  } catch {
    return [];
  }
}

export async function fetchJesusThemes(
  bibleVersion?: string,
): Promise<JesusThemeSummary[]> {
  try {
    const data = await api.get<{ themes: JesusThemeSummary[] }>(
      '/jesus/themes',
      compact({ bible_version: bibleVersion }),
      { auth: false },
    );
    return data?.themes ?? [];
  } catch {
    return [];
  }
}

export async function fetchJesusCollections(
  bibleVersion?: string,
): Promise<JesusCollectionSummary[]> {
  try {
    const data = await api.get<{ collections: JesusCollectionSummary[] }>(
      '/jesus/collections',
      compact({ bible_version: bibleVersion }),
      { auth: false },
    );
    return data?.collections ?? [];
  } catch {
    return [];
  }
}

export async function fetchJesusCollection(
  slug: string,
  bibleVersion?: string,
): Promise<{ collection: JesusCollectionSummary; entries: JesusEntry[] } | null> {
  try {
    const data = await api.get<{
      collection: JesusCollectionSummary;
      entries: JesusEntry[];
    }>(
      `/jesus/collections/${encodeURIComponent(slug)}`,
      compact({ bible_version: bibleVersion }),
      { auth: false },
    );
    return data?.collection ? data : null;
  } catch {
    return null;
  }
}

// ─── Event graph ──────────────────────────────────────────────────────────

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

export async function fetchJesusEventOverview(
  bibleVersion?: string,
): Promise<JesusEventOverview> {
  try {
    const data = await api.get<JesusEventOverview>(
      '/jesus/events/overview',
      compact({ bible_version: bibleVersion }),
      { auth: false },
    );
    return data ?? EMPTY_EVENT_OVERVIEW;
  } catch {
    return EMPTY_EVENT_OVERVIEW;
  }
}

export async function fetchJesusEvents(
  query: JesusEventQuery = {},
  bibleVersion?: string,
): Promise<JesusEventList> {
  const limit = query.limit ?? 50;
  const offset = query.offset ?? 0;
  try {
    const data = await api.get<JesusEventList>(
      '/jesus/events',
      compact({ ...query, limit, offset, bible_version: bibleVersion }),
      { auth: false },
    );
    return data ?? { events: [], total: 0, limit, offset };
  } catch {
    return { events: [], total: 0, limit, offset };
  }
}

/**
 * A category, grouped by the topics it addresses.
 *
 * Returns null both for an unknown category and for a backend that predates
 * the endpoint, which is deliberate: the caller falls back to the flat
 * `?type=` list either way rather than showing an error for a category that
 * plainly exists.
 */
export async function fetchJesusBrowse(
  typeSlug: string,
  bibleVersion?: string,
): Promise<JesusBrowse | null> {
  try {
    const data = await api.get<JesusBrowse>(
      `/jesus/events/browse/${encodeURIComponent(typeSlug)}`,
      compact({ bible_version: bibleVersion }),
      { auth: false },
    );
    return data?.type ? data : null;
  } catch {
    return null;
  }
}

export async function fetchJesusEvent(
  slug: string,
  bibleVersion?: string,
): Promise<JesusEventDetail | null> {
  try {
    const data = await api.get<JesusEventDetail>(
      `/jesus/events/${encodeURIComponent(slug)}`,
      compact({ bible_version: bibleVersion }),
      { auth: false },
    );
    return data?.event ? data : null;
  } catch {
    return null;
  }
}

export async function fetchJesusCompare(
  slug: string,
  bibleVersion?: string,
): Promise<JesusCompare | null> {
  try {
    const data = await api.get<JesusCompare>(
      `/jesus/events/${encodeURIComponent(slug)}/compare`,
      compact({ bible_version: bibleVersion }),
      { auth: false },
    );
    return data?.accounts ? data : null;
  } catch {
    return null;
  }
}

/**
 * The reader bridge. Called while reading a chapter, so it must fail silently
 * and cheaply — a missing event is the common case, not an error.
 */
export async function fetchJesusEventsForPassage(
  bookId: number,
  chapter: number,
  verse?: number,
  bibleVersion?: string,
): Promise<JesusEventCard[]> {
  try {
    const data = await api.get<{ events: JesusEventCard[] }>(
      '/jesus/for-passage',
      compact({ book_id: bookId, chapter, verse, bible_version: bibleVersion }),
      { auth: false },
    );
    return data?.events ?? [];
  } catch {
    return [];
  }
}

export async function fetchJesusEventLife(
  bibleVersion?: string,
): Promise<JesusEventLifePeriod[]> {
  try {
    const data = await api.get<{ periods: JesusEventLifePeriod[] }>(
      '/jesus/events/life',
      compact({ bible_version: bibleVersion }),
      { auth: false },
    );
    return data?.periods ?? [];
  } catch {
    return [];
  }
}

export async function fetchJesusEventCollection(
  slug: string,
  bibleVersion?: string,
): Promise<{
  collection: JesusCollectionSummary & { event_count: number };
  events: JesusEventCard[];
} | null> {
  try {
    const data = await api.get<{
      collection: JesusCollectionSummary & { event_count: number };
      events: JesusEventCard[];
    }>(
      `/jesus/events/collections/${encodeURIComponent(slug)}`,
      compact({ bible_version: bibleVersion }),
      { auth: false },
    );
    return data?.collection ? data : null;
  } catch {
    return null;
  }
}
