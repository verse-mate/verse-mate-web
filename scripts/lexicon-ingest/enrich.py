#!/usr/bin/env python3
"""
Enrich auto-generated lexicon entries to match the hand-curated James/NT-core
richness. Uses the Anthropic API with TBESG/Abbott-Smith as scholarly ground.

Auto-generated entries from build.py have:
  lemma, translit, strongs, pos, basicGloss, ntFrequency, loaded, notes
  (where `notes` is a truncated Abbott-Smith definition with HTML stripped)

After enrichment, each entry adds:
  pronunciation — English phonetic hint (e.g. "AH-gah-pay" for ἀγάπη)
  semanticRange — 3-4 ordered senses, broadest to most specific
  related — 1-3 cognate/antonym lemmas with grammatical role notes
  loaded — flipped to true when the lemma carries multi-sense theological weight
  notes — rewritten as 1-3 sentence conversational pastoral note grounded
          on the Abbott-Smith original; no HTML, no truncation

Usage:
  export ANTHROPIC_API_KEY=...
  ./enrich.py --top 200       # enrich top-200 most-frequent lemmas
  ./enrich.py --all           # enrich all ~5,000 (longer, ~$10 at Sonnet pricing)
  ./enrich.py --slugs theos,christos,...   # specific lemmas
  ./enrich.py --dry-run --top 5  # print prompts without API calls (cost preview)

Output: overwrites src/data/lexicon/generated/_lemmas.json with enriched
entries in place. Skip-list excludes any lemma already hand-curated in
src/data/lexicon/lemmas.ts (those override at render time anyway).

Hand-curated entries always win on render-time collision (see
src/data/lexicon/index.ts) — running enrichment is purely a quality lift
for the long tail. The shape is identical, so the TS layer doesn't change.
"""
from __future__ import annotations

import argparse
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

MODEL = 'claude-sonnet-4-5-20250929'  # solid Greek lexicography for ~$3/M input tokens
MAX_TOKENS = 1024


SYSTEM_PROMPT = """You are a New Testament Greek scholar with expertise in Koine lexicography. You will receive a Greek lemma's basic data (Strong's, lemma form, transliteration, part of speech, basic gloss, NT frequency, and a raw Abbott-Smith definition). Your job is to produce a structured enrichment that matches a specific app schema.

Constraints you MUST follow:

1. NEVER use the phrasing "X means Y." Always "X carries the sense of Y," "in this context X refers to Y," or "the word denotes Y." Greek words do not have meanings; they have semantic ranges that context narrows.

2. NEVER commit the root fallacy. Don't preach the etymology when the synchronic NT usage doesn't carry it. The classic example: δύναμις does NOT mean "dynamite power" — that's anachronism. If you cite etymology, mark it AS etymology and note the actual usage.

3. NEVER overload the reader. The popover is small. Be precise and compact.

4. Pronunciation should be an English-readable phonetic hint with syllable stress in CAPS — e.g. "AH-gah-pay" for ἀγάπη, "kris-TOSS" for Χριστός. Use US-English vowel intuitions, not IPA.

5. semanticRange should be 3 or 4 ordered senses from broadest/most-frequent to narrowest. Each item is a SHORT phrase (3-12 words), not a sentence.

6. related should be 2 or 3 cognates: same root verbs/nouns/adjectives, antonyms, or related theological terms. Each item has Greek form, standard transliteration, and a 4-12 word note on its relationship.

7. loaded should be TRUE only when the word carries notable multi-sense theological freight that gets abused without context (logos, kosmos, sarx, agape, dikaiosyne, charis, pneuma, hagios, basileia, soteria, etc.). For ordinary content words (chair, table, finger), loaded is FALSE.

8. notes should be 1-3 sentences. Conversational but scholarly. Cite the most important NT pericope where this word lights up. NO HTML. NO truncation mid-sentence.

Return ONLY a JSON object with exactly these keys: pronunciation, semanticRange (array of strings), related (array of {lemma, translit, note}), loaded (boolean), notes (string). No surrounding prose. No code fences."""


