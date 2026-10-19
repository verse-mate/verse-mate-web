/**
 * A class's schedule in plain words, shared by the leader's Class Setup and the
 * admin class schedule: when it meets, whether the VerseMate notetaker can join
 * it, what to say about its link, and the time-zone choices.
 *
 * Dates are calendar dates (yyyy-mm-dd) and times are the wall-clock HH:MM the
 * leader typed, in the class's own zone. Nothing here converts between zones:
 * "7:00 PM (America/Chicago)" reads the same wherever the reader is.
 */

import { CoachApiError, type CoachClass, type CoachClassInput, type CoachClassRecurrence } from '@/services/coachService';

export const RECURRENCE_OPTIONS: { value: CoachClassRecurrence; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every other week' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'daily', label: 'Daily' },
  { value: 'none', label: 'One-time (no repeat)' },
];

export function isRecurrence(value: string | null | undefined): value is CoachClassRecurrence {
  return RECURRENCE_OPTIONS.some((o) => o.value === value);
}

/** What `classWhen` reads. A Zoom meeting's recurrence is any string. */
export interface ClassSchedule {
  classDate: string | null;
  recurrence: string;
  startTime: string | null;
  timeZone: string | null;
}

/** A yyyy-mm-dd as a local calendar date, so the day never shifts with the
 *  reader's zone. Null for anything else. */
function calendarDate(iso: string | null): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  if (!m) return null;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "19:05" → "7:05 PM". Anything that is not HH:MM comes back unchanged. */
export function formatClockTime(hhmm: string): string {
  const m = /^(\d{1,2}):(\d{2})/.exec(hhmm);
  if (!m) return hhmm;
  const hour = Number(m[1]);
  return `${hour % 12 || 12}:${m[2]} ${hour < 12 ? 'AM' : 'PM'}`;
}

