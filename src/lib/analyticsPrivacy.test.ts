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
});
