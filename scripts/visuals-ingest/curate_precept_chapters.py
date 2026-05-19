"""Score and curate the raw Precept chapter image probe results.

Reads probe_precept_chapters.json (produced by probe_precept_chapters.py)
and walks every <book, chapter, image> triple, scoring each image on
how "study-chart-like" the filename looks. Output:

  precept_chapter_curated.json  — per-book / per-chapter shortlist of
                                  the highest-scoring images
  precept_chapter_curated.md    — human-readable preview to review
                                  before ingest

Scoring is purely a filename heuristic; we have no visual judgement here.
The shortlist is the candidate set — a human curator (you) approves or
prunes before any real downloads happen.

Run from repo root (after a probe):
  python3 scripts/visuals-ingest/curate_precept_chapters.py
"""
from __future__ import annotations

import json
import re
import urllib.parse
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROBE_IN = HERE / "probe_precept_chapters.json"
JSON_OUT = HERE / "precept_chapter_curated.json"
MD_OUT = HERE / "precept_chapter_curated.md"

# Strong positive signals — these words in a filename almost always mean
# a study chart, map, or timeline rather than an inline illustration.
STRONG_HINTS = (
    "chart", "map", "timeline", "outline", "overview",
    "chron", "chronolog", "genealog", "geneal", "dispens",
    "dia", "diagram", "schema", "stemma", "geo",
    "kingdom", "empire", "dynasty",
)
# Weak positive signals — file probably has interpretive value but is
# a stretch to call a "chart."
WEAK_HINTS = (
    "compare", "contrast", "summary", "structure",
    "outline", "framework", "panor", "stages",
)
# Negative signals — filenames that almost always mean inline photo,
# decorative ornament, or sidebar widget rather than a study chart.
NEGATIVE_HINTS = (
    "_small",  # Precept's inline thumbnail naming convention
    "small.",  # same idea on a different separator
    "icon",
    "logo",
    "button",
    "banner",
    "header",
    "divider",
    "ornament",
)

# Filenames already pulled in as the book-level Precept chart by
# ingest_precept.py — we never want to re-list them as per-chapter cards.
from ingest_precept import PRECEPT_CHARTS  # type: ignore
BOOK_LEVEL_FILENAMES = {Path(fn).name.lower() for fn in PRECEPT_CHARTS.values()}

# Manual per-book denylist: filenames that pass every other filter but
# editorially don't belong on this book's Visuals tab. Bruce sometimes
# embeds another book's chart for chronological / thematic context
# (e.g. the Genesis timeline at the start of Exodus to set up the
# patriarchal chronology). Those still pass the score heuristic; we
# exclude them by hand here.
PER_BOOK_FILENAME_DENYLIST: dict[str, set[str]] = {
    "exodus": {"genesistimeline.png"},
}

