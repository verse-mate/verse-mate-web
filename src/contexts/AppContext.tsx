// AppContext — single source of truth for VerseMate app state.
// User data (bookmarks / notes / highlights) is fetched from the real API
// when the user is signed in; settings stay local-only.
import React, { createContext, useContext, useReducer, useEffect, useRef, ReactNode, useCallback } from 'react';
import { BibleVersion, Bookmark, Note, Highlight, HighlightColor } from '@/services/types';
import { BIBLE_BOOKS } from '@/services/bibleData';
import { getBookIdFromSlug } from '@/lib/bookSlugs';
import {
  loadSettings,
  saveSettings,
  AppSettings,
  isSignedIn as hasToken,
  fetchCurrentUser,
  fetchBookmarks as apiFetchBookmarks,
  fetchNotes as apiFetchNotes,
  fetchHighlights as apiFetchHighlights,
  addBookmark as apiAddBookmark,
  removeBookmark as apiRemoveBookmark,
  addNote as apiAddNote,
  updateNote as apiUpdateNote,
  removeNote as apiRemoveNote,
  addHighlight as apiAddHighlight,
  updateHighlight as apiUpdateHighlight,
  removeHighlight as apiRemoveHighlight,
  fetchBooks as apiFetchBooks,
  resolveBookId,
  logout as apiLogout,
  type SavedHighlight,
} from '@/services/bibleService';

interface AppState {
  book: string;
  bookId: number;
  chapter: number;
  selectedVerse: number | null;
  version: BibleVersion;
  bookmarks: Bookmark[];
  notes: Note[];
  highlights: Highlight[];
  settings: AppSettings;
  isSignedIn: boolean;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userAvatarUrl: string | null;
  userFirstName: string | null;
  userLastName: string | null;
  userHasPassword: boolean | null;
  userPreferredLanguage: string | null;
}

type Action =
  | { type: 'SET_PASSAGE'; book: string; chapter: number; bookId?: number }
  | { type: 'SET_VERSE'; verse: number | null }
  | { type: 'SET_VERSION'; version: BibleVersion }
  | { type: 'SET_BOOKMARKS'; bookmarks: Bookmark[] }
  | { type: 'ADD_BOOKMARK'; bookmark: Bookmark }
  | { type: 'REMOVE_BOOKMARK'; id: string }
  | { type: 'SET_NOTES'; notes: Note[] }
  | { type: 'ADD_NOTE'; note: Note }
  | { type: 'UPDATE_NOTE'; id: string; text: string }
  | { type: 'RESTORE_NOTE_AT'; note: Note; index: number }
  | { type: 'UNDO_NOTE_TEXT'; id: string; written: string; previous: string }
  | { type: 'RESTORE_BOOKMARK'; bookmark: Bookmark; index: number }
  | { type: 'RESTORE_HIGHLIGHT'; highlight: Highlight; index: number }
  | { type: 'UNDO_HIGHLIGHT_COLOR'; highlightId: number; tmpId: string; written: HighlightColor; previous: HighlightColor }
  | { type: 'REMOVE_NOTE'; id: string }
  | { type: 'SET_HIGHLIGHTS'; highlights: Highlight[] }
  | { type: 'ADD_HIGHLIGHT'; highlight: Highlight }
  | { type: 'UPDATE_HIGHLIGHT'; id: string; color: HighlightColor }
  | { type: 'REPLACE_HIGHLIGHT_ID'; oldId: string; newId: string; highlightId?: number }
  | { type: 'REMOVE_HIGHLIGHT'; id: string }
  | {
      type: 'SET_HIGHLIGHT_EXTENT';
      id: string;
      startVerse?: number;
      endVerse?: number;
      startChar: number | null;
      endChar: number | null;
    }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppSettings> }
  | {
      type: 'SET_SIGNED_IN';
      value: boolean;
      userId?: string | null;
      userName?: string | null;
      userEmail?: string | null;
      userAvatarUrl?: string | null;
      userFirstName?: string | null;
      userLastName?: string | null;
      userHasPassword?: boolean | null;
      userPreferredLanguage?: string | null;
    };

