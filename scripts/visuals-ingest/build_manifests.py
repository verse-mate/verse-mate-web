"""Generate per-book TypeScript visual manifests from public/visuals/<slug>/.

Output: src/data/visuals/registry.ts — a single file VisualsPanel imports.

For every book that has at least one asset file in public/visuals/<slug>/,
generate a `cards: Visual[]` entry. James also gets the hand-curated
Swindoll chart and parallels card from the original PR.

Run from repo root:
  python3 visual_aids/scripts/build_manifests.py
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
PUBLIC_VISUALS = ROOT / "public" / "visuals"
OUT_TS = ROOT / "src" / "data" / "visuals" / "registry.ts"

# (book-slug, BibleProject poster URL, display name, optional YouTube ID)
# Same source-of-truth as ingest_bibleproject.py.
from ingest_bibleproject import POSTERS  # type: ignore


def book_video(slug: str, display: str) -> dict | None:
    """Return a video entry if the book has a known YouTube ID."""
    yt = POSTERS.get(slug, (None, None, None))[2]
    if not yt:
        return None
    return {
        "youtubeId": yt,
        "title": f"Book of {display} — Overview",
        "duration": "",
        "embedUrl": f"https://www.youtube-nocookie.com/embed/{yt}?autoplay=1&rel=0&modestbranding=1",
        "page": f"https://bibleproject.com/videos/{slug}/",
    }


def book_cards(slug: str, display: str) -> list[dict]:
    """List of Visual cards for a book, in display order."""
    book_dir = PUBLIC_VISUALS / slug
    if not book_dir.exists():
        return []
    cards: list[dict] = []

    # 1. BibleProject Read Scripture poster (always present if we ingested).
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

    # 2. James-only: Swindoll structural chart + Versemate parallels.
    if slug == "james":
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

    # 3. Versemate auto-generated key-word heatmap (every book with lexicon).
    heatmap_local = book_dir / "versemate_keyword_heatmap.png"
    if heatmap_local.exists():
        # Special filename for james (legacy compat from the original PR).
        if slug == "james":
            legacy = book_dir / "versemate_james_keyword_heatmap.png"
            if legacy.exists():
                heatmap_local = legacy
        cards.append({
            "id": "vm-heatmap",
            "title": f"VerseMate Original — Architecture of {display}",
            "caption": (
                f"Dot-matrix heatmap showing where the four most frequent key "
                f"words cluster across {display}. Auto-generated from the "
                "Greek/Hebrew lexicon."
            ),
            "thumb": f"/visuals/{slug}/{heatmap_local.name}",
            "full":  f"/visuals/{slug}/{heatmap_local.name}",
            "attribution": {"label": "VerseMate Original", "href": "#"},
        })

    return cards


def main() -> None:
    OUT_TS.parent.mkdir(parents=True, exist_ok=True)
    entries: list[str] = []
    book_count = 0
    for slug, (_url, display, _yt) in POSTERS.items():
        cards = book_cards(slug, display)
        if not cards:
            continue
        video = book_video(slug, display)
        entry = {"video": video, "cards": cards}
        entries.append(f"  '{slug}': {json.dumps(entry, indent=2, ensure_ascii=False)},")
        book_count += 1

    body = "\n".join(entries)
    # Generated header — match the codebase style (Roboto-ish, brief).
    ts = f"""/* eslint-disable */
/**
 * GENERATED FILE — do not edit by hand.
 *
 * Built by `visual_aids/scripts/build_manifests.py` from the assets in
 * public/visuals/<slug>/. To regenerate after adding new assets:
 *
 *   python3 visual_aids/scripts/build_manifests.py
 *
 * Books listed here automatically light up the Visuals tab in
 * CommentaryScreen / DesktopLayout. Books without a manifest entry show
 * the Visuals tab hidden, falling back to Summary / By-Line / Study.
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

export type VisualsManifest = {{
  video: {{
    youtubeId: string;
    title: string;
    duration?: string;
    embedUrl: string;
    page: string;
  }} | null;
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
"""
    OUT_TS.write_text(ts)
    print(f"✓ Wrote {OUT_TS}")
    print(f"  Books with visuals: {book_count}")


if __name__ == "__main__":
    main()