# Manual book-level additions: charts we curate in by hand on top of
# whatever the probe surfaces. Entries here flow into curated[<slug>]
# .book_level and get downloaded by ingest_precept_chapters.py and
# rendered by build_manifests.py exactly like discovered book-level
# entries.
#
# Each entry: filename (must match the upstream basename, after URL-
# decoding) + the canonical /files/images/ URL. Bruce sometimes hosts a
# chart on a different book's resources page than you'd expect — that's
# fine, the URL is the source of truth.
MANUAL_BOOK_CHARTS: dict[str, list[dict]] = {
    "numbers": [
        {"filename": "numbers.jpg",
         "url": "https://www.preceptaustin.org/files/images/numbers.jpg"},
        {"filename": "numberstime.jpg",
         "url": "https://www.preceptaustin.org/files/images/numberstime.jpg"},
    ],
    "deuteronomy": [
        {"filename": "deuttime.png",
         "url": "https://www.preceptaustin.org/files/images/deuttime.png"},
    ],
    "judges": [
        {"filename": "judgesjensen.png",
         "url": "https://www.preceptaustin.org/files/images/judgesjensen.png"},
    ],
    "2-samuel": [
        {"filename": "2saplot.png",
         "url": "https://www.preceptaustin.org/files/images/2saplot.png"},
        {"filename": "2satime.png",
         "url": "https://www.preceptaustin.org/files/images/2satime.png"},
    ],
    # Whitcomb's "Chart of Kings and Prophets" spans 1043 → 586 BC. Bruce
    # hosts it on the 1_samuel_commentaries page as two halves
    # (1kichart.png = 1043-722 BC, 1kichart2.png = 722-586 BC). The top
    # half is already the precept_chart.png for both Kings books via
    # ingest_precept.PRECEPT_CHARTS; add the bottom half here so both
    # books surface the full chronology. 12kingsall.png is a complete
    # reference table of every king (United / Northern / Southern) with
    # reign lengths and Scripture refs.
    "1-kings": [
        {"filename": "1kichart2.png",
         "url": "https://www.preceptaustin.org/files/images/1kichart2.png"},
        {"filename": "12kingsall.png",
         "url": "https://www.preceptaustin.org/files/images/12kingsall.png"},
    ],
    "2-kings": [
        {"filename": "1kichart2.png",
         "url": "https://www.preceptaustin.org/files/images/1kichart2.png"},
    ],
    # Chronicles books share Bruce's Kings & Prophets visualization
    # because they cover the same monarchical history from a different
    # vantage (priestly + temple-centric narrative). 1kichart.png pairs
    # the "Glory / Rupture / Corruption / Captivity" arc with Whitcomb's
    # 1043-931 BC chart; 1kichart2.png continues 722-586 BC.
    "1-chronicles": [
        {"filename": "1chrtimeline.png",
         "url": "https://www.preceptaustin.org/files/images/1chrtimeline.png"},
        {"filename": "1kichart.png",
         "url": "https://www.preceptaustin.org/files/images/1kichart.png"},
        {"filename": "1kichart2.png",
         "url": "https://www.preceptaustin.org/files/images/1kichart2.png"},
    ],
    "2-chronicles": [
        {"filename": "2chrtime.jpg",
         "url": "https://www.preceptaustin.org/files/images/2chrtime.jpg"},
        {"filename": "1kichart.png",
         "url": "https://www.preceptaustin.org/files/images/1kichart.png"},
        {"filename": "1kichart2.png",
         "url": "https://www.preceptaustin.org/files/images/1kichart2.png"},
    ],
    # Ezra + Nehemiah include both the historical-context charts (return
    # waves, Persian kings, the 70-year captivity) AND the geographic
    # maps that the user explicitly asked for. ezrahistroy2.png keeps the
    # upstream typo so the URL resolves.
    "ezra": [
        {"filename": "ezrahistory.png",
         "url": "https://www.preceptaustin.org/files/images/ezrahistory.png"},
        {"filename": "ezrahistroy2.png",
         "url": "https://www.preceptaustin.org/files/images/ezrahistroy2.png"},
        {"filename": "ezrareturn.png",
         "url": "https://www.preceptaustin.org/files/images/ezrareturn.png"},
        {"filename": "persiaezraesv.jpg",
         "url": "https://www.preceptaustin.org/files/images/persiaezraesv.jpg"},
    ],
    "nehemiah": [
        {"filename": "persiannehemiahesv.jpg",
         "url": "https://www.preceptaustin.org/files/images/persiannehemiahesv.jpg"},
        {"filename": "nehemiah.jpg",
         "url": "https://www.preceptaustin.org/files/images/nehemiah.jpg"},
    ],
}


def url_filename(url: str) -> str:
    return urllib.parse.unquote(
        Path(urllib.parse.urlparse(url).path).name
    ).lower()


def score(filename: str) -> int:
    """Higher is more chart-like. Negative = filter out."""
    s = 0
    if any(h in filename for h in STRONG_HINTS):
        s += 10
    if any(h in filename for h in WEAK_HINTS):
        s += 3
    if filename.endswith(".png"):
        s += 2  # charts are typically PNGs; photos are typically JPGs
    if any(h in filename for h in NEGATIVE_HINTS):
        s -= 8
    if filename in BOOK_LEVEL_FILENAMES:
        s -= 20  # already covered as the book-level Precept chart card
    return s


# Minimum filename score to keep a candidate. We require at least one
# "strong" keyword (chart/map/timeline/etc.) — a bare .png with no other
# signal is not enough.
MIN_SCORE = 10

# A chart that appears on more than this fraction of a book's chapters
# is treated as book-level reuse (e.g. the master outline embedded on
# every chapter page) and surfaced separately, not per-chapter.
BOOK_LEVEL_THRESHOLD = 0.5


