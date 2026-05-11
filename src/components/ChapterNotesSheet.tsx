import { useEffect, useMemo, useState } from 'react';
import { X, FileText, Mail, ArrowLeft, MoreHorizontal, Pencil, Trash2, Check } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { login as apiLogin, API_BASE_URL } from '@/services/bibleService';
import { toast } from 'sonner';

interface Props {
  book: string;
  bookId: number;
  chapter: number;
  onClose: () => void;
}

type View = 'compose' | 'signin-providers' | 'signin-email';

/** Storage key for the in-flight note draft, scoped per chapter. */
function draftKey(bookId: number, chapter: number) {
  return `versemate.pending-chapter-note.${bookId}.${chapter}`;
}

/** Read + clear a pending draft for the given chapter. */
export function consumeChapterNoteDraft(bookId: number, chapter: number): string | null {
  try {
    const v = sessionStorage.getItem(draftKey(bookId, chapter));
    if (v) sessionStorage.removeItem(draftKey(bookId, chapter));
    return v;
  } catch {
    return null;
  }
}

/** Peek at whether a pending draft exists without consuming it. */
export function hasPendingChapterNoteDraft(bookId: number, chapter: number): boolean {
  try {
    return !!sessionStorage.getItem(draftKey(bookId, chapter));
  } catch {
    return false;
  }
}

/**
 * Chapter-level notes sheet (issue #130).
 *
 * The textarea is always visible regardless of auth state — users can
 * compose their note first, and authentication only kicks in at save
 * time. This means a guest can:
 *   1. Type a note.
 *   2. Tap "Sign in to save" → inline sign-in view.
 *   3. Successfully sign in (Email submits in place; Google/Apple SSO
 *      redirects briefly but the draft is preserved via sessionStorage
 *      and restored on return).
 *   4. Return to the compose view with the draft intact and the button
 *      label flipped to "Add Note" — one more tap saves it.
 *
 * SSO round-trip: before redirecting to /auth/sso/<p>/redirect we stash
 * the in-flight draft under a chapter-scoped sessionStorage key.
 * `useTrackPreAuthLocation` already preserves the `/bible/<book>/<n>`
 * URL, so when the user lands back on the Bible page, `ReadingScreen`
 * peeks at `hasPendingChapterNoteDraft()` and re-opens this modal,
 * which then `consumeChapterNoteDraft()`s the saved text on mount.
 *
 * Chapter-level notes use `verse: 0` to match the convention
 * `BookmarksScreen` uses for chapter-level bookmarks (`!b.verse`).
 */
