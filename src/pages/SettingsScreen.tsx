/**
 * Settings Screen — web port of verse-mate-mobile/app/settings.tsx.
 *
 * Replicates the mobile Settings UI and behavior:
 * - Profile Information (auto-save, status indicator) — authenticated only
 * - Bible Version selector
 * - Language Preferences selector (fetched from /bible/languages, cached)
 * - Font Size selector
 * - Theme selector
 * - Logout (with confirm dialog) — authenticated only
 * - Delete Account flow (3 modals) — authenticated only
 * - Sign-In CTA — unauthenticated only
 *
 * Things mobile-only that we drop on web (mirroring mobile's
 * `Platform.OS !== 'web'` blocks): Downloads & Offline, haptics,
 * safe-area insets, native Alert.alert (replaced with shadcn AlertDialog).
 */

import { AlertCircle, Check, ChevronDown, ChevronUp, Loader2, Trash2, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeleteAccountFinalModal } from '@/components/account/DeleteAccountFinalModal';
import { DeleteAccountPasswordModal } from '@/components/account/DeleteAccountPasswordModal';
import { DeleteAccountWarningModal } from '@/components/account/DeleteAccountWarningModal';
import ScreenHeader from '@/components/ScreenHeader';
import { FontSizeSelector } from '@/components/settings/FontSizeSelector';
import { ThemeSelector } from '@/components/settings/ThemeSelector';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { bibleVersions } from '@/constants/bible-versions';
import { useApp } from '@/contexts/AppContext';
import { useDeleteAccount } from '@/hooks/useDeleteAccount';
import { ApiError } from '@/services/api';
import {
  fetchBibleLanguages,
  refreshTokens,
  updateAuthProfile,
  updateUserPreferredLanguage,
} from '@/services/bibleService';
import type { BibleVersion } from '@/services/types';
import {
  destructiveOutlineButtonStyle,
  fieldGroupStyle,
  goldFillButtonStyle,
  goldOutlineButtonStyle,
  inputLabelStyle,
  pageContainerStyle,
  pickerContainerStyle,
  pickerItemBaseStyle,
  pickerItemTextStyle,
  pickerScrollStyle,
  profileErrorTextStyle,
  profileHeaderStyle,
  profileInfoStyle,
  profileNameStyle,
  profileSubtextStyle,
  scrollContainerStyle,
  sectionLabelStyle,
  sectionStyle,
  selectButtonStyle,
  selectButtonTextStyle,
  textInputStyle,
  vmTokens,
} from '@/styles/themeStyles';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const LANGUAGES_CACHE_KEY = 'versemate:languages_cache';
const PREFERRED_LANGUAGE_KEY = '@versemate:preferred_language';

const formatLanguageDisplay = (lang: Language) =>
  lang.name === lang.nativeName ? lang.name : `${lang.nativeName} (${lang.name})`;