def build_user_prompt(entry: dict) -> str:
    return f"""Enrich this lemma:

  Lemma: {entry['lemma']}
  Translit: {entry['translit']}
  Strong's: {entry['strongs']}
  POS: {entry['pos']}
  Basic gloss: {entry['basicGloss']}
  NT frequency: {entry.get('ntFrequency', 'unknown')}
  Abbott-Smith (raw): {entry.get('notes', '')[:400]}

Output the enrichment JSON now."""


def load_hand_curated_slugs() -> set[str]:
    """Read lemmas.ts and pull the slug keys via regex. Slugs are lines like
    `  agapao: {` at the start of an entry definition."""
    if not HAND_LEMMAS_TS.exists():
        return set()
    text = HAND_LEMMAS_TS.read_text()
    return set(re.findall(r'^  ([a-z][a-z0-9]*): \{$', text, re.MULTILINE))


def call_api(client, entry: dict) -> dict | None:
    try:
        msg = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=SYSTEM_PROMPT,
            messages=[{'role': 'user', 'content': build_user_prompt(entry)}],
        )
        text = msg.content[0].text.strip()
        # Strip code fences if the model added them anyway.
        text = re.sub(r'^```(?:json)?\s*', '', text)
        text = re.sub(r'\s*```$', '', text)
        return json.loads(text)
    except Exception as e:
        print(f'  WARN: API call or parse failed: {e}', file=sys.stderr)
        return None


def merge(orig: dict, enrich: dict) -> dict:
    """Merge enrichment into the original entry. Keep original lemma, translit,
    strongs, pos, basicGloss, ntFrequency (those are ground truth from
    BSB/TBESG). Overwrite the rest from the enrichment."""
    out = dict(orig)
    out['pronunciation'] = enrich.get('pronunciation', '')
    out['semanticRange'] = enrich.get('semanticRange', [])
    out['related'] = enrich.get('related', [])
    out['loaded'] = bool(enrich.get('loaded', False))
    if enrich.get('notes'):
        out['notes'] = enrich['notes']
    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    g = parser.add_mutually_exclusive_group(required=True)
    g.add_argument('--all', action='store_true', help='Enrich every auto-generated lemma')
    g.add_argument('--top', type=int, help='Enrich the top-N by NT frequency')
    g.add_argument('--slugs', help='Comma-separated lemma slugs to enrich')
    parser.add_argument('--dry-run', action='store_true',
                        help='Print prompts; do not call API; do not write')
    parser.add_argument('--throttle', type=float, default=0.3,
                        help='Seconds between API calls (default 0.3)')
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
        ranked = sorted(lemmas.items(), key=lambda kv: -kv[1].get('ntFrequency', 0))
        targets = [slug for slug, _ in ranked[:args.top]]
    else:
        targets = list(lemmas.keys())

    targets = [t for t in targets if t in lemmas and t not in hand_curated]
    print(f'Will enrich {len(targets)} lemmas '
          f'(skipped {sum(1 for t in targets if t in hand_curated)} hand-curated).')

    if args.dry_run:
        for slug in targets[:5]:
            print('\n--- DRY RUN ---')
            print(f'slug: {slug}')
            print(build_user_prompt(lemmas[slug]))
        print(f'\n(dry-run printed first 5 of {len(targets)} prompts)')
        return 0

    # Real run — needs API key.
    if not os.environ.get('ANTHROPIC_API_KEY'):
        print('ERROR: ANTHROPIC_API_KEY not set. Export it or use --dry-run.',
              file=sys.stderr)
        return 1
    try:
        import anthropic
    except ImportError:
        print('ERROR: pip install anthropic', file=sys.stderr)
        return 1
    client = anthropic.Anthropic()

    enriched = 0
    failed = 0
    for i, slug in enumerate(targets, 1):
        if i % 20 == 0 or i == 1 or i == len(targets):
            print(f'[{i}/{len(targets)}] {slug}')
        result = call_api(client, lemmas[slug])
        if result:
            lemmas[slug] = merge(lemmas[slug], result)
            enriched += 1
        else:
            failed += 1
        time.sleep(args.throttle)
        # Checkpoint every 50 to survive interruptions.
        if i % 50 == 0:
            LEMMAS_JSON.write_text(json.dumps(lemmas, ensure_ascii=False, indent=2))

    LEMMAS_JSON.write_text(json.dumps(lemmas, ensure_ascii=False, indent=2))
    print(f'\nDone. Enriched: {enriched}, failed: {failed}.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
