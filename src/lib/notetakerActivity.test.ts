import { describe, expect, it } from 'vitest';
import {
  LIVE_REFRESH_MS,
  activityIsLive,
  activityRefreshMs,
  classActivityLines,
  classMoment,
  nextRecordingText,
  runLine,
} from './notetakerActivity';
import type { NotetakerActivity, NotetakerRun } from '@/services/coachService';

const CHICAGO = 'America/Chicago';
// Thu, Nov 26 2026, 7:00 PM in Chicago (CST, UTC-6).
const THU_7PM = '2026-11-27T01:00:00+00:00';

const run = (over: Partial<NotetakerRun>): NotetakerRun => ({ start: THU_7PM, status: 'recorded', reason: null, updatedAt: THU_7PM, ...over });

describe('when the notetaker records next', () => {
  it('reads the instant on the class’s own calendar', () => {
    expect(nextRecordingText('2026-12-04T01:00+00:00', CHICAGO)).toBe('Next recording: Thu, Dec 3 at 7:00 PM');
    expect(classMoment('2026-12-04T01:00+00:00', 'Europe/Bucharest')).toBe('Fri, Dec 4 at 3:00 AM');
  });

  it('says nothing when nothing is booked or the instant is unreadable', () => {
    expect(nextRecordingText(null, CHICAGO)).toBeNull();
    expect(nextRecordingText('soon', CHICAGO)).toBeNull();
  });

  it('falls back to the reader’s zone for a zone this browser does not know', () => {
    expect(classMoment(THU_7PM, 'Mars/Olympus_Mons')).toBe(classMoment(THU_7PM, null));
  });
});

describe('a run in a coach’s words', () => {
  it('says what is happening while the bot is in a class', () => {
    const words = (status: string) => runLine(run({ status }), CHICAGO);
    expect(words('starting')).toEqual({ text: 'Joining…', tone: 'progress', live: true });
    expect(words('joining')).toEqual({ text: 'Joining…', tone: 'progress', live: true });
    expect(words('waiting_room')).toEqual({ text: 'Waiting in the waiting room: let VerseMate Coach in', tone: 'waiting', live: true });
    expect(words('in_meeting')).toEqual({ text: 'In the meeting, about to record', tone: 'progress', live: true });
    expect(words('recording')).toEqual({ text: 'Recording now', tone: 'good', live: true });
    expect(words('recording_denied')).toEqual({ text: 'In the meeting: allow VerseMate Coach to record', tone: 'waiting', live: true });
    expect(words('processing')).toEqual({ text: 'Processing the recording', tone: 'progress', live: true });
  });

  it('dates a finished run on the class’s calendar', () => {
    expect(runLine(run({ status: 'recorded' }), CHICAGO)).toEqual({ text: 'Recorded on Thu, Nov 26', tone: 'good', live: false });
    // The same instant is already Friday in Bucharest.
    expect(runLine(run({ status: 'recorded' }), 'Europe/Bucharest')?.text).toBe('Recorded on Fri, Nov 27');
  });

  it('says why a run was missed', () => {
    const missed = (reason: string | null) => runLine(run({ status: 'failed', reason }), CHICAGO)?.text;
    expect(missed('not_admitted')).toBe('Missed on Thu, Nov 26: nobody let the bot in from the waiting room');
    expect(missed('recording_denied')).toBe('Missed on Thu, Nov 26: recording wasn’t allowed');
    expect(missed('meeting_not_started')).toBe('Missed on Thu, Nov 26: the meeting didn’t start');
    expect(missed('bot_error')).toBe('Missed on Thu, Nov 26: something went wrong on our side');
    expect(missed(null)).toBe('Missed on Thu, Nov 26');
    expect(missed('a reason from a newer notetaker')).toBe('Missed on Thu, Nov 26');
    expect(runLine(run({ status: 'failed', reason: 'bot_error' }), CHICAGO)?.tone).toBe('missed');
  });

  it('uses the last update when a run has no start, and no date when it has neither', () => {
    expect(runLine(run({ start: null, status: 'recorded' }), CHICAGO)?.text).toBe('Recorded on Thu, Nov 26');
    expect(runLine(run({ start: null, updatedAt: null, status: 'recorded' }), CHICAGO)?.text).toBe('Recorded');
    expect(runLine(run({ start: null, updatedAt: null, status: 'failed', reason: 'not_admitted' }), CHICAGO)?.text).toBe(
      'Missed: nobody let the bot in from the waiting room',
    );
  });

  it('shows nothing for a status this page does not know', () => {
    expect(runLine(run({ status: 'teleporting' }), CHICAGO)).toBeNull();
  });
});

describe('a class’s activity', () => {
  it('gives the next recording, the latest run and the runs before it', () => {
    const lines = classActivityLines(
      {
        next: '2026-12-04T01:00+00:00',
        recent: [
          run({ status: 'recording', start: '2026-12-04T01:00+00:00' }),
          run({ status: 'teleporting' }),
          run({ status: 'failed', reason: 'not_admitted', start: '2026-11-20T01:00+00:00' }),
        ],
      },
      CHICAGO,
    );
    expect(lines.next).toBe('Next recording: Thu, Dec 3 at 7:00 PM');
    expect(lines.latest?.text).toBe('Recording now');
    expect(lines.earlier.map((l) => l.text)).toEqual(['Missed on Thu, Nov 19: nobody let the bot in from the waiting room']);
  });

  it('has nothing to say about a class the notetaker has no word on', () => {
    expect(classActivityLines(undefined, CHICAGO)).toEqual({ next: null, latest: null, earlier: [] });
  });
});

describe('refreshing while a run is live', () => {
  const NOW = Date.parse('2026-12-04T01:30:00Z');
  const of = (...latest: NotetakerRun[]): NotetakerActivity => ({
    available: true,
    classes: Object.fromEntries(latest.map((r, i) => [`c${i}`, { next: null, recent: [r] }])),
  });

  it('re-reads every 30 s while a class’s latest run is live', () => {
    const live = of(run({ status: 'recorded' }), run({ status: 'waiting_room', updatedAt: '2026-12-04T01:29:00Z' }));
    expect(activityIsLive(live, NOW)).toBe(true);
    expect(activityRefreshMs(live, NOW)).toBe(LIVE_REFRESH_MS);
  });

  it('does not poll when every latest run is finished, or nothing has run', () => {
    expect(activityRefreshMs(of(run({ status: 'recorded' }), run({ status: 'failed', reason: 'bot_error' })), NOW)).toBe(false);
    expect(activityRefreshMs({ available: true, classes: { c1: { next: null, recent: [] } } }, NOW)).toBe(false);
    expect(activityRefreshMs({ available: false, classes: {} }, NOW)).toBe(false);
    expect(activityRefreshMs(undefined, NOW)).toBe(false);
  });

  it('stops for a run that was live hours ago and never heard of again', () => {
    expect(activityRefreshMs(of(run({ status: 'recording', updatedAt: '2026-12-03T12:00:00Z' })), NOW)).toBe(false);
  });

  it('only the latest run of a class counts', () => {
    const activity: NotetakerActivity = {
      available: true,
      classes: { c1: { next: null, recent: [run({ status: 'recorded' }), run({ status: 'recording', updatedAt: '2026-12-04T01:29:00Z' })] } },
    };
    expect(activityIsLive(activity, NOW)).toBe(false);
  });
});