function insertAt<T extends { id: string }>(items: T[], item: T, index: number): T[] {
  if (items.some(existing => existing.id === item.id)) return items;
  const at = index < 0 ? items.length : Math.min(index, items.length);
  return [...items.slice(0, at), item, ...items.slice(at)];
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PASSAGE':
      return {
        ...state,
        book: action.book,
        chapter: action.chapter,
        bookId: action.bookId ?? state.bookId,
        selectedVerse: null,
        // Ephemeral (signed-out) highlights are id-prefixed `local-`. Clear
        // them on passage change so they don't bleed across chapters.
        highlights: state.highlights.filter(h => !h.id.startsWith('local-')),
      };
    case 'SET_VERSE':
      return { ...state, selectedVerse: action.verse };
    case 'SET_VERSION':
      return { ...state, version: action.version };
    case 'SET_BOOKMARKS':
      return { ...state, bookmarks: action.bookmarks };
    case 'ADD_BOOKMARK':
      return { ...state, bookmarks: [...state.bookmarks, action.bookmark] };
    case 'REMOVE_BOOKMARK':
      return { ...state, bookmarks: state.bookmarks.filter(b => b.id !== action.id) };
    case 'SET_NOTES':
      return { ...state, notes: action.notes };
    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.note] };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id === action.id ? { ...n, text: action.text, updatedAt: new Date().toISOString() } : n
        ),
      };
    case 'RESTORE_NOTE_AT':
      return { ...state, notes: insertAt(state.notes, action.note, action.index) };
    case 'UNDO_NOTE_TEXT':
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id === action.id && n.text === action.written ? { ...n, text: action.previous } : n
        ),
      };
    case 'RESTORE_BOOKMARK':
      return { ...state, bookmarks: insertAt(state.bookmarks, action.bookmark, action.index) };
    case 'RESTORE_HIGHLIGHT':
      return { ...state, highlights: insertAt(state.highlights, action.highlight, action.index) };
    case 'UNDO_HIGHLIGHT_COLOR':
      return {
        ...state,
        highlights: state.highlights.map(h =>
          (h.highlightId === action.highlightId || h.id === action.tmpId) && h.color === action.written
            ? { ...h, color: action.previous }
            : h
        ),
      };
    case 'REMOVE_NOTE':
      return { ...state, notes: state.notes.filter(n => n.id !== action.id) };
    case 'SET_HIGHLIGHTS':
      return { ...state, highlights: action.highlights };
    case 'ADD_HIGHLIGHT':
      return { ...state, highlights: [...state.highlights, action.highlight] };
    case 'UPDATE_HIGHLIGHT':
      return {
        ...state,
        highlights: state.highlights.map(h =>
          h.id === action.id ? { ...h, color: action.color } : h
        ),
      };
    case 'REPLACE_HIGHLIGHT_ID':
      return {
        ...state,
        highlights: state.highlights.map(h =>
          h.id === action.oldId
            ? { ...h, id: action.newId, highlightId: action.highlightId ?? h.highlightId }
            : h
        ),
      };
    case 'REMOVE_HIGHLIGHT':
      return { ...state, highlights: state.highlights.filter(h => h.id !== action.id) };
    case 'SET_HIGHLIGHT_EXTENT':
      return {
        ...state,
        highlights: state.highlights.map(h => {
          if (h.id !== action.id) return h;
          const startVerse = action.startVerse ?? h.startVerse ?? h.verse;
          return {
            ...h,
            verse: startVerse,
            startVerse,
            endVerse: action.endVerse ?? h.endVerse,
            startChar: action.startChar,
            endChar: action.endChar,
          };
        }),
      };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case 'SET_SIGNED_IN':
      return {
        ...state,
        isSignedIn: action.value,
        userId: action.userId !== undefined ? action.userId : state.userId,
        userName: action.userName !== undefined ? action.userName : state.userName,
        userEmail: action.userEmail !== undefined ? action.userEmail : state.userEmail,
        userAvatarUrl:
          action.userAvatarUrl !== undefined ? action.userAvatarUrl : state.userAvatarUrl,
        userFirstName:
          action.userFirstName !== undefined ? action.userFirstName : state.userFirstName,
        userLastName:
          action.userLastName !== undefined ? action.userLastName : state.userLastName,
        userHasPassword:
          action.userHasPassword !== undefined ? action.userHasPassword : state.userHasPassword,
        userPreferredLanguage:
          action.userPreferredLanguage !== undefined
            ? action.userPreferredLanguage
            : state.userPreferredLanguage,
      };
    default:
      return state;
  }
}

const initialSettings = loadSettings();

