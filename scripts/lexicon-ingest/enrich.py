#!/usr/bin/env python3
"""
Enrich auto-generated lexicon entries to match the hand-curated James/NT-core
richness. Uses the Anthropic API with TBESG/TBESH/Abbott-Smith as scholarly
ground.

Auto-generated entries from build.py have:
  lemma, translit, strongs, pos, basicGloss, ntFrequency|otFrequency, loaded, notes
  (where `notes` is a truncated Abbott-Smith definition with HTML stripped)

After enrichment, each entry adds:
  pronunciation — English phonetic hint (e.g. "AH-gah-pay" for ἀγάπη)
  semanticRange — 3-4 ordered senses, broadest to most specific
  related — 1-3 cognate/antonym lemmas with grammatical role notes
  loaded — flipped to true when the lemma carries multi-sense theological weight
  notes — rewritten as 1-3 sentence conversational pastoral note grounded
          on the Abbott-Smith original; no HTML, no truncation

Defaults are tuned for the long-tail use case: Haiku 4.5 + 8 parallel
workers. For ~5K NT + ~7K OT auto lemmas, expect ~1 hour and ~$2-3 total.
Resume-friendly: any lemma that already has semanticRange + pronunciation
is skipped, so an interrupted run picks up cleanly.

Usage:
  export ANTHROPIC_API_KEY=...
  ./enrich.py --top 500              # top-N most-frequent lemmas
  ./enrich.py --all                  # everything (~12K) — auto skips done
  ./enrich.py --slugs theos,christos # specific lemmas
  ./enrich.py --dry-run --top 5      # print prompts without API calls

Tuning:
  --model claude-sonnet-4-5-20250929   # use Sonnet (~3x slower, ~10x more)
  --concurrency 4                       # parallel workers (default 8)
  --no-skip-enriched                    # re-pay for already-rich entries
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import re
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
GENERATED_DIR = HERE.parent.parent / 'src' / 'data' / 'lexicon' / 'generated'
HAND_LEMMAS_TS = HERE.parent.parent / 'src' / 'data' / 'lexicon' / 'lemmas.ts'
LEMMAS_JSON = GENERATED_DIR / '_lemmas.json'

DEFAULT_MODEL = 'claude-haiku-4-5-20251001'  # fast + cheap + plenty for Layer 1
MAX_TOKENS = 1024
DEFAULT_CONCURRENCY = 8
CHECKPOINT_EVERY = 50


SYSTEM_PROMPT = """You are a biblical Greek + Hebrew scholar with expertise in NT and OT lexicography. You will receive a lemma's basic data (Strong's, lemma form, transliteration, part of speech, basic gloss, frequency, and a raw Abbott-Smith / TBESH definition). Your job is to produce a structured enrichment that matches a specific app schema.

Constraints you MUST follow:

1. NEVER use the phrasing "X means Y." Always "X carries the sense of Y," "in this context X refers to Y," or "the word denotes Y." Greek and Hebrew words do not have meanings; they have semantic ranges that context narrows.

2. NEVER commit the root fallacy. Don't preach the etymology when the synchronic usage doesn't carry it. (Classic bad example: δύναμις does NOT mean "dynamite power" — anachronism.) If you cite etymology, mark it AS etymology and note the actual usage.

3. NEVER overload the reader. The popover is small. Be precise and compact.

4. Pronunciation should be an English-readable phonetic hint with syllable stress in CAPS — e.g. "AH-gah-pay" for ἀγάπη, "kris-TOSS" for Χριστός, "ROO-ahkh" for רוּחַ. Use US-English vowel intuitions, not IPA.

5. semanticRange should be 3 or 4 ordered senses from broadest/most-frequent to narrowest. Each item is a SHORT phrase (3-12 words), not a sentence.

6. related should be 2 or 3 cognates: same-root verbs/nouns/adjectives, antonyms, or related theological terms. Each item has the original-language form (Greek or Hebrew), standard transliteration, and a 4-12 word note on its relationship. For Hebrew lemmas, consider including the LXX Greek equivalent as one of the related entries when relevant.

