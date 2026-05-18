"""Generate per-book TypeScript visual manifests from public/visuals/<slug>/.

Output: src/data/visuals/registry.ts — a single file VisualsPanel imports.

For every book we have at least one external asset, generate a `cards: VisualCard[]`
entry plus a `videos: VideoEntry[]` array (each with a chapterRange). James
also keeps the hand-curated Swindoll chart, the James↔Proverbs parallels
card, and the auto-generated key-word heatmap. Every other book today is
external-only (BibleProject poster + BibleProject overview video[s]) —
custom Versemate originals will be layered in later book-by-book.

Run from repo root:
  python3 scripts/visuals-ingest/build_manifests.py
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
PUBLIC_VISUALS = ROOT / "public" / "visuals"
OUT_TS = ROOT / "src" / "data" / "visuals" / "registry.ts"

# Source-of-truth: same POSTERS table used by ingest_bibleproject.py +
# per-book video metadata with chapter ranges.
from ingest_bibleproject import POSTERS  # type: ignore
from bibleproject_videos import VIDEOS  # type: ignore

# Books that ship a hand-curated VerseMate Original. James is the
# launch book; future books are added here only when their originals
# are produced and reviewed.
BOOKS_WITH_ORIGINALS: set[str] = {"james"}


def book_videos(slug: str) -> list[dict]:
    """Return the BibleProject overview videos for a book. Each entry has a
    chapterRange the React component uses to pick the right video for the
    current chapter."""
    raw = VIDEOS.get(slug, [])
    return [{
        "youtubeId": v["youtubeId"],
        "title": v["title"],
        "embedUrl": f"https://www.youtube-nocookie.com/embed/{v['youtubeId']}?autoplay=1&rel=0&modestbranding=1",
        "page": f"https://bibleproject.com/videos/{slug}/",
        "chapterStart": v["chapterRange"][0],
        "chapterEnd": v["chapterRange"][1],
    } for v in raw]


def book_cards(slug: str, display: str) -> list[dict]:
    """List of VisualCard entries for a book, in display order. Today every
    book gets the BibleProject Read Scripture poster; James also gets its
    custom-curated cards."""
    book_dir = PUBLIC_VISUALS / slug
    if not book_dir.exists():
        return []
    cards: list[dict] = []

    # 1. BibleProject Read Scripture poster.
    poster = book_dir / "bibleproject_poster.jpg"
    if poster.exists():
        cards.append({
            "id": "bp-poster",
            "title": f"BibleProject — Read Scripture: {display}",
            "caption": (
                f"Hand-illustrated single-page overview of {display}, "
                "tracing the book's literary design and major themes."
            ),
            "thumb": f"/visuals/{slug}/bibleproject_poster.jpg",
            "full":  f"/visuals/{slug}/bibleproject_poster.jpg",
            "attribution": {
                "label": "BibleProject · CC BY-SA 4.0",
                "href":  f"https://bibleproject.com/guides/book-of-{slug}/",
            },
        })

    # 2. James-only hand-curated originals (Swindoll, Parallels, Heatmap).
    if slug in BOOKS_WITH_ORIGINALS and slug == "james":
        swindoll = book_dir / "swindoll_james_chart.png"
        if swindoll.exists():
            cards.append({
                "id": "swindoll-chart",
                "title": "Chuck Swindoll — Structural Chart",
                "caption": (
                    "Divides James into major sections, anchoring each with "
                    "theme and key verse. From Insight for Living's free Bible charts."
                ),
                "thumb": "/visuals/james/swindoll_james_chart.png",
                "full":  "/visuals/james/swindoll_james_chart.png",
                "attribution": {
                    "label": "Insight for Living Ministries",
                    "href": "https://insight.org/resources/bible/the-general-epistles/james",
                },
                "download": {
                    "label": "Original PDF",
                    "href": "https://cdn.iflmedia.com/pdf/bible-charts/James-Bible-chart.pdf",
                },
            })
        parallels = book_dir / "versemate_james_proverbs_parallels.png"
        if parallels.exists():
            cards.append({
                "id": "vm-parallels",
                "title": "VerseMate Original — James & Proverbs",
                "caption": (
                    "Eight thematic parallels in NASB 1995 showing how James "
                    "drew his teaching from Solomon's wisdom well."
                ),
                "thumb": "/visuals/james/versemate_james_proverbs_parallels.png",
                "full":  "/visuals/james/versemate_james_proverbs_parallels.png",
                "attribution": {"label": "VerseMate Original", "href": "#"},
                "download": {
                    "label": "Print-ready PDF",
                    "href": "/visuals/james/versemate_james_proverbs_parallels.pdf",
                },
            })
        # James's heatmap uses the legacy filename predating the auto-generator.
        heatmap = book_dir / "versemate_james_keyword_heatmap.png"
        if heatmap.exists():
            cards.append({
                "id": "vm-heatmap",
                "title": "VerseMate Original — Architecture of James",
                "caption": (
                    "Dot-matrix heatmap of faith, works, tongue, and wisdom across all "
                    "108 verses. Chapter 2 = the faith/works debate; chapter 3 = the "
                    "tongue treatise."
                ),
                "thumb": "/visuals/james/versemate_james_keyword_heatmap.png",
                "full":  "/visuals/james/versemate_james_keyword_heatmap.png",
                "attribution": {"label": "VerseMate Original", "href": "#"},
                "download": {
                    "label": "Print-ready PDF",
                    "href": "/visuals/james/versemate_james_keyword_heatmap.pdf",
                },
            })

    return cards


def main() -> None:
    OUT_TS.parent.mkdir(parents=True, exist_ok=True)
    entries: list[str] = []
    book_count = 0
    for slug, (_url, display, _yt) in POSTERS.items():
        cards = book_cards(slug, display)
        videos = book_videos(slug)
        if not cards and not videos:
            continue
        entry = {"videos": videos, "cards": cards}
        entries.append(f"  '{slug}': {json.dumps(entry, indent=2, ensure_ascii=False)},")
        book_count += 1

    body = "\n".join(entries)
    ts = f"""/* eslint-disable */
