import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { describeFetch, type FetchCall } from '@/test/fetchCall';
import { clearTokens, setAccessToken } from '@/api/client';
import { AppProvider, useApp } from './AppContext';

type Handler = (call: FetchCall) => Response | Promise<Response>;

const ORIGINAL_FETCH = global.fetch;
let calls: FetchCall[] = [];
let writes: Record<string, Handler> = {};
let reads: Record<string, Handler> = {};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

const refused = () => json({ success: false });
const failed = () => json({ error: 'INTERNAL', message: 'boom' }, 500);

const yellow = {
  highlight_id: 41,
  user_id: 'u1',
  book_id: 1,
  chapter_id: 1,
  chapter_number: 1,
  start_verse: 3,
  end_verse: 3,
  start_char: null,
  end_char: null,
  selected_text: null,
  color: 'yellow',
  created_at: '2026-11-01T00:00:00.000Z',
  updated_at: '2026-11-01T00:00:00.000Z',
};

const note = {
  note_id: 'n1',
  content: 'In the beginning',
  created_at: '2026-11-01T00:00:00.000Z',
  updated_at: '2026-11-01T00:00:00.000Z',
  chapter_number: 1,
  book_id: 1,
  book_name: 'Genesis',
  verse_number: 1,
};

const bookmark = { favorite_id: 7, book_id: 1, book_name: 'Genesis', chapter_number: 1 };

const baseReads: Record<string, Handler> = {
  'GET /user/me': () =>
    json({ id: 'u1', email: 'ruth@example.com', firstName: 'Ruth', lastName: 'Moab', fullName: 'Ruth Moab' }),
  'GET /auth/session': () => json({ id: 'u1', hasPassword: true, imageSrc: null, pendingEmail: null }),
  'GET /bible/books': () => json({ books: [] }),
  'GET /bible/book/bookmarks/u1': () => json({ favorites: [bookmark] }),
  'GET /bible/book/notes/u1': () => json({ notes: [note] }),
  'GET /bible/highlights/u1': () => json({ highlights: [yellow] }),
};

beforeEach(() => {
  setAccessToken('session-token');
  calls = [];
  writes = {};
  reads = { ...baseReads };
  global.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const call = await describeFetch(input, init);
    calls.push(call);
    const key = `${call.init?.method ?? 'GET'} ${new URL(call.url).pathname}`;
    const handler = writes[key] ?? reads[key];
    return handler ? handler(call) : json({ message: 'not found' }, 404);
  }) as unknown as typeof fetch;
});

afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
  clearTokens();
});

const wrapper = ({ children }: { children: ReactNode }) => <AppProvider>{children}</AppProvider>;

async function signedIn() {
  const hook = renderHook(() => useApp(), { wrapper });
  act(() => hook.result.current.dispatch({ type: 'SET_SIGNED_IN', value: true }));
  await waitFor(() => {
    expect(hook.result.current.state.highlights.length).toBeGreaterThan(0);
    expect(hook.result.current.state.notes.length).toBeGreaterThan(0);
    expect(hook.result.current.state.bookmarks.length).toBeGreaterThan(0);
  });
  return hook.result;
}

const newHighlight = { bookId: 1, book: 'Genesis', chapter: 1, verse: 5, startVerse: 5, endVerse: 5, color: 'green' as const };

describe('a highlight write the backend does not save', () => {
  it.each([['refused', refused], ['failed', failed]])('removes a new highlight when the add is %s', async (_, answer) => {
    writes['POST /bible/highlight/add'] = answer;
    const app = await signedIn();
    await act(() => app.current.addHighlight(newHighlight));
    expect(app.current.state.highlights.map(h => h.id)).toEqual(['41']);
  });

  it.each([['refused', refused], ['failed', failed]])('restores the colour when a recolour is %s', async (_, answer) => {
    writes['PUT /bible/highlight/41'] = answer;
    const app = await signedIn();
    await act(() => app.current.updateHighlight('41', 'green'));
    expect(app.current.state.highlights[0].color).toBe('yellow');
  });

  it.each([['refused', refused], ['failed', failed]])('brings a highlight back when its delete is %s', async (_, answer) => {
    writes['DELETE /bible/highlight/41'] = answer;
    const app = await signedIn();
    await act(() => app.current.removeHighlight('41'));
    expect(app.current.state.highlights.map(h => h.id)).toEqual(['41']);
  });
});