7. loaded should be TRUE only when the word carries notable multi-sense theological freight that gets abused without context (logos, kosmos, sarx, agape, dikaiosyne, charis, pneuma, hagios, basileia, soteria, chesed, hesed, ruach, kavod, torah, berit, etc.). For ordinary content words (chair, table, finger), loaded is FALSE.

8. notes should be 1-3 sentences. Conversational but scholarly. Cite the most important pericope where this word lights up. NO HTML. NO truncation mid-sentence.

Return ONLY a JSON object with exactly these keys: pronunciation, semanticRange (array of strings), related (array of {lemma, translit, note}), loaded (boolean), notes (string). No surrounding prose. No code fences."""


def build_user_prompt(entry: dict) -> str:
    freq_line = ''
    if entry.get('ntFrequency'):
        freq_line = f"  NT frequency: {entry['ntFrequency']}\n"
    if entry.get('otFrequency'):
        freq_line += f"  OT frequency: {entry['otFrequency']}\n"
    return f"""Enrich this lemma:

  Lemma: {entry['lemma']}
  Translit: {entry['translit']}
  Strong's: {entry['strongs']}
  POS: {entry['pos']}
  Basic gloss: {entry['basicGloss']}
{freq_line}  Raw definition: {entry.get('notes', '')[:400]}

