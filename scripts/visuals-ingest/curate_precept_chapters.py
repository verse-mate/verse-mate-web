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

    JSON_OUT.write_text(json.dumps(curated, indent=2, ensure_ascii=False))
    MD_OUT.write_text("\n".join(md_lines) + "\n")

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
