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
# Negative signals — once meant "decorative ornament / sidebar widget",
# but the audit showed every pattern here either had zero matches in the
# probe (logo/button/banner/header/divider/ornament) or matched real
# content (`_small` thumbnails of Cyrus's cylinder, Babylon archeological
# plans, the Salvator-Rosa "Covenant" painting; `icon` matches Iconium
# from Acts). The remaining true noise — Facebook / Twitter / WordPress
# share buttons, the "broken links" placeholder graphic — is excluded
# upstream by NOISE_FILENAMES in probe_precept_chapters.py.
NEGATIVE_HINTS: tuple[str, ...] = ()

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
# Filenames matching any of these substrings are excluded across every
# book. Bruce embeds dozens of AI-generated parable/sermon illustrations
# and stock-photo sermon visuals (military "about face", balance scales,
# crowns, ships in storms) which read as decorative pulpit content
# rather than study-grade biblical reference. Per-book exceptions can
# still override individual filenames via PER_BOOK_FILENAME_DENYLIST if
# needed.
GLOBAL_FILENAME_SUBSTRINGS_DENY: tuple[str, ...] = (
    # Bruce's AI-generated Jesus parable illustrations
    "jesus-",
    "jesusarrest", "jesusbeating", "jesuscamel", "jesuscarrying",
    "jesuscondemned", "jesuscross", "jesusdivorce", "jesuschild",
    # AI-generated OT scene illustrations (Joash crowning, etc.)
    "joashcrown", "joramcrown",
    # Stock-photo sermon illustrations
    "aboutface",          # military "about face" → "repent"
    "balance.jpg",        # generic scales-of-justice stock
    "longfuse",           # generic "long fuse" sermon illustration
    "church_holy_spirit", # stock church + dove
    "crown_small", "crown.gif", "crown.png",
    "shipstorm",          # storm-on-the-sea decorative
    "lastsupper1",        # decorative DaVinci-style art
    "baptismjesus",       # decorative baptism scene
    "transfig.jpg",       # decorative transfiguration art
    # Decorative single-object stock photos used as sermon props
    "balance.jpg", "beat.jpg", "bind.png", "bind.webp",
    "fear.png", "fig.jpg", "fig1.png",
    "cup.jpg", "fishhook", "judaskiss", "lostsheep",
    "mustard.gif", "mustard1", "mustardseed",
    "noman.jpg", "pearl", "pitcher1", "prison.webp",
    "prison.png", "prison.webp", "prison.jpg",
    "recline", "reed.jpg", "reprove", "rich.jpg",
    "sandals.jpg", "scribe.jpg", "sheepgoats", "sower.jpg",
    "sower1", "tassel", "tear.png", "tomb.jpg", "torture",
    "wept.jpg",
    # Numbered sermon-slide fragments from a Matthew 13 set
    "mt131.png", "mt132.png", "mt134.png", "mt135.png",
    "mt136.png", "mt137.png", "mt138.png",
    "shepherdholding", "pilateswife", "kingofjews",
    "last.png", "who.png", "waiting.png", "leaven.gif",
    "broad1", "twoone",
    "eccl-fear", "eccl-tear",
    "elijahfear",
    # Ecclesiastes parable visualizations
    "luke16rich",
)


