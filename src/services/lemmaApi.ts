import type { LexEntry } from '@versemate/lexicon';
import { api, ApiError } from './api';

/**
 * Raw shape of GET /lemma/:strongs?lang= (snake_case, nullable fields).
 *
 * The endpoint does field-by-field English fallback: when a translation row
 * exists but a field is untranslated it returns the backend's English value.
 * But the backend only stores English prose for the ~2,200 `loaded` lemmas;
 * for the other ~16K its English fields are null too, so a card for most words
 * arrives with null gloss / notes / range (`is_translated: false`).
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
 * Map the API card onto the bundled LexEntry shape so LexiconPopover can
 * overlay it on the bundled entry. Only fields the API actually filled in are
 * returned: a null or empty field is left out, so the bundled English value
 * shows through. That is the English default for any word the backend has no
 * text for in the reader's language (most lemmas outside the `loaded` set).
 * `related` is intentionally omitted: the API drops the Greek script on
 * related words, so LexiconPopover merges it from the bundled entry instead.
 */
export function apiCardToLexEntry(card: ApiLemmaCard): Partial<LexEntry> {
  const out: Partial<LexEntry> = { strongs: card.strongs, loaded: card.loaded };
  if (card.lemma) out.lemma = card.lemma;
  if (card.translit) out.translit = card.translit;
  if (card.pronunciation) out.pronunciation = card.pronunciation;
  if (card.basic_gloss) out.basicGloss = card.basic_gloss;
  if (card.pos) out.pos = card.pos;
  if (card.semantic_range && card.semantic_range.length > 0) out.semanticRange = card.semantic_range;
  if (card.notes) out.notes = card.notes;
  if (card.nt_frequency != null) out.ntFrequency = card.nt_frequency;
  if (card.ot_frequency != null) out.otFrequency = card.ot_frequency;
  return out;
}
