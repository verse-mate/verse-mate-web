import { useMemo, useState } from 'react';
import { X, FileText, Mail, ArrowLeft } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { login as apiLogin, API_BASE_URL } from '@/services/bibleService';
import { toast } from 'sonner';

interface Props {
  book: string;
  bookId: number;
  chapter: number;
  onClose: () => void;
}

type GuestView = 'providers' | 'email';

/**
 * Chapter-level notes sheet (issue #130).
 *
 * Opened from the notes (📄) icon in the Bible reading header. Lists the
 * user's existing notes for this `bookId + chapter` and exposes an
 * "Add New Note" form. Closing the modal (X or backdrop tap) keeps the
 * user on the Bible page they were reading.
 *
 * Guest gating: capturing a note requires a signed-in account. To avoid
 * yanking the user out of context, the sign-in flow is rendered INLINE
 * inside the same 480px modal. Google + Apple use the redirect SSO
 * path (matches `SignInScreen`'s providers); Email opens an inline
 * email + password form within the modal. On successful email sign-in
 * the modal swaps to the Add New Note form automatically (driven off
 * `state.isSignedIn`).
 *
 * Chapter-level notes use `verse: 0` to match the convention `BookmarksScreen`
 * uses for chapter-level bookmarks (filtered via `!b.verse`).
 */
export default function ChapterNotesSheet({ book, bookId, chapter, onClose }: Props) {
  const { state, dispatch, addNote } = useApp();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  // Guest sub-view state — only relevant when not signed in.
  const [guestView, setGuestView] = useState<GuestView>('providers');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const chapterNotes = useMemo(
    () =>
      state.notes
        .filter(n => n.bookId === bookId && n.chapter === chapter)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [state.notes, bookId, chapter],
  );

  const handleAdd = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await addNote({ bookId, book, chapter, verse: 0, text: trimmed });
      setText('');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // SSO handlers mirror SignInScreen.tsx — backend's /auth/sso/<p>/redirect
  // does the OAuth handshake and returns via /auth/callback, which the
  // `useTrackPreAuthLocation` hook already wired up so the user comes back
  // to the bible page they were on.
  const handleGoogleSSO = () => {
    window.location.href = `${API_BASE_URL}/auth/sso/google/redirect`;
  };
  const handleAppleSSO = () => {
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
      // Modal stays open. `state.isSignedIn` is now true, so the Add New
      // Note form re-renders in place of the sign-in providers.
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
          className="pointer-events-auto w-full max-w-[480px] bg-dark-surface rounded-2xl border border-dark shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-fade-in flex flex-col"
          style={{ maxHeight: '85vh' }}
        >
          <header className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-dark">
            <h3 className="text-[16px] font-semibold text-dark-fg">
              Notes for {book} {chapter}
            </h3>
            <button
              onClick={onClose}
              aria-label="Close"
              data-testid="chapter-notes-sheet-close"
              className="w-9 h-9 flex items-center justify-center"
            >
              <X size={18} className="text-dark-fg" />
            </button>
          </header>

          {!state.isSignedIn ? (
            // Inline sign-in flow — Google/Apple SSO redirect, or an inline
            // email form. All within the same 480px modal so the user
            // never leaves the chapter notes context.
            <div data-testid="chapter-notes-signin-cta" className="px-5 py-6 flex flex-col">
              <p className="text-[14px] text-dark-fg/80 mb-5 text-center leading-snug">
                Sign in to save your notes for {book} {chapter}.
              </p>

              {guestView === 'providers' ? (
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
                    <span className="text-[11px] text-dark-muted/70">or</span>
                    <div className="flex-1 h-px bg-dark" />
                  </div>

                  <button
                    data-testid="login-email-button"
                    onClick={() => setGuestView('email')}
                    className="flex items-center justify-center gap-3 w-full h-12 rounded-xl font-medium text-[14px] bg-dark-raised border border-dark text-dark-fg"
                  >
                    <Mail size={18} />
                    Continue with Email
                  </button>
                </div>
              ) : (
                // Inline email/password form — same APIs as /login.
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setGuestView('providers');
                      setAuthError(null);
                    }}
                    aria-label="Back to providers"
                    data-testid="chapter-notes-signin-email-back"
                    className="self-start flex items-center gap-1 text-[12px] text-dark-muted"
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
                    className="w-full h-11 rounded-xl bg-dark-raised border border-dark px-3 text-[14px] text-dark-fg placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
                  />
                  <input
                    data-testid="login-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-11 rounded-xl bg-dark-raised border border-dark px-3 text-[14px] text-dark-fg placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
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
          ) : (
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {chapterNotes.length > 0 && (
                <ul className="space-y-2" data-testid="chapter-notes-existing-list">
                  {chapterNotes.map(n => (
                    <li
                      key={n.id}
                      data-testid={`chapter-note-item-${n.id}`}
                      className="rounded-2xl bg-dark-raised border border-dark px-4 py-3"
                    >
                      {n.verse > 0 && (
                        <p className="text-[11px] uppercase tracking-wide text-dark-muted mb-1">
                          Verse {n.verse}
                        </p>
                      )}
                      <p className="text-[14px] text-dark-fg whitespace-pre-wrap">{n.text}</p>
                    </li>
                  ))}
                </ul>
              )}

              <section>
                <h4 className="text-[14px] font-semibold text-dark-fg mb-2">Add New Note</h4>
                <textarea
                  data-testid="chapter-notes-textarea"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Write your note here..."
                  rows={4}
                  className="w-full rounded-2xl bg-dark-raised border border-dark px-4 py-3 text-[14px] text-dark-fg placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] resize-none"
                />
                <div className="flex justify-end mt-3">
                  <button
                    data-testid="chapter-notes-add-button"
                    onClick={handleAdd}
                    disabled={text.trim().length === 0 || saving}
                    className="px-4 h-10 rounded-xl bg-gold text-[#1A1A1A] text-[13px] font-medium disabled:opacity-40 inline-flex items-center gap-2"
                  >
                    <FileText size={14} />
                    {saving ? 'Saving…' : 'Add Note'}
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
