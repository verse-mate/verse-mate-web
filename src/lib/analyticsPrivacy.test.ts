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
      name: 'https://api.test/coach/admin/leaders/leader-e/email',
      entryType: 'resource',
      startTime: 0,
      duration: 1,
      requestBody: '{"email":"leader-e@example.test"}',
      responseBody: '{"email":"leader-e@example.test"}',
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

  it.each([
    ['sign-in', 'https://api.test/auth/login', '{"email":"reader@example.test","password":"pw-secret"}', '{"accessToken":"at-secret"}'],
    ['token refresh', 'https://api.test/auth/refresh', '{"refreshToken":"rt-secret"}', '{"accessToken":"at-secret"}'],
    ['bible', 'https://api.test/bible/books', '', '{"books":[]}'],
  ])('drops both bodies of a %s request outside the coach API from a replay network entry', (_name, name, requestBody, responseBody) => {
    const out = scrubNetworkRequest({ name, entryType: 'resource', startTime: 0, duration: 1, requestBody, responseBody });
    expect(out?.requestBody).toBeNull();
    expect(out?.responseBody).toBeNull();
  });

  it('strips queries from link addresses and link text an autocaptured click carries', () => {
    const out = scrubEvent({
      uuid: 'u',
      event: '$autocapture',
      properties: {
        $elements_chain: 'a:attr__href="/notes?s=n-secret"href="/notes?s=n-secret"text="https://zoom.test/j/1?pwd=p-secret"nth-child="1"',
        $elements: [{ tag_name: 'a', attr__href: 'https://zoom.test/j/1?pwd=p-secret' }],
        $el_text: 'Join https://zoom.test/j/1?pwd=p-secret now',
        $external_click_url: 'https://zoom.test/j/1?pwd=p-secret',
        page_href: '/notes?s=n-secret',
      },
    });
    expect(out?.properties).toEqual({
      $elements_chain: 'a:attr__href="/notes"href="/notes"text="https://zoom.test/j/1"nth-child="1"',
      $elements: [{ tag_name: 'a', attr__href: 'https://zoom.test/j/1' }],
      $el_text: 'Join https://zoom.test/j/1 now',
      $external_click_url: 'https://zoom.test/j/1',
      page_href: '/notes',
    });
  });

  it('keeps the punctuation around a link whose query it strips', () => {
    const out = scrubEvent({
      uuid: 'u',
      event: 'x',
      properties: { note: 'See https://a.test/x?y=1, then (https://b.test/z?q=2). Frame (https://app.test/a.js?v=1:2:3)' },
    });
    expect(out?.properties.note).toBe('See https://a.test/x then (https://b.test/z). Frame (https://app.test/a.js)');
  });

  it('drops the query after a relative path in an exception message', () => {
    const out = scrubEvent({
      uuid: 'u',
      event: '$exception',
      properties: {
        $exception_list: [
          { type: 'Error', value: 'API DELETE /bible/book/note/remove?note_id=42 failed: 500' },
          { type: 'Error', value: 'rejected at /coach/leader/abc-123?x=s3cret (retry)' },
        ],
      },
    });
    expect(JSON.stringify(out?.properties.$exception_list)).not.toMatch(/note_id|s3cret/);
    expect(out?.properties.$exception_list[0].value).toBe('API DELETE /bible/book/note/remove failed: 500');
    expect(out?.properties.$exception_list[1].value).toBe('rejected at /coach/leader/:id (retry)');
  });

  it('scrubs a long run of links in linear time', () => {
    const run = 'url(https://a.test/x.png)'.repeat(40_000) + 'http://'.repeat(40_000);
    const started = performance.now();
    scrubEvent({ uuid: 'u', event: 'x', properties: { blob: run } });
    expect(performance.now() - started).toBeLessThan(1000);
  });

  it('keeps only the host of a Google Docs or Drive link', () => {
    const out = scrubEvent({
      uuid: 'u',
      event: '$autocapture',
      properties: {
        $external_click_url: 'https://docs.google.com/document/d/doc-id-1/export?format=pdf',
        $elements_chain: 'a:attr__href="https://drive.google.com/uc?export=download&id=file-id-2"',
      },
    });
    expect(out?.properties).toEqual({
      $external_click_url: 'https://docs.google.com',
      $elements_chain: 'a:attr__href="https://drive.google.com"',
    });
    expect(
      scrubEvent({ uuid: 'u', event: 'x', properties: { a: 'https://docs.google.com.other.test/p/1', b: '(https://docs.google.com/d/x/edit),next' } })
        ?.properties,
    ).toEqual({ a: 'https://docs.google.com.other.test/p/1', b: '(https://docs.google.com),next' });
    expect(
      scrubNetworkRequest({ name: 'https://docs.google.com/document/d/doc-id-1/export', entryType: 'resource', startTime: 0, duration: 1 })?.name,
    ).toBe('https://docs.google.com');
  });

  it('replaces the ids after /coach/ whatever the case of the address', () => {
    expect(scrubEvent({ uuid: 'u', event: '$pageview', properties: { pathname: '/Coach/leader/l-9/manage' } })?.properties).toEqual({
      pathname: '/coach/leader/:id/manage',
    });
  });

  it('scrubs objects created without a prototype', () => {
    const nested = Object.assign(Object.create(null), { $current_url: 'https://app.test/notes?q=n-secret' });
    expect(scrubEvent({ uuid: 'u', event: 'x', properties: { nested } })?.properties).toEqual({
      nested: { $current_url: 'https://app.test/notes' },
    });
  });

  it('passes through an empty event and ignores a malformed heatmap entry', () => {
    expect(scrubEvent(null)).toBeNull();
    const out = scrubEvent({
      uuid: 'u',
      event: '$$heatmap',
      properties: { $heatmap_data: { 'https://app.test/notes?s=1': [{ x: 1 }], 'https://app.test/x': 'bad' } },
    });
    expect(out?.properties.$heatmap_data).toEqual({ 'https://app.test/notes': [{ x: 1 }] });
  });

  it.each([
    ['amend', 'https://api.test/coach/admin/reports/r1/amend', '{"dimensions":[{"n":5,"rationale":"private"}]}', '{"applied":true}'],
    ['first lesson', 'https://api.test/coach/admin/reports/r1/first-lesson', '{"rationale":"private"}', '{"applied":true}'],
    ['review', 'https://api.test/coach/admin/reports/r1/review', '', '{"dimensions":[{"rationale":"private"}]}'],
    ['kept versions', 'https://api.test/coach/admin/reports/r1/revisions', '', '{"revisions":[{"amendedBy":"admin@example.test"}]}'],
    ['revision send', 'https://api.test/coach/admin/reports/r1/revision/send', '', '{"sends":[{"email":"leader@example.test"}]}'],
    ['assignment', 'https://api.test/coach/admin/sessions/ff-4/attribute', '{"coachId":"leader-a"}', '{"coachId":"leader-a"}'],
    ['keywords and addresses', 'https://api.test/coach/admin/leaders/leader-a/attribution', '{"altEmails":["leader-a@example.test"]}', '{"altEmails":["leader-a@example.test"]}'],
    ['leader address', 'https://api.test/coach/admin/leaders/leader-a/email', '{"email":"leader-a@example.test"}', '{"email":"leader-a@example.test"}'],
    ['note', 'https://api.test/coach/admin/coaches/leader-a/reports/r1/notes', '{"body":"private"}', '{"note":{"body":"private"}}'],
  ])('drops both bodies of the %s request from a replay network entry', (_name, name, requestBody, responseBody) => {
    const out = scrubNetworkRequest({ name, entryType: 'resource', startTime: 0, duration: 1, requestBody, responseBody });
    expect(out?.requestBody).toBeNull();
    expect(out?.responseBody).toBeNull();
  });

  it('replaces the leader and report ids after /coach/ in a replay network entry', () => {
    const out = scrubNetworkRequest({
      name: 'https://api.test/coach/admin/coaches/leader-b/reports/leader-b-2026-07-16-ff123/notes?x=1',
      entryType: 'resource',
      startTime: 0,
      duration: 1,
    });
    expect(out?.name).toBe('https://api.test/coach/admin/coaches/:id/reports/:id/notes');
    expect(
      scrubNetworkRequest({ name: 'https://api.test/coach/reports/summary', entryType: 'resource', startTime: 0, duration: 1 })?.name,
    ).toBe('https://api.test/coach/reports/summary');
  });

  it('replaces the ids after /coach/ in every URL, pathname and link an event carries', () => {
    const out = scrubEvent({
      uuid: 'u',
      event: '$pageview',
      properties: {
        $current_url: 'https://app.test/coach/leader/leader-b/manage?s=leader-b-2026-07-16-ff1',
        pathname: '/coach/leader/leader-b/manage',
        $pathname: '/coach/leader/leader-b',
        $prev_pageview_pathname: '/coach/leader/leader-a/trends',
        $session_entry_url: 'https://app.test/coach/leader/leader-a?s=r',
        referrer: 'https://app.test/coach/leader/leader-a/sessions',
        $elements_chain: 'a:attr__href="/coach/leader/leader-a/monthly"nth-child="1"',
        $snapshot_data: [{ type: 4, data: { href: 'https://app.test/coach/leader/leader-a/manage' } }],
        other: 'kept',
      },
      $set_once: { $initial_pathname: '/coach/leader/leader-a', $initial_current_url: 'https://app.test/coach/leader/leader-a?s=1' },
    });
    expect(out?.properties).toEqual({
      $current_url: 'https://app.test/coach/leader/:id/manage',
      pathname: '/coach/leader/:id/manage',
      $pathname: '/coach/leader/:id',
      $prev_pageview_pathname: '/coach/leader/:id/trends',
      $session_entry_url: 'https://app.test/coach/leader/:id',
      referrer: 'https://app.test/coach/leader/:id/sessions',
      $elements_chain: 'a:attr__href="/coach/leader/:id/monthly"nth-child="1"',
      $snapshot_data: [{ type: 4, data: { href: 'https://app.test/coach/leader/:id/manage' } }],
      other: 'kept',
    });
    expect(out?.$set_once).toEqual({ $initial_pathname: '/coach/leader/:id', $initial_current_url: 'https://app.test/coach/leader/:id' });
  });

  it('keys heatmap clicks by the scrubbed address, so no leader or report id and no query reaches analytics', () => {
    const out = scrubEvent({
      uuid: 'u',
      event: '$$heatmap',
      properties: {
        $heatmap_data: {
          'https://app.test/coach/leader/leader-c/manage?s=leader-c-2026-09-01-ff7': [{ x: 1, y: 2 }],
          'https://app.test/coach/leader/leader-d/manage#notes': [{ x: 3, y: 4 }],
          'https://app.test/bible/john/3': [{ x: 5, y: 6 }],
        },
      },
    });
    expect(out?.properties.$heatmap_data).toEqual({
      'https://app.test/coach/leader/:id/manage': [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ],
      'https://app.test/bible/john/3': [{ x: 5, y: 6 }],
    });
  });
});