export default function ChapterNotesSheet({ book, bookId, chapter, onClose }: Props) {
  const { state, dispatch, addNote, updateNote, removeNote } = useApp();
  // Restore any draft persisted across an SSO redirect (Google/Apple).
  // Email sign-in doesn't redirect, so its draft lives in this same
  // useState across the in-place view switches.
  const [text, setText] = useState<string>(() => consumeChapterNoteDraft(bookId, chapter) ?? '');
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<View>('compose');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Inline edit/delete state for the "Recently Added Notes" list. Only one
  // note can be expanded (or edited) at a time. Editing reveals an inline
  // textarea + Save/Cancel actions; the "..." button toggles the action
  // row for that note.
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // When the user transitions guest → signed-in mid-modal (via inline
  // email submit), flip back to compose so they see the textarea + Add
  // Note button with their draft preserved.
  useEffect(() => {
    if (state.isSignedIn && view !== 'compose') setView('compose');
  }, [state.isSignedIn, view]);

  const chapterNotes = useMemo(
    () =>
      state.notes
        .filter(n => n.bookId === bookId && n.chapter === chapter)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [state.notes, bookId, chapter],
  );

  const stashDraftForSSO = () => {
    try {
      sessionStorage.setItem(draftKey(bookId, chapter), text);
    } catch {
      /* sessionStorage unavailable — accept the lossy round-trip */
    }
  };

  const handleAddOrSignIn = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!state.isSignedIn) {
      // Guest path — switch to sign-in view in place. The draft stays in
      // component state so when they return from email sign-in (or SSO
      // round-trip via sessionStorage) it's still there.
      setView('signin-providers');
      return;
    }
    setSaving(true);
    try {
      await addNote({ bookId, book, chapter, verse: 0, text: trimmed });
      setText('');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // SSO handlers — stash the draft so the OAuth round-trip doesn't lose it.
  const handleGoogleSSO = () => {
    stashDraftForSSO();
    window.location.href = `${API_BASE_URL}/auth/sso/google/redirect`;
  };
  const handleAppleSSO = () => {
    stashDraftForSSO();
    window.location.href = `${API_BASE_URL}/auth/sso/apple/redirect`;
  };

  const handleEmailSubmit = async () => {
    setAuthError(null);
    if (!email || !password) {
      setAuthError('Enter your email and password');
      return;
    }
    setAuthSubmitting(true);
    try {
      const user = await apiLogin(email, password);
      dispatch({
        type: 'SET_SIGNED_IN',
        value: true,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userAvatarUrl: user.avatarUrl,
      });
      toast.success('Signed in');
      // The useEffect above flips view back to 'compose' once isSignedIn
      // becomes true. `text` is preserved across this transition.
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'status' in err
          ? `Sign in failed (${(err as { status: number }).status})`
          : 'Network error — please try again';
      setAuthError(msg);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const buttonLabel = saving
    ? 'Saving…'
    : state.isSignedIn
      ? 'Add Note'
      : 'Sign in to save';

  return (
    <>
      <div
        data-testid="chapter-notes-sheet-backdrop"
        onClick={onClose}
        className="absolute inset-0 z-40 bg-black/60 animate-fade-in"
      />
      {/* Centered modal — same 480px desktop max-width as VerseInsightSheet
          (`.verse-insight-sheet` media query in index.css). Centered on
          both axes via flex on the absolute-positioned wrapper. */}
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          data-testid="chapter-notes-sheet"
          role="dialog"
          aria-label={`Notes for ${book} ${chapter}`}
          className="pointer-events-auto w-full max-w-[480px] bg-background rounded-2xl border border-border shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-fade-in flex flex-col"
          style={{ maxHeight: '85vh' }}
        >
          <header className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
            <h3 className="text-[16px] font-semibold text-foreground">
              Notes for {book} {chapter}
            </h3>
            <button
              onClick={onClose}
              aria-label="Close"
              data-testid="chapter-notes-sheet-close"
              className="w-9 h-9 flex items-center justify-center"
            >
              <X size={18} className="text-foreground" />
            </button>
          </header>

          {view === 'compose' && (
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              <section>
                <h4 className="text-[14px] font-semibold text-foreground mb-2">Add New Note</h4>
                <textarea
                  data-testid="chapter-notes-textarea"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Write your note here..."
                  rows={4}
                  className="w-full rounded-2xl bg-secondary border border-border px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] resize-none"
                />
                <div className="flex justify-end mt-3">
                  <button
                    data-testid="chapter-notes-add-button"
                    onClick={handleAddOrSignIn}
                    disabled={text.trim().length === 0 || saving}
                    className="px-4 h-10 rounded-xl bg-gold text-[#1A1A1A] text-[13px] font-medium disabled:opacity-40 inline-flex items-center gap-2"
                  >
                    <FileText size={14} />
                    {buttonLabel}
                  </button>
                </div>
              </section>

              {chapterNotes.length > 0 && (
                <section>
                  <h4 className="text-[14px] font-semibold text-foreground mb-2">
                    Recently Added Notes
                  </h4>
                  <ul className="space-y-2" data-testid="chapter-notes-existing-list">
                    {chapterNotes.map(n => {
                      const isExpanded = expandedNoteId === n.id;
                      const isEditing = editingNoteId === n.id;
                      return (
                        <li
                          key={n.id}
                          data-testid={`chapter-note-item-${n.id}`}
                          className="rounded-2xl bg-secondary border border-border px-4 py-3"
                        >
                          {n.verse > 0 && (
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                              Verse {n.verse}
                            </p>
                          )}

                          {isEditing ? (
                            <div className="flex flex-col gap-2">
                              <textarea
                                data-testid={`chapter-note-edit-textarea-${n.id}`}
                                value={editText}
                                onChange={e => setEditText(e.target.value)}
                                rows={3}
                                className="w-full rounded-xl bg-background border border-border px-3 py-2 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] resize-none"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  data-testid={`chapter-note-edit-cancel-${n.id}`}
                                  onClick={() => {
                                    setEditingNoteId(null);
                                    setEditText('');
                                  }}
                                  className="px-3 h-9 rounded-lg bg-background border border-border text-foreground text-[12px]"
                                >
                                  Cancel
                                </button>
                                <button
                                  data-testid={`chapter-note-edit-save-${n.id}`}
                                  onClick={async () => {
                                    const next = editText.trim();
                                    if (!next || next === n.text) {
                                      setEditingNoteId(null);
                                      setEditText('');
                                      return;
                                    }
                                    await updateNote(n.id, next);
                                    setEditingNoteId(null);
                                    setEditText('');
                                  }}
                                  disabled={editText.trim().length === 0}
                                  className="px-3 h-9 rounded-lg bg-gold text-[#1A1A1A] text-[12px] font-medium disabled:opacity-40 inline-flex items-center gap-1"
                                >
                                  <Check size={14} /> Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2">
                              <p className="text-[14px] text-foreground whitespace-pre-wrap flex-1 min-w-0">
                                {n.text}
                              </p>
                              <button
                                aria-label="Note options"
                                data-testid={`chapter-note-options-${n.id}`}
                                onClick={() =>
                                  setExpandedNoteId(prev => (prev === n.id ? null : n.id))
                                }
                                className="shrink-0 w-8 h-8 -mr-1 -mt-1 flex items-center justify-center text-muted-foreground hover:text-foreground"
                              >
                                <MoreHorizontal size={18} strokeWidth={1.75} />
                              </button>
                            </div>
                          )}

                          {isExpanded && !isEditing && (
                            <div
                              data-testid={`chapter-note-actions-${n.id}`}
                              className="mt-3 pt-3 border-t border-border flex justify-end gap-2"
                            >
                              <button
                                data-testid={`chapter-note-edit-${n.id}`}
                                onClick={() => {
                                  setEditingNoteId(n.id);
                                  setEditText(n.text);
                                  setExpandedNoteId(null);
                                }}
                                className="px-3 h-9 rounded-lg bg-background border border-border text-foreground text-[12px] inline-flex items-center gap-1"
                              >
                                <Pencil size={14} /> Edit
                              </button>
                              <button
                                data-testid={`chapter-note-delete-${n.id}`}
                                onClick={async () => {
                                  setExpandedNoteId(null);
                                  await removeNote(n.id);
                                }}
                                className="px-3 h-9 rounded-lg bg-[#2a1617] border border-[#4d1f22] text-red-400 text-[12px] inline-flex items-center gap-1"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </div>
          )}

          {(view === 'signin-providers' || view === 'signin-email') && (
            <div data-testid="chapter-notes-signin-cta" className="px-5 py-6 flex flex-col">
              <p className="text-[14px] text-foreground/80 mb-5 text-center leading-snug">
                Sign in to save your note — we'll bring you right back.
              </p>

              {view === 'signin-providers' ? (
                <div className="flex flex-col gap-3">
                  <button
                    data-testid="login-google-button"
                    onClick={handleGoogleSSO}
                    disabled={authSubmitting}
                    className="flex items-center justify-center gap-3 w-full h-12 rounded-xl font-medium text-[14px] disabled:opacity-60"
                    style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', color: '#1B1B1B' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-1.74.97-3.28 1.22-5.05 1.22-4.13 0-8.18-2.79-8.18-8.18S7.87 5 12 5c2.18 0 4.04.78 5.52 2.08l-2.24 2.16c-.6-.57-1.65-1.24-3.28-1.24-2.81 0-5.1 2.33-5.1 5.2s2.29 5.2 5.1 5.2c3.26 0 4.49-2.34 4.68-3.55H12v-2.84h7.82c.08.47.13.94.13 1.56 0 3.85-2.57 6.71-6.9 6.71z" />
                    </svg>
                    Continue with Google
                  </button>
                  <button
                    data-testid="login-apple-button"
                    onClick={handleAppleSSO}
                    disabled={authSubmitting}
                    className="flex items-center justify-center gap-3 w-full h-12 rounded-xl font-medium text-[14px] disabled:opacity-60"
                    style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', color: '#1B1B1B' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    Continue with Apple
                  </button>

                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px bg-dark" />
                    <span className="text-[11px] text-muted-foreground/70">or</span>
                    <div className="flex-1 h-px bg-dark" />
                  </div>

                  <button
                    data-testid="login-email-button"
                    onClick={() => setView('signin-email')}
                    className="flex items-center justify-center gap-3 w-full h-12 rounded-xl font-medium text-[14px] bg-secondary border border-border text-foreground"
                  >
                    <Mail size={18} />
                    Continue with Email
                  </button>

                  <button
                    onClick={() => setView('compose')}
                    data-testid="chapter-notes-signin-cancel"
                    className="w-full mt-2 text-[12px] text-muted-foreground"
                  >
                    Back to note
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setView('signin-providers');
                      setAuthError(null);
                    }}
                    aria-label="Back to providers"
                    data-testid="chapter-notes-signin-email-back"
                    className="self-start flex items-center gap-1 text-[12px] text-muted-foreground"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <input
                    data-testid="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-11 rounded-xl bg-secondary border border-border px-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
                  />
                  <input
                    data-testid="login-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-11 rounded-xl bg-secondary border border-border px-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
                  />
                  {authError && (
                    <p data-testid="login-error" className="text-[12px] text-red-400 text-center">
                      {authError}
                    </p>
                  )}
                  <button
                    data-testid="login-submit"
                    onClick={handleEmailSubmit}
                    disabled={authSubmitting}
                    className="w-full h-11 rounded-xl bg-gold text-[#1A1A1A] text-[14px] font-semibold disabled:opacity-60"
                  >
                    {authSubmitting ? 'Signing in…' : 'Sign In'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
