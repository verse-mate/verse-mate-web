import { ApiUnavailable, type ApiGet } from './api';
import { DEFAULT_LANGUAGE, type Language } from './config';
import type { PageData } from './pageData';

export type Coverage = Map<string, Map<number, Set<number>>>;

export interface Indexing {
  indexable: boolean;
  alternates: Language[];
  complete: boolean;
}

const COVERAGE_TTL = 60 * 60;

type CoverageBody = { languages?: Record<string, { bookId: number; chapters: number[] }[]> };

export async function loadCoverage(api: ApiGet): Promise<Coverage | null> {
  let data: CoverageBody | null;
  try {
    data = await api<CoverageBody>('/bible/explanations/coverage', {}, { ttl: COVERAGE_TTL });
  } catch (error) {
    if (error instanceof ApiUnavailable) return null;
    throw error;
  }
  if (!data?.languages || typeof data.languages !== 'object') return null;
  const coverage: Coverage = new Map();
  for (const [language, books] of Object.entries(data.languages)) {
    if (!Array.isArray(books)) return null;
    coverage.set(language, new Map(books.map((book) => [book.bookId, new Set(book.chapters)])));
  }
  return coverage;
}

export function chapterCovered(coverage: Coverage | null, language: Language, bookId: number, chapter: number) {
  return coverage?.get(language)?.get(bookId)?.has(chapter) ?? false;
}

export function explainedIn(data: PageData, language: Language, coverage: Coverage | null) {
  if (data.kind === 'chapter') {
    return chapterCovered(coverage, language, data.bookId, data.chapter);
  }
  const text = data.explanations[language];
  if (!text) return false;
  return language === DEFAULT_LANGUAGE || text !== data.explanations[DEFAULT_LANGUAGE];
}

export function indexingFor(data: PageData, lang: Language, published: Language[], coverage: Coverage | null): Indexing {
  const explained = (language: Language) =>
    data.kind === 'chapter' && language === lang && language === DEFAULT_LANGUAGE
      ? data.summary.trim() !== ''
      : explainedIn(data, language, coverage);
  const indexable = published.includes(lang) && explained(lang);
  return {
    indexable,
    alternates: indexable ? published.filter(explained) : [],
    complete: data.kind !== 'chapter' || coverage !== null,
  };
}
