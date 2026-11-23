/**
 * What the VerseMate notetaker did for a class, in a coach's words: when it
 * records next, and how its latest run went ("Recording now", "Missed on Thu,
 * Nov 26: nobody let the bot in from the waiting room"). Shared by the coaching
 * dashboard's Sessions page and the admin class schedule.
 *
 * The notetaker sends instants (UTC ISO). Each is shown on the class's own
 * calendar, in its time zone, so "Thu, Dec 3 at 7:00 PM" matches the class's
 * "Thursdays at 7:00 PM (America/Chicago)" wherever the reader is.
 */

import type { ClassActivity, NotetakerActivity, NotetakerRun } from '@/services/coachService';

/** Run statuses that can still change, so a page showing one refreshes. */
export const LIVE_STATUSES = ['starting', 'joining', 'waiting_room', 'in_meeting', 'recording', 'recording_denied', 'processing'];

/** How often a page re-reads activity while a run is live. */
export const LIVE_REFRESH_MS = 30_000;

/** A run last heard of longer ago than this is stale, not live: the page
 *  stops refreshing for it instead of polling forever. */
const LIVE_FOR_MS = 6 * 60 * 60 * 1000;

/** The class's zone when the browser knows it, else the reader's own. */
function zoneOrLocal(timeZone: string | null | undefined): string | undefined {
  if (!timeZone) return undefined;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return timeZone;
  } catch {
    return undefined;
  }
}

function instant(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "Thu, Dec 3" on the class's calendar. */
export function classDay(iso: string | null | undefined, timeZone: string | null | undefined): string | null {
  const date = instant(iso);
  if (!date) return null;
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: zoneOrLocal(timeZone) });
}

/** "Thu, Dec 3 at 7:00 PM" on the class's calendar. */
export function classMoment(iso: string | null | undefined, timeZone: string | null | undefined): string | null {
  const date = instant(iso);
  if (!date) return null;
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: zoneOrLocal(timeZone) });
  return `${classDay(iso, timeZone)} at ${time}`;
}

/** "Next recording: Thu, Dec 3 at 7:00 PM", or null when nothing is booked. */
export function nextRecordingText(next: string | null | undefined, timeZone: string | null | undefined): string | null {
  const when = classMoment(next, timeZone);
  return when ? `Next recording: ${when}` : null;
}

const FAILURE_WORDS: Record<string, string> = {
  not_admitted: 'nobody let the bot in from the waiting room',
  recording_denied: 'recording wasn’t allowed',
  meeting_not_started: 'the meeting didn’t start',
  bot_error: 'something went wrong on our side',
};

const LIVE_WORDS: Record<string, string> = {
  starting: 'Joining…',
  joining: 'Joining…',
  waiting_room: 'Waiting in the waiting room: let VerseMate Coaching in',
  in_meeting: 'In the meeting, about to record',
  recording: 'Recording now',
  recording_denied: 'In the meeting: allow VerseMate Coaching to record',
  processing: 'Processing the recording',
};

/** How a run reads: good (recorded or recording), waiting on someone (let it
 *  in, allow recording), missed, or simply in progress. */
export type RunTone = 'good' | 'waiting' | 'missed' | 'progress';

export interface RunLine {
  text: string;
  tone: RunTone;
  live: boolean;
}

/** One run in a coach's words, or null for a status this page does not know. */
export function runLine(run: NotetakerRun, timeZone: string | null | undefined): RunLine | null {
  const day = classDay(run.start ?? run.updatedAt, timeZone);
  if (run.status === 'recorded') return { text: day ? `Recorded on ${day}` : 'Recorded', tone: 'good', live: false };
  if (run.status === 'failed') {
    const missed = day ? `Missed on ${day}` : 'Missed';
    const why = FAILURE_WORDS[run.reason ?? ''];
    return { text: why ? `${missed}: ${why}` : missed, tone: 'missed', live: false };
  }
  const words = LIVE_WORDS[run.status];
  if (!words) return null;
  const tone: RunTone = run.status === 'recording' ? 'good' : run.status === 'waiting_room' || run.status === 'recording_denied' ? 'waiting' : 'progress';
  return { text: words, tone, live: true };
}

/** What a class card shows: the next recording, the latest run and the runs
 *  before it (for a small "earlier" list). */
export function classActivityLines(
  activity: ClassActivity | undefined,
  timeZone: string | null | undefined,
): { next: string | null; latest: RunLine | null; earlier: RunLine[] } {
  const runs = (activity?.recent ?? []).map((r) => runLine(r, timeZone)).filter((l): l is RunLine => l !== null);
  return { next: nextRecordingText(activity?.next, timeZone), latest: runs[0] ?? null, earlier: runs.slice(1) };
}

/** True while some class's latest run is live and was heard of recently. */
export function activityIsLive(data: NotetakerActivity | undefined, now: number = Date.now()): boolean {
  return Object.values(data?.classes ?? {}).some((c) => {
    const latest = c.recent?.[0];
    if (!latest || !LIVE_STATUSES.includes(latest.status)) return false;
    const heard = instant(latest.updatedAt ?? latest.start)?.getTime();
    return heard === undefined || now - heard < LIVE_FOR_MS;
  });
}

/** React Query's `refetchInterval` for activity: every 30 s while a run is
 *  live, otherwise no polling. */
export function activityRefreshMs(data: NotetakerActivity | undefined, now: number = Date.now()): number | false {
  return activityIsLive(data, now) ? LIVE_REFRESH_MS : false;
}
