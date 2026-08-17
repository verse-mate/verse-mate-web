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
