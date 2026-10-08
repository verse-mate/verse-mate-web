import type { CapturedNetworkRequest, CaptureResult } from 'posthog-js';

export const REPLAY_BLOCK_CLASS = 'ph-no-capture';

const URL_KEY = /(^\$?|_)(url|referrer)$/i;
const QUERY_PROPERTIES = ['search', '$search'];
const COACH_API = /\/coach\//;
const COACH_PATH = /\/coach((?:\/[^/?#\s"'<>\\]+)+)/g;
const COACH_WORDS = new Set([
  'admin',
  'affiliated-church',
  'amend',
  'attribute',
  'attribution',
  'bible-coach',
  'classes',
  'coaches',
  'coverage',
  'dimensions',
  'email',
  'feedback',
  'first-lesson',
  'improvements',
  'leader',
  'leaders',
  'manage',
  'me',
  'monthly',
  'monthly-summary',
  'not-teaching',
  'notes',
  'pipeline-failures',
  'recording',
  'recording-url',
  'release',
  'reports',
  'requeue',
  'reshares',
  'resolve',
  'review',
  'revision',
  'revisions',
  'rubric',
  'send',
  'sessions',
  'settings',
  'summary',
  'transcript-url',
  'trends',
  'zoom-link',
]);

export function stripQuery(url: string): string {
  return url.split(/[?#]/)[0];
}

export function scrubCoachPath(text: string): string {
  return text.replace(
    COACH_PATH,
    (_match, rest: string) => `/coach${rest.replace(/[^/]+/g, (segment) => (COACH_WORDS.has(segment) ? segment : ':id'))}`,
  );
}

function scrubValue(value: unknown, key = ''): unknown {
  if (typeof value === 'string') return scrubCoachPath(URL_KEY.test(key) ? stripQuery(value) : value);
  if (Array.isArray(value)) return value.map((v) => scrubValue(v));
  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, scrubValue(v, k)]));
  }
  return value;
}

function scrubProperties<T extends Record<string, unknown> | undefined>(props: T): T {
  if (!props) return props;
  const out = scrubValue(props) as Record<string, unknown>;
  for (const key of QUERY_PROPERTIES) delete out[key];
  return out as T;
}

export function scrubEvent(event: CaptureResult | null): CaptureResult | null {
  if (!event) return event;
  return {
    ...event,
    properties: scrubProperties(event.properties),
    ...(event.$set ? { $set: scrubProperties(event.$set) } : {}),
    ...(event.$set_once ? { $set_once: scrubProperties(event.$set_once) } : {}),
  };
}

export function scrubNetworkRequest(request: CapturedNetworkRequest): CapturedNetworkRequest {
  const name = scrubCoachPath(stripQuery(request.name ?? ''));
  return {
    ...request,
    name,
    ...(COACH_API.test(name) ? { requestBody: null, responseBody: null } : {}),
  };
}
