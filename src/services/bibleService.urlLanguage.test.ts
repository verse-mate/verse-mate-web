import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_FETCH = global.fetch;
const STORED_LANGUAGE_KEY = '@versemate:preferred_language';

const BOOKS = {
  books: [{ bookId: 43, name: 'John', testament: 'NT', chapters: [{}, {}, {}, {}, {}] }],
};

type Request = { url: string; method: string };
let requests: Request[] = [];

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function mockApi() {
  requests = [];
  global.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input instanceof globalThis.Request ? input.url : input.toString();
    const method = input instanceof globalThis.Request ? input.method : (init?.method ?? 'GET');
    requests.push({ url, method: method.toUpperCase() });
    if (url.includes('/bible/books')) return jsonResponse(BOOKS);
    return jsonResponse({ explanation: { explanation: 'text', explanation_id: 9 } });
  }) as typeof global.fetch;
}

async function loadPage(path: string) {
  vi.resetModules();
  window.history.replaceState(null, '', path);
  const service = await import('./bibleService');
  const language = await import('@/hooks/usePreferredLanguage');
  return { ...service, ...language };
}

function explanationLanguages(chapter: number): string[] {
  return requests
    .filter((r) => r.url.includes(`/bible/book/explanation/43/${chapter}`))
    .map((r) => new URL(r.url, 'http://x').searchParams.get('lang') ?? '');
}

function preferenceWrites(): Request[] {
  return requests.filter((r) => r.url.includes('/user/preferences'));
}

beforeEach(() => {
  mockApi();
});

afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
  localStorage.clear();
  window.history.replaceState(null, '', '/');
  vi.restoreAllMocks();
});

describe('?lang= on load', () => {
  it('shows a guest the explanations in the language the URL names', async () => {
    const page = await loadPage('/bible/john/3?lang=pt-BR');

    await page.fetchCommentary('John', 3);

    expect(explanationLanguages(3)).toEqual(['pt', 'pt', 'pt']);
  });

  it('gives study and labels the URL language', async () => {
    const page = await loadPage('/bible/john/3?lang=pt-BR');

    const { result } = renderHook(() => page.usePreferredLanguage());

    expect(result.current).toBe('pt');
  });

  it('keeps the language after in-reader navigation drops the parameter', async () => {
    localStorage.setItem(STORED_LANGUAGE_KEY, 'en-US');
    const page = await loadPage('/bible/john/3?lang=pt-BR');
    await page.fetchCommentary('John', 3);

    window.history.pushState(null, '', '/bible/john/4');
    await page.fetchCommentary('John', 4);

    expect(explanationLanguages(4)).toEqual(['pt', 'pt', 'pt']);
  });

  it('leaves the saved English preference alone, so a fresh load is English again', async () => {
    localStorage.setItem(STORED_LANGUAGE_KEY, 'en-US');
    const first = await loadPage('/bible/john/3?lang=pt-BR');
    await first.fetchCommentary('John', 3);

    const second = await loadPage('/bible/john/4');
    await second.fetchCommentary('John', 4);

    expect(explanationLanguages(3)).toEqual(['pt', 'pt', 'pt']);
    expect(explanationLanguages(4)).toEqual(['en', 'en', 'en']);
    expect(localStorage.getItem(STORED_LANGUAGE_KEY)).toBe('en-US');
    expect(preferenceWrites()).toEqual([]);
  });

  it("leaves a guest's stored Spanish alone, so a fresh load is Spanish again", async () => {
    localStorage.setItem(STORED_LANGUAGE_KEY, 'es-MX');
    const first = await loadPage('/bible/john/3?lang=pt-BR');
    await first.fetchCommentary('John', 3);

    const second = await loadPage('/bible/john/4');
    await second.fetchCommentary('John', 4);

    expect(explanationLanguages(3)).toEqual(['pt', 'pt', 'pt']);
    expect(explanationLanguages(4)).toEqual(['es', 'es', 'es']);
    expect(localStorage.getItem(STORED_LANGUAGE_KEY)).toBe('es-MX');
  });

  it('ignores a language the API does not offer', async () => {
    localStorage.setItem(STORED_LANGUAGE_KEY, 'es-MX');
    const page = await loadPage('/bible/john/3?lang=xx-YY');

    await page.fetchCommentary('John', 3);

    expect(explanationLanguages(3)).toEqual(['es', 'es', 'es']);
  });

  it("gives way to a language the person picks during the visit", async () => {
    const page = await loadPage('/bible/john/3?lang=pt-BR');

    page.choosePreferredLanguage('es-MX');

    expect(page.getPreferredLanguageCode()).toBe('es');
    expect(localStorage.getItem(STORED_LANGUAGE_KEY)).toBe('es-MX');
  });
});