// Read the URL on first render so the header shows the correct book/chapter
// immediately instead of flashing the Genesis 1 default until BibleRoute
// resolves and dispatches SET_PASSAGE. Matches the production URL shape
// `/bible/<slug>/<chapter>`. Falls back to Genesis 1 for any other path
// (including legacy `/read`).
function parseInitialPassage(): { book: string; bookId: number; chapter: number } {
  const fallback = { book: 'Genesis', bookId: 1, chapter: 1 };
  if (typeof window === 'undefined') return fallback;
  const m = window.location.pathname.match(/^\/bible\/([^/]+)\/(\d+)/);
  if (!m) return fallback;
  const bookId = getBookIdFromSlug(m[1]);
  if (!bookId) return fallback;
  const book = BIBLE_BOOKS[bookId - 1]?.name;
  if (!book) return fallback;
  const chapter = Math.max(1, Number.parseInt(m[2], 10) || 1);
  return { book, bookId, chapter };
}

const initialPassage = parseInitialPassage();

const initialState: AppState = {
  book: initialPassage.book,
  bookId: initialPassage.bookId,
  chapter: initialPassage.chapter,
  selectedVerse: null,
  version: initialSettings.defaultVersion,
  bookmarks: [],
  notes: [],
  highlights: [],
  settings: initialSettings,
  isSignedIn: hasToken(),
  userId: null,
  userName: null,
  userEmail: null,
  userAvatarUrl: null,
  userFirstName: null,
  userLastName: null,
  userHasPassword: null,
  userPreferredLanguage: null,
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Higher-level mutations that also write through to the API
  addBookmark: (bookmark: Omit<Bookmark, 'id'>) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, text: string) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
  addHighlight: (h: Omit<Highlight, 'id' | 'createdAt'>) => Promise<void>;
  updateHighlight: (id: string, color: HighlightColor) => Promise<void>;
  removeHighlight: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
  /**
   * Refetch the current user from /user/me and update the auth fields in
   * state. Used after PUT /auth/profile so the form picks up server-side
   * canonicalization (e.g. trimmed whitespace, normalized email casing).
   */
  restoreSession: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Read the latest state inside async callbacks to dodge stale closures.
  // VER-71: the effect below captures state.book / state.chapter / state.bookId
  // at the moment it fires, but `resolveBookId` is async — by the time it
  // resolves, the user may have navigated (BibleRoute's URL→state sync), so
  // dispatching with the closure-captured values can revert state to the
  // previous passage and bounce the URL to /bible/genesis/1 (or worse).
  const stateRef = useRef(state);
  stateRef.current = state;

  // Warm the books cache on mount
  useEffect(() => {
    apiFetchBooks().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever the current book name changes, make sure bookId stays in sync.
  // This lets screens dispatch SET_PASSAGE with just a book name + chapter
  // and the ID gets resolved automatically.
  useEffect(() => {
    const bookSnap = state.book;
    let cancelled = false;
    (async () => {
      const id = await resolveBookId(bookSnap);
      if (cancelled) return;
      const latest = stateRef.current;
      // Only correct bookId if the book name we resolved is still the active
      // book and the resolved id genuinely differs. Reading bookId/chapter
      // off the closure (instead of the ref) is what raced with concurrent
      // SET_PASSAGE dispatches and produced the residual VER-71 genesis/1
      // bounce.
      if (latest.book !== bookSnap) return;
      if (id && id !== latest.bookId) {
        dispatch({ type: 'SET_PASSAGE', book: latest.book, chapter: latest.chapter, bookId: id });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [state.book]);

  // Persist settings
  useEffect(() => {
    saveSettings(state.settings);
  }, [state.settings]);

  // Apply theme. 'system' follows prefers-color-scheme and live-updates if
  // the OS theme changes mid-session.
  useEffect(() => {
    const root = document.documentElement;
    const apply = (isDark: boolean) => {
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    };

    if (state.settings.theme === 'dark') {
      apply(true);
      return;
    }
    if (state.settings.theme === 'light') {
      apply(false);
      return;
    }
    // 'system'
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    apply(mql.matches);
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [state.settings.theme]);

  // When signed in, fetch the current user + user data
  useEffect(() => {
    if (!state.isSignedIn) {
      dispatch({ type: 'SET_BOOKMARKS', bookmarks: [] });
      dispatch({ type: 'SET_NOTES', notes: [] });
      dispatch({ type: 'SET_HIGHLIGHTS', highlights: [] });
      return;
    }
    (async () => {
      try {
        const user = await fetchCurrentUser();
        dispatch({
          type: 'SET_SIGNED_IN',
          value: true,
          userId: user.id,
          userName: user.name || null,
          userEmail: user.email || null,
          userAvatarUrl: user.avatarUrl || null,
          userFirstName: user.firstName || null,
          userLastName: user.lastName || null,
          userHasPassword: typeof user.hasPassword === 'boolean' ? user.hasPassword : null,
          userPreferredLanguage: user.preferredLanguage || null,
        });
        const [bookmarks, notes, highlights] = await Promise.all([
          apiFetchBookmarks(user.id),
          apiFetchNotes(user.id),
          apiFetchHighlights(user.id),
        ]);
        if (bookmarks) dispatch({ type: 'SET_BOOKMARKS', bookmarks });
        if (notes) dispatch({ type: 'SET_NOTES', notes });
        dispatch({ type: 'SET_HIGHLIGHTS', highlights });
      } catch {
        // Token probably invalid — treat as signed out
        dispatch({
          type: 'SET_SIGNED_IN',
          value: false,
          userId: null,
          userName: null,
          userEmail: null,
          userAvatarUrl: null,
          userFirstName: null,
          userLastName: null,
          userHasPassword: null,
          userPreferredLanguage: null,
        });
      }
    })();
  }, [state.isSignedIn]);

  const addBookmark = useCallback(
    async (bookmark: Omit<Bookmark, 'id'>) => {
      const optimistic: Bookmark = { ...bookmark, id: `tmp-${Date.now()}` };
      dispatch({ type: 'ADD_BOOKMARK', bookmark: optimistic });
      if (!state.userId) return;
      try {
        await apiAddBookmark({
          userId: state.userId,
          bookId: bookmark.bookId,
          chapter: bookmark.chapter,
        });
      } catch {
        dispatch({ type: 'REMOVE_BOOKMARK', id: optimistic.id });
        return;
      }
      const refreshed = await apiFetchBookmarks(state.userId);
      if (refreshed) dispatch({ type: 'SET_BOOKMARKS', bookmarks: refreshed });
    },
    [state.userId]
  );

  const removeBookmark = useCallback(
    async (id: string) => {
      const index = state.bookmarks.findIndex(b => b.id === id);
      const existing = state.bookmarks[index];
      if (!existing) return;
      dispatch({ type: 'REMOVE_BOOKMARK', id });
      if (!state.userId) return;
      try {
        await apiRemoveBookmark({
          userId: state.userId,
          bookId: existing.bookId,
          chapter: existing.chapter,
        });
      } catch {
        dispatch({ type: 'RESTORE_BOOKMARK', bookmark: existing, index });
        return;
      }
      const refreshed = await apiFetchBookmarks(state.userId);
      if (refreshed) dispatch({ type: 'SET_BOOKMARKS', bookmarks: refreshed });
    },
    [state.bookmarks, state.userId]
  );

  const addNote = useCallback(
    async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const optimistic: Note = { ...note, id: `tmp-${Date.now()}`, createdAt: now, updatedAt: now };
      dispatch({ type: 'ADD_NOTE', note: optimistic });
      if (!state.userId) return;
      try {
        await apiAddNote({
          userId: state.userId,
          bookId: note.bookId,
          chapter: note.chapter,
          verse: note.verse,
          text: note.text,
        });
      } catch {
        dispatch({ type: 'REMOVE_NOTE', id: optimistic.id });
        return;
      }
      const refreshed = await apiFetchNotes(state.userId);
      if (refreshed) dispatch({ type: 'SET_NOTES', notes: refreshed });
    },
    [state.userId]
  );

  const updateNote = useCallback(
    async (id: string, text: string) => {
      const existing = state.notes.find(n => n.id === id);
      dispatch({ type: 'UPDATE_NOTE', id, text });
      if (!state.userId || !existing) return;
      await apiUpdateNote(id, text).catch(() =>
        dispatch({ type: 'UNDO_NOTE_TEXT', id, written: text, previous: existing.text })
      );
    },
    [state.notes, state.userId]
  );

  const removeNote = useCallback(
    async (id: string) => {
      const index = state.notes.findIndex(n => n.id === id);
      const existing = state.notes[index];
      dispatch({ type: 'REMOVE_NOTE', id });
      if (!state.userId || !existing) return;
      await apiRemoveNote(id).catch(() => dispatch({ type: 'RESTORE_NOTE_AT', note: existing, index }));
    },
    [state.notes, state.userId]
  );

  const pendingAdds = useRef(new Map<string, Promise<number | null>>());

  const savedIdOf = useCallback(async (h: Highlight): Promise<number | null> => {
    if (h.highlightId !== undefined) return h.highlightId;
    return (await pendingAdds.current.get(h.id)) ?? null;
  }, []);

  const addHighlight = useCallback(
    async (h: Omit<Highlight, 'id' | 'createdAt'>) => {
      const tmpId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const optimistic: Highlight = {
        ...h,
        id: tmpId,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_HIGHLIGHT', highlight: optimistic });
      if (!state.userId) return;

      const userId = state.userId;
      const saving = apiAddHighlight({
        userId,
        bookId: h.bookId,
        chapter: h.chapter,
        startVerse: h.startVerse ?? h.verse,
        endVerse: h.endVerse ?? h.verse,
        color: h.color,
        startChar: h.startChar,
        endChar: h.endChar,
        selectedText: h.selectedText,
      }).then(
        (result): SavedHighlight | null => result,
        () => null
      );
      pendingAdds.current.set(tmpId, saving.then(result => result?.highlightId ?? null));
      const result = await saving;
      pendingAdds.current.delete(tmpId);
      if (!result) {
        dispatch({ type: 'REMOVE_HIGHLIGHT', id: tmpId });
        return;
      }
      const realId = result.highlightId;
      dispatch({ type: 'REPLACE_HIGHLIGHT_ID', oldId: tmpId, newId: String(realId), highlightId: realId });
      const merged = result.mergedHighlightIds.filter(id => id !== realId);
      if (merged.length === 0) return;
      for (const id of merged) dispatch({ type: 'REMOVE_HIGHLIGHT', id: String(id) });
      dispatch({
        type: 'SET_HIGHLIGHT_EXTENT',
        id: String(realId),
        startVerse: result.startVerse,
        endVerse: result.endVerse,
        startChar: result.startChar,
        endChar: result.endChar,
      });
    },
    [state.userId]
  );

  const updateHighlight = useCallback(
    async (id: string, color: HighlightColor) => {
      const existing = state.highlights.find(h => h.id === id);
      dispatch({ type: 'UPDATE_HIGHLIGHT', id, color });
      if (!state.userId || !existing) return;
      const highlightId = await savedIdOf(existing);
      if (highlightId === null) return;
      await apiUpdateHighlight(highlightId, color).catch(() =>
        dispatch({ type: 'UNDO_HIGHLIGHT_COLOR', highlightId, tmpId: id, written: color, previous: existing.color })
      );
    },
    [state.highlights, state.userId, savedIdOf]
  );

  const removeHighlight = useCallback(
    async (id: string) => {
      const index = state.highlights.findIndex(h => h.id === id);
      const existing = state.highlights[index];
      dispatch({ type: 'REMOVE_HIGHLIGHT', id });
      if (!state.userId || !existing) return;
      const highlightId = await savedIdOf(existing);
      if (highlightId === null) return;
      if (existing.highlightId === undefined) dispatch({ type: 'REMOVE_HIGHLIGHT', id: String(highlightId) });
      await apiRemoveHighlight(highlightId).catch(() =>
        dispatch({
          type: 'RESTORE_HIGHLIGHT',
          highlight: { ...existing, id: String(highlightId), highlightId },
          index,
        })
      );
    },
    [state.highlights, state.userId, savedIdOf]
  );

  const signOut = useCallback(async () => {
    await apiLogout();
    dispatch({
      type: 'SET_SIGNED_IN',
      value: false,
      userId: null,
      userName: null,
      userEmail: null,
      userAvatarUrl: null,
      userFirstName: null,
      userLastName: null,
      userHasPassword: null,
      userPreferredLanguage: null,
    });
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      const user = await fetchCurrentUser();
      dispatch({
        type: 'SET_SIGNED_IN',
        value: true,
        userId: user.id,
        userName: user.name || null,
        userEmail: user.email || null,
        userAvatarUrl: user.avatarUrl || null,
        userFirstName: user.firstName || null,
        userLastName: user.lastName || null,
        userHasPassword: typeof user.hasPassword === 'boolean' ? user.hasPassword : undefined,
        userPreferredLanguage: user.preferredLanguage || null,
      });
    } catch {
      /* leave session as-is on transient failure */
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addBookmark,
        removeBookmark,
        addNote,
        updateNote,
        removeNote,
        addHighlight,
        updateHighlight,
        removeHighlight,
        signOut,
        restoreSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
