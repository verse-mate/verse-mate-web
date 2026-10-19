import { describe, expect, it } from 'vitest';
import { CoachApiError } from '@/services/coachService';
import {
  COMMON_TIME_ZONES,
  browserTimeZone,
  classDraft,
  classInput,
  classSaveProblem,
  classWhen,
  draftProblems,
  formatClockTime,
  notetakerState,
  notetakerText,
  otherTimeZones,
  timeZoneLabel,
  zoomConnectedText,
  zoomLinkHint,
  zoomLinkHintText,
  type ClassSchedule,
} from './coachClassSchedule';

const TODAY = new Date(2026, 9, 19);

const when = (over: Partial<ClassSchedule>) =>
  classWhen({ classDate: '2026-10-22', recurrence: 'weekly', startTime: '19:00', timeZone: 'America/Chicago', ...over }, TODAY);

const ready = {
  zoomLink: 'https://us02web.zoom.us/j/123?pwd=abc',
  classDate: '2026-10-22',
  startTime: '19:00',
  timeZone: 'America/Chicago',
  notetaker: true,
};

describe('formatClockTime', () => {
  it('reads a 24-hour time on a 12-hour clock', () => {
    expect(formatClockTime('19:00')).toBe('7:00 PM');
    expect(formatClockTime('00:05')).toBe('12:05 AM');
    expect(formatClockTime('12:30')).toBe('12:30 PM');
    expect(formatClockTime('09:15')).toBe('9:15 AM');
  });

  it('hands back what it cannot read', () => {
    expect(formatClockTime('soon')).toBe('soon');
  });
});

describe('classWhen', () => {
  it('names the weekday a weekly class keeps from its date', () => {
    expect(when({})).toBe('Thursdays at 7:00 PM (America/Chicago)');
    expect(when({ recurrence: 'biweekly' })).toBe('Every other Thursday at 7:00 PM (America/Chicago)');
  });

  it('names the day of the month a monthly class keeps', () => {
    expect(when({ recurrence: 'monthly' })).toBe('Monthly on the 22nd at 7:00 PM (America/Chicago)');
    expect(when({ recurrence: 'monthly', classDate: '2026-11-01' })).toMatch(/^Monthly on the 1st /);
    expect(when({ recurrence: 'monthly', classDate: '2026-11-03' })).toMatch(/^Monthly on the 3rd /);
    expect(when({ recurrence: 'monthly', classDate: '2026-11-11' })).toMatch(/^Monthly on the 11th /);
    expect(when({ recurrence: 'monthly', classDate: '2026-11-13' })).toMatch(/^Monthly on the 13th /);
    expect(when({ recurrence: 'monthly', classDate: '2026-12-31' })).toMatch(/^Monthly on the 31st /);
  });

  it('says a one-time class once, with the year only when it is not this one', () => {
    expect(when({ recurrence: 'none' })).toBe('Once on Thu, Oct 22 at 7:00 PM (America/Chicago)');
    expect(when({ recurrence: 'none', classDate: '2027-01-07' })).toBe('Once on Thu, Jan 7, 2027 at 7:00 PM (America/Chicago)');
    expect(when({ recurrence: 'daily' })).toBe('Daily at 7:00 PM (America/Chicago)');
  });

  it('says only what is set', () => {
    expect(when({ classDate: null })).toBe('Weekly at 7:00 PM (America/Chicago)');
    expect(when({ startTime: null })).toBe('Thursdays');
    expect(when({ timeZone: null })).toBe('Thursdays at 7:00 PM');
    expect(when({ recurrence: 'none', classDate: null, startTime: null })).toBe('One time, no date set');
  });

  it('reads a Zoom recurrence it does not know as one time', () => {
    expect(when({ recurrence: 'yearly' })).toBe('Once on Thu, Oct 22 at 7:00 PM (America/Chicago)');
  });
});

describe('notetakerState', () => {
  it('records a Zoom class with its date, time and zone', () => {
    expect(notetakerState(ready)).toEqual({ kind: 'ready' });
    expect(notetakerText(notetakerState(ready))).toBe('Notetaker records this class');
  });

  it('stays out when the leader turned it off, whatever is missing', () => {
    const off = notetakerState({ ...ready, notetaker: false, startTime: null });
    expect(off).toEqual({ kind: 'off' });
    expect(notetakerText(off)).toBe('Notetaker off');
  });

  it('names everything the notetaker still needs', () => {
    const state = notetakerState({ ...ready, classDate: null, startTime: null, timeZone: null });
    expect(notetakerText(state)).toBe('Add the date, start time and time zone so the notetaker can join');
    expect(notetakerText(notetakerState({ ...ready, startTime: null }))).toBe('Add the start time so the notetaker can join');
    expect(notetakerText(notetakerState({ ...ready, zoomLink: ' ', timeZone: null }))).toBe(
      'Add the meeting link and time zone so the notetaker can join',
    );
  });

  it('says a meeting that is not on Zoom is out of its reach', () => {
    const state = notetakerState({ ...ready, zoomLink: 'https://meet.google.com/abc' });
    expect(notetakerText(state)).toBe('The notetaker joins Zoom meetings only for now');
  });
});

