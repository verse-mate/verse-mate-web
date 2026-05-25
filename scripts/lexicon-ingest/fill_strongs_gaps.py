#!/usr/bin/env python3
"""
Fill the gap between our generated lemmas and the full Strong's range.

build.py only emits lemma entries for Strong's numbers that appear in BSB
token alignments. ~2,000 Strong's numbers exist in TBESG/TBESH but never
get tagged by BSB (textual variants, name disambiguations, Strong's that
collapse multiple forms, etc.). This script walks both lexicons and adds
any missing base-Strong's to _lemmas.json so the data layer matches Strong's
full 14,298-number coverage.

The added entries:
  - Are NOT tappable in scripture (no BSB alignment references them)
  - Have frequency 0 (never appears in BSB tokens)
  - Are searchable / lookupable for any future Strong's-number reference UI
  - Match the auto-generated entry shape so enrich.py can refine them

Slug collisions are resolved by suffixing with the lowercase Strong's number
(e.g. `bara_h1254a` if `bara` is already taken by another base entry).

Usage:
  ./fill_strongs_gaps.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

# Reuse build.py's parsers + slugify (single source of truth)
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from build import parse_tbe, slugify_translit  # noqa: E402

LEMMAS_JSON = HERE.parent.parent.parent / 'verse-mate-lexicon' / 'src' / 'generated' / '_lemmas.json'
TBESG_PATH = HERE / 'data' / 'tbesg.txt'
TBESH_PATH = HERE / 'data' / 'tbesh.txt'


def main() -> int:
    if not LEMMAS_JSON.exists():
        print(f'ERROR: {LEMMAS_JSON} not found. Run build.py first.', file=sys.stderr)
        return 1
    if not TBESG_PATH.exists() or not TBESH_PATH.exists():
        print('ERROR: TBESG/TBESH data files missing. Run build.py first.', file=sys.stderr)
        return 1

    lem = json.loads(LEMMAS_JSON.read_text())
    have_strongs = {e['strongs']: slug for slug, e in lem.items() if e.get('strongs')}
    print(f'Start: {len(lem):,} lemma entries covering {len(have_strongs):,} Strong\'s')

    # Parse both TBESE files. Each is keyed by base Strong's (e.g. G0001, H1254).
    tbesg = parse_tbe(TBESG_PATH, 'G')
    tbesh = parse_tbe(TBESH_PATH, 'H')
    print(f'TBESG: {len(tbesg):,} entries  TBESH: {len(tbesh):,} entries')

    added = 0
    for strongs, entry in list(tbesg.items()) + list(tbesh.items()):
        if strongs in have_strongs:
            continue
        is_greek = strongs.startswith('G')
        base_slug = slugify_translit(entry['translit'], is_greek=is_greek)
        if not base_slug:
            continue
        # Disambiguate slug collisions by suffixing with the Strong's number.
        # Collisions happen because TBESH gives two homonyms the same translit
        # (e.g. H7306 / H7307 both "ru.ach") and the first one already took
        # the bare slug during build.py's pass.
        slug = base_slug
        if slug in lem:
            slug = f'{base_slug}_{strongs.lower()}'
        if slug in lem:
            # Extremely unlikely, but safe guard — skip rather than overwrite
            continue
        freq_field = 'ntFrequency' if is_greek else 'otFrequency'
        lem[slug] = {
            'lemma': entry['lemma'],
            'translit': entry['translit'],
            'strongs': strongs,
            'pos': entry['pos'],
            'basicGloss': entry['gloss'],
            freq_field: 0,  # not present in BSB tokens
            'loaded': False,
            'notes': entry['notes'],
        }
        added += 1

    LEMMAS_JSON.write_text(json.dumps(lem, ensure_ascii=False, indent=2))
    print(f'\nAdded {added:,} new lemma entries.')
    print(f'Final: {len(lem):,} lemma entries.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
