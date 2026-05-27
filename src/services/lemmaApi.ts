import type { LexEntry } from '@versemate/lexicon';
import { api, ApiError } from './api';

/**
 * Raw shape of GET /lemma/:strongs?lang= (snake_case, nullable fields).
 *
 * The endpoint does field-by-field English fallback: when a translation row
 * exists but a field is untranslated it returns the English value, never null,
 * for any field that exists in English. Worst case the whole card degrades to
 * English with `is_translated: false`. A field is null only when it is absent
 * in English too.
 */
export interface ApiLemmaCard {
  strongs: string;
  lemma: string;
  translit: string | null;
  pronunciation: string | null;
  nt_frequency: number | null;
  ot_frequency: number | null;
  loaded: boolean;
  pos: string | null;
  basic_gloss: string | null;
  semantic_range: string[] | null;
  notes: string | null;
  related: Array<{ translit: string; note: string }> | null;
  language_code: string;
  source: string | null;
  is_translated: boolean;
}

// Lemma cards are immutable within a session (translation updates ship via
// redeploy), so a (strongs, lang) result — including a 404 miss, stored as
// null — is cached for the lifetime of the page.
const cache = new Map<string, ApiLemmaCard | null>();

/**
 * Fetch a translated lemma card. Returns null when the Strong's isn't in the
 * loaded set (404) or on a transient failure — the caller falls back to the
 * bundled English entry. The endpoint is public, so no auth is sent. Send the
 * Strong's as-is; the server canonicalizes (`g80` / `G0080` / `G80` → `G0080`).
 */
export async function fetchLemmaCard(
  strongs: string,
  lang: string,
): Promise<ApiLemmaCard | null> {
  const key = `${strongs}:${lang}`;
  if (cache.has(key)) return cache.get(key) ?? null;

  try {
    const card = await api.get<ApiLemmaCard>(
      `/lemma/${encodeURIComponent(strongs)}`,
      { lang },
      { auth: false },
    );
    cache.set(key, card);
    return card;
  } catch (err) {
    // 404 = Strong's not in the loaded set; cache the miss so we never retry.
    if (err instanceof ApiError && err.status === 404) {
      cache.set(key, null);
      return null;
    }
    // Transient failure (network / 5xx): don't cache, so a later tap is free
    // to retry. The caller renders the bundled English entry meanwhile.
    console.warn(`lemma fetch failed for ${strongs} (${lang}):`, err);
    return null;
  }
}

/**
 * Map the API card onto the bundled LexEntry shape so LexiconPopover renders it
 * unchanged. Nulls only occur for fields absent in English too (see
 * ApiLemmaCard), so defaulting them to empty is safe — the popover hides empty
 * sections. `related` is intentionally omitted: the API drops the Greek script
 * on related words, so LexiconPopover merges it from the bundled entry instead.
 */
export function apiCardToLexEntry(card: ApiLemmaCard): Partial<LexEntry> {
  return {
    strongs: card.strongs,
    lemma: card.lemma,
    translit: card.translit ?? '',
    pronunciation: card.pronunciation ?? undefined,
    basicGloss: card.basic_gloss ?? '',
    pos: card.pos ?? '',
    semanticRange: card.semantic_range ?? [],
    notes: card.notes ?? '',
    loaded: card.loaded,
    ntFrequency: card.nt_frequency ?? 0,
    otFrequency: card.ot_frequency ?? 0,
  };
}