describe('zoomLinkHint', () => {
  it('asks for the passcode link when a Zoom link has none', () => {
    expect(zoomLinkHint('https://zoom.us/j/123')).toBe('passcode');
    expect(zoomLinkHint('https://us06web.zoom.us/j/123?from=addon')).toBe('passcode');
    expect(zoomLinkHint('https://us06web.zoom.us/j/123?pwd=abc')).toBeNull();
  });

  it('notes the notetaker joins Zoom only', () => {
    expect(zoomLinkHint('https://meet.google.com/abc')).toBe('not-zoom');
    expect(zoomLinkHint('https://notzoom.us.example.com/j/1')).toBe('not-zoom');
  });

  it('says nothing about no link or a malformed one', () => {
    expect(zoomLinkHint('')).toBeNull();
    expect(zoomLinkHint('zoom.us/j/123')).toBeNull();
  });

  it('puts each hint in words', () => {
    expect(zoomLinkHintText('https://zoom.us/j/123')).toBe(
      'If your meeting has a passcode, paste the invite link that includes it (…?pwd=…).',
    );
    expect(zoomLinkHintText('https://meet.google.com/abc')).toBe('The notetaker joins Zoom meetings only for now.');
    expect(zoomLinkHintText('https://zoom.us/j/123?pwd=abc')).toBeNull();
  });
});

describe('words for the page', () => {
  it('names the connected Zoom account when it is known', () => {
    expect(zoomConnectedText('jeff@zoom.example')).toBe('Zoom connected as jeff@zoom.example');
    expect(zoomConnectedText(null)).toBe('Zoom connected');
  });

  it('passes on what the server refused, and asks to check the fields otherwise', () => {
    expect(classSaveProblem(new CoachApiError('classes', 400, 'Choose the time zone the start time is in'), 'Could not add the class')).toBe(
      'Could not add the class: Choose the time zone the start time is in',
    );
    expect(classSaveProblem(new CoachApiError('admin/classes', 404, 'Leader not found'), 'Could not add the class')).toBe(
      'Could not add the class: Leader not found',
    );
    expect(classSaveProblem(new CoachApiError('classes', 500, 'boom'), 'Could not save the class')).toBe(
      'Could not save the class — check the fields and try again',
    );
    expect(classSaveProblem(new Error('offline'), 'Could not save the class')).toBe('Could not save the class — check the fields and try again');
  });
});

describe('time zones', () => {
  it('lists the common zones apart, and every other zone once, sorted', () => {
    const others = otherTimeZones('America/Chicago', 'Mars/Olympus_Mons');
    for (const z of COMMON_TIME_ZONES) expect(others).not.toContain(z.value);
    expect(others).toContain('Mars/Olympus_Mons');
    expect(new Set(others).size).toBe(others.length);
    expect([...others].sort()).toEqual(others);
    if (browserTimeZone() && !COMMON_TIME_ZONES.some((z) => z.value === browserTimeZone())) {
      expect(others).toContain(browserTimeZone());
    }
  });

  it('labels a common zone by its name and any other by its place', () => {
    expect(timeZoneLabel('America/Chicago')).toBe('Central Time (America/Chicago)');
    expect(timeZoneLabel('America/Argentina/Buenos_Aires')).toBe('America/Argentina/Buenos Aires');
  });
});

describe('classDraft', () => {
  it('starts a new class weekly, in the reader’s zone, with the notetaker on', () => {
    expect(classDraft()).toEqual({
      name: '',
      classDate: '',
      recurrence: 'weekly',
      zoomLink: '',
      startTime: '',
      timeZone: browserTimeZone(),
      notetaker: true,
    });
  });

  it('keeps a saved class as it is, and fills only its missing zone', () => {
    const draft = classDraft({ name: 'James', classDate: '2026-10-22', recurrence: 'none', zoomLink: 'https://zoom.us/j/1', startTime: null, timeZone: null, notetaker: false });
    expect(draft).toMatchObject({ name: 'James', classDate: '2026-10-22', recurrence: 'none', startTime: '', timeZone: browserTimeZone(), notetaker: false });
  });

  it('needs a name, a well-formed link and a zone for any start time', () => {
    const ok = { ...classDraft(), name: 'James', zoomLink: 'https://zoom.us/j/1', startTime: '19:00', timeZone: 'America/Chicago' };
    expect(draftProblems(ok)).toEqual({ nameEmpty: false, linkInvalid: false, zoneMissing: false });
    expect(draftProblems({ ...ok, name: ' ' }).nameEmpty).toBe(true);
    expect(draftProblems({ ...ok, zoomLink: 'zoom.us/j/1' }).linkInvalid).toBe(true);
    expect(draftProblems({ ...ok, zoomLink: '' }).linkInvalid).toBe(false);
    expect(draftProblems({ ...ok, timeZone: '' }).zoneMissing).toBe(true);
    expect(draftProblems({ ...ok, timeZone: '', startTime: '' }).zoneMissing).toBe(false);
  });

  it('sends a trimmed body', () => {
    const body = classInput({ ...classDraft(), name: ' James ', zoomLink: ' https://zoom.us/j/1 ', startTime: '19:00', timeZone: 'America/Chicago' });
    expect(body).toEqual({
      name: 'James',
      classDate: '',
      recurrence: 'weekly',
      zoomLink: 'https://zoom.us/j/1',
      startTime: '19:00',
      timeZone: 'America/Chicago',
      notetaker: true,
    });
  });
});
