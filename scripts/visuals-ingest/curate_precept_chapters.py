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
        "leviticuschart.jpg",  # decorative Leviticus title cover
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
        # Audit pass (19 cards Andy marked from /audit/joshua.html) —
        # Achan-rebellion scene paintings, Aijalon valley + Beth-horon
        # AI battle art, circumcision diagram, "sun stands still"
        # decorative, mousetrap stock photo.
        "achanbab.jpg",
        "achanbury.jpg",
        "achanstone.jpg",
        "aijalon.jpg",
        "aijavelin.jpg",
        "avenger.jpg",
        "bethhoron.jpg",
        "circumcise.jpg",
        "discharge.jpg",
        "fivekings.jpg",
        "flint.jpg",
        "gerizim1.jpg",
        "joshua24.jpg",
        "joshua3.jpg",
        "joshua6.jpg",
        "lot.jpg",
        "mansoul.jpg",
        "mousetrap.jpg",
        "sunstandstill1.jpg",
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
        # Audit pass (24 cards Andy marked from /audit/judges.html) —
        # Samson scene set (jawbone, lion, treadmill, knee, death,
        # Delilah, blind, golden), Gideon scenes (lamps, ephod,
        # earrings, bread, lapping water), Deborah paintings,
        # Abimelech's death, threshing/winnowing stock, shofar.
        "abimelechdeath.jpg",
        "angel.jpg",
        "deborahpicture.jpg",
        "deborahvictory.jpg",
        "frog.jpg",
        "gideonbread.jpg",
        "gideonephod.jpg",
        "gideongoldearrings.jpg",
        "gideonlamps.jpg",
        "gideonlappingwater.jpg",
        "millstone.jpg",
        "priest.jpg",
        "samsonblind.jpg",
        "samsondeath1.jpg",
        "samsondelilah.jpg",
        "samsong.jpg",
        "samsonjawbone.jpg",
        "samsonknee1.jpg",
        "samsonlion1.jpg",
        "samsontreadmill.jpg",
        "shofar.jpg",
        "tabormt.jpg",
        "thresh.jpg",
        "winnow.jpg",
    },
    "1-kings": {
        # Auto-prune pass: pattern-matched on Andy's manual deletions
        "aramkings.jpg",
        "exodusark.jpg",
        "exodusbrazen2.jpg",
        "exodusdate.jpg",
        "exoduslampstand.jpg",
        "exodusshowbread.jpg",
        "expulsion.jpg",
        "frog.jpg",
        "shofar.jpg",
        "solomonark.jpg",
        # V4 auto-prune pass (character + scene patterns)
        "ahabb.png",
        "ahabben.jpg",
        "ahabjeh.png",
        "ahabmic.png",
        "ahabpro.png",
        "ahabsack.png",
        "ahabvex.png",
        "ahabwound.png",
        "ahabzed.png",
        "davidcold.png",
        "davidcon.jpg",
        "daviddeath.png",
        "elijah.jpg",
        "elijahahabworship.jpg",
        "elijahaltar.png",
        "elijahbrook.png",
        "elijahcarmel.png",
        "elijahcattle.jpg",
        "elijahcave.png",
        "elijahconfrontsahab.png",
        "elijahflouroil.jpg",
        "elijahhoreb.png",
        "elijahjuniper.png",
        "elijahmantle.png",
        "elijahmess1.png",
        "elijahmouthcave.png",
        "elijahnocloud.jpg",
        "elijahoba.png",
        "elijahonson.jpg",
        "elijahpaint.jpg",
        "elijahpr.png",
        "elijahpray.jpg",
        "elijahraven.png",
        "elijahrun.png",
        "elijahseize.png",
        "elijahsondies.jpg",
        "elijahstorm.jpg",
        "elijahtrench.jpg",
        "elijahwater.jpg",
        "elijahwoman.png",
        "hornsaltar.png",
        "jeroboamgold.png",
        "jeroboamson1.png",
        "lion.png",
        "lion3.png",
        "shimei.png",
        "solomon.jpg",
        "solomon.png",
        "solomon101.png",
        "solomon700.png",
        "solomonbaby.png",
        "solomoncedar1.png",
        "solomonchemosh.png",
        "solomongezer.png",
        "solomongordoniah.png",
        "solomonjachin.jpg",
        "solomonjerusalem.jpg",
        "solomonkor2.png",
        "solomonsheba.png",
        "solomonstand.jpg",
        "solomonstoreroom.jpg",
        "splitaltar.png",
        # Audit pass (21 cards Andy marked from /audit/1-kings.html) —
        # more elijah/ahab/solomon scene art the v4 prefix-matcher
        # didn't catch (abiathar AI, ahijah, oldprophet, withered hand,
        # Sheba-queen visit, throne, Shishak invasion), plus generic
        # decoratives (dogs.png, reed.png, truman.png, dove animation,
        # ezion gulf photo, ezekie7 hand-drawing).
        "ababjeh.png",
        "abiathar.png",
        "ahahelijah.png",
        "ahahnaboth.png",
        "ahijah.png",
        "bathsol.png",
        "circumcise.jpg",
        "dan1.jpg",
        "dogs.png",
        "exodusincense.png",
        "ezekie7.gif",
        "ezion2.jpg",
        "oldprophet.png",
        "peace_dove_olive_branch_animation.gif",
        "reed.png",
        "shebaqueen.jpg",
        "shishak.jpg",
        "solomonarktotemple.jpg",
        "solomonthrone.jpg",
        "truman.png",
        "withered.png",
    },
    "1-samuel": {
        # Auto-prune pass: pattern-matched on Andy's manual deletions
        "amalekite.jpg",
        "ark.jpg",
        "exoduslampstand.jpg",
        "exoduspriest.png",
        "judeanwild.jpg",
        "listening1.jpg",
        "priest.jpg",
        "shofar.jpg",
        # Audit pass (65 cards Andy marked from /audit/1-samuel.html) —
        # David scene paintings (anointing, cave, cutting Saul's robe,
        # harp, jug, lion, men, Nob, spear, sword), Goliath scenes,
        # Hannah, Endor witch, Dagon falling, Ebenezer, Gilboa,
        # plague stock (bubonic, hemorrhoid, golden mice), generic
        # weapons and objects (sling, mattock, plowshare, terebinth).
        "anointdavid.jpg",
        "bear.jpg",
        "bethlehem.jpg",
        "biblelight.jpg",
        "bones.jpg",
        "bread.jpg",
        "bubonic.jpg",
        "dagondestroyed.gif",
        "davidabig.jpg",
        "davidcave.jpg",
        "davidcuts.jpg",
        "davidddd.jpg",
        "davidharp.jpg",
        "davidjon.jpg",
        "davidjug.jpg",
        "davidjug1.jpg",
        "davidlion.jpg",
        "davidmad.jpg",
        "davidmen.jpg",
        "davidnob.jpg",
        "davidspear.jpg",
        "davidsword.jpg",
        "djparting.jpg",
        "doeg.jpg",
        "ebenezer.jpg",
        "endor.jpg",
        "engedidavidfalls.jpg",
        "fill2.jpg",
        "giant.jpg",
        "gilboajezreel.jpg",
        "goldenmice.jpg",
        "goliathhead.jpg",
        "greave.png",
        "hannah.jpg",
        "harp.jpg",
        "hemorrhoid.png",
        "horns.png",
        "jondav.jpg",
        "kingsize.jpg",
        "maon.jpg",
        "mattock.jpg",
        "michmash2.jpg",
        "michmash3.jpg",
        "nabal.jpg",
        "nob.png",
        "partridge1.jpg",
        "plowshare.png",
        "pogo.jpg",
        "pom.jpg",
        "ps119.jpg",
        "samuelo.jpg",
        "samuelsbirth.jpg",
        "saulsbody.jpg",
        "saulspear.png",
        "saulterror.jpg",
        "scrabble.jpg",
        "sling.jpg",
        "terebinth.jpg",
        "thresh.jpg",
        "valleyelah.jpg",
        "weavers.jpg",
        "wildgoat1.jpg",
        "witchendor.jpg",
        "witchendor2.jpg",
        "ziklagburning.jpg",
    },
    "1-corinthians": {
        # Auto-prune pass: pattern-matched on Andy's manual deletions
        "exodusredmoses.jpg",
        "korah.jpg",
        "korahfall.jpg",
        "manna.jpg",
        "molech.jpg",
        "mosesstrike.jpg",
        "quail.jpg",
        # V4 auto-prune pass (character + scene patterns)
        "death.jpg",
        "paul_epistle.jpg",
        # Audit pass (32 cards Andy marked from /audit/1-corinthians.html) —
        # Corinth archeology + ancient-stadium photos (acrocorinth,
        # aphrodite, bema variants, isthmian games, ben-hur, taylor),
        # sermon-prop stocks (bronze, calf, censer, charity, dine,
        # family, firstfruits1, imitate, immortal, jealousy, mirror,
        # neck, pedagogue, porn, seed, soilshallow, spirit gif,
        # spurgeon podium, thresh, wisdom1, wreath), generic.
        "acrocorinth.jpg",
        "aphrodite.jpg",
        "bc_runner1.gif",
        "bema.jpg",
        "bema1.jpg",
        "bema2.jpg",
        "benhur.jpg",
        "box.jpg",
        "bronze.jpg",
        "calf.jpg",
        "censer1.jpg",
        "charity.jpg",
        "dine.jpg",
        "family.png",
        "firstfruits1.jpg",
        "imitate.jpg",
        "imitate1.jpg",
        "immortal.jpg",
        "isthmian.jpg",
        "jealousy.jpg",
        "mirror1.jpg",
        "neck.jpg",
        "pedagogue.jpg",
        "porn.jpg",
        "seed.jpg",
        "soilshallow.jpg",
        "spirit1.gif",
        "spurgeonpodium.jpg",
        "taylor.jpg",
        "thresh.jpg",
        "wisdom1.jpg",
        "wreath.jpg",
    },
    "1-chronicles": {
        # Auto-prune pass: pattern-matched on Andy's manual deletions
        "exodusark.jpg",
        "exoduslampstand.jpg",
        "exodusshowbread.jpg",
        "shemtoterah.png",
        "shofar.jpg",
        # V4 auto-prune pass (character + scene patterns)
        "davidcon.jpg",
        "daviddefeatphil.png",
        "davidline.png",
        "davidmen.jpg",
        "davidsconquests.png",
        "davidtoamaziah.png",
        "davidunited.png",
        "sauldeath.jpg",
        "saulsbody.jpg",
        # Audit pass (9 cards Andy marked from /audit/1-chronicles.html) —
        # generic stock photos (bones, sackcloth, time-flies clock, tree),
        # Dome-of-the-Rock photo, Aaron's incense altar reused, Joshua
        # scene reused, Nadab AI, Valley of Rephaim.
        "bones.jpg",
        "domerock1.jpg",
        "exodusincense.png",
        "joshua3.jpg",
        "nadab.jpg",
        "sackcloth.jpg",
        "timeflies.jpg",
        "tree.png",
        "valleyrephaim.jpg",
    },
    "2-samuel": {
        # Auto-prune pass: pattern-matched on Andy's manual deletions
        "jordanrift.jpg",
        "jordanrift1.jpg",
        "shofar.jpg",
        "sworddam.jpg",
        # V4 auto-prune pass (character + scene patterns)
        "absalomhang.jpg",
        "absalomsreb.jpg",
        "absalomtamar.jpg",
        "barleyfire.jpg",
        "david_and_nathan_2_small.jpg",
        "davidabjoab.jpg",
        "davidcon.jpg",
        "daviddefeatphil.png",
        "davidlife.jpg",
        "davidsconquests.png",
        "davidstriumphs.jpg",
        "spear.jpg",
        # Audit pass (7 cards Andy marked from /audit/2-samuel.html) —
        # Mephibosheth, Tamar/Amnon scene art, Valley of Rephaim,
        # water-rescue + wise-woman-of-Tekoa AI illustrations.
        "meph.jpg",
        "tamar.jpg",
        "tamar1.jpg",
        "tamarrape.jpg",
        "valleyrephaim.jpg",
        "waterrescue.jpg",
        "womantekoa.jpg",
    },
    "galatians": {
        # Auto-prune pass: pattern-matched on Andy's manual deletions
        "abramstars.jpg",
        "fish.jpg",
        "guard.jpg",
        "sworddam.jpg",
        # V4 auto-prune pass (character + scene patterns)
        "paul_epistle.jpg",
        "yoke.jpg",
        # Audit pass
        "mirror.jpg",
        "paulpeter.jpg",
        "peda.jpg",
    },
    "2-kings": {
        # Auto-prune pass: pattern-matched on Andy's manual deletions
        "aramkings.jpg",
        "exodusark.jpg",
        "jordanrift.jpg",
        "meshaking.png",
        # V4 auto-prune pass (character + scene patterns)
        "ahabb.png",
        "ahazrezinpekah.png",
        "ahaztribute.jpg",
        "davidsconquests.png",
        "elisha.jpg",
        "elishabears.png",
        "elishajericho.png",
        "elishatodamascus.jpg",
        "hezekiah.jpg",
        "hezekiahprayer.png",
        "isaiahsaw.png",
        "jehu.jpg",
        "jehuexecutes.jpg",
        "jezebeldogs.jpg",
        "jezebeldore.jpg",
        "jezebelseal.jpg",
        "joramaha.jpg",
        "joramjeh.png",
        "moabbattle.jpg",
        "naamanheal.jpg",
        "naamanjordan.png",
        "zedekiahblind.jpg",
        # Audit pass (27 cards Andy marked from /audit/2-kings.html) —
        # Baal scenes, exile illustration, Salvator-Rosa "Covenant"
        # painting, plague/curse stocks (gift gif, fishbait, gourd,
        # girdloins, jehoiakim scroll, jezdogs, libnah, moabblood,
        # nehushtan, syncretism), pillars/stands/stele/teldan/templeton
        # decoratives. Even Sennacherib Prism + Moabite Stone artifacts
        # weren't compelling on this book's tab.
        "2king127.png",
        "2kings122.png",
        "baal.jpg",
        "baalz.png",
        "covenant_-_salvator_rosa_1615-1673.jpg",
        "dividedheart.jpg",
        "exile1.jpg",
        "fishbait.jpg",
        "gift.gif",
        "girdloins.jpg",
        "gourd.jpg",
        "jehoiakimscroll.jpg",
        "jezdogs.jpg",
        "libnah.jpg",
        "moabblood.jpg",
        "moabitestone.jpg",
        "moablood1.jpg",
        "nehushtan.jpg",
        "peace_dove_olive_branch_animation.gif",
        "pillars1.png",
        "sennacheribprism.png",
        "sennacheribseige.png",
        "stands.jpg",
        "stele.jpg",
        "syncretism.jpg",
        "teldan.jpg",
        "templeton.gif",
    },
    "acts": {
        # Auto-prune pass: pattern-matched on Andy's manual deletions
        "abramstars.jpg",
        "molech.jpg",
        "scales1.gif",
        "sinaimoses.jpg",
        # V4 auto-prune pass (character + scene patterns)
        "paulconversion.jpg",
        "saulconversion.jpg",
        "stephen.jpg",
        "yoke.jpg",
        # Audit pass (76 cards Andy marked from /audit/acts.html) —
        # Acts route map gif, AI Pentecost (acts2tongue) + ascension,
        # Joseph back-references, Areopagus sermon, Antioch missionary
        # journeys (antiochreturn, antiochtoj), Antonia + temple
        # complex photos, Areopagus + Athens (agora, sergius), Cyprus/
        # Cyrene (caesareaancient, cauda, cnidus), shipwreck details
        # (ship, shipeye, shipsounding, shipwreck, rudder, rhegium,
        # myra, miletus-cos, lystratotroas, messinastrait, viaegnatia,
        # straightstreet, appianway), Felix/Festus/Agrippa/Bernice
        # AI scenes, Ephesus theater/Artemis, baptisms (baptism eunuch,
        # heart, finger, goad sermon-prop), various luke2/ascension/
        # iconium reuse, generic Christian stocks (faithchinese,
        # gospel_bridge, dynamite, homecoming, jesusknocking1, justice,
        # lamb, timeflies, whitewash).
        "acts13.jpg",
        "acts27map.gif",
        "acts2tongue.jpg",
        "acts_to_the_gospels_small.png",
        "aeropagussermon.jpg",
        "agora.jpg",
        "antiochreturn.png",
        "antiochtoj.png",
        "antonia.jpg",
        "antoniasteps.jpg",
        "appianway.jpg",
        "artemisstatue.jpg",
        "artemistemple.jpg",
        "ascension.jpg",
        "baptismeunuch.jpg",
        "bc_runner1.gif",
        "bernice.jpg",
        "caesareaancient.jpg",
        "cauda.jpg",
        "cnidus.jpg",
        "demon.jpg",
        "dynamite.png",
        "ephesustheater.jpg",
        "faithchinese.jpg",
        "felixpaul.gif",
        "felixpaulcolor.jpg",
        "finger.jpg",
        "goad.jpg",
        "gospel_bridge_3.gif",
        "heart.png",
        "heaven.jpg",
        "homecoming.jpg",
        "iconium.png",
        "iconiumlystra.png",
        "jesusknocking1.jpg",
        "josephinterpret.jpg",
        "josephjealous.jpg",
        "josephrecognized.jpg",
        "justice.jpg",
        "lamb_cross.jpg",
        "lamb_passover.gif",
        "luke2.jpg",
        "lystratotroas.jpg",
        "messinastrait.jpg",
        "miletus-cos.jpg",
        "mosesnile.jpg",
        "myra.jpg",
        "paulagrippa.jpg",
        "paulbarnabassplit.jpg",
        "paulcon.jpg",
        "paulfestus.jpg",
        "peterlame.jpg",
        "petersvision.jpg",
        "rhegium.jpg",
        "romeancient.jpg",
        "rudder.jpg",
        "sanhedrin.jpg",
        "scourge2.jpg",
        "sergius.png",
        "shigella.jpg",
        "ship.jpg",
        "shipeye.jpg",
        "shipsounding.jpg",
        "shipwreck.jpg",
        "shut.jpg",
        "simonmagus.jpg",
        "solomonporch.jpg",
        "straightstreet.jpg",
        "synagogue.png",
        "temple_6_small.png",
        "templecomplex.jpg",
        "the_sacrifice_of_isaac_small.jpg",
        "timeflies.jpg",
        "unkgod_small.jpg",
        "viaegnatia.jpg",
        "whitewash.jpg",
    },
    "revelation": {
        # Auto-prune pass: pattern-matched on Andy's manual deletions
        "exoduslampstand.jpg",
        "menorah.jpg",
        "mousetrap.jpg",
        "scales1.gif",
        # V4 auto-prune pass (character + scene patterns)
        "jezebel.jpg",
        "pergamumsword.jpg",
        "pergamumzeusaltar.jpg",
        # Audit pass (49 cards Andy marked from /audit/revelation.html) —
        # Seven-Churches archaeology photo set (Ephesus, Smyrna,
        # Pergamum, Thyatira, Sardis, Laodicea) — interesting context
        # but visually low-signal on the Visuals tab; AI throne /
        # 24-elders / John-on-Patmos / martyr scenes; vision panels
        # (alpha, blood, key-of-david, loud-voice, sun, throneheaven,
        # tachometer (sic), spit); generic stocks (bema, caduceus,
        # emperorclothes, fourlc, jesusknocking, kairos statue,
        # maranatha, myrrhresin/tree, scrolls).
        "24elders.jpg",
        "alpha.png",
        "bema.jpg",
        "blood.png",
        "caduceus.png",
        "emperorclothes.jpg",
        "ephesus-arch.jpg",
        "ephesus-artemis.jpg",
        "ephesus-firstlove.jpg",
        "ephesus-temple.jpg",
        "ephesussediment.jpg",
        "ephsed.jpg",
        "fourlc.jpg",
        "jesusknocking1.jpg",
        "johnpatmos.png",
        "johnpatmos1.jpg",
        "kairoslysippus.jpg",
        "keyofdavid.jpg",
        "laodicealycus.jpg",
        "loudvoice.png",
        "maranatha.jpg",
        "martyr.jpg",
        "myrrhresin.jpg",
        "myrrhtree.jpg",
        "patmos2.jpg",
        "pergamum-balaam.jpg",
        "pergamum-city.jpg",
        "pergamumasc.jpg",
        "pergamumathena.jpg",
        "pergamumcoin.jpg",
        "pergamumneo1.jpg",
        "pergamumtheater.jpg",
        "pergamumzeus.jpg",
        "pergamumzeus1.jpg",
        "rev9.jpg",
        "sardiswall.jpg",
        "scroll.jpg",
        "scroll1.jpg",
        "secondcoming.jpg",
        "smyrnapagos.jpg",
        "smyrnaruin.jpg",
        "spit.jpg",
        "sun.jpg",
        "tachometer.jpg",
        "templediana.jpg",
        "throneheaven.jpg",
        "thyatiradiagram.jpg",
        "thyatiraruins1.jpg",
        "worship.jpg",
    },
    "1-timothy": {
        # Auto-prune pass: pattern-matched on Andy's manual deletions
        "fish.jpg",
        "guard.jpg",
        "mousetrap.jpg",
        # V4 auto-prune pass (character + scene patterns)
        "paul_epistle.jpg",
        # Audit pass
        "mirror.jpg",
        "peda.jpg",
        "thresh.jpg",
    },
    "mark": {
        # Auto-prune pass: pattern-matched on Andy's manual deletions
        "crossthree.jpg",
        "lampstand.jpg",
        "mark.jpg",
        # V4 auto-prune pass (character + scene patterns)
        "anoint.jpg",
        "bread.jpg",
        "courtwomen.png",
        "denarius.jpg",
        "maryanoint.jpg",
        "millstone.jpg",
        "pilate.jpg",
        "soil.jpg",
        "stone.jpg",
        "widow.jpg",
        # Audit pass (55 cards Andy marked from /audit/mark.html) —
        # Same pattern as Matthew: AI passion scenes (Gethsemane,
        # Golgotha, Sanhedrin, Christ-nailed, scourge, secondcoming,
        # transfigure), Peter's house photos, John-the-Baptist set,
        # parable/teaching stocks (boat, child, lamp, loaves, kosher,
        # tradition, moneychangers, sentout, vineyard, vision, wheat,
        # winepress), Galilean ministry photos (Caesarea Philippi /
        # Panias, palm, synagogue), divorce/funeral/healing stock,
        # myrrh resin photo, Nero bust, metamorphosis, syro generic.
        "boatjesus.jpg",
        "caesareap.jpg",
        "child.jpg",
        "christ_gethsemane.jpg",
        "corner.jpg",
        "crosschristnailed.png",
        "divorce.png",
        "earthquake.png",
        "first.jpg",
        "funeral.png",
        "gethsemane.jpg",
        "gethsemane1.jpg",
        "goldengate.jpg",
        "golgotha.jpg",
        "healing.png",
        "housecutout.png",
        "jesusauthority.jpg",
        "jesusknocking1.jpg",
        "johnb.jpg",
        "johnbaptist.jpg",
        "johnshead.jpg",
        "kosher.jpg",
        "lamb_of_god_passover.gif",
        "lamp.jpg",
        "loaves.jpg",
        "locust1.jpg",
        "luke5housetop.jpg",
        "luke5levi2.jpg",
        "mark5.jpg",
        "metamorphosis.jpg",
        "moneychangers.jpg",
        "myrrhresin.jpg",
        "nero.jpg",
        "palm.jpg",
        "panias.jpg",
        "petershouse.jpg",
        "petershouseaerialview.jpg",
        "richyoung.jpg",
        "sanhedrin.jpg",
        "scourge2.jpg",
        "secondcoming.jpg",
        "sentout.jpg",
        "skandalon.jpg",
        "soilshallow.jpg",
        "synagogue.png",
        "synagoguecaper.jpg",
        "syro.jpg",
        "tradition.jpg",
        "transfigure.jpg",
        "vineyard.jpg",
        "vision.jpg",
        "wheat.jpg",
        "winepress.jpg",
        "woman.jpg",
        "worldlywise.jpg",
    },
    "john": {
        # Auto-prune pass: pattern-matched on Andy's manual deletions
        "exodusark.jpg",
        "listening1.jpg",
        "sworddam.jpg",
        # V4 auto-prune pass (character + scene patterns)
        "blindman.jpg",
        "judgment.jpg",
        # Audit pass (60 cards Andy marked from /audit/john.html) —
        # Bethesda pool photos (×3), Jacob's well, Siloam, Nicodemus,
        # Samaritan-woman scenes (jesusandsam, sam, samar, jesusfeeds,
        # walkwater, waterwine, wed at Cana, waterpot, templecleansing),
        # AI passion + resurrection (shroud, res), good-shepherd
        # photo set (sheepfold, sheep, shepherd_annointing /
        # _holding / _w_lamb), templeton decorative, Isaac sacrifice
        # cross-ref, generic-John stocks (john-1, john7, john_21,
        # johnb, log, finger, lights, royal, safe, search, truth,
        # warning, equal, fol, paralytic, pray, portico).
        "aenon.jpg",
        "artesian.png",
        "bethesda1.jpg",
        "bethesda2.jpg",
        "bethesdapool.jpg",
        "boatjesus.jpg",
        "christeternity.jpg",
        "circumcision.png",
        "clockredeem.jpg",
        "dedication.jpg",
        "equal.jpg",
        "figtree.jpg",
        "finger.jpg",
        "fol.jpg",
        "holiday.jpg",
        "jacobswell.jpg",
        "jesusandsam.jpg",
        "jesusfeeds.jpg",
        "john-1.jpg",
        "john7.jpg",
        "john_21.gif",
        "johnb.jpg",
        "jordanbap.jpg",
        "justicestatue.png",
        "lamb_cross.jpg",
        "lamb_passover.gif",
        "lights.jpg",
        "loaves.jpg",
        "log.jpg",
        "nehushtan.jpg",
        "nicodemus.jpg",
        "paralytic.jpg",
        "portico.jpg",
        "pray.jpg",
        "res.jpg",
        "royal.jpg",
        "safe.jpg",
        "sam.jpg",
        "samar.jpg",
        "search.jpg",
        "sheep_lamb_lying_down_small.jpg",
        "sheepfold.jpg",
        "sheeppix.jpg",
        "shepherd_annointing_with_oil_small1.gif",
        "shepherd_holding_a_sheep_small.gif",
        "shepherd_w_lamb_on_shoulders_small.gif",
        "shroud.gif",
        "siloampix.jpg",
        "sukkot.jpg",
        "synagoguecaper.jpg",
        "templecleansing.jpg",
        "templeton.gif",
        "the_sacrifice_of_isaac_small.jpg",
        "truth.jpg",
        "walkwater.jpg",
        "warning.jpg",
        "waterpot.jpg",
        "waterwine.jpg",
        "wed.jpg",
    },
    "2-chronicles": {
        # Auto-prune pass: pattern-matched on Andy's manual deletions
        "exodusbrazen2.jpg",
        "exoduslampstand.jpg",
        "exodusshowbread.jpg",
        # V4 auto-prune pass (character + scene patterns)
        "ahabramoth.jpg",
        "ahabzed.png",
        "ahaz2822.png",
        "ahazsurrounded.png",
        "davidcon.jpg",
        "davidsconquests.png",
        "hezekiah.jpg",
        "joashsickdied.png",
        "solomon.png",
        "solomonsheba.png",
        "stonecutter.jpg",
        "uzziahachilles.jpg",
        "uzziahevil.png",
        "uzziahmade.png",
        "uzziahthree.png",
        # Audit pass (29 cards Andy marked from /audit/2-chronicles.html) —
        # numbered chapter-fragment files (2417, 243, 2471, 2king127,
        # 2kings122), Abijah AI, eagle/horse/goat/sycamore stocks, East
        # Gate photo, ezekie7 hand drawing, ezion gulf, Jeh-eye, Joppa,
        # Lachish attack/flay AI scenes, Mareshah, Mt of Olives, Ophir,
        # rectal prolapse(!), revive sermon prop, Sheba queen, Shishak
        # invasion, smite, Solomon throne, sycamore, turnaway.
        "2417.png",
        "243.png",
        "2471.png",
        "2king127.png",
        "2kings122.png",
        "abijah1.png",
        "eagle1.jpg",
        "east_gate_w_color_small.jpg",
        "exodusincense.png",
        "ezekie7_small.gif",
        "ezion2.jpg",
        "gibeon2.jpg",
        "goat.png",
        "horse1.jpg",
        "jeheye.png",
        "joppa.jpg",
        "lachishattack.jpg",
        "lachishflay.jpg",
        "mareshah1.png",
        "mtolive2_small.jpg",
        "ophir.jpg",
        "rectalprolapse.jpg",
        "revive1.jpg",
        "shebaqueen.jpg",
        "shishak.jpg",
        "smite.png",
        "solomonthrone.jpg",
        "sycamore.jpg",
        "turnaway.jpg",
    },
    "joel": {
        # Auto-prune pass: pattern-matched on Andy's manual deletions
        "locust.jpg",
        "shofar.jpg",
        # Audit pass — generic Judges/Zephaniah thumbnail leak.
        "judges_2_small.jpg",
        "zeph-1.gif",
    },
    "jeremiah": {
        # Auto-prune pass: pattern-matched on Andy's manual deletions
        "listening1.jpg",
        # V4 auto-prune pass (character + scene patterns)
        "jehucal.jpg",
        "yoke.jpg",
        # Audit pass (6 cards Andy marked from /audit/jeremiah.html) —
        # bulla seal photo, Bruce's book-level "chart" decorative,
        # cistern photo, earthenware vessel, Gedaliah AI, generic
        # Jeremiah image.
        "bulla.jpg",
        "cistern.jpg",
        "earthenware.jpg",
        "gedaliah.jpg",
        "jer_image.jpg",
    },
    "ezekiel": {
        # Audit pass (5 cards Andy marked from /audit/ezekiel.html) —
        # cedar-tree parable photo, Salvator-Rosa "Covenant" painting
        # (already denied on 2-Kings; flag here too), eagle illustration
        # for ch.17, Ezek+Michelangelo art, millennium decorative gif.
        "cedartree.jpg",
        "covenant_-_salvator_rosa_1615-1673_small.jpg",
        "eagle2_jpg.png",
        "ezek_mic.jpg",
        "millennium.gif",
    },
    "matthew": {
        # Auto-prune pass: pattern-matched on Andy's manual deletions
        "exodusdate.jpg",
        # V4 auto-prune pass (character + scene patterns)
        "blindheal.jpg",
        "bread.jpg",
        "davidbread.jpg",
        "denarius.jpg",
        "herod.gif",
        "herodline2.png",
        "jesusblind.png",
        "marriagesupper.jpg",
        "millstone.jpg",
        "millstone1.png",
        "pilate.jpg",
        "rahab.jpg",
        "soil.jpg",
        "solomonsheba.png",
        "stone.jpg",
        # Audit pass (76 cards Andy marked from /audit/matthew.html) —
        # parable scenes (talents, ten virgins, tares, wheat, vineyard,
        # winepress, watchtower, weedburn, woman), Holy Land scene
        # photos (Gethsemane, Peter's house, Mount of Olives, palm,
        # Panias, Caesarea), AI passion scenes (Barabbas, Christ in
        # Gethsemane, scourge, mountofolivesjesus, triumphal entry,
        # synagogue at Capernaum, Galilean ministry), nativity art
        # (massacre, flight to Egypt, return from Egypt, magi star),
        # John-the-Baptist set, parable/teaching props (boat, child,
        # debt, dragnet, harvest, healing, kosher, loaves, mammon,
        # moneychangers, sederplate, skandalon stumblingblock, sentout,
        # tradition, woe), Jonah cross-ref, generic stocks.
        "barabbas.png",
        "boat.jpg",
        "boatjesus.jpg",
        "caesareap.jpg",
        "child.jpg",
        "christ_gethsemane.jpg",
        "debt.png",
        "dragnet.jpg",
        "earthquake.png",
        "flightegypt.jpg",
        "funeral.png",
        "furnace.jpg",
        "gethsemane.jpg",
        "gethsemane1.jpg",
        "girdloins.jpg",
        "greates.png",
        "harvest.jpg",
        "healing.png",
        "jesusauthority.jpg",
        "johnb.jpg",
        "johnbaptist.jpg",
        "johnshead.jpg",
        "jonah.jpg",
        "judah.jpg",
        "kosher.jpg",
        "lamb_of_god_passover.gif",
        "loaves.jpg",
        "locust1.jpg",
        "luke5levi2.jpg",
        "magistar.jpg",
        "mammon.jpg",
        "mark5.jpg",
        "massacre.jpg",
        "matthew.jpg",
        "moneychangers.jpg",
        "mountofolivesjesus.jpg",
        "outerdarkness.png",
        "palm.jpg",
        "panias.jpg",
        "paralyticheal.jpg",
        "perhapstoday.jpg",
        "petershouse.jpg",
        "petershouseaerialview.jpg",
        "returnegypt.jpg",
        "richyoung.jpg",
        "scourge2.jpg",
        "sederplate.jpg",
        "sentout.jpg",
        "skan.png",
        "skandalon.jpg",
        "sunriseshibui1.jpg",
        "synagoguecaper.jpg",
        "syro.jpg",
        "talentone.png",
        "talents.png",
        "talentsfive.png",
        "talentwelldone.png",
        "tares.jpg",
        "tares1.jpg",
        "templemodel.jpg",
        "tradition.jpg",
        "triumphalentry.jpg",
        "vineyard.jpg",
        "virgin-defcom.png",
        "virgin-open.png",
        "virgin-torch.png",
        "virginwent.png",
        "vision.jpg",
        "watchtower.jpg",
        "weedburn.jpg",
        "wheat.jpg",
        "winepress.jpg",
        "winnow.jpg",
        "woe.jpg",
        "woman.jpg",
    },
    "isaiah": {
        # Auto-prune pass: pattern-matched on Andy's manual deletions
        "mosesstrike.jpg",
        # V4 auto-prune pass (character + scene patterns)
        "ahazdefeateda.png",
        "ahazisaiah.png",
        "ahazrezinpekah.png",
        "hezekiah.jpg",
        "isaiah35.png",
        "isaiah_11_-_lion_-_hicks_1834_small.jpg",
        "isaiah_6-3_small.jpg",
        "isaiah_6_-_2_small.jpg",
        # Audit pass (10 cards Andy marked from /audit/isaiah.html) —
        # Babylon archaeology photos, Sennacherib Prism, Petra size,
        # Ripley's, RCA Dog logo, generic Isaiah pix + "perfect" stock.
        "babylon_1_small.jpg",
        "babylon_plan_1944_small.jpg",
        "harmagedon.jpg",
        "isaiah_pix.jpg",
        "perfect.png",
        "petrasize.jpg",
        "praise_for_salvation.jpg",
        "rca-dog_small.jpg",
        "ripleys.png",
        "sennacheribprism.png",
    },
    "ecclesiastes": {
        # V4 auto-prune pass (character + scene patterns)
        "contentment.jpg",
        "eccl-bread.png",
        "eccl-death1.png",
        "eccl-sharp.png",
        "solomon.jpg",
        # Audit pass (43 cards Andy marked from /audit/ecclesiastes.html) —
        # the entire Ecclesiastes parable-illustration set Bruce generated
        # with AI, plus clock/hourglass/kairos timekeeping stocks and
        # sunrise photo.
        "bc_runner1.gif",
        "clockredeem.jpg",
        "eccl-311.png",
        "eccl-anger.png",
        "eccl-begin.png",
        "eccl-bird1.png",
        "eccl-blessed.png",
        "eccl-calendar.png",
        "eccl-chart.png",
        "eccl-composure.png",
        "eccl-dark.png",
        "eccl-days.png",
        "eccl-dog.png",
        "eccl-error.png",
        "eccl-fish.png",
        "eccl-fly1.png",
        "eccl-funeral.png",
        "eccl-generation.png",
        "eccl-goad.png",
        "eccl-grasp.png",
        "eccl-hamster.png",
        "eccl-hand.png",
        "eccl-houseruin.png",
        "eccl-lazy.png",
        "eccl-lost.png",
        "eccl-multiply.png",
        "eccl-oppress.png",
        "eccl-remember.png",
        "eccl-rend.png",
        "eccl-rivers.png",
        "eccl-seed.png",
        "eccl-seek.png",
        "eccl-sheol.png",
        "eccl-sinner.png",
        "eccl-snake.jpg",
        "eccl-striving.png",
        "eccl-ten.png",
        "eccl-tree.png",
        "eccl-umbrella.png",
        "hourglass.png",
        "kairos.jpg",
        "luke16mammon.jpg",
        "sunriseshibui1.jpg",
    },
    "amos": {
        # V4 auto-prune pass (character + scene patterns)
        "amos-1.gif",
        # Audit pass — generic decoratives
        "deep.png",
        "winnow.jpg",
    },
    "daniel": {
        # Audit pass (21 cards Andy marked from /audit/daniel.html) —
        # all the _small thumbnails Bruce uses inline (tower of Babel,
        # Babylon empire map small, Cyrus cylinder photo, Daniel-by-river,
        # Daniel-12-Tigris, Daniel-10-man, Daniel-12 small, praying-hands,
        # darius-calls-to-daniel illustration). Plus dan-8-goat/ram/ulai
        # vision panels, dan_lion (Daniel in lions' den AI), godsplan,
        # Nabonidus, persian_small, writingwall, antiochusivepiphanes,
        # daniel_4 (Nebuchadnezzar's madness scene).
        "among-lampstands_small.jpg",
        "antiochusivepiphanes.jpg",
        "babel_tower_of_small.jpg",
        "babylonian-empire-map_small.png",
        "cyrus_cilinder_small.jpg",
        "da_10_by_side_of_river_small.jpg",
        "dan-10-man_small.jpg",
        "dan-12-river-tigris_small.jpg",
        "dan-8-goat.jpg",
        "dan-8-ram.jpg",
        "dan-8-ulai.jpg",
        "dan_lion.jpg",
        "daniel_12_small.jpg",
        "daniel_4.jpg",
        "daniel_praying_small.jpg",
        "darius_calls_to_daniel_small.jpg",
        "godsplan.jpg",
        "nabonidus.jpg",
        "persian_small.gif",
        "praying-hands_small.jpg",
        "writingwall.jpg",
    },
    "romans": {
        # V4 auto-prune pass (character + scene patterns)
        "paul_epistle.jpg",
    },
    "2-corinthians": {
        # V4 auto-prune pass (character + scene patterns)
        "paul_epistle.jpg",
        "yoke.jpg",
        # Audit pass
        "acrocorinth.jpg",
        "bema2.jpg",
        "bemajesus.jpg",
        "equil.png",
        "fust.jpg",
        "letter.jpg",
        "triumphal.jpg",
    },
    "2-thessalonians": {
        # V4 auto-prune pass (character + scene patterns)
        "paul_epistle.jpg",
        # Audit pass
        "dayofwrath.jpg",
        "suffering.jpg",
    },
    "colossians": {
        # V4 auto-prune pass (character + scene patterns)
        "paul_epistle.jpg",
    },
    "hosea": {
        # V4 auto-prune pass (character + scene patterns)
        "hosea_gomer.jpg",
        "hosea_love.png",
    },
    "malachi": {
        # V4 auto-prune pass (character + scene patterns)
        "malachidol.jpg",
        # Audit pass
        "windowheaven.jpg",
    },
    "zephaniah": {
        # Audit pass — Day-of-the-Lord art (dolart, nearfar), Nineveh
        # photos used across multiple books, generic Zephaniah image.
        "dolart.jpg",
        "nearfar.png",
        "nineveh.jpg",
        "nineveh1.jpg",
        "nineveh4.jpg",
        "zeph-1.gif",
        "zephaniah.jpg",
    },
    "zechariah": {
        # Audit pass — artesian well stock, Day-of-Lord apply chart,
        # Temple Mount photo, AI olive-lampstand vision, scroll AI,
        # zech-return decorative.
        "artesian_well.png",
        "dolapply.jpg",
        "templemount.jpg",
        "zechariaholive.jpg",
        "zechariahscroll.jpg",
        "zechreturn.jpg",
    },
    "james": {
        # Audit pass
        "chicago.jpg",
        "clockredeem.jpg",
        "imagegod.jpg",
    },
    "proverbs": {
        # Audit pass (7 cards Andy marked from /audit/proverbs.html) —
        # generic sermon-prop stocks (ear, fork in the road, heart gif,
        # horse, slaughter), Galilee sunrise photo, generic Proverbs
        # decorative.
        "ear.jpg",
        "fork_in_the_road.jpg",
        "heart.gif",
        "horse.jpg",
        "proverbs.jpg",
        "slaughter.jpg",
        "sungalilee.jpg",
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
        # Auto-prune pass: pattern-matched on Andy's manual deletions
        "lampstand.jpg",
        "listening1.jpg",
        "lotswife.jpg",
        "luke5fish.jpg",
        "mousetrap.jpg",
        # V4 auto-prune pass (character + scene patterns)
        "blind1.jpg",
        "bread.jpg",
        "courtwomen.png",
        "denarius.jpg",
        "herod.gif",
        "herod.jpg",
        "judas.jpg",
        "judas.png",
        "luke13jerusalemdestroyed.jpg",
        "nainwidow.jpg",
        "pilate.jpg",
        "prodigallament.jpg",
        "solomonsheba.png",
        "stone.jpg",
        "widow.jpg",
        "womenscourt.jpg",
        # Audit pass (133 cards Andy marked from /audit/luke.html) —
        # Bruce's full Luke-parable scene set (lukeNN.jpg + lukeNNN.jpg
        # numbered chapter panels), prodigal-son set (luke15carob,
        # carry, coin, return, squander, swine), mid-Luke parables
        # (16/17/18/19/20), good Samaritan, Mary-Martha, infancy
        # narratives (Mary, Maryelizabeth, Simeon, infant, jesusboy),
        # passion (Gethsemane, Golgotha, Sanhedrin, scourge, mocked,
        # secondcoming, transfigure), Emmaus pair, Bloch Sermon-on-Mount,
        # synagogue / temple / wilderness photos, all the lukeXXX
        # teaching props (alabaster, bema, blesschildren, camel, child,
        # circumcision, contempt, demon, disciplessent, engarde
        # fencing, figtree, harvest, hypocrite, jairus, jesusmocked,
        # leprosy, liberty, lilies, loaves, lordsprayer, mute, mote,
        # palm, pharisee, prodigal, samaritan, seder, shake, shepherd
        # rescuing sheep gif, siloam, simeon, synagogue variants,
        # templedestruction, templemodel, templestairs, tyre, upperroom,
        # vision, watchtower, wheat, wilderness1, wineskin, winnow,
        # woe, woman, zaccheus), generic stocks (calen, hair, lawyer,
        # mary, marymartha variants, nazarethcliff, nero, olives,
        # perhapstoday, sanhedrinhall, sentout).
        "alabaster.jpg",
        "bema.jpg",
        "blesschildren.jpg",
        "boatjesus.jpg",
        "calen.jpg",
        "camel.jpg",
        "child.jpg",
        "christ_gethsemane.jpg",
        "circumcision.png",
        "cohn.jpg",
        "contempt.jpg",
        "demon1.jpg",
        "disciplessent.jpg",
        "earthquake.png",
        "eccl-sheol.png",
        "emmaus.jpg",
        "emmaussupper.jpg",
        "engarde.png",
        "exodusglory.jpg",
        "figtree.jpg",
        "gethsemane.jpg",
        "girdloins.jpg",
        "goldengate.jpg",
        "golgotha.jpg",
        "goodsamaritan.jpg",
        "hair.jpg",
        "harvest.jpg",
        "hypocrite.jpg",
        "infant.jpg",
        "infantadoration.jpg",
        "isaiahscroll.jpg",
        "jairus.jpg",
        "jesusauthority.jpg",
        "jesusboy.jpg",
        "jesusmocked.jpg",
        "johnb.jpg",
        "johnbaptist.jpg",
        "jonah.jpg",
        "jonahnin.png",
        "lamb_of_god_passover.gif",
        "lamp.jpg",
        "lawyer.jpg",
        "leprosy.jpg",
        "liberty.jpg",
        "lilies.jpg",
        "loaves.jpg",
        "lordsprayer.jpg",
        "luke.jpg",
        "luke13healing.jpg",
        "luke13narrowdoor.jpg",
        "luke1428.jpg",
        "luke14cross.jpg",
        "luke14follow.jpg",
        "luke14salt.jpg",
        "luke15carob.jpg",
        "luke15carry.jpg",
        "luke15coin.jpg",
        "luke15coin1.jpg",
        "luke15return.jpg",
        "luke15squander.jpg",
        "luke15swine.jpg",
        "luke16.jpg",
        "luke16coin.png",
        "luke16hell.png",
        "luke16lazarus.jpg",
        "luke16mammon.jpg",
        "luke17.jpg",
        "luke171aa.jpg",
        "luke172.jpg",
        "luke181.jpg",
        "luke182.jpg",
        "luke183.jpg",
        "luke184.jpg",
        "luke191.jpg",
        "luke192.jpg",
        "luke193.jpg",
        "luke194.jpg",
        "luke1vision.jpg",
        "luke201.jpg",
        "luke202.jpg",
        "luke203.jpg",
        "luke5housetop.jpg",
        "luke5levi2.jpg",
        "mary.jpg",
        "maryelizabeth.jpg",
        "marymartha.jpg",
        "marymartha1.jpg",
        "marymartha2.jpg",
        "matthew7narrowgate.jpg",
        "moneychangers.jpg",
        "mote.jpg",
        "mute.jpg",
        "nazarethcliff.jpg",
        "nero.jpg",
        "olives.jpg",
        "palm.jpg",
        "perhapstoday.jpg",
        "petershouse.jpg",
        "petershouseaerialview.jpg",
        "pharisee.jpg",
        "pilatestone.jpg",
        "prodigal.png",
        "richyoung.jpg",
        "samaritan.jpg",
        "sanhedrin.jpg",
        "sanhedrinhall.jpg",
        "secondcoming.jpg",
        "seder.jpg",
        "sederplate.jpg",
        "sentout.jpg",
        "sermon_on_the_mount_by_bloch_small.jpg",
        "shake.jpg",
        "shepherd_rescuing_a_lost_sheep.gif",
        "shepherds.jpg",
        "shepherds2.jpg",
        "siloam.jpg",
        "simeon.jpg",
        "simeon1.jpg",
        "synagogue.png",
        "synagoguecaper.jpg",
        "synagogueesv.jpg",
        "synagogueteach.jpg",
        "templedestruction.png",
        "templemodel.jpg",
        "templestairs.jpg",
        "transfigure.jpg",
        "tyre.jpg",
        "upperroom.jpg",
        "vision.jpg",
        "watchtower.jpg",
        "wheat.jpg",
        "wilderness1.jpg",
        "wineskin.png",
        "winnow.jpg",
        "woe.jpg",
        "woman.jpg",
        "zaccheus.jpg",
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
