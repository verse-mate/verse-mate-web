"""Generate VerseMate key-word architecture heatmaps for all 66 Bible books.

Uses the lexicon data in `../verse-mate-lexicon/src/generated/<book>-<chapter>.json`
plus the master lemma metadata in `_lemmas.json` to:
  1. Aggregate lemma occurrences across every chapter of a book.
  2. Filter out function words (prepositions, articles, particles, etc.) by
     POS tag in _lemmas.json.
  3. Pick the top 4 content lemmas by frequency.
  4. Render a navy/gold dot-matrix heatmap PNG matching the James template.

Output:
  public/visuals/<book>/versemate_keyword_heatmap.png

Run from repo root:
  python3 visual_aids/scripts/generate_heatmaps.py
"""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

import matplotlib.patches as patches
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parent.parent.parent
LEX = ROOT.parent / "verse-mate-lexicon" / "src" / "generated"
OUT = ROOT / "public" / "visuals"

NAVY = "#1a2744"
GOLD = "#c5a572"
GOLD_LIGHT = "#faf7f0"
INK = "#2c3e50"
BODY = "#4a5568"
MUTED = "#8a7340"
BG = "#fefefe"

# POS tags from _lemmas.json that we exclude from "key words" — function
# words that show up everywhere without telling you anything about a book.
SKIP_POS_PREFIXES = (
    "Preposition", "Conjunction", "Particle", "Article",
    "Pronoun", "Demonstrative", "Interrogative", "Relative",
    "Adverb", "Interjection",
)
# Specific high-frequency lemmas that slip past the POS filter — common
# verbs, helpers, and "function-y" content words that aren't distinctive.
SKIP_LEMMAS: set[str] = {
    "eimi", "ginomai", "echo", "lego", "didomi", "poieo", "erchomai",
    "horao", "akouo", "ago", "kaleo", "lambano", "phemi", "duo", "treis",
    "pas", "polus", "heis",
    "amar", "asah", "natan", "halakh", "shama", "yada", "bo", "lakach",
    "qum", "yatza", "shuv", "ra'ah", "alah", "yashav", "echad", "shanim",
    "shaneh", "shem", "yom",
}

# 66-book canonical slug order.
BOOK_SLUGS = [
    "genesis", "exodus", "leviticus", "numbers", "deuteronomy",
    "joshua", "judges", "ruth", "1-samuel", "2-samuel",
    "1-kings", "2-kings", "1-chronicles", "2-chronicles",
    "ezra", "nehemiah", "esther", "job", "psalms", "proverbs",
    "ecclesiastes", "song-of-solomon", "isaiah", "jeremiah",
    "lamentations", "ezekiel", "daniel",
    "hosea", "joel", "amos", "obadiah", "jonah", "micah", "nahum",
    "habakkuk", "zephaniah", "haggai", "zechariah", "malachi",
    "matthew", "mark", "luke", "john", "acts", "romans",
    "1-corinthians", "2-corinthians", "galatians", "ephesians",
    "philippians", "colossians", "1-thessalonians", "2-thessalonians",
    "1-timothy", "2-timothy", "titus", "philemon", "hebrews", "james",
    "1-peter", "2-peter", "1-john", "2-john", "3-john", "jude", "revelation",
]


def load_lemma_master() -> dict:
    return json.load(open(LEX / "_lemmas.json"))


def load_book(slug: str):
    """Returns (chapters: list[int verses-per-chapter], lemma_positions: dict
    of lemma -> list of (linear_verse_index)) for the given book slug. The
    linear index is summed across chapters so it can be plotted on a single
    x-axis."""
    files = sorted(LEX.glob(f"{slug}-*.json"),
                   key=lambda p: int(p.stem.rsplit("-", 1)[-1]))
    if not files:
        return None
    chapters: list[int] = []
    chapter_offsets: list[int] = [0]
    lemma_positions: dict[str, list[int]] = {}
    for ch_file in files:
        data = json.load(open(ch_file))
        verses = data["verses"]
        verse_nums = [int(v) for v in verses.keys()]
        if not verse_nums:
            chapters.append(0)
            chapter_offsets.append(chapter_offsets[-1])
            continue
        n_verses = max(verse_nums)
        chapters.append(n_verses)
        for v_str, lex_entries in verses.items():
            v = int(v_str)
            linear = chapter_offsets[-1] + v
            for entry in lex_entries:
                lemma = entry.get("lemma")
                if lemma:
                    lemma_positions.setdefault(lemma, []).append(linear)
        chapter_offsets.append(chapter_offsets[-1] + n_verses)
    return chapters, lemma_positions, chapter_offsets


