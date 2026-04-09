/**
 * Google Identity Services wrapper.
 *
 * Loads the GIS script on demand, then exposes signInWithGoogle() which
 * returns the Google ID token via the popup flow. The caller then POSTs
 * that token to /auth/sso to exchange it for a VerseMate bearer token.
 *
 * Requires VITE_GOOGLE_CLIENT_ID at build time, defaulting to the VerseMate
 * production client id (discovered from /auth/sso/google/redirect).
 *
 * ⚠ The Google Cloud Console OAuth client must list this app's origin under
 * "Authorized JavaScript origins" — otherwise GIS returns an error like
 * "Not a valid origin for the client". Localhost and the deployed domain
 * both need to be added separately.
 */

const DEFAULT_CLIENT_ID =
  '94126503648-2fb9dakdfi8pmi8ep78bk5nsrv94db6o.apps.googleusercontent.com';

export const GOOGLE_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) || DEFAULT_CLIENT_ID;

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (resp: { credential: string }) => void;
            ux_mode?: 'popup' | 'redirect';
            auto_select?: boolean;
          }) => void;
          prompt: (cb?: (notification: unknown) => void) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
        };
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

let _loadPromise: Promise<void> | null = null;

export function loadGoogleIdentityServices(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();
  if (_loadPromise) return _loadPromise;
  _loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) resolve();
      else reject(new Error('Google Identity Services failed to load'));
    };
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
    document.head.appendChild(script);
  });
  return _loadPromise;
}

/**
 * Trigger the Google Sign In popup and resolve with the ID token credential.
 * Uses the `prompt()` flow which shows the Google One Tap / account picker.
 */
export async function getGoogleIdToken(): Promise<string> {
  await loadGoogleIdentityServices();
  return new Promise<string>((resolve, reject) => {
    const gis = window.google?.accounts?.id;
    if (!gis) {
      reject(new Error('Google Identity Services not available'));
      return;
    }
    try {
      gis.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: resp => {
          if (resp?.credential) resolve(resp.credential);
          else reject(new Error('No credential returned from Google'));
        },
        ux_mode: 'popup',
      });
      gis.prompt(notification => {
        // The notification object has methods like isNotDisplayed() / isSkippedMoment();
        // if GIS can't show the prompt (e.g. blocked / not eligible), reject.
        const n = notification as {
          isNotDisplayed?: () => boolean;
          isSkippedMoment?: () => boolean;
          getNotDisplayedReason?: () => string;
          getSkippedReason?: () => string;
        };
        if (n.isNotDisplayed?.()) {
          reject(
            new Error(
              `Google sign-in not displayed: ${n.getNotDisplayedReason?.() || 'unknown'}`
            )
          );
        } else if (n.isSkippedMoment?.()) {
          reject(
            new Error(`Google sign-in skipped: ${n.getSkippedReason?.() || 'unknown'}`)
          );
        }
      });
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}