describe('a highlight the backend saves', () => {
  it('takes the id the backend returns, so a recolour reaches that id', async () => {
    writes['POST /bible/highlight/add'] = () =>
      json({ success: true, highlight: { ...yellow, highlight_id: 77, start_verse: 5, end_verse: 5, color: 'green' } });
    writes['PUT /bible/highlight/77'] = () => json({ success: true, highlight: null });
    const app = await signedIn();
    await act(() => app.current.addHighlight(newHighlight));
    const saved = app.current.state.highlights.find(h => h.highlightId === 77);
    expect(saved).toBeDefined();
    await act(() => app.current.updateHighlight(saved?.id ?? '', 'blue'));
    expect(calls.some(c => c.init?.method === 'PUT' && new URL(c.url).pathname === '/bible/highlight/77')).toBe(true);
    expect(app.current.state.highlights.find(h => h.highlightId === 77)?.color).toBe('blue');
  });

  it('drops the highlights it absorbed and covers the merged range', async () => {
    writes['POST /bible/highlight/add'] = () =>
      json({
        success: true,
        merged_highlight_ids: [41],
        highlight: { ...yellow, highlight_id: 78, start_verse: 3, end_verse: 5, color: 'yellow' },
      });
    const app = await signedIn();
    await act(() => app.current.addHighlight({ ...newHighlight, color: 'yellow' }));
    expect(app.current.state.highlights).toHaveLength(1);
    expect(app.current.state.highlights[0]).toMatchObject({ id: '78', startVerse: 3, endVerse: 5 });
  });
});

const reads_of = (path: string) => calls.filter(c => (c.init?.method ?? 'GET') === 'GET' && new URL(c.url).pathname === path);

function later() {
  let answer!: (response: Response) => void;
  const response = new Promise<Response>(resolve => {
    answer = resolve;
  });
  return { handler: () => response, answer };
}

describe('a bookmark write the backend does not save', () => {
  it.each([['refused', refused], ['failed', failed]])('removes a bookmark whose add is %s, without reading the list again', async (_, answer) => {
    writes['POST /bible/book/bookmark/add'] = answer;
    const app = await signedIn();
    await act(() => app.current.addBookmark({ bookId: 2, book: 'Exodus', chapter: 3, version: 'NASB1995' }));
    expect(app.current.state.bookmarks.map(b => b.id)).toEqual(['7']);
    expect(reads_of('/bible/book/bookmarks/u1')).toHaveLength(1);
  });

  it.each([['refused', refused], ['failed', failed]])('brings back a bookmark whose removal is %s, in its place', async (_, answer) => {
    writes['POST /bible/book/bookmark/remove'] = answer;
    reads['GET /bible/book/bookmarks/u1'] = () =>
      json({ favorites: [bookmark, { ...bookmark, favorite_id: 8, chapter_number: 2 }] });
    const app = await signedIn();
    await act(() => app.current.removeBookmark('7'));
    expect(app.current.state.bookmarks.map(b => b.id)).toEqual(['7', '8']);
    expect(reads_of('/bible/book/bookmarks/u1')).toHaveLength(1);
  });

  it('keeps the list when the read after a saved bookmark fails', async () => {
    writes['POST /bible/book/bookmark/add'] = () => json({ success: true });
    const app = await signedIn();
    reads['GET /bible/book/bookmarks/u1'] = failed;
    await act(() => app.current.addBookmark({ bookId: 2, book: 'Exodus', chapter: 3, version: 'NASB1995' }));
    expect(app.current.state.bookmarks).toHaveLength(2);
  });
});

describe('a note write the backend does not save', () => {
  it.each([['refused', refused], ['failed', failed]])('removes a new note whose add is %s, without reading the list again', async (_, answer) => {
    writes['POST /bible/book/note/add'] = answer;
    const app = await signedIn();
    await act(() => app.current.addNote({ bookId: 1, book: 'Genesis', chapter: 1, verse: 3, text: 'Light' }));
    expect(app.current.state.notes.map(n => n.id)).toEqual(['n1']);
    expect(reads_of('/bible/book/notes/u1')).toHaveLength(1);
  });

  it.each([['refused', refused], ['failed', failed]])('shows the previous text when an edit is %s', async (_, answer) => {
    writes['PUT /bible/book/note/update'] = answer;
    const app = await signedIn();
    await act(() => app.current.updateNote('n1', 'Edited'));
    expect(app.current.state.notes[0].text).toBe('In the beginning');
  });

  it.each([['refused', refused], ['failed', failed]])('brings back a note whose removal is %s, sending its id as a query value', async (_, answer) => {
    writes['DELETE /bible/book/note/remove'] = answer;
    const app = await signedIn();
    await act(() => app.current.removeNote('n1'));
    expect(app.current.state.notes.map(n => n.id)).toEqual(['n1']);
    const removal = calls.find(c => c.init?.method === 'DELETE');
    expect(new URL(removal?.url ?? 'http://x').searchParams.get('note_id')).toBe('n1');
  });

  it('keeps a later saved edit when an earlier edit fails after it', async () => {
    const first = later();
    let edits = 0;
    writes['PUT /bible/book/note/update'] = () => (++edits === 1 ? first.handler() : json({ success: true }));
    const app = await signedIn();
    let firstEdit!: Promise<void>;
    act(() => {
      firstEdit = app.current.updateNote('n1', 'First');
    });
    await waitFor(() => expect(edits).toBe(1));
    await act(() => app.current.updateNote('n1', 'Second'));
    first.answer(failed());
    await act(() => firstEdit);
    expect(app.current.state.notes[0].text).toBe('Second');
  });
});

