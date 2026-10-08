import { describe, expect, it } from 'vitest';

import { scrubEvent, scrubNetworkRequest, stripQuery } from './analyticsPrivacy';

describe('what reaches analytics', () => {
  it('drops the query and fragment from a URL', () => {
    expect(stripQuery('https://app.test/coach?s=report-1&leader=l1#top')).toBe('https://app.test/coach');
    expect(stripQuery('/coach/leader/l1?s=r')).toBe('/coach/leader/l1');
    expect(stripQuery('not a url?x=1')).toBe('not a url');
  });

  it('scrubs every URL property an event carries', () => {
    const out = scrubEvent({
      uuid: 'u',
      event: '$pageview',
      properties: {
        $current_url: 'https://app.test/coach?s=report-1',
        $referrer: 'https://mail.test/?leader=l1',
        $pathname: '/coach',
        search: '?s=report-1',
        other: 'kept',
      },
      $set_once: { $initial_current_url: 'https://app.test/coach?s=r0' },
    });
    expect(out?.properties).toEqual({
      $current_url: 'https://app.test/coach',
      $referrer: 'https://mail.test/',
      $pathname: '/coach',
      other: 'kept',
    });
    expect(out?.$set_once).toEqual({ $initial_current_url: 'https://app.test/coach' });
  });

  it('never lets a signed recording address into a replay network entry', () => {
    const out = scrubNetworkRequest({
      name: 'https://storage.test/rec.mp4?X-Amz-Signature=abc',
      entryType: 'resource',
      startTime: 0,
      duration: 1,
    });
    expect(out?.name).toBe('https://storage.test/rec.mp4');
  });

  it('drops the body of a recording mint from a replay network entry', () => {
    const out = scrubNetworkRequest({
      name: 'https://api.test/coach/reports/r1/recording-url',
      entryType: 'resource',
      startTime: 0,
      duration: 1,
      responseBody: '{"url":"https://storage.test/rec.mp4?sig=1"}',
    });
    expect(out?.responseBody).toBeNull();
  });

  it('drops both bodies of every coach admin request from a replay network entry', () => {
    const out = scrubNetworkRequest({
      name: 'https://api.test/coach/admin/leaders/wyatt-wellington/email',
      entryType: 'resource',
      startTime: 0,
      duration: 1,
      requestBody: '{"email":"wyatt@example.test"}',
      responseBody: '{"email":"wyatt@example.test"}',
    });
    expect(out?.requestBody).toBeNull();
    expect(out?.responseBody).toBeNull();
  });

  it.each([
    'https://api.test/coach/reports/r1',
    'https://api.test/coach/reports/summary?limit=50&offset=0',
    'https://api.test/coach/trends',
    'https://api.test/coach/monthly-summary?month=2026-08',
  ])('drops both bodies of a leader-facing coach request (%s) from a replay network entry', (name) => {
    const out = scrubNetworkRequest({
      name,
      entryType: 'resource',
      startTime: 0,
      duration: 1,
      requestBody: '{"note":"x"}',
      responseBody: '{"report":{"feedback":{"headline":"private"}}}',
    });
    expect(out?.requestBody).toBeNull();
    expect(out?.responseBody).toBeNull();
  });

  it('keeps the bodies of a request outside the coach API', () => {
    const out = scrubNetworkRequest({
      name: 'https://api.test/bible/books',
      entryType: 'resource',
      startTime: 0,
      duration: 1,
      responseBody: '{"books":[]}',
    });
    expect(out?.responseBody).toBe('{"books":[]}');
  });

  it.each([
    ['amend', 'https://api.test/coach/admin/reports/r1/amend', '{"dimensions":[{"n":5,"rationale":"private"}]}', '{"applied":true}'],
    ['first lesson', 'https://api.test/coach/admin/reports/r1/first-lesson', '{"rationale":"private"}', '{"applied":true}'],
    ['review', 'https://api.test/coach/admin/reports/r1/review', '', '{"dimensions":[{"rationale":"private"}]}'],
    ['kept versions', 'https://api.test/coach/admin/reports/r1/revisions', '', '{"revisions":[{"amendedBy":"admin@example.test"}]}'],
    ['revision send', 'https://api.test/coach/admin/reports/r1/revision/send', '', '{"sends":[{"email":"leader@example.test"}]}'],
    ['assignment', 'https://api.test/coach/admin/sessions/ff-4/attribute', '{"coachId":"amy-lee"}', '{"coachId":"amy-lee"}'],
    ['keywords and addresses', 'https://api.test/coach/admin/leaders/amy-lee/attribution', '{"altEmails":["amy@example.test"]}', '{"altEmails":["amy@example.test"]}'],
    ['leader address', 'https://api.test/coach/admin/leaders/amy-lee/email', '{"email":"amy@example.test"}', '{"email":"amy@example.test"}'],
    ['note', 'https://api.test/coach/admin/coaches/amy-lee/reports/r1/notes', '{"body":"private"}', '{"note":{"body":"private"}}'],
  ])('drops both bodies of the %s request from a replay network entry', (_name, name, requestBody, responseBody) => {
    const out = scrubNetworkRequest({ name, entryType: 'resource', startTime: 0, duration: 1, requestBody, responseBody });
    expect(out?.requestBody).toBeNull();
    expect(out?.responseBody).toBeNull();
  });
});