Output the enrichment JSON now."""


def load_hand_curated_slugs() -> set[str]:
    """Read lemmas.ts and pull the slug keys via regex."""
    if not HAND_LEMMAS_TS.exists():
        return set()
    text = HAND_LEMMAS_TS.read_text()
    return set(re.findall(r'^  ([a-z][a-z0-9]*): \{$', text, re.MULTILINE))


def is_already_enriched(entry: dict) -> bool:
    """An entry is considered enriched when it has both a pronunciation hint
    and a non-empty semanticRange — those are the two fields auto-generation
    never produces."""
    return bool(entry.get('pronunciation')) and bool(entry.get('semanticRange'))


def merge(orig: dict, enrich: dict) -> dict:
    """Merge enrichment into the original entry. Keep original lemma, translit,
    strongs, pos, basicGloss, ntFrequency, otFrequency (ground truth from
    BSB/TBESE). Overwrite the rest from the enrichment."""
    out = dict(orig)
    out['pronunciation'] = enrich.get('pronunciation', '')
    out['semanticRange'] = enrich.get('semanticRange', [])
    out['related'] = enrich.get('related', [])
    out['loaded'] = bool(enrich.get('loaded', False))
    if enrich.get('notes'):
        out['notes'] = enrich['notes']
    return out


async def enrich_one(client, slug: str, entry: dict, sem: asyncio.Semaphore,
                     model: str) -> tuple[str, dict | None, str | None]:
    """One API call, semaphore-bounded. Returns (slug, parsed_json, error)."""
    async with sem:
        try:
            msg = await client.messages.create(
                model=model,
                max_tokens=MAX_TOKENS,
                system=SYSTEM_PROMPT,
                messages=[{'role': 'user', 'content': build_user_prompt(entry)}],
            )
            text = msg.content[0].text.strip()
            text = re.sub(r'^```(?:json)?\s*', '', text)
            text = re.sub(r'\s*```$', '', text)
            return slug, json.loads(text), None
        except Exception as e:
            return slug, None, str(e)


async def run_enrichment(targets: list[str], lemmas: dict, client,
                         model: str, concurrency: int) -> tuple[int, int]:
    sem = asyncio.Semaphore(concurrency)
    tasks = [
        asyncio.create_task(enrich_one(client, t, lemmas[t], sem, model))
        for t in targets
    ]
    enriched = 0
    failed = 0
    done = 0
    start = time.time()
    for fut in asyncio.as_completed(tasks):
        slug, result, err = await fut
        done += 1
        if result:
            lemmas[slug] = merge(lemmas[slug], result)
            enriched += 1
        else:
            failed += 1
            if failed <= 3 or failed % 50 == 0:
                print(f'  WARN: {slug} failed: {err}', file=sys.stderr)
        if done % 20 == 0 or done == 1 or done == len(targets):
            elapsed = time.time() - start
            rate = done / max(elapsed, 1)
            remaining = (len(targets) - done) / max(rate, 0.1) / 60
            print(f'[{done}/{len(targets)}] enriched={enriched} failed={failed} '
                  f'rate={rate:.1f}/s ~{remaining:.0f} min left')
        if done % CHECKPOINT_EVERY == 0:
            LEMMAS_JSON.write_text(json.dumps(lemmas, ensure_ascii=False, indent=2))
    LEMMAS_JSON.write_text(json.dumps(lemmas, ensure_ascii=False, indent=2))
    return enriched, failed


def main() -> int:
    parser = argparse.ArgumentParser()
    g = parser.add_mutually_exclusive_group(required=True)
    g.add_argument('--all', action='store_true', help='Enrich every auto-generated lemma')
    g.add_argument('--top', type=int, help='Enrich the top-N by frequency')
    g.add_argument('--slugs', help='Comma-separated lemma slugs to enrich')
    parser.add_argument('--dry-run', action='store_true',
                        help='Print prompts; do not call API; do not write')
    parser.add_argument('--model', default=DEFAULT_MODEL,
                        help=f'Anthropic model (default: {DEFAULT_MODEL})')
    parser.add_argument('--concurrency', type=int, default=DEFAULT_CONCURRENCY,
                        help=f'Parallel API workers (default: {DEFAULT_CONCURRENCY})')
    parser.add_argument('--no-skip-enriched', action='store_true',
                        help='Re-pay for entries that already have semanticRange + pronunciation')
    args = parser.parse_args()

    if not LEMMAS_JSON.exists():
        print(f'ERROR: {LEMMAS_JSON} not found. Run build.py first.', file=sys.stderr)
        return 1

    lemmas = json.loads(LEMMAS_JSON.read_text())
    hand_curated = load_hand_curated_slugs()
    print(f'Loaded {len(lemmas):,} auto-generated lemmas; '
          f'{len(hand_curated)} hand-curated slugs to skip.')

    # Pick the targets.
    if args.slugs:
        targets = [s.strip() for s in args.slugs.split(',') if s.strip()]
    elif args.top:
        def freq(e: dict) -> int:
            return e.get('ntFrequency', 0) + e.get('otFrequency', 0)
        ranked = sorted(lemmas.items(), key=lambda kv: -freq(kv[1]))
        targets = [slug for slug, _ in ranked[:args.top]]
    else:
        targets = list(lemmas.keys())

    # Skip hand-curated (their override wins at render time anyway).
    before = len(targets)
    targets = [t for t in targets if t in lemmas and t not in hand_curated]
    skipped_hand = before - len(targets)

    # Resume-friendly: skip lemmas that already have a pronunciation + semanticRange.
    skipped_done = 0
    if not args.no_skip_enriched:
        before = len(targets)
        targets = [t for t in targets if not is_already_enriched(lemmas[t])]
        skipped_done = before - len(targets)

    print(f'Will enrich {len(targets):,} lemmas '
          f'(skipped {skipped_hand} hand-curated, {skipped_done} already enriched).')
    print(f'Model: {args.model} • concurrency: {args.concurrency}')

    if args.dry_run:
        for slug in targets[:5]:
            print('\n--- DRY RUN ---')
            print(f'slug: {slug}')
            print(build_user_prompt(lemmas[slug]))
        print(f'\n(dry-run printed first 5 of {len(targets):,} prompts)')
        return 0

    if not targets:
        print('Nothing to enrich.')
        return 0

    # Real run — needs API key.
    if not os.environ.get('ANTHROPIC_API_KEY'):
        print('ERROR: ANTHROPIC_API_KEY not set. Export it or use --dry-run.',
              file=sys.stderr)
        return 1
    try:
        from anthropic import AsyncAnthropic
    except ImportError:
        print('ERROR: pip install anthropic', file=sys.stderr)
        return 1
    client = AsyncAnthropic()

    enriched, failed = asyncio.run(
        run_enrichment(targets, lemmas, client, args.model, args.concurrency)
    )
    print(f'\nDone. Enriched: {enriched}, failed: {failed}.')
    return 0 if failed == 0 else 1


if __name__ == '__main__':
    raise SystemExit(main())
