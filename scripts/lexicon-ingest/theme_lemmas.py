#!/usr/bin/env python3
"""
Post-process generated chapter alignments to pick `themeLemmas` per chapter.

The renderer uses themeLemmas to draw a chapter's spine words with a slightly
heavier underline (see .lex-word-theme in src/index.css). Hand-curated
chapters set this list explicitly. For generated chapters we approximate it
with a TF-IDF-ish score:

    score(lemma, chapter) = local_count_in_chapter / global_nt_count

The top N scoring lemmas in each chapter become its themeLemmas, subject to:
  - local count >= MIN_LOCAL_COUNT (must appear meaningfully in this chapter)
  - lemma not in GENERIC_RELIGIOUS_VOCAB (god/christ/jesus/lord are everywhere,
    so they bloat themeLemmas without telling you what THIS chapter is about)

Run AFTER build.py has emitted the per-chapter files. Modifies them in place
to add a "themeLemmas" array.
"""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT_DIR = HERE.parent.parent / 'src' / 'data' / 'lexicon' / 'generated'

TOP_N = 3
MIN_LOCAL_COUNT = 2
# Generic religious vocabulary — these are everywhere, so promoting them to
# themeLemmas doesn't tell the reader what this CHAPTER is about. They stay
# as subtle-tier tappable words and the chapter's distinctive language gets
# the visual emphasis.
GENERIC_RELIGIOUS_VOCAB = frozenset({
    # ─── Greek / NT ───
    'theos',        # θεός — God (~1,300× NT)
    'kurios',       # κύριος — Lord (~720× NT)
    'iesous',       # Ἰησοῦς — Jesus (~917× NT)
    'christos',     # Χριστός — Christ (~530× NT)
    'pater',        # πατήρ — Father
    'pneuma',       # πνεῦμα — Spirit
    'hagios',       # ἅγιος — holy (used as "saints" everywhere)
    'logos',        # λόγος — word
    'anthropos',    # ἄνθρωπος — man / human
    'adelphos',     # ἀδελφός — brother (vocative everywhere in epistles)
    'huios',        # υἱός — son
    'doulos',       # δοῦλος — servant (Pauline opening)
    'apostolos',    # ἀπόστολος — apostle (Pauline opening)
    'ouranos',      # οὐρανός — heaven
    'ge',           # γῆ — earth
    'hemera',       # ἡμέρα — day
    'soma',         # σῶμα — body
    'kardia',       # καρδία — heart
    'psuche',       # ψυχή — soul
    # ─── Hebrew / OT ───
    'yehovah',      # יְהוָה / YHWH (~6,800× OT)
    'elohim',       # אֱלֹהִים — God (~2,600× OT)
    'adonai',       # אֲדֹנָי — Lord
    'adon',         # אָדוֹן — lord, master
    'el',           # אֵל — God / mighty one
    'av',           # אָב — father
    'em',           # אֵם — mother
    'ben',          # בֵּן — son (~5,000× OT — narrative everywhere)
    'bat',          # בַּת — daughter
    'ish',          # אִישׁ — man (~2,160× OT)
    'ishshah',      # אִשָּׁה — woman
    'am',           # עַם — people
    'goy',          # גּוֹי — nation
    'yad',          # יָד — hand
    'panim',        # פָּנִים — face
    'ayin',         # עַיִן — eye
    'rosh',         # רֹאשׁ — head
    'lev',          # לֵב — heart
    'erets',        # אֶרֶץ — earth/land (~2,500× OT)
    'shamayim',     # שָׁמַיִם — heavens
    'bayit',        # בַּיִת — house (~2,000× OT)
    'ir',           # עִיר — city
    'derekh',       # דֶּרֶךְ — way
    'yom',          # יוֹם — day
    'shanah',       # שָׁנָה — year
    'malak',        # מַלְאָךְ — angel/messenger
    'mishpat',      # מִשְׁפָּט — judgment (occurs everywhere in Torah)
    'nefesh',       # נֶפֶשׁ — soul (very common despite theological weight)
    'davar',        # דָּבָר — word / thing (extremely common — narrative connector)
    'melekh',       # מֶלֶךְ — king
    'avadim',       # עֲבָדִים — servants (plural)
    'eved',         # עֶבֶד — servant
    'baal',         # בַּעַל — master / owner / Baal
})


def main() -> int:
    lemmas_path = OUT_DIR / '_lemmas.json'
    if not lemmas_path.exists():
        print(f'ERROR: {lemmas_path} not found. Run build.py first.')
        return 1
    lemmas = json.loads(lemmas_path.read_text())

    chapter_files = sorted(p for p in OUT_DIR.glob('*-*.json') if p.name != '_lemmas.json')
    if not chapter_files:
        print('ERROR: no generated chapter files. Run build.py first.')
        return 1

    print(f'Scoring {len(chapter_files)} chapter files…')
    updated = 0
    for path in chapter_files:
        data = json.loads(path.read_text())
        verses = data.get('verses', {})

        # Count each lemma's occurrences in this chapter.
        local = Counter()
        for tokens in verses.values():
            for tok in tokens:
                local[tok['lemma']] += 1

        # Score by local-vs-global ratio. The +1 in the denominator dampens
        # outlier cases where a lemma is rare globally — without it, a
        # 2-occurrence local + 2-occurrence global lemma would tie a
        # 100-occurrence local + 200-occurrence global lemma, which is wrong.
        scored = []
        for lemma_key, local_count in local.items():
            if local_count < MIN_LOCAL_COUNT:
                continue
            if lemma_key in GENERIC_RELIGIOUS_VOCAB:
                continue
            entry = lemmas.get(lemma_key)
            global_count = entry.get('ntFrequency', local_count) if entry else local_count
            # +3 smoothing — slight bias against very rare lemmas that
            # happen to occur 2-3 times in one chapter (hapaxes in narrative).
            score = local_count / (global_count + 3)
            scored.append((score, local_count, lemma_key))

        # Highest score wins; tie-break on local count desc.
        scored.sort(reverse=True)
        theme_lemmas = [lemma for _, _, lemma in scored[:TOP_N]]

        data['themeLemmas'] = theme_lemmas
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2))
        updated += 1

    print(f'Updated {updated} chapter files with themeLemmas (top {TOP_N}).')

    # Sanity check: print the picks for a few interesting chapters.
    samples = [
        ('philippians-1.json', 'Phil 1 — thanksgiving + partnership in gospel'),
        ('philippians-2.json', 'Phil 2 — Christ hymn + humility'),
        ('romans-7.json', 'Rom 7 — the inner war with sin'),
        ('romans-8.json', 'Rom 8 — life in the Spirit'),
        ('1-corinthians-13.json', '1 Cor 13 — love chapter'),
        ('hebrews-11.json', 'Heb 11 — by faith'),
        ('john-3.json', 'John 3 — born again'),
    ]
    print('\nSample theme picks:')
    for fname, desc in samples:
        p = OUT_DIR / fname
        if not p.exists():
            continue
        d = json.loads(p.read_text())
        picks = d.get('themeLemmas', [])
        print(f'  {desc}')
        print(f'    → {", ".join(picks) if picks else "(none)"}')

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
