import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { BibleVersion, Bookmark, Note, Highlight, HighlightColor } from '@/services/types';
import {
  loadBookmarks, saveBookmarks,
  loadNotes, saveNotes,
  loadHighlights, saveHighlights,
  loadSettings, saveSettings,
  AppSettings,
} from '@/services/bibleService';

interface AppState {
  book: string;
  chapter: number;
  selectedVerse: number | null;
  version: BibleVersion;
  bookmarks: Bookmark[];
  notes: Note[];
  highlights: Highlight[];
  settings: AppSettings;
  isSignedIn: boolean;
}

type Action =
  | { type: 'SET_PASSAGE'; book: string; chapter: number }
  | { type: 'SET_VERSE'; verse: number | null }
  | { type: 'SET_VERSION'; version: BibleVersion }
  | { type: 'ADD_BOOKMARK'; bookmark: Bookmark }
  | { type: 'REMOVE_BOOKMARK'; id: string }
  | { type: 'ADD_NOTE'; note: Note }
  | { type: 'UPDATE_NOTE'; id: string; text: string }
  | { type: 'REMOVE_NOTE'; id: string }
  | { type: 'ADD_HIGHLIGHT'; highlight: Highlight }
  | { type: 'UPDATE_HIGHLIGHT'; id: string; color: HighlightColor }
  | { type: 'REMOVE_HIGHLIGHT'; id: string }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppSettings> }
  | { type: 'SET_SIGNED_IN'; value: boolean };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PASSAGE':
      return { ...state, book: action.book, chapter: action.chapter, selectedVerse: null };
    case 'SET_VERSE':
      return { ...state, selectedVerse: action.verse };
    case 'SET_VERSION':
      return { ...state, version: action.version };
    case 'ADD_BOOKMARK':
      return { ...state, bookmarks: [...state.bookmarks, action.bookmark] };
    case 'REMOVE_BOOKMARK':
      return { ...state, bookmarks: state.bookmarks.filter(b => b.id !== action.id) };
    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.note] };
    case 'UPDATE_NOTE':
      return { ...state, notes: state.notes.map(n => n.id === action.id ? { ...n, text: action.text, updatedAt: new Date().toISOString() } : n) };
    case 'REMOVE_NOTE':
      return { ...state, notes: state.notes.filter(n => n.id !== action.id) };
    case 'ADD_HIGHLIGHT':
      return { ...state, highlights: [...state.highlights, action.highlight] };
    case 'UPDATE_HIGHLIGHT':
      return { ...state, highlights: state.highlights.map(h => h.id === action.id ? { ...h, color: action.color } : h) };
    case 'REMOVE_HIGHLIGHT':
      return { ...state, highlights: state.highlights.filter(h => h.id !== action.id) };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case 'SET_SIGNED_IN':
      return { ...state, isSignedIn: action.value };
    default:
      return state;
  }
}

const initialSettings = loadSettings();

const initialState: AppState = {
  book: 'John',
  chapter: 1,
  selectedVerse: null,
  version: initialSettings.defaultVersion,
  bookmarks: loadBookmarks(),
  notes: loadNotes(),
  highlights: loadHighlights(),
  settings: initialSettings,
  isSignedIn: true, // mock: default signed in
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Persist to localStorage on changes
  useEffect(() => { saveBookmarks(state.bookmarks); }, [state.bookmarks]);
  useEffect(() => { saveNotes(state.notes); }, [state.notes]);
  useEffect(() => { saveHighlights(state.highlights); }, [state.highlights]);
  useEffect(() => { saveSettings(state.settings); }, [state.settings]);

  // Theme
  useEffect(() => {
    const root = document.documentElement;
    if (state.settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.settings.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
