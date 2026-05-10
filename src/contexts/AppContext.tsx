// AppContext — single source of truth for VerseMate app state.
// User data (bookmarks / notes / highlights) is fetched from the real API
// when the user is signed in; settings stay local-only.
import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { BibleVersion, Bookmark, Note, Highlight, HighlightColor } from '@/services/types';
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
  | { type: 'REMOVE_NOTE'; id: string }
  | { type: 'SET_HIGHLIGHTS'; highlights: Highlight[] }
  | { type: 'ADD_HIGHLIGHT'; highlight: Highlight }
  | { type: 'UPDATE_HIGHLIGHT'; id: string; color: HighlightColor }
  | { type: 'REPLACE_HIGHLIGHT_ID'; oldId: string; newId: string; highlightId?: number }
  | { type: 'REMOVE_HIGHLIGHT'; id: string }
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

const initialState: AppState = {
  book: 'Genesis',
  bookId: 1,
  chapter: 1,
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
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => Promise<void>;
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

  // Warm the books cache on mount
  useEffect(() => {
    apiFetchBooks().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever the current book name changes, make sure bookId stays in sync.
  // This lets screens dispatch SET_PASSAGE with just a book name + chapter
  // and the ID gets resolved automatically.
  useEffect(() => {
    (async () => {
      const id = await resolveBookId(state.book);
      if (id && id !== state.bookId) {
        dispatch({ type: 'SET_PASSAGE', book: state.book, chapter: state.chapter, bookId: id });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        dispatch({ type: 'SET_BOOKMARKS', bookmarks });
        dispatch({ type: 'SET_NOTES', notes });
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

  // ─── API-backed mutations ────────────────────────────────────────────
  const addBookmark = useCallback(
    async (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
      const optimistic: Bookmark = {
        ...bookmark,
        id: `tmp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_BOOKMARK', bookmark: optimistic });
      if (!state.userId) return;
      try {
        await apiAddBookmark({
          userId: state.userId,
          bookId: bookmark.bookId,
          chapter: bookmark.chapter,
        });
        const refreshed = await apiFetchBookmarks(state.userId);
        dispatch({ type: 'SET_BOOKMARKS', bookmarks: refreshed });
      } catch {
        dispatch({ type: 'REMOVE_BOOKMARK', id: optimistic.id });
      }
    },
    [state.userId]
  );

  const removeBookmark = useCallback(
    async (id: string) => {
      const existing = state.bookmarks.find(b => b.id === id);
      if (!existing) return;
      dispatch({ type: 'REMOVE_BOOKMARK', id });
      if (!state.userId) return;
      try {
        await apiRemoveBookmark({
          userId: state.userId,
          bookId: existing.bookId,
          chapter: existing.chapter,
        });
        // Refetch to reconcile any state the server changed
        const refreshed = await apiFetchBookmarks(state.userId);
        dispatch({ type: 'SET_BOOKMARKS', bookmarks: refreshed });
      } catch {
        if (existing) dispatch({ type: 'ADD_BOOKMARK', bookmark: existing });
      }
    },
    [state.bookmarks, state.userId]
  );

  const addNote = useCallback(
    async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const optimistic: Note = { ...note, id: `tmp-${Date.now()}`, createdAt: now, updatedAt: now };
      dispatch({ type: 'ADD_NOTE', note: optimistic });
      try {
        await apiAddNote({ bookId: note.bookId, chapter: note.chapter, verse: note.verse, text: note.text });
        if (state.userId) {
          const refreshed = await apiFetchNotes(state.userId);
          dispatch({ type: 'SET_NOTES', notes: refreshed });
        }
      } catch {
        dispatch({ type: 'REMOVE_NOTE', id: optimistic.id });
      }
    },
    [state.userId]
  );

  const updateNote = useCallback(async (id: string, text: string) => {
    dispatch({ type: 'UPDATE_NOTE', id, text });
    try {
      await apiUpdateNote(id, text);
    } catch {
      /* keep optimistic */
    }
  }, []);

  const removeNote = useCallback(
    async (id: string) => {
      const existing = state.notes.find(n => n.id === id);
      dispatch({ type: 'REMOVE_NOTE', id });
      try {
        await apiRemoveNote(id);
      } catch {
        if (existing) dispatch({ type: 'ADD_NOTE', note: existing });
      }
    },
    [state.notes]
  );

  const addHighlight = useCallback(
    async (h: Omit<Highlight, 'id' | 'createdAt'>) => {
      const tmpId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const optimistic: Highlight = {
        ...h,
        id: tmpId,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_HIGHLIGHT', highlight: optimistic });

      // Signed-out: keep the optimistic highlight in memory only — never
      // hit the API. SelectionToolbar handles its own ephemeral path; this
      // branch covers VerseActions and any other call site that goes
      // through addHighlight without checking auth first.
      if (!state.userId) return;

      try {
        // Best-effort: pull the real highlight_id off the POST response so
        // subsequent recolor / remove on the just-added highlight hits the
        // right backend record. We deliberately do NOT refetch the full
        // list here: that previously caused two bugs — (1) racing refetches
        // across rapid adds could overwrite earlier optimistic state, and
        // (2) if the backend's GET response for /bible/highlights collapses
        // a multi-verse range to a single verse, the refetch would clobber
        // the user's correctly-rendered range. The full list is re-fetched
        // on sign-in / passage load instead.
        const res = await apiAddHighlight({
          userId: state.userId,
          bookId: h.bookId,
          chapter: h.chapter,
          startVerse: h.startVerse ?? h.verse,
          endVerse: h.endVerse ?? h.verse,
          color: h.color,
        });
        const realId =
          (res as { highlight?: { highlight_id?: number }; highlight_id?: number } | undefined)
            ?.highlight?.highlight_id ??
          (res as { highlight_id?: number } | undefined)?.highlight_id;
        if (typeof realId === 'number' && realId > 0) {
          dispatch({
            type: 'REPLACE_HIGHLIGHT_ID',
            oldId: tmpId,
            newId: String(realId),
            highlightId: realId,
          });
        }
      } catch {
        dispatch({ type: 'REMOVE_HIGHLIGHT', id: tmpId });
      }
    },
    [state.userId]
  );

  const updateHighlight = useCallback(async (id: string, color: HighlightColor) => {
    dispatch({ type: 'UPDATE_HIGHLIGHT', id, color });
    try {
      await apiUpdateHighlight(id, color);
    } catch {
      /* keep optimistic */
    }
  }, []);

  const removeHighlight = useCallback(
    async (id: string) => {
      const existing = state.highlights.find(h => h.id === id);
      dispatch({ type: 'REMOVE_HIGHLIGHT', id });
      try {
        await apiRemoveHighlight(id);
      } catch {
        if (existing) dispatch({ type: 'ADD_HIGHLIGHT', highlight: existing });
      }
    },
    [state.highlights]
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
        userHasPassword: typeof user.hasPassword === 'boolean' ? user.hasPassword : null,
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
