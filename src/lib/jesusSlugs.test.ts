import { describe, expect, it } from 'vitest';
import {
  JESUS_ROOT,
  buildJesusEntryUrl,
  buildJesusHubUrl,
  buildJesusKindUrl,
  buildJesusLifeUrl,
  buildJesusStudyUrl,
  buildJesusThemeUrl,
  jesusTestId,
} from './jesusSlugs';

describe('jesusSlugs', () => {
  it('builds the hub url', () => {
    expect(buildJesusHubUrl()).toBe('/jesus');
    expect(JESUS_ROOT).toBe('/jesus');
  });

  it('builds the life url with and without a period', () => {
    expect(buildJesusLifeUrl()).toBe('/jesus/life');
    expect(buildJesusLifeUrl('passion-week')).toBe('/jesus/life/passion-week');
  });

  it('builds facet urls under literal segments', () => {
    // The literal segments are what stop a kind slug ever colliding with
    // `life` or with a future top-level route.
    expect(buildJesusKindUrl('miracles')).toBe('/jesus/browse/miracles');
    expect(buildJesusThemeUrl('prayer')).toBe('/jesus/theme/prayer');
    expect(buildJesusStudyUrl('the-i-am-statements')).toBe(
      '/jesus/study/the-i-am-statements',
    );
    expect(buildJesusEntryUrl('parable-of-the-sower')).toBe(
      '/jesus/entry/parable-of-the-sower',
    );
  });

  it('keeps every facet url on a distinct path', () => {
    const urls = [
      buildJesusHubUrl(),
      buildJesusLifeUrl(),
      buildJesusLifeUrl('parables'),
      buildJesusKindUrl('parables'),
      buildJesusThemeUrl('parables'),
      buildJesusStudyUrl('parables'),
      buildJesusEntryUrl('parables'),
    ];
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('builds stable test ids from slugs', () => {
    expect(jesusTestId('jesus-entry-card', 'the-good-samaritan')).toBe(
      'jesus-entry-card-the-good-samaritan',
    );
  });

  it('normalises punctuation and spacing in test ids', () => {
    // References are used as test-id suffixes too, and they contain
    // spaces and colons.
    expect(jesusTestId('jesus-reference', 'Mark 4:35-41')).toBe(
      'jesus-reference-mark-4-35-41',
    );
    expect(jesusTestId('jesus-reference', '1 Corinthians 15:3-8')).toBe(
      'jesus-reference-1-corinthians-15-3-8',
    );
  });

  it('never leaves a trailing or leading hyphen in a test id', () => {
    expect(jesusTestId('jesus-passage', 'Matthew 24 ')).toBe(
      'jesus-passage-matthew-24',
    );
    expect(jesusTestId('jesus-passage', '  John 8:12')).toBe(
      'jesus-passage-john-8-12',
    );
  });
});
