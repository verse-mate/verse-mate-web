/**
 * Error filtering and context collection for PostHog exception tracking.
 * Mirrors the rules used by the monorepo's frontend-base/analytics so we
 * don't double-report the same noisy errors across web and mobile.
 */

import posthog from 'posthog-js';
import { analytics } from './analytics';

export interface ExceptionContext {
  timestamp: string;
  pathname?: string;
  referrer?: string;
  viewport?: string;
  user_agent?: string;
  distinct_id?: string;
  session_id?: string;
  user_id?: string;
  source?: string;
  [key: string]: unknown;
}

function isOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

const SIGNED_OUT_ERRORS = ['CoachAuthError', 'GuestScopeExceededError'];

function isSignedOutError(error: unknown): boolean {
  return error instanceof Error && SIGNED_OUT_ERRORS.includes(error.name);
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && (error.name === 'AbortError' || error.message === 'AbortError');
}

function getStatusCode(error: unknown): number | undefined {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: unknown }).status;
    if (typeof status === 'number') return status;
  }
  return undefined;
}

function isResizeObserverError(error: unknown): boolean {
  if (error instanceof Error) return /ResizeObserver loop/i.test(error.message);
  if (typeof error === 'string') return /ResizeObserver loop/i.test(error);
  return false;
}

function isCrossOriginError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message === 'Script error.' || error.message === 'Script error';
  }
  return false;
}

export function shouldExcludeError(error: unknown): boolean {
  if (isOffline()) return true;
  if (isAbortError(error)) return true;
  if (isSignedOutError(error)) return true;
  const status = getStatusCode(error);
  if (status === 401 || status === 403) return true;
  if (isResizeObserverError(error)) return true;
  if (isCrossOriginError(error)) return true;
  return false;
}

export function collectErrorContext(): ExceptionContext {
  const context: ExceptionContext = { timestamp: new Date().toISOString() };

  if (typeof window !== 'undefined') {
    context.pathname = window.location.pathname;
    context.referrer = document.referrer || undefined;
    context.viewport = `${window.innerWidth}x${window.innerHeight}`;
  }
  if (typeof navigator !== 'undefined') {
    context.user_agent = navigator.userAgent;
  }

  try {
    const distinctId = posthog.get_distinct_id?.();
    if (distinctId) context.distinct_id = distinctId;
    const sessionId = posthog.get_session_id?.();
    if (sessionId) context.session_id = sessionId;
    const userId = posthog.get_property?.('$user_id');
    if (typeof userId === 'string') context.user_id = userId;
  } catch {
    // PostHog may not be initialized
  }

  return context;
}

const KEY_WORD = /^[a-z][a-z-]*$/;

function keyName(key: readonly unknown[] | undefined): string | undefined {
  const [first, second] = key ?? [];
  if (typeof first !== 'string') return undefined;
  return typeof second === 'string' && KEY_WORD.test(second) ? `${first}/${second}` : first;
}

export function toReportableError(value: unknown): Error {
  return value instanceof Error ? value : new Error(`Non-Error rejection: ${typeof value}`);
}

export function captureRequestError(
  error: unknown,
  key: { query_key?: readonly unknown[]; mutation_key?: readonly unknown[] },
): void {
  if (shouldExcludeError(error)) return;
  analytics.captureException(toReportableError(error), {
    ...collectErrorContext(),
    source: 'react-query',
    ...(key.query_key && { query_key: keyName(key.query_key) }),
    ...(key.mutation_key && { mutation_key: keyName(key.mutation_key) }),
  });
}