describe('two recolours of one highlight', () => {
  it('keeps a later saved colour when an earlier recolour fails after it', async () => {
    const first = later();
    let recolours = 0;
    writes['PUT /bible/highlight/41'] = () => (++recolours === 1 ? first.handler() : json({ success: true, highlight: null }));
    const app = await signedIn();
    let firstRecolour!: Promise<void>;
    act(() => {
      firstRecolour = app.current.updateHighlight('41', 'green');
    });
    await waitFor(() => expect(recolours).toBe(1));
    await act(() => app.current.updateHighlight('41', 'blue'));
    first.answer(failed());
    await act(() => firstRecolour);
    expect(app.current.state.highlights[0].color).toBe('blue');
  });
});

describe('a highlight changed while its add is still on its way', () => {
  it('drops a recolour queued behind an add that fails, with the highlight', async () => {
    const add = later();
    writes['POST /bible/highlight/add'] = add.handler;
    const app = await signedIn();
    let adding!: Promise<void>;
    act(() => {
      adding = app.current.addHighlight(newHighlight);
    });
    const tmp = app.current.state.highlights.find(h => h.id.startsWith('tmp-'));
    let recolouring!: Promise<void>;
    act(() => {
      recolouring = app.current.updateHighlight(tmp?.id ?? '', 'blue');
    });
    add.answer(failed());
    await act(() => Promise.all([adding, recolouring]));
    expect(calls.some(c => c.init?.method === 'PUT')).toBe(false);
    expect(app.current.state.highlights.map(h => h.id)).toEqual(['41']);
  });


  it('sends a recolour made before the add answered to the id the backend returns', async () => {
    const add = later();
    writes['POST /bible/highlight/add'] = add.handler;
    writes['PUT /bible/highlight/77'] = () => json({ success: true, highlight: null });
    const app = await signedIn();
    let adding!: Promise<void>;
    act(() => {
      adding = app.current.addHighlight(newHighlight);
    });
    const tmp = app.current.state.highlights.find(h => h.id.startsWith('tmp-'));
    let recolouring!: Promise<void>;
    act(() => {
      recolouring = app.current.updateHighlight(tmp?.id ?? '', 'blue');
    });
    add.answer(json({ success: true, highlight: { ...yellow, highlight_id: 77, start_verse: 5, end_verse: 5, color: 'green' } }));
    await act(() => Promise.all([adding, recolouring]));
    expect(calls.some(c => c.init?.method === 'PUT' && new URL(c.url).pathname === '/bible/highlight/77')).toBe(true);
    expect(app.current.state.highlights.find(h => h.highlightId === 77)?.color).toBe('blue');
  });

  it('deletes a highlight removed before the add answered, once the backend gives its id', async () => {
    const add = later();
    writes['POST /bible/highlight/add'] = add.handler;
    writes['DELETE /bible/highlight/77'] = () => json({ success: true });
    const app = await signedIn();
    let adding!: Promise<void>;
    act(() => {
      adding = app.current.addHighlight(newHighlight);
    });
    const tmp = app.current.state.highlights.find(h => h.id.startsWith('tmp-'));
    let removing!: Promise<void>;
    act(() => {
      removing = app.current.removeHighlight(tmp?.id ?? '');
    });
    add.answer(json({ success: true, highlight: { ...yellow, highlight_id: 77, start_verse: 5, end_verse: 5, color: 'green' } }));
    await act(() => Promise.all([adding, removing]));
    expect(calls.some(c => c.init?.method === 'DELETE' && new URL(c.url).pathname === '/bible/highlight/77')).toBe(true);
    expect(app.current.state.highlights.map(h => h.id)).toEqual(['41']);
  });
});

describe('the signed-in account', () => {
  it('carries the picture into the app state after sign-in and after a session refresh', async () => {
    reads['GET /auth/session'] = () =>
      json({ id: 'u1', hasPassword: true, imageSrc: 'https://example.com/ruth.png', pendingEmail: null });
    const app = await signedIn();
    expect(app.current.state.userAvatarUrl).toBe('https://example.com/ruth.png');
    reads['GET /auth/session'] = () =>
      json({ id: 'u1', hasPassword: true, imageSrc: 'https://example.com/ruth-2.png', pendingEmail: null });
    await act(() => app.current.restoreSession());
    expect(app.current.state.userAvatarUrl).toBe('https://example.com/ruth-2.png');
  });

  it('keeps whether the account has a password when a later session read fails', async () => {
    reads['GET /auth/session'] = () => json({ id: 'u1', hasPassword: false, imageSrc: null, pendingEmail: null });
    const app = await signedIn();
    expect(app.current.state.userHasPassword).toBe(false);
    reads['GET /auth/session'] = failed;
    await act(() => app.current.restoreSession());
    expect(app.current.state.userHasPassword).toBe(false);
  });
});
