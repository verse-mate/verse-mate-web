import { ApiUnavailable, type ApiGet, type ApiResponse } from './api';
import { DEFAULT_LANGUAGE, LANGUAGES, type Language } from './config';
import type { PageData } from './pageData';

export type Coverage = Map<string, Map<number, Set<number>>>;

export interface Indexing {
  explained: boolean;
  indexable: boolean;
  alternates: Language[];
  complete: boolean;
}

const COVERAGE_TTL = 60 * 60;

function servesLanguage(stored: string, language: Language) {
  const code = stored.trim().toLowerCase();
  const wanted = language.toLowerCase();
  return code === wanted || code === wanted.split('-')[0];
}

export async function loadCoverage(api: ApiGet): Promise<Coverage | null> {
  let data: ApiResponse<'/bible/explanations/coverage'> | null;
  try {
    data = await api('/bible/explanations/coverage', {}, { ttl: COVERAGE_TTL });
  } catch (error) {
    if (error instanceof ApiUnavailable) return null;
    throw error;
  }
  if (!data?.languages || typeof data.languages !== 'object') return null;
  const coverage: Coverage = new Map();
  for (const [stored, books] of Object.entries(data.languages)) {
    if (!Array.isArray(books)) return null;
    for (const language of LANGUAGES.filter((code) => servesLanguage(stored, code))) {
      const chapters = coverage.get(language) ?? new Map<number, Set<number>>();
      for (const book of books) {
        const known = chapters.get(book.bookId) ?? new Set<number>();
        for (const chapter of book.chapters) known.add(chapter);
        chapters.set(book.bookId, known);
      }
      coverage.set(language, chapters);
    }
  }
  return coverage;
}

export function chapterCovered(coverage: Coverage | null, language: Language, bookId: number, chapter: number) {
  return coverage?.get(language)?.get(bookId)?.has(chapter) ?? false;
}

export function hasOwnExplanation(explanations: Partial<Record<Language, string>>, language: Language) {
  const text = explanations[language];
  if (!text) return false;
  return language === DEFAULT_LANGUAGE || text !== explanations[DEFAULT_LANGUAGE];
}

export function explainedIn(data: PageData, language: Language, coverage: Coverage | null) {
  if (data.kind === 'chapter') return chapterCovered(coverage, language, data.bookId, data.chapter);
  return hasOwnExplanation(data.explanations, language);
}

export function indexingFor(data: PageData, lang: Language, published: Language[], coverage: Coverage | null): Indexing {
  const explained = (language: Language) =>
    data.kind === 'chapter' && language === lang && language === DEFAULT_LANGUAGE
      ? data.summary.trim() !== ''
      : explainedIn(data, language, coverage);
  const explainedHere = explained(lang);
  const indexable = published.includes(lang) && explainedHere;
  return {
    explained: explainedHere,
    indexable,
    alternates: indexable ? published.filter(explained) : [],
    complete: data.kind !== 'chapter' || coverage !== null,
  };
}