PER_BOOK_FILENAME_DENYLIST: dict[str, set[str]] = {
    # Bruce embeds the same Exodus route map at TWO filenames; keep
    # exodusmap.gif and drop the byte-identical exodus.gif duplicate.
    "exodus": {
        # Prior-preview removals.
        "genesistimeline.png",
        "exodus.gif",          # byte-identical dup of exodusmap.gif
        "pogrom.jpg",          # 1614 Frankfurt pogrom print — not biblical
        "taskmaster.jpg",      # generic illustrative art
        "aaronhur.jpg",        # byte-identical dup of exodusamalekite.jpg
        # Audit pass (50 cards Andy marked from /audit/exodus.html) —
        # plague illustrations, Sinai art, ritual-object photos, AI scene
        # paintings (Moses striking the rock, Moses kills the Egyptian,
        # etc.) plus a couple of generic stock photos.
        "amalekite.jpg",
        "burnbush.gif",
        "exodus_15_bitter_water.jpg",
        "exodusamalekite.jpg",
        "exodusapis.jpg",
        "exodusarke.jpg",
        "exodusblood.jpg",
        "exoduschariot.jpg",
        "exodusdate.jpg",
        "exodusdead.jpg",
        "exodusdead1.jpg",
        "exodusdead2.jpg",
        "exoduseagle.jpg",
        "exodusfly.jpg",
        "exodusfrog.jpg",
        "exodusfrogheket.jpg",
        "exodusgeb.png",
        "exodusglorynight.jpg",
        "exodushornet.jpg",
        "exodushyssop.jpg",
        "exoduslapis.jpg",
        "exoduslaver.jpg",
        "exodusmercyseat.jpg",
        "exodusmirror.jpg",
        "exodusmtsinai.jpg",
        "exodusnilegod.jpg",
        "exodusphylactery.gif",
        "exoduspriest.jpg",
        "exodusredmoses.jpg",
        "exodusredsea.jpg",
        "exodusshof.jpg",
        "exodusshofar.jpg",
        "exodussin.jpg",
        "exodustable.jpg",
        "exodustribeplacement.jpg",
        "exoduswall.jpg",
        "fish.jpg",
        "foxes.jpg",
        "guard.jpg",
        "justice.jpg",
        "lamb_of_god_passover_small.gif",
        "locust.jpg",
        "mirror.jpg",
        "moseshidden.jpg",
        "moseskills.jpg",
        "mosestriking.jpg",
        "peda.jpg",
        "scales1.gif",
        "sheep_lamb_lying_down_small.jpg",
        "sinaifire.jpg",
    },
    "leviticus": {
        "levi.png",        # stock photo of stacked commentary books
        "leviticus.png",   # same decorative photo, alt filename (was in
                           # PRECEPT_CHARTS pre-#164; loose filter pulls
                           # it back from /leviticus_commentaries index)
        # Audit pass (20 cards Andy marked from /audit/leviticus.html) —
        # Hebrew-calendar reuse, AI/sermon priest illustrations, ritual
        # object photos, Day-of-Atonement scene panels.
        "calen.jpg",
        "circumcise.jpg",
        "circumcision.png",
        "exodusmtsinai.jpg",
        "firstfruits.jpg",
        "goats.png",
        "holiday.jpg",
        "lev1614.png",
        "lev166a.png",
        "lev167b.png",
        "liberty.jpg",
        "menorah.jpg",
        "mercyseat.jpg",
        "nadab.jpg",
        "priest.jpg",
        "rejoice.png",
        "ripples.jpg",
        "shofar1.jpg",
        "thronegrace.png",
        "yom.jpg",
    },
    "deuteronomy": {
        "mosesnebo1.png",  # AI-style art of Moses on Nebo
        "bee.jpg",         # photo of a bee swarm
        "grap.jpg",        # Poussin painting of grape carriers (art)
        "grapes.jpg",      # blue geometric pictogram of grape carriers
        # Audit pass (24 cards Andy marked from /audit/deuteronomy.html) —
        # Allstate-logo "Almighty hand" parody, generic-region maps,
        # AI Moses-on-Nebo / Moses-striking-rock paintings, Victor "His
        # Master's Voice" gramophone, mousetrap stock, justice statue.
        "almigthyhand.png",
        "avenger.jpg",
        "circumcise.jpg",
        "deut3247.png",
        "exodusmtsinai.jpg",
        "exodusphylactery.gif",
        "fork_in_the_road.jpg",
        "hermon1.jpg",
        "jabbok.jpg",
        "jordanrift.jpg",
        "justice.jpg",
        "korahfall.jpg",
        "listening1.jpg",
        "locust.jpg",
        "molech.jpg",
        "mosesnebo.jpg",
        "mosesstrike.jpg",
        "mousetrap.jpg",
        "nebo1.jpg",
        "onehorseshay.jpg",
        "siege.jpg",
        "sinaifire.jpg",
        "spy.jpg",
        "sworddam.jpg",
    },
    "joshua": {
        "joshualand.png",  # tribal-allotment column chart (low signal)
        "joshuamain.jpg",  # main book outline chart (low signal)
        "promised1.jpg",   # modern Middle East political map (anachronistic)
    },
    "judges": {
        "napthali.png",    # generic Twelve Tribes map (covered by other books)
        "sincycle.jpg",    # "Cycle of Sin in Judges" diagram (user-flagged)
        "judgesmap2.jpg",  # judges-influence territory map
        # Within-book duplicates of the cycle-of-sin chart and timeline:
        # Bruce hosts each at both a full-size and "_small" thumbnail
        # filename. Keep the full versions.
        "judges_chart_small.gif",   # dup of judges_chart.gif
        "judges_timeline_small.png",  # dup of judges_timeline.png
        "judgestimeline2.jpg",       # dup of judgestimeline.png
    },
    # Within-book byte-identical duplicates detected by MD5 across the
    # whole public/visuals/ tree. For each duplicate group we keep the
    # more descriptive filename. (The user previously flagged exodus.gif
    # vs exodusmap.gif as one such pair — that one is covered above.)
    "1-samuel": {"saulswars.jpg"},           # dup of saulbattles.jpg
    "2-kings":  {"hamath.jpg"},               # dup of elishatodamascus.jpg
    "acts":     {"luke.jpg"},                 # dup of luke2.jpg
    "luke": {
        "pontius.jpg",                        # dup of pilatestone.jpg
        "lukelifeofjesus.png",                # dup of luke_life_of_christ.png
    },
    "matthew":  {"herodtet.png"},             # dup of tetrarchmap.png
    "numbers": {
        "plain.jpg",  # byte-identical dup of moabplain.jpg
        # Audit pass (56 cards Andy marked from /audit/numbers.html) —
        # Aaron's rod / censer / lampstand ritual photos, Korah-rebellion
        # AI scenes, plague illustrations, generic Israelite-camp art,
        # Balaam's donkey, the bronze serpent, manna+quail decoratives.
        "almond.jpg",
        "ark.jpg",
        "arkbudall.jpg",
        "avenger.jpg",
        "balaamdonk.jpg",
        "bronze.jpg",
        "captive.jpg",
        "censer.jpg",
        "censer1.jpg",
        "exodusbrazen2.jpg",
        "exodushyssop.jpg",
        "exoduslampstand.jpg",
        "exoduslaver.jpg",
        "exodusmercyseat.jpg",
        "exodusphylactery.gif",
        "exodusshowbread.jpg",
        "exodustribeplacement.jpg",
        "firstfruits.jpg",
        "grap.jpg",
        "grapes.jpg",
        "holiday.jpg",
        "hor.jpg",
        "jabbok.jpg",
        "josh.png",
        "joshua.jpg",
        "kill.jpg",
        "king.png",
        "kings.jpg",
        "korah.jpg",
        "korahfall.jpg",
        "korahfire.jpg",
        "lamb_of_god_passover.gif",
        "locust1.jpg",
        "manna.jpg",
        "moabst1.jpg",
        "mosesland.jpg",
        "nadab.jpg",
        "nebo.jpg",
        "newmoon.jpg",
        "numbering.jpg",
        "pisgah.jpg",
        "priest.jpg",
        "quail.jpg",
        "rith.jpg",
        "sheep.jpg",
        "shofar1.jpg",
        "signet.jpg",
        "spoils.jpg",
        "spy.jpg",
        "sukkot.jpg",
        "tabernacle.jpg",
        "topographyisrael_small.jpg",
        "tru.jpg",
        "veng.jpg",
        "wild.jpg",
        "yom.jpg",
    },
    # Genesis editorial removals (flagged by Andy on the production preview):
    # - genesis.jpg (Michelangelo's Creation of Adam) — decorative art, not a
    #   study aid
    # - cambrian.jpg, evolutionape.jpg, evolutionapetoman.png — Bruce embeds
    #   evolutionary biology illustrations to argue against them, but they
    #   read as decorative on the Visuals tab without his surrounding text
    # - light1.jpg (electromagnetic spectrum), ocean.jpg (sea anemone photo),
    #   stars.jpg (Milky Way photo) — generic science stock imagery, not
    #   study-grade for Genesis 1
    "genesis": {
        # Earlier prior-preview removals (Michelangelo Creation, evolution
        # charts, EM spectrum, Milky Way, sea anemone).
        "genesis.jpg",
        "cambrian.jpg",
        "evolutionape.jpg",
        "evolutionapetoman.png",
        "light1.jpg",
        "ocean.jpg",
        "stars.jpg",
        # Audit pass (46 additional cards Andy marked from /audit/genesis.html)
        "abeisaac.jpg",
        "abrahamabim2.jpg",
        "abrahamsodom.jpg",
        "abramstars.jpg",
        "ai.jpg",
        "ararat.jpg",
        "arkrested.jpg",
        "arkshut2.jpg",
        "arpach1.jpg",
        "banished.jpg",
        "beer1.jpg",
        "cainbody.jpg",
        "caincount.jpg",
        "cainflee.jpg",
        "cainmurder.jpg",
        "cainpunish.jpg",
        "circumcise.jpg",
        "circumcision.png",
        "dove.jpg",
        "expulsion.jpg",
        "feetwashing.jpg",
        "gardeneden1.jpg",
        "ge2418.png",
        "ge3.jpg",
        "ge3.png",
        "hagarishmael2.jpg",
        "hagarishmaeldepart.jpg",
        "lot.png",
        "lotswife.jpg",
        "melchizedek1.jpg",
        "nimrod.jpg",
        "noahaltar.jpg",
        "noahfromararat.jpg",
        "noahpeoplesearth.jpg",
        "noahsark.jpg",
        "noahsarkconstruction.png",
        "noahsons.jpg",
        "rainbow1.jpg",
        "sodom.jpg",
        "sodom1.jpg",
        "tamarisk.jpg",
        "telomere.gif",
        "tent.jpg",
        "terah.jpg",
        "three.jpg",
        "wholeworld.jpg",
    },
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


# Minimum filename score to keep a candidate. Set to 0 so anything that
# isn't an explicit book-level Precept chart (already surfaced via
# ingest_precept.PRECEPT_CHARTS) passes — maps, photos, illustrations,
# tables, diagrams all clear the gate. Strong-keyword candidates still
# sort first via the score function for the per-chapter ranking.
#
# We rely on NOISE_FILENAMES (in probe_precept_chapters.py) for true
# noise and on PER_BOOK_FILENAME_DENYLIST for editorial exclusions.
MIN_SCORE = 0

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

        def is_globally_denied(fn: str) -> bool:
            return any(sub in fn for sub in GLOBAL_FILENAME_SUBSTRINGS_DENY)

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
                if fn in denylist or is_globally_denied(fn):
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

        # Pull in images from the /<book>_commentaries index page. These
        # are always book-level (Bruce's curated overview chart often
        # only appears here, never on chapter pages — see Genesis,
        # Numbers, Ezra). Dedup by filename: if a chapter probe already
        # surfaced the same image, skip — that entry already covers it.
        index_data = data.get("index") or {}
        seen_book_fns = {e["filename"] for e in book_level}
        for img_url in index_data.get("images") or []:
            fn = url_filename(img_url)
            if fn in denylist or fn in seen_book_fns or is_globally_denied(fn):
                continue
            sc = score(fn)
            if sc < MIN_SCORE:
                continue
            book_level.append({
                "filename": fn,
                "url": img_url,
                "score": sc,
                "chapters": [],
                "source": "index",
            })
            seen_book_fns.add(fn)
            total_seen += 1

        # Enforce "one map per chapter / one map per book". Bruce often
        # embeds two or three overlapping maps on the same chapter page
        # (a generic Israel map plus a battle-specific one plus a
        # regional one). For UX the user wants the highest-signal map
        # only — drop the others from the relevant scopes. Identification
        # is by substring "map" in the filename.
        def _is_map(fn: str) -> bool:
            return "map" in fn.lower()

        # First pass: build a canonical reference per filename so updates
        # to chapters arrays propagate across the per_chapter[ch] lists
        # (each list holds a separate dict after dedup, but they share
        # filename identity).
        canonical_entry: dict[str, dict] = {}
        for ch_list in per_chapter.values():
            for e in ch_list:
                canonical_entry.setdefault(e["filename"], e)

        # Per-chapter: walk each chapter, pick the top map, demote the
        # rest from this chapter (both in the list and in their chapters
        # arrays so build_manifests sees the narrower scope).
        for ch_str in sorted(per_chapter, key=int):
            ch_int = int(ch_str)
            maps = [e for e in per_chapter[ch_str] if _is_map(e["filename"])]
            if len(maps) <= 1:
                continue
            maps.sort(key=lambda c: (-c["score"], c["filename"]))
            winner_fn = maps[0]["filename"]
            kept = []
            for e in per_chapter[ch_str]:
                if _is_map(e["filename"]) and e["filename"] != winner_fn:
                    # Remove this chapter from the canonical entry's range
                    canon = canonical_entry[e["filename"]]
                    canon["chapters"] = [c for c in canon.get("chapters", [])
                                          if int(c) != ch_int]
                    continue
                kept.append(e)
            per_chapter[ch_str] = kept

        # Mirror the canonical chapters array back into every per_chapter
        # list entry so build_manifests reads consistent data.
        for ch_list in per_chapter.values():
            for e in ch_list:
                canon = canonical_entry.get(e["filename"])
                if canon and "chapters" in canon:
                    e["chapters"] = canon["chapters"]

        # Drop any entry now stranded with empty chapters.
        for ch_str in list(per_chapter.keys()):
            per_chapter[ch_str] = [e for e in per_chapter[ch_str]
                                    if not _is_map(e["filename"])
                                    or e.get("chapters")]
            if not per_chapter[ch_str]:
                del per_chapter[ch_str]

        # Book-level: keep one map at most.
        bl_maps = [e for e in book_level if _is_map(e["filename"])]
        if len(bl_maps) > 1:
            bl_maps.sort(key=lambda c: (-c["score"], c["filename"]))
            keep_fn = bl_maps[0]["filename"]
            book_level = [e for e in book_level
                          if not _is_map(e["filename"]) or e["filename"] == keep_fn]

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