def pick_top_lemmas(positions: dict[str, list[int]], lemma_master: dict,
                    n: int = 4) -> list[tuple[str, dict, int]]:
    """Pick top-n content lemmas, skipping function words and stopwords."""
    counts = Counter({lemma: len(positions[lemma]) for lemma in positions})
    picks: list[tuple[str, dict, int]] = []
    for lemma, count in counts.most_common(200):
        if lemma in SKIP_LEMMAS:
            continue
        meta = lemma_master.get(lemma)
        if not meta:
            continue
        pos = meta.get("pos", "")
        if any(pos.startswith(skip) for skip in SKIP_POS_PREFIXES):
            continue
        gloss = (meta.get("basicGloss") or "").strip()
        if not gloss:
            continue
        # Skip purely proper-noun toponyms — keep proper-noun-person (those
        # are often the protagonist) but drop place names which clutter.
        if pos == "Proper noun (place)":
            continue
        picks.append((lemma, meta, count))
        if len(picks) == n:
            break
    return picks


def render(slug: str, chapters: list[int], chapter_offsets: list[int],
           top: list[tuple[str, dict, int]],
           positions: dict[str, list[int]], display_name: str) -> Path:
    total = chapter_offsets[-1]
    if total == 0 or len(top) == 0:
        return None  # type: ignore[return-value]

    fig = plt.figure(figsize=(12, 6.75), dpi=160, facecolor=BG)
    fig.patch.set_facecolor(BG)

    # === HEADER STRIP ===
    hero_ax = fig.add_axes([0, 0.83, 1, 0.17])
    hero_ax.set_xlim(0, 1); hero_ax.set_ylim(0, 1)
    hero_ax.axis("off")
    hero_ax.add_patch(patches.Rectangle((0, 0), 1, 1, facecolor=NAVY, edgecolor="none", zorder=0))
    hero_ax.add_patch(patches.Rectangle((0, 0.93), 1, 0.07, facecolor=GOLD, edgecolor="none", zorder=1))
    hero_ax.text(0.5, 0.80, f"V E R S E M A T E   ·   B O O K   O F   {display_name.upper()}",
                 ha="center", va="center", color=GOLD,
                 fontsize=9, fontweight="bold", family="sans-serif", zorder=2)
    hero_ax.text(0.5, 0.50, f"The Architecture of {display_name}",
                 ha="center", va="center", color=BG,
                 fontsize=26, fontweight="bold", family="serif", zorder=2)
    hero_ax.add_patch(patches.Rectangle((0.475, 0.28), 0.05, 0.012,
                                         facecolor=GOLD, edgecolor="none", zorder=2))
    hero_ax.text(0.5, 0.15,
                 "Where the four most frequent key words cluster across the book",
                 ha="center", va="center", color=GOLD,
                 fontsize=11, style="italic", family="serif", zorder=2)

    # === CHART ===
    ax = fig.add_axes([0.07, 0.20, 0.86, 0.55])
    ax.set_facecolor(BG)
    n_lanes = len(top)
    lane_y = list(range(n_lanes))[::-1]  # row 0 is bottom

    # Lane background shading
    for i, y in enumerate(lane_y):
        face = GOLD_LIGHT if i % 2 == 0 else BG
        ax.add_patch(patches.Rectangle((0, y - 0.45), total, 0.9,
                                       facecolor=face, edgecolor="none", zorder=0))

    # Chapter dividers
    for off in chapter_offsets[1:-1]:
        ax.axvline(off, color=GOLD, linewidth=1.0, alpha=0.7, zorder=1)

    # Chapter labels — adapt density + verbosity to chapter count so labels
    # never overlap. Long books show only every Nth chapter number; short
    # books spell out "CHAPTER N" with the verse count below.
    n_chapters = len(chapters)
    if n_chapters <= 6:
        label_style = "verbose"   # "CHAPTER N" + verse count
        label_step = 1
        label_size = 12
    elif n_chapters <= 16:
        label_style = "compact"   # "Ch N"
        label_step = 1
        label_size = 10
    else:
        label_style = "number"    # just the number
        label_step = max(1, n_chapters // 12)
        label_size = 9
    for i, n in enumerate(chapters):
        if i % label_step != 0 and i != n_chapters - 1:
            continue
        mid = chapter_offsets[i] + n / 2
        if label_style == "verbose":
            ax.text(mid, n_lanes - 0.18, f"CHAPTER {i+1}",
                    ha="center", va="bottom", color=MUTED,
                    fontsize=label_size, fontweight="bold", family="sans-serif", zorder=2)
            ax.text(mid, n_lanes - 0.40, f"{n} verses",
                    ha="center", va="bottom", color=BODY,
                    fontsize=10, style="italic", family="serif", zorder=2)
        elif label_style == "compact":
            ax.text(mid, n_lanes - 0.18, f"Ch {i+1}",
                    ha="center", va="bottom", color=MUTED,
                    fontsize=label_size, fontweight="bold", family="sans-serif", zorder=2)
        else:
            ax.text(mid, n_lanes - 0.18, f"{i+1}",
                    ha="center", va="bottom", color=MUTED,
                    fontsize=label_size, fontweight="bold", family="sans-serif", zorder=2)

    # Plot dots — size shrinks for huge books (Psalms has 2461 verses).
    base_size = max(40, min(200, int(8000 / max(total, 1))))
    for i, (lemma, meta, _count) in enumerate(top):
        y = lane_y[i]
        verse_counter = Counter(positions[lemma])
        for verse_pos, count in verse_counter.items():
            size = base_size + (count - 1) * (base_size * 0.6)
            ax.scatter([verse_pos], [y], s=size, color=NAVY, edgecolor=GOLD,
                       linewidth=1.2, zorder=4)

    # Lane labels (left)
    for i, (lemma, meta, count) in enumerate(top):
        y = lane_y[i]
        gloss = meta.get("basicGloss", lemma).split(":")[0].strip()
        translit = meta.get("translit") or lemma
        ax.text(-total * 0.015, y + 0.12, gloss.capitalize(),
                ha="right", va="center", color=NAVY,
                fontsize=17, fontweight="bold", family="serif", zorder=3)
        ax.text(-total * 0.015, y - 0.14, translit,
                ha="right", va="center", color=MUTED,
                fontsize=11, style="italic", family="serif", zorder=3)

    # Count labels (right)
    for i, (lemma, _meta, count) in enumerate(top):
        y = lane_y[i]
        ax.text(total + total * 0.015, y + 0.12, f"{count}×",
                ha="left", va="center", color=GOLD,
                fontsize=19, fontweight="bold", family="sans-serif", zorder=3)
        ax.text(total + total * 0.015, y - 0.14, "occurrences",
                ha="left", va="center", color=BODY,
                fontsize=9.5, family="sans-serif", zorder=3)

    ax.set_xlim(-total * 0.12, total + total * 0.12)
    ax.set_ylim(-0.7, n_lanes - 0.05)
    ax.set_xticks([])
    ax.set_yticks([])
    for s in ax.spines.values():
        s.set_visible(False)

    # === FOOTER ===
    foot_ax = fig.add_axes([0.07, 0.03, 0.86, 0.10])
    foot_ax.set_facecolor(GOLD_LIGHT)
    foot_ax.set_xlim(0, 1); foot_ax.set_ylim(0, 1)
    foot_ax.axis("off")
    foot_ax.add_patch(patches.Rectangle((0, 0), 0.012, 1,
                                         facecolor=GOLD, edgecolor="none",
                                         transform=foot_ax.transAxes))
    foot_ax.text(0.02, 0.92, "WHAT TO NOTICE",
                 ha="left", va="top", color=MUTED, fontsize=11,
                 fontweight="bold", family="sans-serif")
    top_label = top[0][1].get("basicGloss", top[0][0]).split(":")[0].strip().lower()
    insight = (
        f"{display_name} concentrates on these four lemmas. "
        f"{top_label.capitalize()} alone appears {top[0][2]} times across "
        f"{len(chapters)} chapter{'s' if len(chapters) > 1 else ''}, "
        f"{total} verse{'s' if total > 1 else ''} total. "
        "Dot clusters mark the passages where each key word concentrates — "
        "follow the gold gaps to find the book's pivots."
    )
    foot_ax.text(0.02, 0.62, insight,
                 ha="left", va="top", color=INK, fontsize=11,
                 family="serif", style="italic")
    foot_ax.text(0.98, 0.08, f"VERSEMATE · BOOK OF {display_name.upper()}",
                 ha="right", va="bottom", color=MUTED, fontsize=10,
                 fontweight="bold", family="sans-serif")

    out_dir = OUT / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    out_png = out_dir / "versemate_keyword_heatmap.png"
    plt.savefig(out_png, format="png", facecolor=BG, dpi=160, bbox_inches=None)
    plt.close()
    return out_png


def main() -> None:
    lemma_master = load_lemma_master()
    print(f"Loaded {len(lemma_master)} lemmas from master\n")
    failed = []
    for i, slug in enumerate(BOOK_SLUGS, start=1):
        try:
            loaded = load_book(slug)
            if not loaded:
                print(f"  [{i:2}/66] {slug:18} — NO LEXICON, skipping")
                continue
            chapters, positions, offsets = loaded
            top = pick_top_lemmas(positions, lemma_master, n=4)
            if not top:
                print(f"  [{i:2}/66] {slug:18} — no qualifying lemmas")
                continue
            display = " ".join(p.capitalize() for p in slug.replace("-", " ").split())
            # Display tweaks for common multi-part book names
            display = display.replace("Of Solomon", "of Solomon")
            out = render(slug, chapters, offsets, top, positions, display)
            top_str = ", ".join(f"{(m.get('basicGloss', l) or l).split(':')[0].strip()}({c})"
                                 for l, m, c in top)
            print(f"  [{i:2}/66] {slug:18} → top: {top_str}")
        except Exception as e:
            print(f"  [{i:2}/66] {slug:18} FAILED: {e}")
            failed.append(slug)
    print(f"\n✓ Done. Failed: {failed if failed else 'none'}")


if __name__ == "__main__":
    main()
