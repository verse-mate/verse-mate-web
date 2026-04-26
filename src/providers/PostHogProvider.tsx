import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { type ReactNode, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/lib/analytics';
import { collectErrorContext, shouldExcludeError } from '@/lib/errorFilters';

const POSTHOG_KEY = (import.meta.env.VITE_POSTHOG_KEY as string | undefined) || '';
const POSTHOG_HOST =
  (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://us.i.posthog.com';
const POSTHOG_SESSION_REPLAY = import.meta.env.VITE_POSTHOG_SESSION_REPLAY === 'true';

interface PostHogProviderProps {
  children: ReactNode;
}

/**
 * Initializes PostHog client-side analytics:
 *  - automatic pageview tracking on every React Router location change
 *    (posthog-js's default capture_pageview only fires on full reloads)
 *  - global error handlers (window.onerror + unhandledrejection) with
 *    the same exclusion filters as the monorepo's frontend-base
 *  - initial anonymous user properties (language, country)
 *  - "platform: web" super property on every event
 *
 * No-ops entirely when VITE_POSTHOG_KEY is not set, so dev builds don't
 * pollute production analytics.
 */
export function PostHogProvider({ children }: PostHogProviderProps) {
  const initialized = useRef(false);
  const propertiesSet = useRef(false);
  const errorHandlersSet = useRef(false);

  useEffect(() => {
    if (initialized.current || typeof window === 'undefined') return;
    if (!POSTHOG_KEY) return;

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false, // captured manually below on route change
      capture_pageleave: true,
      disable_session_recording: !POSTHOG_SESSION_REPLAY,
      persistence: 'localStorage+cookie',
      loaded: (instance) => {
        if (import.meta.env.DEV) instance.debug();
        instance.register({ platform: 'web' });

        if (!propertiesSet.current) {
          const language = navigator.language;
          const localeParts = language.split('-');
          const country =
            localeParts.length > 1
              ? localeParts[1].toUpperCase()
              : language.toUpperCase().slice(0, 2);

          analytics.setUserProperties({
            language_setting: language,
            country,
            is_registered: false,
          });
          propertiesSet.current = true;
        }
      },
    });

    initialized.current = true;
  }, []);

  return (
    <PHProvider client={posthog}>
      <PageviewTracker />
      <ErrorHandlerInstaller errorHandlersSet={errorHandlersSet} />
      {children}
    </PHProvider>
  );
}

function PageviewTracker() {
  const location = useLocation();
  useEffect(() => {
    if (!analytics.isEnabled()) return;
    posthog.capture('$pageview', {
      $current_url: window.location.href,
      pathname: location.pathname,
      search: location.search,
    });
  }, [location.pathname, location.search]);
  return null;
}

interface ErrorHandlerInstallerProps {
  errorHandlersSet: React.MutableRefObject<boolean>;
}

function ErrorHandlerInstaller({ errorHandlersSet }: ErrorHandlerInstallerProps) {
  const handleWindowError = useCallback(
    (
      message: string | Event,
      source?: string,
      lineno?: number,
      colno?: number,
      error?: Error,
    ) => {
      let errorObj: Error;
      if (error) {
        errorObj = error;
      } else if (message instanceof Event) {
        const errorEvent = message as ErrorEvent;
        errorObj = errorEvent.error || new Error(errorEvent.message || 'Unknown error');
      } else {
        errorObj = new Error(typeof message === 'string' ? message : 'Unknown error');
      }
      if (shouldExcludeError(errorObj)) return;
      analytics.captureException(errorObj, {
        ...collectErrorContext(),
        source: 'window-error',
        ...(source && { error_source: source }),
        ...(lineno !== undefined && { line_number: lineno }),
        ...(colno !== undefined && { column_number: colno }),
      });
    },
    [],
  );

  const handleUnhandledRejection = useCallback((event: PromiseRejectionEvent) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    if (shouldExcludeError(error)) return;
    analytics.captureException(error, {
      ...collectErrorContext(),
      source: 'unhandled-promise',
    });
  }, []);

  useEffect(() => {
    if (errorHandlersSet.current || typeof window === 'undefined') return;
    if (!analytics.isEnabled()) return;

    const originalOnError = window.onerror;
    const originalOnUnhandledRejection = window.onunhandledrejection;

    window.onerror = (message, source, lineno, colno, error) => {
      handleWindowError(message, source, lineno, colno, error);
      if (typeof originalOnError === 'function') {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };

    window.onunhandledrejection = (event) => {
      handleUnhandledRejection(event);
      if (typeof originalOnUnhandledRejection === 'function') {
        return originalOnUnhandledRejection.call(window, event);
      }
    };

    errorHandlersSet.current = true;

    return () => {
      window.onerror = originalOnError;
      window.onunhandledrejection = originalOnUnhandledRejection;
      errorHandlersSet.current = false;
    };
  }, [handleWindowError, handleUnhandledRejection, errorHandlersSet]);

  return null;
}