function ordinal(n: number): string {
  const teen = n % 100 >= 11 && n % 100 <= 13;
  const suffix = teen ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${suffix}`;
}

/**
 * When a class meets, e.g. "Thursdays at 7:00 PM (America/Chicago)", "Every
 * other Thursday at …", "Monthly on the 22nd at …", "Once on Thu, Oct 22 at …".
 * The weekday and day of the month come from the class date, as the notetaker
 * takes them. A one-time class names its year only when it is not this one.
 */
export function classWhen(s: ClassSchedule, today: Date = new Date()): string {
  const date = calendarDate(s.classDate);
  const at = s.startTime ? ` at ${formatClockTime(s.startTime)}${s.timeZone ? ` (${s.timeZone})` : ''}` : '';
  const weekday = date?.toLocaleDateString('en-US', { weekday: 'long' });
  switch (s.recurrence) {
    case 'weekly':
      return `${weekday ? `${weekday}s` : 'Weekly'}${at}`;
    case 'biweekly':
      return `${weekday ? `Every other ${weekday}` : 'Every other week'}${at}`;
    case 'monthly':
      return `${date ? `Monthly on the ${ordinal(date.getDate())}` : 'Monthly'}${at}`;
    case 'daily':
      return `Daily${at}`;
    default: {
      if (!date) return `One time, no date set${at}`;
      const day = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        ...(date.getFullYear() === today.getFullYear() ? {} : { year: 'numeric' }),
      });
      return `Once on ${day}${at}`;
    }
  }
}

function parseUrl(link: string): URL | null {
  try {
    const url = new URL(link.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

/** True for a zoom.us link on any subdomain (us02web.zoom.us, …). */
export function isZoomLink(link: string): boolean {
  const host = parseUrl(link)?.hostname.toLowerCase();
  return !!host && (host === 'zoom.us' || host.endsWith('.zoom.us'));
}

/**
 * What to say under a meeting link: a Zoom link without its passcode may leave
 * the notetaker at the passcode prompt, and the notetaker joins Zoom only.
 * Null when there is nothing to say (no link yet, a malformed one, or a Zoom
 * link that carries `pwd=`).
 */
export function zoomLinkHint(link: string): 'passcode' | 'not-zoom' | null {
  const url = parseUrl(link);
  if (!url) return null;
  if (!isZoomLink(link)) return 'not-zoom';
  return url.searchParams.has('pwd') ? null : 'passcode';
}

/** The words for `zoomLinkHint`, or null when there is nothing to say. */
export function zoomLinkHintText(link: string): string | null {
  switch (zoomLinkHint(link)) {
    case 'passcode':
      return 'If your meeting has a passcode, paste the invite link that includes it (…?pwd=…).';
    case 'not-zoom':
      return 'The notetaker joins Zoom meetings only for now.';
    default:
      return null;
  }
}

export type NotetakerState =
  | { kind: 'off' }
  | { kind: 'ready' }
  | { kind: 'not-zoom' }
  | { kind: 'incomplete'; missing: string[] };

/** Whether the notetaker can join a class, and if not, what is missing. */
export function notetakerState(
  cls: Pick<CoachClass, 'zoomLink' | 'classDate' | 'startTime' | 'timeZone'> & { notetaker?: boolean },
): NotetakerState {
  if (cls.notetaker === false) return { kind: 'off' };
  const missing = [
    !cls.zoomLink?.trim() && 'meeting link',
    !cls.classDate && 'date',
    !cls.startTime && 'start time',
    !cls.timeZone && 'time zone',
  ].filter((m): m is string => Boolean(m));
  if (missing.length > 0) return { kind: 'incomplete', missing };
  return isZoomLink(cls.zoomLink) ? { kind: 'ready' } : { kind: 'not-zoom' };
}

function listInWords(items: string[]): string {
  return items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export function notetakerText(state: NotetakerState): string {
  switch (state.kind) {
    case 'off':
      return 'Notetaker off';
    case 'ready':
      return 'Notetaker records this class';
    case 'not-zoom':
      return 'The notetaker joins Zoom meetings only for now';
    case 'incomplete':
      return `Add the ${listInWords(state.missing)} so the notetaker can join`;
  }
}

/** What the "Connect your Zoom account" card says, on Class Setup and on the
 *  coaching dashboard's Sessions page alike. */
export const NOTETAKER_CONNECT = {
  title: 'Connect your Zoom account (recommended)',
  why: 'Connect once, and the notetaker joins your classes as your guest. It skips the waiting room and records without anyone clicking “Allow”.',
  without: 'Without it, the notetaker still joins from your meeting link, but the host has to admit it and allow recording.',
  explainerUrl: 'https://versemate.org/coach/notetaker',
} as const;

export function zoomConnectedText(zoomEmail: string | null): string {
  return zoomEmail ? `Zoom connected as ${zoomEmail}` : 'Zoom connected';
}

/** A failed class save in words. A 400 or 404 names what the server refused
 *  ("Choose the time zone the start time is in", "Leader not found"), which
 *  says more than "check the fields". */
export function classSaveProblem(err: unknown, what: string): string {
  return err instanceof CoachApiError && (err.status === 400 || err.status === 404) && err.serverMessage
    ? `${what}: ${err.serverMessage}`
    : `${what} — check the fields and try again`;
}

// ─── Time zones ────────────────────────────────────────────────────────────

/** Listed first: where the program's leaders are. */
export const COMMON_TIME_ZONES: { value: string; label: string }[] = [
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Phoenix', label: 'Arizona' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'America/Anchorage', label: 'Alaska' },
  { value: 'Pacific/Honolulu', label: 'Hawaii' },
];

/** The reader's own zone, or '' when the browser does not say. */
export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    return '';
  }
}

/** Every zone the browser knows (`Intl.supportedValuesOf`, newer than this
 *  app's lib target, so read defensively). Empty when it cannot say. */
function supportedTimeZones(): string[] {
  const intl = Intl as unknown as { supportedValuesOf?: (key: 'timeZone') => string[] };
  try {
    return intl.supportedValuesOf?.('timeZone') ?? [];
  } catch {
    return [];
  }
}

/** The zones after the common ones, sorted: every zone the browser knows,
 *  plus the browser's own and any `keep` (a saved zone this browser does not
 *  list), never repeating a common one. */
export function otherTimeZones(...keep: (string | null | undefined)[]): string[] {
  const common = new Set(COMMON_TIME_ZONES.map((z) => z.value));
  const all = new Set([...supportedTimeZones(), browserTimeZone(), ...keep]);
  return [...all].filter((z): z is string => !!z && !common.has(z)).sort();
}

export function timeZoneLabel(zone: string): string {
  const common = COMMON_TIME_ZONES.find((z) => z.value === zone);
  return common ? `${common.label} (${zone})` : zone.replace(/_/g, ' ');
}

// ─── Form values ───────────────────────────────────────────────────────────

/** The add / edit form's fields, every one a plain value. */
export interface ClassDraft {
  name: string;
  classDate: string;
  recurrence: CoachClassRecurrence;
  zoomLink: string;
  startTime: string;
  timeZone: string;
  notetaker: boolean;
}

/** A form's starting values from a class, a Zoom meeting or nothing: a new
 *  class repeats weekly in the reader's zone with the notetaker on. */
export function classDraft(
  from: Partial<Omit<ClassSchedule, 'recurrence'>> & {
    name?: string;
    zoomLink?: string;
    recurrence?: string;
    notetaker?: boolean;
  } = {},
): ClassDraft {
  return {
    name: from.name ?? '',
    classDate: from.classDate ?? '',
    recurrence: isRecurrence(from.recurrence) ? from.recurrence : 'weekly',
    zoomLink: from.zoomLink ?? '',
    startTime: from.startTime ?? '',
    timeZone: from.timeZone || browserTimeZone(),
    notetaker: from.notetaker !== false,
  };
}

/** What keeps a draft from saving: it needs a name, a well-formed link (or
 *  none yet), and a zone for any start time, as the server does. */
export function draftProblems(d: ClassDraft): { nameEmpty: boolean; linkInvalid: boolean; zoneMissing: boolean } {
  return {
    nameEmpty: d.name.trim() === '',
    linkInvalid: d.zoomLink.trim() !== '' && !/^https?:\/\/\S+$/i.test(d.zoomLink.trim()),
    zoneMissing: d.startTime.trim() !== '' && d.timeZone.trim() === '',
  };
}

/** The request body for a draft, trimmed. */
export function classInput(d: ClassDraft): CoachClassInput {
  return {
    name: d.name.trim(),
    classDate: d.classDate.trim(),
    recurrence: d.recurrence,
    zoomLink: d.zoomLink.trim(),
    startTime: d.startTime.trim().slice(0, 5),
    timeZone: d.timeZone.trim(),
    notetaker: d.notetaker,
  };
}
