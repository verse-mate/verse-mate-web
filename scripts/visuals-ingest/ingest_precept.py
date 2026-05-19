"""Bulk-download Precept Austin (Bruce Hurt) Bible study charts.

Source: https://www.preceptaustin.org — Bruce Hurt's inductive Bible study
site. Each book has a commentary page at `/<book>_commentaries` with
embedded charts. This script pulls the primary chart for each book where
one exists.

Coverage is uneven: ~40 of the 66 books have a clear chart on Precept
Austin. The other ~25 either have generic shared images (e.g., the same
"Paul writing" image across all Pauline epistles), photos/paintings
instead of charts, or no per-book chart at all. The curated mapping
below skips those rather than ship duplicate or generic content.

This script:
  1. For each curated slug, GETs the upstream chart with redirects
     followed (Precept Austin redirects /files/images/* to
     /sites/default/files/images/*).
  2. Resizes to 1600px max width.
  3. Saves to public/visuals/<slug>/precept_chart.<ext> (preserves
     original extension).

Run from repo root:
  python3 scripts/visuals-ingest/ingest_precept.py
"""
from __future__ import annotations

import io
import sys
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent.parent
PUBLIC_VISUALS = ROOT / "public" / "visuals"

# Curated per-book chart map. Filenames come from inspecting each book's
# commentary page. Books NOT in this map don't get a Precept Austin card
# (the per-book chart was either shared/generic or wasn't really a chart).
PRECEPT_CHARTS: dict[str, str] = {
    # Old Testament — clear "chart"-named files
    # Genesis's chart isn't on the /<book>_commentaries page (where the
    # other entries here came from); it lives on /genesis-1-resources.
    # Same /files/images/ pattern, so we still fetch it here.
    "genesis":       "genesis_book_of_beginnings.png",
    "exodus":        "exoduschart.png",
    "deuteronomy":   "deutchart.png",
    "joshua":        "joshuachart.png",
    "1-kings":       "1kichart.png",
    "2-kings":       "1kichart.png",  # Precept publishes a combined chart
    "ezra":          "ezrachart.png",
    "nehemiah":      "nehemiahchart.png",
    "esther":        "estherchart.png",
    "job":           "jobchart.png",
    # Jeremiah removed in audit pass — Bruce's chart didn't survive editorial review.
    "habakkuk":      "habakkukchart.png",
    # Old Testament — book-named charts (verified to be substantial PNGs).
    # NOTE: "leviticus.png" turned out to be a decorative photo of stacked
    # commentary books rather than a study chart — removed from the map.
    "ruth":          "ruth.png",
    "ecclesiastes":  "eccl.png",
    "daniel":        "daniel.png",
    "hosea":         "hosea.png",
    "joel":          "joel.png",
    "amos":          "amos.png",
    "obadiah":       "oba.png",
    "jonah":         "jonah.png",
    "micah":         "mic.png",
    "nahum":         "nah.png",
    "zephaniah":     "zephaniah.png",
    "haggai":        "haggai.png",
    "zechariah":     "zechariah.png",
    "malachi":       "malachi.png",

    # New Testament
    "matthew":       "matthew.png",
    "john":          "john.png",
    "acts":          "acts.png",
    "romans":        "romans.png",
    "titus":         "titus.png",
    "hebrews":       "hebrews.png",
    "james":         "james_chart.png",
    "1-peter":       "1_peter.png",
    "2-peter":       "2_peter.png",
    "1-john":        "1jo.png",
    "2-john":        "2jo.png",
    "3-john":        "3jo.png",
    "jude":          "jude.png",
}

# Books NOT in the map (and why):
#   numbers, judges, proverbs, song-of-solomon, mark, luke
#     — primary image is a small thumbnail rather than a content chart
#   leviticus
#     — `leviticus.png` is a decorative photo of stacked commentary books
#       (oil lamp, magnifying glass, open Bible), not a study chart
#   (genesis was previously skipped here too — the commentary page only
#    has a thumbnail — but its real chart turns up on the /resources page,
#    so it's now in the map above.)
#   psalms, ephesians
#     — no chart found / page didn't return content
#   isaiah, lamentations, ezekiel, revelation
#     — primary image is a painting or photo, not a chart
#   1-samuel, 2-samuel, 1-chronicles, 2-chronicles
#     — page references a generic "Kings" chart; not unique per book
#   1-corinthians .. philemon (Pauline corpus)
#     — page references a generic "Paul writing his epistles" image,
#       same across every Pauline letter; skipping to avoid duplicates


def fetch(url: str) -> bytes:
    """Fetch with redirect handling — Precept Austin redirects
    /files/images/* to /sites/default/files/images/*."""
    req = urllib.request.Request(
        url, headers={"User-Agent": "Mozilla/5.0 VerseMate-ingest/1.0"}
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def main() -> None:
    print(f"Ingesting Precept Austin charts for {len(PRECEPT_CHARTS)} books\n")
    failed: list[str] = []
    for i, (slug, filename) in enumerate(PRECEPT_CHARTS.items(), start=1):
        url = f"https://www.preceptaustin.org/files/images/{filename}"
        ext = Path(filename).suffix.lower()
        out_path = PUBLIC_VISUALS / slug / f"precept_chart{ext}"
        if out_path.exists():
            size = out_path.stat().st_size // 1024
            print(f"  [{i:2}/{len(PRECEPT_CHARTS)}] {slug:18} → already exists ({size} KB)")
            continue
        try:
            raw = fetch(url)
            img = Image.open(io.BytesIO(raw))
            if img.mode == "RGBA" and ext in {".jpg", ".jpeg"}:
                img = img.convert("RGB")
            w, h = img.size
            if w > 1600:
                ratio = 1600 / w
                img = img.resize((1600, int(h * ratio)), Image.LANCZOS)
            out_path.parent.mkdir(parents=True, exist_ok=True)
            if ext in {".jpg", ".jpeg"}:
                img.save(out_path, "JPEG", quality=85, optimize=True)
            else:
                img.save(out_path, "PNG", optimize=True)
            size = out_path.stat().st_size // 1024
            print(f"  [{i:2}/{len(PRECEPT_CHARTS)}] {slug:18} → {filename:30}  {size} KB")
        except Exception as e:
            print(f"  [{i:2}/{len(PRECEPT_CHARTS)}] {slug:18} FAILED: {e}", file=sys.stderr)
            failed.append(slug)

    print(f"\n✓ {len(PRECEPT_CHARTS) - len(failed)}/{len(PRECEPT_CHARTS)} Precept charts pulled")
    if failed:
        print(f"✗ Failed: {', '.join(failed)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
