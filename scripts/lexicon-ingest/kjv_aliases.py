#!/usr/bin/env python3
"""
Augment the lexicon's cross-translation surface aliases with KJV-specific
forms, so the reader's word-tap lexicon lights up on King James wording.

Why this exists: the renderer matches Greek/Hebrew lemmas to displayed text
by English *surface* string (TokenizedVerse.tsx, whole-word match). The
generated `_aliases.json` already lists KJV/NASB/ESV/NIV/... variants per
lemma, but its KJV coverage is patchy — it misses the archaic verb
inflections (`-eth` / `-est`, "hath", "doeth", "saith") and a few classic
KJV synonyms ("ghost", "raiment", "firmament"). Because the surface match
is strict whole-word, "love" never matches inside "loveth", so those words
silently fail to underline.

This script reads the existing `_aliases.json` + `_lemmas.json`, derives the
missing KJV forms deterministically (verb morphology gated on POS == "Verb",
plus a small curated synonym/irregular table), and writes the merged file
back. It is purely *additive* — no existing alias is removed — and needs no
network or API key, so it is safe to re-run.

The lemma *definitions* are language-of-origin and unchanged; only the
surface→lemma trigger list grows.

Usage:
  ./kjv_aliases.py --report                 # show what would change, write nothing
  ./kjv_aliases.py                          # update _aliases.json in place
  ./kjv_aliases.py --lexicon-src DIR --out FILE

By default reads/writes the sibling lexicon repo
(../../../verse-mate-lexicon/src/generated), falling back to the installed
@versemate/lexicon package for inputs when the sibling checkout is absent.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent                       # verse-mate-web/
SIBLING = REPO.parent / 'verse-mate-lexicon' / 'src' / 'generated'
PACKAGE = REPO / 'node_modules' / '@versemate' / 'lexicon' / 'src' / 'generated'

VOWELS = set('aeiou')

# Modern surface (already on the lemma) → archaic KJV forms to add alongside it.
# Applied to ANY lemma that already carries the trigger, so the form lands on
# the correct lemma. Conservative on purpose.
SYNONYMS: dict[str, list[str]] = {
    'spirit': ['ghost'],
    'clothing': ['raiment'],
    'clothes': ['raiment'],
    'garment': ['raiment'],
    'garments': ['raiment'],
    'expanse': ['firmament'],
    'vault': ['firmament'],
    'offspring': ['seed'],
    'descendants': ['seed'],
    'gentiles': ['heathen'],
}

# Irregular present-tense verbs whose -eth/-est forms aren't regular.
IRREGULAR: dict[str, list[str]] = {
    'have': ['hath', 'hast'],
    'do': ['doeth', 'doth', 'doest', 'dost'],
    'say': ['saith', 'sayest'],
    'shall': ['shalt'],
    'will': ['wilt'],
    'can': ['canst'],
    # Polysyllabic verbs stressed on a final CVC double the consonant — the
    # regular monosyllable rule can't detect stress, so list them explicitly.
    'commit': ['committeth', 'committest'],
    'forbid': ['forbiddeth', 'forbiddest'],
    'forget': ['forgetteth', 'forgettest'],
    'begin': ['beginneth', 'beginnest'],
    'fulfil': ['fulfilleth', 'fulfillest'],
    'fulfill': ['fulfilleth', 'fulfillest'],
    'worship': ['worshippeth', 'worshippest'],
}

# Whitelist of common English base verbs. We only derive archaic forms for a
# surface that IS one of these — alias lists are synonym sets (nouns, past
# tenses, paraphrases all mixed in), so inflecting every surface produces
# garbage like "utteranceth". This keeps output to genuine KJV verb forms.
WHITELIST: frozenset[str] = frozenset({
    'abide', 'accept', 'answer', 'appear', 'arise', 'ask', 'bear', 'become',
    'begin', 'behold', 'believe', 'belong', 'bind', 'bless', 'break', 'bring',
    'build', 'burn', 'call', 'carry', 'cast', 'cause', 'cease', 'choose',
    'cleave', 'come', 'command', 'commit', 'confess', 'consider', 'continue',
    'cry', 'cut', 'declare', 'deliver', 'depart', 'desire', 'destroy', 'die',
    'do', 'draw', 'drink', 'dwell', 'eat', 'enter', 'establish', 'fall',
    'fear', 'fight', 'fill', 'find', 'flee', 'fly', 'follow', 'forbid',
    'forget', 'forgive', 'forsake', 'fulfil', 'fulfill', 'gather', 'give',
    'go', 'grant', 'grow', 'hate', 'have', 'heal',
    'hear', 'help', 'hide', 'hold', 'honour', 'hope', 'judge', 'keep', 'kill',
    'know', 'labour', 'lay', 'lead', 'learn', 'leave', 'lend', 'lie', 'lift',
    'live', 'look', 'lose', 'love', 'make', 'meet', 'move', 'obey', 'offer',
    'open', 'overcome', 'pass', 'pay', 'perish', 'pour', 'praise', 'pray',
    'preach', 'prepare', 'present', 'proclaim', 'promise', 'prove', 'provide',
    'pull', 'put', 'raise', 'reach', 'read', 'receive', 'rejoice', 'remain',
    'remember', 'remove', 'rend', 'repent', 'rest', 'return', 'reveal', 'ride',
    'rise', 'rule', 'run', 'save', 'say', 'see', 'seek', 'sell', 'send',
    'serve', 'set', 'shew', 'show', 'shut', 'sing', 'sit', 'slay', 'sleep',
    'smite', 'sow', 'speak', 'spend', 'spread', 'stand', 'stay', 'strike',
    'suffer', 'swear', 'take', 'talk', 'teach', 'tell', 'tempt', 'think',
    'throw', 'touch', 'trust', 'turn', 'understand', 'wait', 'walk', 'wash',
    'watch', 'wear', 'weep', 'work', 'worship', 'write',
})


def _vowel_groups(s: str) -> int:
    groups, prev = 0, False
    for ch in s:
        v = ch in VOWELS
        if v and not prev:
            groups += 1
        prev = v
    return groups


def _archaic_verb_forms(base: str) -> list[str]:
    """Regular -eth (3rd sg.) and -est (2nd sg.) forms for a present verb."""
    if base in IRREGULAR:
        return list(IRREGULAR[base])
    if base.endswith('e'):
        return [base + 'th', base + 'st']
    if len(base) >= 2 and base[-1] == 'y' and base[-2] not in VOWELS:
        stem = base[:-1] + 'i'
        return [stem + 'eth', stem + 'est']
    # Monosyllabic CVC verbs double the final consonant: run→runneth, sit→sitteth.
    if (
        _vowel_groups(base) == 1
        and len(base) >= 3
        and base[-1] not in VOWELS
        and base[-1] not in 'wxy'
        and base[-2] in VOWELS
        and base[-3] not in VOWELS
    ):
        d = base + base[-1]
        return [d + 'eth', d + 'est']
    return [base + 'eth', base + 'est']


def augment(aliases: dict, lemmas: dict) -> tuple[dict, dict]:
    pos_of = {k: str(v.get('pos', '')).strip() for k, v in lemmas.items()}
    added_total = 0
    touched = 0
    examples: dict[str, list[str]] = {}

    for lemma, surfaces in aliases.items():
        if lemma == '_meta' or not isinstance(surfaces, list):
            continue
        present = {s.lower() for s in surfaces}
        new: list[str] = []

        if pos_of.get(lemma) == 'Verb':
            for s in list(surfaces):
                low = s.lower()
                if low not in WHITELIST:
                    continue
                for form in _archaic_verb_forms(low):
                    if form not in present:
                        present.add(form)
                        new.append(form)

        for s in list(surfaces):
            for arch in SYNONYMS.get(s.lower(), []):
                if arch not in present:
                    present.add(arch)
                    new.append(arch)

        if new:
            surfaces.extend(new)
            touched += 1
            added_total += len(new)
            if len(examples) < 12:
                examples[lemma] = new

    stats = {'lemmas_touched': touched, 'surfaces_added': added_total, 'examples': examples}
    return aliases, stats


def _resolve_inputs(src: Path | None) -> tuple[Path, Path, Path]:
    """Return (aliases_in, lemmas_in, default_out)."""
    if src:
        return src / '_aliases.json', src / '_lemmas.json', src / '_aliases.json'
    if (SIBLING / '_aliases.json').exists():
        return SIBLING / '_aliases.json', SIBLING / '_lemmas.json', SIBLING / '_aliases.json'
    # Inputs from the installed package; refuse to write there by default.
    return PACKAGE / '_aliases.json', PACKAGE / '_lemmas.json', SIBLING / '_aliases.json'


PROBES = ['loveth', 'keepeth', 'believeth', 'hath', 'doeth', 'saith', 'ghost', 'raiment']


def main() -> int:
    ap = argparse.ArgumentParser(description='Augment lexicon aliases with KJV archaic forms.')
    ap.add_argument('--lexicon-src', type=Path, help='dir with _aliases.json + _lemmas.json')
    ap.add_argument('--out', type=Path, help='output path for the merged _aliases.json')
    ap.add_argument('--report', action='store_true', help='print changes, write nothing')
    args = ap.parse_args()

    aliases_in, lemmas_in, default_out = _resolve_inputs(args.lexicon_src)
    out = args.out or default_out
    for p in (aliases_in, lemmas_in):
        if not p.exists():
            ap.error(f'input not found: {p}')

    aliases = json.loads(aliases_in.read_text(encoding='utf-8'))
    lemmas = json.loads(lemmas_in.read_text(encoding='utf-8'))

    merged, stats = augment(aliases, lemmas)
    print(f"lemmas touched: {stats['lemmas_touched']}, surfaces added: {stats['surfaces_added']}")
    print('examples:')
    for k, v in stats['examples'].items():
        print(f'   {k}: +{v}')

    # Verify the previously-failing probes now resolve somewhere.
    all_surf = {s.lower() for k, v in merged.items() if k != '_meta' and isinstance(v, list) for s in v}
    print('probe check:')
    for p in PROBES:
        print(f'   {p:11s}: ' + ('PRESENT' if p in all_surf else 'absent'))

    if args.report:
        print('\n--report: no file written.')
        return 0

    merged['_meta'] = {
        'description': merged.get('_meta', {}).get('description', '')
        if isinstance(merged.get('_meta'), dict) else '',
        'generated': 'augmented with KJV archaic forms by scripts/lexicon-ingest/kjv_aliases.py',
        'schema': 'Record<lemma_slug, string[]>',
    }
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(merged, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'\nwrote {out}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