/**
 * GENERATED FILE — do not edit by hand.
 *
 * Built by `scripts/visuals-ingest/build_manifests.py` from the assets in
 * public/visuals/<slug>/ plus the per-book metadata tables in the same
 * directory. To regenerate after adding new assets or videos:
 *
 *   python3 scripts/visuals-ingest/build_manifests.py
 *
 * Each book's `videos[]` entries carry an inclusive chapterRange so the
 * VisualsPanel can show the right BibleProject overview for the chapter
 * the user is currently reading (e.g. Genesis 5 → Part 1, Genesis 25 →
 * Part 2). Books with a single overview have one entry covering all
 * chapters; books without a verified YouTube ID have an empty array.
 */

export type VisualCard = {{
  id: string;
  title: string;
  caption: string;
  thumb: string;
  full: string;
  attribution: {{ label: string; href: string }};
  download?: {{ label: string; href: string }};
}};

export type VideoEntry = {{
  youtubeId: string;
  title: string;
  embedUrl: string;
  page: string;
  /** Inclusive chapter range this video covers. */
  chapterStart: number;
  chapterEnd: number;
}};

export type VisualsManifest = {{
  videos: VideoEntry[];
  cards: VisualCard[];
}};

export const VISUALS_REGISTRY: Record<string, VisualsManifest> = {{
{body}
}};

export const BOOKS_WITH_VISUALS: Set<string> = new Set(
  Object.keys(VISUALS_REGISTRY),
);

/** Lookup helper — slug is matched case-insensitively. */
export function getVisualsForBook(slug: string): VisualsManifest | null {{
  return VISUALS_REGISTRY[slug.toLowerCase()] ?? null;
}}

/** Pick the BibleProject overview that covers the given chapter, or null
 *  if the book has no videos / the chapter falls outside every range
 *  (shouldn't happen — chapter ranges in the manifest are exhaustive
 *  for every book that has any video). */
export function getVideoForChapter(
  manifest: VisualsManifest | null,
  chapter: number,
): VideoEntry | null {{
  if (!manifest) return null;
  for (const v of manifest.videos) {{
    if (chapter >= v.chapterStart && chapter <= v.chapterEnd) return v;
  }}
  return manifest.videos[0] ?? null;
}}
"""
    OUT_TS.write_text(ts)
    print(f"✓ Wrote {OUT_TS}")
    print(f"  Books with visuals: {book_count}")


if __name__ == "__main__":
    main()