def main() -> None:
    if not PROBE_IN.exists():
        raise SystemExit(f"Run probe first; missing {PROBE_IN}")
    probe = json.loads(PROBE_IN.read_text())

    curated: dict[str, dict] = {}
    md_lines: list[str] = ["# Precept chapter image curation\n"]
    md_lines.append(
        "Auto-generated shortlist of chart-like Precept Austin images. "
        "**Book-level** rows are charts embedded on most chapter pages (i.e. "
        "reused) — surfaced once at the book level. **Per-chapter** rows are "
        "charts only on a single chapter or a small subset. Review before "
        "ingesting.\n"
    )

    total_kept = 0
    total_seen = 0
    for slug, data in sorted(probe.items()):
        if not isinstance(data, dict) or "chapters" not in data:
            continue
        chapters = data.get("chapters", {})
        chapters_probed = sum(
            1 for info in chapters.values() if info.get("url") is not None
        )
        if chapters_probed == 0:
            continue

        denylist = PER_BOOK_FILENAME_DENYLIST.get(slug, set())

        # Pass 1: collect every (chapter, filename) candidate that beats
        # the MIN_SCORE threshold. We track which chapters each filename
        # appears on so we can split book-level vs chapter-specific.
        fn_chapters: dict[str, set[str]] = defaultdict(set)
        fn_score: dict[str, int] = {}
        fn_url: dict[str, str] = {}
        for chapter_str, info in chapters.items():
            for img_url in info.get("images") or []:
                total_seen += 1
                fn = url_filename(img_url)
                if fn in denylist:
                    continue
                sc = score(fn)
                if sc < MIN_SCORE:
                    continue
                fn_chapters[fn].add(chapter_str)
                fn_url.setdefault(fn, img_url)
                fn_score[fn] = max(fn_score.get(fn, 0), sc)

        book_level: list[dict] = []
        per_chapter: dict[str, list[dict]] = {}
        threshold_chapters = max(2, int(chapters_probed * BOOK_LEVEL_THRESHOLD))
        for fn, ch_set in fn_chapters.items():
            entry = {
                "filename": fn,
                "url": fn_url[fn],
                "score": fn_score[fn],
                "chapters": sorted(ch_set, key=int),
            }
            if len(ch_set) >= threshold_chapters:
                book_level.append(entry)
            else:
                for ch in ch_set:
                    per_chapter.setdefault(ch, []).append(entry)

        # Rank per-chapter entries by score descending.
        for ch in per_chapter:
            per_chapter[ch].sort(key=lambda c: (-c["score"], c["filename"]))
        book_level.sort(key=lambda c: (-c["score"], c["filename"]))

        kept = len(book_level) + sum(len(v) for v in per_chapter.values())
        total_kept += kept
        if kept == 0:
            continue
        curated[slug] = {
            "chapters_probed": chapters_probed,
            "book_level": book_level,
            "per_chapter": per_chapter,
            "kept": kept,
        }

        md_lines.append(
            f"\n## {slug} — {len(book_level)} book-level, "
            f"{sum(len(v) for v in per_chapter.values())} per-chapter "
            f"(probed {chapters_probed} chapters)\n"
        )
        if book_level:
            md_lines.append("### Book-level")
            for c in book_level:
                md_lines.append(
                    f"- {c['filename']} (score {c['score']}, "
                    f"{len(c['chapters'])} chapters) <{c['url']}>"
                )
        if per_chapter:
            md_lines.append("### Per-chapter")
            for ch in sorted(per_chapter, key=int):
                for c in per_chapter[ch]:
                    md_lines.append(
                        f"- **Ch {ch}** · {c['filename']} "
                        f"(score {c['score']}) <{c['url']}>"
                    )

    # Merge MANUAL_BOOK_CHARTS into the curated output. A book might have
    # no probe-derived entry yet (e.g. Numbers had every candidate filtered
    # out), so we bootstrap a new record when needed. Manual entries are
    # tagged with score=99 so they sort first and never look like noise.
    manual_added = 0
    for slug, extras in MANUAL_BOOK_CHARTS.items():
        rec = curated.setdefault(slug, {
            "chapters_probed": 0,
            "book_level": [],
            "per_chapter": {},
            "kept": 0,
        })
        existing = {e["filename"].lower() for e in rec["book_level"]}
        for extra in extras:
            fn = extra["filename"].lower()
            if fn in existing:
                continue
            rec["book_level"].append({
                "filename": fn,
                "url": extra["url"],
                "score": 99,
                "chapters": [],
                "manual": True,
            })
            existing.add(fn)
            manual_added += 1
        rec["kept"] = len(rec["book_level"]) + sum(len(v) for v in rec["per_chapter"].values())

    JSON_OUT.write_text(json.dumps(curated, indent=2, ensure_ascii=False))
    MD_OUT.write_text("\n".join(md_lines) + "\n")

    if manual_added:
        print(f"✓ Added {manual_added} manual book-level entries from MANUAL_BOOK_CHARTS")
    print(f"✓ Curated {total_kept} of {total_seen} images across {len(curated)} books")
    print(f"  → {JSON_OUT}")
    print(f"  → {MD_OUT}")
    print()
    print("=== top books by candidate count ===")
    for slug, c in sorted(curated.items(), key=lambda kv: -kv[1]["kept"])[:20]:
        bl = len(c["book_level"])
        pc = sum(len(v) for v in c["per_chapter"].values())
        print(f"  {slug:18}  book-level {bl:>2}  per-chapter {pc:>3}")


if __name__ == "__main__":
    main()