// ─── Component ──────────────────────────────────────────────────────────
// Style primitives (pageContainerStyle, sectionStyle, selectButtonStyle,
// etc.) come from `@/styles/themeStyles` so colors flip with the active
// theme. Hex values that are intentionally constant across themes
// (gold accent, status icon colors) reference `vmTokens.*` instead.
export default function SettingsScreen() {
  const navigate = useNavigate();
  const { state, dispatch, signOut, restoreSession } = useApp();

  const isAuthenticated = state.isSignedIn;
  const userFirstName = state.userFirstName;
  const userLastName = state.userLastName;
  const userEmail = state.userEmail;
  const userAvatarUrl = state.userAvatarUrl;
  const userPreferredLanguage = state.userPreferredLanguage;

  // Bible version state
  const bibleVersion = state.settings.defaultVersion;
  const selectedVersionData = useMemo(
    () => bibleVersions.find((v) => v.key === bibleVersion),
    [bibleVersion]
  );
  const [showVersionPicker, setShowVersionPicker] = useState(false);

  // Language state
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    () => localStorage.getItem(PREFERRED_LANGUAGE_KEY) || userPreferredLanguage || 'en-US'
  );
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);

  // Profile form state
  const [firstName, setFirstName] = useState(userFirstName || '');
  const [lastName, setLastName] = useState(userLastName || '');
  const [email, setEmail] = useState(userEmail || '');

  // UI state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [globalError, setGlobalError] = useState<string | null>(null);
  const errorClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Logout confirm
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Delete account flow
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState<string | undefined>();
  const { deleteAccount, isDeleting, error: deleteError, clearError } = useDeleteAccount();

  // Sync form fields when the user record changes (e.g. after restoreSession).
  useEffect(() => {
    setFirstName(userFirstName || '');
    setLastName(userLastName || '');
    setEmail(userEmail || '');
  }, [userFirstName, userLastName, userEmail]);

  // Sync language when first loading or when user record arrives.
  useEffect(() => {
    const stored = localStorage.getItem(PREFERRED_LANGUAGE_KEY);
    if (stored) {
      setSelectedLanguage(stored);
    } else if (userPreferredLanguage) {
      setSelectedLanguage(userPreferredLanguage);
    }
  }, [userPreferredLanguage]);

  // Fetch available languages, with localStorage cache fallback.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const langs = await fetchBibleLanguages();
        if (cancelled) return;
        if (langs.length > 0) {
          setAvailableLanguages(langs);
          try {
            localStorage.setItem(
              LANGUAGES_CACHE_KEY,
              JSON.stringify(
                langs.map((l) => ({
                  language_code: l.code,
                  name: l.name,
                  native_name: l.nativeName,
                }))
              )
            );
          } catch {
            /* ignore quota */
          }
          return;
        }
      } catch {
        /* fall through to cache */
      }

      // Fallback: read from cache.
      try {
        const cached = localStorage.getItem(LANGUAGES_CACHE_KEY);
        if (!cached) return;
        const raw = JSON.parse(cached) as Array<{
          language_code: string;
          name: string;
          native_name: string;
        }>;
        if (!cancelled) {
          setAvailableLanguages(
            raw
              .map((l) => ({ code: l.language_code, name: l.name, nativeName: l.native_name }))
              .sort((a, b) => a.nativeName.localeCompare(b.nativeName))
          );
        }
      } catch {
        /* ignore parse errors */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // ─── Profile save ─────────────────────────────────────────────────────
  const hasProfileChanges = useCallback(
    () =>
      firstName !== (userFirstName || '') ||
      lastName !== (userLastName || '') ||
      email !== (userEmail || ''),
    [firstName, lastName, email, userFirstName, userLastName, userEmail]
  );

  const saveProfile = useCallback(async () => {
    const hasChanges =
      firstName !== (userFirstName || '') ||
      lastName !== (userLastName || '') ||
      email !== (userEmail || '');
    if (!hasChanges) return;

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setGlobalError('All fields are required.');
      setSaveStatus('error');
      if (errorClearTimeoutRef.current) clearTimeout(errorClearTimeoutRef.current);
      errorClearTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
        setGlobalError(null);
      }, 5000);
      return;
    }

    setGlobalError(null);
    setSaveStatus('saving');
    if (errorClearTimeoutRef.current) clearTimeout(errorClearTimeoutRef.current);

    try {
      await updateAuthProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });

      await restoreSession();

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err: unknown) {
      let errorMessage = 'An error occurred while saving your changes.';

      // ApiError carries server body; mobile inspects multiple shapes.
      const apiErr = err instanceof ApiError ? err : null;
      const body =
        apiErr && typeof apiErr.body === 'object' && apiErr.body !== null
          ? (apiErr.body as { value?: { message?: string } | string; message?: string })
          : null;

      if (body?.value && typeof body.value === 'object' && body.value.message === 'EMAIL_ALREADY_EXISTS') {
        errorMessage = 'This email address is already in use by another account.';
      } else if (body?.message === 'EMAIL_ALREADY_EXISTS') {
        errorMessage = 'This email address is already in use by another account.';
      } else if (body?.value && typeof body.value === 'string') {
        errorMessage = body.value;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      setGlobalError(errorMessage);
      setSaveStatus('error');
      if (errorClearTimeoutRef.current) clearTimeout(errorClearTimeoutRef.current);
      errorClearTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
        setGlobalError(null);
      }, 5000);
    }
  }, [firstName, lastName, email, userFirstName, userLastName, userEmail, restoreSession]);

  // Auto-save profile changes 1s after the last edit.
  useEffect(() => {
    if (!isAuthenticated) return;
    const hasChanges =
      firstName !== (userFirstName || '') ||
      lastName !== (userLastName || '') ||
      email !== (userEmail || '');
    if (!hasChanges) return;

    const timer = setTimeout(() => {
      saveProfile();
    }, 1000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, firstName, lastName, email, userFirstName, userLastName, userEmail, saveProfile]);

  // Save pending changes when the page unmounts (mirrors mobile's onBlur save).
  const saveProfileRef = useRef(saveProfile);
  saveProfileRef.current = saveProfile;
  const hasProfileChangesRef = useRef(hasProfileChanges);
  hasProfileChangesRef.current = hasProfileChanges;
  useEffect(() => {
    return () => {
      if (hasProfileChangesRef.current() && isAuthenticated) {
        saveProfileRef.current();
      }
    };
  }, [isAuthenticated]);

  // ─── Bible version + language change handlers ────────────────────────
  const handleBibleVersionChange = (version: BibleVersion) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: { defaultVersion: version } });
    dispatch({ type: 'SET_VERSION', version });
    setShowVersionPicker(false);
  };

  const handleLanguageChange = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    setShowLanguagePicker(false);

    try {
      localStorage.setItem(PREFERRED_LANGUAGE_KEY, languageCode);
    } catch {
      /* ignore quota */
    }

    if (isAuthenticated) {
      try {
        await updateUserPreferredLanguage(languageCode);
        // Small delay to ensure backend DB consistency before issuing new token.
        await new Promise((resolve) => setTimeout(resolve, 500));
        await refreshTokens();
      } catch (err) {
        console.error('Failed to save language preference:', err);
      }
    }
  };

  // ─── Delete account ───────────────────────────────────────────────────
  const handleWarningContinue = () => {
    setShowWarningModal(false);
    const requiresPassword = state.userHasPassword ?? true;
    if (requiresPassword) setShowPasswordModal(true);
    else setShowFinalModal(true);
  };

  const handlePasswordConfirm = (password: string) => {
    setDeletePassword(password);
    setShowPasswordModal(false);
    setShowFinalModal(true);
  };

  const handleFinalConfirm = async () => {
    const success = await deleteAccount(deletePassword);
    if (success) {
      setShowFinalModal(false);
      setDeletePassword(undefined);
    }
  };

  const handleCancelDelete = () => {
    setShowWarningModal(false);
    setShowPasswordModal(false);
    setShowFinalModal(false);
    setDeletePassword(undefined);
    clearError();
  };

  // ─── Logout ───────────────────────────────────────────────────────────
  const performLogout = async () => {
    setShowLogoutConfirm(false);
    await signOut();
    navigate('/menu');
  };

  // ─── Back navigation (saves any pending changes first) ───────────────
  const handleBackPress = async () => {
    if (hasProfileChanges() && isAuthenticated) {
      await saveProfile();
    }
    navigate('/menu');
  };

  // ─── Render ───────────────────────────────────────────────────────────
  const initials = useMemo(() => {
    const f = (userFirstName || firstName || '').trim();
    const l = (userLastName || lastName || '').trim();
    const a = f ? f[0]! : '';
    const b = l ? l[0]! : '';
    return (a + b || (state.userEmail || '?')[0]!).toUpperCase();
  }, [userFirstName, userLastName, firstName, lastName, state.userEmail]);

  return (
    <div style={pageContainerStyle}>
      <ScreenHeader title="Settings" onBack={handleBackPress} backTestId="settings-back-button" />

      <div style={scrollContainerStyle}>
        {/* Profile Information — authenticated only */}
        {isAuthenticated && (
          <section style={sectionStyle}>
            <span style={sectionLabelStyle}>Profile Information</span>
            <div style={profileHeaderStyle}>
              <Avatar className="h-12 w-12">
                {userAvatarUrl ? <AvatarImage src={userAvatarUrl} alt="Profile picture" /> : null}
                {/* Avatar fallback bg is the brand dark — same in both themes
                    so initials always sit on a #1B1B1B chip. */}
                <AvatarFallback className="bg-[#1B1B1B] text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div style={profileInfoStyle}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={profileNameStyle}>Profile Details</span>
                  {saveStatus === 'saving' && (
                    <Loader2
                      size={16}
                      color={vmTokens.textSecondary}
                      style={{ marginLeft: 8 }}
                      className="animate-spin"
                    />
                  )}
                  {saveStatus === 'saved' && (
                    <Check size={18} color={vmTokens.statusSuccess} style={{ marginLeft: 8 }} />
                  )}
                  {saveStatus === 'error' && (
                    <AlertCircle size={18} color={vmTokens.statusError} style={{ marginLeft: 8 }} />
                  )}
                </div>
                {saveStatus === 'error' && globalError ? (
                  <span style={profileErrorTextStyle}>{globalError}</span>
                ) : (
                  <span style={profileSubtextStyle}>Update your personal information</span>
                )}
              </div>
            </div>

            <div>
              <div style={fieldGroupStyle}>
                <label style={inputLabelStyle} htmlFor="settings-first-name">
                  First Name
                </label>
                <input
                  id="settings-first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  data-testid="settings-first-name-input"
                  style={textInputStyle}
                />
              </div>
              <div style={fieldGroupStyle}>
                <label style={inputLabelStyle} htmlFor="settings-last-name">
                  Last Name
                </label>
                <input
                  id="settings-last-name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  data-testid="settings-last-name-input"
                  style={textInputStyle}
                />
              </div>
              <div style={fieldGroupStyle}>
                <label style={inputLabelStyle} htmlFor="settings-email">
                  Email
                </label>
                <input
                  id="settings-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoCapitalize="none"
                  data-testid="settings-email-input"
                  style={textInputStyle}
                />
              </div>
            </div>
          </section>
        )}

        {/* Bible Version */}
        <section style={sectionStyle}>
          <span style={sectionLabelStyle}>Bible Version</span>
          <button
            type="button"
            style={selectButtonStyle}
            onClick={() => setShowVersionPicker((s) => !s)}
            aria-expanded={showVersionPicker}
            data-testid="settings-version-button"
          >
            <span style={selectButtonTextStyle}>
              {selectedVersionData?.value || 'Select Version'}
            </span>
            {showVersionPicker ? (
              <ChevronUp size={20} color={vmTokens.textSecondary} />
            ) : (
              <ChevronDown size={20} color={vmTokens.textSecondary} />
            )}
          </button>

          {showVersionPicker && (
            <div style={pickerContainerStyle}>
              {bibleVersions.map((version, idx) => {
                const isSelected = version.key === bibleVersion;
                const isLast = idx === bibleVersions.length - 1;
                return (
                  <button
                    type="button"
                    key={version.key}
                    onClick={() => handleBibleVersionChange(version.key as BibleVersion)}
                    data-testid={`version-option-${version.key.toLowerCase()}`}
                    style={{
                      ...pickerItemBaseStyle,
                      borderBottom: isLast ? 'none' : `1px solid ${vmTokens.surfaceRaisedBorder}`,
                      background: isSelected ? vmTokens.rowSelectedBg : 'transparent',
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        fontSize: 16,
                        color: isSelected ? vmTokens.gold : vmTokens.textPrimary,
                        fontWeight: isSelected ? 500 : 400,
                      }}
                    >
                      {version.value}
                    </span>
                    {isSelected && <Check size={20} color={vmTokens.gold} />}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Language Preferences */}
        <section style={sectionStyle}>
          <span style={sectionLabelStyle}>Language Preferences</span>
          <button
            type="button"
            style={selectButtonStyle}
            onClick={() => setShowLanguagePicker((s) => !s)}
            aria-expanded={showLanguagePicker}
            data-testid="settings-language-button"
          >
            <span style={selectButtonTextStyle}>
              {(() => {
                const sel = availableLanguages.find((l) => l.code === selectedLanguage);
                return sel ? formatLanguageDisplay(sel) : 'Select Language';
              })()}
            </span>
            {showLanguagePicker ? (
              <ChevronUp size={20} color={vmTokens.textSecondary} />
            ) : (
              <ChevronDown size={20} color={vmTokens.textSecondary} />
            )}
          </button>

          {showLanguagePicker && (
            <div style={pickerContainerStyle}>
              <div style={pickerScrollStyle}>
                {availableLanguages.map((language, idx) => {
                  const isSelected = language.code === selectedLanguage;
                  const isLast = idx === availableLanguages.length - 1;
                  return (
                    <button
                      type="button"
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      data-testid={`language-option-${language.code}`}
                      style={{
                        ...pickerItemBaseStyle,
                        borderBottom: isLast ? 'none' : `1px solid ${vmTokens.surfaceRaisedBorder}`,
                        background: isSelected ? vmTokens.rowSelectedBg : 'transparent',
                      }}
                    >
                      <span style={pickerItemTextStyle(isSelected)}>
                        {formatLanguageDisplay(language)}
                      </span>
                      {isSelected && <Check size={20} color={vmTokens.gold} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <FontSizeSelector />
        <ThemeSelector />

        {/* Logout */}
        {isAuthenticated && (
          <section style={sectionStyle}>
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              data-testid="settings-logout-button"
              style={goldOutlineButtonStyle}
            >
              Logout
            </button>
          </section>
        )}

        {/* Delete Account */}
        {isAuthenticated && (
          <section
            style={{
              ...sectionStyle,
              marginTop: 24,
              borderTop: `1px solid ${vmTokens.divider}`,
              paddingTop: 24,
            }}
          >
            <button
              type="button"
              onClick={() => setShowWarningModal(true)}
              aria-label="Delete account permanently"
              data-testid="settings-delete-account-button"
              style={destructiveOutlineButtonStyle}
            >
              <Trash2 size={20} color={vmTokens.statusError} />
              Delete Account
            </button>
          </section>
        )}

        {/* Not authenticated CTA */}
        {!isAuthenticated && (
          <section style={sectionStyle}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 24px',
                background: vmTokens.surfaceRaisedBg,
                border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
                borderRadius: 12,
              }}
            >
              <User size={64} color={vmTokens.textMuted} />
              <p
                style={{
                  fontSize: 16,
                  color: vmTokens.textSecondary,
                  textAlign: 'center',
                  marginTop: 16,
                  marginBottom: 24,
                  lineHeight: '24px',
                }}
              >
                Sign in to access auto-highlights and profile settings.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                data-testid="settings-sign-in-button"
                style={goldFillButtonStyle}
              >
                Sign In
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Logout confirm */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to logout?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={performLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account modals */}
      <DeleteAccountWarningModal
        visible={showWarningModal}
        onCancel={handleCancelDelete}
        onContinue={handleWarningContinue}
      />
      <DeleteAccountPasswordModal
        visible={showPasswordModal}
        onCancel={handleCancelDelete}
        onConfirm={handlePasswordConfirm}
        isLoading={isDeleting}
        error={deleteError || undefined}
      />
      <DeleteAccountFinalModal
        visible={showFinalModal}
        onCancel={handleCancelDelete}
        onConfirm={handleFinalConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}
