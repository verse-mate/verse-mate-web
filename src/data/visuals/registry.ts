/* eslint-disable */
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

export type VisualCard = {
  id: string;
  title: string;
  caption: string;
  thumb: string;
  full: string;
  attribution: { label: string; href: string };
  download?: { label: string; href: string };
  /** Optional chapter-scope. When present, the card is only relevant for
   *  these chapters (used by Precept Austin per-chapter charts). Absent
   *  for book-level cards that apply to every chapter. */
  chapters?: number[];
};

export type VideoEntry = {
  youtubeId: string;
  title: string;
  embedUrl: string;
  page: string;
  /** Inclusive chapter range this video covers. */
  chapterStart: number;
  chapterEnd: number;
};

export type VisualsManifest = {
  videos: VideoEntry[];
  cards: VisualCard[];
};

export const VISUALS_REGISTRY: Record<string, VisualsManifest> = {
  'genesis': {
  "videos": [
    {
      "youtubeId": "GQI72THyO5I",
      "title": "Genesis 1–11 — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/GQI72THyO5I?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/genesis/",
      "chapterStart": 1,
      "chapterEnd": 11
    },
    {
      "youtubeId": "F4isSyennFo",
      "title": "Genesis 12–50 — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/F4isSyennFo?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/genesis/",
      "chapterStart": 12,
      "chapterEnd": 50
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Genesis",
      "caption": "Hand-illustrated single-page overview of Genesis, tracing the book's literary design and major themes.",
      "thumb": "/visuals/genesis/bibleproject_poster.jpg",
      "full": "/visuals/genesis/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-genesis/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Genesis Bible Chart",
      "caption": "Single-page structural chart of Genesis, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/genesis/swindoll_chart.png",
      "full": "/visuals/genesis/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Genesis-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Genesis Chart",
      "caption": "Bruce Hurt's inductive-study chart for Genesis, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/genesis/precept_chart.png",
      "full": "/visuals/genesis/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/genesis_book_of_beginnings.png"
      }
    },
    {
      "id": "precept-ch-abram",
      "title": "Precept Austin — Genesis Chapter 12",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 12 — abram.jpg.",
      "thumb": "/visuals/genesis/precept_abram.jpg",
      "full": "/visuals/genesis/precept_abram.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/abram.jpg"
      },
      "chapters": [
        12
      ]
    },
    {
      "id": "precept-ch-abramegypt",
      "title": "Precept Austin — Genesis Chapters 12–13",
      "caption": "Bruce Hurt's commentary chart for Genesis chapters 12–13 — abramegypt.jpg.",
      "thumb": "/visuals/genesis/precept_abramegypt.jpg",
      "full": "/visuals/genesis/precept_abramegypt.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/abramegypt.jpg"
      },
      "chapters": [
        12,
        13
      ]
    },
    {
      "id": "precept-ch-adamtree",
      "title": "Precept Austin — Genesis Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 4 — adamtree.gif.",
      "thumb": "/visuals/genesis/precept_adamtree.gif",
      "full": "/visuals/genesis/precept_adamtree.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/adamtree.gif"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-arkdecks1",
      "title": "Precept Austin — Genesis Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 8 — arkdecks1.jpg.",
      "thumb": "/visuals/genesis/precept_arkdecks1.jpg",
      "full": "/visuals/genesis/precept_arkdecks1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/arkdecks1.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-arkshut",
      "title": "Precept Austin — Genesis Chapter 7",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 7 — arkshut.jpg.",
      "thumb": "/visuals/genesis/precept_arkshut.jpg",
      "full": "/visuals/genesis/precept_arkshut.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/arkshut.jpg"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-arksize",
      "title": "Precept Austin — Genesis Chapter 6",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 6 — arksize.jpg.",
      "thumb": "/visuals/genesis/precept_arksize.jpg",
      "full": "/visuals/genesis/precept_arksize.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/arksize.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-babel",
      "title": "Precept Austin — Genesis Chapter 11",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 11 — babel.jpg.",
      "thumb": "/visuals/genesis/precept_babel.jpg",
      "full": "/visuals/genesis/precept_babel.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/babel.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-canaanmap",
      "title": "Precept Austin — Genesis Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 10 — canaanmap.jpg.",
      "thumb": "/visuals/genesis/precept_canaanmap.jpg",
      "full": "/visuals/genesis/precept_canaanmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/canaanmap.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-floodpost",
      "title": "Precept Austin — Genesis Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 8 — floodpost.jpg.",
      "thumb": "/visuals/genesis/precept_floodpost.jpg",
      "full": "/visuals/genesis/precept_floodpost.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/floodpost.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-ge15",
      "title": "Precept Austin — Genesis Chapter 15",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 15 — ge15.jpg.",
      "thumb": "/visuals/genesis/precept_ge15.jpg",
      "full": "/visuals/genesis/precept_ge15.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ge15.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-gilgamesh",
      "title": "Precept Austin — Genesis Chapter 6",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 6 — gilgamesh.jpg.",
      "thumb": "/visuals/genesis/precept_gilgamesh.jpg",
      "full": "/visuals/genesis/precept_gilgamesh.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gilgamesh.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-haran",
      "title": "Precept Austin — Genesis Chapter 11",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 11 — haran.jpg.",
      "thumb": "/visuals/genesis/precept_haran.jpg",
      "full": "/visuals/genesis/precept_haran.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/haran.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-joshuamap",
      "title": "Precept Austin — Genesis Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 13 — joshuamap.png.",
      "thumb": "/visuals/genesis/precept_joshuamap.png",
      "full": "/visuals/genesis/precept_joshuamap.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/joshuamap.png"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-mamre",
      "title": "Precept Austin — Genesis Chapters 13, 14, 16, 18, 20, 21",
      "caption": "Bruce Hurt's commentary chart for Genesis chapters 13, 14, 16, 18, 20, 21 — mamre.jpg.",
      "thumb": "/visuals/genesis/precept_mamre.jpg",
      "full": "/visuals/genesis/precept_mamre.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mamre.jpg"
      },
      "chapters": [
        13,
        14,
        16,
        18,
        20,
        21
      ]
    },
    {
      "id": "precept-ch-mesopotamia",
      "title": "Precept Austin — Genesis Chapters 6–7",
      "caption": "Bruce Hurt's commentary chart for Genesis chapters 6–7 — mesopotamia.png.",
      "thumb": "/visuals/genesis/precept_mesopotamia.png",
      "full": "/visuals/genesis/precept_mesopotamia.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mesopotamia.png"
      },
      "chapters": [
        6,
        7
      ]
    },
    {
      "id": "precept-ch-napthali",
      "title": "Precept Austin — Genesis Chapter 21",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 21 — napthali.png.",
      "thumb": "/visuals/genesis/precept_napthali.png",
      "full": "/visuals/genesis/precept_napthali.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/napthali.png"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-nations",
      "title": "Precept Austin — Genesis Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 10 — nations.jpg.",
      "thumb": "/visuals/genesis/precept_nations.jpg",
      "full": "/visuals/genesis/precept_nations.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/nations.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-nations2",
      "title": "Precept Austin — Genesis Chapters 9–10",
      "caption": "Bruce Hurt's commentary chart for Genesis chapters 9–10 — nations2.jpg.",
      "thumb": "/visuals/genesis/precept_nations2.jpg",
      "full": "/visuals/genesis/precept_nations2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/nations2.jpg"
      },
      "chapters": [
        9,
        10
      ]
    },
    {
      "id": "precept-ch-nationsmacarthur",
      "title": "Precept Austin — Genesis Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 10 — nationsmacarthur.jpg.",
      "thumb": "/visuals/genesis/precept_nationsmacarthur.jpg",
      "full": "/visuals/genesis/precept_nationsmacarthur.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/nationsmacarthur.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-negev1",
      "title": "Precept Austin — Genesis Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 13 — negev1.png.",
      "thumb": "/visuals/genesis/precept_negev1.png",
      "full": "/visuals/genesis/precept_negev1.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/negev1.png"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-oakmamre",
      "title": "Precept Austin — Genesis Chapter 18",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 18 — oakmamre.jpg.",
      "thumb": "/visuals/genesis/precept_oakmamre.jpg",
      "full": "/visuals/genesis/precept_oakmamre.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/oakmamre.jpg"
      },
      "chapters": [
        18
      ]
    },
    {
      "id": "precept-ch-paran",
      "title": "Precept Austin — Genesis Chapter 21",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 21 — paran.jpg.",
      "thumb": "/visuals/genesis/precept_paran.jpg",
      "full": "/visuals/genesis/precept_paran.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/paran.jpg"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-progrev",
      "title": "Precept Austin — Genesis Chapter 15",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 15 — progrev.jpg.",
      "thumb": "/visuals/genesis/precept_progrev.jpg",
      "full": "/visuals/genesis/precept_progrev.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/progrev.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-semitic",
      "title": "Precept Austin — Genesis Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 10 — semitic.png.",
      "thumb": "/visuals/genesis/precept_semitic.png",
      "full": "/visuals/genesis/precept_semitic.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/semitic.png"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-shem1",
      "title": "Precept Austin — Genesis Chapters 10–11",
      "caption": "Bruce Hurt's commentary chart for Genesis chapters 10–11 — shem1.jpg.",
      "thumb": "/visuals/genesis/precept_shem1.jpg",
      "full": "/visuals/genesis/precept_shem1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shem1.jpg"
      },
      "chapters": [
        10,
        11
      ]
    },
    {
      "id": "precept-ch-shinar",
      "title": "Precept Austin — Genesis Chapter 11",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 11 — shinar.jpg.",
      "thumb": "/visuals/genesis/precept_shinar.jpg",
      "full": "/visuals/genesis/precept_shinar.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shinar.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-shinarcities",
      "title": "Precept Austin — Genesis Chapter 11",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 11 — shinarcities.png.",
      "thumb": "/visuals/genesis/precept_shinarcities.png",
      "full": "/visuals/genesis/precept_shinarcities.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shinarcities.png"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-solomonskingdom",
      "title": "Precept Austin — Genesis Chapter 15",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 15 — solomonskingdom.jpg.",
      "thumb": "/visuals/genesis/precept_solomonskingdom.jpg",
      "full": "/visuals/genesis/precept_solomonskingdom.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/solomonskingdom.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-tableofnations",
      "title": "Precept Austin — Genesis Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 10 — tableofnations.jpg.",
      "thumb": "/visuals/genesis/precept_tableofnations.jpg",
      "full": "/visuals/genesis/precept_tableofnations.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/tableofnations.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-tigris",
      "title": "Precept Austin — Genesis Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 2 — tigris.png.",
      "thumb": "/visuals/genesis/precept_tigris.png",
      "full": "/visuals/genesis/precept_tigris.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/tigris.png"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-ur",
      "title": "Precept Austin — Genesis Chapter 11",
      "caption": "Bruce Hurt's commentary chart for Genesis chapter 11 — ur.jpg.",
      "thumb": "/visuals/genesis/precept_ur.jpg",
      "full": "/visuals/genesis/precept_ur.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ur.jpg"
      },
      "chapters": [
        11
      ]
    }
  ]
},
  'exodus': {
  "videos": [
    {
      "youtubeId": "jH_aojNJM3E",
      "title": "Exodus 1–18 — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/jH_aojNJM3E?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/exodus/",
      "chapterStart": 1,
      "chapterEnd": 18
    },
    {
      "youtubeId": "oNpTha80yyE",
      "title": "Exodus 19–40 — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/oNpTha80yyE?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/exodus/",
      "chapterStart": 19,
      "chapterEnd": 40
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Exodus",
      "caption": "Hand-illustrated single-page overview of Exodus, tracing the book's literary design and major themes.",
      "thumb": "/visuals/exodus/bibleproject_poster.jpg",
      "full": "/visuals/exodus/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-exodus/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Exodus Bible Chart",
      "caption": "Single-page structural chart of Exodus, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/exodus/swindoll_chart.png",
      "full": "/visuals/exodus/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Exodus-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Exodus Chart",
      "caption": "Bruce Hurt's inductive-study chart for Exodus, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/exodus/precept_chart.png",
      "full": "/visuals/exodus/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exoduschart.png"
      }
    },
    {
      "id": "precept-book-egyptmap",
      "title": "Precept Austin — Exodus (egyptmap.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Exodus chapters on Precept Austin's commentary.",
      "thumb": "/visuals/exodus/precept_egyptmap.png",
      "full": "/visuals/exodus/precept_egyptmap.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/egyptmap.png"
      }
    },
    {
      "id": "precept-book-exodusegypt",
      "title": "Precept Austin — Exodus (exodusegypt.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Exodus chapters on Precept Austin's commentary.",
      "thumb": "/visuals/exodus/precept_exodusegypt.png",
      "full": "/visuals/exodus/precept_exodusegypt.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusegypt.png"
      }
    },
    {
      "id": "precept-book-exodustabernacle",
      "title": "Precept Austin — Exodus (exodustabernacle.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Exodus chapters on Precept Austin's commentary.",
      "thumb": "/visuals/exodus/precept_exodustabernacle.png",
      "full": "/visuals/exodus/precept_exodustabernacle.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodustabernacle.png"
      }
    },
    {
      "id": "precept-book-pentateuch",
      "title": "Precept Austin — Exodus (pentateuch.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Exodus chapters on Precept Austin's commentary.",
      "thumb": "/visuals/exodus/precept_pentateuch.jpg",
      "full": "/visuals/exodus/precept_pentateuch.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/pentateuch.jpg"
      }
    },
    {
      "id": "precept-ch-ex614",
      "title": "Precept Austin — Exodus Chapter 6",
      "caption": "Bruce Hurt's commentary chart for Exodus chapter 6 — ex614.jpg.",
      "thumb": "/visuals/exodus/precept_ex614.jpg",
      "full": "/visuals/exodus/precept_ex614.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ex614.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-exodus142",
      "title": "Precept Austin — Exodus Chapter 14",
      "caption": "Bruce Hurt's commentary chart for Exodus chapter 14 — exodus142.jpg.",
      "thumb": "/visuals/exodus/precept_exodus142.jpg",
      "full": "/visuals/exodus/precept_exodus142.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodus142.jpg"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-exodusaltars",
      "title": "Precept Austin — Exodus Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Exodus chapter 27 — exodusaltars.jpg.",
      "thumb": "/visuals/exodus/precept_exodusaltars.jpg",
      "full": "/visuals/exodus/precept_exodusaltars.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusaltars.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-exodusark",
      "title": "Precept Austin — Exodus Chapters 25, 35, 37, 40",
      "caption": "Bruce Hurt's commentary chart for Exodus chapters 25, 35, 37, 40 — exodusark.jpg.",
      "thumb": "/visuals/exodus/precept_exodusark.jpg",
      "full": "/visuals/exodus/precept_exodusark.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusark.jpg"
      },
      "chapters": [
        25,
        35,
        37,
        40
      ]
    },
    {
      "id": "precept-ch-exodusbrazen2",
      "title": "Precept Austin — Exodus Chapters 27, 35, 38, 40",
      "caption": "Bruce Hurt's commentary chart for Exodus chapters 27, 35, 38, 40 — exodusbrazen2.jpg.",
      "thumb": "/visuals/exodus/precept_exodusbrazen2.jpg",
      "full": "/visuals/exodus/precept_exodusbrazen2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusbrazen2.jpg"
      },
      "chapters": [
        27,
        35,
        38,
        40
      ]
    },
    {
      "id": "precept-ch-exodusfleshpot",
      "title": "Precept Austin — Exodus Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Exodus chapter 16 — exodusfleshpot.jpg.",
      "thumb": "/visuals/exodus/precept_exodusfleshpot.jpg",
      "full": "/visuals/exodus/precept_exodusfleshpot.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusfleshpot.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-exodusglory",
      "title": "Precept Austin — Exodus Chapter 40",
      "caption": "Bruce Hurt's commentary chart for Exodus chapter 40 — exodusglory.jpg.",
      "thumb": "/visuals/exodus/precept_exodusglory.jpg",
      "full": "/visuals/exodus/precept_exodusglory.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusglory.jpg"
      },
      "chapters": [
        40
      ]
    },
    {
      "id": "precept-ch-exodusincense",
      "title": "Precept Austin — Exodus Chapters 30, 35, 37, 40",
      "caption": "Bruce Hurt's commentary chart for Exodus chapters 30, 35, 37, 40 — exodusincense.png.",
      "thumb": "/visuals/exodus/precept_exodusincense.png",
      "full": "/visuals/exodus/precept_exodusincense.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusincense.png"
      },
      "chapters": [
        30,
        35,
        37,
        40
      ]
    },
    {
      "id": "precept-ch-exoduslampstand",
      "title": "Precept Austin — Exodus Chapters 25, 26, 35, 37, 40",
      "caption": "Bruce Hurt's commentary chart for Exodus chapters 25, 26, 35, 37, 40 — exoduslampstand.jpg.",
      "thumb": "/visuals/exodus/precept_exoduslampstand.jpg",
      "full": "/visuals/exodus/precept_exoduslampstand.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exoduslampstand.jpg"
      },
      "chapters": [
        25,
        26,
        35,
        37,
        40
      ]
    },
    {
      "id": "precept-ch-exodusmap",
      "title": "Precept Austin — Exodus Chapter 12",
      "caption": "Bruce Hurt's commentary chart for Exodus chapter 12 — exodusmap.gif.",
      "thumb": "/visuals/exodus/precept_exodusmap.gif",
      "full": "/visuals/exodus/precept_exodusmap.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusmap.gif"
      },
      "chapters": [
        12
      ]
    },
    {
      "id": "precept-ch-exoduspriest",
      "title": "Precept Austin — Exodus Chapters 28, 39",
      "caption": "Bruce Hurt's commentary chart for Exodus chapters 28, 39 — exoduspriest.png.",
      "thumb": "/visuals/exodus/precept_exoduspriest.png",
      "full": "/visuals/exodus/precept_exoduspriest.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exoduspriest.png"
      },
      "chapters": [
        28,
        39
      ]
    },
    {
      "id": "precept-ch-exodusred",
      "title": "Precept Austin — Exodus Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Exodus chapter 13 — exodusred.jpg.",
      "thumb": "/visuals/exodus/precept_exodusred.jpg",
      "full": "/visuals/exodus/precept_exodusred.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusred.jpg"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-exodusshowbread",
      "title": "Precept Austin — Exodus Chapters 25, 26, 37, 40",
      "caption": "Bruce Hurt's commentary chart for Exodus chapters 25, 26, 37, 40 — exodusshowbread.jpg.",
      "thumb": "/visuals/exodus/precept_exodusshowbread.jpg",
      "full": "/visuals/exodus/precept_exodusshowbread.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusshowbread.jpg"
      },
      "chapters": [
        25,
        26,
        37,
        40
      ]
    },
    {
      "id": "precept-ch-exodussinai",
      "title": "Precept Austin — Exodus Chapter 19",
      "caption": "Bruce Hurt's commentary chart for Exodus chapter 19 — exodussinai.jpg.",
      "thumb": "/visuals/exodus/precept_exodussinai.jpg",
      "full": "/visuals/exodus/precept_exodussinai.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodussinai.jpg"
      },
      "chapters": [
        19
      ]
    },
    {
      "id": "precept-ch-exodussocket",
      "title": "Precept Austin — Exodus Chapter 26",
      "caption": "Bruce Hurt's commentary chart for Exodus chapter 26 — exodussocket.jpg.",
      "thumb": "/visuals/exodus/precept_exodussocket.jpg",
      "full": "/visuals/exodus/precept_exodussocket.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodussocket.jpg"
      },
      "chapters": [
        26
      ]
    },
    {
      "id": "precept-ch-exodustabernacle",
      "title": "Precept Austin — Exodus Chapters 25, 40",
      "caption": "Bruce Hurt's commentary chart for Exodus chapters 25, 40 — exodustabernacle.png.",
      "thumb": "/visuals/exodus/precept_exodustabernacle.png",
      "full": "/visuals/exodus/precept_exodustabernacle.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodustabernacle.png"
      },
      "chapters": [
        25,
        40
      ]
    },
    {
      "id": "precept-ch-exodustabernaclecourt",
      "title": "Precept Austin — Exodus Chapters 27, 35, 38, 40",
      "caption": "Bruce Hurt's commentary chart for Exodus chapters 27, 35, 38, 40 — exodustabernaclecourt.jpg.",
      "thumb": "/visuals/exodus/precept_exodustabernaclecourt.jpg",
      "full": "/visuals/exodus/precept_exodustabernaclecourt.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodustabernaclecourt.jpg"
      },
      "chapters": [
        27,
        35,
        38,
        40
      ]
    },
    {
      "id": "precept-ch-exodustabernacleesvbig",
      "title": "Precept Austin — Exodus Chapters 26, 30, 35, 36, 40",
      "caption": "Bruce Hurt's commentary chart for Exodus chapters 26, 30, 35, 36, 40 — exodustabernacleesvbig.jpg.",
      "thumb": "/visuals/exodus/precept_exodustabernacleesvbig.jpg",
      "full": "/visuals/exodus/precept_exodustabernacleesvbig.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodustabernacleesvbig.jpg"
      },
      "chapters": [
        26,
        30,
        35,
        36,
        40
      ]
    },
    {
      "id": "precept-ch-exodustimeline",
      "title": "Precept Austin — Exodus Chapters 1–2",
      "caption": "Bruce Hurt's commentary chart for Exodus chapters 1–2 — exodustimeline.png.",
      "thumb": "/visuals/exodus/precept_exodustimeline.png",
      "full": "/visuals/exodus/precept_exodustimeline.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodustimeline.png"
      },
      "chapters": [
        1,
        2
      ]
    },
    {
      "id": "precept-ch-exodusvia",
      "title": "Precept Austin — Exodus Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Exodus chapter 13 — exodusvia.png.",
      "thumb": "/visuals/exodus/precept_exodusvia.png",
      "full": "/visuals/exodus/precept_exodusvia.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusvia.png"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-experiencegod",
      "title": "Precept Austin — Exodus Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Exodus chapter 3 — experiencegod.png.",
      "thumb": "/visuals/exodus/precept_experiencegod.png",
      "full": "/visuals/exodus/precept_experiencegod.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/experiencegod.png"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-feasts",
      "title": "Precept Austin — Exodus Chapter 23",
      "caption": "Bruce Hurt's commentary chart for Exodus chapter 23 — feasts.jpg.",
      "thumb": "/visuals/exodus/precept_feasts.jpg",
      "full": "/visuals/exodus/precept_feasts.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/feasts.jpg"
      },
      "chapters": [
        23
      ]
    },
    {
      "id": "precept-ch-judges_chart_small",
      "title": "Precept Austin — Exodus Chapter 23",
      "caption": "Bruce Hurt's commentary chart for Exodus chapter 23 — judges chart_small.gif.",
      "thumb": "/visuals/exodus/precept_judges_chart_small.gif",
      "full": "/visuals/exodus/precept_judges_chart_small.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Judges%20Chart_small.gif"
      },
      "chapters": [
        23
      ]
    },
    {
      "id": "precept-ch-midian1",
      "title": "Precept Austin — Exodus Chapters 2–3",
      "caption": "Bruce Hurt's commentary chart for Exodus chapters 2–3 — midian1.jpg.",
      "thumb": "/visuals/exodus/precept_midian1.jpg",
      "full": "/visuals/exodus/precept_midian1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/midian1.jpg"
      },
      "chapters": [
        2,
        3
      ]
    },
    {
      "id": "precept-ch-tabernacle_schematic2",
      "title": "Precept Austin — Exodus Chapters 26, 35",
      "caption": "Bruce Hurt's commentary chart for Exodus chapters 26, 35 — tabernacle schematic2.gif.",
      "thumb": "/visuals/exodus/precept_tabernacle_schematic2.gif",
      "full": "/visuals/exodus/precept_tabernacle_schematic2.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Tabernacle%20schematic2.gif"
      },
      "chapters": [
        26,
        35
      ]
    }
  ]
},
  'leviticus': {
  "videos": [
    {
      "youtubeId": "IJ-FekWUZzE",
      "title": "Leviticus — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/IJ-FekWUZzE?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/leviticus/",
      "chapterStart": 1,
      "chapterEnd": 27
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Leviticus",
      "caption": "Hand-illustrated single-page overview of Leviticus, tracing the book's literary design and major themes.",
      "thumb": "/visuals/leviticus/bibleproject_poster.jpg",
      "full": "/visuals/leviticus/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-leviticus/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Leviticus Bible Chart",
      "caption": "Single-page structural chart of Leviticus, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/leviticus/swindoll_chart.png",
      "full": "/visuals/leviticus/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Leviticus-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-book-leviticuschart",
      "title": "Precept Austin — Leviticus (leviticuschart.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Leviticus chapters on Precept Austin's commentary.",
      "thumb": "/visuals/leviticus/precept_leviticuschart.jpg",
      "full": "/visuals/leviticus/precept_leviticuschart.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Leviticuschart.jpg"
      }
    },
    {
      "id": "precept-book-leviticus1",
      "title": "Precept Austin — Leviticus (leviticus1.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Leviticus chapters on Precept Austin's commentary.",
      "thumb": "/visuals/leviticus/precept_leviticus1.png",
      "full": "/visuals/leviticus/precept_leviticus1.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/leviticus1.png"
      }
    },
    {
      "id": "precept-ch-exodusaltars",
      "title": "Precept Austin — Leviticus Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Leviticus chapter 16 — exodusaltars.jpg.",
      "thumb": "/visuals/leviticus/precept_exodusaltars.jpg",
      "full": "/visuals/leviticus/precept_exodusaltars.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusaltars.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-exodusark",
      "title": "Precept Austin — Leviticus Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Leviticus chapter 16 — exodusark.jpg.",
      "thumb": "/visuals/leviticus/precept_exodusark.jpg",
      "full": "/visuals/leviticus/precept_exodusark.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusark.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-exodusbrazen2",
      "title": "Precept Austin — Leviticus Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Leviticus chapter 16 — exodusbrazen2.jpg.",
      "thumb": "/visuals/leviticus/precept_exodusbrazen2.jpg",
      "full": "/visuals/leviticus/precept_exodusbrazen2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusbrazen2.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-exodustabernacle",
      "title": "Precept Austin — Leviticus Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Leviticus chapter 16 — exodustabernacle.png.",
      "thumb": "/visuals/leviticus/precept_exodustabernacle.png",
      "full": "/visuals/leviticus/precept_exodustabernacle.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodustabernacle.png"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-exodustabernaclecourt",
      "title": "Precept Austin — Leviticus Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Leviticus chapter 16 — exodustabernaclecourt.jpg.",
      "thumb": "/visuals/leviticus/precept_exodustabernaclecourt.jpg",
      "full": "/visuals/leviticus/precept_exodustabernaclecourt.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodustabernaclecourt.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-feasts",
      "title": "Precept Austin — Leviticus Chapter 23",
      "caption": "Bruce Hurt's commentary chart for Leviticus chapter 23 — feasts.jpg.",
      "thumb": "/visuals/leviticus/precept_feasts.jpg",
      "full": "/visuals/leviticus/precept_feasts.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/feasts.jpg"
      },
      "chapters": [
        23
      ]
    },
    {
      "id": "precept-ch-leviticus_offerings_small",
      "title": "Precept Austin — Leviticus Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Leviticus chapter 1 — leviticus offerings_small.jpg.",
      "thumb": "/visuals/leviticus/precept_leviticus_offerings_small.jpg",
      "full": "/visuals/leviticus/precept_leviticus_offerings_small.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Leviticus%20offerings_small.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-tabernacle_schematic2",
      "title": "Precept Austin — Leviticus Chapters 1, 3, 4, 8",
      "caption": "Bruce Hurt's commentary chart for Leviticus chapters 1, 3, 4, 8 — tabernacle schematic2.gif.",
      "thumb": "/visuals/leviticus/precept_tabernacle_schematic2.gif",
      "full": "/visuals/leviticus/precept_tabernacle_schematic2.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Tabernacle%20schematic2.gif"
      },
      "chapters": [
        1,
        3,
        4,
        8
      ]
    }
  ]
},
  'numbers': {
  "videos": [
    {
      "youtubeId": "tp5MIrMZFqo",
      "title": "Numbers — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/tp5MIrMZFqo?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/numbers/",
      "chapterStart": 1,
      "chapterEnd": 36
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Numbers",
      "caption": "Hand-illustrated single-page overview of Numbers, tracing the book's literary design and major themes.",
      "thumb": "/visuals/numbers/bibleproject_poster.jpg",
      "full": "/visuals/numbers/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-numbers/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Numbers Bible Chart",
      "caption": "Single-page structural chart of Numbers, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/numbers/swindoll_chart.png",
      "full": "/visuals/numbers/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Numbers-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-book-numbers",
      "title": "Precept Austin — Numbers (numbers.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Numbers chapters on Precept Austin's commentary.",
      "thumb": "/visuals/numbers/precept_numbers.jpg",
      "full": "/visuals/numbers/precept_numbers.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/numbers.jpg"
      }
    },
    {
      "id": "precept-book-numberstime",
      "title": "Precept Austin — Numbers (numberstime.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Numbers chapters on Precept Austin's commentary.",
      "thumb": "/visuals/numbers/precept_numberstime.jpg",
      "full": "/visuals/numbers/precept_numberstime.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/numberstime.jpg"
      }
    },
    {
      "id": "precept-ch-1000",
      "title": "Precept Austin — Numbers Chapter 35",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 35 — 1000.jpg.",
      "thumb": "/visuals/numbers/precept_1000.jpg",
      "full": "/visuals/numbers/precept_1000.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1000.jpg"
      },
      "chapters": [
        35
      ]
    },
    {
      "id": "precept-ch-arad",
      "title": "Precept Austin — Numbers Chapters 21–22",
      "caption": "Bruce Hurt's commentary chart for Numbers chapters 21–22 — arad.jpg.",
      "thumb": "/visuals/numbers/precept_arad.jpg",
      "full": "/visuals/numbers/precept_arad.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/arad.jpg"
      },
      "chapters": [
        21,
        22
      ]
    },
    {
      "id": "precept-ch-ark1",
      "title": "Precept Austin — Numbers Chapter 17",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 17 — ark1.jpg.",
      "thumb": "/visuals/numbers/precept_ark1.jpg",
      "full": "/visuals/numbers/precept_ark1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ark1.jpg"
      },
      "chapters": [
        17
      ]
    },
    {
      "id": "precept-ch-arnon",
      "title": "Precept Austin — Numbers Chapter 21",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 21 — arnon.jpg.",
      "thumb": "/visuals/numbers/precept_arnon.jpg",
      "full": "/visuals/numbers/precept_arnon.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/arnon.jpg"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-calen",
      "title": "Precept Austin — Numbers Chapter 28",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 28 — calen.jpg.",
      "thumb": "/visuals/numbers/precept_calen.jpg",
      "full": "/visuals/numbers/precept_calen.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/calen.jpg"
      },
      "chapters": [
        28
      ]
    },
    {
      "id": "precept-ch-calendar",
      "title": "Precept Austin — Numbers Chapters 28–29",
      "caption": "Bruce Hurt's commentary chart for Numbers chapters 28–29 — calendar.png.",
      "thumb": "/visuals/numbers/precept_calendar.png",
      "full": "/visuals/numbers/precept_calendar.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/calendar.png"
      },
      "chapters": [
        28,
        29
      ]
    },
    {
      "id": "precept-ch-camp2",
      "title": "Precept Austin — Numbers Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 2 — camp2.jpg.",
      "thumb": "/visuals/numbers/precept_camp2.jpg",
      "full": "/visuals/numbers/precept_camp2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/camp2.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-camp3",
      "title": "Precept Austin — Numbers Chapters 7, 10",
      "caption": "Bruce Hurt's commentary chart for Numbers chapters 7, 10 — camp3.jpg.",
      "thumb": "/visuals/numbers/precept_camp3.jpg",
      "full": "/visuals/numbers/precept_camp3.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/camp3.jpg"
      },
      "chapters": [
        7,
        10
      ]
    },
    {
      "id": "precept-ch-census",
      "title": "Precept Austin — Numbers Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 1 — census.jpg.",
      "thumb": "/visuals/numbers/precept_census.jpg",
      "full": "/visuals/numbers/precept_census.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/census.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-census1",
      "title": "Precept Austin — Numbers Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 2 — census1.jpg.",
      "thumb": "/visuals/numbers/precept_census1.jpg",
      "full": "/visuals/numbers/precept_census1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/census1.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-complaint",
      "title": "Precept Austin — Numbers Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 16 — complaint.jpg.",
      "thumb": "/visuals/numbers/precept_complaint.jpg",
      "full": "/visuals/numbers/precept_complaint.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/complaint.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-duty",
      "title": "Precept Austin — Numbers Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 4 — duty.jpg.",
      "thumb": "/visuals/numbers/precept_duty.jpg",
      "full": "/visuals/numbers/precept_duty.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/duty.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-duty2",
      "title": "Precept Austin — Numbers Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 4 — duty2.jpg.",
      "thumb": "/visuals/numbers/precept_duty2.jpg",
      "full": "/visuals/numbers/precept_duty2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/duty2.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-edrei",
      "title": "Precept Austin — Numbers Chapter 21",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 21 — edrei.jpg.",
      "thumb": "/visuals/numbers/precept_edrei.jpg",
      "full": "/visuals/numbers/precept_edrei.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/edrei.jpg"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-ex614",
      "title": "Precept Austin — Numbers Chapter 26",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 26 — ex614.jpg.",
      "thumb": "/visuals/numbers/precept_ex614.jpg",
      "full": "/visuals/numbers/precept_ex614.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ex614.jpg"
      },
      "chapters": [
        26
      ]
    },
    {
      "id": "precept-ch-exodusark",
      "title": "Precept Austin — Numbers Chapters 4, 10",
      "caption": "Bruce Hurt's commentary chart for Numbers chapters 4, 10 — exodusark.jpg.",
      "thumb": "/visuals/numbers/precept_exodusark.jpg",
      "full": "/visuals/numbers/precept_exodusark.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusark.jpg"
      },
      "chapters": [
        4,
        10
      ]
    },
    {
      "id": "precept-ch-exodustabernaclecourt",
      "title": "Precept Austin — Numbers Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 4 — exodustabernaclecourt.jpg.",
      "thumb": "/visuals/numbers/precept_exodustabernaclecourt.jpg",
      "full": "/visuals/numbers/precept_exodustabernaclecourt.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodustabernaclecourt.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-exodustabernacleesvbig",
      "title": "Precept Austin — Numbers Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 3 — exodustabernacleesvbig.jpg.",
      "thumb": "/visuals/numbers/precept_exodustabernacleesvbig.jpg",
      "full": "/visuals/numbers/precept_exodustabernacleesvbig.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodustabernacleesvbig.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-famtree",
      "title": "Precept Austin — Numbers Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 16 — famtree.png.",
      "thumb": "/visuals/numbers/precept_famtree.png",
      "full": "/visuals/numbers/precept_famtree.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/famtree.png"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-feasts",
      "title": "Precept Austin — Numbers Chapters 28–29",
      "caption": "Bruce Hurt's commentary chart for Numbers chapters 28–29 — feasts.jpg.",
      "thumb": "/visuals/numbers/precept_feasts.jpg",
      "full": "/visuals/numbers/precept_feasts.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/feasts.jpg"
      },
      "chapters": [
        28,
        29
      ]
    },
    {
      "id": "precept-ch-gilead",
      "title": "Precept Austin — Numbers Chapter 32",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 32 — gilead.jpg.",
      "thumb": "/visuals/numbers/precept_gilead.jpg",
      "full": "/visuals/numbers/precept_gilead.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gilead.jpg"
      },
      "chapters": [
        32
      ]
    },
    {
      "id": "precept-ch-gulf",
      "title": "Precept Austin — Numbers Chapter 11",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 11 — gulf.jpg.",
      "thumb": "/visuals/numbers/precept_gulf.jpg",
      "full": "/visuals/numbers/precept_gulf.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gulf.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-heshbon",
      "title": "Precept Austin — Numbers Chapter 21",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 21 — heshbon.jpg.",
      "thumb": "/visuals/numbers/precept_heshbon.jpg",
      "full": "/visuals/numbers/precept_heshbon.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/heshbon.jpg"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-horman",
      "title": "Precept Austin — Numbers Chapter 14",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 14 — horman.jpg.",
      "thumb": "/visuals/numbers/precept_horman.jpg",
      "full": "/visuals/numbers/precept_horman.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/horman.jpg"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-jazer",
      "title": "Precept Austin — Numbers Chapters 21, 32",
      "caption": "Bruce Hurt's commentary chart for Numbers chapters 21, 32 — jazer.jpg.",
      "thumb": "/visuals/numbers/precept_jazer.jpg",
      "full": "/visuals/numbers/precept_jazer.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jazer.jpg"
      },
      "chapters": [
        21,
        32
      ]
    },
    {
      "id": "precept-ch-kadesh",
      "title": "Precept Austin — Numbers Chapters 20, 27",
      "caption": "Bruce Hurt's commentary chart for Numbers chapters 20, 27 — kadesh.jpg.",
      "thumb": "/visuals/numbers/precept_kadesh.jpg",
      "full": "/visuals/numbers/precept_kadesh.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/kadesh.jpg"
      },
      "chapters": [
        20,
        27
      ]
    },
    {
      "id": "precept-ch-levi",
      "title": "Precept Austin — Numbers Chapter 26",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 26 — levi.jpg.",
      "thumb": "/visuals/numbers/precept_levi.jpg",
      "full": "/visuals/numbers/precept_levi.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/levi.jpg"
      },
      "chapters": [
        26
      ]
    },
    {
      "id": "precept-ch-levicity",
      "title": "Precept Austin — Numbers Chapter 35",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 35 — levicity.jpg.",
      "thumb": "/visuals/numbers/precept_levicity.jpg",
      "full": "/visuals/numbers/precept_levicity.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/levicity.jpg"
      },
      "chapters": [
        35
      ]
    },
    {
      "id": "precept-ch-loc",
      "title": "Precept Austin — Numbers Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 10 — loc.jpg.",
      "thumb": "/visuals/numbers/precept_loc.jpg",
      "full": "/visuals/numbers/precept_loc.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/loc.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-mapnu",
      "title": "Precept Austin — Numbers Chapter 32",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 32 — mapnu.png.",
      "thumb": "/visuals/numbers/precept_mapnu.png",
      "full": "/visuals/numbers/precept_mapnu.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mapnu.png"
      },
      "chapters": [
        32
      ]
    },
    {
      "id": "precept-ch-march",
      "title": "Precept Austin — Numbers Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 10 — march.jpg.",
      "thumb": "/visuals/numbers/precept_march.jpg",
      "full": "/visuals/numbers/precept_march.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/march.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-moab",
      "title": "Precept Austin — Numbers Chapter 21",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 21 — moab.jpg.",
      "thumb": "/visuals/numbers/precept_moab.jpg",
      "full": "/visuals/numbers/precept_moab.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/moab.jpg"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-moab1",
      "title": "Precept Austin — Numbers Chapters 33, 35",
      "caption": "Bruce Hurt's commentary chart for Numbers chapters 33, 35 — moab1.jpg.",
      "thumb": "/visuals/numbers/precept_moab1.jpg",
      "full": "/visuals/numbers/precept_moab1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/moab1.jpg"
      },
      "chapters": [
        33,
        35
      ]
    },
    {
      "id": "precept-ch-moabplain",
      "title": "Precept Austin — Numbers Chapter 22",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 22 — moabplain.jpg.",
      "thumb": "/visuals/numbers/precept_moabplain.jpg",
      "full": "/visuals/numbers/precept_moabplain.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/moabplain.jpg"
      },
      "chapters": [
        22
      ]
    },
    {
      "id": "precept-ch-paran",
      "title": "Precept Austin — Numbers Chapters 9, 10, 12",
      "caption": "Bruce Hurt's commentary chart for Numbers chapters 9, 10, 12 — paran.jpg.",
      "thumb": "/visuals/numbers/precept_paran.jpg",
      "full": "/visuals/numbers/precept_paran.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/paran.jpg"
      },
      "chapters": [
        9,
        10,
        12
      ]
    },
    {
      "id": "precept-ch-peor",
      "title": "Precept Austin — Numbers Chapter 23",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 23 — peor.jpg.",
      "thumb": "/visuals/numbers/precept_peor.jpg",
      "full": "/visuals/numbers/precept_peor.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/peor.jpg"
      },
      "chapters": [
        23
      ]
    },
    {
      "id": "precept-ch-pethor",
      "title": "Precept Austin — Numbers Chapter 22",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 22 — pethor.jpg.",
      "thumb": "/visuals/numbers/precept_pethor.jpg",
      "full": "/visuals/numbers/precept_pethor.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/pethor.jpg"
      },
      "chapters": [
        22
      ]
    },
    {
      "id": "precept-ch-phinehas",
      "title": "Precept Austin — Numbers Chapters 25, 31",
      "caption": "Bruce Hurt's commentary chart for Numbers chapters 25, 31 — phinehas.jpg.",
      "thumb": "/visuals/numbers/precept_phinehas.jpg",
      "full": "/visuals/numbers/precept_phinehas.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/phinehas.jpg"
      },
      "chapters": [
        25,
        31
      ]
    },
    {
      "id": "precept-ch-prom",
      "title": "Precept Austin — Numbers Chapters 34, 36",
      "caption": "Bruce Hurt's commentary chart for Numbers chapters 34, 36 — prom.jpg.",
      "thumb": "/visuals/numbers/precept_prom.jpg",
      "full": "/visuals/numbers/precept_prom.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/prom.jpg"
      },
      "chapters": [
        34,
        36
      ]
    },
    {
      "id": "precept-ch-prom1",
      "title": "Precept Austin — Numbers Chapter 34",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 34 — prom1.jpg.",
      "thumb": "/visuals/numbers/precept_prom1.jpg",
      "full": "/visuals/numbers/precept_prom1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/prom1.jpg"
      },
      "chapters": [
        34
      ]
    },
    {
      "id": "precept-ch-ram",
      "title": "Precept Austin — Numbers Chapter 33",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 33 — ram.jpg.",
      "thumb": "/visuals/numbers/precept_ram.jpg",
      "full": "/visuals/numbers/precept_ram.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ram.jpg"
      },
      "chapters": [
        33
      ]
    },
    {
      "id": "precept-ch-shittim",
      "title": "Precept Austin — Numbers Chapter 25",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 25 — shittim.jpg.",
      "thumb": "/visuals/numbers/precept_shittim.jpg",
      "full": "/visuals/numbers/precept_shittim.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shittim.jpg"
      },
      "chapters": [
        25
      ]
    },
    {
      "id": "precept-ch-tab",
      "title": "Precept Austin — Numbers Chapters 6, 7, 8, 11",
      "caption": "Bruce Hurt's commentary chart for Numbers chapters 6, 7, 8, 11 — tab.jpg.",
      "thumb": "/visuals/numbers/precept_tab.jpg",
      "full": "/visuals/numbers/precept_tab.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/tab.jpg"
      },
      "chapters": [
        6,
        7,
        8,
        11
      ]
    },
    {
      "id": "precept-ch-tabernacle_schematic2",
      "title": "Precept Austin — Numbers Chapters 3, 18",
      "caption": "Bruce Hurt's commentary chart for Numbers chapters 3, 18 — tabernacle schematic2.gif.",
      "thumb": "/visuals/numbers/precept_tabernacle_schematic2.gif",
      "full": "/visuals/numbers/precept_tabernacle_schematic2.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Tabernacle%20schematic2.gif"
      },
      "chapters": [
        3,
        18
      ]
    },
    {
      "id": "precept-ch-zeph-1",
      "title": "Precept Austin — Numbers Chapter 24",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 24 — zeph-1.gif.",
      "thumb": "/visuals/numbers/precept_zeph-1.gif",
      "full": "/visuals/numbers/precept_zeph-1.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zeph-1.gif"
      },
      "chapters": [
        24
      ]
    },
    {
      "id": "precept-ch-zered",
      "title": "Precept Austin — Numbers Chapter 21",
      "caption": "Bruce Hurt's commentary chart for Numbers chapter 21 — zered.jpg.",
      "thumb": "/visuals/numbers/precept_zered.jpg",
      "full": "/visuals/numbers/precept_zered.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zered.jpg"
      },
      "chapters": [
        21
      ]
    }
  ]
},
  'deuteronomy': {
  "videos": [
    {
      "youtubeId": "q5QEH9bH8AU",
      "title": "Deuteronomy — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/q5QEH9bH8AU?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/deuteronomy/",
      "chapterStart": 1,
      "chapterEnd": 34
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Deuteronomy",
      "caption": "Hand-illustrated single-page overview of Deuteronomy, tracing the book's literary design and major themes.",
      "thumb": "/visuals/deuteronomy/bibleproject_poster.jpg",
      "full": "/visuals/deuteronomy/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-deuteronomy/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Deuteronomy Bible Chart",
      "caption": "Single-page structural chart of Deuteronomy, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/deuteronomy/swindoll_chart.png",
      "full": "/visuals/deuteronomy/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Deuteronomy-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Deuteronomy Chart",
      "caption": "Bruce Hurt's inductive-study chart for Deuteronomy, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/deuteronomy/precept_chart.png",
      "full": "/visuals/deuteronomy/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/deutchart.png"
      }
    },
    {
      "id": "precept-book-deuttime",
      "title": "Precept Austin — Deuteronomy (deuttime.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Deuteronomy chapters on Precept Austin's commentary.",
      "thumb": "/visuals/deuteronomy/precept_deuttime.png",
      "full": "/visuals/deuteronomy/precept_deuttime.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/deuttime.png"
      }
    },
    {
      "id": "precept-book-deut",
      "title": "Precept Austin — Deuteronomy (deut.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Deuteronomy chapters on Precept Austin's commentary.",
      "thumb": "/visuals/deuteronomy/precept_deut.jpg",
      "full": "/visuals/deuteronomy/precept_deut.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/deut.jpg"
      }
    },
    {
      "id": "precept-book-deuter",
      "title": "Precept Austin — Deuteronomy (deuter.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Deuteronomy chapters on Precept Austin's commentary.",
      "thumb": "/visuals/deuteronomy/precept_deuter.jpg",
      "full": "/visuals/deuteronomy/precept_deuter.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/deuter.jpg"
      }
    },
    {
      "id": "precept-ch-ammon",
      "title": "Precept Austin — Deuteronomy Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapter 2 — ammon.jpg.",
      "thumb": "/visuals/deuteronomy/precept_ammon.jpg",
      "full": "/visuals/deuteronomy/precept_ammon.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ammon.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-arad",
      "title": "Precept Austin — Deuteronomy Chapters 1–2",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapters 1–2 — arad.jpg.",
      "thumb": "/visuals/deuteronomy/precept_arad.jpg",
      "full": "/visuals/deuteronomy/precept_arad.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/arad.jpg"
      },
      "chapters": [
        1,
        2
      ]
    },
    {
      "id": "precept-ch-ark1",
      "title": "Precept Austin — Deuteronomy Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapter 10 — ark1.jpg.",
      "thumb": "/visuals/deuteronomy/precept_ark1.jpg",
      "full": "/visuals/deuteronomy/precept_ark1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ark1.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-arnon",
      "title": "Precept Austin — Deuteronomy Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapter 2 — arnon.jpg.",
      "thumb": "/visuals/deuteronomy/precept_arnon.jpg",
      "full": "/visuals/deuteronomy/precept_arnon.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/arnon.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-arnongorge",
      "title": "Precept Austin — Deuteronomy Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapter 2 — arnongorge.jpg.",
      "thumb": "/visuals/deuteronomy/precept_arnongorge.jpg",
      "full": "/visuals/deuteronomy/precept_arnongorge.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/arnongorge.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-bashan",
      "title": "Precept Austin — Deuteronomy Chapters 3–4",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapters 3–4 — bashan.jpg.",
      "thumb": "/visuals/deuteronomy/precept_bashan.jpg",
      "full": "/visuals/deuteronomy/precept_bashan.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bashan.jpg"
      },
      "chapters": [
        3,
        4
      ]
    },
    {
      "id": "precept-ch-calen",
      "title": "Precept Austin — Deuteronomy Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapter 16 — calen.jpg.",
      "thumb": "/visuals/deuteronomy/precept_calen.jpg",
      "full": "/visuals/deuteronomy/precept_calen.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/calen.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-calendar",
      "title": "Precept Austin — Deuteronomy Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapter 16 — calendar.png.",
      "thumb": "/visuals/deuteronomy/precept_calendar.png",
      "full": "/visuals/deuteronomy/precept_calendar.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/calendar.png"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-deut14",
      "title": "Precept Austin — Deuteronomy Chapters 1, 3, 4, 7, 8",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapters 1, 3, 4, 7, 8 — deut14.jpg.",
      "thumb": "/visuals/deuteronomy/precept_deut14.jpg",
      "full": "/visuals/deuteronomy/precept_deut14.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/deut14.jpg"
      },
      "chapters": [
        1,
        3,
        4,
        7,
        8
      ]
    },
    {
      "id": "precept-ch-dust",
      "title": "Precept Austin — Deuteronomy Chapter 28",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapter 28 — dust.jpg.",
      "thumb": "/visuals/deuteronomy/precept_dust.jpg",
      "full": "/visuals/deuteronomy/precept_dust.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/dust.jpg"
      },
      "chapters": [
        28
      ]
    },
    {
      "id": "precept-ch-edrei1",
      "title": "Precept Austin — Deuteronomy Chapters 1–4",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapters 1–4 — edrei1.jpg.",
      "thumb": "/visuals/deuteronomy/precept_edrei1.jpg",
      "full": "/visuals/deuteronomy/precept_edrei1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/edrei1.jpg"
      },
      "chapters": [
        1,
        2,
        3,
        4
      ]
    },
    {
      "id": "precept-ch-exodusark",
      "title": "Precept Austin — Deuteronomy Chapter 20",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapter 20 — exodusark.jpg.",
      "thumb": "/visuals/deuteronomy/precept_exodusark.jpg",
      "full": "/visuals/deuteronomy/precept_exodusark.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusark.jpg"
      },
      "chapters": [
        20
      ]
    },
    {
      "id": "precept-ch-gad",
      "title": "Precept Austin — Deuteronomy Chapters 3–4",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapters 3–4 — gad.png.",
      "thumb": "/visuals/deuteronomy/precept_gad.png",
      "full": "/visuals/deuteronomy/precept_gad.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gad.png"
      },
      "chapters": [
        3,
        4
      ]
    },
    {
      "id": "precept-ch-gerizim",
      "title": "Precept Austin — Deuteronomy Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapter 27 — gerizim.jpg.",
      "thumb": "/visuals/deuteronomy/precept_gerizim.jpg",
      "full": "/visuals/deuteronomy/precept_gerizim.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gerizim.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-holiday",
      "title": "Precept Austin — Deuteronomy Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapter 16 — holiday.jpg.",
      "thumb": "/visuals/deuteronomy/precept_holiday.jpg",
      "full": "/visuals/deuteronomy/precept_holiday.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/holiday.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-kingshigh",
      "title": "Precept Austin — Deuteronomy Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapter 2 — kingshigh.png.",
      "thumb": "/visuals/deuteronomy/precept_kingshigh.png",
      "full": "/visuals/deuteronomy/precept_kingshigh.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/kingshigh.png"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-levicity",
      "title": "Precept Austin — Deuteronomy Chapter 19",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapter 19 — levicity.jpg.",
      "thumb": "/visuals/deuteronomy/precept_levicity.jpg",
      "full": "/visuals/deuteronomy/precept_levicity.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/levicity.jpg"
      },
      "chapters": [
        19
      ]
    },
    {
      "id": "precept-ch-napthali",
      "title": "Precept Austin — Deuteronomy Chapters 33–34",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapters 33–34 — napthali.png.",
      "thumb": "/visuals/deuteronomy/precept_napthali.png",
      "full": "/visuals/deuteronomy/precept_napthali.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/napthali.png"
      },
      "chapters": [
        33,
        34
      ]
    },
    {
      "id": "precept-ch-peak",
      "title": "Precept Austin — Deuteronomy Chapter 31",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapter 31 — peak.jpg.",
      "thumb": "/visuals/deuteronomy/precept_peak.jpg",
      "full": "/visuals/deuteronomy/precept_peak.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/peak.jpg"
      },
      "chapters": [
        31
      ]
    },
    {
      "id": "precept-ch-regions1",
      "title": "Precept Austin — Deuteronomy Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapter 1 — regions1.jpg.",
      "thumb": "/visuals/deuteronomy/precept_regions1.jpg",
      "full": "/visuals/deuteronomy/precept_regions1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/regions1.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-rith",
      "title": "Precept Austin — Deuteronomy Chapter 32",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapter 32 — rith.jpg.",
      "thumb": "/visuals/deuteronomy/precept_rith.jpg",
      "full": "/visuals/deuteronomy/precept_rith.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/rith.jpg"
      },
      "chapters": [
        32
      ]
    },
    {
      "id": "precept-ch-route2",
      "title": "Precept Austin — Deuteronomy Chapters 2, 6, 9",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapters 2, 6, 9 — route2.jpg.",
      "thumb": "/visuals/deuteronomy/precept_route2.jpg",
      "full": "/visuals/deuteronomy/precept_route2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/route2.jpg"
      },
      "chapters": [
        2,
        6,
        9
      ]
    },
    {
      "id": "precept-ch-sei",
      "title": "Precept Austin — Deuteronomy Chapters 1–2",
      "caption": "Bruce Hurt's commentary chart for Deuteronomy chapters 1–2 — sei.jpg.",
      "thumb": "/visuals/deuteronomy/precept_sei.jpg",
      "full": "/visuals/deuteronomy/precept_sei.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sei.jpg"
      },
      "chapters": [
        1,
        2
      ]
    }
  ]
},
  'joshua': {
  "videos": [
    {
      "youtubeId": "JqOqJlFF_eU",
      "title": "Joshua — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/JqOqJlFF_eU?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/joshua/",
      "chapterStart": 1,
      "chapterEnd": 24
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Joshua",
      "caption": "Hand-illustrated single-page overview of Joshua, tracing the book's literary design and major themes.",
      "thumb": "/visuals/joshua/bibleproject_poster.jpg",
      "full": "/visuals/joshua/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-joshua/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Joshua Bible Chart",
      "caption": "Single-page structural chart of Joshua, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/joshua/swindoll_chart.png",
      "full": "/visuals/joshua/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Joshua-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Joshua Chart",
      "caption": "Bruce Hurt's inductive-study chart for Joshua, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/joshua/precept_chart.png",
      "full": "/visuals/joshua/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/joshuachart.png"
      }
    },
    {
      "id": "precept-book-joshuaoutline",
      "title": "Precept Austin — Joshua (joshuaoutline.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Joshua chapters on Precept Austin's commentary.",
      "thumb": "/visuals/joshua/precept_joshuaoutline.png",
      "full": "/visuals/joshua/precept_joshuaoutline.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/joshuaoutline.png"
      }
    },
    {
      "id": "precept-book-joshuaoutline",
      "title": "Precept Austin — Joshua (joshuaoutline.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Joshua chapters on Precept Austin's commentary.",
      "thumb": "/visuals/joshua/precept_joshuaoutline.jpg",
      "full": "/visuals/joshua/precept_joshuaoutline.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/joshuaoutline.jpg"
      }
    },
    {
      "id": "precept-book-joshuamap",
      "title": "Precept Austin — Joshua (joshuamap.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Joshua chapters on Precept Austin's commentary.",
      "thumb": "/visuals/joshua/precept_joshuamap.png",
      "full": "/visuals/joshua/precept_joshuamap.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/joshuamap.png"
      }
    },
    {
      "id": "precept-ch-arnon",
      "title": "Precept Austin — Joshua Chapter 12",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 12 — arnon.jpg.",
      "thumb": "/visuals/joshua/precept_arnon.jpg",
      "full": "/visuals/joshua/precept_arnon.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/arnon.jpg"
      },
      "chapters": [
        12
      ]
    },
    {
      "id": "precept-ch-bashan",
      "title": "Precept Austin — Joshua Chapter 12",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 12 — bashan.jpg.",
      "thumb": "/visuals/joshua/precept_bashan.jpg",
      "full": "/visuals/joshua/precept_bashan.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bashan.jpg"
      },
      "chapters": [
        12
      ]
    },
    {
      "id": "precept-ch-bethhoron1",
      "title": "Precept Austin — Joshua Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 10 — bethhoron1.jpg.",
      "thumb": "/visuals/joshua/precept_bethhoron1.jpg",
      "full": "/visuals/joshua/precept_bethhoron1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bethhoron1.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-central",
      "title": "Precept Austin — Joshua Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 10 — central.jpg.",
      "thumb": "/visuals/joshua/precept_central.jpg",
      "full": "/visuals/joshua/precept_central.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/central.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-conquest",
      "title": "Precept Austin — Joshua Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 10 — conquest.jpg.",
      "thumb": "/visuals/joshua/precept_conquest.jpg",
      "full": "/visuals/joshua/precept_conquest.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/conquest.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-dan",
      "title": "Precept Austin — Joshua Chapter 19",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 19 — dan.jpg.",
      "thumb": "/visuals/joshua/precept_dan.jpg",
      "full": "/visuals/joshua/precept_dan.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/dan.jpg"
      },
      "chapters": [
        19
      ]
    },
    {
      "id": "precept-ch-ebal",
      "title": "Precept Austin — Joshua Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 8 — ebal.jpg.",
      "thumb": "/visuals/joshua/precept_ebal.jpg",
      "full": "/visuals/joshua/precept_ebal.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ebal.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-ebal1",
      "title": "Precept Austin — Joshua Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 8 — ebal1.jpg.",
      "thumb": "/visuals/joshua/precept_ebal1.jpg",
      "full": "/visuals/joshua/precept_ebal1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ebal1.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-edrei1",
      "title": "Precept Austin — Joshua Chapters 12, 17",
      "caption": "Bruce Hurt's commentary chart for Joshua chapters 12, 17 — edrei1.jpg.",
      "thumb": "/visuals/joshua/precept_edrei1.jpg",
      "full": "/visuals/joshua/precept_edrei1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/edrei1.jpg"
      },
      "chapters": [
        12,
        17
      ]
    },
    {
      "id": "precept-ch-ephraimz",
      "title": "Precept Austin — Joshua Chapters 16–17",
      "caption": "Bruce Hurt's commentary chart for Joshua chapters 16–17 — ephraimz.jpg.",
      "thumb": "/visuals/joshua/precept_ephraimz.jpg",
      "full": "/visuals/joshua/precept_ephraimz.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ephraimz.jpg"
      },
      "chapters": [
        16,
        17
      ]
    },
    {
      "id": "precept-ch-exodusark",
      "title": "Precept Austin — Joshua Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 3 — exodusark.jpg.",
      "thumb": "/visuals/joshua/precept_exodusark.jpg",
      "full": "/visuals/joshua/precept_exodusark.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusark.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-gad",
      "title": "Precept Austin — Joshua Chapters 12–13",
      "caption": "Bruce Hurt's commentary chart for Joshua chapters 12–13 — gad.png.",
      "thumb": "/visuals/joshua/precept_gad.png",
      "full": "/visuals/joshua/precept_gad.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gad.png"
      },
      "chapters": [
        12,
        13
      ]
    },
    {
      "id": "precept-ch-gibeon",
      "title": "Precept Austin — Joshua Chapter 9",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 9 — gibeon.jpg.",
      "thumb": "/visuals/joshua/precept_gibeon.jpg",
      "full": "/visuals/joshua/precept_gibeon.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gibeon.jpg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-gilgal",
      "title": "Precept Austin — Joshua Chapters 4, 5, 10",
      "caption": "Bruce Hurt's commentary chart for Joshua chapters 4, 5, 10 — gilgal.jpg.",
      "thumb": "/visuals/joshua/precept_gilgal.jpg",
      "full": "/visuals/joshua/precept_gilgal.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gilgal.jpg"
      },
      "chapters": [
        4,
        5,
        10
      ]
    },
    {
      "id": "precept-ch-hailstonesjoshua",
      "title": "Precept Austin — Joshua Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 10 — hailstonesjoshua.jpg.",
      "thumb": "/visuals/joshua/precept_hailstonesjoshua.jpg",
      "full": "/visuals/joshua/precept_hailstonesjoshua.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hailstonesjoshua.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-hazor",
      "title": "Precept Austin — Joshua Chapter 11",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 11 — hazor.jpg.",
      "thumb": "/visuals/joshua/precept_hazor.jpg",
      "full": "/visuals/joshua/precept_hazor.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hazor.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-israel1100",
      "title": "Precept Austin — Joshua Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 16 — israel1100.jpg.",
      "thumb": "/visuals/joshua/precept_israel1100.jpg",
      "full": "/visuals/joshua/precept_israel1100.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/israel1100.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-jerichoesv",
      "title": "Precept Austin — Joshua Chapters 2, 6",
      "caption": "Bruce Hurt's commentary chart for Joshua chapters 2, 6 — jerichoesv.jpg.",
      "thumb": "/visuals/joshua/precept_jerichoesv.jpg",
      "full": "/visuals/joshua/precept_jerichoesv.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jerichoesv.jpg"
      },
      "chapters": [
        2,
        6
      ]
    },
    {
      "id": "precept-ch-jerichohills",
      "title": "Precept Austin — Joshua Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 2 — jerichohills.jpg.",
      "thumb": "/visuals/joshua/precept_jerichohills.jpg",
      "full": "/visuals/joshua/precept_jerichohills.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jerichohills.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-jordanflood",
      "title": "Precept Austin — Joshua Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 3 — jordanflood.jpg.",
      "thumb": "/visuals/joshua/precept_jordanflood.jpg",
      "full": "/visuals/joshua/precept_jordanflood.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jordanflood.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-joshua10",
      "title": "Precept Austin — Joshua Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 10 — joshua10.jpg.",
      "thumb": "/visuals/joshua/precept_joshua10.jpg",
      "full": "/visuals/joshua/precept_joshua10.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/joshua10.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-landremain",
      "title": "Precept Austin — Joshua Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 13 — landremain.jpg.",
      "thumb": "/visuals/joshua/precept_landremain.jpg",
      "full": "/visuals/joshua/precept_landremain.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/landremain.jpg"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-levitetowns",
      "title": "Precept Austin — Joshua Chapter 21",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 21 — levitetowns.jpg.",
      "thumb": "/visuals/joshua/precept_levitetowns.jpg",
      "full": "/visuals/joshua/precept_levitetowns.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/levitetowns.jpg"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-leviticalcities",
      "title": "Precept Austin — Joshua Chapters 20–21",
      "caption": "Bruce Hurt's commentary chart for Joshua chapters 20–21 — leviticalcities.jpg.",
      "thumb": "/visuals/joshua/precept_leviticalcities.jpg",
      "full": "/visuals/joshua/precept_leviticalcities.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/leviticalcities.jpg"
      },
      "chapters": [
        20,
        21
      ]
    },
    {
      "id": "precept-ch-maptribes",
      "title": "Precept Austin — Joshua Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 13 — maptribes.jpg.",
      "thumb": "/visuals/joshua/precept_maptribes.jpg",
      "full": "/visuals/joshua/precept_maptribes.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/maptribes.jpg"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-mosesancestry",
      "title": "Precept Austin — Joshua Chapter 21",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 21 — mosesancestry.jpg.",
      "thumb": "/visuals/joshua/precept_mosesancestry.jpg",
      "full": "/visuals/joshua/precept_mosesancestry.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mosesancestry.jpg"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-napthali",
      "title": "Precept Austin — Joshua Chapters 15, 16, 17, 19",
      "caption": "Bruce Hurt's commentary chart for Joshua chapters 15, 16, 17, 19 — napthali.png.",
      "thumb": "/visuals/joshua/precept_napthali.png",
      "full": "/visuals/joshua/precept_napthali.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/napthali.png"
      },
      "chapters": [
        15,
        16,
        17,
        19
      ]
    },
    {
      "id": "precept-ch-north",
      "title": "Precept Austin — Joshua Chapter 11",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 11 — north.jpg.",
      "thumb": "/visuals/joshua/precept_north.jpg",
      "full": "/visuals/joshua/precept_north.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/north.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-shittim",
      "title": "Precept Austin — Joshua Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 2 — shittim.jpg.",
      "thumb": "/visuals/joshua/precept_shittim.jpg",
      "full": "/visuals/joshua/precept_shittim.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shittim.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-shittimtojericho",
      "title": "Precept Austin — Joshua Chapters 2–3",
      "caption": "Bruce Hurt's commentary chart for Joshua chapters 2–3 — shittimtojericho.jpg.",
      "thumb": "/visuals/joshua/precept_shittimtojericho.jpg",
      "full": "/visuals/joshua/precept_shittimtojericho.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shittimtojericho.jpg"
      },
      "chapters": [
        2,
        3
      ]
    },
    {
      "id": "precept-ch-simeonmap",
      "title": "Precept Austin — Joshua Chapter 19",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 19 — simeonmap.jpg.",
      "thumb": "/visuals/joshua/precept_simeonmap.jpg",
      "full": "/visuals/joshua/precept_simeonmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/simeonmap.jpg"
      },
      "chapters": [
        19
      ]
    },
    {
      "id": "precept-ch-tribe",
      "title": "Precept Austin — Joshua Chapters 14, 22",
      "caption": "Bruce Hurt's commentary chart for Joshua chapters 14, 22 — tribe.jpg.",
      "thumb": "/visuals/joshua/precept_tribe.jpg",
      "full": "/visuals/joshua/precept_tribe.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/tribe.jpg"
      },
      "chapters": [
        14,
        22
      ]
    },
    {
      "id": "precept-ch-zebulun",
      "title": "Precept Austin — Joshua Chapter 19",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 19 — zebulun.jpg.",
      "thumb": "/visuals/joshua/precept_zebulun.jpg",
      "full": "/visuals/joshua/precept_zebulun.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zebulun.jpg"
      },
      "chapters": [
        19
      ]
    },
    {
      "id": "precept-ch-zorah",
      "title": "Precept Austin — Joshua Chapter 15",
      "caption": "Bruce Hurt's commentary chart for Joshua chapter 15 — zorah.jpg.",
      "thumb": "/visuals/joshua/precept_zorah.jpg",
      "full": "/visuals/joshua/precept_zorah.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zorah.jpg"
      },
      "chapters": [
        15
      ]
    }
  ]
},
  'judges': {
  "videos": [
    {
      "youtubeId": "kOYy8iCfIJ4",
      "title": "Judges — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/kOYy8iCfIJ4?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/judges/",
      "chapterStart": 1,
      "chapterEnd": 21
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Judges",
      "caption": "Hand-illustrated single-page overview of Judges, tracing the book's literary design and major themes.",
      "thumb": "/visuals/judges/bibleproject_poster.jpg",
      "full": "/visuals/judges/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-judges/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Judges Bible Chart",
      "caption": "Single-page structural chart of Judges, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/judges/swindoll_chart.png",
      "full": "/visuals/judges/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Judges-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-book-judges_timeline",
      "title": "Precept Austin — Judges (judges timeline.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Judges chapters on Precept Austin's commentary.",
      "thumb": "/visuals/judges/precept_judges_timeline.png",
      "full": "/visuals/judges/precept_judges_timeline.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/judges%20timeline.png"
      }
    },
    {
      "id": "precept-book-judgestimeline",
      "title": "Precept Austin — Judges (judgestimeline.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Judges chapters on Precept Austin's commentary.",
      "thumb": "/visuals/judges/precept_judgestimeline.png",
      "full": "/visuals/judges/precept_judgestimeline.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/judgestimeline.png"
      }
    },
    {
      "id": "precept-book-judges_chart",
      "title": "Precept Austin — Judges (judges chart.gif)",
      "caption": "Bruce Hurt's chart embedded across multiple Judges chapters on Precept Austin's commentary.",
      "thumb": "/visuals/judges/precept_judges_chart.gif",
      "full": "/visuals/judges/precept_judges_chart.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Judges%20Chart.gif"
      }
    },
    {
      "id": "precept-book-judgesmap",
      "title": "Precept Austin — Judges (judgesmap.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Judges chapters on Precept Austin's commentary.",
      "thumb": "/visuals/judges/precept_judgesmap.jpg",
      "full": "/visuals/judges/precept_judgesmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/judgesmap.jpg"
      }
    },
    {
      "id": "precept-book-judgesjensen",
      "title": "Precept Austin — Judges (judgesjensen.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Judges chapters on Precept Austin's commentary.",
      "thumb": "/visuals/judges/precept_judgesjensen.png",
      "full": "/visuals/judges/precept_judgesjensen.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/judgesjensen.png"
      }
    },
    {
      "id": "precept-ch-1samap",
      "title": "Precept Austin — Judges Chapters 10, 20, 21",
      "caption": "Bruce Hurt's commentary chart for Judges chapters 10, 20, 21 — 1samap.png.",
      "thumb": "/visuals/judges/precept_1samap.png",
      "full": "/visuals/judges/precept_1samap.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1samap.png"
      },
      "chapters": [
        10,
        20,
        21
      ]
    },
    {
      "id": "precept-ch-aarontree",
      "title": "Precept Austin — Judges Chapter 20",
      "caption": "Bruce Hurt's commentary chart for Judges chapter 20 — aarontree.jpg.",
      "thumb": "/visuals/judges/precept_aarontree.jpg",
      "full": "/visuals/judges/precept_aarontree.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/aarontree.jpg"
      },
      "chapters": [
        20
      ]
    },
    {
      "id": "precept-ch-barakdefeatssisera",
      "title": "Precept Austin — Judges Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Judges chapter 4 — barakdefeatssisera.jpg.",
      "thumb": "/visuals/judges/precept_barakdefeatssisera.jpg",
      "full": "/visuals/judges/precept_barakdefeatssisera.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/barakdefeatssisera.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-barakgathersarmy",
      "title": "Precept Austin — Judges Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Judges chapter 4 — barakgathersarmy.jpg.",
      "thumb": "/visuals/judges/precept_barakgathersarmy.jpg",
      "full": "/visuals/judges/precept_barakgathersarmy.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/barakgathersarmy.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-debramah",
      "title": "Precept Austin — Judges Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Judges chapter 4 — debramah.jpg.",
      "thumb": "/visuals/judges/precept_debramah.jpg",
      "full": "/visuals/judges/precept_debramah.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/debramah.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-ebal1",
      "title": "Precept Austin — Judges Chapter 9",
      "caption": "Bruce Hurt's commentary chart for Judges chapter 9 — ebal1.jpg.",
      "thumb": "/visuals/judges/precept_ebal1.jpg",
      "full": "/visuals/judges/precept_ebal1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ebal1.jpg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-ehudkills",
      "title": "Precept Austin — Judges Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Judges chapter 3 — ehudkills.jpg.",
      "thumb": "/visuals/judges/precept_ehudkills.jpg",
      "full": "/visuals/judges/precept_ehudkills.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ehudkills.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-ehudmap",
      "title": "Precept Austin — Judges Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Judges chapter 3 — ehudmap.jpg.",
      "thumb": "/visuals/judges/precept_ehudmap.jpg",
      "full": "/visuals/judges/precept_ehudmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ehudmap.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-gad",
      "title": "Precept Austin — Judges Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Judges chapter 1 — gad.png.",
      "thumb": "/visuals/judges/precept_gad.png",
      "full": "/visuals/judges/precept_gad.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gad.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-gideonesv",
      "title": "Precept Austin — Judges Chapters 7–8",
      "caption": "Bruce Hurt's commentary chart for Judges chapters 7–8 — gideonesv.jpg.",
      "thumb": "/visuals/judges/precept_gideonesv.jpg",
      "full": "/visuals/judges/precept_gideonesv.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gideonesv.jpg"
      },
      "chapters": [
        7,
        8
      ]
    },
    {
      "id": "precept-ch-gideonkarkor",
      "title": "Precept Austin — Judges Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Judges chapter 8 — gideonkarkor.jpg.",
      "thumb": "/visuals/judges/precept_gideonkarkor.jpg",
      "full": "/visuals/judges/precept_gideonkarkor.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gideonkarkor.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-gideonpursue",
      "title": "Precept Austin — Judges Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Judges chapter 8 — gideonpursue.jpg.",
      "thumb": "/visuals/judges/precept_gideonpursue.jpg",
      "full": "/visuals/judges/precept_gideonpursue.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gideonpursue.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-judges_chart",
      "title": "Precept Austin — Judges Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Judges chapter 13 — judges chart.gif.",
      "thumb": "/visuals/judges/precept_judges_chart.gif",
      "full": "/visuals/judges/precept_judges_chart.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Judges%20Chart.gif"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-judgeslaish",
      "title": "Precept Austin — Judges Chapters 17–18",
      "caption": "Bruce Hurt's commentary chart for Judges chapters 17–18 — judgeslaish.jpg.",
      "thumb": "/visuals/judges/precept_judgeslaish.jpg",
      "full": "/visuals/judges/precept_judgeslaish.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/judgeslaish.jpg"
      },
      "chapters": [
        17,
        18
      ]
    },
    {
      "id": "precept-ch-kishon",
      "title": "Precept Austin — Judges Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Judges chapter 4 — kishon.jpg.",
      "thumb": "/visuals/judges/precept_kishon.jpg",
      "full": "/visuals/judges/precept_kishon.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/kishon.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-locust",
      "title": "Precept Austin — Judges Chapter 6",
      "caption": "Bruce Hurt's commentary chart for Judges chapter 6 — locust.jpg.",
      "thumb": "/visuals/judges/precept_locust.jpg",
      "full": "/visuals/judges/precept_locust.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/locust.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-negev",
      "title": "Precept Austin — Judges Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Judges chapter 1 — negev.jpg.",
      "thumb": "/visuals/judges/precept_negev.jpg",
      "full": "/visuals/judges/precept_negev.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/negev.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-prom",
      "title": "Precept Austin — Judges Chapters 10–11",
      "caption": "Bruce Hurt's commentary chart for Judges chapters 10–11 — prom.jpg.",
      "thumb": "/visuals/judges/precept_prom.jpg",
      "full": "/visuals/judges/precept_prom.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/prom.jpg"
      },
      "chapters": [
        10,
        11
      ]
    },
    {
      "id": "precept-ch-samsonmap1",
      "title": "Precept Austin — Judges Chapters 13, 14, 16",
      "caption": "Bruce Hurt's commentary chart for Judges chapters 13, 14, 16 — samsonmap1.jpg.",
      "thumb": "/visuals/judges/precept_samsonmap1.jpg",
      "full": "/visuals/judges/precept_samsonmap1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/samsonmap1.jpg"
      },
      "chapters": [
        13,
        14,
        16
      ]
    },
    {
      "id": "precept-ch-tabor",
      "title": "Precept Austin — Judges Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Judges chapter 4 — tabor.jpg.",
      "thumb": "/visuals/judges/precept_tabor.jpg",
      "full": "/visuals/judges/precept_tabor.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/tabor.jpg"
      },
      "chapters": [
        4
      ]
    }
  ]
},
  'ruth': {
  "videos": [
    {
      "youtubeId": "0h1eoBeR4Jk",
      "title": "Ruth — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/0h1eoBeR4Jk?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/ruth/",
      "chapterStart": 1,
      "chapterEnd": 4
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Ruth",
      "caption": "Hand-illustrated single-page overview of Ruth, tracing the book's literary design and major themes.",
      "thumb": "/visuals/ruth/bibleproject_poster.jpg",
      "full": "/visuals/ruth/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-ruth/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Ruth Bible Chart",
      "caption": "Single-page structural chart of Ruth, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/ruth/swindoll_chart.png",
      "full": "/visuals/ruth/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Ruth-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Ruth Chart",
      "caption": "Bruce Hurt's inductive-study chart for Ruth, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/ruth/precept_chart.png",
      "full": "/visuals/ruth/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ruth.png"
      }
    }
  ]
},
  '1-samuel': {
  "videos": [
    {
      "youtubeId": "QJOju5Dw0V0",
      "title": "1 Samuel — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/QJOju5Dw0V0?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/1-samuel/",
      "chapterStart": 1,
      "chapterEnd": 31
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: 1 Samuel",
      "caption": "Hand-illustrated single-page overview of 1 Samuel, tracing the book's literary design and major themes.",
      "thumb": "/visuals/1-samuel/bibleproject_poster.jpg",
      "full": "/visuals/1-samuel/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-1-samuel/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — 1 Samuel Bible Chart",
      "caption": "Single-page structural chart of 1 Samuel, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/1-samuel/swindoll_chart.png",
      "full": "/visuals/1-samuel/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/1-Samuel-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-book-1kichart2",
      "title": "Precept Austin — 1 Samuel (1kichart2.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Samuel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-samuel/precept_1kichart2.png",
      "full": "/visuals/1-samuel/precept_1kichart2.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichart2.png"
      }
    },
    {
      "id": "precept-book-1samap",
      "title": "Precept Austin — 1 Samuel (1samap.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Samuel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-samuel/precept_1samap.png",
      "full": "/visuals/1-samuel/precept_1samap.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1samap.png"
      }
    },
    {
      "id": "precept-book-1samueltimeline",
      "title": "Precept Austin — 1 Samuel (1samueltimeline.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Samuel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-samuel/precept_1samueltimeline.png",
      "full": "/visuals/1-samuel/precept_1samueltimeline.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1samueltimeline.png"
      }
    },
    {
      "id": "precept-book-1sa3",
      "title": "Precept Austin — 1 Samuel (1sa3.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Samuel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-samuel/precept_1sa3.png",
      "full": "/visuals/1-samuel/precept_1sa3.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1sa3.png"
      }
    },
    {
      "id": "precept-book-1sa3kings",
      "title": "Precept Austin — 1 Samuel (1sa3kings.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Samuel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-samuel/precept_1sa3kings.png",
      "full": "/visuals/1-samuel/precept_1sa3kings.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1sa3kings.png"
      }
    },
    {
      "id": "precept-book-1sam",
      "title": "Precept Austin — 1 Samuel (1sam.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Samuel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-samuel/precept_1sam.png",
      "full": "/visuals/1-samuel/precept_1sam.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1sam.png"
      }
    },
    {
      "id": "precept-book-1samain",
      "title": "Precept Austin — 1 Samuel (1samain.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Samuel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-samuel/precept_1samain.png",
      "full": "/visuals/1-samuel/precept_1samain.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1samain.png"
      }
    },
    {
      "id": "precept-book-1saman",
      "title": "Precept Austin — 1 Samuel (1saman.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Samuel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-samuel/precept_1saman.png",
      "full": "/visuals/1-samuel/precept_1saman.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1saman.png"
      }
    },
    {
      "id": "precept-book-1satime",
      "title": "Precept Austin — 1 Samuel (1satime.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Samuel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-samuel/precept_1satime.png",
      "full": "/visuals/1-samuel/precept_1satime.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1satime.png"
      }
    },
    {
      "id": "precept-ch-1sa3",
      "title": "Precept Austin — 1 Samuel Chapters 16–23",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapters 16–23 — 1sa3.png.",
      "thumb": "/visuals/1-samuel/precept_1sa3.png",
      "full": "/visuals/1-samuel/precept_1sa3.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1sa3.png"
      },
      "chapters": [
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23
      ]
    },
    {
      "id": "precept-ch-1sa3kings",
      "title": "Precept Austin — 1 Samuel Chapters 16–23",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapters 16–23 — 1sa3kings.png.",
      "thumb": "/visuals/1-samuel/precept_1sa3kings.png",
      "full": "/visuals/1-samuel/precept_1sa3kings.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1sa3kings.png"
      },
      "chapters": [
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23
      ]
    },
    {
      "id": "precept-ch-1samain",
      "title": "Precept Austin — 1 Samuel Chapters 16–23",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapters 16–23 — 1samain.png.",
      "thumb": "/visuals/1-samuel/precept_1samain.png",
      "full": "/visuals/1-samuel/precept_1samain.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1samain.png"
      },
      "chapters": [
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23
      ]
    },
    {
      "id": "precept-ch-1saman",
      "title": "Precept Austin — 1 Samuel Chapters 1–8",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapters 1–8 — 1saman.png.",
      "thumb": "/visuals/1-samuel/precept_1saman.png",
      "full": "/visuals/1-samuel/precept_1saman.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1saman.png"
      },
      "chapters": [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8
      ]
    },
    {
      "id": "precept-ch-aarontree",
      "title": "Precept Austin — 1 Samuel Chapter 2",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 2 — aarontree.jpg.",
      "thumb": "/visuals/1-samuel/precept_aarontree.jpg",
      "full": "/visuals/1-samuel/precept_aarontree.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/aarontree.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-amalek",
      "title": "Precept Austin — 1 Samuel Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 15 — amalek.jpg.",
      "thumb": "/visuals/1-samuel/precept_amalek.jpg",
      "full": "/visuals/1-samuel/precept_amalek.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/amalek.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-ark1",
      "title": "Precept Austin — 1 Samuel Chapter 4",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 4 — ark1.jpg.",
      "thumb": "/visuals/1-samuel/precept_ark1.jpg",
      "full": "/visuals/1-samuel/precept_ark1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ark1.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-ark2esv",
      "title": "Precept Austin — 1 Samuel Chapter 6",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 6 — ark2esv.jpg.",
      "thumb": "/visuals/1-samuel/precept_ark2esv.jpg",
      "full": "/visuals/1-samuel/precept_ark2esv.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ark2esv.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-arkcaptured",
      "title": "Precept Austin — 1 Samuel Chapters 4–7",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapters 4–7 — arkcaptured.jpg.",
      "thumb": "/visuals/1-samuel/precept_arkcaptured.jpg",
      "full": "/visuals/1-samuel/precept_arkcaptured.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/arkcaptured.jpg"
      },
      "chapters": [
        4,
        5,
        6,
        7
      ]
    },
    {
      "id": "precept-ch-bethel",
      "title": "Precept Austin — 1 Samuel Chapter 7",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 7 — bethel.jpg.",
      "thumb": "/visuals/1-samuel/precept_bethel.jpg",
      "full": "/visuals/1-samuel/precept_bethel.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bethel.jpg"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-buck",
      "title": "Precept Austin — 1 Samuel Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 15 — buck.jpeg.",
      "thumb": "/visuals/1-samuel/precept_buck.jpg",
      "full": "/visuals/1-samuel/precept_buck.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/buck.jpeg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-crown",
      "title": "Precept Austin — 1 Samuel Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 15 — crown.jpg.",
      "thumb": "/visuals/1-samuel/precept_crown.jpg",
      "full": "/visuals/1-samuel/precept_crown.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/crown.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-dagon1",
      "title": "Precept Austin — 1 Samuel Chapter 5",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 5 — dagon1.jpg.",
      "thumb": "/visuals/1-samuel/precept_dagon1.jpg",
      "full": "/visuals/1-samuel/precept_dagon1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/dagon1.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-davidflee",
      "title": "Precept Austin — 1 Samuel Chapters 19, 20, 21, 22, 23, 24, 25, 26, 28, 30, 31",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapters 19, 20, 21, 22, 23, 24, 25, 26, 28, 30, 31 — davidflee.jpg.",
      "thumb": "/visuals/1-samuel/precept_davidflee.jpg",
      "full": "/visuals/1-samuel/precept_davidflee.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/davidflee.jpg"
      },
      "chapters": [
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        28,
        30,
        31
      ]
    },
    {
      "id": "precept-ch-davidflees",
      "title": "Precept Austin — 1 Samuel Chapters 19–26",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapters 19–26 — davidflees.jpg.",
      "thumb": "/visuals/1-samuel/precept_davidflees.jpg",
      "full": "/visuals/1-samuel/precept_davidflees.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/davidflees.jpg"
      },
      "chapters": [
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26
      ]
    },
    {
      "id": "precept-ch-gilgal",
      "title": "Precept Austin — 1 Samuel Chapter 7",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 7 — gilgal.jpg.",
      "thumb": "/visuals/1-samuel/precept_gilgal.jpg",
      "full": "/visuals/1-samuel/precept_gilgal.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gilgal.jpg"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-goliathmap",
      "title": "Precept Austin — 1 Samuel Chapter 17",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 17 — goliathmap.jpg.",
      "thumb": "/visuals/1-samuel/precept_goliathmap.jpg",
      "full": "/visuals/1-samuel/precept_goliathmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/goliathmap.jpg"
      },
      "chapters": [
        17
      ]
    },
    {
      "id": "precept-ch-hachilah",
      "title": "Precept Austin — 1 Samuel Chapter 26",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 26 — hachilah.jpg.",
      "thumb": "/visuals/1-samuel/precept_hachilah.jpg",
      "full": "/visuals/1-samuel/precept_hachilah.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hachilah.jpg"
      },
      "chapters": [
        26
      ]
    },
    {
      "id": "precept-ch-israelgenericmap",
      "title": "Precept Austin — 1 Samuel Chapters 13–15",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapters 13–15 — israelgenericmap.png.",
      "thumb": "/visuals/1-samuel/precept_israelgenericmap.png",
      "full": "/visuals/1-samuel/precept_israelgenericmap.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/israelgenericmap.png"
      },
      "chapters": [
        13,
        14,
        15
      ]
    },
    {
      "id": "precept-ch-jabesh",
      "title": "Precept Austin — 1 Samuel Chapter 11",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 11 — jabesh.jpg.",
      "thumb": "/visuals/1-samuel/precept_jabesh.jpg",
      "full": "/visuals/1-samuel/precept_jabesh.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jabesh.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-jabeshesv",
      "title": "Precept Austin — 1 Samuel Chapter 11",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 11 — jabeshesv.jpg.",
      "thumb": "/visuals/1-samuel/precept_jabeshesv.jpg",
      "full": "/visuals/1-samuel/precept_jabeshesv.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jabeshesv.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-judges",
      "title": "Precept Austin — 1 Samuel Chapter 7",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 7 — judges.jpg.",
      "thumb": "/visuals/1-samuel/precept_judges.jpg",
      "full": "/visuals/1-samuel/precept_judges.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/judges.jpg"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-judgestimeline",
      "title": "Precept Austin — 1 Samuel Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 1 — judgestimeline.png.",
      "thumb": "/visuals/1-samuel/precept_judgestimeline.png",
      "full": "/visuals/1-samuel/precept_judgestimeline.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/judgestimeline.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-judgestimeline2",
      "title": "Precept Austin — 1 Samuel Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 1 — judgestimeline2.jpg.",
      "thumb": "/visuals/1-samuel/precept_judgestimeline2.jpg",
      "full": "/visuals/1-samuel/precept_judgestimeline2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/judgestimeline2.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-mapdavid",
      "title": "Precept Austin — 1 Samuel Chapters 27–28",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapters 27–28 — mapdavid.jpg.",
      "thumb": "/visuals/1-samuel/precept_mapdavid.jpg",
      "full": "/visuals/1-samuel/precept_mapdavid.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mapdavid.jpg"
      },
      "chapters": [
        27,
        28
      ]
    },
    {
      "id": "precept-ch-michmash",
      "title": "Precept Austin — 1 Samuel Chapters 13–14",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapters 13–14 — michmash.jpg.",
      "thumb": "/visuals/1-samuel/precept_michmash.jpg",
      "full": "/visuals/1-samuel/precept_michmash.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/michmash.jpg"
      },
      "chapters": [
        13,
        14
      ]
    },
    {
      "id": "precept-ch-michmash1",
      "title": "Precept Austin — 1 Samuel Chapter 13",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 13 — michmash1.jpg.",
      "thumb": "/visuals/1-samuel/precept_michmash1.jpg",
      "full": "/visuals/1-samuel/precept_michmash1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/michmash1.jpg"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-napthali",
      "title": "Precept Austin — 1 Samuel Chapters 1, 3, 8, 9, 11, 27, 31",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapters 1, 3, 8, 9, 11, 27, 31 — napthali.png.",
      "thumb": "/visuals/1-samuel/precept_napthali.png",
      "full": "/visuals/1-samuel/precept_napthali.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/napthali.png"
      },
      "chapters": [
        1,
        3,
        8,
        9,
        11,
        27,
        31
      ]
    },
    {
      "id": "precept-ch-philistinesdefeatisrael",
      "title": "Precept Austin — 1 Samuel Chapter 4",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 4 — philistinesdefeatisrael.jpg.",
      "thumb": "/visuals/1-samuel/precept_philistinesdefeatisrael.jpg",
      "full": "/visuals/1-samuel/precept_philistinesdefeatisrael.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/philistinesdefeatisrael.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-ramah",
      "title": "Precept Austin — 1 Samuel Chapters 1, 7, 8",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapters 1, 7, 8 — ramah.jpg.",
      "thumb": "/visuals/1-samuel/precept_ramah.jpg",
      "full": "/visuals/1-samuel/precept_ramah.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ramah.jpg"
      },
      "chapters": [
        1,
        7,
        8
      ]
    },
    {
      "id": "precept-ch-ruth_41",
      "title": "Precept Austin — 1 Samuel Chapter 16",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 16 — ruth_41.gif.",
      "thumb": "/visuals/1-samuel/precept_ruth_41.gif",
      "full": "/visuals/1-samuel/precept_ruth_41.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ruth_41.gif"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-saulbattles",
      "title": "Precept Austin — 1 Samuel Chapter 29",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 29 — saulbattles.jpg.",
      "thumb": "/visuals/1-samuel/precept_saulbattles.jpg",
      "full": "/visuals/1-samuel/precept_saulbattles.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/saulbattles.jpg"
      },
      "chapters": [
        29
      ]
    },
    {
      "id": "precept-ch-shiloh",
      "title": "Precept Austin — 1 Samuel Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 1 — shiloh.jpg.",
      "thumb": "/visuals/1-samuel/precept_shiloh.jpg",
      "full": "/visuals/1-samuel/precept_shiloh.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shiloh.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-sincycle",
      "title": "Precept Austin — 1 Samuel Chapters 7, 12",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapters 7, 12 — sincycle.jpg.",
      "thumb": "/visuals/1-samuel/precept_sincycle.jpg",
      "full": "/visuals/1-samuel/precept_sincycle.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sincycle.jpg"
      },
      "chapters": [
        7,
        12
      ]
    },
    {
      "id": "precept-ch-ziklag",
      "title": "Precept Austin — 1 Samuel Chapter 27",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapter 27 — ziklag.jpg.",
      "thumb": "/visuals/1-samuel/precept_ziklag.jpg",
      "full": "/visuals/1-samuel/precept_ziklag.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ziklag.jpg"
      },
      "chapters": [
        27
      ]
    }
  ]
},
  '2-samuel': {
  "videos": [
    {
      "youtubeId": "YvoWDXNDJgs",
      "title": "2 Samuel — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/YvoWDXNDJgs?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/2-samuel/",
      "chapterStart": 1,
      "chapterEnd": 24
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: 2 Samuel",
      "caption": "Hand-illustrated single-page overview of 2 Samuel, tracing the book's literary design and major themes.",
      "thumb": "/visuals/2-samuel/bibleproject_poster.jpg",
      "full": "/visuals/2-samuel/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-2-samuel/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — 2 Samuel Bible Chart",
      "caption": "Single-page structural chart of 2 Samuel, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/2-samuel/swindoll_chart.png",
      "full": "/visuals/2-samuel/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/2-Samuel-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-book-1kichart2",
      "title": "Precept Austin — 2 Samuel (1kichart2.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Samuel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-samuel/precept_1kichart2.png",
      "full": "/visuals/2-samuel/precept_1kichart2.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichart2.png"
      }
    },
    {
      "id": "precept-book-1samap",
      "title": "Precept Austin — 2 Samuel (1samap.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Samuel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-samuel/precept_1samap.png",
      "full": "/visuals/2-samuel/precept_1samap.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1samap.png"
      }
    },
    {
      "id": "precept-book-1scoverage",
      "title": "Precept Austin — 2 Samuel (1scoverage.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Samuel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-samuel/precept_1scoverage.png",
      "full": "/visuals/2-samuel/precept_1scoverage.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1scoverage.png"
      }
    },
    {
      "id": "precept-book-2saplot",
      "title": "Precept Austin — 2 Samuel (2saplot.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Samuel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-samuel/precept_2saplot.png",
      "full": "/visuals/2-samuel/precept_2saplot.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/2saplot.png"
      }
    },
    {
      "id": "precept-book-2satime",
      "title": "Precept Austin — 2 Samuel (2satime.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Samuel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-samuel/precept_2satime.png",
      "full": "/visuals/2-samuel/precept_2satime.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/2satime.png"
      }
    },
    {
      "id": "precept-book-2samuel",
      "title": "Precept Austin — 2 Samuel (2samuel.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Samuel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-samuel/precept_2samuel.jpg",
      "full": "/visuals/2-samuel/precept_2samuel.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/2samuel.jpg"
      }
    },
    {
      "id": "precept-book-2samuelesv",
      "title": "Precept Austin — 2 Samuel (2samuelesv.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Samuel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-samuel/precept_2samuelesv.jpg",
      "full": "/visuals/2-samuel/precept_2samuelesv.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/2samuelesv.jpg"
      }
    },
    {
      "id": "precept-ch-abelbethmaacah",
      "title": "Precept Austin — 2 Samuel Chapter 20",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapter 20 — abelbethmaacah.png.",
      "thumb": "/visuals/2-samuel/precept_abelbethmaacah.png",
      "full": "/visuals/2-samuel/precept_abelbethmaacah.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/abelbethmaacah.png"
      },
      "chapters": [
        20
      ]
    },
    {
      "id": "precept-ch-ark2esv",
      "title": "Precept Austin — 2 Samuel Chapters 6, 15",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapters 6, 15 — ark2esv.jpg.",
      "thumb": "/visuals/2-samuel/precept_ark2esv.jpg",
      "full": "/visuals/2-samuel/precept_ark2esv.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ark2esv.jpg"
      },
      "chapters": [
        6,
        15
      ]
    },
    {
      "id": "precept-ch-davidcity",
      "title": "Precept Austin — 2 Samuel Chapter 5",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapter 5 — davidcity.jpg.",
      "thumb": "/visuals/2-samuel/precept_davidcity.jpg",
      "full": "/visuals/2-samuel/precept_davidcity.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/davidcity.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-davidsfamily",
      "title": "Precept Austin — 2 Samuel Chapters 3, 5",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapters 3, 5 — davidsfamily.jpg.",
      "thumb": "/visuals/2-samuel/precept_davidsfamily.jpg",
      "full": "/visuals/2-samuel/precept_davidsfamily.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/davidsfamily.jpg"
      },
      "chapters": [
        3,
        5
      ]
    },
    {
      "id": "precept-ch-davidtree",
      "title": "Precept Austin — 2 Samuel Chapters 3, 5, 14, 17, 21",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapters 3, 5, 14, 17, 21 — davidtree.png.",
      "thumb": "/visuals/2-samuel/precept_davidtree.png",
      "full": "/visuals/2-samuel/precept_davidtree.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/davidtree.png"
      },
      "chapters": [
        3,
        5,
        14,
        17,
        21
      ]
    },
    {
      "id": "precept-ch-domerock1",
      "title": "Precept Austin — 2 Samuel Chapter 24",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapter 24 — domerock1.jpg.",
      "thumb": "/visuals/2-samuel/precept_domerock1.jpg",
      "full": "/visuals/2-samuel/precept_domerock1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/domerock1.jpg"
      },
      "chapters": [
        24
      ]
    },
    {
      "id": "precept-ch-enrogel1",
      "title": "Precept Austin — 2 Samuel Chapter 17",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapter 17 — enrogel1.jpg.",
      "thumb": "/visuals/2-samuel/precept_enrogel1.jpg",
      "full": "/visuals/2-samuel/precept_enrogel1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/enrogel1.jpg"
      },
      "chapters": [
        17
      ]
    },
    {
      "id": "precept-ch-exodusglory",
      "title": "Precept Austin — 2 Samuel Chapter 6",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapter 6 — exodusglory.jpg.",
      "thumb": "/visuals/2-samuel/precept_exodusglory.jpg",
      "full": "/visuals/2-samuel/precept_exodusglory.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusglory.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-geshur",
      "title": "Precept Austin — 2 Samuel Chapters 13–14",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapters 13–14 — geshur.png.",
      "thumb": "/visuals/2-samuel/precept_geshur.png",
      "full": "/visuals/2-samuel/precept_geshur.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/geshur.png"
      },
      "chapters": [
        13,
        14
      ]
    },
    {
      "id": "precept-ch-gibeon1",
      "title": "Precept Austin — 2 Samuel Chapters 2, 4",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapters 2, 4 — gibeon1.jpg.",
      "thumb": "/visuals/2-samuel/precept_gibeon1.jpg",
      "full": "/visuals/2-samuel/precept_gibeon1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gibeon1.jpg"
      },
      "chapters": [
        2,
        4
      ]
    },
    {
      "id": "precept-ch-leviticalcities",
      "title": "Precept Austin — 2 Samuel Chapter 3",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapter 3 — leviticalcities.jpg.",
      "thumb": "/visuals/2-samuel/precept_leviticalcities.jpg",
      "full": "/visuals/2-samuel/precept_leviticalcities.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/leviticalcities.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-mahanaim",
      "title": "Precept Austin — 2 Samuel Chapter 2",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapter 2 — mahanaim.jpg.",
      "thumb": "/visuals/2-samuel/precept_mahanaim.jpg",
      "full": "/visuals/2-samuel/precept_mahanaim.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mahanaim.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-mahanaim1",
      "title": "Precept Austin — 2 Samuel Chapters 17–19",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapters 17–19 — mahanaim1.jpg.",
      "thumb": "/visuals/2-samuel/precept_mahanaim1.jpg",
      "full": "/visuals/2-samuel/precept_mahanaim1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mahanaim1.jpg"
      },
      "chapters": [
        17,
        18,
        19
      ]
    },
    {
      "id": "precept-ch-moriah",
      "title": "Precept Austin — 2 Samuel Chapter 24",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapter 24 — moriah.png.",
      "thumb": "/visuals/2-samuel/precept_moriah.png",
      "full": "/visuals/2-samuel/precept_moriah.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/moriah.png"
      },
      "chapters": [
        24
      ]
    },
    {
      "id": "precept-ch-napthali",
      "title": "Precept Austin — 2 Samuel Chapter 3",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapter 3 — napthali.png.",
      "thumb": "/visuals/2-samuel/precept_napthali.png",
      "full": "/visuals/2-samuel/precept_napthali.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/napthali.png"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-poolgibeon",
      "title": "Precept Austin — 2 Samuel Chapter 2",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapter 2 — poolgibeon.png.",
      "thumb": "/visuals/2-samuel/precept_poolgibeon.png",
      "full": "/visuals/2-samuel/precept_poolgibeon.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/poolgibeon.png"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-rephaim",
      "title": "Precept Austin — 2 Samuel Chapter 5",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapter 5 — rephaim.jpg.",
      "thumb": "/visuals/2-samuel/precept_rephaim.jpg",
      "full": "/visuals/2-samuel/precept_rephaim.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/rephaim.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-tekoa",
      "title": "Precept Austin — 2 Samuel Chapter 14",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapter 14 — tekoa.jpg.",
      "thumb": "/visuals/2-samuel/precept_tekoa.jpg",
      "full": "/visuals/2-samuel/precept_tekoa.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/tekoa.jpg"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-vision",
      "title": "Precept Austin — 2 Samuel Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapter 15 — vision.jpg.",
      "thumb": "/visuals/2-samuel/precept_vision.jpg",
      "full": "/visuals/2-samuel/precept_vision.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/vision.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-well",
      "title": "Precept Austin — 2 Samuel Chapter 17",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapter 17 — well.jpg.",
      "thumb": "/visuals/2-samuel/precept_well.jpg",
      "full": "/visuals/2-samuel/precept_well.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/well.jpg"
      },
      "chapters": [
        17
      ]
    },
    {
      "id": "precept-ch-zadok",
      "title": "Precept Austin — 2 Samuel Chapters 8, 20",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapters 8, 20 — zadok.png.",
      "thumb": "/visuals/2-samuel/precept_zadok.png",
      "full": "/visuals/2-samuel/precept_zadok.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zadok.png"
      },
      "chapters": [
        8,
        20
      ]
    },
    {
      "id": "precept-ch-zeph-1",
      "title": "Precept Austin — 2 Samuel Chapter 7",
      "caption": "Bruce Hurt's commentary chart for 2 Samuel chapter 7 — zeph-1.gif.",
      "thumb": "/visuals/2-samuel/precept_zeph-1.gif",
      "full": "/visuals/2-samuel/precept_zeph-1.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zeph-1.gif"
      },
      "chapters": [
        7
      ]
    }
  ]
},
  '1-kings': {
  "videos": [
    {
      "youtubeId": "bVFW3wbi9pk",
      "title": "1–2 Kings — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/bVFW3wbi9pk?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/1-kings/",
      "chapterStart": 1,
      "chapterEnd": 22
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: 1 Kings",
      "caption": "Hand-illustrated single-page overview of 1 Kings, tracing the book's literary design and major themes.",
      "thumb": "/visuals/1-kings/bibleproject_poster.jpg",
      "full": "/visuals/1-kings/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-1-kings/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — 1 Kings Bible Chart",
      "caption": "Single-page structural chart of 1 Kings, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/1-kings/swindoll_chart.png",
      "full": "/visuals/1-kings/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/1-Kings-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — 1 Kings Chart",
      "caption": "Bruce Hurt's inductive-study chart for 1 Kings, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/1-kings/precept_chart.png",
      "full": "/visuals/1-kings/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichart.png"
      }
    },
    {
      "id": "precept-book-1kichart2",
      "title": "Precept Austin — 1 Kings (1kichart2.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Kings chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-kings/precept_1kichart2.png",
      "full": "/visuals/1-kings/precept_1kichart2.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichart2.png"
      }
    },
    {
      "id": "precept-book-12kingsall",
      "title": "Precept Austin — 1 Kings (12kingsall.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Kings chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-kings/precept_12kingsall.png",
      "full": "/visuals/1-kings/precept_12kingsall.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/12kingsall.png"
      }
    },
    {
      "id": "precept-book-1ki",
      "title": "Precept Austin — 1 Kings (1ki.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Kings chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-kings/precept_1ki.png",
      "full": "/visuals/1-kings/precept_1ki.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1ki.png"
      }
    },
    {
      "id": "precept-book-1kichr",
      "title": "Precept Austin — 1 Kings (1kichr.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Kings chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-kings/precept_1kichr.png",
      "full": "/visuals/1-kings/precept_1kichr.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichr.png"
      }
    },
    {
      "id": "precept-book-1kichrsetting",
      "title": "Precept Austin — 1 Kings (1kichrsetting.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Kings chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-kings/precept_1kichrsetting.png",
      "full": "/visuals/1-kings/precept_1kichrsetting.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichrsetting.png"
      }
    },
    {
      "id": "precept-book-1kitime",
      "title": "Precept Austin — 1 Kings (1kitime.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Kings chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-kings/precept_1kitime.png",
      "full": "/visuals/1-kings/precept_1kitime.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kitime.png"
      }
    },
    {
      "id": "precept-book-1kjensen",
      "title": "Precept Austin — 1 Kings (1kjensen.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Kings chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-kings/precept_1kjensen.png",
      "full": "/visuals/1-kings/precept_1kjensen.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kjensen.png"
      }
    },
    {
      "id": "precept-ch-1ki",
      "title": "Precept Austin — 1 Kings Chapters 1–2",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapters 1–2 — 1ki.png.",
      "thumb": "/visuals/1-kings/precept_1ki.png",
      "full": "/visuals/1-kings/precept_1ki.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1ki.png"
      },
      "chapters": [
        1,
        2
      ]
    },
    {
      "id": "precept-ch-1kichart2",
      "title": "Precept Austin — 1 Kings Chapters 1–2",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapters 1–2 — 1kichart2.png.",
      "thumb": "/visuals/1-kings/precept_1kichart2.png",
      "full": "/visuals/1-kings/precept_1kichart2.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichart2.png"
      },
      "chapters": [
        1,
        2
      ]
    },
    {
      "id": "precept-ch-1kichr",
      "title": "Precept Austin — 1 Kings Chapters 1–2",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapters 1–2 — 1kichr.png.",
      "thumb": "/visuals/1-kings/precept_1kichr.png",
      "full": "/visuals/1-kings/precept_1kichr.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichr.png"
      },
      "chapters": [
        1,
        2
      ]
    },
    {
      "id": "precept-ch-1kichrsetting",
      "title": "Precept Austin — 1 Kings Chapters 1–2",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapters 1–2 — 1kichrsetting.png.",
      "thumb": "/visuals/1-kings/precept_1kichrsetting.png",
      "full": "/visuals/1-kings/precept_1kichrsetting.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichrsetting.png"
      },
      "chapters": [
        1,
        2
      ]
    },
    {
      "id": "precept-ch-1samuelmapesv",
      "title": "Precept Austin — 1 Kings Chapter 2",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 2 — 1samuelmapesv.jpg.",
      "thumb": "/visuals/1-kings/precept_1samuelmapesv.jpg",
      "full": "/visuals/1-kings/precept_1samuelmapesv.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1samuelmapesv.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-babel",
      "title": "Precept Austin — 1 Kings Chapter 3",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 3 — babel.jpg.",
      "thumb": "/visuals/1-kings/precept_babel.jpg",
      "full": "/visuals/1-kings/precept_babel.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/babel.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-citydavid1",
      "title": "Precept Austin — 1 Kings Chapter 3",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 3 — citydavid1.jpg.",
      "thumb": "/visuals/1-kings/precept_citydavid1.jpg",
      "full": "/visuals/1-kings/precept_citydavid1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/citydavid1.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-dividedkingdom",
      "title": "Precept Austin — 1 Kings Chapters 12, 14",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapters 12, 14 — dividedkingdom.jpg.",
      "thumb": "/visuals/1-kings/precept_dividedkingdom.jpg",
      "full": "/visuals/1-kings/precept_dividedkingdom.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/dividedkingdom.jpg"
      },
      "chapters": [
        12,
        14
      ]
    },
    {
      "id": "precept-ch-elijahmap",
      "title": "Precept Austin — 1 Kings Chapter 17",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 17 — elijahmap.jpg.",
      "thumb": "/visuals/1-kings/precept_elijahmap.jpg",
      "full": "/visuals/1-kings/precept_elijahmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/elijahmap.jpg"
      },
      "chapters": [
        17
      ]
    },
    {
      "id": "precept-ch-elijahministry",
      "title": "Precept Austin — 1 Kings Chapter 17",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 17 — elijahministry.jpg.",
      "thumb": "/visuals/1-kings/precept_elijahministry.jpg",
      "full": "/visuals/1-kings/precept_elijahministry.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/elijahministry.jpg"
      },
      "chapters": [
        17
      ]
    },
    {
      "id": "precept-ch-enrogel1",
      "title": "Precept Austin — 1 Kings Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 1 — enrogel1.jpg.",
      "thumb": "/visuals/1-kings/precept_enrogel1.jpg",
      "full": "/visuals/1-kings/precept_enrogel1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/enrogel1.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-ephraimz",
      "title": "Precept Austin — 1 Kings Chapter 12",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 12 — ephraimz.jpg.",
      "thumb": "/visuals/1-kings/precept_ephraimz.jpg",
      "full": "/visuals/1-kings/precept_ephraimz.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ephraimz.jpg"
      },
      "chapters": [
        12
      ]
    },
    {
      "id": "precept-ch-exodusglory",
      "title": "Precept Austin — 1 Kings Chapters 6, 8",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapters 6, 8 — exodusglory.jpg.",
      "thumb": "/visuals/1-kings/precept_exodusglory.jpg",
      "full": "/visuals/1-kings/precept_exodusglory.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusglory.jpg"
      },
      "chapters": [
        6,
        8
      ]
    },
    {
      "id": "precept-ch-exodustabernacleesvbig",
      "title": "Precept Austin — 1 Kings Chapter 3",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 3 — exodustabernacleesvbig.jpg.",
      "thumb": "/visuals/1-kings/precept_exodustabernacleesvbig.jpg",
      "full": "/visuals/1-kings/precept_exodustabernacleesvbig.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodustabernacleesvbig.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-exodusvia",
      "title": "Precept Austin — 1 Kings Chapter 9",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 9 — exodusvia.png.",
      "thumb": "/visuals/1-kings/precept_exodusvia.png",
      "full": "/visuals/1-kings/precept_exodusvia.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusvia.png"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-ezion",
      "title": "Precept Austin — 1 Kings Chapter 9",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 9 — ezion.jpg.",
      "thumb": "/visuals/1-kings/precept_ezion.jpg",
      "full": "/visuals/1-kings/precept_ezion.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ezion.jpg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-gibeon",
      "title": "Precept Austin — 1 Kings Chapter 3",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 3 — gibeon.jpg.",
      "thumb": "/visuals/1-kings/precept_gibeon.jpg",
      "full": "/visuals/1-kings/precept_gibeon.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gibeon.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-gibeon2",
      "title": "Precept Austin — 1 Kings Chapter 3",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 3 — gibeon2.jpg.",
      "thumb": "/visuals/1-kings/precept_gibeon2.jpg",
      "full": "/visuals/1-kings/precept_gibeon2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gibeon2.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-gideonesv",
      "title": "Precept Austin — 1 Kings Chapter 12",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 12 — gideonesv.jpg.",
      "thumb": "/visuals/1-kings/precept_gideonesv.jpg",
      "full": "/visuals/1-kings/precept_gideonesv.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gideonesv.jpg"
      },
      "chapters": [
        12
      ]
    },
    {
      "id": "precept-ch-israelassy",
      "title": "Precept Austin — 1 Kings Chapter 14",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 14 — israelassy.png.",
      "thumb": "/visuals/1-kings/precept_israelassy.png",
      "full": "/visuals/1-kings/precept_israelassy.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/israelassy.png"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-jehezion",
      "title": "Precept Austin — 1 Kings Chapter 22",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 22 — jehezion.jpg.",
      "thumb": "/visuals/1-kings/precept_jehezion.jpg",
      "full": "/visuals/1-kings/precept_jehezion.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jehezion.jpg"
      },
      "chapters": [
        22
      ]
    },
    {
      "id": "precept-ch-map_of_elijah_without_topography_small",
      "title": "Precept Austin — 1 Kings Chapter 19",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 19 — map of elijah without topography_small.gif.",
      "thumb": "/visuals/1-kings/precept_map_of_elijah_without_topography_small.gif",
      "full": "/visuals/1-kings/precept_map_of_elijah_without_topography_small.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/map%20of%20elijah%20without%20topography_small.gif"
      },
      "chapters": [
        19
      ]
    },
    {
      "id": "precept-ch-napthali",
      "title": "Precept Austin — 1 Kings Chapters 4, 9, 12, 14",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapters 4, 9, 12, 14 — napthali.png.",
      "thumb": "/visuals/1-kings/precept_napthali.png",
      "full": "/visuals/1-kings/precept_napthali.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/napthali.png"
      },
      "chapters": [
        4,
        9,
        12,
        14
      ]
    },
    {
      "id": "precept-ch-ramah1",
      "title": "Precept Austin — 1 Kings Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 15 — ramah1.jpg.",
      "thumb": "/visuals/1-kings/precept_ramah1.jpg",
      "full": "/visuals/1-kings/precept_ramah1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ramah1.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-sheba",
      "title": "Precept Austin — 1 Kings Chapter 10",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 10 — sheba.jpg.",
      "thumb": "/visuals/1-kings/precept_sheba.jpg",
      "full": "/visuals/1-kings/precept_sheba.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sheba.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-solomondistricts",
      "title": "Precept Austin — 1 Kings Chapter 4",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 4 — solomondistricts.jpg.",
      "thumb": "/visuals/1-kings/precept_solomondistricts.jpg",
      "full": "/visuals/1-kings/precept_solomondistricts.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/solomondistricts.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-solomonfortress",
      "title": "Precept Austin — 1 Kings Chapter 9",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 9 — solomonfortress.png.",
      "thumb": "/visuals/1-kings/precept_solomonfortress.png",
      "full": "/visuals/1-kings/precept_solomonfortress.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/solomonfortress.png"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-solomonhouse",
      "title": "Precept Austin — 1 Kings Chapter 7",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 7 — solomonhouse.jpg.",
      "thumb": "/visuals/1-kings/precept_solomonhouse.jpg",
      "full": "/visuals/1-kings/precept_solomonhouse.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/solomonhouse.jpg"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-solomonkingdom",
      "title": "Precept Austin — 1 Kings Chapter 4",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 4 — solomonkingdom.jpg.",
      "thumb": "/visuals/1-kings/precept_solomonkingdom.jpg",
      "full": "/visuals/1-kings/precept_solomonkingdom.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/solomonkingdom.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-solomonskingdom",
      "title": "Precept Austin — 1 Kings Chapters 4, 11",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapters 4, 11 — solomonskingdom.jpg.",
      "thumb": "/visuals/1-kings/precept_solomonskingdom.jpg",
      "full": "/visuals/1-kings/precept_solomonskingdom.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/solomonskingdom.jpg"
      },
      "chapters": [
        4,
        11
      ]
    },
    {
      "id": "precept-ch-solomonstemple1",
      "title": "Precept Austin — 1 Kings Chapters 6–7",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapters 6–7 — solomonstemple1.jpg.",
      "thumb": "/visuals/1-kings/precept_solomonstemple1.jpg",
      "full": "/visuals/1-kings/precept_solomonstemple1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/solomonstemple1.jpg"
      },
      "chapters": [
        6,
        7
      ]
    },
    {
      "id": "precept-ch-solomonstemplecity2",
      "title": "Precept Austin — 1 Kings Chapter 6",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 6 — solomonstemplecity2.jpg.",
      "thumb": "/visuals/1-kings/precept_solomonstemplecity2.jpg",
      "full": "/visuals/1-kings/precept_solomonstemplecity2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/solomonstemplecity2.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-solomontempleplan",
      "title": "Precept Austin — 1 Kings Chapters 6, 8",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapters 6, 8 — solomontempleplan.jpg.",
      "thumb": "/visuals/1-kings/precept_solomontempleplan.jpg",
      "full": "/visuals/1-kings/precept_solomontempleplan.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/solomontempleplan.jpg"
      },
      "chapters": [
        6,
        8
      ]
    },
    {
      "id": "precept-ch-topographyisrael_small",
      "title": "Precept Austin — 1 Kings Chapter 18",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 18 — topographyisrael_small.jpg.",
      "thumb": "/visuals/1-kings/precept_topographyisrael_small.jpg",
      "full": "/visuals/1-kings/precept_topographyisrael_small.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/TopographyIsrael_small.jpg"
      },
      "chapters": [
        18
      ]
    },
    {
      "id": "precept-ch-tyre-joppa",
      "title": "Precept Austin — 1 Kings Chapter 5",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 5 — tyre-joppa.jpg.",
      "thumb": "/visuals/1-kings/precept_tyre-joppa.jpg",
      "full": "/visuals/1-kings/precept_tyre-joppa.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/tyre-joppa.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-tyreprophecy",
      "title": "Precept Austin — 1 Kings Chapter 5",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 5 — tyreprophecy.jpg.",
      "thumb": "/visuals/1-kings/precept_tyreprophecy.jpg",
      "full": "/visuals/1-kings/precept_tyreprophecy.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/tyreprophecy.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-upperroom",
      "title": "Precept Austin — 1 Kings Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 1 — upperroom.jpg.",
      "thumb": "/visuals/1-kings/precept_upperroom.jpg",
      "full": "/visuals/1-kings/precept_upperroom.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/upperroom.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-zadokline",
      "title": "Precept Austin — 1 Kings Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Kings chapter 1 — zadokline.jpg.",
      "thumb": "/visuals/1-kings/precept_zadokline.jpg",
      "full": "/visuals/1-kings/precept_zadokline.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zadokline.jpg"
      },
      "chapters": [
        1
      ]
    }
  ]
},
  '2-kings': {
  "videos": [
    {
      "youtubeId": "bVFW3wbi9pk",
      "title": "1–2 Kings — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/bVFW3wbi9pk?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/2-kings/",
      "chapterStart": 1,
      "chapterEnd": 25
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: 2 Kings",
      "caption": "Hand-illustrated single-page overview of 2 Kings, tracing the book's literary design and major themes.",
      "thumb": "/visuals/2-kings/bibleproject_poster.jpg",
      "full": "/visuals/2-kings/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-2-kings/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — 2 Kings Bible Chart",
      "caption": "Single-page structural chart of 2 Kings, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/2-kings/swindoll_chart.png",
      "full": "/visuals/2-kings/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/2-Kings-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — 2 Kings Chart",
      "caption": "Bruce Hurt's inductive-study chart for 2 Kings, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/2-kings/precept_chart.png",
      "full": "/visuals/2-kings/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichart.png"
      }
    },
    {
      "id": "precept-book-1kichart2",
      "title": "Precept Austin — 2 Kings (1kichart2.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Kings chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-kings/precept_1kichart2.png",
      "full": "/visuals/2-kings/precept_1kichart2.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichart2.png"
      }
    },
    {
      "id": "precept-book-2kingstimeline",
      "title": "Precept Austin — 2 Kings (2kingstimeline.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Kings chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-kings/precept_2kingstimeline.png",
      "full": "/visuals/2-kings/precept_2kingstimeline.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/2kingstimeline.png"
      }
    },
    {
      "id": "precept-book-2chronicles",
      "title": "Precept Austin — 2 Kings (2chronicles.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Kings chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-kings/precept_2chronicles.jpg",
      "full": "/visuals/2-kings/precept_2chronicles.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/2chronicles.jpg"
      }
    },
    {
      "id": "precept-book-2kingsmap",
      "title": "Precept Austin — 2 Kings (2kingsmap.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Kings chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-kings/precept_2kingsmap.jpg",
      "full": "/visuals/2-kings/precept_2kingsmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/2kingsmap.jpg"
      }
    },
    {
      "id": "precept-book-kingsallchart",
      "title": "Precept Austin — 2 Kings (kingsallchart.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Kings chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-kings/precept_kingsallchart.jpg",
      "full": "/visuals/2-kings/precept_kingsallchart.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/kingsallchart.jpg"
      }
    },
    {
      "id": "precept-book-12kingsall",
      "title": "Precept Austin — 2 Kings (12kingsall.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Kings chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-kings/precept_12kingsall.png",
      "full": "/visuals/2-kings/precept_12kingsall.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/12kingsall.png"
      }
    },
    {
      "id": "precept-book-1ki",
      "title": "Precept Austin — 2 Kings (1ki.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Kings chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-kings/precept_1ki.png",
      "full": "/visuals/2-kings/precept_1ki.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1ki.png"
      }
    },
    {
      "id": "precept-book-1kichr",
      "title": "Precept Austin — 2 Kings (1kichr.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Kings chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-kings/precept_1kichr.png",
      "full": "/visuals/2-kings/precept_1kichr.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichr.png"
      }
    },
    {
      "id": "precept-book-1kichrsetting",
      "title": "Precept Austin — 2 Kings (1kichrsetting.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Kings chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-kings/precept_1kichrsetting.png",
      "full": "/visuals/2-kings/precept_1kichrsetting.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichrsetting.png"
      }
    },
    {
      "id": "precept-book-1kjensen",
      "title": "Precept Austin — 2 Kings (1kjensen.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Kings chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-kings/precept_1kjensen.png",
      "full": "/visuals/2-kings/precept_1kjensen.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kjensen.png"
      }
    },
    {
      "id": "precept-book-prophetsofisrael",
      "title": "Precept Austin — 2 Kings (prophetsofisrael.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Kings chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-kings/precept_prophetsofisrael.jpg",
      "full": "/visuals/2-kings/precept_prophetsofisrael.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/prophetsofisrael.jpg"
      }
    },
    {
      "id": "precept-ch-1kichr",
      "title": "Precept Austin — 2 Kings Chapter 8",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 8 — 1kichr.png.",
      "thumb": "/visuals/2-kings/precept_1kichr.png",
      "full": "/visuals/2-kings/precept_1kichr.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichr.png"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-1kichrsetting",
      "title": "Precept Austin — 2 Kings Chapter 8",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 8 — 1kichrsetting.png.",
      "thumb": "/visuals/2-kings/precept_1kichrsetting.png",
      "full": "/visuals/2-kings/precept_1kichrsetting.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichrsetting.png"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-2kingsmap",
      "title": "Precept Austin — 2 Kings Chapters 1, 2, 4, 14, 23",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapters 1, 2, 4, 14, 23 — 2kingsmap.jpg.",
      "thumb": "/visuals/2-kings/precept_2kingsmap.jpg",
      "full": "/visuals/2-kings/precept_2kingsmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/2kingsmap.jpg"
      },
      "chapters": [
        1,
        2,
        4,
        14,
        23
      ]
    },
    {
      "id": "precept-ch-ahaziahtree",
      "title": "Precept Austin — 2 Kings Chapter 8",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 8 — ahaziahtree.png.",
      "thumb": "/visuals/2-kings/precept_ahaziahtree.png",
      "full": "/visuals/2-kings/precept_ahaziahtree.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ahaziahtree.png"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-amaziah",
      "title": "Precept Austin — 2 Kings Chapter 14",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 14 — amaziah.png.",
      "thumb": "/visuals/2-kings/precept_amaziah.png",
      "full": "/visuals/2-kings/precept_amaziah.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/amaziah.png"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-amosmap",
      "title": "Precept Austin — 2 Kings Chapter 16",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 16 — amosmap.jpg.",
      "thumb": "/visuals/2-kings/precept_amosmap.jpg",
      "full": "/visuals/2-kings/precept_amosmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/amosmap.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-aramsyria",
      "title": "Precept Austin — 2 Kings Chapters 5, 6, 8, 13",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapters 5, 6, 8, 13 — aramsyria.png.",
      "thumb": "/visuals/2-kings/precept_aramsyria.png",
      "full": "/visuals/2-kings/precept_aramsyria.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/aramsyria.png"
      },
      "chapters": [
        5,
        6,
        8,
        13
      ]
    },
    {
      "id": "precept-ch-assyriankings",
      "title": "Precept Austin — 2 Kings Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 15 — assyriankings.png.",
      "thumb": "/visuals/2-kings/precept_assyriankings.png",
      "full": "/visuals/2-kings/precept_assyriankings.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/assyriankings.png"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-azariah",
      "title": "Precept Austin — 2 Kings Chapters 15–16",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapters 15–16 — azariah.png.",
      "thumb": "/visuals/2-kings/precept_azariah.png",
      "full": "/visuals/2-kings/precept_azariah.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/azariah.png"
      },
      "chapters": [
        15,
        16
      ]
    },
    {
      "id": "precept-ch-azariah1",
      "title": "Precept Austin — 2 Kings Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 15 — azariah1.png.",
      "thumb": "/visuals/2-kings/precept_azariah1.png",
      "full": "/visuals/2-kings/precept_azariah1.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/azariah1.png"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-babylonmap",
      "title": "Precept Austin — 2 Kings Chapter 25",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 25 — babylonmap.jpg.",
      "thumb": "/visuals/2-kings/precept_babylonmap.jpg",
      "full": "/visuals/2-kings/precept_babylonmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/babylonmap.jpg"
      },
      "chapters": [
        25
      ]
    },
    {
      "id": "precept-ch-cornergate",
      "title": "Precept Austin — 2 Kings Chapter 14",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 14 — cornergate.jpg.",
      "thumb": "/visuals/2-kings/precept_cornergate.jpg",
      "full": "/visuals/2-kings/precept_cornergate.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/cornergate.jpg"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-courts",
      "title": "Precept Austin — 2 Kings Chapter 21",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 21 — courts.jpg.",
      "thumb": "/visuals/2-kings/precept_courts.jpg",
      "full": "/visuals/2-kings/precept_courts.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/courts.jpg"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-dividedkingdom",
      "title": "Precept Austin — 2 Kings Chapter 3",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 3 — dividedkingdom.jpg.",
      "thumb": "/visuals/2-kings/precept_dividedkingdom.jpg",
      "full": "/visuals/2-kings/precept_dividedkingdom.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/dividedkingdom.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-dothan2",
      "title": "Precept Austin — 2 Kings Chapter 6",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 6 — dothan2.png.",
      "thumb": "/visuals/2-kings/precept_dothan2.png",
      "full": "/visuals/2-kings/precept_dothan2.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/dothan2.png"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-elath",
      "title": "Precept Austin — 2 Kings Chapter 14",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 14 — elath.jpg.",
      "thumb": "/visuals/2-kings/precept_elath.jpg",
      "full": "/visuals/2-kings/precept_elath.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/elath.jpg"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-elijahministry",
      "title": "Precept Austin — 2 Kings Chapter 2",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 2 — elijahministry.jpg.",
      "thumb": "/visuals/2-kings/precept_elijahministry.jpg",
      "full": "/visuals/2-kings/precept_elijahministry.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/elijahministry.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-eloth",
      "title": "Precept Austin — 2 Kings Chapter 16",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 16 — eloth.jpg.",
      "thumb": "/visuals/2-kings/precept_eloth.jpg",
      "full": "/visuals/2-kings/precept_eloth.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/eloth.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-heads1",
      "title": "Precept Austin — 2 Kings Chapter 10",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 10 — heads1.png.",
      "thumb": "/visuals/2-kings/precept_heads1.png",
      "full": "/visuals/2-kings/precept_heads1.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/heads1.png"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-hezekiahspool",
      "title": "Precept Austin — 2 Kings Chapter 18",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 18 — hezekiahspool.jpg.",
      "thumb": "/visuals/2-kings/precept_hezekiahspool.jpg",
      "full": "/visuals/2-kings/precept_hezekiahspool.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hezekiahspool.jpg"
      },
      "chapters": [
        18
      ]
    },
    {
      "id": "precept-ch-hezekiahstunnelmark",
      "title": "Precept Austin — 2 Kings Chapter 20",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 20 — hezekiahstunnelmark.png.",
      "thumb": "/visuals/2-kings/precept_hezekiahstunnelmark.png",
      "full": "/visuals/2-kings/precept_hezekiahstunnelmark.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hezekiahstunnelmark.png"
      },
      "chapters": [
        20
      ]
    },
    {
      "id": "precept-ch-hittitemap",
      "title": "Precept Austin — 2 Kings Chapter 7",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 7 — hittitemap.png.",
      "thumb": "/visuals/2-kings/precept_hittitemap.png",
      "full": "/visuals/2-kings/precept_hittitemap.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hittitemap.png"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-hoshea",
      "title": "Precept Austin — 2 Kings Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 15 — hoshea.png.",
      "thumb": "/visuals/2-kings/precept_hoshea.png",
      "full": "/visuals/2-kings/precept_hoshea.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hoshea.png"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-hoshea171",
      "title": "Precept Austin — 2 Kings Chapters 17, 18, 21",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapters 17, 18, 21 — hoshea171.png.",
      "thumb": "/visuals/2-kings/precept_hoshea171.png",
      "full": "/visuals/2-kings/precept_hoshea171.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hoshea171.png"
      },
      "chapters": [
        17,
        18,
        21
      ]
    },
    {
      "id": "precept-ch-hosheapekah",
      "title": "Precept Austin — 2 Kings Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 15 — hosheapekah.jpg.",
      "thumb": "/visuals/2-kings/precept_hosheapekah.jpg",
      "full": "/visuals/2-kings/precept_hosheapekah.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hosheapekah.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-isaiahtime",
      "title": "Precept Austin — 2 Kings Chapter 21",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 21 — isaiahtime.png.",
      "thumb": "/visuals/2-kings/precept_isaiahtime.png",
      "full": "/visuals/2-kings/precept_isaiahtime.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/isaiahtime.png"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-israelaram",
      "title": "Precept Austin — 2 Kings Chapters 10, 12",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapters 10, 12 — israelaram.jpg.",
      "thumb": "/visuals/2-kings/precept_israelaram.jpg",
      "full": "/visuals/2-kings/precept_israelaram.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/israelaram.jpg"
      },
      "chapters": [
        10,
        12
      ]
    },
    {
      "id": "precept-ch-israelgenericmap",
      "title": "Precept Austin — 2 Kings Chapter 18",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 18 — israelgenericmap.png.",
      "thumb": "/visuals/2-kings/precept_israelgenericmap.png",
      "full": "/visuals/2-kings/precept_israelgenericmap.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/israelgenericmap.png"
      },
      "chapters": [
        18
      ]
    },
    {
      "id": "precept-ch-jehoiakimdates4",
      "title": "Precept Austin — 2 Kings Chapters 24–25",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapters 24–25 — jehoiakimdates4.png.",
      "thumb": "/visuals/2-kings/precept_jehoiakimdates4.png",
      "full": "/visuals/2-kings/precept_jehoiakimdates4.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jehoiakimdates4.png"
      },
      "chapters": [
        24,
        25
      ]
    },
    {
      "id": "precept-ch-jehoram",
      "title": "Precept Austin — 2 Kings Chapters 3, 9",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapters 3, 9 — jehoram.png.",
      "thumb": "/visuals/2-kings/precept_jehoram.png",
      "full": "/visuals/2-kings/precept_jehoram.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jehoram.png"
      },
      "chapters": [
        3,
        9
      ]
    },
    {
      "id": "precept-ch-jehuchart",
      "title": "Precept Austin — 2 Kings Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 15 — jehuchart.png.",
      "thumb": "/visuals/2-kings/precept_jehuchart.png",
      "full": "/visuals/2-kings/precept_jehuchart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jehuchart.png"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-joashchart",
      "title": "Precept Austin — 2 Kings Chapters 11–12",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapters 11–12 — joashchart.png.",
      "thumb": "/visuals/2-kings/precept_joashchart.png",
      "full": "/visuals/2-kings/precept_joashchart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/joashchart.png"
      },
      "chapters": [
        11,
        12
      ]
    },
    {
      "id": "precept-ch-joashfamilytree",
      "title": "Precept Austin — 2 Kings Chapters 11–12",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapters 11–12 — joashfamilytree.png.",
      "thumb": "/visuals/2-kings/precept_joashfamilytree.png",
      "full": "/visuals/2-kings/precept_joashfamilytree.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/joashfamilytree.png"
      },
      "chapters": [
        11,
        12
      ]
    },
    {
      "id": "precept-ch-joramtree",
      "title": "Precept Austin — 2 Kings Chapter 8",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 8 — joramtree.png.",
      "thumb": "/visuals/2-kings/precept_joramtree.png",
      "full": "/visuals/2-kings/precept_joramtree.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/joramtree.png"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-kingschart",
      "title": "Precept Austin — 2 Kings Chapters 2–12",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapters 2–12 — kingschart.jpg.",
      "thumb": "/visuals/2-kings/precept_kingschart.jpg",
      "full": "/visuals/2-kings/precept_kingschart.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/kingschart.jpg"
      },
      "chapters": [
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12
      ]
    },
    {
      "id": "precept-ch-kingschartcolor1",
      "title": "Precept Austin — 2 Kings Chapter 13",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 13 — kingschartcolor1.png.",
      "thumb": "/visuals/2-kings/precept_kingschartcolor1.png",
      "full": "/visuals/2-kings/precept_kingschartcolor1.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/kingschartcolor1.png"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-kingschartjehoahaz1",
      "title": "Precept Austin — 2 Kings Chapter 13",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 13 — kingschartjehoahaz1.png.",
      "thumb": "/visuals/2-kings/precept_kingschartjehoahaz1.png",
      "full": "/visuals/2-kings/precept_kingschartjehoahaz1.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/kingschartjehoahaz1.png"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-kingschron",
      "title": "Precept Austin — 2 Kings Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 15 — kingschron.png.",
      "thumb": "/visuals/2-kings/precept_kingschron.png",
      "full": "/visuals/2-kings/precept_kingschron.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/kingschron.png"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-kingscolor",
      "title": "Precept Austin — 2 Kings Chapter 14",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 14 — kingscolor.png.",
      "thumb": "/visuals/2-kings/precept_kingscolor.png",
      "full": "/visuals/2-kings/precept_kingscolor.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/kingscolor.png"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-napthali",
      "title": "Precept Austin — 2 Kings Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 15 — napthali.png.",
      "thumb": "/visuals/2-kings/precept_napthali.png",
      "full": "/visuals/2-kings/precept_napthali.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/napthali.png"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-ramoth-gilead2",
      "title": "Precept Austin — 2 Kings Chapter 9",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 9 — ramoth-gilead2.png.",
      "thumb": "/visuals/2-kings/precept_ramoth-gilead2.png",
      "full": "/visuals/2-kings/precept_ramoth-gilead2.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ramoth-gilead2.png"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-samaraexile",
      "title": "Precept Austin — 2 Kings Chapter 17",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 17 — samaraexile.jpg.",
      "thumb": "/visuals/2-kings/precept_samaraexile.jpg",
      "full": "/visuals/2-kings/precept_samaraexile.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/samaraexile.jpg"
      },
      "chapters": [
        17
      ]
    },
    {
      "id": "precept-ch-samariadeportations",
      "title": "Precept Austin — 2 Kings Chapter 17",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 17 — samariadeportations.png.",
      "thumb": "/visuals/2-kings/precept_samariadeportations.png",
      "full": "/visuals/2-kings/precept_samariadeportations.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/samariadeportations.png"
      },
      "chapters": [
        17
      ]
    },
    {
      "id": "precept-ch-sennacherib",
      "title": "Precept Austin — 2 Kings Chapter 18",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 18 — sennacherib.jpg.",
      "thumb": "/visuals/2-kings/precept_sennacherib.jpg",
      "full": "/visuals/2-kings/precept_sennacherib.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sennacherib.jpg"
      },
      "chapters": [
        18
      ]
    },
    {
      "id": "precept-ch-shunammite",
      "title": "Precept Austin — 2 Kings Chapter 4",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 4 — shunammite.jpg.",
      "thumb": "/visuals/2-kings/precept_shunammite.jpg",
      "full": "/visuals/2-kings/precept_shunammite.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shunammite.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-shunem",
      "title": "Precept Austin — 2 Kings Chapter 8",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 8 — shunem.png.",
      "thumb": "/visuals/2-kings/precept_shunem.png",
      "full": "/visuals/2-kings/precept_shunem.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shunem.png"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-sincycle",
      "title": "Precept Austin — 2 Kings Chapter 13",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 13 — sincycle.jpg.",
      "thumb": "/visuals/2-kings/precept_sincycle.jpg",
      "full": "/visuals/2-kings/precept_sincycle.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sincycle.jpg"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-tiglath",
      "title": "Precept Austin — 2 Kings Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 15 — tiglath.jpg.",
      "thumb": "/visuals/2-kings/precept_tiglath.jpg",
      "full": "/visuals/2-kings/precept_tiglath.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/tiglath.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-timelineisreal2",
      "title": "Precept Austin — 2 Kings Chapter 25",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 25 — timelineisreal2.png.",
      "thumb": "/visuals/2-kings/precept_timelineisreal2.png",
      "full": "/visuals/2-kings/precept_timelineisreal2.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/timelineisreal2.png"
      },
      "chapters": [
        25
      ]
    },
    {
      "id": "precept-ch-tirzah",
      "title": "Precept Austin — 2 Kings Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 15 — tirzah.jpg.",
      "thumb": "/visuals/2-kings/precept_tirzah.jpg",
      "full": "/visuals/2-kings/precept_tirzah.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/tirzah.jpg"
      },
      "chapters": [
        15
      ]
    }
  ]
},
  '1-chronicles': {
  "videos": [
    {
      "youtubeId": "HR7xaHv3Ias",
      "title": "1–2 Chronicles — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/HR7xaHv3Ias?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/1-chronicles/",
      "chapterStart": 1,
      "chapterEnd": 29
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: 1 Chronicles",
      "caption": "Hand-illustrated single-page overview of 1 Chronicles, tracing the book's literary design and major themes.",
      "thumb": "/visuals/1-chronicles/bibleproject_poster.jpg",
      "full": "/visuals/1-chronicles/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-1-chronicles/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — 1 Chronicles Bible Chart",
      "caption": "Single-page structural chart of 1 Chronicles, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/1-chronicles/swindoll_chart.png",
      "full": "/visuals/1-chronicles/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/1-Chronicles-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-book-1chrtimeline",
      "title": "Precept Austin — 1 Chronicles (1chrtimeline.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Chronicles chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-chronicles/precept_1chrtimeline.png",
      "full": "/visuals/1-chronicles/precept_1chrtimeline.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1chrtimeline.png"
      }
    },
    {
      "id": "precept-book-1kichart2",
      "title": "Precept Austin — 1 Chronicles (1kichart2.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Chronicles chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-chronicles/precept_1kichart2.png",
      "full": "/visuals/1-chronicles/precept_1kichart2.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichart2.png"
      }
    },
    {
      "id": "precept-book-1samap",
      "title": "Precept Austin — 1 Chronicles (1samap.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Chronicles chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-chronicles/precept_1samap.png",
      "full": "/visuals/1-chronicles/precept_1samap.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1samap.png"
      }
    },
    {
      "id": "precept-book-12kingsall",
      "title": "Precept Austin — 1 Chronicles (12kingsall.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Chronicles chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-chronicles/precept_12kingsall.png",
      "full": "/visuals/1-chronicles/precept_12kingsall.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/12kingsall.png"
      }
    },
    {
      "id": "precept-book-1ki",
      "title": "Precept Austin — 1 Chronicles (1ki.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Chronicles chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-chronicles/precept_1ki.png",
      "full": "/visuals/1-chronicles/precept_1ki.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1ki.png"
      }
    },
    {
      "id": "precept-book-1kichr",
      "title": "Precept Austin — 1 Chronicles (1kichr.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Chronicles chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-chronicles/precept_1kichr.png",
      "full": "/visuals/1-chronicles/precept_1kichr.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichr.png"
      }
    },
    {
      "id": "precept-book-1kichrsetting",
      "title": "Precept Austin — 1 Chronicles (1kichrsetting.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Chronicles chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-chronicles/precept_1kichrsetting.png",
      "full": "/visuals/1-chronicles/precept_1kichrsetting.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichrsetting.png"
      }
    },
    {
      "id": "precept-book-2saplot",
      "title": "Precept Austin — 1 Chronicles (2saplot.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Chronicles chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-chronicles/precept_2saplot.png",
      "full": "/visuals/1-chronicles/precept_2saplot.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/2saplot.png"
      }
    },
    {
      "id": "precept-book-2samuelesv",
      "title": "Precept Austin — 1 Chronicles (2samuelesv.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Chronicles chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-chronicles/precept_2samuelesv.jpg",
      "full": "/visuals/1-chronicles/precept_2samuelesv.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/2samuelesv.jpg"
      }
    },
    {
      "id": "precept-book-prophetsofisrael",
      "title": "Precept Austin — 1 Chronicles (prophetsofisrael.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Chronicles chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-chronicles/precept_prophetsofisrael.jpg",
      "full": "/visuals/1-chronicles/precept_prophetsofisrael.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/prophetsofisrael.jpg"
      }
    },
    {
      "id": "precept-book-1kichart",
      "title": "Precept Austin — 1 Chronicles (1kichart.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Chronicles chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-chronicles/precept_1kichart.png",
      "full": "/visuals/1-chronicles/precept_1kichart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichart.png"
      }
    },
    {
      "id": "precept-ch-1chr45",
      "title": "Precept Austin — 1 Chronicles Chapter 4",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 4 — 1chr45.png.",
      "thumb": "/visuals/1-chronicles/precept_1chr45.png",
      "full": "/visuals/1-chronicles/precept_1chr45.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1chr45.png"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-1chronicles",
      "title": "Precept Austin — 1 Chronicles Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 1 — 1chronicles.png.",
      "thumb": "/visuals/1-chronicles/precept_1chronicles.png",
      "full": "/visuals/1-chronicles/precept_1chronicles.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1chronicles.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-1samuelmapesv",
      "title": "Precept Austin — 1 Chronicles Chapter 10",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 10 — 1samuelmapesv.jpg.",
      "thumb": "/visuals/1-chronicles/precept_1samuelmapesv.jpg",
      "full": "/visuals/1-chronicles/precept_1samuelmapesv.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1samuelmapesv.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-abegenisaac",
      "title": "Precept Austin — 1 Chronicles Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 1 — abegenisaac.png.",
      "thumb": "/visuals/1-chronicles/precept_abegenisaac.png",
      "full": "/visuals/1-chronicles/precept_abegenisaac.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/abegenisaac.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-abegenjacob",
      "title": "Precept Austin — 1 Chronicles Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 1 — abegenjacob.png.",
      "thumb": "/visuals/1-chronicles/precept_abegenjacob.png",
      "full": "/visuals/1-chronicles/precept_abegenjacob.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/abegenjacob.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-abraham",
      "title": "Precept Austin — 1 Chronicles Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 1 — abraham.png.",
      "thumb": "/visuals/1-chronicles/precept_abraham.png",
      "full": "/visuals/1-chronicles/precept_abraham.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/abraham.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-adamtree",
      "title": "Precept Austin — 1 Chronicles Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 1 — adamtree.gif.",
      "thumb": "/visuals/1-chronicles/precept_adamtree.gif",
      "full": "/visuals/1-chronicles/precept_adamtree.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/adamtree.gif"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-ark2esv",
      "title": "Precept Austin — 1 Chronicles Chapters 13, 15, 16",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapters 13, 15, 16 — ark2esv.jpg.",
      "thumb": "/visuals/1-chronicles/precept_ark2esv.jpg",
      "full": "/visuals/1-chronicles/precept_ark2esv.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ark2esv.jpg"
      },
      "chapters": [
        13,
        15,
        16
      ]
    },
    {
      "id": "precept-ch-arpachshad",
      "title": "Precept Austin — 1 Chronicles Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 1 — arpachshad.png.",
      "thumb": "/visuals/1-chronicles/precept_arpachshad.png",
      "full": "/visuals/1-chronicles/precept_arpachshad.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/arpachshad.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-boaz",
      "title": "Precept Austin — 1 Chronicles Chapter 2",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 2 — boaz.png.",
      "thumb": "/visuals/1-chronicles/precept_boaz.png",
      "full": "/visuals/1-chronicles/precept_boaz.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/boaz.png"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-canaan",
      "title": "Precept Austin — 1 Chronicles Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 1 — canaan.png.",
      "thumb": "/visuals/1-chronicles/precept_canaan.png",
      "full": "/visuals/1-chronicles/precept_canaan.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/canaan.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-cush",
      "title": "Precept Austin — 1 Chronicles Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 1 — cush.png.",
      "thumb": "/visuals/1-chronicles/precept_cush.png",
      "full": "/visuals/1-chronicles/precept_cush.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/cush.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-davidcity",
      "title": "Precept Austin — 1 Chronicles Chapter 11",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 11 — davidcity.jpg.",
      "thumb": "/visuals/1-chronicles/precept_davidcity.jpg",
      "full": "/visuals/1-chronicles/precept_davidcity.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/davidcity.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-daviddualline",
      "title": "Precept Austin — 1 Chronicles Chapter 3",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 3 — daviddualline.png.",
      "thumb": "/visuals/1-chronicles/precept_daviddualline.png",
      "full": "/visuals/1-chronicles/precept_daviddualline.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/daviddualline.png"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-davidlineage3",
      "title": "Precept Austin — 1 Chronicles Chapters 2–3",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapters 2–3 — davidlineage3.png.",
      "thumb": "/visuals/1-chronicles/precept_davidlineage3.png",
      "full": "/visuals/1-chronicles/precept_davidlineage3.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/davidlineage3.png"
      },
      "chapters": [
        2,
        3
      ]
    },
    {
      "id": "precept-ch-davidsfamily",
      "title": "Precept Austin — 1 Chronicles Chapter 14",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 14 — davidsfamily.jpg.",
      "thumb": "/visuals/1-chronicles/precept_davidsfamily.jpg",
      "full": "/visuals/1-chronicles/precept_davidsfamily.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/davidsfamily.jpg"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-davidtree",
      "title": "Precept Austin — 1 Chronicles Chapter 14",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 14 — davidtree.png.",
      "thumb": "/visuals/1-chronicles/precept_davidtree.png",
      "full": "/visuals/1-chronicles/precept_davidtree.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/davidtree.png"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-egypt",
      "title": "Precept Austin — 1 Chronicles Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 1 — egypt.png.",
      "thumb": "/visuals/1-chronicles/precept_egypt.png",
      "full": "/visuals/1-chronicles/precept_egypt.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/egypt.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-ex614",
      "title": "Precept Austin — 1 Chronicles Chapters 23–24",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapters 23–24 — ex614.jpg.",
      "thumb": "/visuals/1-chronicles/precept_ex614.jpg",
      "full": "/visuals/1-chronicles/precept_ex614.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ex614.jpg"
      },
      "chapters": [
        23,
        24
      ]
    },
    {
      "id": "precept-ch-ham",
      "title": "Precept Austin — 1 Chronicles Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 1 — ham.png.",
      "thumb": "/visuals/1-chronicles/precept_ham.png",
      "full": "/visuals/1-chronicles/precept_ham.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ham.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-ishmael",
      "title": "Precept Austin — 1 Chronicles Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 1 — ishmael.png.",
      "thumb": "/visuals/1-chronicles/precept_ishmael.png",
      "full": "/visuals/1-chronicles/precept_ishmael.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ishmael.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-japheth",
      "title": "Precept Austin — 1 Chronicles Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 1 — japheth.png.",
      "thumb": "/visuals/1-chronicles/precept_japheth.png",
      "full": "/visuals/1-chronicles/precept_japheth.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/japheth.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-joktan",
      "title": "Precept Austin — 1 Chronicles Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 1 — joktan.png.",
      "thumb": "/visuals/1-chronicles/precept_joktan.png",
      "full": "/visuals/1-chronicles/precept_joktan.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/joktan.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-keturah",
      "title": "Precept Austin — 1 Chronicles Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 1 — keturah.png.",
      "thumb": "/visuals/1-chronicles/precept_keturah.png",
      "full": "/visuals/1-chronicles/precept_keturah.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/keturah.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-luke_genealogy",
      "title": "Precept Austin — 1 Chronicles Chapter 3",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 3 — luke_genealogy.png.",
      "thumb": "/visuals/1-chronicles/precept_luke_genealogy.png",
      "full": "/visuals/1-chronicles/precept_luke_genealogy.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Luke_genealogy.png"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-map_of_tribes_of_israel",
      "title": "Precept Austin — 1 Chronicles Chapter 12",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 12 — map of tribes of israel.gif.",
      "thumb": "/visuals/1-chronicles/precept_map_of_tribes_of_israel.gif",
      "full": "/visuals/1-chronicles/precept_map_of_tribes_of_israel.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/map%20of%20tribes%20of%20israel.gif"
      },
      "chapters": [
        12
      ]
    },
    {
      "id": "precept-ch-moriah",
      "title": "Precept Austin — 1 Chronicles Chapter 21",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 21 — moriah.png.",
      "thumb": "/visuals/1-chronicles/precept_moriah.png",
      "full": "/visuals/1-chronicles/precept_moriah.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/moriah.png"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-napthali",
      "title": "Precept Austin — 1 Chronicles Chapters 4, 10",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapters 4, 10 — napthali.png.",
      "thumb": "/visuals/1-chronicles/precept_napthali.png",
      "full": "/visuals/1-chronicles/precept_napthali.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/napthali.png"
      },
      "chapters": [
        4,
        10
      ]
    },
    {
      "id": "precept-ch-priesthood",
      "title": "Precept Austin — 1 Chronicles Chapter 24",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 24 — priesthood.jpg.",
      "thumb": "/visuals/1-chronicles/precept_priesthood.jpg",
      "full": "/visuals/1-chronicles/precept_priesthood.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/priesthood.jpg"
      },
      "chapters": [
        24
      ]
    },
    {
      "id": "precept-ch-rephaim",
      "title": "Precept Austin — 1 Chronicles Chapter 14",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 14 — rephaim.jpg.",
      "thumb": "/visuals/1-chronicles/precept_rephaim.jpg",
      "full": "/visuals/1-chronicles/precept_rephaim.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/rephaim.jpg"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-shemline",
      "title": "Precept Austin — 1 Chronicles Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 1 — shemline.png.",
      "thumb": "/visuals/1-chronicles/precept_shemline.png",
      "full": "/visuals/1-chronicles/precept_shemline.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shemline.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-templesolomon",
      "title": "Precept Austin — 1 Chronicles Chapter 28",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 28 — templesolomon.jpg.",
      "thumb": "/visuals/1-chronicles/precept_templesolomon.jpg",
      "full": "/visuals/1-chronicles/precept_templesolomon.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/templesolomon.jpg"
      },
      "chapters": [
        28
      ]
    },
    {
      "id": "precept-ch-templesolomon2",
      "title": "Precept Austin — 1 Chronicles Chapter 28",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 28 — templesolomon2.jpg.",
      "thumb": "/visuals/1-chronicles/precept_templesolomon2.jpg",
      "full": "/visuals/1-chronicles/precept_templesolomon2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/templesolomon2.jpg"
      },
      "chapters": [
        28
      ]
    },
    {
      "id": "precept-ch-zadok",
      "title": "Precept Austin — 1 Chronicles Chapter 18",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 18 — zadok.png.",
      "thumb": "/visuals/1-chronicles/precept_zadok.png",
      "full": "/visuals/1-chronicles/precept_zadok.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zadok.png"
      },
      "chapters": [
        18
      ]
    },
    {
      "id": "precept-ch-zeph-1",
      "title": "Precept Austin — 1 Chronicles Chapter 22",
      "caption": "Bruce Hurt's commentary chart for 1 Chronicles chapter 22 — zeph-1.gif.",
      "thumb": "/visuals/1-chronicles/precept_zeph-1.gif",
      "full": "/visuals/1-chronicles/precept_zeph-1.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zeph-1.gif"
      },
      "chapters": [
        22
      ]
    }
  ]
},
  '2-chronicles': {
  "videos": [
    {
      "youtubeId": "HR7xaHv3Ias",
      "title": "1–2 Chronicles — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/HR7xaHv3Ias?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/2-chronicles/",
      "chapterStart": 1,
      "chapterEnd": 36
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: 2 Chronicles",
      "caption": "Hand-illustrated single-page overview of 2 Chronicles, tracing the book's literary design and major themes.",
      "thumb": "/visuals/2-chronicles/bibleproject_poster.jpg",
      "full": "/visuals/2-chronicles/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-2-chronicles/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — 2 Chronicles Bible Chart",
      "caption": "Single-page structural chart of 2 Chronicles, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/2-chronicles/swindoll_chart.png",
      "full": "/visuals/2-chronicles/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/2-Chronicles-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-book-1kichart2",
      "title": "Precept Austin — 2 Chronicles (1kichart2.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Chronicles chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-chronicles/precept_1kichart2.png",
      "full": "/visuals/2-chronicles/precept_1kichart2.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichart2.png"
      }
    },
    {
      "id": "precept-book-2chronicles",
      "title": "Precept Austin — 2 Chronicles (2chronicles.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Chronicles chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-chronicles/precept_2chronicles.jpg",
      "full": "/visuals/2-chronicles/precept_2chronicles.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/2chronicles.jpg"
      }
    },
    {
      "id": "precept-book-12kingsall",
      "title": "Precept Austin — 2 Chronicles (12kingsall.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Chronicles chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-chronicles/precept_12kingsall.png",
      "full": "/visuals/2-chronicles/precept_12kingsall.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/12kingsall.png"
      }
    },
    {
      "id": "precept-book-1ki",
      "title": "Precept Austin — 2 Chronicles (1ki.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Chronicles chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-chronicles/precept_1ki.png",
      "full": "/visuals/2-chronicles/precept_1ki.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1ki.png"
      }
    },
    {
      "id": "precept-book-1kichr",
      "title": "Precept Austin — 2 Chronicles (1kichr.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Chronicles chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-chronicles/precept_1kichr.png",
      "full": "/visuals/2-chronicles/precept_1kichr.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichr.png"
      }
    },
    {
      "id": "precept-book-1kichrsetting",
      "title": "Precept Austin — 2 Chronicles (1kichrsetting.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Chronicles chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-chronicles/precept_1kichrsetting.png",
      "full": "/visuals/2-chronicles/precept_1kichrsetting.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichrsetting.png"
      }
    },
    {
      "id": "precept-book-2chrtime",
      "title": "Precept Austin — 2 Chronicles (2chrtime.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Chronicles chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-chronicles/precept_2chrtime.jpg",
      "full": "/visuals/2-chronicles/precept_2chrtime.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/2chrtime.jpg"
      }
    },
    {
      "id": "precept-book-prophetsofisrael",
      "title": "Precept Austin — 2 Chronicles (prophetsofisrael.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Chronicles chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-chronicles/precept_prophetsofisrael.jpg",
      "full": "/visuals/2-chronicles/precept_prophetsofisrael.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/prophetsofisrael.jpg"
      }
    },
    {
      "id": "precept-book-1kichart",
      "title": "Precept Austin — 2 Chronicles (1kichart.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Chronicles chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-chronicles/precept_1kichart.png",
      "full": "/visuals/2-chronicles/precept_1kichart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichart.png"
      }
    },
    {
      "id": "precept-ch-1ki",
      "title": "Precept Austin — 2 Chronicles Chapters 21, 26",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapters 21, 26 — 1ki.png.",
      "thumb": "/visuals/2-chronicles/precept_1ki.png",
      "full": "/visuals/2-chronicles/precept_1ki.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1ki.png"
      },
      "chapters": [
        21,
        26
      ]
    },
    {
      "id": "precept-ch-1kichart2",
      "title": "Precept Austin — 2 Chronicles Chapter 26",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 26 — 1kichart2.png.",
      "thumb": "/visuals/2-chronicles/precept_1kichart2.png",
      "full": "/visuals/2-chronicles/precept_1kichart2.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichart2.png"
      },
      "chapters": [
        26
      ]
    },
    {
      "id": "precept-ch-1samap",
      "title": "Precept Austin — 2 Chronicles Chapter 26",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 26 — 1samap.png.",
      "thumb": "/visuals/2-chronicles/precept_1samap.png",
      "full": "/visuals/2-chronicles/precept_1samap.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1samap.png"
      },
      "chapters": [
        26
      ]
    },
    {
      "id": "precept-ch-1samuelmapesv",
      "title": "Precept Austin — 2 Chronicles Chapter 16",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 16 — 1samuelmapesv.jpg.",
      "thumb": "/visuals/2-chronicles/precept_1samuelmapesv.jpg",
      "full": "/visuals/2-chronicles/precept_1samuelmapesv.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1samuelmapesv.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-2chrtime",
      "title": "Precept Austin — 2 Chronicles Chapter 25",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 25 — 2chrtime.jpg.",
      "thumb": "/visuals/2-chronicles/precept_2chrtime.jpg",
      "full": "/visuals/2-chronicles/precept_2chrtime.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/2chrtime.jpg"
      },
      "chapters": [
        25
      ]
    },
    {
      "id": "precept-ch-ahaziahtree",
      "title": "Precept Austin — 2 Chronicles Chapter 21",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 21 — ahaziahtree.png.",
      "thumb": "/visuals/2-chronicles/precept_ahaziahtree.png",
      "full": "/visuals/2-chronicles/precept_ahaziahtree.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ahaziahtree.png"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-amaziah",
      "title": "Precept Austin — 2 Chronicles Chapter 25",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 25 — amaziah.png.",
      "thumb": "/visuals/2-chronicles/precept_amaziah.png",
      "full": "/visuals/2-chronicles/precept_amaziah.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/amaziah.png"
      },
      "chapters": [
        25
      ]
    },
    {
      "id": "precept-ch-aramsyria",
      "title": "Precept Austin — 2 Chronicles Chapter 21",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 21 — aramsyria.png.",
      "thumb": "/visuals/2-chronicles/precept_aramsyria.png",
      "full": "/visuals/2-chronicles/precept_aramsyria.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/aramsyria.png"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-azariah",
      "title": "Precept Austin — 2 Chronicles Chapters 26–27",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapters 26–27 — azariah.png.",
      "thumb": "/visuals/2-chronicles/precept_azariah.png",
      "full": "/visuals/2-chronicles/precept_azariah.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/azariah.png"
      },
      "chapters": [
        26,
        27
      ]
    },
    {
      "id": "precept-ch-citydavid1",
      "title": "Precept Austin — 2 Chronicles Chapter 30",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 30 — citydavid1.jpg.",
      "thumb": "/visuals/2-chronicles/precept_citydavid1.jpg",
      "full": "/visuals/2-chronicles/precept_citydavid1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/citydavid1.jpg"
      },
      "chapters": [
        30
      ]
    },
    {
      "id": "precept-ch-cornergate",
      "title": "Precept Austin — 2 Chronicles Chapters 25–26",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapters 25–26 — cornergate.jpg.",
      "thumb": "/visuals/2-chronicles/precept_cornergate.jpg",
      "full": "/visuals/2-chronicles/precept_cornergate.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/cornergate.jpg"
      },
      "chapters": [
        25,
        26
      ]
    },
    {
      "id": "precept-ch-courts",
      "title": "Precept Austin — 2 Chronicles Chapter 33",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 33 — courts.jpg.",
      "thumb": "/visuals/2-chronicles/precept_courts.jpg",
      "full": "/visuals/2-chronicles/precept_courts.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/courts.jpg"
      },
      "chapters": [
        33
      ]
    },
    {
      "id": "precept-ch-crown2",
      "title": "Precept Austin — 2 Chronicles Chapter 23",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 23 — crown2.jpg.",
      "thumb": "/visuals/2-chronicles/precept_crown2.jpg",
      "full": "/visuals/2-chronicles/precept_crown2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/crown2.jpg"
      },
      "chapters": [
        23
      ]
    },
    {
      "id": "precept-ch-cyrus",
      "title": "Precept Austin — 2 Chronicles Chapter 36",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 36 — cyrus.png.",
      "thumb": "/visuals/2-chronicles/precept_cyrus.png",
      "full": "/visuals/2-chronicles/precept_cyrus.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/cyrus.png"
      },
      "chapters": [
        36
      ]
    },
    {
      "id": "precept-ch-davidcity",
      "title": "Precept Austin — 2 Chronicles Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 15 — davidcity.jpg.",
      "thumb": "/visuals/2-chronicles/precept_davidcity.jpg",
      "full": "/visuals/2-chronicles/precept_davidcity.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/davidcity.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-egyptmap",
      "title": "Precept Austin — 2 Chronicles Chapter 20",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 20 — egyptmap.png.",
      "thumb": "/visuals/2-chronicles/precept_egyptmap.png",
      "full": "/visuals/2-chronicles/precept_egyptmap.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/egyptmap.png"
      },
      "chapters": [
        20
      ]
    },
    {
      "id": "precept-ch-eloth",
      "title": "Precept Austin — 2 Chronicles Chapter 26",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 26 — eloth.jpg.",
      "thumb": "/visuals/2-chronicles/precept_eloth.jpg",
      "full": "/visuals/2-chronicles/precept_eloth.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/eloth.jpg"
      },
      "chapters": [
        26
      ]
    },
    {
      "id": "precept-ch-engedi",
      "title": "Precept Austin — 2 Chronicles Chapter 20",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 20 — engedi.jpg.",
      "thumb": "/visuals/2-chronicles/precept_engedi.jpg",
      "full": "/visuals/2-chronicles/precept_engedi.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/engedi.jpg"
      },
      "chapters": [
        20
      ]
    },
    {
      "id": "precept-ch-ephraimz",
      "title": "Precept Austin — 2 Chronicles Chapter 10",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 10 — ephraimz.jpg.",
      "thumb": "/visuals/2-chronicles/precept_ephraimz.jpg",
      "full": "/visuals/2-chronicles/precept_ephraimz.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ephraimz.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-ezekie7",
      "title": "Precept Austin — 2 Chronicles Chapter 3",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 3 — ezekie7.gif.",
      "thumb": "/visuals/2-chronicles/precept_ezekie7.gif",
      "full": "/visuals/2-chronicles/precept_ezekie7.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ezekie7.gif"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-ezion",
      "title": "Precept Austin — 2 Chronicles Chapter 8",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 8 — ezion.jpg.",
      "thumb": "/visuals/2-chronicles/precept_ezion.jpg",
      "full": "/visuals/2-chronicles/precept_ezion.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ezion.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-gad",
      "title": "Precept Austin — 2 Chronicles Chapter 34",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 34 — gad.png.",
      "thumb": "/visuals/2-chronicles/precept_gad.png",
      "full": "/visuals/2-chronicles/precept_gad.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gad.png"
      },
      "chapters": [
        34
      ]
    },
    {
      "id": "precept-ch-hezekiahstunnel1",
      "title": "Precept Austin — 2 Chronicles Chapter 32",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 32 — hezekiahstunnel1.png.",
      "thumb": "/visuals/2-chronicles/precept_hezekiahstunnel1.png",
      "full": "/visuals/2-chronicles/precept_hezekiahstunnel1.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hezekiahstunnel1.png"
      },
      "chapters": [
        32
      ]
    },
    {
      "id": "precept-ch-hezekiahstunnelmark",
      "title": "Precept Austin — 2 Chronicles Chapter 32",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 32 — hezekiahstunnelmark.png.",
      "thumb": "/visuals/2-chronicles/precept_hezekiahstunnelmark.png",
      "full": "/visuals/2-chronicles/precept_hezekiahstunnelmark.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hezekiahstunnelmark.png"
      },
      "chapters": [
        32
      ]
    },
    {
      "id": "precept-ch-hoshea171",
      "title": "Precept Austin — 2 Chronicles Chapter 33",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 33 — hoshea171.png.",
      "thumb": "/visuals/2-chronicles/precept_hoshea171.png",
      "full": "/visuals/2-chronicles/precept_hoshea171.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hoshea171.png"
      },
      "chapters": [
        33
      ]
    },
    {
      "id": "precept-ch-jehengedi",
      "title": "Precept Austin — 2 Chronicles Chapter 20",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 20 — jehengedi.jpg.",
      "thumb": "/visuals/2-chronicles/precept_jehengedi.jpg",
      "full": "/visuals/2-chronicles/precept_jehengedi.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jehengedi.jpg"
      },
      "chapters": [
        20
      ]
    },
    {
      "id": "precept-ch-jehoiakimdates4",
      "title": "Precept Austin — 2 Chronicles Chapter 36",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 36 — jehoiakimdates4.png.",
      "thumb": "/visuals/2-chronicles/precept_jehoiakimdates4.png",
      "full": "/visuals/2-chronicles/precept_jehoiakimdates4.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jehoiakimdates4.png"
      },
      "chapters": [
        36
      ]
    },
    {
      "id": "precept-ch-jerusalemhezekiah",
      "title": "Precept Austin — 2 Chronicles Chapters 29–32",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapters 29–32 — jerusalemhezekiah.jpg.",
      "thumb": "/visuals/2-chronicles/precept_jerusalemhezekiah.jpg",
      "full": "/visuals/2-chronicles/precept_jerusalemhezekiah.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jerusalemhezekiah.jpg"
      },
      "chapters": [
        29,
        30,
        31,
        32
      ]
    },
    {
      "id": "precept-ch-jerusalemnehemiah1",
      "title": "Precept Austin — 2 Chronicles Chapter 31",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 31 — jerusalemnehemiah1.png.",
      "thumb": "/visuals/2-chronicles/precept_jerusalemnehemiah1.png",
      "full": "/visuals/2-chronicles/precept_jerusalemnehemiah1.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jerusalemnehemiah1.png"
      },
      "chapters": [
        31
      ]
    },
    {
      "id": "precept-ch-joashchart",
      "title": "Precept Austin — 2 Chronicles Chapter 24",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 24 — joashchart.png.",
      "thumb": "/visuals/2-chronicles/precept_joashchart.png",
      "full": "/visuals/2-chronicles/precept_joashchart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/joashchart.png"
      },
      "chapters": [
        24
      ]
    },
    {
      "id": "precept-ch-joashfamilytree",
      "title": "Precept Austin — 2 Chronicles Chapters 22, 24",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapters 22, 24 — joashfamilytree.png.",
      "thumb": "/visuals/2-chronicles/precept_joashfamilytree.png",
      "full": "/visuals/2-chronicles/precept_joashfamilytree.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/joashfamilytree.png"
      },
      "chapters": [
        22,
        24
      ]
    },
    {
      "id": "precept-ch-jothamammonites",
      "title": "Precept Austin — 2 Chronicles Chapter 27",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 27 — jothamammonites.png.",
      "thumb": "/visuals/2-chronicles/precept_jothamammonites.png",
      "full": "/visuals/2-chronicles/precept_jothamammonites.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jothamammonites.png"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-jothamophel",
      "title": "Precept Austin — 2 Chronicles Chapters 27, 33",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapters 27, 33 — jothamophel.jpg.",
      "thumb": "/visuals/2-chronicles/precept_jothamophel.jpg",
      "full": "/visuals/2-chronicles/precept_jothamophel.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jothamophel.jpg"
      },
      "chapters": [
        27,
        33
      ]
    },
    {
      "id": "precept-ch-jothamopheldiagram",
      "title": "Precept Austin — 2 Chronicles Chapters 27, 33",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapters 27, 33 — jothamopheldiagram.png.",
      "thumb": "/visuals/2-chronicles/precept_jothamopheldiagram.png",
      "full": "/visuals/2-chronicles/precept_jothamopheldiagram.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jothamopheldiagram.png"
      },
      "chapters": [
        27,
        33
      ]
    },
    {
      "id": "precept-ch-kingsallchart",
      "title": "Precept Austin — 2 Chronicles Chapters 25, 28, 33",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapters 25, 28, 33 — kingsallchart.jpg.",
      "thumb": "/visuals/2-chronicles/precept_kingsallchart.jpg",
      "full": "/visuals/2-chronicles/precept_kingsallchart.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/kingsallchart.jpg"
      },
      "chapters": [
        25,
        28,
        33
      ]
    },
    {
      "id": "precept-ch-levisons1",
      "title": "Precept Austin — 2 Chronicles Chapter 29",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 29 — levisons1.png.",
      "thumb": "/visuals/2-chronicles/precept_levisons1.png",
      "full": "/visuals/2-chronicles/precept_levisons1.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/levisons1.png"
      },
      "chapters": [
        29
      ]
    },
    {
      "id": "precept-ch-leviticalcities",
      "title": "Precept Austin — 2 Chronicles Chapter 31",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 31 — leviticalcities.jpg.",
      "thumb": "/visuals/2-chronicles/precept_leviticalcities.jpg",
      "full": "/visuals/2-chronicles/precept_leviticalcities.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/leviticalcities.jpg"
      },
      "chapters": [
        31
      ]
    },
    {
      "id": "precept-ch-libnah",
      "title": "Precept Austin — 2 Chronicles Chapter 21",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 21 — libnah.jpg.",
      "thumb": "/visuals/2-chronicles/precept_libnah.jpg",
      "full": "/visuals/2-chronicles/precept_libnah.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/libnah.jpg"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-mareshah2",
      "title": "Precept Austin — 2 Chronicles Chapter 14",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 14 — mareshah2.jpg.",
      "thumb": "/visuals/2-chronicles/precept_mareshah2.jpg",
      "full": "/visuals/2-chronicles/precept_mareshah2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mareshah2.jpg"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-mareshah3",
      "title": "Precept Austin — 2 Chronicles Chapter 14",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 14 — mareshah3.jpg.",
      "thumb": "/visuals/2-chronicles/precept_mareshah3.jpg",
      "full": "/visuals/2-chronicles/precept_mareshah3.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mareshah3.jpg"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-messiahslinethroughjoseph",
      "title": "Precept Austin — 2 Chronicles Chapter 36",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 36 — messiahslinethroughjoseph.png.",
      "thumb": "/visuals/2-chronicles/precept_messiahslinethroughjoseph.png",
      "full": "/visuals/2-chronicles/precept_messiahslinethroughjoseph.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/messiahslinethroughjoseph.png"
      },
      "chapters": [
        36
      ]
    },
    {
      "id": "precept-ch-napthali",
      "title": "Precept Austin — 2 Chronicles Chapters 16, 17, 25, 26, 30",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapters 16, 17, 25, 26, 30 — napthali.png.",
      "thumb": "/visuals/2-chronicles/precept_napthali.png",
      "full": "/visuals/2-chronicles/precept_napthali.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/napthali.png"
      },
      "chapters": [
        16,
        17,
        25,
        26,
        30
      ]
    },
    {
      "id": "precept-ch-ramah1",
      "title": "Precept Austin — 2 Chronicles Chapter 16",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 16 — ramah1.jpg.",
      "thumb": "/visuals/2-chronicles/precept_ramah1.jpg",
      "full": "/visuals/2-chronicles/precept_ramah1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ramah1.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-ramoth-gilead",
      "title": "Precept Austin — 2 Chronicles Chapter 22",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 22 — ramoth-gilead.jpg.",
      "thumb": "/visuals/2-chronicles/precept_ramoth-gilead.jpg",
      "full": "/visuals/2-chronicles/precept_ramoth-gilead.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ramoth-gilead.jpg"
      },
      "chapters": [
        22
      ]
    },
    {
      "id": "precept-ch-samsonmap1",
      "title": "Precept Austin — 2 Chronicles Chapter 25",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 25 — samsonmap1.jpg.",
      "thumb": "/visuals/2-chronicles/precept_samsonmap1.jpg",
      "full": "/visuals/2-chronicles/precept_samsonmap1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/samsonmap1.jpg"
      },
      "chapters": [
        25
      ]
    },
    {
      "id": "precept-ch-sennaprism",
      "title": "Precept Austin — 2 Chronicles Chapter 32",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 32 — sennaprism.jpg.",
      "thumb": "/visuals/2-chronicles/precept_sennaprism.jpg",
      "full": "/visuals/2-chronicles/precept_sennaprism.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sennaprism.jpg"
      },
      "chapters": [
        32
      ]
    },
    {
      "id": "precept-ch-sheba",
      "title": "Precept Austin — 2 Chronicles Chapter 9",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 9 — sheba.jpg.",
      "thumb": "/visuals/2-chronicles/precept_sheba.jpg",
      "full": "/visuals/2-chronicles/precept_sheba.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sheba.jpg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-solomonkingdom",
      "title": "Precept Austin — 2 Chronicles Chapter 9",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 9 — solomonkingdom.jpg.",
      "thumb": "/visuals/2-chronicles/precept_solomonkingdom.jpg",
      "full": "/visuals/2-chronicles/precept_solomonkingdom.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/solomonkingdom.jpg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-solomonstemplecity2",
      "title": "Precept Austin — 2 Chronicles Chapter 3",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 3 — solomonstemplecity2.jpg.",
      "thumb": "/visuals/2-chronicles/precept_solomonstemplecity2.jpg",
      "full": "/visuals/2-chronicles/precept_solomonstemplecity2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/solomonstemplecity2.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-solomontempleplan",
      "title": "Precept Austin — 2 Chronicles Chapter 3",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 3 — solomontempleplan.jpg.",
      "thumb": "/visuals/2-chronicles/precept_solomontempleplan.jpg",
      "full": "/visuals/2-chronicles/precept_solomontempleplan.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/solomontempleplan.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-tabernacle_schematic2",
      "title": "Precept Austin — 2 Chronicles Chapter 29",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 29 — tabernacle schematic2.gif.",
      "thumb": "/visuals/2-chronicles/precept_tabernacle_schematic2.gif",
      "full": "/visuals/2-chronicles/precept_tabernacle_schematic2.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Tabernacle%20schematic2.gif"
      },
      "chapters": [
        29
      ]
    },
    {
      "id": "precept-ch-tekoa",
      "title": "Precept Austin — 2 Chronicles Chapter 20",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 20 — tekoa.jpg.",
      "thumb": "/visuals/2-chronicles/precept_tekoa.jpg",
      "full": "/visuals/2-chronicles/precept_tekoa.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/tekoa.jpg"
      },
      "chapters": [
        20
      ]
    },
    {
      "id": "precept-ch-timelineisreal2",
      "title": "Precept Austin — 2 Chronicles Chapter 36",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 36 — timelineisreal2.png.",
      "thumb": "/visuals/2-chronicles/precept_timelineisreal2.png",
      "full": "/visuals/2-chronicles/precept_timelineisreal2.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/timelineisreal2.png"
      },
      "chapters": [
        36
      ]
    },
    {
      "id": "precept-ch-uzziahfamily",
      "title": "Precept Austin — 2 Chronicles Chapter 26",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 26 — uzziahfamily.png.",
      "thumb": "/visuals/2-chronicles/precept_uzziahfamily.png",
      "full": "/visuals/2-chronicles/precept_uzziahfamily.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/uzziahfamily.png"
      },
      "chapters": [
        26
      ]
    },
    {
      "id": "precept-ch-viamaris",
      "title": "Precept Austin — 2 Chronicles Chapter 26",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 26 — viamaris.png.",
      "thumb": "/visuals/2-chronicles/precept_viamaris.png",
      "full": "/visuals/2-chronicles/precept_viamaris.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/viamaris.png"
      },
      "chapters": [
        26
      ]
    }
  ]
},
  'ezra': {
  "videos": [
    {
      "youtubeId": "MkETkRv9tG8",
      "title": "Ezra–Nehemiah — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/MkETkRv9tG8?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/ezra/",
      "chapterStart": 1,
      "chapterEnd": 10
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Ezra",
      "caption": "Hand-illustrated single-page overview of Ezra, tracing the book's literary design and major themes.",
      "thumb": "/visuals/ezra/bibleproject_poster.jpg",
      "full": "/visuals/ezra/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-ezra/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Ezra Bible Chart",
      "caption": "Single-page structural chart of Ezra, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/ezra/swindoll_chart.png",
      "full": "/visuals/ezra/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Ezra-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Ezra Chart",
      "caption": "Bruce Hurt's inductive-study chart for Ezra, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/ezra/precept_chart.png",
      "full": "/visuals/ezra/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ezrachart.png"
      }
    },
    {
      "id": "precept-book-ezrahistory",
      "title": "Precept Austin — Ezra (ezrahistory.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Ezra chapters on Precept Austin's commentary.",
      "thumb": "/visuals/ezra/precept_ezrahistory.png",
      "full": "/visuals/ezra/precept_ezrahistory.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ezrahistory.png"
      }
    },
    {
      "id": "precept-book-ezrahistroy2",
      "title": "Precept Austin — Ezra (ezrahistroy2.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Ezra chapters on Precept Austin's commentary.",
      "thumb": "/visuals/ezra/precept_ezrahistroy2.png",
      "full": "/visuals/ezra/precept_ezrahistroy2.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ezrahistroy2.png"
      }
    },
    {
      "id": "precept-book-ezrareturn",
      "title": "Precept Austin — Ezra (ezrareturn.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Ezra chapters on Precept Austin's commentary.",
      "thumb": "/visuals/ezra/precept_ezrareturn.png",
      "full": "/visuals/ezra/precept_ezrareturn.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ezrareturn.png"
      }
    },
    {
      "id": "precept-book-persiaezraesv",
      "title": "Precept Austin — Ezra (persiaezraesv.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Ezra chapters on Precept Austin's commentary.",
      "thumb": "/visuals/ezra/precept_persiaezraesv.jpg",
      "full": "/visuals/ezra/precept_persiaezraesv.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/persiaezraesv.jpg"
      }
    }
  ]
},
  'nehemiah': {
  "videos": [
    {
      "youtubeId": "MkETkRv9tG8",
      "title": "Ezra–Nehemiah — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/MkETkRv9tG8?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/nehemiah/",
      "chapterStart": 1,
      "chapterEnd": 13
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Nehemiah",
      "caption": "Hand-illustrated single-page overview of Nehemiah, tracing the book's literary design and major themes.",
      "thumb": "/visuals/nehemiah/bibleproject_poster.jpg",
      "full": "/visuals/nehemiah/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-nehemiah/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Nehemiah Bible Chart",
      "caption": "Single-page structural chart of Nehemiah, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/nehemiah/swindoll_chart.png",
      "full": "/visuals/nehemiah/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Nehemiah-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Nehemiah Chart",
      "caption": "Bruce Hurt's inductive-study chart for Nehemiah, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/nehemiah/precept_chart.png",
      "full": "/visuals/nehemiah/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/nehemiahchart.png"
      }
    },
    {
      "id": "precept-book-persiannehemiahesv",
      "title": "Precept Austin — Nehemiah (persiannehemiahesv.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Nehemiah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/nehemiah/precept_persiannehemiahesv.jpg",
      "full": "/visuals/nehemiah/precept_persiannehemiahesv.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/persiannehemiahesv.jpg"
      }
    },
    {
      "id": "precept-book-nehemiah",
      "title": "Precept Austin — Nehemiah (nehemiah.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Nehemiah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/nehemiah/precept_nehemiah.jpg",
      "full": "/visuals/nehemiah/precept_nehemiah.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/nehemiah.jpg"
      }
    }
  ]
},
  'esther': {
  "videos": [
    {
      "youtubeId": "JydNSlufRIs",
      "title": "Esther — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/JydNSlufRIs?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/esther/",
      "chapterStart": 1,
      "chapterEnd": 10
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Esther",
      "caption": "Hand-illustrated single-page overview of Esther, tracing the book's literary design and major themes.",
      "thumb": "/visuals/esther/bibleproject_poster.jpg",
      "full": "/visuals/esther/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-esther/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Esther Bible Chart",
      "caption": "Single-page structural chart of Esther, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/esther/swindoll_chart.png",
      "full": "/visuals/esther/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Esther-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Esther Chart",
      "caption": "Bruce Hurt's inductive-study chart for Esther, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/esther/precept_chart.png",
      "full": "/visuals/esther/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/estherchart.png"
      }
    }
  ]
},
  'job': {
  "videos": [
    {
      "youtubeId": "xQwnH8th_fs",
      "title": "Job — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/xQwnH8th_fs?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/job/",
      "chapterStart": 1,
      "chapterEnd": 42
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Job",
      "caption": "Hand-illustrated single-page overview of Job, tracing the book's literary design and major themes.",
      "thumb": "/visuals/job/bibleproject_poster.jpg",
      "full": "/visuals/job/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-job/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Job Bible Chart",
      "caption": "Single-page structural chart of Job, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/job/swindoll_chart.png",
      "full": "/visuals/job/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Job-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Job Chart",
      "caption": "Bruce Hurt's inductive-study chart for Job, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/job/precept_chart.png",
      "full": "/visuals/job/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jobchart.png"
      }
    }
  ]
},
  'psalms': {
  "videos": [
    {
      "youtubeId": "j9phNEaPrv8",
      "title": "Psalms — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/j9phNEaPrv8?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/psalms/",
      "chapterStart": 1,
      "chapterEnd": 150
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Psalms",
      "caption": "Hand-illustrated single-page overview of Psalms, tracing the book's literary design and major themes.",
      "thumb": "/visuals/psalms/bibleproject_poster.jpg",
      "full": "/visuals/psalms/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-psalms/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Psalms Bible Chart",
      "caption": "Single-page structural chart of Psalms, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/psalms/swindoll_chart.png",
      "full": "/visuals/psalms/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Psalms-Bible-chart.pdf"
      }
    }
  ]
},
  'proverbs': {
  "videos": [
    {
      "youtubeId": "AzmYV8GNAIM",
      "title": "Proverbs — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/AzmYV8GNAIM?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/proverbs/",
      "chapterStart": 1,
      "chapterEnd": 31
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Proverbs",
      "caption": "Hand-illustrated single-page overview of Proverbs, tracing the book's literary design and major themes.",
      "thumb": "/visuals/proverbs/bibleproject_poster.jpg",
      "full": "/visuals/proverbs/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-proverbs/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Proverbs Bible Chart",
      "caption": "Single-page structural chart of Proverbs, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/proverbs/swindoll_chart.png",
      "full": "/visuals/proverbs/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Proverbs-Bible-chart.pdf"
      }
    }
  ]
},
  'ecclesiastes': {
  "videos": [
    {
      "youtubeId": "lrsQ1tc-2wk",
      "title": "Ecclesiastes — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/lrsQ1tc-2wk?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/ecclesiastes/",
      "chapterStart": 1,
      "chapterEnd": 12
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Ecclesiastes",
      "caption": "Hand-illustrated single-page overview of Ecclesiastes, tracing the book's literary design and major themes.",
      "thumb": "/visuals/ecclesiastes/bibleproject_poster.jpg",
      "full": "/visuals/ecclesiastes/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-ecclesiastes/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Ecclesiastes Bible Chart",
      "caption": "Single-page structural chart of Ecclesiastes, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/ecclesiastes/swindoll_chart.png",
      "full": "/visuals/ecclesiastes/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Ecclesiastes-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-ch-eccl-summary",
      "title": "Precept Austin — Ecclesiastes Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Ecclesiastes chapter 1 — eccl-summary.png.",
      "thumb": "/visuals/ecclesiastes/precept_eccl-summary.png",
      "full": "/visuals/ecclesiastes/precept_eccl-summary.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/eccl-summary.png"
      },
      "chapters": [
        1
      ]
    }
  ]
},
  'song-of-solomon': {
  "videos": [
    {
      "youtubeId": "4KC7xE4fgOw",
      "title": "Song of Songs — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/4KC7xE4fgOw?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/song-of-solomon/",
      "chapterStart": 1,
      "chapterEnd": 8
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Song of Songs",
      "caption": "Hand-illustrated single-page overview of Song of Songs, tracing the book's literary design and major themes.",
      "thumb": "/visuals/song-of-solomon/bibleproject_poster.jpg",
      "full": "/visuals/song-of-solomon/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-song-of-solomon/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Song of Songs Bible Chart",
      "caption": "Single-page structural chart of Song of Songs, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/song-of-solomon/swindoll_chart.png",
      "full": "/visuals/song-of-solomon/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Song-of-Solomon-Bible-chart.pdf"
      }
    }
  ]
},
  'isaiah': {
  "videos": [
    {
      "youtubeId": "d0A6Uchb1F8",
      "title": "Isaiah 1–39 — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/d0A6Uchb1F8?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/isaiah/",
      "chapterStart": 1,
      "chapterEnd": 39
    },
    {
      "youtubeId": "_TzdEPuqgQg",
      "title": "Isaiah 40–66 — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/_TzdEPuqgQg?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/isaiah/",
      "chapterStart": 40,
      "chapterEnd": 66
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Isaiah",
      "caption": "Hand-illustrated single-page overview of Isaiah, tracing the book's literary design and major themes.",
      "thumb": "/visuals/isaiah/bibleproject_poster.jpg",
      "full": "/visuals/isaiah/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-isaiah/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Isaiah Bible Chart",
      "caption": "Single-page structural chart of Isaiah, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/isaiah/swindoll_chart.png",
      "full": "/visuals/isaiah/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Isaiah-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-book-isaiah_and_jeremiah_geography",
      "title": "Precept Austin — Isaiah (isaiah_and_jeremiah_geography.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Isaiah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/isaiah/precept_isaiah_and_jeremiah_geography.png",
      "full": "/visuals/isaiah/precept_isaiah_and_jeremiah_geography.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/isaiah_and_jeremiah_geography.png"
      }
    },
    {
      "id": "precept-book-isaiah_con",
      "title": "Precept Austin — Isaiah (isaiah_con.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Isaiah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/isaiah/precept_isaiah_con.png",
      "full": "/visuals/isaiah/precept_isaiah_con.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/isaiah_con.png"
      }
    },
    {
      "id": "precept-book-isaiah_glorious_throne_of_jehovah_the_holy_one",
      "title": "Precept Austin — Isaiah (isaiah_glorious_throne_of_jehovah_the_holy_one.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Isaiah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/isaiah/precept_isaiah_glorious_throne_of_jehovah_the_holy_one.png",
      "full": "/visuals/isaiah/precept_isaiah_glorious_throne_of_jehovah_the_holy_one.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/isaiah_glorious_throne_of_jehovah_the_holy_one.png"
      }
    },
    {
      "id": "precept-ch-1kichart2",
      "title": "Precept Austin — Isaiah Chapters 36–39",
      "caption": "Bruce Hurt's commentary chart for Isaiah chapters 36–39 — 1kichart2.png.",
      "thumb": "/visuals/isaiah/precept_1kichart2.png",
      "full": "/visuals/isaiah/precept_1kichart2.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1kichart2.png"
      },
      "chapters": [
        36,
        37,
        38,
        39
      ]
    },
    {
      "id": "precept-ch-actojerus",
      "title": "Precept Austin — Isaiah Chapter 34",
      "caption": "Bruce Hurt's commentary chart for Isaiah chapter 34 — actojerus.jpg.",
      "thumb": "/visuals/isaiah/precept_actojerus.jpg",
      "full": "/visuals/isaiah/precept_actojerus.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/actojerus.jpg"
      },
      "chapters": [
        34
      ]
    },
    {
      "id": "precept-ch-actosouth",
      "title": "Precept Austin — Isaiah Chapter 34",
      "caption": "Bruce Hurt's commentary chart for Isaiah chapter 34 — actosouth.jpg.",
      "thumb": "/visuals/isaiah/precept_actosouth.jpg",
      "full": "/visuals/isaiah/precept_actosouth.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/actosouth.jpg"
      },
      "chapters": [
        34
      ]
    },
    {
      "id": "precept-ch-armageddon",
      "title": "Precept Austin — Isaiah Chapter 34",
      "caption": "Bruce Hurt's commentary chart for Isaiah chapter 34 — armageddon.jpg.",
      "thumb": "/visuals/isaiah/precept_armageddon.jpg",
      "full": "/visuals/isaiah/precept_armageddon.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Armageddon.jpg"
      },
      "chapters": [
        34
      ]
    },
    {
      "id": "precept-ch-bozrah2",
      "title": "Precept Austin — Isaiah Chapter 34",
      "caption": "Bruce Hurt's commentary chart for Isaiah chapter 34 — bozrah2.jpg.",
      "thumb": "/visuals/isaiah/precept_bozrah2.jpg",
      "full": "/visuals/isaiah/precept_bozrah2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bozrah2.jpg"
      },
      "chapters": [
        34
      ]
    },
    {
      "id": "precept-ch-bozrahjordan",
      "title": "Precept Austin — Isaiah Chapter 34",
      "caption": "Bruce Hurt's commentary chart for Isaiah chapter 34 — bozrahjordan.jpg.",
      "thumb": "/visuals/isaiah/precept_bozrahjordan.jpg",
      "full": "/visuals/isaiah/precept_bozrahjordan.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bozrahjordan.jpg"
      },
      "chapters": [
        34
      ]
    },
    {
      "id": "precept-ch-hezekiahspool",
      "title": "Precept Austin — Isaiah Chapter 36",
      "caption": "Bruce Hurt's commentary chart for Isaiah chapter 36 — hezekiahspool.jpg.",
      "thumb": "/visuals/isaiah/precept_hezekiahspool.jpg",
      "full": "/visuals/isaiah/precept_hezekiahspool.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hezekiahspool.jpg"
      },
      "chapters": [
        36
      ]
    },
    {
      "id": "precept-ch-hoshea171",
      "title": "Precept Austin — Isaiah Chapter 36",
      "caption": "Bruce Hurt's commentary chart for Isaiah chapter 36 — hoshea171.png.",
      "thumb": "/visuals/isaiah/precept_hoshea171.png",
      "full": "/visuals/isaiah/precept_hoshea171.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hoshea171.png"
      },
      "chapters": [
        36
      ]
    },
    {
      "id": "precept-ch-isaiah_and_jeremiah_geography",
      "title": "Precept Austin — Isaiah Chapters 34–35",
      "caption": "Bruce Hurt's commentary chart for Isaiah chapters 34–35 — isaiah_and_jeremiah_geography.png.",
      "thumb": "/visuals/isaiah/precept_isaiah_and_jeremiah_geography.png",
      "full": "/visuals/isaiah/precept_isaiah_and_jeremiah_geography.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/isaiah_and_jeremiah_geography.png"
      },
      "chapters": [
        34,
        35
      ]
    },
    {
      "id": "precept-ch-isaiah_con",
      "title": "Precept Austin — Isaiah Chapters 34–35",
      "caption": "Bruce Hurt's commentary chart for Isaiah chapters 34–35 — isaiah_con.png.",
      "thumb": "/visuals/isaiah/precept_isaiah_con.png",
      "full": "/visuals/isaiah/precept_isaiah_con.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/isaiah_con.png"
      },
      "chapters": [
        34,
        35
      ]
    },
    {
      "id": "precept-ch-isaiah_glorious_throne_of_jehovah_the_holy_one",
      "title": "Precept Austin — Isaiah Chapters 34, 35, 44, 49, 50, 61",
      "caption": "Bruce Hurt's commentary chart for Isaiah chapters 34, 35, 44, 49, 50, 61 — isaiah_glorious_throne_of_jehovah_the_holy_one.png.",
      "thumb": "/visuals/isaiah/precept_isaiah_glorious_throne_of_jehovah_the_holy_one.png",
      "full": "/visuals/isaiah/precept_isaiah_glorious_throne_of_jehovah_the_holy_one.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/isaiah_glorious_throne_of_jehovah_the_holy_one.png"
      },
      "chapters": [
        34,
        35,
        44,
        49,
        50,
        61
      ]
    },
    {
      "id": "precept-ch-kingsallchart",
      "title": "Precept Austin — Isaiah Chapter 7",
      "caption": "Bruce Hurt's commentary chart for Isaiah chapter 7 — kingsallchart.jpg.",
      "thumb": "/visuals/isaiah/precept_kingsallchart.jpg",
      "full": "/visuals/isaiah/precept_kingsallchart.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/kingsallchart.jpg"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-map_of_assyria",
      "title": "Precept Austin — Isaiah Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Isaiah chapter 10 — map_of_assyria.png.",
      "thumb": "/visuals/isaiah/precept_map_of_assyria.png",
      "full": "/visuals/isaiah/precept_map_of_assyria.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Map_of_Assyria.png"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-messianic",
      "title": "Precept Austin — Isaiah Chapter 53",
      "caption": "Bruce Hurt's commentary chart for Isaiah chapter 53 — messianic.jpg.",
      "thumb": "/visuals/isaiah/precept_messianic.jpg",
      "full": "/visuals/isaiah/precept_messianic.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/messianic.jpg"
      },
      "chapters": [
        53
      ]
    },
    {
      "id": "precept-ch-r92",
      "title": "Precept Austin — Isaiah Chapter 34",
      "caption": "Bruce Hurt's commentary chart for Isaiah chapter 34 — r92.png.",
      "thumb": "/visuals/isaiah/precept_r92.png",
      "full": "/visuals/isaiah/precept_r92.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/r92.png"
      },
      "chapters": [
        34
      ]
    },
    {
      "id": "precept-ch-sennacherib",
      "title": "Precept Austin — Isaiah Chapter 36",
      "caption": "Bruce Hurt's commentary chart for Isaiah chapter 36 — sennacherib.jpg.",
      "thumb": "/visuals/isaiah/precept_sennacherib.jpg",
      "full": "/visuals/isaiah/precept_sennacherib.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sennacherib.jpg"
      },
      "chapters": [
        36
      ]
    },
    {
      "id": "precept-ch-sennacheribseige",
      "title": "Precept Austin — Isaiah Chapter 36",
      "caption": "Bruce Hurt's commentary chart for Isaiah chapter 36 — sennacheribseige.png.",
      "thumb": "/visuals/isaiah/precept_sennacheribseige.png",
      "full": "/visuals/isaiah/precept_sennacheribseige.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sennacheribseige.png"
      },
      "chapters": [
        36
      ]
    },
    {
      "id": "precept-ch-timegap2",
      "title": "Precept Austin — Isaiah Chapter 61",
      "caption": "Bruce Hurt's commentary chart for Isaiah chapter 61 — timegap2.jpg.",
      "thumb": "/visuals/isaiah/precept_timegap2.jpg",
      "full": "/visuals/isaiah/precept_timegap2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/timegap2.jpg"
      },
      "chapters": [
        61
      ]
    },
    {
      "id": "precept-ch-timelineisreal1",
      "title": "Precept Austin — Isaiah Chapter 44",
      "caption": "Bruce Hurt's commentary chart for Isaiah chapter 44 — timelineisreal1.png.",
      "thumb": "/visuals/isaiah/precept_timelineisreal1.png",
      "full": "/visuals/isaiah/precept_timelineisreal1.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/timelineisreal1.png"
      },
      "chapters": [
        44
      ]
    }
  ]
},
  'jeremiah': {
  "videos": [
    {
      "youtubeId": "RSK36cHbrk0",
      "title": "Jeremiah — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/RSK36cHbrk0?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/jeremiah/",
      "chapterStart": 1,
      "chapterEnd": 52
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Jeremiah",
      "caption": "Hand-illustrated single-page overview of Jeremiah, tracing the book's literary design and major themes.",
      "thumb": "/visuals/jeremiah/bibleproject_poster.jpg",
      "full": "/visuals/jeremiah/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-jeremiah/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Jeremiah Bible Chart",
      "caption": "Single-page structural chart of Jeremiah, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/jeremiah/swindoll_chart.png",
      "full": "/visuals/jeremiah/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Jeremiah-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-book-jeremiahtimeline",
      "title": "Precept Austin — Jeremiah (jeremiahtimeline.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Jeremiah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/jeremiah/precept_jeremiahtimeline.png",
      "full": "/visuals/jeremiah/precept_jeremiahtimeline.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jeremiahtimeline.png"
      }
    },
    {
      "id": "precept-book-timelineisreal1",
      "title": "Precept Austin — Jeremiah (timelineisreal1.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Jeremiah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/jeremiah/precept_timelineisreal1.png",
      "full": "/visuals/jeremiah/precept_timelineisreal1.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/timelineisreal1.png"
      }
    },
    {
      "id": "precept-book-jeremiahmap",
      "title": "Precept Austin — Jeremiah (jeremiahmap.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Jeremiah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/jeremiah/precept_jeremiahmap.jpg",
      "full": "/visuals/jeremiah/precept_jeremiahmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jeremiahmap.jpg"
      }
    },
    {
      "id": "precept-book-jer",
      "title": "Precept Austin — Jeremiah (jer.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Jeremiah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/jeremiah/precept_jer.png",
      "full": "/visuals/jeremiah/precept_jer.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jer.png"
      }
    },
    {
      "id": "precept-book-jer_con",
      "title": "Precept Austin — Jeremiah (jer_con.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Jeremiah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/jeremiah/precept_jer_con.png",
      "full": "/visuals/jeremiah/precept_jer_con.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jer_con.png"
      }
    },
    {
      "id": "precept-book-jer_struc",
      "title": "Precept Austin — Jeremiah (jer_struc.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Jeremiah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/jeremiah/precept_jer_struc.jpg",
      "full": "/visuals/jeremiah/precept_jer_struc.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jer_struc.jpg"
      }
    },
    {
      "id": "precept-book-jer_struc2",
      "title": "Precept Austin — Jeremiah (jer_struc2.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Jeremiah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/jeremiah/precept_jer_struc2.jpg",
      "full": "/visuals/jeremiah/precept_jer_struc2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jer_struc2.jpg"
      }
    },
    {
      "id": "precept-book-jer_struc3",
      "title": "Precept Austin — Jeremiah (jer_struc3.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Jeremiah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/jeremiah/precept_jer_struc3.jpg",
      "full": "/visuals/jeremiah/precept_jer_struc3.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jer_struc3.jpg"
      }
    },
    {
      "id": "precept-ch-cornergate",
      "title": "Precept Austin — Jeremiah Chapter 38",
      "caption": "Bruce Hurt's commentary chart for Jeremiah chapter 38 — cornergate.jpg.",
      "thumb": "/visuals/jeremiah/precept_cornergate.jpg",
      "full": "/visuals/jeremiah/precept_cornergate.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/cornergate.jpg"
      },
      "chapters": [
        38
      ]
    },
    {
      "id": "precept-ch-jehoiakimdates4",
      "title": "Precept Austin — Jeremiah Chapter 24",
      "caption": "Bruce Hurt's commentary chart for Jeremiah chapter 24 — jehoiakimdates4.png.",
      "thumb": "/visuals/jeremiah/precept_jehoiakimdates4.png",
      "full": "/visuals/jeremiah/precept_jehoiakimdates4.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jehoiakimdates4.png"
      },
      "chapters": [
        24
      ]
    },
    {
      "id": "precept-ch-jeremiahtimeline",
      "title": "Precept Austin — Jeremiah Chapters 28–29",
      "caption": "Bruce Hurt's commentary chart for Jeremiah chapters 28–29 — jeremiahtimeline.png.",
      "thumb": "/visuals/jeremiah/precept_jeremiahtimeline.png",
      "full": "/visuals/jeremiah/precept_jeremiahtimeline.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jeremiahtimeline.png"
      },
      "chapters": [
        28,
        29
      ]
    },
    {
      "id": "precept-ch-luke_genealogy",
      "title": "Precept Austin — Jeremiah Chapter 22",
      "caption": "Bruce Hurt's commentary chart for Jeremiah chapter 22 — luke_genealogy.png.",
      "thumb": "/visuals/jeremiah/precept_luke_genealogy.png",
      "full": "/visuals/jeremiah/precept_luke_genealogy.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Luke_genealogy.png"
      },
      "chapters": [
        22
      ]
    },
    {
      "id": "precept-ch-messiahslinethroughjoseph",
      "title": "Precept Austin — Jeremiah Chapter 22",
      "caption": "Bruce Hurt's commentary chart for Jeremiah chapter 22 — messiahslinethroughjoseph.png.",
      "thumb": "/visuals/jeremiah/precept_messiahslinethroughjoseph.png",
      "full": "/visuals/jeremiah/precept_messiahslinethroughjoseph.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/messiahslinethroughjoseph.png"
      },
      "chapters": [
        22
      ]
    },
    {
      "id": "precept-ch-napthali",
      "title": "Precept Austin — Jeremiah Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Jeremiah chapter 27 — napthali.png.",
      "thumb": "/visuals/jeremiah/precept_napthali.png",
      "full": "/visuals/jeremiah/precept_napthali.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/napthali.png"
      },
      "chapters": [
        27
      ]
    }
  ]
},
  'lamentations': {
  "videos": [
    {
      "youtubeId": "p8GDFPdaQZQ",
      "title": "Lamentations — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/p8GDFPdaQZQ?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/lamentations/",
      "chapterStart": 1,
      "chapterEnd": 5
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Lamentations",
      "caption": "Hand-illustrated single-page overview of Lamentations, tracing the book's literary design and major themes.",
      "thumb": "/visuals/lamentations/bibleproject_poster.jpg",
      "full": "/visuals/lamentations/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-lamentations/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Lamentations Bible Chart",
      "caption": "Single-page structural chart of Lamentations, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/lamentations/swindoll_chart.png",
      "full": "/visuals/lamentations/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Lamentations-Bible-chart.pdf"
      }
    }
  ]
},
  'ezekiel': {
  "videos": [
    {
      "youtubeId": "R-CIPu1nko8",
      "title": "Ezekiel 1–33 — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/R-CIPu1nko8?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/ezekiel/",
      "chapterStart": 1,
      "chapterEnd": 33
    },
    {
      "youtubeId": "SDeCWW_Bnyw",
      "title": "Ezekiel 34–48 — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/SDeCWW_Bnyw?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/ezekiel/",
      "chapterStart": 34,
      "chapterEnd": 48
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Ezekiel",
      "caption": "Hand-illustrated single-page overview of Ezekiel, tracing the book's literary design and major themes.",
      "thumb": "/visuals/ezekiel/bibleproject_poster.jpg",
      "full": "/visuals/ezekiel/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-ezekiel/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Ezekiel Bible Chart",
      "caption": "Single-page structural chart of Ezekiel, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/ezekiel/swindoll_chart.png",
      "full": "/visuals/ezekiel/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Ezekiel-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-book-ezekiel_chronology",
      "title": "Precept Austin — Ezekiel (ezekiel_chronology.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Ezekiel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/ezekiel/precept_ezekiel_chronology.png",
      "full": "/visuals/ezekiel/precept_ezekiel_chronology.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ezekiel_chronology.png"
      }
    },
    {
      "id": "precept-book-ezek_glory",
      "title": "Precept Austin — Ezekiel (ezek_glory.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Ezekiel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/ezekiel/precept_ezek_glory.png",
      "full": "/visuals/ezekiel/precept_ezek_glory.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ezek_glory.png"
      }
    },
    {
      "id": "precept-book-heat-3",
      "title": "Precept Austin — Ezekiel (heat-3.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Ezekiel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/ezekiel/precept_heat-3.jpg",
      "full": "/visuals/ezekiel/precept_heat-3.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/heat-3.jpg"
      }
    }
  ]
},
  'daniel': {
  "videos": [
    {
      "youtubeId": "9cSC9uobtPM",
      "title": "Daniel — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/9cSC9uobtPM?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/daniel/",
      "chapterStart": 1,
      "chapterEnd": 12
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Daniel",
      "caption": "Hand-illustrated single-page overview of Daniel, tracing the book's literary design and major themes.",
      "thumb": "/visuals/daniel/bibleproject_poster.jpg",
      "full": "/visuals/daniel/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-daniel/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Daniel Bible Chart",
      "caption": "Single-page structural chart of Daniel, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/daniel/swindoll_chart.png",
      "full": "/visuals/daniel/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Daniel-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Daniel Chart",
      "caption": "Bruce Hurt's inductive-study chart for Daniel, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/daniel/precept_chart.png",
      "full": "/visuals/daniel/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/daniel.png"
      }
    },
    {
      "id": "precept-book-daniel_contemp",
      "title": "Precept Austin — Daniel (daniel_contemp.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Daniel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/daniel/precept_daniel_contemp.png",
      "full": "/visuals/daniel/precept_daniel_contemp.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/daniel_contemp.png"
      }
    },
    {
      "id": "precept-book-daniel_dreams",
      "title": "Precept Austin — Daniel (daniel_dreams.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Daniel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/daniel/precept_daniel_dreams.png",
      "full": "/visuals/daniel/precept_daniel_dreams.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/daniel_dreams.png"
      }
    },
    {
      "id": "precept-book-daniel_visions",
      "title": "Precept Austin — Daniel (daniel_visions.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Daniel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/daniel/precept_daniel_visions.png",
      "full": "/visuals/daniel/precept_daniel_visions.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/daniel_visions.png"
      }
    },
    {
      "id": "precept-ch-daniel_contemp",
      "title": "Precept Austin — Daniel Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Daniel chapter 2 — daniel_contemp.png.",
      "thumb": "/visuals/daniel/precept_daniel_contemp.png",
      "full": "/visuals/daniel/precept_daniel_contemp.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/daniel_contemp.png"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-daniel_dreams",
      "title": "Precept Austin — Daniel Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Daniel chapter 2 — daniel_dreams.png.",
      "thumb": "/visuals/daniel/precept_daniel_dreams.png",
      "full": "/visuals/daniel/precept_daniel_dreams.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/daniel_dreams.png"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-daniel_visions",
      "title": "Precept Austin — Daniel Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Daniel chapter 2 — daniel_visions.png.",
      "thumb": "/visuals/daniel/precept_daniel_visions.png",
      "full": "/visuals/daniel/precept_daniel_visions.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/daniel_visions.png"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-medo-persia_map_with_susa",
      "title": "Precept Austin — Daniel Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Daniel chapter 8 — medo-persia map with susa.gif.",
      "thumb": "/visuals/daniel/precept_medo-persia_map_with_susa.gif",
      "full": "/visuals/daniel/precept_medo-persia_map_with_susa.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Medo-Persia%20Map%20with%20Susa.gif"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-ptolemy_all_4_needs_caption",
      "title": "Precept Austin — Daniel Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Daniel chapter 8 — ptolemy all 4 needs caption.gif.",
      "thumb": "/visuals/daniel/precept_ptolemy_all_4_needs_caption.gif",
      "full": "/visuals/daniel/precept_ptolemy_all_4_needs_caption.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ptolemy%20all%204%20needs%20caption.gif"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-susa",
      "title": "Precept Austin — Daniel Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Daniel chapter 8 — susa.png.",
      "thumb": "/visuals/daniel/precept_susa.png",
      "full": "/visuals/daniel/precept_susa.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/susa.png"
      },
      "chapters": [
        8
      ]
    }
  ]
},
  'hosea': {
  "videos": [
    {
      "youtubeId": "kE6SZ1ogOVU",
      "title": "Hosea — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/kE6SZ1ogOVU?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/hosea/",
      "chapterStart": 1,
      "chapterEnd": 14
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Hosea",
      "caption": "Hand-illustrated single-page overview of Hosea, tracing the book's literary design and major themes.",
      "thumb": "/visuals/hosea/bibleproject_poster.jpg",
      "full": "/visuals/hosea/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-hosea/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Hosea Bible Chart",
      "caption": "Single-page structural chart of Hosea, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/hosea/swindoll_chart.png",
      "full": "/visuals/hosea/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Hosea-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Hosea Chart",
      "caption": "Bruce Hurt's inductive-study chart for Hosea, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/hosea/precept_chart.png",
      "full": "/visuals/hosea/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hosea.png"
      }
    },
    {
      "id": "precept-book-hosea_geo",
      "title": "Precept Austin — Hosea (hosea_geo.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Hosea chapters on Precept Austin's commentary.",
      "thumb": "/visuals/hosea/precept_hosea_geo.png",
      "full": "/visuals/hosea/precept_hosea_geo.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hosea_geo.png"
      }
    },
    {
      "id": "precept-book-hoseamap",
      "title": "Precept Austin — Hosea (hoseamap.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Hosea chapters on Precept Austin's commentary.",
      "thumb": "/visuals/hosea/precept_hoseamap.jpg",
      "full": "/visuals/hosea/precept_hoseamap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hoseamap.jpg"
      }
    },
    {
      "id": "precept-book-hoseatime",
      "title": "Precept Austin — Hosea (hoseatime.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Hosea chapters on Precept Austin's commentary.",
      "thumb": "/visuals/hosea/precept_hoseatime.png",
      "full": "/visuals/hosea/precept_hoseatime.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hoseatime.png"
      }
    },
    {
      "id": "precept-book-prophetsofisrael",
      "title": "Precept Austin — Hosea (prophetsofisrael.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Hosea chapters on Precept Austin's commentary.",
      "thumb": "/visuals/hosea/precept_prophetsofisrael.jpg",
      "full": "/visuals/hosea/precept_prophetsofisrael.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/prophetsofisrael.jpg"
      }
    }
  ]
},
  'joel': {
  "videos": [
    {
      "youtubeId": "zQLazbgz90c",
      "title": "Joel — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/zQLazbgz90c?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/joel/",
      "chapterStart": 1,
      "chapterEnd": 3
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Joel",
      "caption": "Hand-illustrated single-page overview of Joel, tracing the book's literary design and major themes.",
      "thumb": "/visuals/joel/bibleproject_poster.jpg",
      "full": "/visuals/joel/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-joel/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Joel Bible Chart",
      "caption": "Single-page structural chart of Joel, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/joel/swindoll_chart.png",
      "full": "/visuals/joel/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Joel-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Joel Chart",
      "caption": "Bruce Hurt's inductive-study chart for Joel, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/joel/precept_chart.png",
      "full": "/visuals/joel/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/joel.png"
      }
    },
    {
      "id": "precept-book-joelmap",
      "title": "Precept Austin — Joel (joelmap.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Joel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/joel/precept_joelmap.jpg",
      "full": "/visuals/joel/precept_joelmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/joelmap.jpg"
      }
    },
    {
      "id": "precept-book-joeltime",
      "title": "Precept Austin — Joel (joeltime.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Joel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/joel/precept_joeltime.png",
      "full": "/visuals/joel/precept_joeltime.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/joeltime.png"
      }
    },
    {
      "id": "precept-book-seven-feasts",
      "title": "Precept Austin — Joel (seven-feasts.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Joel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/joel/precept_seven-feasts.png",
      "full": "/visuals/joel/precept_seven-feasts.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/seven-feasts.png"
      }
    },
    {
      "id": "precept-book-joel-1",
      "title": "Precept Austin — Joel (joel-1.gif)",
      "caption": "Bruce Hurt's chart embedded across multiple Joel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/joel/precept_joel-1.gif",
      "full": "/visuals/joel/precept_joel-1.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/joel-1.gif"
      }
    },
    {
      "id": "precept-book-joel-sym",
      "title": "Precept Austin — Joel (joel-sym.gif)",
      "caption": "Bruce Hurt's chart embedded across multiple Joel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/joel/precept_joel-sym.gif",
      "full": "/visuals/joel/precept_joel-sym.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/joel-sym.gif"
      }
    },
    {
      "id": "precept-ch-city_of_david",
      "title": "Precept Austin — Joel Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Joel chapter 2 — city of david.gif.",
      "thumb": "/visuals/joel/precept_city_of_david.gif",
      "full": "/visuals/joel/precept_city_of_david.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/City of David.gif"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-citydavid1",
      "title": "Precept Austin — Joel Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Joel chapter 2 — citydavid1.jpg.",
      "thumb": "/visuals/joel/precept_citydavid1.jpg",
      "full": "/visuals/joel/precept_citydavid1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/citydavid1.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-dolchart2",
      "title": "Precept Austin — Joel Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Joel chapter 3 — dolchart2.jpg.",
      "thumb": "/visuals/joel/precept_dolchart2.jpg",
      "full": "/visuals/joel/precept_dolchart2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/DOLchart2.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-image002",
      "title": "Precept Austin — Joel Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Joel chapter 2 — image002.jpg.",
      "thumb": "/visuals/joel/precept_image002.jpg",
      "full": "/visuals/joel/precept_image002.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ezekiel_810-18_files/image002.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-joel-1",
      "title": "Precept Austin — Joel Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Joel chapter 1 — joel-1.gif.",
      "thumb": "/visuals/joel/precept_joel-1.gif",
      "full": "/visuals/joel/precept_joel-1.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/joel-1.gif"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-joeltime",
      "title": "Precept Austin — Joel Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Joel chapter 1 — joeltime.png.",
      "thumb": "/visuals/joel/precept_joeltime.png",
      "full": "/visuals/joel/precept_joeltime.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/joeltime.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-ophel",
      "title": "Precept Austin — Joel Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Joel chapter 2 — ophel.jpg.",
      "thumb": "/visuals/joel/precept_ophel.jpg",
      "full": "/visuals/joel/precept_ophel.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/OPHEL.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-prophecy_peaks_-_see_zeph_1_also",
      "title": "Precept Austin — Joel Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Joel chapter 2 — prophecy peaks - see zeph 1 also.gif.",
      "thumb": "/visuals/joel/precept_prophecy_peaks_-_see_zeph_1_also.gif",
      "full": "/visuals/joel/precept_prophecy_peaks_-_see_zeph_1_also.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Prophecy peaks - see zeph 1 also.gif"
      },
      "chapters": [
        2
      ]
    }
  ]
},
  'amos': {
  "videos": [
    {
      "youtubeId": "mGgWaPGpGz4",
      "title": "Amos — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/mGgWaPGpGz4?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/amos/",
      "chapterStart": 1,
      "chapterEnd": 9
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Amos",
      "caption": "Hand-illustrated single-page overview of Amos, tracing the book's literary design and major themes.",
      "thumb": "/visuals/amos/bibleproject_poster.jpg",
      "full": "/visuals/amos/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-amos/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Amos Bible Chart",
      "caption": "Single-page structural chart of Amos, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/amos/swindoll_chart.png",
      "full": "/visuals/amos/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Amos-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Amos Chart",
      "caption": "Bruce Hurt's inductive-study chart for Amos, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/amos/precept_chart.png",
      "full": "/visuals/amos/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/amos.png"
      }
    },
    {
      "id": "precept-book-amos_geo",
      "title": "Precept Austin — Amos (amos_geo.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Amos chapters on Precept Austin's commentary.",
      "thumb": "/visuals/amos/precept_amos_geo.png",
      "full": "/visuals/amos/precept_amos_geo.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/amos_geo.png"
      }
    },
    {
      "id": "precept-book-amosmap",
      "title": "Precept Austin — Amos (amosmap.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Amos chapters on Precept Austin's commentary.",
      "thumb": "/visuals/amos/precept_amosmap.jpg",
      "full": "/visuals/amos/precept_amosmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/amosmap.jpg"
      }
    },
    {
      "id": "precept-book-dolchart1",
      "title": "Precept Austin — Amos (dolchart1.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Amos chapters on Precept Austin's commentary.",
      "thumb": "/visuals/amos/precept_dolchart1.jpg",
      "full": "/visuals/amos/precept_dolchart1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/DOLchart1.jpg"
      }
    },
    {
      "id": "precept-book-dolchart2",
      "title": "Precept Austin — Amos (dolchart2.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Amos chapters on Precept Austin's commentary.",
      "thumb": "/visuals/amos/precept_dolchart2.jpg",
      "full": "/visuals/amos/precept_dolchart2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/DOLchart2.jpg"
      }
    },
    {
      "id": "precept-book-amos_con",
      "title": "Precept Austin — Amos (amos_con.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Amos chapters on Precept Austin's commentary.",
      "thumb": "/visuals/amos/precept_amos_con.png",
      "full": "/visuals/amos/precept_amos_con.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/amos_con.png"
      }
    },
    {
      "id": "precept-book-amostime",
      "title": "Precept Austin — Amos (amostime.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Amos chapters on Precept Austin's commentary.",
      "thumb": "/visuals/amos/precept_amostime.png",
      "full": "/visuals/amos/precept_amostime.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/amostime.png"
      }
    },
    {
      "id": "precept-book-fulfill",
      "title": "Precept Austin — Amos (fulfill.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Amos chapters on Precept Austin's commentary.",
      "thumb": "/visuals/amos/precept_fulfill.png",
      "full": "/visuals/amos/precept_fulfill.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/fulfill.png"
      }
    },
    {
      "id": "precept-book-prophetsofisrael",
      "title": "Precept Austin — Amos (prophetsofisrael.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Amos chapters on Precept Austin's commentary.",
      "thumb": "/visuals/amos/precept_prophetsofisrael.jpg",
      "full": "/visuals/amos/precept_prophetsofisrael.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/prophetsofisrael.jpg"
      }
    },
    {
      "id": "precept-ch-amos_con",
      "title": "Precept Austin — Amos Chapter 9",
      "caption": "Bruce Hurt's commentary chart for Amos chapter 9 — amos_con.png.",
      "thumb": "/visuals/amos/precept_amos_con.png",
      "full": "/visuals/amos/precept_amos_con.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/amos_con.png"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-amos_geo",
      "title": "Precept Austin — Amos Chapter 9",
      "caption": "Bruce Hurt's commentary chart for Amos chapter 9 — amos_geo.png.",
      "thumb": "/visuals/amos/precept_amos_geo.png",
      "full": "/visuals/amos/precept_amos_geo.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/amos_geo.png"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-amostime",
      "title": "Precept Austin — Amos Chapter 9",
      "caption": "Bruce Hurt's commentary chart for Amos chapter 9 — amostime.jpg.",
      "thumb": "/visuals/amos/precept_amostime.jpg",
      "full": "/visuals/amos/precept_amostime.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/amostime.jpg"
      },
      "chapters": [
        9
      ]
    }
  ]
},
  'obadiah': {
  "videos": [
    {
      "youtubeId": "i4ogCrEoG5s",
      "title": "Obadiah — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/i4ogCrEoG5s?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/obadiah/",
      "chapterStart": 1,
      "chapterEnd": 1
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Obadiah",
      "caption": "Hand-illustrated single-page overview of Obadiah, tracing the book's literary design and major themes.",
      "thumb": "/visuals/obadiah/bibleproject_poster.jpg",
      "full": "/visuals/obadiah/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-obadiah/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Obadiah Bible Chart",
      "caption": "Single-page structural chart of Obadiah, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/obadiah/swindoll_chart.png",
      "full": "/visuals/obadiah/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Obadiah-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Obadiah Chart",
      "caption": "Bruce Hurt's inductive-study chart for Obadiah, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/obadiah/precept_chart.png",
      "full": "/visuals/obadiah/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/oba.png"
      }
    }
  ]
},
  'jonah': {
  "videos": [
    {
      "youtubeId": "dLIabZc0O4c",
      "title": "Jonah — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/dLIabZc0O4c?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/jonah/",
      "chapterStart": 1,
      "chapterEnd": 4
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Jonah",
      "caption": "Hand-illustrated single-page overview of Jonah, tracing the book's literary design and major themes.",
      "thumb": "/visuals/jonah/bibleproject_poster.jpg",
      "full": "/visuals/jonah/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-jonah/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Jonah Bible Chart",
      "caption": "Single-page structural chart of Jonah, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/jonah/swindoll_chart.png",
      "full": "/visuals/jonah/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Jonah-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Jonah Chart",
      "caption": "Bruce Hurt's inductive-study chart for Jonah, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/jonah/precept_chart.png",
      "full": "/visuals/jonah/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jonah.png"
      }
    }
  ]
},
  'micah': {
  "videos": [
    {
      "youtubeId": "MFEUEcylwLc",
      "title": "Micah — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/MFEUEcylwLc?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/micah/",
      "chapterStart": 1,
      "chapterEnd": 7
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Micah",
      "caption": "Hand-illustrated single-page overview of Micah, tracing the book's literary design and major themes.",
      "thumb": "/visuals/micah/bibleproject_poster.jpg",
      "full": "/visuals/micah/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-micah/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Micah Bible Chart",
      "caption": "Single-page structural chart of Micah, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/micah/swindoll_chart.png",
      "full": "/visuals/micah/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Micah-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Micah Chart",
      "caption": "Bruce Hurt's inductive-study chart for Micah, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/micah/precept_chart.png",
      "full": "/visuals/micah/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mic.png"
      }
    },
    {
      "id": "precept-book-micahmap",
      "title": "Precept Austin — Micah (micahmap.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Micah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/micah/precept_micahmap.jpg",
      "full": "/visuals/micah/precept_micahmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/micahmap.jpg"
      }
    },
    {
      "id": "precept-book-micahtime",
      "title": "Precept Austin — Micah (micahtime.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Micah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/micah/precept_micahtime.png",
      "full": "/visuals/micah/precept_micahtime.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/micahtime.png"
      }
    },
    {
      "id": "precept-book-prophetsofisrael",
      "title": "Precept Austin — Micah (prophetsofisrael.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Micah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/micah/precept_prophetsofisrael.jpg",
      "full": "/visuals/micah/precept_prophetsofisrael.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/prophetsofisrael.jpg"
      }
    },
    {
      "id": "precept-ch-bozrah",
      "title": "Precept Austin — Micah Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Micah chapter 2 — bozrah.jpg.",
      "thumb": "/visuals/micah/precept_bozrah.jpg",
      "full": "/visuals/micah/precept_bozrah.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bozrah.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-river",
      "title": "Precept Austin — Micah Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Micah chapter 4 — river.gif.",
      "thumb": "/visuals/micah/precept_river.gif",
      "full": "/visuals/micah/precept_river.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/river.gif"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-zeph-1",
      "title": "Precept Austin — Micah Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Micah chapter 4 — zeph-1.gif.",
      "thumb": "/visuals/micah/precept_zeph-1.gif",
      "full": "/visuals/micah/precept_zeph-1.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zeph-1.gif"
      },
      "chapters": [
        4
      ]
    }
  ]
},
  'nahum': {
  "videos": [
    {
      "youtubeId": "Y30DanA5EhU",
      "title": "Nahum — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/Y30DanA5EhU?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/nahum/",
      "chapterStart": 1,
      "chapterEnd": 3
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Nahum",
      "caption": "Hand-illustrated single-page overview of Nahum, tracing the book's literary design and major themes.",
      "thumb": "/visuals/nahum/bibleproject_poster.jpg",
      "full": "/visuals/nahum/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-nahum/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Nahum Bible Chart",
      "caption": "Single-page structural chart of Nahum, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/nahum/swindoll_chart.png",
      "full": "/visuals/nahum/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Nahum-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Nahum Chart",
      "caption": "Bruce Hurt's inductive-study chart for Nahum, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/nahum/precept_chart.png",
      "full": "/visuals/nahum/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/nah.png"
      }
    }
  ]
},
  'habakkuk': {
  "videos": [
    {
      "youtubeId": "OPMaRqGJPUU",
      "title": "Habakkuk — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/OPMaRqGJPUU?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/habakkuk/",
      "chapterStart": 1,
      "chapterEnd": 3
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Habakkuk",
      "caption": "Hand-illustrated single-page overview of Habakkuk, tracing the book's literary design and major themes.",
      "thumb": "/visuals/habakkuk/bibleproject_poster.jpg",
      "full": "/visuals/habakkuk/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-habakkuk/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Habakkuk Bible Chart",
      "caption": "Single-page structural chart of Habakkuk, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/habakkuk/swindoll_chart.png",
      "full": "/visuals/habakkuk/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Habakkuk-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Habakkuk Chart",
      "caption": "Bruce Hurt's inductive-study chart for Habakkuk, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/habakkuk/precept_chart.png",
      "full": "/visuals/habakkuk/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/habakkukchart.png"
      }
    },
    {
      "id": "precept-book-habakkukdipchart",
      "title": "Precept Austin — Habakkuk (habakkukdipchart.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Habakkuk chapters on Precept Austin's commentary.",
      "thumb": "/visuals/habakkuk/precept_habakkukdipchart.png",
      "full": "/visuals/habakkuk/precept_habakkukdipchart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/habakkukdipchart.png"
      }
    },
    {
      "id": "precept-book-zephaniahmap",
      "title": "Precept Austin — Habakkuk (zephaniahmap.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Habakkuk chapters on Precept Austin's commentary.",
      "thumb": "/visuals/habakkuk/precept_zephaniahmap.jpg",
      "full": "/visuals/habakkuk/precept_zephaniahmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zephaniahmap.jpg"
      }
    },
    {
      "id": "precept-book-hab",
      "title": "Precept Austin — Habakkuk (hab.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Habakkuk chapters on Precept Austin's commentary.",
      "thumb": "/visuals/habakkuk/precept_hab.png",
      "full": "/visuals/habakkuk/precept_hab.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hab.png"
      }
    },
    {
      "id": "precept-book-habakkuktime",
      "title": "Precept Austin — Habakkuk (habakkuktime.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Habakkuk chapters on Precept Austin's commentary.",
      "thumb": "/visuals/habakkuk/precept_habakkuktime.png",
      "full": "/visuals/habakkuk/precept_habakkuktime.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/habakkuktime.png"
      }
    },
    {
      "id": "precept-book-habakkukryrie",
      "title": "Precept Austin — Habakkuk (habakkukryrie.gif)",
      "caption": "Bruce Hurt's chart embedded across multiple Habakkuk chapters on Precept Austin's commentary.",
      "thumb": "/visuals/habakkuk/precept_habakkukryrie.gif",
      "full": "/visuals/habakkuk/precept_habakkukryrie.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/habakkukryrie.gif"
      }
    },
    {
      "id": "precept-book-prophetsofisrael",
      "title": "Precept Austin — Habakkuk (prophetsofisrael.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Habakkuk chapters on Precept Austin's commentary.",
      "thumb": "/visuals/habakkuk/precept_prophetsofisrael.jpg",
      "full": "/visuals/habakkuk/precept_prophetsofisrael.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/prophetsofisrael.jpg"
      }
    }
  ]
},
  'zephaniah': {
  "videos": [
    {
      "youtubeId": "oFZknKPNvz8",
      "title": "Zephaniah — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/oFZknKPNvz8?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/zephaniah/",
      "chapterStart": 1,
      "chapterEnd": 3
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Zephaniah",
      "caption": "Hand-illustrated single-page overview of Zephaniah, tracing the book's literary design and major themes.",
      "thumb": "/visuals/zephaniah/bibleproject_poster.jpg",
      "full": "/visuals/zephaniah/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-zephaniah/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Zephaniah Bible Chart",
      "caption": "Single-page structural chart of Zephaniah, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/zephaniah/swindoll_chart.png",
      "full": "/visuals/zephaniah/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Zephaniah-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Zephaniah Chart",
      "caption": "Bruce Hurt's inductive-study chart for Zephaniah, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/zephaniah/precept_chart.png",
      "full": "/visuals/zephaniah/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zephaniah.png"
      }
    },
    {
      "id": "precept-book-dolchart1",
      "title": "Precept Austin — Zephaniah (dolchart1.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Zephaniah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/zephaniah/precept_dolchart1.jpg",
      "full": "/visuals/zephaniah/precept_dolchart1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/DOLchart1.jpg"
      }
    },
    {
      "id": "precept-book-zephaniahmap",
      "title": "Precept Austin — Zephaniah (zephaniahmap.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Zephaniah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/zephaniah/precept_zephaniahmap.jpg",
      "full": "/visuals/zephaniah/precept_zephaniahmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zephaniahmap.jpg"
      }
    },
    {
      "id": "precept-book-zephaniah_setting",
      "title": "Precept Austin — Zephaniah (zephaniah_setting.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Zephaniah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/zephaniah/precept_zephaniah_setting.png",
      "full": "/visuals/zephaniah/precept_zephaniah_setting.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zephaniah_setting.png"
      }
    },
    {
      "id": "precept-book-prophetsofisrael",
      "title": "Precept Austin — Zephaniah (prophetsofisrael.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Zephaniah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/zephaniah/precept_prophetsofisrael.jpg",
      "full": "/visuals/zephaniah/precept_prophetsofisrael.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/prophetsofisrael.jpg"
      }
    },
    {
      "id": "precept-book-zeph1",
      "title": "Precept Austin — Zephaniah (zeph1.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Zephaniah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/zephaniah/precept_zeph1.jpg",
      "full": "/visuals/zephaniah/precept_zeph1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zeph1.jpg"
      }
    },
    {
      "id": "precept-book-zephdol",
      "title": "Precept Austin — Zephaniah (zephdol.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Zephaniah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/zephaniah/precept_zephdol.jpg",
      "full": "/visuals/zephaniah/precept_zephdol.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zephdol.jpg"
      }
    },
    {
      "id": "precept-book-zephsum",
      "title": "Precept Austin — Zephaniah (zephsum.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Zephaniah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/zephaniah/precept_zephsum.jpg",
      "full": "/visuals/zephaniah/precept_zephsum.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zephsum.jpg"
      }
    },
    {
      "id": "precept-ch-dolchart2",
      "title": "Precept Austin — Zephaniah Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Zephaniah chapter 2 — dolchart2.jpg.",
      "thumb": "/visuals/zephaniah/precept_dolchart2.jpg",
      "full": "/visuals/zephaniah/precept_dolchart2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/DOLchart2.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-jerusalemnehemiah1",
      "title": "Precept Austin — Zephaniah Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Zephaniah chapter 1 — jerusalemnehemiah1.png.",
      "thumb": "/visuals/zephaniah/precept_jerusalemnehemiah1.png",
      "full": "/visuals/zephaniah/precept_jerusalemnehemiah1.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jerusalemnehemiah1.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-joel3",
      "title": "Precept Austin — Zephaniah Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Zephaniah chapter 1 — joel3.jpg.",
      "thumb": "/visuals/zephaniah/precept_joel3.jpg",
      "full": "/visuals/zephaniah/precept_joel3.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/joel3.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-napthali",
      "title": "Precept Austin — Zephaniah Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Zephaniah chapter 2 — napthali.png.",
      "thumb": "/visuals/zephaniah/precept_napthali.png",
      "full": "/visuals/zephaniah/precept_napthali.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/napthali.png"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-zeph12summary",
      "title": "Precept Austin — Zephaniah Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Zephaniah chapter 2 — zeph12summary.jpg.",
      "thumb": "/visuals/zephaniah/precept_zeph12summary.jpg",
      "full": "/visuals/zephaniah/precept_zeph12summary.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zeph12summary.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-zeph28",
      "title": "Precept Austin — Zephaniah Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Zephaniah chapter 2 — zeph28.png.",
      "thumb": "/visuals/zephaniah/precept_zeph28.png",
      "full": "/visuals/zephaniah/precept_zeph28.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zeph28.png"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-zeph3sum",
      "title": "Precept Austin — Zephaniah Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Zephaniah chapter 3 — zeph3sum.jpg.",
      "thumb": "/visuals/zephaniah/precept_zeph3sum.jpg",
      "full": "/visuals/zephaniah/precept_zeph3sum.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zeph3sum.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-zephtime",
      "title": "Precept Austin — Zephaniah Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Zephaniah chapter 1 — zephtime.jpg.",
      "thumb": "/visuals/zephaniah/precept_zephtime.jpg",
      "full": "/visuals/zephaniah/precept_zephtime.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zephtime.jpg"
      },
      "chapters": [
        1
      ]
    }
  ]
},
  'haggai': {
  "videos": [
    {
      "youtubeId": "juPvv_xcX-U",
      "title": "Haggai — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/juPvv_xcX-U?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/haggai/",
      "chapterStart": 1,
      "chapterEnd": 2
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Haggai",
      "caption": "Hand-illustrated single-page overview of Haggai, tracing the book's literary design and major themes.",
      "thumb": "/visuals/haggai/bibleproject_poster.jpg",
      "full": "/visuals/haggai/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-haggai/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Haggai Bible Chart",
      "caption": "Single-page structural chart of Haggai, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/haggai/swindoll_chart.png",
      "full": "/visuals/haggai/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Haggai-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Haggai Chart",
      "caption": "Bruce Hurt's inductive-study chart for Haggai, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/haggai/precept_chart.png",
      "full": "/visuals/haggai/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/haggai.png"
      }
    }
  ]
},
  'zechariah': {
  "videos": [
    {
      "youtubeId": "_106IfO6Kc0",
      "title": "Zechariah — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/_106IfO6Kc0?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/zechariah/",
      "chapterStart": 1,
      "chapterEnd": 14
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Zechariah",
      "caption": "Hand-illustrated single-page overview of Zechariah, tracing the book's literary design and major themes.",
      "thumb": "/visuals/zechariah/bibleproject_poster.jpg",
      "full": "/visuals/zechariah/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-zechariah/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Zechariah Bible Chart",
      "caption": "Single-page structural chart of Zechariah, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/zechariah/swindoll_chart.png",
      "full": "/visuals/zechariah/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Zechariah-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-book-zechmap",
      "title": "Precept Austin — Zechariah (zechmap.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Zechariah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/zechariah/precept_zechmap.jpg",
      "full": "/visuals/zechariah/precept_zechmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zechmap.jpg"
      }
    },
    {
      "id": "precept-book-seven-feasts",
      "title": "Precept Austin — Zechariah (seven-feasts.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Zechariah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/zechariah/precept_seven-feasts.png",
      "full": "/visuals/zechariah/precept_seven-feasts.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/seven-feasts.png"
      }
    },
    {
      "id": "precept-book-zech",
      "title": "Precept Austin — Zechariah (zech.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Zechariah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/zechariah/precept_zech.png",
      "full": "/visuals/zechariah/precept_zech.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zech.png"
      }
    },
    {
      "id": "precept-book-zechtime",
      "title": "Precept Austin — Zechariah (zechtime.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Zechariah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/zechariah/precept_zechtime.png",
      "full": "/visuals/zechariah/precept_zechtime.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zechtime.png"
      }
    },
    {
      "id": "precept-book-prophetsofisrael",
      "title": "Precept Austin — Zechariah (prophetsofisrael.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Zechariah chapters on Precept Austin's commentary.",
      "thumb": "/visuals/zechariah/precept_prophetsofisrael.jpg",
      "full": "/visuals/zechariah/precept_prophetsofisrael.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/prophetsofisrael.jpg"
      }
    },
    {
      "id": "precept-ch-armageddon",
      "title": "Precept Austin — Zechariah Chapter 12",
      "caption": "Bruce Hurt's commentary chart for Zechariah chapter 12 — armageddon.jpg.",
      "thumb": "/visuals/zechariah/precept_armageddon.jpg",
      "full": "/visuals/zechariah/precept_armageddon.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Armageddon.jpg"
      },
      "chapters": [
        12
      ]
    },
    {
      "id": "precept-ch-dolho",
      "title": "Precept Austin — Zechariah Chapter 14",
      "caption": "Bruce Hurt's commentary chart for Zechariah chapter 14 — dolho.jpg.",
      "thumb": "/visuals/zechariah/precept_dolho.jpg",
      "full": "/visuals/zechariah/precept_dolho.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/dolho.jpg"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-dolsummary",
      "title": "Precept Austin — Zechariah Chapter 14",
      "caption": "Bruce Hurt's commentary chart for Zechariah chapter 14 — dolsummary.jpg.",
      "thumb": "/visuals/zechariah/precept_dolsummary.jpg",
      "full": "/visuals/zechariah/precept_dolsummary.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/dolsummary.jpg"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-millennium",
      "title": "Precept Austin — Zechariah Chapter 14",
      "caption": "Bruce Hurt's commentary chart for Zechariah chapter 14 — millennium.gif.",
      "thumb": "/visuals/zechariah/precept_millennium.gif",
      "full": "/visuals/zechariah/precept_millennium.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/millennium.gif"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-zech14chart",
      "title": "Precept Austin — Zechariah Chapter 14",
      "caption": "Bruce Hurt's commentary chart for Zechariah chapter 14 — zech14chart.jpg.",
      "thumb": "/visuals/zechariah/precept_zech14chart.jpg",
      "full": "/visuals/zechariah/precept_zech14chart.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zech14chart.jpg"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-zechluther",
      "title": "Precept Austin — Zechariah Chapter 14",
      "caption": "Bruce Hurt's commentary chart for Zechariah chapter 14 — zechluther.jpg.",
      "thumb": "/visuals/zechariah/precept_zechluther.jpg",
      "full": "/visuals/zechariah/precept_zechluther.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zechluther.jpg"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-zechtimeline",
      "title": "Precept Austin — Zechariah Chapter 14",
      "caption": "Bruce Hurt's commentary chart for Zechariah chapter 14 — zechtimeline.jpg.",
      "thumb": "/visuals/zechariah/precept_zechtimeline.jpg",
      "full": "/visuals/zechariah/precept_zechtimeline.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zechtimeline.jpg"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-zechwar",
      "title": "Precept Austin — Zechariah Chapter 14",
      "caption": "Bruce Hurt's commentary chart for Zechariah chapter 14 — zechwar.jpg.",
      "thumb": "/visuals/zechariah/precept_zechwar.jpg",
      "full": "/visuals/zechariah/precept_zechwar.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zechwar.jpg"
      },
      "chapters": [
        14
      ]
    }
  ]
},
  'malachi': {
  "videos": [
    {
      "youtubeId": "HPGShWZ4Jvk",
      "title": "Malachi — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/HPGShWZ4Jvk?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/malachi/",
      "chapterStart": 1,
      "chapterEnd": 4
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Malachi",
      "caption": "Hand-illustrated single-page overview of Malachi, tracing the book's literary design and major themes.",
      "thumb": "/visuals/malachi/bibleproject_poster.jpg",
      "full": "/visuals/malachi/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-malachi/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Malachi Bible Chart",
      "caption": "Single-page structural chart of Malachi, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/malachi/swindoll_chart.png",
      "full": "/visuals/malachi/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Malachi-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Malachi Chart",
      "caption": "Bruce Hurt's inductive-study chart for Malachi, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/malachi/precept_chart.png",
      "full": "/visuals/malachi/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/malachi.png"
      }
    },
    {
      "id": "precept-book-malachimap",
      "title": "Precept Austin — Malachi (malachimap.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Malachi chapters on Precept Austin's commentary.",
      "thumb": "/visuals/malachi/precept_malachimap.jpg",
      "full": "/visuals/malachi/precept_malachimap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/malachimap.jpg"
      }
    },
    {
      "id": "precept-book-dolsummary",
      "title": "Precept Austin — Malachi (dolsummary.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Malachi chapters on Precept Austin's commentary.",
      "thumb": "/visuals/malachi/precept_dolsummary.jpg",
      "full": "/visuals/malachi/precept_dolsummary.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/dolsummary.jpg"
      }
    },
    {
      "id": "precept-book-malachitime",
      "title": "Precept Austin — Malachi (malachitime.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Malachi chapters on Precept Austin's commentary.",
      "thumb": "/visuals/malachi/precept_malachitime.png",
      "full": "/visuals/malachi/precept_malachitime.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/malachitime.png"
      }
    },
    {
      "id": "precept-book-prophetsofisrael",
      "title": "Precept Austin — Malachi (prophetsofisrael.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Malachi chapters on Precept Austin's commentary.",
      "thumb": "/visuals/malachi/precept_prophetsofisrael.jpg",
      "full": "/visuals/malachi/precept_prophetsofisrael.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/prophetsofisrael.jpg"
      }
    }
  ]
},
  'matthew': {
  "videos": [
    {
      "youtubeId": "iriW0zX492c",
      "title": "Matthew 1–13 — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/iriW0zX492c?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/matthew/",
      "chapterStart": 1,
      "chapterEnd": 13
    },
    {
      "youtubeId": "VSVPCPK-Zf8",
      "title": "Matthew 14–28 — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/VSVPCPK-Zf8?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/matthew/",
      "chapterStart": 14,
      "chapterEnd": 28
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Matthew",
      "caption": "Hand-illustrated single-page overview of Matthew, tracing the book's literary design and major themes.",
      "thumb": "/visuals/matthew/bibleproject_poster.jpg",
      "full": "/visuals/matthew/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-matthew/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Matthew Bible Chart",
      "caption": "Single-page structural chart of Matthew, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/matthew/swindoll_chart.png",
      "full": "/visuals/matthew/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Matthew-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Matthew Chart",
      "caption": "Bruce Hurt's inductive-study chart for Matthew, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/matthew/precept_chart.png",
      "full": "/visuals/matthew/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/matthew.png"
      }
    },
    {
      "id": "precept-book-matthewtimeline",
      "title": "Precept Austin — Matthew (matthewtimeline.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Matthew chapters on Precept Austin's commentary.",
      "thumb": "/visuals/matthew/precept_matthewtimeline.jpg",
      "full": "/visuals/matthew/precept_matthewtimeline.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/matthewtimeline.jpg"
      }
    },
    {
      "id": "precept-book-matthew_life",
      "title": "Precept Austin — Matthew (matthew_life.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Matthew chapters on Precept Austin's commentary.",
      "thumb": "/visuals/matthew/precept_matthew_life.png",
      "full": "/visuals/matthew/precept_matthew_life.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/matthew_life.png"
      }
    },
    {
      "id": "precept-ch-baptist",
      "title": "Precept Austin — Matthew Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Matthew chapter 3 — baptist.jpg.",
      "thumb": "/visuals/matthew/precept_baptist.jpg",
      "full": "/visuals/matthew/precept_baptist.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/baptist.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-bethany",
      "title": "Precept Austin — Matthew Chapter 21",
      "caption": "Bruce Hurt's commentary chart for Matthew chapter 21 — bethany.jpg.",
      "thumb": "/visuals/matthew/precept_bethany.jpg",
      "full": "/visuals/matthew/precept_bethany.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bethany.jpg"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-bethphage",
      "title": "Precept Austin — Matthew Chapters 21, 26",
      "caption": "Bruce Hurt's commentary chart for Matthew chapters 21, 26 — bethphage.jpg.",
      "thumb": "/visuals/matthew/precept_bethphage.jpg",
      "full": "/visuals/matthew/precept_bethphage.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bethphage.jpg"
      },
      "chapters": [
        21,
        26
      ]
    },
    {
      "id": "precept-ch-bethsaida",
      "title": "Precept Austin — Matthew Chapters 11, 14",
      "caption": "Bruce Hurt's commentary chart for Matthew chapters 11, 14 — bethsaida.jpg.",
      "thumb": "/visuals/matthew/precept_bethsaida.jpg",
      "full": "/visuals/matthew/precept_bethsaida.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bethsaida.jpg"
      },
      "chapters": [
        11,
        14
      ]
    },
    {
      "id": "precept-ch-birth",
      "title": "Precept Austin — Matthew Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Matthew chapter 2 — birth.gif.",
      "thumb": "/visuals/matthew/precept_birth.gif",
      "full": "/visuals/matthew/precept_birth.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/birth.gif"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-caesareaphilippi",
      "title": "Precept Austin — Matthew Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Matthew chapter 16 — caesareaphilippi.jpg.",
      "thumb": "/visuals/matthew/precept_caesareaphilippi.jpg",
      "full": "/visuals/matthew/precept_caesareaphilippi.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/caesareaphilippi.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-capernaum",
      "title": "Precept Austin — Matthew Chapter 17",
      "caption": "Bruce Hurt's commentary chart for Matthew chapter 17 — capernaum.jpg.",
      "thumb": "/visuals/matthew/precept_capernaum.jpg",
      "full": "/visuals/matthew/precept_capernaum.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/capernaum.jpg"
      },
      "chapters": [
        17
      ]
    },
    {
      "id": "precept-ch-courtofgentiles",
      "title": "Precept Austin — Matthew Chapters 21–22",
      "caption": "Bruce Hurt's commentary chart for Matthew chapters 21–22 — courtofgentiles.jpg.",
      "thumb": "/visuals/matthew/precept_courtofgentiles.jpg",
      "full": "/visuals/matthew/precept_courtofgentiles.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/courtofgentiles.jpg"
      },
      "chapters": [
        21,
        22
      ]
    },
    {
      "id": "precept-ch-crossbeam",
      "title": "Precept Austin — Matthew Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Matthew chapter 27 — crossbeam.jpg.",
      "thumb": "/visuals/matthew/precept_crossbeam.jpg",
      "full": "/visuals/matthew/precept_crossbeam.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/crossbeam.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-decapolis",
      "title": "Precept Austin — Matthew Chapter 15",
      "caption": "Bruce Hurt's commentary chart for Matthew chapter 15 — decapolis.png.",
      "thumb": "/visuals/matthew/precept_decapolis.png",
      "full": "/visuals/matthew/precept_decapolis.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/decapolis.png"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-galilee",
      "title": "Precept Austin — Matthew Chapters 2, 3, 4, 26, 28",
      "caption": "Bruce Hurt's commentary chart for Matthew chapters 2, 3, 4, 26, 28 — galilee.png.",
      "thumb": "/visuals/matthew/precept_galilee.png",
      "full": "/visuals/matthew/precept_galilee.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/galilee.png"
      },
      "chapters": [
        2,
        3,
        4,
        26,
        28
      ]
    },
    {
      "id": "precept-ch-galileeministry",
      "title": "Precept Austin — Matthew Chapters 4, 8",
      "caption": "Bruce Hurt's commentary chart for Matthew chapters 4, 8 — galileeministry.jpg.",
      "thumb": "/visuals/matthew/precept_galileeministry.jpg",
      "full": "/visuals/matthew/precept_galileeministry.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/galileeministry.jpg"
      },
      "chapters": [
        4,
        8
      ]
    },
    {
      "id": "precept-ch-galileeministry1",
      "title": "Precept Austin — Matthew Chapter 17",
      "caption": "Bruce Hurt's commentary chart for Matthew chapter 17 — galileeministry1.jpg.",
      "thumb": "/visuals/matthew/precept_galileeministry1.jpg",
      "full": "/visuals/matthew/precept_galileeministry1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/galileeministry1.jpg"
      },
      "chapters": [
        17
      ]
    },
    {
      "id": "precept-ch-genneseret1",
      "title": "Precept Austin — Matthew Chapter 14",
      "caption": "Bruce Hurt's commentary chart for Matthew chapter 14 — genneseret1.jpg.",
      "thumb": "/visuals/matthew/precept_genneseret1.jpg",
      "full": "/visuals/matthew/precept_genneseret1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/genneseret1.jpg"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-godsplan",
      "title": "Precept Austin — Matthew Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Matthew chapter 10 — godsplan.jpg.",
      "thumb": "/visuals/matthew/precept_godsplan.jpg",
      "full": "/visuals/matthew/precept_godsplan.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/godsplan.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-golgotha",
      "title": "Precept Austin — Matthew Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Matthew chapter 27 — golgotha.jpg.",
      "thumb": "/visuals/matthew/precept_golgotha.jpg",
      "full": "/visuals/matthew/precept_golgotha.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/golgotha.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-jerusalemelevation2",
      "title": "Precept Austin — Matthew Chapter 20",
      "caption": "Bruce Hurt's commentary chart for Matthew chapter 20 — jerusalemelevation2.jpg.",
      "thumb": "/visuals/matthew/precept_jerusalemelevation2.jpg",
      "full": "/visuals/matthew/precept_jerusalemelevation2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jerusalemelevation2.jpg"
      },
      "chapters": [
        20
      ]
    },
    {
      "id": "precept-ch-jesusbirth",
      "title": "Precept Austin — Matthew Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Matthew chapter 2 — jesusbirth.jpg.",
      "thumb": "/visuals/matthew/precept_jesusbirth.jpg",
      "full": "/visuals/matthew/precept_jesusbirth.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jesusbirth.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-kog",
      "title": "Precept Austin — Matthew Chapters 10, 13, 21, 22, 25",
      "caption": "Bruce Hurt's commentary chart for Matthew chapters 10, 13, 21, 22, 25 — kog.jpg.",
      "thumb": "/visuals/matthew/precept_kog.jpg",
      "full": "/visuals/matthew/precept_kog.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/kog.jpg"
      },
      "chapters": [
        10,
        13,
        21,
        22,
        25
      ]
    },
    {
      "id": "precept-ch-luke14diningtable",
      "title": "Precept Austin — Matthew Chapters 9, 26",
      "caption": "Bruce Hurt's commentary chart for Matthew chapters 9, 26 — luke14diningtable.gif.",
      "thumb": "/visuals/matthew/precept_luke14diningtable.gif",
      "full": "/visuals/matthew/precept_luke14diningtable.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke14diningtable.GIF"
      },
      "chapters": [
        9,
        26
      ]
    },
    {
      "id": "precept-ch-magadan",
      "title": "Precept Austin — Matthew Chapter 15",
      "caption": "Bruce Hurt's commentary chart for Matthew chapter 15 — magadan.jpg.",
      "thumb": "/visuals/matthew/precept_magadan.jpg",
      "full": "/visuals/matthew/precept_magadan.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/magadan.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-mapjerusalem",
      "title": "Precept Austin — Matthew Chapters 26–27",
      "caption": "Bruce Hurt's commentary chart for Matthew chapters 26–27 — mapjerusalem.png.",
      "thumb": "/visuals/matthew/precept_mapjerusalem.png",
      "full": "/visuals/matthew/precept_mapjerusalem.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mapjerusalem.png"
      },
      "chapters": [
        26,
        27
      ]
    },
    {
      "id": "precept-ch-messianic",
      "title": "Precept Austin — Matthew Chapter 11",
      "caption": "Bruce Hurt's commentary chart for Matthew chapter 11 — messianic.jpg.",
      "thumb": "/visuals/matthew/precept_messianic.jpg",
      "full": "/visuals/matthew/precept_messianic.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/messianic.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-napthali",
      "title": "Precept Austin — Matthew Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Matthew chapter 4 — napthali.png.",
      "thumb": "/visuals/matthew/precept_napthali.png",
      "full": "/visuals/matthew/precept_napthali.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/napthali.png"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-sermon1",
      "title": "Precept Austin — Matthew Chapter 22",
      "caption": "Bruce Hurt's commentary chart for Matthew chapter 22 — sermon1.gif.",
      "thumb": "/visuals/matthew/precept_sermon1.gif",
      "full": "/visuals/matthew/precept_sermon1.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sermon1.gif"
      },
      "chapters": [
        22
      ]
    },
    {
      "id": "precept-ch-tetrarchmap",
      "title": "Precept Austin — Matthew Chapter 14",
      "caption": "Bruce Hurt's commentary chart for Matthew chapter 14 — tetrarchmap.png.",
      "thumb": "/visuals/matthew/precept_tetrarchmap.png",
      "full": "/visuals/matthew/precept_tetrarchmap.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/tetrarchmap.png"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-timegap2",
      "title": "Precept Austin — Matthew Chapter 11",
      "caption": "Bruce Hurt's commentary chart for Matthew chapter 11 — timegap2.jpg.",
      "thumb": "/visuals/matthew/precept_timegap2.jpg",
      "full": "/visuals/matthew/precept_timegap2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/timegap2.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-tyre",
      "title": "Precept Austin — Matthew Chapters 11, 15",
      "caption": "Bruce Hurt's commentary chart for Matthew chapters 11, 15 — tyre.jpg.",
      "thumb": "/visuals/matthew/precept_tyre.jpg",
      "full": "/visuals/matthew/precept_tyre.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/tyre.jpg"
      },
      "chapters": [
        11,
        15
      ]
    },
    {
      "id": "precept-ch-upperroom",
      "title": "Precept Austin — Matthew Chapter 26",
      "caption": "Bruce Hurt's commentary chart for Matthew chapter 26 — upperroom.jpg.",
      "thumb": "/visuals/matthew/precept_upperroom.jpg",
      "full": "/visuals/matthew/precept_upperroom.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/upperroom.jpg"
      },
      "chapters": [
        26
      ]
    },
    {
      "id": "precept-ch-zeph-1",
      "title": "Precept Austin — Matthew Chapter 22",
      "caption": "Bruce Hurt's commentary chart for Matthew chapter 22 — zeph-1.gif.",
      "thumb": "/visuals/matthew/precept_zeph-1.gif",
      "full": "/visuals/matthew/precept_zeph-1.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zeph-1.gif"
      },
      "chapters": [
        22
      ]
    }
  ]
},
  'mark': {
  "videos": [
    {
      "youtubeId": "HGHqu9-DtXk",
      "title": "Mark — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/HGHqu9-DtXk?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/mark/",
      "chapterStart": 1,
      "chapterEnd": 16
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Mark",
      "caption": "Hand-illustrated single-page overview of Mark, tracing the book's literary design and major themes.",
      "thumb": "/visuals/mark/bibleproject_poster.jpg",
      "full": "/visuals/mark/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-mark/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Mark Bible Chart",
      "caption": "Single-page structural chart of Mark, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/mark/swindoll_chart.png",
      "full": "/visuals/mark/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Mark-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-book-mark_overview",
      "title": "Precept Austin — Mark (mark_overview.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Mark chapters on Precept Austin's commentary.",
      "thumb": "/visuals/mark/precept_mark_overview.png",
      "full": "/visuals/mark/precept_mark_overview.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mark_overview.png"
      }
    },
    {
      "id": "precept-book-mark_life_of_christ",
      "title": "Precept Austin — Mark (mark_life_of_christ.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Mark chapters on Precept Austin's commentary.",
      "thumb": "/visuals/mark/precept_mark_life_of_christ.png",
      "full": "/visuals/mark/precept_mark_life_of_christ.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mark_life_of_christ.png"
      }
    },
    {
      "id": "precept-ch-appear",
      "title": "Precept Austin — Mark Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Mark chapter 16 — appear.jpg.",
      "thumb": "/visuals/mark/precept_appear.jpg",
      "full": "/visuals/mark/precept_appear.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/appear.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-baptist",
      "title": "Precept Austin — Mark Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Mark chapter 1 — baptist.jpg.",
      "thumb": "/visuals/mark/precept_baptist.jpg",
      "full": "/visuals/mark/precept_baptist.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/baptist.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-bethphage",
      "title": "Precept Austin — Mark Chapter 11",
      "caption": "Bruce Hurt's commentary chart for Mark chapter 11 — bethphage.jpg.",
      "thumb": "/visuals/mark/precept_bethphage.jpg",
      "full": "/visuals/mark/precept_bethphage.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bethphage.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-bethsaida",
      "title": "Precept Austin — Mark Chapters 6, 8",
      "caption": "Bruce Hurt's commentary chart for Mark chapters 6, 8 — bethsaida.jpg.",
      "thumb": "/visuals/mark/precept_bethsaida.jpg",
      "full": "/visuals/mark/precept_bethsaida.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bethsaida.jpg"
      },
      "chapters": [
        6,
        8
      ]
    },
    {
      "id": "precept-ch-caesareaphilippi",
      "title": "Precept Austin — Mark Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Mark chapter 8 — caesareaphilippi.jpg.",
      "thumb": "/visuals/mark/precept_caesareaphilippi.jpg",
      "full": "/visuals/mark/precept_caesareaphilippi.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/caesareaphilippi.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-capernaum",
      "title": "Precept Austin — Mark Chapter 9",
      "caption": "Bruce Hurt's commentary chart for Mark chapter 9 — capernaum.jpg.",
      "thumb": "/visuals/mark/precept_capernaum.jpg",
      "full": "/visuals/mark/precept_capernaum.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/capernaum.jpg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-courtofgentiles",
      "title": "Precept Austin — Mark Chapters 11–13",
      "caption": "Bruce Hurt's commentary chart for Mark chapters 11–13 — courtofgentiles.jpg.",
      "thumb": "/visuals/mark/precept_courtofgentiles.jpg",
      "full": "/visuals/mark/precept_courtofgentiles.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/courtofgentiles.jpg"
      },
      "chapters": [
        11,
        12,
        13
      ]
    },
    {
      "id": "precept-ch-crossbeam",
      "title": "Precept Austin — Mark Chapter 15",
      "caption": "Bruce Hurt's commentary chart for Mark chapter 15 — crossbeam.jpg.",
      "thumb": "/visuals/mark/precept_crossbeam.jpg",
      "full": "/visuals/mark/precept_crossbeam.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/crossbeam.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-decapolis",
      "title": "Precept Austin — Mark Chapters 5, 7, 8",
      "caption": "Bruce Hurt's commentary chart for Mark chapters 5, 7, 8 — decapolis.png.",
      "thumb": "/visuals/mark/precept_decapolis.png",
      "full": "/visuals/mark/precept_decapolis.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/decapolis.png"
      },
      "chapters": [
        5,
        7,
        8
      ]
    },
    {
      "id": "precept-ch-exodusglory",
      "title": "Precept Austin — Mark Chapter 9",
      "caption": "Bruce Hurt's commentary chart for Mark chapter 9 — exodusglory.jpg.",
      "thumb": "/visuals/mark/precept_exodusglory.jpg",
      "full": "/visuals/mark/precept_exodusglory.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusglory.jpg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-galilee",
      "title": "Precept Austin — Mark Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Mark chapter 1 — galilee.png.",
      "thumb": "/visuals/mark/precept_galilee.png",
      "full": "/visuals/mark/precept_galilee.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/galilee.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-galileeministry",
      "title": "Precept Austin — Mark Chapters 1, 4, 5",
      "caption": "Bruce Hurt's commentary chart for Mark chapters 1, 4, 5 — galileeministry.jpg.",
      "thumb": "/visuals/mark/precept_galileeministry.jpg",
      "full": "/visuals/mark/precept_galileeministry.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/galileeministry.jpg"
      },
      "chapters": [
        1,
        4,
        5
      ]
    },
    {
      "id": "precept-ch-genneseret1",
      "title": "Precept Austin — Mark Chapter 6",
      "caption": "Bruce Hurt's commentary chart for Mark chapter 6 — genneseret1.jpg.",
      "thumb": "/visuals/mark/precept_genneseret1.jpg",
      "full": "/visuals/mark/precept_genneseret1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/genneseret1.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-hermon",
      "title": "Precept Austin — Mark Chapter 9",
      "caption": "Bruce Hurt's commentary chart for Mark chapter 9 — hermon.jpg.",
      "thumb": "/visuals/mark/precept_hermon.jpg",
      "full": "/visuals/mark/precept_hermon.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hermon.jpg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-idumea",
      "title": "Precept Austin — Mark Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Mark chapter 3 — idumea.jpg.",
      "thumb": "/visuals/mark/precept_idumea.jpg",
      "full": "/visuals/mark/precept_idumea.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/idumea.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-jericho",
      "title": "Precept Austin — Mark Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Mark chapter 10 — jericho.jpg.",
      "thumb": "/visuals/mark/precept_jericho.jpg",
      "full": "/visuals/mark/precept_jericho.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jericho.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-jerusalemelevation2",
      "title": "Precept Austin — Mark Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Mark chapter 10 — jerusalemelevation2.jpg.",
      "thumb": "/visuals/mark/precept_jerusalemelevation2.jpg",
      "full": "/visuals/mark/precept_jerusalemelevation2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jerusalemelevation2.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-kog",
      "title": "Precept Austin — Mark Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Mark chapter 4 — kog.jpg.",
      "thumb": "/visuals/mark/precept_kog.jpg",
      "full": "/visuals/mark/precept_kog.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/kog.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-luke14diningtable",
      "title": "Precept Austin — Mark Chapters 2, 12, 14",
      "caption": "Bruce Hurt's commentary chart for Mark chapters 2, 12, 14 — luke14diningtable.gif.",
      "thumb": "/visuals/mark/precept_luke14diningtable.gif",
      "full": "/visuals/mark/precept_luke14diningtable.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke14diningtable.GIF"
      },
      "chapters": [
        2,
        12,
        14
      ]
    },
    {
      "id": "precept-ch-magadan",
      "title": "Precept Austin — Mark Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Mark chapter 8 — magadan.jpg.",
      "thumb": "/visuals/mark/precept_magadan.jpg",
      "full": "/visuals/mark/precept_magadan.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/magadan.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-mapjerusalem",
      "title": "Precept Austin — Mark Chapter 15",
      "caption": "Bruce Hurt's commentary chart for Mark chapter 15 — mapjerusalem.png.",
      "thumb": "/visuals/mark/precept_mapjerusalem.png",
      "full": "/visuals/mark/precept_mapjerusalem.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mapjerusalem.png"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-markmap",
      "title": "Precept Austin — Mark Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Mark chapter 1 — markmap.jpg.",
      "thumb": "/visuals/mark/precept_markmap.jpg",
      "full": "/visuals/mark/precept_markmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/markmap.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-nazareth",
      "title": "Precept Austin — Mark Chapter 6",
      "caption": "Bruce Hurt's commentary chart for Mark chapter 6 — nazareth.jpg.",
      "thumb": "/visuals/mark/precept_nazareth.jpg",
      "full": "/visuals/mark/precept_nazareth.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/nazareth.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-sea",
      "title": "Precept Austin — Mark Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Mark chapter 4 — sea.jpg.",
      "thumb": "/visuals/mark/precept_sea.jpg",
      "full": "/visuals/mark/precept_sea.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sea.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-tyre",
      "title": "Precept Austin — Mark Chapter 7",
      "caption": "Bruce Hurt's commentary chart for Mark chapter 7 — tyre.jpg.",
      "thumb": "/visuals/mark/precept_tyre.jpg",
      "full": "/visuals/mark/precept_tyre.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/tyre.jpg"
      },
      "chapters": [
        7
      ]
    }
  ]
},
  'luke': {
  "videos": [
    {
      "youtubeId": "XIb_dCIxzr0",
      "title": "Luke 1–9 — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/XIb_dCIxzr0?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/luke/",
      "chapterStart": 1,
      "chapterEnd": 9
    },
    {
      "youtubeId": "26z_KhwNdD8",
      "title": "Luke 10–24 — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/26z_KhwNdD8?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/luke/",
      "chapterStart": 10,
      "chapterEnd": 24
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Luke",
      "caption": "Hand-illustrated single-page overview of Luke, tracing the book's literary design and major themes.",
      "thumb": "/visuals/luke/bibleproject_poster.jpg",
      "full": "/visuals/luke/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-luke/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Luke Bible Chart",
      "caption": "Single-page structural chart of Luke, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/luke/swindoll_chart.png",
      "full": "/visuals/luke/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Luke-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-book-luke_genealogy",
      "title": "Precept Austin — Luke (luke_genealogy.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Luke chapters on Precept Austin's commentary.",
      "thumb": "/visuals/luke/precept_luke_genealogy.png",
      "full": "/visuals/luke/precept_luke_genealogy.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Luke_genealogy.png"
      }
    },
    {
      "id": "precept-book-luke_life_of_christ",
      "title": "Precept Austin — Luke (luke_life_of_christ.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Luke chapters on Precept Austin's commentary.",
      "thumb": "/visuals/luke/precept_luke_life_of_christ.png",
      "full": "/visuals/luke/precept_luke_life_of_christ.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke_life_of_christ.png"
      }
    },
    {
      "id": "precept-book-luke_son_of_man",
      "title": "Precept Austin — Luke (luke_son_of_man.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Luke chapters on Precept Austin's commentary.",
      "thumb": "/visuals/luke/precept_luke_son_of_man.png",
      "full": "/visuals/luke/precept_luke_son_of_man.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke_son_of_man.png"
      }
    },
    {
      "id": "precept-book-luketime",
      "title": "Precept Austin — Luke (luketime.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Luke chapters on Precept Austin's commentary.",
      "thumb": "/visuals/luke/precept_luketime.png",
      "full": "/visuals/luke/precept_luketime.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luketime.png"
      }
    },
    {
      "id": "precept-book-luke",
      "title": "Precept Austin — Luke (luke.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Luke chapters on Precept Austin's commentary.",
      "thumb": "/visuals/luke/precept_luke.jpg",
      "full": "/visuals/luke/precept_luke.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke.jpg"
      }
    },
    {
      "id": "precept-book-luketime",
      "title": "Precept Austin — Luke (luketime.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Luke chapters on Precept Austin's commentary.",
      "thumb": "/visuals/luke/precept_luketime.jpg",
      "full": "/visuals/luke/precept_luketime.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luketime.jpg"
      }
    },
    {
      "id": "precept-ch-alabaster",
      "title": "Precept Austin — Luke Chapter 7",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 7 — alabaster.jpg.",
      "thumb": "/visuals/luke/precept_alabaster.jpg",
      "full": "/visuals/luke/precept_alabaster.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/alabaster.jpg"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-appear",
      "title": "Precept Austin — Luke Chapter 24",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 24 — appear.jpg.",
      "thumb": "/visuals/luke/precept_appear.jpg",
      "full": "/visuals/luke/precept_appear.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/appear.jpg"
      },
      "chapters": [
        24
      ]
    },
    {
      "id": "precept-ch-baptist",
      "title": "Precept Austin — Luke Chapters 3–4",
      "caption": "Bruce Hurt's commentary chart for Luke chapters 3–4 — baptist.jpg.",
      "thumb": "/visuals/luke/precept_baptist.jpg",
      "full": "/visuals/luke/precept_baptist.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/baptist.jpg"
      },
      "chapters": [
        3,
        4
      ]
    },
    {
      "id": "precept-ch-bema",
      "title": "Precept Austin — Luke Chapter 19",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 19 — bema.jpg.",
      "thumb": "/visuals/luke/precept_bema.jpg",
      "full": "/visuals/luke/precept_bema.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bema.jpg"
      },
      "chapters": [
        19
      ]
    },
    {
      "id": "precept-ch-bethphage",
      "title": "Precept Austin — Luke Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 10 — bethphage.jpg.",
      "thumb": "/visuals/luke/precept_bethphage.jpg",
      "full": "/visuals/luke/precept_bethphage.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bethphage.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-bethsaida",
      "title": "Precept Austin — Luke Chapters 9–10",
      "caption": "Bruce Hurt's commentary chart for Luke chapters 9–10 — bethsaida.jpg.",
      "thumb": "/visuals/luke/precept_bethsaida.jpg",
      "full": "/visuals/luke/precept_bethsaida.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bethsaida.jpg"
      },
      "chapters": [
        9,
        10
      ]
    },
    {
      "id": "precept-ch-birth",
      "title": "Precept Austin — Luke Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 2 — birth.gif.",
      "thumb": "/visuals/luke/precept_birth.gif",
      "full": "/visuals/luke/precept_birth.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/birth.gif"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-blesschildren",
      "title": "Precept Austin — Luke Chapter 18",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 18 — blesschildren.jpg.",
      "thumb": "/visuals/luke/precept_blesschildren.jpg",
      "full": "/visuals/luke/precept_blesschildren.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/blesschildren.jpg"
      },
      "chapters": [
        18
      ]
    },
    {
      "id": "precept-ch-boatjesus",
      "title": "Precept Austin — Luke Chapters 5, 8",
      "caption": "Bruce Hurt's commentary chart for Luke chapters 5, 8 — boatjesus.jpg.",
      "thumb": "/visuals/luke/precept_boatjesus.jpg",
      "full": "/visuals/luke/precept_boatjesus.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/boatjesus.jpg"
      },
      "chapters": [
        5,
        8
      ]
    },
    {
      "id": "precept-ch-caesarmap",
      "title": "Precept Austin — Luke Chapters 2–3",
      "caption": "Bruce Hurt's commentary chart for Luke chapters 2–3 — caesarmap.jpg.",
      "thumb": "/visuals/luke/precept_caesarmap.jpg",
      "full": "/visuals/luke/precept_caesarmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/caesarmap.jpg"
      },
      "chapters": [
        2,
        3
      ]
    },
    {
      "id": "precept-ch-calen",
      "title": "Precept Austin — Luke Chapter 22",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 22 — calen.jpg.",
      "thumb": "/visuals/luke/precept_calen.jpg",
      "full": "/visuals/luke/precept_calen.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/calen.jpg"
      },
      "chapters": [
        22
      ]
    },
    {
      "id": "precept-ch-camel",
      "title": "Precept Austin — Luke Chapter 18",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 18 — camel.jpg.",
      "thumb": "/visuals/luke/precept_camel.jpg",
      "full": "/visuals/luke/precept_camel.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/camel.jpg"
      },
      "chapters": [
        18
      ]
    },
    {
      "id": "precept-ch-child",
      "title": "Precept Austin — Luke Chapter 9",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 9 — child.jpg.",
      "thumb": "/visuals/luke/precept_child.jpg",
      "full": "/visuals/luke/precept_child.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/child.jpg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-christ_gethsemane",
      "title": "Precept Austin — Luke Chapter 22",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 22 — christ_gethsemane.jpg.",
      "thumb": "/visuals/luke/precept_christ_gethsemane.jpg",
      "full": "/visuals/luke/precept_christ_gethsemane.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Christ_Gethsemane.jpg"
      },
      "chapters": [
        22
      ]
    },
    {
      "id": "precept-ch-circumcision",
      "title": "Precept Austin — Luke Chapters 1–2",
      "caption": "Bruce Hurt's commentary chart for Luke chapters 1–2 — circumcision.png.",
      "thumb": "/visuals/luke/precept_circumcision.png",
      "full": "/visuals/luke/precept_circumcision.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/CIRCUMCISION.png"
      },
      "chapters": [
        1,
        2
      ]
    },
    {
      "id": "precept-ch-cohn",
      "title": "Precept Austin — Luke Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 1 — cohn.jpg.",
      "thumb": "/visuals/luke/precept_cohn.jpg",
      "full": "/visuals/luke/precept_cohn.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/cohn.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-contempt",
      "title": "Precept Austin — Luke Chapter 18",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 18 — contempt.jpg.",
      "thumb": "/visuals/luke/precept_contempt.jpg",
      "full": "/visuals/luke/precept_contempt.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/contempt.jpg"
      },
      "chapters": [
        18
      ]
    },
    {
      "id": "precept-ch-courtofgentiles",
      "title": "Precept Austin — Luke Chapters 19–21",
      "caption": "Bruce Hurt's commentary chart for Luke chapters 19–21 — courtofgentiles.jpg.",
      "thumb": "/visuals/luke/precept_courtofgentiles.jpg",
      "full": "/visuals/luke/precept_courtofgentiles.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/courtofgentiles.jpg"
      },
      "chapters": [
        19,
        20,
        21
      ]
    },
    {
      "id": "precept-ch-crossbeam",
      "title": "Precept Austin — Luke Chapter 23",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 23 — crossbeam.jpg.",
      "thumb": "/visuals/luke/precept_crossbeam.jpg",
      "full": "/visuals/luke/precept_crossbeam.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/crossbeam.jpg"
      },
      "chapters": [
        23
      ]
    },
    {
      "id": "precept-ch-decapolis",
      "title": "Precept Austin — Luke Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 8 — decapolis.png.",
      "thumb": "/visuals/luke/precept_decapolis.png",
      "full": "/visuals/luke/precept_decapolis.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/decapolis.png"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-demon1",
      "title": "Precept Austin — Luke Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 4 — demon1.jpg.",
      "thumb": "/visuals/luke/precept_demon1.jpg",
      "full": "/visuals/luke/precept_demon1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/demon1.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-disciplessent",
      "title": "Precept Austin — Luke Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 10 — disciplessent.jpg.",
      "thumb": "/visuals/luke/precept_disciplessent.jpg",
      "full": "/visuals/luke/precept_disciplessent.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/disciplessent.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-earthquake",
      "title": "Precept Austin — Luke Chapter 21",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 21 — earthquake.png.",
      "thumb": "/visuals/luke/precept_earthquake.png",
      "full": "/visuals/luke/precept_earthquake.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/earthquake.png"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-eccl-sheol",
      "title": "Precept Austin — Luke Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 16 — eccl-sheol.png.",
      "thumb": "/visuals/luke/precept_eccl-sheol.png",
      "full": "/visuals/luke/precept_eccl-sheol.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/eccl-sheol.png"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-emmaus",
      "title": "Precept Austin — Luke Chapter 24",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 24 — emmaus.jpg.",
      "thumb": "/visuals/luke/precept_emmaus.jpg",
      "full": "/visuals/luke/precept_emmaus.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/emmaus.jpg"
      },
      "chapters": [
        24
      ]
    },
    {
      "id": "precept-ch-emmausmap",
      "title": "Precept Austin — Luke Chapter 24",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 24 — emmausmap.jpg.",
      "thumb": "/visuals/luke/precept_emmausmap.jpg",
      "full": "/visuals/luke/precept_emmausmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/emmausmap.jpg"
      },
      "chapters": [
        24
      ]
    },
    {
      "id": "precept-ch-emmaussupper",
      "title": "Precept Austin — Luke Chapter 24",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 24 — emmaussupper.jpg.",
      "thumb": "/visuals/luke/precept_emmaussupper.jpg",
      "full": "/visuals/luke/precept_emmaussupper.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/emmaussupper.jpg"
      },
      "chapters": [
        24
      ]
    },
    {
      "id": "precept-ch-engarde",
      "title": "Precept Austin — Luke Chapter 12",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 12 — engarde.png.",
      "thumb": "/visuals/luke/precept_engarde.png",
      "full": "/visuals/luke/precept_engarde.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/engarde.png"
      },
      "chapters": [
        12
      ]
    },
    {
      "id": "precept-ch-exodusglory",
      "title": "Precept Austin — Luke Chapter 9",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 9 — exodusglory.jpg.",
      "thumb": "/visuals/luke/precept_exodusglory.jpg",
      "full": "/visuals/luke/precept_exodusglory.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/exodusglory.jpg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-figtree",
      "title": "Precept Austin — Luke Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 13 — figtree.jpg.",
      "thumb": "/visuals/luke/precept_figtree.jpg",
      "full": "/visuals/luke/precept_figtree.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/figtree.jpg"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-galilee",
      "title": "Precept Austin — Luke Chapter 9",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 9 — galilee.png.",
      "thumb": "/visuals/luke/precept_galilee.png",
      "full": "/visuals/luke/precept_galilee.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/galilee.png"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-galileeministry",
      "title": "Precept Austin — Luke Chapters 7–8",
      "caption": "Bruce Hurt's commentary chart for Luke chapters 7–8 — galileeministry.jpg.",
      "thumb": "/visuals/luke/precept_galileeministry.jpg",
      "full": "/visuals/luke/precept_galileeministry.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/galileeministry.jpg"
      },
      "chapters": [
        7,
        8
      ]
    },
    {
      "id": "precept-ch-galileeministry1",
      "title": "Precept Austin — Luke Chapters 4–5",
      "caption": "Bruce Hurt's commentary chart for Luke chapters 4–5 — galileeministry1.jpg.",
      "thumb": "/visuals/luke/precept_galileeministry1.jpg",
      "full": "/visuals/luke/precept_galileeministry1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/galileeministry1.jpg"
      },
      "chapters": [
        4,
        5
      ]
    },
    {
      "id": "precept-ch-galileetojer",
      "title": "Precept Austin — Luke Chapter 17",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 17 — galileetojer.jpg.",
      "thumb": "/visuals/luke/precept_galileetojer.jpg",
      "full": "/visuals/luke/precept_galileetojer.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/galileetojer.jpg"
      },
      "chapters": [
        17
      ]
    },
    {
      "id": "precept-ch-gethsemane",
      "title": "Precept Austin — Luke Chapter 22",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 22 — gethsemane.jpg.",
      "thumb": "/visuals/luke/precept_gethsemane.jpg",
      "full": "/visuals/luke/precept_gethsemane.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gethsemane.jpg"
      },
      "chapters": [
        22
      ]
    },
    {
      "id": "precept-ch-girdloins",
      "title": "Precept Austin — Luke Chapter 12",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 12 — girdloins.jpg.",
      "thumb": "/visuals/luke/precept_girdloins.jpg",
      "full": "/visuals/luke/precept_girdloins.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/girdloins.jpg"
      },
      "chapters": [
        12
      ]
    },
    {
      "id": "precept-ch-goldengate",
      "title": "Precept Austin — Luke Chapter 19",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 19 — goldengate.jpg.",
      "thumb": "/visuals/luke/precept_goldengate.jpg",
      "full": "/visuals/luke/precept_goldengate.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/goldengate.jpg"
      },
      "chapters": [
        19
      ]
    },
    {
      "id": "precept-ch-golgotha",
      "title": "Precept Austin — Luke Chapter 23",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 23 — golgotha.jpg.",
      "thumb": "/visuals/luke/precept_golgotha.jpg",
      "full": "/visuals/luke/precept_golgotha.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/golgotha.jpg"
      },
      "chapters": [
        23
      ]
    },
    {
      "id": "precept-ch-goodsamaritan",
      "title": "Precept Austin — Luke Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 10 — goodsamaritan.jpg.",
      "thumb": "/visuals/luke/precept_goodsamaritan.jpg",
      "full": "/visuals/luke/precept_goodsamaritan.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/goodsamaritan.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-hair",
      "title": "Precept Austin — Luke Chapter 7",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 7 — hair.jpg.",
      "thumb": "/visuals/luke/precept_hair.jpg",
      "full": "/visuals/luke/precept_hair.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hair.jpg"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-harvest",
      "title": "Precept Austin — Luke Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 10 — harvest.jpg.",
      "thumb": "/visuals/luke/precept_harvest.jpg",
      "full": "/visuals/luke/precept_harvest.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/harvest.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-herodfamilytree",
      "title": "Precept Austin — Luke Chapters 1–3",
      "caption": "Bruce Hurt's commentary chart for Luke chapters 1–3 — herodfamilytree.jpg.",
      "thumb": "/visuals/luke/precept_herodfamilytree.jpg",
      "full": "/visuals/luke/precept_herodfamilytree.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/herodfamilytree.jpg"
      },
      "chapters": [
        1,
        2,
        3
      ]
    },
    {
      "id": "precept-ch-herodstemple",
      "title": "Precept Austin — Luke Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 1 — herodstemple.jpg.",
      "thumb": "/visuals/luke/precept_herodstemple.jpg",
      "full": "/visuals/luke/precept_herodstemple.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/herodstemple.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-hypocrite",
      "title": "Precept Austin — Luke Chapter 12",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 12 — hypocrite.jpg.",
      "thumb": "/visuals/luke/precept_hypocrite.jpg",
      "full": "/visuals/luke/precept_hypocrite.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hypocrite.jpg"
      },
      "chapters": [
        12
      ]
    },
    {
      "id": "precept-ch-infant",
      "title": "Precept Austin — Luke Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 2 — infant.jpg.",
      "thumb": "/visuals/luke/precept_infant.jpg",
      "full": "/visuals/luke/precept_infant.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/infant.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-infantadoration",
      "title": "Precept Austin — Luke Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 2 — infantadoration.jpg.",
      "thumb": "/visuals/luke/precept_infantadoration.jpg",
      "full": "/visuals/luke/precept_infantadoration.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/infantadoration.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-isaiahscroll",
      "title": "Precept Austin — Luke Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 4 — isaiahscroll.jpg.",
      "thumb": "/visuals/luke/precept_isaiahscroll.jpg",
      "full": "/visuals/luke/precept_isaiahscroll.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/isaiahscroll.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-israelmap",
      "title": "Precept Austin — Luke Chapters 1, 10, 13",
      "caption": "Bruce Hurt's commentary chart for Luke chapters 1, 10, 13 — israelmap.png.",
      "thumb": "/visuals/luke/precept_israelmap.png",
      "full": "/visuals/luke/precept_israelmap.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/israelmap.png"
      },
      "chapters": [
        1,
        10,
        13
      ]
    },
    {
      "id": "precept-ch-jairus",
      "title": "Precept Austin — Luke Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 8 — jairus.jpg.",
      "thumb": "/visuals/luke/precept_jairus.jpg",
      "full": "/visuals/luke/precept_jairus.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jairus.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-jericho1",
      "title": "Precept Austin — Luke Chapter 19",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 19 — jericho1.jpg.",
      "thumb": "/visuals/luke/precept_jericho1.jpg",
      "full": "/visuals/luke/precept_jericho1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jericho1.jpg"
      },
      "chapters": [
        19
      ]
    },
    {
      "id": "precept-ch-jerusalemesv1",
      "title": "Precept Austin — Luke Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 2 — jerusalemesv1.jpg.",
      "thumb": "/visuals/luke/precept_jerusalemesv1.jpg",
      "full": "/visuals/luke/precept_jerusalemesv1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jerusalemesv1.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-jesusauthority",
      "title": "Precept Austin — Luke Chapter 20",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 20 — jesusauthority.jpg.",
      "thumb": "/visuals/luke/precept_jesusauthority.jpg",
      "full": "/visuals/luke/precept_jesusauthority.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jesusauthority.jpg"
      },
      "chapters": [
        20
      ]
    },
    {
      "id": "precept-ch-jesusboy",
      "title": "Precept Austin — Luke Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 2 — jesusboy.jpg.",
      "thumb": "/visuals/luke/precept_jesusboy.jpg",
      "full": "/visuals/luke/precept_jesusboy.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jesusboy.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-jesusmocked",
      "title": "Precept Austin — Luke Chapter 22",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 22 — jesusmocked.jpg.",
      "thumb": "/visuals/luke/precept_jesusmocked.jpg",
      "full": "/visuals/luke/precept_jesusmocked.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jesusmocked.jpg"
      },
      "chapters": [
        22
      ]
    },
    {
      "id": "precept-ch-johnb",
      "title": "Precept Austin — Luke Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 3 — johnb.jpg.",
      "thumb": "/visuals/luke/precept_johnb.jpg",
      "full": "/visuals/luke/precept_johnb.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/johnb.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-johnbaptist",
      "title": "Precept Austin — Luke Chapter 20",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 20 — johnbaptist.jpg.",
      "thumb": "/visuals/luke/precept_johnbaptist.jpg",
      "full": "/visuals/luke/precept_johnbaptist.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/johnbaptist.jpg"
      },
      "chapters": [
        20
      ]
    },
    {
      "id": "precept-ch-jonah",
      "title": "Precept Austin — Luke Chapter 11",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 11 — jonah.jpg.",
      "thumb": "/visuals/luke/precept_jonah.jpg",
      "full": "/visuals/luke/precept_jonah.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jonah.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-jonahnin",
      "title": "Precept Austin — Luke Chapter 11",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 11 — jonahnin.webp.",
      "thumb": "/visuals/luke/precept_jonahnin.png",
      "full": "/visuals/luke/precept_jonahnin.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jonahnin.webp"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-kog",
      "title": "Precept Austin — Luke Chapters 4, 6, 9, 10, 13, 17",
      "caption": "Bruce Hurt's commentary chart for Luke chapters 4, 6, 9, 10, 13, 17 — kog.jpg.",
      "thumb": "/visuals/luke/precept_kog.jpg",
      "full": "/visuals/luke/precept_kog.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/kog.jpg"
      },
      "chapters": [
        4,
        6,
        9,
        10,
        13,
        17
      ]
    },
    {
      "id": "precept-ch-lamb_of_god_passover",
      "title": "Precept Austin — Luke Chapter 22",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 22 — lamb of god passover.gif.",
      "thumb": "/visuals/luke/precept_lamb_of_god_passover.gif",
      "full": "/visuals/luke/precept_lamb_of_god_passover.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/lamb of God passover.gif"
      },
      "chapters": [
        22
      ]
    },
    {
      "id": "precept-ch-lamp",
      "title": "Precept Austin — Luke Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 8 — lamp.jpg.",
      "thumb": "/visuals/luke/precept_lamp.jpg",
      "full": "/visuals/luke/precept_lamp.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/lamp.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-lawyer",
      "title": "Precept Austin — Luke Chapter 11",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 11 — lawyer.jpg.",
      "thumb": "/visuals/luke/precept_lawyer.jpg",
      "full": "/visuals/luke/precept_lawyer.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/lawyer.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-leprosy",
      "title": "Precept Austin — Luke Chapter 5",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 5 — leprosy.jpg.",
      "thumb": "/visuals/luke/precept_leprosy.jpg",
      "full": "/visuals/luke/precept_leprosy.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/leprosy.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-liberty",
      "title": "Precept Austin — Luke Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 4 — liberty.jpg.",
      "thumb": "/visuals/luke/precept_liberty.jpg",
      "full": "/visuals/luke/precept_liberty.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/liberty.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-lilies",
      "title": "Precept Austin — Luke Chapter 12",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 12 — lilies.jpg.",
      "thumb": "/visuals/luke/precept_lilies.jpg",
      "full": "/visuals/luke/precept_lilies.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/lilies.jpg"
      },
      "chapters": [
        12
      ]
    },
    {
      "id": "precept-ch-loaves",
      "title": "Precept Austin — Luke Chapter 9",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 9 — loaves.jpg.",
      "thumb": "/visuals/luke/precept_loaves.jpg",
      "full": "/visuals/luke/precept_loaves.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/loaves.jpg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-lordsprayer",
      "title": "Precept Austin — Luke Chapter 11",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 11 — lordsprayer.jpg.",
      "thumb": "/visuals/luke/precept_lordsprayer.jpg",
      "full": "/visuals/luke/precept_lordsprayer.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/lordsprayer.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-luke13healing",
      "title": "Precept Austin — Luke Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 13 — luke13healing.jpg.",
      "thumb": "/visuals/luke/precept_luke13healing.jpg",
      "full": "/visuals/luke/precept_luke13healing.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke13healing.jpg"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-luke13narrowdoor",
      "title": "Precept Austin — Luke Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 13 — luke13narrowdoor.jpg.",
      "thumb": "/visuals/luke/precept_luke13narrowdoor.jpg",
      "full": "/visuals/luke/precept_luke13narrowdoor.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke13narrowdoor.jpg"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-luke1428",
      "title": "Precept Austin — Luke Chapter 14",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 14 — luke1428.jpg.",
      "thumb": "/visuals/luke/precept_luke1428.jpg",
      "full": "/visuals/luke/precept_luke1428.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke1428.jpg"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-luke14cross",
      "title": "Precept Austin — Luke Chapter 14",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 14 — luke14cross.jpg.",
      "thumb": "/visuals/luke/precept_luke14cross.jpg",
      "full": "/visuals/luke/precept_luke14cross.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke14cross.jpg"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-luke14diningtable",
      "title": "Precept Austin — Luke Chapters 5, 7, 14",
      "caption": "Bruce Hurt's commentary chart for Luke chapters 5, 7, 14 — luke14diningtable.gif.",
      "thumb": "/visuals/luke/precept_luke14diningtable.gif",
      "full": "/visuals/luke/precept_luke14diningtable.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke14diningtable.GIF"
      },
      "chapters": [
        5,
        7,
        14
      ]
    },
    {
      "id": "precept-ch-luke14follow",
      "title": "Precept Austin — Luke Chapter 14",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 14 — luke14follow.jpg.",
      "thumb": "/visuals/luke/precept_luke14follow.jpg",
      "full": "/visuals/luke/precept_luke14follow.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke14follow.jpg"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-luke14salt",
      "title": "Precept Austin — Luke Chapter 14",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 14 — luke14salt.jpg.",
      "thumb": "/visuals/luke/precept_luke14salt.jpg",
      "full": "/visuals/luke/precept_luke14salt.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke14salt.jpg"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-luke15carob",
      "title": "Precept Austin — Luke Chapter 15",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 15 — luke15carob.jpg.",
      "thumb": "/visuals/luke/precept_luke15carob.jpg",
      "full": "/visuals/luke/precept_luke15carob.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke15carob.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-luke15carry",
      "title": "Precept Austin — Luke Chapter 15",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 15 — luke15carry.jpg.",
      "thumb": "/visuals/luke/precept_luke15carry.jpg",
      "full": "/visuals/luke/precept_luke15carry.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke15carry.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-luke15coin",
      "title": "Precept Austin — Luke Chapter 15",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 15 — luke15coin.jpg.",
      "thumb": "/visuals/luke/precept_luke15coin.jpg",
      "full": "/visuals/luke/precept_luke15coin.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke15coin.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-luke15coin1",
      "title": "Precept Austin — Luke Chapter 15",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 15 — luke15coin1.jpg.",
      "thumb": "/visuals/luke/precept_luke15coin1.jpg",
      "full": "/visuals/luke/precept_luke15coin1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke15coin1.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-luke15return",
      "title": "Precept Austin — Luke Chapter 15",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 15 — luke15return.jpg.",
      "thumb": "/visuals/luke/precept_luke15return.jpg",
      "full": "/visuals/luke/precept_luke15return.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke15return.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-luke15squander",
      "title": "Precept Austin — Luke Chapter 15",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 15 — luke15squander.jpg.",
      "thumb": "/visuals/luke/precept_luke15squander.jpg",
      "full": "/visuals/luke/precept_luke15squander.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke15squander.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-luke15swine",
      "title": "Precept Austin — Luke Chapter 15",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 15 — luke15swine.jpg.",
      "thumb": "/visuals/luke/precept_luke15swine.jpg",
      "full": "/visuals/luke/precept_luke15swine.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke15swine.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-luke16",
      "title": "Precept Austin — Luke Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 16 — luke16.jpg.",
      "thumb": "/visuals/luke/precept_luke16.jpg",
      "full": "/visuals/luke/precept_luke16.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke16.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-luke16coin",
      "title": "Precept Austin — Luke Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 16 — luke16coin.png.",
      "thumb": "/visuals/luke/precept_luke16coin.png",
      "full": "/visuals/luke/precept_luke16coin.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke16coin.png"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-luke16hell",
      "title": "Precept Austin — Luke Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 16 — luke16hell.png.",
      "thumb": "/visuals/luke/precept_luke16hell.png",
      "full": "/visuals/luke/precept_luke16hell.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke16hell.png"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-luke16lazarus",
      "title": "Precept Austin — Luke Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 16 — luke16lazarus.jpg.",
      "thumb": "/visuals/luke/precept_luke16lazarus.jpg",
      "full": "/visuals/luke/precept_luke16lazarus.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke16lazarus.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-luke16mammon",
      "title": "Precept Austin — Luke Chapters 6, 16",
      "caption": "Bruce Hurt's commentary chart for Luke chapters 6, 16 — luke16mammon.jpg.",
      "thumb": "/visuals/luke/precept_luke16mammon.jpg",
      "full": "/visuals/luke/precept_luke16mammon.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke16mammon.jpg"
      },
      "chapters": [
        6,
        16
      ]
    },
    {
      "id": "precept-ch-luke17",
      "title": "Precept Austin — Luke Chapter 17",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 17 — luke17.jpg.",
      "thumb": "/visuals/luke/precept_luke17.jpg",
      "full": "/visuals/luke/precept_luke17.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke17.jpg"
      },
      "chapters": [
        17
      ]
    },
    {
      "id": "precept-ch-luke171aa",
      "title": "Precept Austin — Luke Chapter 17",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 17 — luke171aa.jpg.",
      "thumb": "/visuals/luke/precept_luke171aa.jpg",
      "full": "/visuals/luke/precept_luke171aa.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke171aa.jpg"
      },
      "chapters": [
        17
      ]
    },
    {
      "id": "precept-ch-luke172",
      "title": "Precept Austin — Luke Chapter 17",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 17 — luke172.jpg.",
      "thumb": "/visuals/luke/precept_luke172.jpg",
      "full": "/visuals/luke/precept_luke172.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke172.jpg"
      },
      "chapters": [
        17
      ]
    },
    {
      "id": "precept-ch-luke181",
      "title": "Precept Austin — Luke Chapter 18",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 18 — luke181.jpg.",
      "thumb": "/visuals/luke/precept_luke181.jpg",
      "full": "/visuals/luke/precept_luke181.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke181.jpg"
      },
      "chapters": [
        18
      ]
    },
    {
      "id": "precept-ch-luke182",
      "title": "Precept Austin — Luke Chapter 18",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 18 — luke182.jpg.",
      "thumb": "/visuals/luke/precept_luke182.jpg",
      "full": "/visuals/luke/precept_luke182.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Luke182.jpg"
      },
      "chapters": [
        18
      ]
    },
    {
      "id": "precept-ch-luke183",
      "title": "Precept Austin — Luke Chapter 18",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 18 — luke183.jpg.",
      "thumb": "/visuals/luke/precept_luke183.jpg",
      "full": "/visuals/luke/precept_luke183.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Luke183.jpg"
      },
      "chapters": [
        18
      ]
    },
    {
      "id": "precept-ch-luke184",
      "title": "Precept Austin — Luke Chapter 18",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 18 — luke184.jpg.",
      "thumb": "/visuals/luke/precept_luke184.jpg",
      "full": "/visuals/luke/precept_luke184.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Luke184.jpg"
      },
      "chapters": [
        18
      ]
    },
    {
      "id": "precept-ch-luke191",
      "title": "Precept Austin — Luke Chapter 19",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 19 — luke191.jpg.",
      "thumb": "/visuals/luke/precept_luke191.jpg",
      "full": "/visuals/luke/precept_luke191.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Luke191.jpg"
      },
      "chapters": [
        19
      ]
    },
    {
      "id": "precept-ch-luke192",
      "title": "Precept Austin — Luke Chapter 19",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 19 — luke192.jpg.",
      "thumb": "/visuals/luke/precept_luke192.jpg",
      "full": "/visuals/luke/precept_luke192.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Luke192.jpg"
      },
      "chapters": [
        19
      ]
    },
    {
      "id": "precept-ch-luke193",
      "title": "Precept Austin — Luke Chapter 19",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 19 — luke193.jpg.",
      "thumb": "/visuals/luke/precept_luke193.jpg",
      "full": "/visuals/luke/precept_luke193.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Luke193.jpg"
      },
      "chapters": [
        19
      ]
    },
    {
      "id": "precept-ch-luke194",
      "title": "Precept Austin — Luke Chapter 19",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 19 — luke194.jpg.",
      "thumb": "/visuals/luke/precept_luke194.jpg",
      "full": "/visuals/luke/precept_luke194.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Luke194.jpg"
      },
      "chapters": [
        19
      ]
    },
    {
      "id": "precept-ch-luke1vision",
      "title": "Precept Austin — Luke Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 1 — luke1vision.jpg.",
      "thumb": "/visuals/luke/precept_luke1vision.jpg",
      "full": "/visuals/luke/precept_luke1vision.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke1vision.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-luke201",
      "title": "Precept Austin — Luke Chapter 20",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 20 — luke201.jpg.",
      "thumb": "/visuals/luke/precept_luke201.jpg",
      "full": "/visuals/luke/precept_luke201.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Luke201.jpg"
      },
      "chapters": [
        20
      ]
    },
    {
      "id": "precept-ch-luke202",
      "title": "Precept Austin — Luke Chapter 20",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 20 — luke202.jpg.",
      "thumb": "/visuals/luke/precept_luke202.jpg",
      "full": "/visuals/luke/precept_luke202.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Luke202.jpg"
      },
      "chapters": [
        20
      ]
    },
    {
      "id": "precept-ch-luke203",
      "title": "Precept Austin — Luke Chapter 20",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 20 — luke203.jpg.",
      "thumb": "/visuals/luke/precept_luke203.jpg",
      "full": "/visuals/luke/precept_luke203.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Luke203.jpg"
      },
      "chapters": [
        20
      ]
    },
    {
      "id": "precept-ch-luke5housetop",
      "title": "Precept Austin — Luke Chapter 5",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 5 — luke5housetop.jpg.",
      "thumb": "/visuals/luke/precept_luke5housetop.jpg",
      "full": "/visuals/luke/precept_luke5housetop.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke5housetop.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-luke5levi2",
      "title": "Precept Austin — Luke Chapter 5",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 5 — luke5levi2.jpg.",
      "thumb": "/visuals/luke/precept_luke5levi2.jpg",
      "full": "/visuals/luke/precept_luke5levi2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke5levi2.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-luke_genealogy",
      "title": "Precept Austin — Luke Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 3 — luke_genealogy.png.",
      "thumb": "/visuals/luke/precept_luke_genealogy.png",
      "full": "/visuals/luke/precept_luke_genealogy.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Luke_genealogy.png"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-luketimeesv",
      "title": "Precept Austin — Luke Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 1 — luketimeesv.jpg.",
      "thumb": "/visuals/luke/precept_luketimeesv.jpg",
      "full": "/visuals/luke/precept_luketimeesv.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luketimeesv.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-mapjerusalem",
      "title": "Precept Austin — Luke Chapter 23",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 23 — mapjerusalem.png.",
      "thumb": "/visuals/luke/precept_mapjerusalem.png",
      "full": "/visuals/luke/precept_mapjerusalem.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mapjerusalem.png"
      },
      "chapters": [
        23
      ]
    },
    {
      "id": "precept-ch-mark_life_of_christ",
      "title": "Precept Austin — Luke Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 4 — mark_life_of_christ.png.",
      "thumb": "/visuals/luke/precept_mark_life_of_christ.png",
      "full": "/visuals/luke/precept_mark_life_of_christ.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mark_life_of_christ.png"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-mary",
      "title": "Precept Austin — Luke Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 1 — mary.jpg.",
      "thumb": "/visuals/luke/precept_mary.jpg",
      "full": "/visuals/luke/precept_mary.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mary.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-maryelizabeth",
      "title": "Precept Austin — Luke Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 1 — maryelizabeth.jpg.",
      "thumb": "/visuals/luke/precept_maryelizabeth.jpg",
      "full": "/visuals/luke/precept_maryelizabeth.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/maryelizabeth.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-marymartha",
      "title": "Precept Austin — Luke Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 10 — marymartha.jpg.",
      "thumb": "/visuals/luke/precept_marymartha.jpg",
      "full": "/visuals/luke/precept_marymartha.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/marymartha.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-marymartha1",
      "title": "Precept Austin — Luke Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 10 — marymartha1.jpg.",
      "thumb": "/visuals/luke/precept_marymartha1.jpg",
      "full": "/visuals/luke/precept_marymartha1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/marymartha1.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-marymartha2",
      "title": "Precept Austin — Luke Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 10 — marymartha2.jpg.",
      "thumb": "/visuals/luke/precept_marymartha2.jpg",
      "full": "/visuals/luke/precept_marymartha2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/marymartha2.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-matthew7narrowgate",
      "title": "Precept Austin — Luke Chapter 18",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 18 — matthew7narrowgate.jpg.",
      "thumb": "/visuals/luke/precept_matthew7narrowgate.jpg",
      "full": "/visuals/luke/precept_matthew7narrowgate.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/matthew7narrowgate.jpg"
      },
      "chapters": [
        18
      ]
    },
    {
      "id": "precept-ch-moneychangers",
      "title": "Precept Austin — Luke Chapter 19",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 19 — moneychangers.jpg.",
      "thumb": "/visuals/luke/precept_moneychangers.jpg",
      "full": "/visuals/luke/precept_moneychangers.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/moneychangers.jpg"
      },
      "chapters": [
        19
      ]
    },
    {
      "id": "precept-ch-mote",
      "title": "Precept Austin — Luke Chapter 6",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 6 — mote.jpg.",
      "thumb": "/visuals/luke/precept_mote.jpg",
      "full": "/visuals/luke/precept_mote.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mote.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-mute",
      "title": "Precept Austin — Luke Chapter 11",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 11 — mute.jpg.",
      "thumb": "/visuals/luke/precept_mute.jpg",
      "full": "/visuals/luke/precept_mute.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mute.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-nain",
      "title": "Precept Austin — Luke Chapter 7",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 7 — nain.jpg.",
      "thumb": "/visuals/luke/precept_nain.jpg",
      "full": "/visuals/luke/precept_nain.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/nain.jpg"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-nazarethcliff",
      "title": "Precept Austin — Luke Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 4 — nazarethcliff.jpg.",
      "thumb": "/visuals/luke/precept_nazarethcliff.jpg",
      "full": "/visuals/luke/precept_nazarethcliff.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/nazarethcliff.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-nazarethtohillcountry",
      "title": "Precept Austin — Luke Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 1 — nazarethtohillcountry.jpg.",
      "thumb": "/visuals/luke/precept_nazarethtohillcountry.jpg",
      "full": "/visuals/luke/precept_nazarethtohillcountry.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/nazarethtohillcountry.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-nero",
      "title": "Precept Austin — Luke Chapter 21",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 21 — nero.jpg.",
      "thumb": "/visuals/luke/precept_nero.jpg",
      "full": "/visuals/luke/precept_nero.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/nero.jpg"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-olives",
      "title": "Precept Austin — Luke Chapter 22",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 22 — olives.jpg.",
      "thumb": "/visuals/luke/precept_olives.jpg",
      "full": "/visuals/luke/precept_olives.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/olives.jpg"
      },
      "chapters": [
        22
      ]
    },
    {
      "id": "precept-ch-palm",
      "title": "Precept Austin — Luke Chapter 19",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 19 — palm.jpg.",
      "thumb": "/visuals/luke/precept_palm.jpg",
      "full": "/visuals/luke/precept_palm.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/palm.jpg"
      },
      "chapters": [
        19
      ]
    },
    {
      "id": "precept-ch-passionweek",
      "title": "Precept Austin — Luke Chapter 20",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 20 — passionweek.png.",
      "thumb": "/visuals/luke/precept_passionweek.png",
      "full": "/visuals/luke/precept_passionweek.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/passionweek.png"
      },
      "chapters": [
        20
      ]
    },
    {
      "id": "precept-ch-perhapstoday",
      "title": "Precept Austin — Luke Chapters 19, 21",
      "caption": "Bruce Hurt's commentary chart for Luke chapters 19, 21 — perhapstoday.jpg.",
      "thumb": "/visuals/luke/precept_perhapstoday.jpg",
      "full": "/visuals/luke/precept_perhapstoday.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/perhapstoday.jpg"
      },
      "chapters": [
        19,
        21
      ]
    },
    {
      "id": "precept-ch-petershouse",
      "title": "Precept Austin — Luke Chapter 7",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 7 — petershouse.jpg.",
      "thumb": "/visuals/luke/precept_petershouse.jpg",
      "full": "/visuals/luke/precept_petershouse.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/petershouse.jpg"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-petershouseaerialview",
      "title": "Precept Austin — Luke Chapters 5, 7",
      "caption": "Bruce Hurt's commentary chart for Luke chapters 5, 7 — petershouseaerialview.jpg.",
      "thumb": "/visuals/luke/precept_petershouseaerialview.jpg",
      "full": "/visuals/luke/precept_petershouseaerialview.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/petershouseaerialview.jpg"
      },
      "chapters": [
        5,
        7
      ]
    },
    {
      "id": "precept-ch-pharisee",
      "title": "Precept Austin — Luke Chapter 18",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 18 — pharisee.jpg.",
      "thumb": "/visuals/luke/precept_pharisee.jpg",
      "full": "/visuals/luke/precept_pharisee.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/pharisee.jpg"
      },
      "chapters": [
        18
      ]
    },
    {
      "id": "precept-ch-pilatestone",
      "title": "Precept Austin — Luke Chapter 23",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 23 — pilatestone.jpg.",
      "thumb": "/visuals/luke/precept_pilatestone.jpg",
      "full": "/visuals/luke/precept_pilatestone.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/pilatestone.JPG"
      },
      "chapters": [
        23
      ]
    },
    {
      "id": "precept-ch-prodigal",
      "title": "Precept Austin — Luke Chapter 15",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 15 — prodigal.png.",
      "thumb": "/visuals/luke/precept_prodigal.png",
      "full": "/visuals/luke/precept_prodigal.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/prodigal.png"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-progrev",
      "title": "Precept Austin — Luke Chapter 20",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 20 — progrev.jpg.",
      "thumb": "/visuals/luke/precept_progrev.jpg",
      "full": "/visuals/luke/precept_progrev.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/progrev.jpg"
      },
      "chapters": [
        20
      ]
    },
    {
      "id": "precept-ch-richyoung",
      "title": "Precept Austin — Luke Chapter 18",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 18 — richyoung.jpg.",
      "thumb": "/visuals/luke/precept_richyoung.jpg",
      "full": "/visuals/luke/precept_richyoung.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/richyoung.jpg"
      },
      "chapters": [
        18
      ]
    },
    {
      "id": "precept-ch-samaritan",
      "title": "Precept Austin — Luke Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 10 — samaritan.jpg.",
      "thumb": "/visuals/luke/precept_samaritan.jpg",
      "full": "/visuals/luke/precept_samaritan.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/samaritan.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-sanhedrin",
      "title": "Precept Austin — Luke Chapter 22",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 22 — sanhedrin.jpg.",
      "thumb": "/visuals/luke/precept_sanhedrin.jpg",
      "full": "/visuals/luke/precept_sanhedrin.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Sanhedrin.jpg"
      },
      "chapters": [
        22
      ]
    },
    {
      "id": "precept-ch-sanhedrinhall",
      "title": "Precept Austin — Luke Chapter 22",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 22 — sanhedrinhall.jpg.",
      "thumb": "/visuals/luke/precept_sanhedrinhall.jpg",
      "full": "/visuals/luke/precept_sanhedrinhall.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sanhedrinhall.jpg"
      },
      "chapters": [
        22
      ]
    },
    {
      "id": "precept-ch-secondcoming",
      "title": "Precept Austin — Luke Chapter 21",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 21 — secondcoming.jpg.",
      "thumb": "/visuals/luke/precept_secondcoming.jpg",
      "full": "/visuals/luke/precept_secondcoming.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/secondcoming.jpg"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-seder",
      "title": "Precept Austin — Luke Chapter 22",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 22 — seder.jpg.",
      "thumb": "/visuals/luke/precept_seder.jpg",
      "full": "/visuals/luke/precept_seder.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/seder.jpg"
      },
      "chapters": [
        22
      ]
    },
    {
      "id": "precept-ch-sederplate",
      "title": "Precept Austin — Luke Chapter 22",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 22 — sederplate.jpg.",
      "thumb": "/visuals/luke/precept_sederplate.jpg",
      "full": "/visuals/luke/precept_sederplate.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sederplate.jpg"
      },
      "chapters": [
        22
      ]
    },
    {
      "id": "precept-ch-sentout",
      "title": "Precept Austin — Luke Chapter 9",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 9 — sentout.jpg.",
      "thumb": "/visuals/luke/precept_sentout.jpg",
      "full": "/visuals/luke/precept_sentout.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sentout.jpg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-sermon1",
      "title": "Precept Austin — Luke Chapters 3, 20",
      "caption": "Bruce Hurt's commentary chart for Luke chapters 3, 20 — sermon1.gif.",
      "thumb": "/visuals/luke/precept_sermon1.gif",
      "full": "/visuals/luke/precept_sermon1.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sermon1.gif"
      },
      "chapters": [
        3,
        20
      ]
    },
    {
      "id": "precept-ch-sermon_on_the_mount_by_bloch_small",
      "title": "Precept Austin — Luke Chapter 6",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 6 — sermon on the mount by bloch_small.jpg.",
      "thumb": "/visuals/luke/precept_sermon_on_the_mount_by_bloch_small.jpg",
      "full": "/visuals/luke/precept_sermon_on_the_mount_by_bloch_small.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Sermon%20on%20the%20mount%20by%20Bloch_small.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-sermonplain",
      "title": "Precept Austin — Luke Chapter 6",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 6 — sermonplain.jpg.",
      "thumb": "/visuals/luke/precept_sermonplain.jpg",
      "full": "/visuals/luke/precept_sermonplain.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sermonplain.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-shake",
      "title": "Precept Austin — Luke Chapter 9",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 9 — shake.jpg.",
      "thumb": "/visuals/luke/precept_shake.jpg",
      "full": "/visuals/luke/precept_shake.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shake.jpg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-shepherd_rescuing_a_lost_sheep",
      "title": "Precept Austin — Luke Chapter 15",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 15 — shepherd rescuing a lost sheep.gif.",
      "thumb": "/visuals/luke/precept_shepherd_rescuing_a_lost_sheep.gif",
      "full": "/visuals/luke/precept_shepherd_rescuing_a_lost_sheep.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shepherd rescuing a lost sheep.gif"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-shepherds",
      "title": "Precept Austin — Luke Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 2 — shepherds.jpg.",
      "thumb": "/visuals/luke/precept_shepherds.jpg",
      "full": "/visuals/luke/precept_shepherds.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shepherds.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-shepherds2",
      "title": "Precept Austin — Luke Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 2 — shepherds2.jpg.",
      "thumb": "/visuals/luke/precept_shepherds2.jpg",
      "full": "/visuals/luke/precept_shepherds2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shepherds2.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-siloam",
      "title": "Precept Austin — Luke Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 13 — siloam.jpg.",
      "thumb": "/visuals/luke/precept_siloam.jpg",
      "full": "/visuals/luke/precept_siloam.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/siloam.jpg"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-simeon",
      "title": "Precept Austin — Luke Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 2 — simeon.jpg.",
      "thumb": "/visuals/luke/precept_simeon.jpg",
      "full": "/visuals/luke/precept_simeon.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/simeon.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-simeon1",
      "title": "Precept Austin — Luke Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 2 — simeon1.jpg.",
      "thumb": "/visuals/luke/precept_simeon1.jpg",
      "full": "/visuals/luke/precept_simeon1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/simeon1.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-synagogue",
      "title": "Precept Austin — Luke Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 13 — synagogue.png.",
      "thumb": "/visuals/luke/precept_synagogue.png",
      "full": "/visuals/luke/precept_synagogue.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/synagogue.png"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-synagoguecaper",
      "title": "Precept Austin — Luke Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 10 — synagoguecaper.jpg.",
      "thumb": "/visuals/luke/precept_synagoguecaper.jpg",
      "full": "/visuals/luke/precept_synagoguecaper.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/synagoguecaper.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-synagogueesv",
      "title": "Precept Austin — Luke Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 4 — synagogueesv.jpg.",
      "thumb": "/visuals/luke/precept_synagogueesv.jpg",
      "full": "/visuals/luke/precept_synagogueesv.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/synagogueesv.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-synagogueteach",
      "title": "Precept Austin — Luke Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 13 — synagogueteach.jpg.",
      "thumb": "/visuals/luke/precept_synagogueteach.jpg",
      "full": "/visuals/luke/precept_synagogueteach.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/synagogueteach.jpg"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-tabernacle_schematic2",
      "title": "Precept Austin — Luke Chapters 1, 23",
      "caption": "Bruce Hurt's commentary chart for Luke chapters 1, 23 — tabernacle schematic2.gif.",
      "thumb": "/visuals/luke/precept_tabernacle_schematic2.gif",
      "full": "/visuals/luke/precept_tabernacle_schematic2.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Tabernacle schematic2.gif"
      },
      "chapters": [
        1,
        23
      ]
    },
    {
      "id": "precept-ch-templedestruction",
      "title": "Precept Austin — Luke Chapter 21",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 21 — templedestruction.png.",
      "thumb": "/visuals/luke/precept_templedestruction.png",
      "full": "/visuals/luke/precept_templedestruction.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/templedestruction.png"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-templemodel",
      "title": "Precept Austin — Luke Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 1 — templemodel.jpg.",
      "thumb": "/visuals/luke/precept_templemodel.jpg",
      "full": "/visuals/luke/precept_templemodel.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/templemodel.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-templestairs",
      "title": "Precept Austin — Luke Chapter 18",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 18 — templestairs.jpg.",
      "thumb": "/visuals/luke/precept_templestairs.jpg",
      "full": "/visuals/luke/precept_templestairs.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/templestairs.jpg"
      },
      "chapters": [
        18
      ]
    },
    {
      "id": "precept-ch-transfigure",
      "title": "Precept Austin — Luke Chapter 9",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 9 — transfigure.jpg.",
      "thumb": "/visuals/luke/precept_transfigure.jpg",
      "full": "/visuals/luke/precept_transfigure.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/transfigure.jpg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-tyre",
      "title": "Precept Austin — Luke Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 10 — tyre.jpg.",
      "thumb": "/visuals/luke/precept_tyre.jpg",
      "full": "/visuals/luke/precept_tyre.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/tyre.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-upperroom",
      "title": "Precept Austin — Luke Chapter 22",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 22 — upperroom.jpg.",
      "thumb": "/visuals/luke/precept_upperroom.jpg",
      "full": "/visuals/luke/precept_upperroom.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/upperroom.jpg"
      },
      "chapters": [
        22
      ]
    },
    {
      "id": "precept-ch-vision",
      "title": "Precept Austin — Luke Chapters 19, 21",
      "caption": "Bruce Hurt's commentary chart for Luke chapters 19, 21 — vision.jpg.",
      "thumb": "/visuals/luke/precept_vision.jpg",
      "full": "/visuals/luke/precept_vision.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/vision.jpg"
      },
      "chapters": [
        19,
        21
      ]
    },
    {
      "id": "precept-ch-watchtower",
      "title": "Precept Austin — Luke Chapter 20",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 20 — watchtower.jpg.",
      "thumb": "/visuals/luke/precept_watchtower.jpg",
      "full": "/visuals/luke/precept_watchtower.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/watchtower.jpg"
      },
      "chapters": [
        20
      ]
    },
    {
      "id": "precept-ch-wheat",
      "title": "Precept Austin — Luke Chapter 6",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 6 — wheat.jpg.",
      "thumb": "/visuals/luke/precept_wheat.jpg",
      "full": "/visuals/luke/precept_wheat.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/wheat.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-wilderness1",
      "title": "Precept Austin — Luke Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 4 — wilderness1.jpg.",
      "thumb": "/visuals/luke/precept_wilderness1.jpg",
      "full": "/visuals/luke/precept_wilderness1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/wilderness1.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-wineskin",
      "title": "Precept Austin — Luke Chapter 5",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 5 — wineskin.png.",
      "thumb": "/visuals/luke/precept_wineskin.png",
      "full": "/visuals/luke/precept_wineskin.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/wineskin.png"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-winnow",
      "title": "Precept Austin — Luke Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 3 — winnow.jpg.",
      "thumb": "/visuals/luke/precept_winnow.jpg",
      "full": "/visuals/luke/precept_winnow.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/winnow.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-woe",
      "title": "Precept Austin — Luke Chapter 11",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 11 — woe.jpg.",
      "thumb": "/visuals/luke/precept_woe.jpg",
      "full": "/visuals/luke/precept_woe.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/woe.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-woman",
      "title": "Precept Austin — Luke Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 8 — woman.jpg.",
      "thumb": "/visuals/luke/precept_woman.jpg",
      "full": "/visuals/luke/precept_woman.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/woman.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-zaccheus",
      "title": "Precept Austin — Luke Chapter 19",
      "caption": "Bruce Hurt's commentary chart for Luke chapter 19 — zaccheus.jpg.",
      "thumb": "/visuals/luke/precept_zaccheus.jpg",
      "full": "/visuals/luke/precept_zaccheus.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zaccheus.jpg"
      },
      "chapters": [
        19
      ]
    },
    {
      "id": "precept-ch-zeph-1",
      "title": "Precept Austin — Luke Chapters 1, 18, 20",
      "caption": "Bruce Hurt's commentary chart for Luke chapters 1, 18, 20 — zeph-1.gif.",
      "thumb": "/visuals/luke/precept_zeph-1.gif",
      "full": "/visuals/luke/precept_zeph-1.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zeph-1.gif"
      },
      "chapters": [
        1,
        18,
        20
      ]
    }
  ]
},
  'john': {
  "videos": [
    {
      "youtubeId": "G-2e9mMf7E8",
      "title": "John 1–12 — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/G-2e9mMf7E8?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/john/",
      "chapterStart": 1,
      "chapterEnd": 12
    },
    {
      "youtubeId": "RUfh_wOsauk",
      "title": "John 13–21 — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/RUfh_wOsauk?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/john/",
      "chapterStart": 13,
      "chapterEnd": 21
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: John",
      "caption": "Hand-illustrated single-page overview of John, tracing the book's literary design and major themes.",
      "thumb": "/visuals/john/bibleproject_poster.jpg",
      "full": "/visuals/john/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-john/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — John Bible Chart",
      "caption": "Single-page structural chart of John, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/john/swindoll_chart.png",
      "full": "/visuals/john/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/John-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — John Chart",
      "caption": "Bruce Hurt's inductive-study chart for John, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/john/precept_chart.png",
      "full": "/visuals/john/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/john.png"
      }
    },
    {
      "id": "precept-book-john_overview",
      "title": "Precept Austin — John (john_overview.png)",
      "caption": "Bruce Hurt's chart embedded across multiple John chapters on Precept Austin's commentary.",
      "thumb": "/visuals/john/precept_john_overview.png",
      "full": "/visuals/john/precept_john_overview.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/john_overview.png"
      }
    },
    {
      "id": "precept-book-john_life",
      "title": "Precept Austin — John (john_life.png)",
      "caption": "Bruce Hurt's chart embedded across multiple John chapters on Precept Austin's commentary.",
      "thumb": "/visuals/john/precept_john_life.png",
      "full": "/visuals/john/precept_john_life.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/john_life.png"
      }
    },
    {
      "id": "precept-book-john-1",
      "title": "Precept Austin — John (john-1.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple John chapters on Precept Austin's commentary.",
      "thumb": "/visuals/john/precept_john-1.jpg",
      "full": "/visuals/john/precept_john-1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/john-1.jpg"
      }
    },
    {
      "id": "precept-ch-aenon",
      "title": "Precept Austin — John Chapter 3",
      "caption": "Bruce Hurt's commentary chart for John chapter 3 — aenon.jpg.",
      "thumb": "/visuals/john/precept_aenon.jpg",
      "full": "/visuals/john/precept_aenon.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/aenon.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-artesian",
      "title": "Precept Austin — John Chapter 4",
      "caption": "Bruce Hurt's commentary chart for John chapter 4 — artesian.png.",
      "thumb": "/visuals/john/precept_artesian.png",
      "full": "/visuals/john/precept_artesian.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/artesian.png"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-baptist",
      "title": "Precept Austin — John Chapter 1",
      "caption": "Bruce Hurt's commentary chart for John chapter 1 — baptist.jpg.",
      "thumb": "/visuals/john/precept_baptist.jpg",
      "full": "/visuals/john/precept_baptist.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/baptist.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-bethanybj",
      "title": "Precept Austin — John Chapter 1",
      "caption": "Bruce Hurt's commentary chart for John chapter 1 — bethanybj.jpg.",
      "thumb": "/visuals/john/precept_bethanybj.jpg",
      "full": "/visuals/john/precept_bethanybj.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bethanybj.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-bethesda1",
      "title": "Precept Austin — John Chapter 5",
      "caption": "Bruce Hurt's commentary chart for John chapter 5 — bethesda1.jpg.",
      "thumb": "/visuals/john/precept_bethesda1.jpg",
      "full": "/visuals/john/precept_bethesda1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bethesda1.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-bethesda2",
      "title": "Precept Austin — John Chapter 5",
      "caption": "Bruce Hurt's commentary chart for John chapter 5 — bethesda2.jpg.",
      "thumb": "/visuals/john/precept_bethesda2.jpg",
      "full": "/visuals/john/precept_bethesda2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bethesda2.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-bethesdapool",
      "title": "Precept Austin — John Chapter 5",
      "caption": "Bruce Hurt's commentary chart for John chapter 5 — bethesdapool.jpg.",
      "thumb": "/visuals/john/precept_bethesdapool.jpg",
      "full": "/visuals/john/precept_bethesdapool.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bethesdapool.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-bethsaida",
      "title": "Precept Austin — John Chapters 1, 6",
      "caption": "Bruce Hurt's commentary chart for John chapters 1, 6 — bethsaida.jpg.",
      "thumb": "/visuals/john/precept_bethsaida.jpg",
      "full": "/visuals/john/precept_bethsaida.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bethsaida.jpg"
      },
      "chapters": [
        1,
        6
      ]
    },
    {
      "id": "precept-ch-boatjesus",
      "title": "Precept Austin — John Chapters 6, 21",
      "caption": "Bruce Hurt's commentary chart for John chapters 6, 21 — boatjesus.jpg.",
      "thumb": "/visuals/john/precept_boatjesus.jpg",
      "full": "/visuals/john/precept_boatjesus.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/boatjesus.jpg"
      },
      "chapters": [
        6,
        21
      ]
    },
    {
      "id": "precept-ch-calen",
      "title": "Precept Austin — John Chapter 7",
      "caption": "Bruce Hurt's commentary chart for John chapter 7 — calen.jpg.",
      "thumb": "/visuals/john/precept_calen.jpg",
      "full": "/visuals/john/precept_calen.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/calen.jpg"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-cana",
      "title": "Precept Austin — John Chapters 1, 2, 4",
      "caption": "Bruce Hurt's commentary chart for John chapters 1, 2, 4 — cana.jpg.",
      "thumb": "/visuals/john/precept_cana.jpg",
      "full": "/visuals/john/precept_cana.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/cana.jpg"
      },
      "chapters": [
        1,
        2,
        4
      ]
    },
    {
      "id": "precept-ch-christeternity",
      "title": "Precept Austin — John Chapter 11",
      "caption": "Bruce Hurt's commentary chart for John chapter 11 — christeternity.jpg.",
      "thumb": "/visuals/john/precept_christeternity.jpg",
      "full": "/visuals/john/precept_christeternity.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/christeternity.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-circumcision",
      "title": "Precept Austin — John Chapter 7",
      "caption": "Bruce Hurt's commentary chart for John chapter 7 — circumcision.png.",
      "thumb": "/visuals/john/precept_circumcision.png",
      "full": "/visuals/john/precept_circumcision.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/CIRCUMCISION.png"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-clockredeem",
      "title": "Precept Austin — John Chapter 7",
      "caption": "Bruce Hurt's commentary chart for John chapter 7 — clockredeem.jpeg.",
      "thumb": "/visuals/john/precept_clockredeem.jpg",
      "full": "/visuals/john/precept_clockredeem.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/clockredeem.jpeg"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-courtofgentiles",
      "title": "Precept Austin — John Chapter 5",
      "caption": "Bruce Hurt's commentary chart for John chapter 5 — courtofgentiles.jpg.",
      "thumb": "/visuals/john/precept_courtofgentiles.jpg",
      "full": "/visuals/john/precept_courtofgentiles.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/courtofgentiles.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-dedication",
      "title": "Precept Austin — John Chapter 10",
      "caption": "Bruce Hurt's commentary chart for John chapter 10 — dedication.jpg.",
      "thumb": "/visuals/john/precept_dedication.jpg",
      "full": "/visuals/john/precept_dedication.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/dedication.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-equal",
      "title": "Precept Austin — John Chapter 5",
      "caption": "Bruce Hurt's commentary chart for John chapter 5 — equal.jpg.",
      "thumb": "/visuals/john/precept_equal.jpg",
      "full": "/visuals/john/precept_equal.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/equal.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-feasts",
      "title": "Precept Austin — John Chapter 7",
      "caption": "Bruce Hurt's commentary chart for John chapter 7 — feasts.jpg.",
      "thumb": "/visuals/john/precept_feasts.jpg",
      "full": "/visuals/john/precept_feasts.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/feasts.jpg"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-figtree",
      "title": "Precept Austin — John Chapter 1",
      "caption": "Bruce Hurt's commentary chart for John chapter 1 — figtree.jpg.",
      "thumb": "/visuals/john/precept_figtree.jpg",
      "full": "/visuals/john/precept_figtree.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/figtree.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-finger",
      "title": "Precept Austin — John Chapters 1, 5",
      "caption": "Bruce Hurt's commentary chart for John chapters 1, 5 — finger.jpg.",
      "thumb": "/visuals/john/precept_finger.jpg",
      "full": "/visuals/john/precept_finger.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/finger.jpg"
      },
      "chapters": [
        1,
        5
      ]
    },
    {
      "id": "precept-ch-fol",
      "title": "Precept Austin — John Chapter 1",
      "caption": "Bruce Hurt's commentary chart for John chapter 1 — fol.jpg.",
      "thumb": "/visuals/john/precept_fol.jpg",
      "full": "/visuals/john/precept_fol.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/fol.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-galileeministry",
      "title": "Precept Austin — John Chapter 6",
      "caption": "Bruce Hurt's commentary chart for John chapter 6 — galileeministry.jpg.",
      "thumb": "/visuals/john/precept_galileeministry.jpg",
      "full": "/visuals/john/precept_galileeministry.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/galileeministry.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-galileeministry1",
      "title": "Precept Austin — John Chapter 6",
      "caption": "Bruce Hurt's commentary chart for John chapter 6 — galileeministry1.jpg.",
      "thumb": "/visuals/john/precept_galileeministry1.jpg",
      "full": "/visuals/john/precept_galileeministry1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/galileeministry1.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-golan",
      "title": "Precept Austin — John Chapter 6",
      "caption": "Bruce Hurt's commentary chart for John chapter 6 — golan.png.",
      "thumb": "/visuals/john/precept_golan.png",
      "full": "/visuals/john/precept_golan.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/golan.png"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-holiday",
      "title": "Precept Austin — John Chapter 7",
      "caption": "Bruce Hurt's commentary chart for John chapter 7 — holiday.jpg.",
      "thumb": "/visuals/john/precept_holiday.jpg",
      "full": "/visuals/john/precept_holiday.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/holiday.jpg"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-israelmap",
      "title": "Precept Austin — John Chapter 10",
      "caption": "Bruce Hurt's commentary chart for John chapter 10 — israelmap.png.",
      "thumb": "/visuals/john/precept_israelmap.png",
      "full": "/visuals/john/precept_israelmap.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/israelmap.png"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-jacobswell",
      "title": "Precept Austin — John Chapter 4",
      "caption": "Bruce Hurt's commentary chart for John chapter 4 — jacobswell.jpg.",
      "thumb": "/visuals/john/precept_jacobswell.jpg",
      "full": "/visuals/john/precept_jacobswell.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jacobswell.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-jerusalemelevation2",
      "title": "Precept Austin — John Chapter 5",
      "caption": "Bruce Hurt's commentary chart for John chapter 5 — jerusalemelevation2.jpg.",
      "thumb": "/visuals/john/precept_jerusalemelevation2.jpg",
      "full": "/visuals/john/precept_jerusalemelevation2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jerusalemelevation2.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-jesusandsam",
      "title": "Precept Austin — John Chapter 4",
      "caption": "Bruce Hurt's commentary chart for John chapter 4 — jesusandsam.jpg.",
      "thumb": "/visuals/john/precept_jesusandsam.jpg",
      "full": "/visuals/john/precept_jesusandsam.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jesusandsam.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-jesusfeeds",
      "title": "Precept Austin — John Chapter 6",
      "caption": "Bruce Hurt's commentary chart for John chapter 6 — jesusfeeds.jpg.",
      "thumb": "/visuals/john/precept_jesusfeeds.jpg",
      "full": "/visuals/john/precept_jesusfeeds.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jesusfeeds.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-john7",
      "title": "Precept Austin — John Chapter 7",
      "caption": "Bruce Hurt's commentary chart for John chapter 7 — john7.jpg.",
      "thumb": "/visuals/john/precept_john7.jpg",
      "full": "/visuals/john/precept_john7.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/john7.jpg"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-john_21",
      "title": "Precept Austin — John Chapter 11",
      "caption": "Bruce Hurt's commentary chart for John chapter 11 — john_21.gif.",
      "thumb": "/visuals/john/precept_john_21.gif",
      "full": "/visuals/john/precept_john_21.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/john_21.gif"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-john_23",
      "title": "Precept Austin — John Chapter 11",
      "caption": "Bruce Hurt's commentary chart for John chapter 11 — john_23.gif.",
      "thumb": "/visuals/john/precept_john_23.gif",
      "full": "/visuals/john/precept_john_23.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/john_23.gif"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-johnb",
      "title": "Precept Austin — John Chapter 1",
      "caption": "Bruce Hurt's commentary chart for John chapter 1 — johnb.jpg.",
      "thumb": "/visuals/john/precept_johnb.jpg",
      "full": "/visuals/john/precept_johnb.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/johnb.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-johntimeline",
      "title": "Precept Austin — John Chapters 5–6",
      "caption": "Bruce Hurt's commentary chart for John chapters 5–6 — johntimeline.jpg.",
      "thumb": "/visuals/john/precept_johntimeline.jpg",
      "full": "/visuals/john/precept_johntimeline.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/johntimeline.jpg"
      },
      "chapters": [
        5,
        6
      ]
    },
    {
      "id": "precept-ch-jordanbap",
      "title": "Precept Austin — John Chapter 1",
      "caption": "Bruce Hurt's commentary chart for John chapter 1 — jordanbap.jpg.",
      "thumb": "/visuals/john/precept_jordanbap.jpg",
      "full": "/visuals/john/precept_jordanbap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jordanbap.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-justicestatue",
      "title": "Precept Austin — John Chapter 7",
      "caption": "Bruce Hurt's commentary chart for John chapter 7 — justicestatue.png.",
      "thumb": "/visuals/john/precept_justicestatue.png",
      "full": "/visuals/john/precept_justicestatue.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/justicestatue.png"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-lamb_cross",
      "title": "Precept Austin — John Chapter 1",
      "caption": "Bruce Hurt's commentary chart for John chapter 1 — lamb cross.jpg.",
      "thumb": "/visuals/john/precept_lamb_cross.jpg",
      "full": "/visuals/john/precept_lamb_cross.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/lamb%20cross.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-lamb_passover",
      "title": "Precept Austin — John Chapter 1",
      "caption": "Bruce Hurt's commentary chart for John chapter 1 — lamb passover.gif.",
      "thumb": "/visuals/john/precept_lamb_passover.gif",
      "full": "/visuals/john/precept_lamb_passover.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/lamb%20passover.gif"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-lights",
      "title": "Precept Austin — John Chapter 8",
      "caption": "Bruce Hurt's commentary chart for John chapter 8 — lights.jpg.",
      "thumb": "/visuals/john/precept_lights.jpg",
      "full": "/visuals/john/precept_lights.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/lights.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-loaves",
      "title": "Precept Austin — John Chapter 6",
      "caption": "Bruce Hurt's commentary chart for John chapter 6 — loaves.jpg.",
      "thumb": "/visuals/john/precept_loaves.jpg",
      "full": "/visuals/john/precept_loaves.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/loaves.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-log",
      "title": "Precept Austin — John Chapter 1",
      "caption": "Bruce Hurt's commentary chart for John chapter 1 — log.jpg.",
      "thumb": "/visuals/john/precept_log.jpg",
      "full": "/visuals/john/precept_log.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/log.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-luke14diningtable",
      "title": "Precept Austin — John Chapter 2",
      "caption": "Bruce Hurt's commentary chart for John chapter 2 — luke14diningtable.gif.",
      "thumb": "/visuals/john/precept_luke14diningtable.gif",
      "full": "/visuals/john/precept_luke14diningtable.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke14diningtable.GIF"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-mark_life_of_christ",
      "title": "Precept Austin — John Chapters 2–3",
      "caption": "Bruce Hurt's commentary chart for John chapters 2–3 — mark_life_of_christ.png.",
      "thumb": "/visuals/john/precept_mark_life_of_christ.png",
      "full": "/visuals/john/precept_mark_life_of_christ.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mark_life_of_christ.png"
      },
      "chapters": [
        2,
        3
      ]
    },
    {
      "id": "precept-ch-millenniumjohn529",
      "title": "Precept Austin — John Chapter 5",
      "caption": "Bruce Hurt's commentary chart for John chapter 5 — millenniumjohn529.jpg.",
      "thumb": "/visuals/john/precept_millenniumjohn529.jpg",
      "full": "/visuals/john/precept_millenniumjohn529.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/millenniumjohn529.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-nazareth",
      "title": "Precept Austin — John Chapter 1",
      "caption": "Bruce Hurt's commentary chart for John chapter 1 — nazareth.jpg.",
      "thumb": "/visuals/john/precept_nazareth.jpg",
      "full": "/visuals/john/precept_nazareth.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/nazareth.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-nehushtan",
      "title": "Precept Austin — John Chapter 3",
      "caption": "Bruce Hurt's commentary chart for John chapter 3 — nehushtan.jpg.",
      "thumb": "/visuals/john/precept_nehushtan.jpg",
      "full": "/visuals/john/precept_nehushtan.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/nehushtan.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-nicodemus",
      "title": "Precept Austin — John Chapter 3",
      "caption": "Bruce Hurt's commentary chart for John chapter 3 — nicodemus.jpg.",
      "thumb": "/visuals/john/precept_nicodemus.jpg",
      "full": "/visuals/john/precept_nicodemus.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/nicodemus.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-nicodemussamaritan",
      "title": "Precept Austin — John Chapters 3–4",
      "caption": "Bruce Hurt's commentary chart for John chapters 3–4 — nicodemussamaritan.jpg.",
      "thumb": "/visuals/john/precept_nicodemussamaritan.jpg",
      "full": "/visuals/john/precept_nicodemussamaritan.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/nicodemussamaritan.jpg"
      },
      "chapters": [
        3,
        4
      ]
    },
    {
      "id": "precept-ch-paralytic",
      "title": "Precept Austin — John Chapter 5",
      "caption": "Bruce Hurt's commentary chart for John chapter 5 — paralytic.jpg.",
      "thumb": "/visuals/john/precept_paralytic.jpg",
      "full": "/visuals/john/precept_paralytic.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/paralytic.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-portico",
      "title": "Precept Austin — John Chapter 10",
      "caption": "Bruce Hurt's commentary chart for John chapter 10 — portico.jpg.",
      "thumb": "/visuals/john/precept_portico.jpg",
      "full": "/visuals/john/precept_portico.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/portico.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-pray",
      "title": "Precept Austin — John Chapter 6",
      "caption": "Bruce Hurt's commentary chart for John chapter 6 — pray.jpg.",
      "thumb": "/visuals/john/precept_pray.jpg",
      "full": "/visuals/john/precept_pray.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/pray.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-rejection",
      "title": "Precept Austin — John Chapter 8",
      "caption": "Bruce Hurt's commentary chart for John chapter 8 — rejection.jpg.",
      "thumb": "/visuals/john/precept_rejection.jpg",
      "full": "/visuals/john/precept_rejection.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/rejection.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-res",
      "title": "Precept Austin — John Chapter 2",
      "caption": "Bruce Hurt's commentary chart for John chapter 2 — res.jpg.",
      "thumb": "/visuals/john/precept_res.jpg",
      "full": "/visuals/john/precept_res.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/res.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-royal",
      "title": "Precept Austin — John Chapter 4",
      "caption": "Bruce Hurt's commentary chart for John chapter 4 — royal.jpg.",
      "thumb": "/visuals/john/precept_royal.jpg",
      "full": "/visuals/john/precept_royal.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/royal.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-safe",
      "title": "Precept Austin — John Chapter 10",
      "caption": "Bruce Hurt's commentary chart for John chapter 10 — safe.jpg.",
      "thumb": "/visuals/john/precept_safe.jpg",
      "full": "/visuals/john/precept_safe.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/safe.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-sam",
      "title": "Precept Austin — John Chapter 4",
      "caption": "Bruce Hurt's commentary chart for John chapter 4 — sam.jpg.",
      "thumb": "/visuals/john/precept_sam.jpg",
      "full": "/visuals/john/precept_sam.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sam.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-samar",
      "title": "Precept Austin — John Chapter 4",
      "caption": "Bruce Hurt's commentary chart for John chapter 4 — samar.jpg.",
      "thumb": "/visuals/john/precept_samar.jpg",
      "full": "/visuals/john/precept_samar.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/samar.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-samaria",
      "title": "Precept Austin — John Chapter 4",
      "caption": "Bruce Hurt's commentary chart for John chapter 4 — samaria.gif.",
      "thumb": "/visuals/john/precept_samaria.gif",
      "full": "/visuals/john/precept_samaria.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/samaria.gif"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-samariamap",
      "title": "Precept Austin — John Chapter 4",
      "caption": "Bruce Hurt's commentary chart for John chapter 4 — samariamap.jpg.",
      "thumb": "/visuals/john/precept_samariamap.jpg",
      "full": "/visuals/john/precept_samariamap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/samariamap.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-search",
      "title": "Precept Austin — John Chapter 5",
      "caption": "Bruce Hurt's commentary chart for John chapter 5 — search.jpg.",
      "thumb": "/visuals/john/precept_search.jpg",
      "full": "/visuals/john/precept_search.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/search.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-sheep_lamb_lying_down_small",
      "title": "Precept Austin — John Chapter 10",
      "caption": "Bruce Hurt's commentary chart for John chapter 10 — sheep lamb lying down_small.jpg.",
      "thumb": "/visuals/john/precept_sheep_lamb_lying_down_small.jpg",
      "full": "/visuals/john/precept_sheep_lamb_lying_down_small.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sheep%20lamb%20lying%20down_small.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-sheepfold",
      "title": "Precept Austin — John Chapter 10",
      "caption": "Bruce Hurt's commentary chart for John chapter 10 — sheepfold.jpg.",
      "thumb": "/visuals/john/precept_sheepfold.jpg",
      "full": "/visuals/john/precept_sheepfold.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sheepfold.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-sheeppix",
      "title": "Precept Austin — John Chapter 10",
      "caption": "Bruce Hurt's commentary chart for John chapter 10 — sheeppix.jpg.",
      "thumb": "/visuals/john/precept_sheeppix.jpg",
      "full": "/visuals/john/precept_sheeppix.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sheeppix.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-shepherd_annointing_with_oil_small1",
      "title": "Precept Austin — John Chapter 10",
      "caption": "Bruce Hurt's commentary chart for John chapter 10 — shepherd annointing with oil_small1.gif.",
      "thumb": "/visuals/john/precept_shepherd_annointing_with_oil_small1.gif",
      "full": "/visuals/john/precept_shepherd_annointing_with_oil_small1.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shepherd%20annointing%20with%20oil_small1.gif"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-shepherd_holding_a_sheep_small",
      "title": "Precept Austin — John Chapter 10",
      "caption": "Bruce Hurt's commentary chart for John chapter 10 — shepherd holding a sheep_small.gif.",
      "thumb": "/visuals/john/precept_shepherd_holding_a_sheep_small.gif",
      "full": "/visuals/john/precept_shepherd_holding_a_sheep_small.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shepherd%20holding%20a%20sheep_small.gif"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-shepherd_w_lamb_on_shoulders_small",
      "title": "Precept Austin — John Chapter 10",
      "caption": "Bruce Hurt's commentary chart for John chapter 10 — shepherd w lamb on shoulders_small.gif.",
      "thumb": "/visuals/john/precept_shepherd_w_lamb_on_shoulders_small.gif",
      "full": "/visuals/john/precept_shepherd_w_lamb_on_shoulders_small.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shepherd%20w%20lamb%20on%20shoulders_small.gif"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-shroud",
      "title": "Precept Austin — John Chapter 20",
      "caption": "Bruce Hurt's commentary chart for John chapter 20 — shroud.gif.",
      "thumb": "/visuals/john/precept_shroud.gif",
      "full": "/visuals/john/precept_shroud.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shroud.gif"
      },
      "chapters": [
        20
      ]
    },
    {
      "id": "precept-ch-siloampix",
      "title": "Precept Austin — John Chapter 9",
      "caption": "Bruce Hurt's commentary chart for John chapter 9 — siloampix.jpg.",
      "thumb": "/visuals/john/precept_siloampix.jpg",
      "full": "/visuals/john/precept_siloampix.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/siloampix.jpg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-sukkot",
      "title": "Precept Austin — John Chapter 7",
      "caption": "Bruce Hurt's commentary chart for John chapter 7 — sukkot.jpg.",
      "thumb": "/visuals/john/precept_sukkot.jpg",
      "full": "/visuals/john/precept_sukkot.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sukkot.jpg"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-synagoguecaper",
      "title": "Precept Austin — John Chapter 6",
      "caption": "Bruce Hurt's commentary chart for John chapter 6 — synagoguecaper.jpg.",
      "thumb": "/visuals/john/precept_synagoguecaper.jpg",
      "full": "/visuals/john/precept_synagoguecaper.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/synagoguecaper.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-templecleansing",
      "title": "Precept Austin — John Chapter 2",
      "caption": "Bruce Hurt's commentary chart for John chapter 2 — templecleansing.jpg.",
      "thumb": "/visuals/john/precept_templecleansing.jpg",
      "full": "/visuals/john/precept_templecleansing.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/templecleansing.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-templecomplex",
      "title": "Precept Austin — John Chapter 8",
      "caption": "Bruce Hurt's commentary chart for John chapter 8 — templecomplex.jpg.",
      "thumb": "/visuals/john/precept_templecomplex.jpg",
      "full": "/visuals/john/precept_templecomplex.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/templecomplex.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-templemount2",
      "title": "Precept Austin — John Chapters 2, 7, 8",
      "caption": "Bruce Hurt's commentary chart for John chapters 2, 7, 8 — templemount2.jpg.",
      "thumb": "/visuals/john/precept_templemount2.jpg",
      "full": "/visuals/john/precept_templemount2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/templemount2.jpg"
      },
      "chapters": [
        2,
        7,
        8
      ]
    },
    {
      "id": "precept-ch-templeton",
      "title": "Precept Austin — John Chapter 2",
      "caption": "Bruce Hurt's commentary chart for John chapter 2 — templeton.gif.",
      "thumb": "/visuals/john/precept_templeton.gif",
      "full": "/visuals/john/precept_templeton.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/templeton.gif"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-the_sacrifice_of_isaac_small",
      "title": "Precept Austin — John Chapter 1",
      "caption": "Bruce Hurt's commentary chart for John chapter 1 — the_sacrifice_of_isaac_small.jpg.",
      "thumb": "/visuals/john/precept_the_sacrifice_of_isaac_small.jpg",
      "full": "/visuals/john/precept_the_sacrifice_of_isaac_small.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/The_Sacrifice_of_Isaac_small.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-truth",
      "title": "Precept Austin — John Chapter 8",
      "caption": "Bruce Hurt's commentary chart for John chapter 8 — truth.jpg.",
      "thumb": "/visuals/john/precept_truth.jpg",
      "full": "/visuals/john/precept_truth.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/truth.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-walkwater",
      "title": "Precept Austin — John Chapter 6",
      "caption": "Bruce Hurt's commentary chart for John chapter 6 — walkwater.jpg.",
      "thumb": "/visuals/john/precept_walkwater.jpg",
      "full": "/visuals/john/precept_walkwater.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/walkwater.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-warning",
      "title": "Precept Austin — John Chapter 8",
      "caption": "Bruce Hurt's commentary chart for John chapter 8 — warning.jpg.",
      "thumb": "/visuals/john/precept_warning.jpg",
      "full": "/visuals/john/precept_warning.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/warning.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-waterpot",
      "title": "Precept Austin — John Chapter 2",
      "caption": "Bruce Hurt's commentary chart for John chapter 2 — waterpot.jpg.",
      "thumb": "/visuals/john/precept_waterpot.jpg",
      "full": "/visuals/john/precept_waterpot.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/waterpot.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-waterwine",
      "title": "Precept Austin — John Chapter 2",
      "caption": "Bruce Hurt's commentary chart for John chapter 2 — waterwine.jpg.",
      "thumb": "/visuals/john/precept_waterwine.jpg",
      "full": "/visuals/john/precept_waterwine.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/waterwine.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-wed",
      "title": "Precept Austin — John Chapter 2",
      "caption": "Bruce Hurt's commentary chart for John chapter 2 — wed.jpg.",
      "thumb": "/visuals/john/precept_wed.jpg",
      "full": "/visuals/john/precept_wed.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/wed.jpg"
      },
      "chapters": [
        2
      ]
    }
  ]
},
  'acts': {
  "videos": [
    {
      "youtubeId": "CGbNw855ksw",
      "title": "Acts 1–12 — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/CGbNw855ksw?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/acts/",
      "chapterStart": 1,
      "chapterEnd": 12
    },
    {
      "youtubeId": "Z-17KxpjL0Q",
      "title": "Acts 13–28 — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/Z-17KxpjL0Q?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/acts/",
      "chapterStart": 13,
      "chapterEnd": 28
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Acts",
      "caption": "Hand-illustrated single-page overview of Acts, tracing the book's literary design and major themes.",
      "thumb": "/visuals/acts/bibleproject_poster.jpg",
      "full": "/visuals/acts/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-acts/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Acts Bible Chart",
      "caption": "Single-page structural chart of Acts, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/acts/swindoll_chart.png",
      "full": "/visuals/acts/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Acts-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Acts Chart",
      "caption": "Bruce Hurt's inductive-study chart for Acts, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/acts/precept_chart.png",
      "full": "/visuals/acts/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/acts.png"
      }
    },
    {
      "id": "precept-ch-3missionaryjourney",
      "title": "Precept Austin — Acts Chapters 19–21",
      "caption": "Bruce Hurt's commentary chart for Acts chapters 19–21 — 3missionaryjourney.gif.",
      "thumb": "/visuals/acts/precept_3missionaryjourney.gif",
      "full": "/visuals/acts/precept_3missionaryjourney.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/3missionaryjourney.gif"
      },
      "chapters": [
        19,
        20,
        21
      ]
    },
    {
      "id": "precept-ch-acts11",
      "title": "Precept Austin — Acts Chapter 11",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 11 — acts11.png.",
      "thumb": "/visuals/acts/precept_acts11.png",
      "full": "/visuals/acts/precept_acts11.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/acts11.png"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-acts13",
      "title": "Precept Austin — Acts Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 13 — acts13.jpg.",
      "thumb": "/visuals/acts/precept_acts13.jpg",
      "full": "/visuals/acts/precept_acts13.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/acts13.jpg"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-acts27map",
      "title": "Precept Austin — Acts Chapters 27–28",
      "caption": "Bruce Hurt's commentary chart for Acts chapters 27–28 — acts27map.gif.",
      "thumb": "/visuals/acts/precept_acts27map.gif",
      "full": "/visuals/acts/precept_acts27map.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/acts27map.gif"
      },
      "chapters": [
        27,
        28
      ]
    },
    {
      "id": "precept-ch-acts2tongue",
      "title": "Precept Austin — Acts Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 2 — acts2tongue.jpg.",
      "thumb": "/visuals/acts/precept_acts2tongue.jpg",
      "full": "/visuals/acts/precept_acts2tongue.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/acts2tongue.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-acts_to_the_gospels",
      "title": "Precept Austin — Acts Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 1 — acts to the gospels.png.",
      "thumb": "/visuals/acts/precept_acts_to_the_gospels.png",
      "full": "/visuals/acts/precept_acts_to_the_gospels.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images//Acts%20to%20the%20Gospels.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-acts_to_the_gospels_small",
      "title": "Precept Austin — Acts Chapter 18",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 18 — acts to the gospels_small.png.",
      "thumb": "/visuals/acts/precept_acts_to_the_gospels_small.png",
      "full": "/visuals/acts/precept_acts_to_the_gospels_small.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Acts%20to%20the%20Gospels_small.png"
      },
      "chapters": [
        18
      ]
    },
    {
      "id": "precept-ch-actsmaturity",
      "title": "Precept Austin — Acts Chapter 9",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 9 — actsmaturity.png.",
      "thumb": "/visuals/acts/precept_actsmaturity.png",
      "full": "/visuals/acts/precept_actsmaturity.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/actsmaturity.png"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-actsoption1",
      "title": "Precept Austin — Acts Chapter 9",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 9 — actsoption1.png.",
      "thumb": "/visuals/acts/precept_actsoption1.png",
      "full": "/visuals/acts/precept_actsoption1.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/actsoption1.png"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-actsoption2",
      "title": "Precept Austin — Acts Chapter 9",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 9 — actsoption2.png.",
      "thumb": "/visuals/acts/precept_actsoption2.png",
      "full": "/visuals/acts/precept_actsoption2.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/actsoption2.png"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-adramyttium",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — adramyttium.jpg.",
      "thumb": "/visuals/acts/precept_adramyttium.jpg",
      "full": "/visuals/acts/precept_adramyttium.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/adramyttium.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-adriatic",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — adriatic.jpg.",
      "thumb": "/visuals/acts/precept_adriatic.jpg",
      "full": "/visuals/acts/precept_adriatic.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/adriatic.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-aeropagussermon",
      "title": "Precept Austin — Acts Chapter 17",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 17 — aeropagussermon.jpg.",
      "thumb": "/visuals/acts/precept_aeropagussermon.jpg",
      "full": "/visuals/acts/precept_aeropagussermon.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/aeropagussermon.jpg"
      },
      "chapters": [
        17
      ]
    },
    {
      "id": "precept-ch-agora",
      "title": "Precept Austin — Acts Chapter 17",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 17 — agora.jpg.",
      "thumb": "/visuals/acts/precept_agora.jpg",
      "full": "/visuals/acts/precept_agora.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/agora.jpg"
      },
      "chapters": [
        17
      ]
    },
    {
      "id": "precept-ch-antiochreturn",
      "title": "Precept Austin — Acts Chapter 14",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 14 — antiochreturn.png.",
      "thumb": "/visuals/acts/precept_antiochreturn.png",
      "full": "/visuals/acts/precept_antiochreturn.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/antiochreturn.png"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-antiochtoj",
      "title": "Precept Austin — Acts Chapter 15",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 15 — antiochtoj.png.",
      "thumb": "/visuals/acts/precept_antiochtoj.png",
      "full": "/visuals/acts/precept_antiochtoj.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/antiochtoj.png"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-antonia",
      "title": "Precept Austin — Acts Chapter 21",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 21 — antonia.jpg.",
      "thumb": "/visuals/acts/precept_antonia.jpg",
      "full": "/visuals/acts/precept_antonia.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/antonia.jpg"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-antoniasteps",
      "title": "Precept Austin — Acts Chapter 21",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 21 — antoniasteps.jpg.",
      "thumb": "/visuals/acts/precept_antoniasteps.jpg",
      "full": "/visuals/acts/precept_antoniasteps.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/antoniasteps.jpg"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-appianway",
      "title": "Precept Austin — Acts Chapter 28",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 28 — appianway.jpg.",
      "thumb": "/visuals/acts/precept_appianway.jpg",
      "full": "/visuals/acts/precept_appianway.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/appianway.jpg"
      },
      "chapters": [
        28
      ]
    },
    {
      "id": "precept-ch-artemisstatue",
      "title": "Precept Austin — Acts Chapter 19",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 19 — artemisstatue.jpg.",
      "thumb": "/visuals/acts/precept_artemisstatue.jpg",
      "full": "/visuals/acts/precept_artemisstatue.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/artemisstatue.JPG"
      },
      "chapters": [
        19
      ]
    },
    {
      "id": "precept-ch-artemistemple",
      "title": "Precept Austin — Acts Chapter 19",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 19 — artemistemple.jpg.",
      "thumb": "/visuals/acts/precept_artemistemple.jpg",
      "full": "/visuals/acts/precept_artemistemple.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/artemistemple.jpg"
      },
      "chapters": [
        19
      ]
    },
    {
      "id": "precept-ch-ascension",
      "title": "Precept Austin — Acts Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 1 — ascension.jpg.",
      "thumb": "/visuals/acts/precept_ascension.jpg",
      "full": "/visuals/acts/precept_ascension.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ascension.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-athenscityplan",
      "title": "Precept Austin — Acts Chapter 17",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 17 — athenscityplan.png.",
      "thumb": "/visuals/acts/precept_athenscityplan.png",
      "full": "/visuals/acts/precept_athenscityplan.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/athenscityplan.png"
      },
      "chapters": [
        17
      ]
    },
    {
      "id": "precept-ch-baptismeunuch",
      "title": "Precept Austin — Acts Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 8 — baptismeunuch.jpg.",
      "thumb": "/visuals/acts/precept_baptismeunuch.jpg",
      "full": "/visuals/acts/precept_baptismeunuch.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/baptismeunuch.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-bc_runner1",
      "title": "Precept Austin — Acts Chapter 20",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 20 — bc_runner1.gif.",
      "thumb": "/visuals/acts/precept_bc_runner1.gif",
      "full": "/visuals/acts/precept_bc_runner1.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bc_runner1.gif"
      },
      "chapters": [
        20
      ]
    },
    {
      "id": "precept-ch-bernice",
      "title": "Precept Austin — Acts Chapter 26",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 26 — bernice.jpg.",
      "thumb": "/visuals/acts/precept_bernice.jpg",
      "full": "/visuals/acts/precept_bernice.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bernice.jpg"
      },
      "chapters": [
        26
      ]
    },
    {
      "id": "precept-ch-caesareaancient",
      "title": "Precept Austin — Acts Chapters 24–25",
      "caption": "Bruce Hurt's commentary chart for Acts chapters 24–25 — caesareaancient.jpg.",
      "thumb": "/visuals/acts/precept_caesareaancient.jpg",
      "full": "/visuals/acts/precept_caesareaancient.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/caesareaancient.jpg"
      },
      "chapters": [
        24,
        25
      ]
    },
    {
      "id": "precept-ch-cauda",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — cauda.jpg.",
      "thumb": "/visuals/acts/precept_cauda.jpg",
      "full": "/visuals/acts/precept_cauda.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/cauda.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-cnidus",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — cnidus.jpg.",
      "thumb": "/visuals/acts/precept_cnidus.jpg",
      "full": "/visuals/acts/precept_cnidus.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/cnidus.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-crete",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — crete.jpg.",
      "thumb": "/visuals/acts/precept_crete.jpg",
      "full": "/visuals/acts/precept_crete.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/crete.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-cretephoenix",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — cretephoenix.png.",
      "thumb": "/visuals/acts/precept_cretephoenix.png",
      "full": "/visuals/acts/precept_cretephoenix.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/cretephoenix.png"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-cyprus",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — cyprus.jpg.",
      "thumb": "/visuals/acts/precept_cyprus.jpg",
      "full": "/visuals/acts/precept_cyprus.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/cyprus.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-damascus",
      "title": "Precept Austin — Acts Chapters 9, 22, 26",
      "caption": "Bruce Hurt's commentary chart for Acts chapters 9, 22, 26 — damascus.jpg.",
      "thumb": "/visuals/acts/precept_damascus.jpg",
      "full": "/visuals/acts/precept_damascus.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/damascus.jpg"
      },
      "chapters": [
        9,
        22,
        26
      ]
    },
    {
      "id": "precept-ch-demon",
      "title": "Precept Austin — Acts Chapter 19",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 19 — demon.jpg.",
      "thumb": "/visuals/acts/precept_demon.jpg",
      "full": "/visuals/acts/precept_demon.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/demon.jpg"
      },
      "chapters": [
        19
      ]
    },
    {
      "id": "precept-ch-dynamite",
      "title": "Precept Austin — Acts Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 1 — dynamite.png.",
      "thumb": "/visuals/acts/precept_dynamite.png",
      "full": "/visuals/acts/precept_dynamite.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/dynamite.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-ephesustheater",
      "title": "Precept Austin — Acts Chapter 19",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 19 — ephesustheater.jpg.",
      "thumb": "/visuals/acts/precept_ephesustheater.jpg",
      "full": "/visuals/acts/precept_ephesustheater.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ephesustheater.jpg"
      },
      "chapters": [
        19
      ]
    },
    {
      "id": "precept-ch-fairhavens1",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — fairhavens1.jpg.",
      "thumb": "/visuals/acts/precept_fairhavens1.jpg",
      "full": "/visuals/acts/precept_fairhavens1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/fairhavens1.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-fairhavens2",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — fairhavens2.jpg.",
      "thumb": "/visuals/acts/precept_fairhavens2.jpg",
      "full": "/visuals/acts/precept_fairhavens2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/fairhavens2.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-faithchinese",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — faithchinese.jpg.",
      "thumb": "/visuals/acts/precept_faithchinese.jpg",
      "full": "/visuals/acts/precept_faithchinese.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/faithchinese.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-felixpaul",
      "title": "Precept Austin — Acts Chapter 24",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 24 — felixpaul.gif.",
      "thumb": "/visuals/acts/precept_felixpaul.gif",
      "full": "/visuals/acts/precept_felixpaul.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/felixpaul.gif"
      },
      "chapters": [
        24
      ]
    },
    {
      "id": "precept-ch-felixpaulcolor",
      "title": "Precept Austin — Acts Chapter 24",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 24 — felixpaulcolor.jpg.",
      "thumb": "/visuals/acts/precept_felixpaulcolor.jpg",
      "full": "/visuals/acts/precept_felixpaulcolor.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/felixpaulcolor.jpg"
      },
      "chapters": [
        24
      ]
    },
    {
      "id": "precept-ch-finger",
      "title": "Precept Austin — Acts Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 8 — finger.jpg.",
      "thumb": "/visuals/acts/precept_finger.jpg",
      "full": "/visuals/acts/precept_finger.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/finger.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-goad",
      "title": "Precept Austin — Acts Chapter 26",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 26 — goad.jpg.",
      "thumb": "/visuals/acts/precept_goad.jpg",
      "full": "/visuals/acts/precept_goad.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/goad.jpg"
      },
      "chapters": [
        26
      ]
    },
    {
      "id": "precept-ch-gospel_bridge_2",
      "title": "Precept Austin — Acts Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 2 — gospel bridge 2.gif.",
      "thumb": "/visuals/acts/precept_gospel_bridge_2.gif",
      "full": "/visuals/acts/precept_gospel_bridge_2.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gospel%20bridge%202.gif"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-gospel_bridge_3",
      "title": "Precept Austin — Acts Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 2 — gospel bridge 3.gif.",
      "thumb": "/visuals/acts/precept_gospel_bridge_3.gif",
      "full": "/visuals/acts/precept_gospel_bridge_3.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gospel%20bridge%203.gif"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-heart",
      "title": "Precept Austin — Acts Chapter 19",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 19 — heart.png.",
      "thumb": "/visuals/acts/precept_heart.png",
      "full": "/visuals/acts/precept_heart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/heart.png"
      },
      "chapters": [
        19
      ]
    },
    {
      "id": "precept-ch-heaven",
      "title": "Precept Austin — Acts Chapter 7",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 7 — heaven.jpg.",
      "thumb": "/visuals/acts/precept_heaven.jpg",
      "full": "/visuals/acts/precept_heaven.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/heaven.jpg"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-herodfamilytree2",
      "title": "Precept Austin — Acts Chapter 12",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 12 — herodfamilytree2.jpg.",
      "thumb": "/visuals/acts/precept_herodfamilytree2.jpg",
      "full": "/visuals/acts/precept_herodfamilytree2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/herodfamilytree2.jpg"
      },
      "chapters": [
        12
      ]
    },
    {
      "id": "precept-ch-homecoming",
      "title": "Precept Austin — Acts Chapter 14",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 14 — homecoming.jpg.",
      "thumb": "/visuals/acts/precept_homecoming.jpg",
      "full": "/visuals/acts/precept_homecoming.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/homecoming.jpg"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-iconium",
      "title": "Precept Austin — Acts Chapters 13–14",
      "caption": "Bruce Hurt's commentary chart for Acts chapters 13–14 — iconium.png.",
      "thumb": "/visuals/acts/precept_iconium.png",
      "full": "/visuals/acts/precept_iconium.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/iconium.png"
      },
      "chapters": [
        13,
        14
      ]
    },
    {
      "id": "precept-ch-iconiumlystra",
      "title": "Precept Austin — Acts Chapter 14",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 14 — iconiumlystra.png.",
      "thumb": "/visuals/acts/precept_iconiumlystra.png",
      "full": "/visuals/acts/precept_iconiumlystra.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/iconiumlystra.png"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-jerusalem-caesarea",
      "title": "Precept Austin — Acts Chapter 21",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 21 — jerusalem-caesarea.jpg.",
      "thumb": "/visuals/acts/precept_jerusalem-caesarea.jpg",
      "full": "/visuals/acts/precept_jerusalem-caesarea.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jerusalem-caesarea.jpg"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-jesusknocking1",
      "title": "Precept Austin — Acts Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 16 — jesusknocking1.jpg.",
      "thumb": "/visuals/acts/precept_jesusknocking1.jpg",
      "full": "/visuals/acts/precept_jesusknocking1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jesusknocking1.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-josephinterpret",
      "title": "Precept Austin — Acts Chapter 7",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 7 — josephinterpret.jpg.",
      "thumb": "/visuals/acts/precept_josephinterpret.jpg",
      "full": "/visuals/acts/precept_josephinterpret.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/josephinterpret.jpg"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-josephjealous",
      "title": "Precept Austin — Acts Chapter 7",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 7 — josephjealous.jpg.",
      "thumb": "/visuals/acts/precept_josephjealous.jpg",
      "full": "/visuals/acts/precept_josephjealous.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/josephjealous.jpg"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-josephrecognized",
      "title": "Precept Austin — Acts Chapter 7",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 7 — josephrecognized.jpg.",
      "thumb": "/visuals/acts/precept_josephrecognized.jpg",
      "full": "/visuals/acts/precept_josephrecognized.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/josephrecognized.jpg"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-judges_chart_small",
      "title": "Precept Austin — Acts Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 13 — judges chart_small.gif.",
      "thumb": "/visuals/acts/precept_judges_chart_small.gif",
      "full": "/visuals/acts/precept_judges_chart_small.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Judges%20Chart_small.gif"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-justice",
      "title": "Precept Austin — Acts Chapter 28",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 28 — justice.jpg.",
      "thumb": "/visuals/acts/precept_justice.jpg",
      "full": "/visuals/acts/precept_justice.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/justice.jpg"
      },
      "chapters": [
        28
      ]
    },
    {
      "id": "precept-ch-lamb_cross",
      "title": "Precept Austin — Acts Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 8 — lamb cross.jpg.",
      "thumb": "/visuals/acts/precept_lamb_cross.jpg",
      "full": "/visuals/acts/precept_lamb_cross.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/lamb%20cross.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-lamb_passover",
      "title": "Precept Austin — Acts Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 8 — lamb passover.gif.",
      "thumb": "/visuals/acts/precept_lamb_passover.gif",
      "full": "/visuals/acts/precept_lamb_passover.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/lamb%20passover.gif"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-luke2",
      "title": "Precept Austin — Acts Chapters 26–28",
      "caption": "Bruce Hurt's commentary chart for Acts chapters 26–28 — luke2.jpg.",
      "thumb": "/visuals/acts/precept_luke2.jpg",
      "full": "/visuals/acts/precept_luke2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/luke2.jpg"
      },
      "chapters": [
        26,
        27,
        28
      ]
    },
    {
      "id": "precept-ch-lystra",
      "title": "Precept Austin — Acts Chapter 14",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 14 — lystra.png.",
      "thumb": "/visuals/acts/precept_lystra.png",
      "full": "/visuals/acts/precept_lystra.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/lystra.png"
      },
      "chapters": [
        14
      ]
    },
    {
      "id": "precept-ch-lystratotroas",
      "title": "Precept Austin — Acts Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 16 — lystratotroas.jpg.",
      "thumb": "/visuals/acts/precept_lystratotroas.jpg",
      "full": "/visuals/acts/precept_lystratotroas.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/lystratotroas.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-malta",
      "title": "Precept Austin — Acts Chapters 27–28",
      "caption": "Bruce Hurt's commentary chart for Acts chapters 27–28 — malta.jpg.",
      "thumb": "/visuals/acts/precept_malta.jpg",
      "full": "/visuals/acts/precept_malta.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/malta.jpg"
      },
      "chapters": [
        27,
        28
      ]
    },
    {
      "id": "precept-ch-maltakoura",
      "title": "Precept Austin — Acts Chapters 27–28",
      "caption": "Bruce Hurt's commentary chart for Acts chapters 27–28 — maltakoura.png.",
      "thumb": "/visuals/acts/precept_maltakoura.png",
      "full": "/visuals/acts/precept_maltakoura.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/maltakoura.png"
      },
      "chapters": [
        27,
        28
      ]
    },
    {
      "id": "precept-ch-messinastrait",
      "title": "Precept Austin — Acts Chapter 28",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 28 — messinastrait.jpg.",
      "thumb": "/visuals/acts/precept_messinastrait.jpg",
      "full": "/visuals/acts/precept_messinastrait.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/messinastrait.jpg"
      },
      "chapters": [
        28
      ]
    },
    {
      "id": "precept-ch-miletus-cos",
      "title": "Precept Austin — Acts Chapter 21",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 21 — miletus-cos.jpg.",
      "thumb": "/visuals/acts/precept_miletus-cos.jpg",
      "full": "/visuals/acts/precept_miletus-cos.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/miletus-cos.jpg"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-mosesnile",
      "title": "Precept Austin — Acts Chapter 7",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 7 — mosesnile.jpg.",
      "thumb": "/visuals/acts/precept_mosesnile.jpg",
      "full": "/visuals/acts/precept_mosesnile.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mosesnile.jpg"
      },
      "chapters": [
        7
      ]
    },
    {
      "id": "precept-ch-myra",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — myra.jpg.",
      "thumb": "/visuals/acts/precept_myra.jpg",
      "full": "/visuals/acts/precept_myra.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/myra.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-myra1",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — myra1.jpg.",
      "thumb": "/visuals/acts/precept_myra1.jpg",
      "full": "/visuals/acts/precept_myra1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/myra1.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-paphos",
      "title": "Precept Austin — Acts Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 13 — paphos.png.",
      "thumb": "/visuals/acts/precept_paphos.png",
      "full": "/visuals/acts/precept_paphos.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/paphos.png"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-paulagrippa",
      "title": "Precept Austin — Acts Chapters 25–26",
      "caption": "Bruce Hurt's commentary chart for Acts chapters 25–26 — paulagrippa.jpg.",
      "thumb": "/visuals/acts/precept_paulagrippa.jpg",
      "full": "/visuals/acts/precept_paulagrippa.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/paulagrippa.jpg"
      },
      "chapters": [
        25,
        26
      ]
    },
    {
      "id": "precept-ch-paulbarnabassplit",
      "title": "Precept Austin — Acts Chapter 15",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 15 — paulbarnabassplit.jpg.",
      "thumb": "/visuals/acts/precept_paulbarnabassplit.jpg",
      "full": "/visuals/acts/precept_paulbarnabassplit.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/paulbarnabassplit.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-paulcon",
      "title": "Precept Austin — Acts Chapters 9, 26",
      "caption": "Bruce Hurt's commentary chart for Acts chapters 9, 26 — paulcon.jpg.",
      "thumb": "/visuals/acts/precept_paulcon.jpg",
      "full": "/visuals/acts/precept_paulcon.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/paulcon.jpg"
      },
      "chapters": [
        9,
        26
      ]
    },
    {
      "id": "precept-ch-paulfestus",
      "title": "Precept Austin — Acts Chapter 25",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 25 — paulfestus.jpg.",
      "thumb": "/visuals/acts/precept_paulfestus.jpg",
      "full": "/visuals/acts/precept_paulfestus.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/paulfestus.jpg"
      },
      "chapters": [
        25
      ]
    },
    {
      "id": "precept-ch-peterlame",
      "title": "Precept Austin — Acts Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 3 — peterlame.jpg.",
      "thumb": "/visuals/acts/precept_peterlame.jpg",
      "full": "/visuals/acts/precept_peterlame.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/peterlame.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-petersvision",
      "title": "Precept Austin — Acts Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 10 — petersvision.jpg.",
      "thumb": "/visuals/acts/precept_petersvision.jpg",
      "full": "/visuals/acts/precept_petersvision.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/petersvision.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-philipmap",
      "title": "Precept Austin — Acts Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 8 — philipmap.jpg.",
      "thumb": "/visuals/acts/precept_philipmap.jpg",
      "full": "/visuals/acts/precept_philipmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/philipmap.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-piraeus",
      "title": "Precept Austin — Acts Chapter 17",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 17 — piraeus.jpg.",
      "thumb": "/visuals/acts/precept_piraeus.jpg",
      "full": "/visuals/acts/precept_piraeus.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/piraeus.JPG"
      },
      "chapters": [
        17
      ]
    },
    {
      "id": "precept-ch-psidianantioch",
      "title": "Precept Austin — Acts Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 13 — psidianantioch.png.",
      "thumb": "/visuals/acts/precept_psidianantioch.png",
      "full": "/visuals/acts/precept_psidianantioch.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/psidianantioch.png"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-rhegium",
      "title": "Precept Austin — Acts Chapter 28",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 28 — rhegium.jpg.",
      "thumb": "/visuals/acts/precept_rhegium.jpg",
      "full": "/visuals/acts/precept_rhegium.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/rhegium.jpg"
      },
      "chapters": [
        28
      ]
    },
    {
      "id": "precept-ch-rome1",
      "title": "Precept Austin — Acts Chapter 28",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 28 — rome1.jpg.",
      "thumb": "/visuals/acts/precept_rome1.jpg",
      "full": "/visuals/acts/precept_rome1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/rome1.jpg"
      },
      "chapters": [
        28
      ]
    },
    {
      "id": "precept-ch-romeancient",
      "title": "Precept Austin — Acts Chapter 28",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 28 — romeancient.jpg.",
      "thumb": "/visuals/acts/precept_romeancient.jpg",
      "full": "/visuals/acts/precept_romeancient.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/romeancient.jpg"
      },
      "chapters": [
        28
      ]
    },
    {
      "id": "precept-ch-rudder",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — rudder.jpg.",
      "thumb": "/visuals/acts/precept_rudder.jpg",
      "full": "/visuals/acts/precept_rudder.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/rudder.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-salamis",
      "title": "Precept Austin — Acts Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 13 — salamis.png.",
      "thumb": "/visuals/acts/precept_salamis.png",
      "full": "/visuals/acts/precept_salamis.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/salamis.png"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-salmone",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — salmone.jpg.",
      "thumb": "/visuals/acts/precept_salmone.jpg",
      "full": "/visuals/acts/precept_salmone.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/salmone.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-sanhedrin",
      "title": "Precept Austin — Acts Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 4 — sanhedrin.jpg.",
      "thumb": "/visuals/acts/precept_sanhedrin.jpg",
      "full": "/visuals/acts/precept_sanhedrin.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Sanhedrin.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-sanhedrinhall",
      "title": "Precept Austin — Acts Chapters 7, 22",
      "caption": "Bruce Hurt's commentary chart for Acts chapters 7, 22 — sanhedrinhall.jpg.",
      "thumb": "/visuals/acts/precept_sanhedrinhall.jpg",
      "full": "/visuals/acts/precept_sanhedrinhall.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sanhedrinhall.jpg"
      },
      "chapters": [
        7,
        22
      ]
    },
    {
      "id": "precept-ch-scourge2",
      "title": "Precept Austin — Acts Chapter 22",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 22 — scourge2.jpg.",
      "thumb": "/visuals/acts/precept_scourge2.jpg",
      "full": "/visuals/acts/precept_scourge2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/scourge2.jpg"
      },
      "chapters": [
        22
      ]
    },
    {
      "id": "precept-ch-secondjourholman",
      "title": "Precept Austin — Acts Chapters 16–17",
      "caption": "Bruce Hurt's commentary chart for Acts chapters 16–17 — secondjourholman.gif.",
      "thumb": "/visuals/acts/precept_secondjourholman.gif",
      "full": "/visuals/acts/precept_secondjourholman.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/secondjourholman.gif"
      },
      "chapters": [
        16,
        17
      ]
    },
    {
      "id": "precept-ch-sergius",
      "title": "Precept Austin — Acts Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 13 — sergius.png.",
      "thumb": "/visuals/acts/precept_sergius.png",
      "full": "/visuals/acts/precept_sergius.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sergius.png"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-shigella",
      "title": "Precept Austin — Acts Chapter 28",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 28 — shigella.jpg.",
      "thumb": "/visuals/acts/precept_shigella.jpg",
      "full": "/visuals/acts/precept_shigella.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shigella.jpg"
      },
      "chapters": [
        28
      ]
    },
    {
      "id": "precept-ch-ship",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — ship.jpg.",
      "thumb": "/visuals/acts/precept_ship.jpg",
      "full": "/visuals/acts/precept_ship.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ship.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-shipeye",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — shipeye.jpg.",
      "thumb": "/visuals/acts/precept_shipeye.jpg",
      "full": "/visuals/acts/precept_shipeye.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shipeye.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-shipsounding",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — shipsounding.jpg.",
      "thumb": "/visuals/acts/precept_shipsounding.jpg",
      "full": "/visuals/acts/precept_shipsounding.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shipsounding.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-shipwreck",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — shipwreck.jpg.",
      "thumb": "/visuals/acts/precept_shipwreck.jpg",
      "full": "/visuals/acts/precept_shipwreck.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shipwreck.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-shut",
      "title": "Precept Austin — Acts Chapter 15",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 15 — shut.jpg.",
      "thumb": "/visuals/acts/precept_shut.jpg",
      "full": "/visuals/acts/precept_shut.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/shut.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-sidon1",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — sidon1.jpg.",
      "thumb": "/visuals/acts/precept_sidon1.jpg",
      "full": "/visuals/acts/precept_sidon1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sidon1.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-sidoncyprus",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — sidoncyprus.png.",
      "thumb": "/visuals/acts/precept_sidoncyprus.png",
      "full": "/visuals/acts/precept_sidoncyprus.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sidoncyprus.png"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-simonmagus",
      "title": "Precept Austin — Acts Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 8 — simonmagus.jpg.",
      "thumb": "/visuals/acts/precept_simonmagus.jpg",
      "full": "/visuals/acts/precept_simonmagus.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/simonmagus.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-solomonporch",
      "title": "Precept Austin — Acts Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 3 — solomonporch.jpg.",
      "thumb": "/visuals/acts/precept_solomonporch.jpg",
      "full": "/visuals/acts/precept_solomonporch.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/solomonporch.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-straightstreet",
      "title": "Precept Austin — Acts Chapter 9",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 9 — straightstreet.jpeg.",
      "thumb": "/visuals/acts/precept_straightstreet.jpg",
      "full": "/visuals/acts/precept_straightstreet.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/straightstreet.jpeg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-synagogue",
      "title": "Precept Austin — Acts Chapters 13, 14, 17",
      "caption": "Bruce Hurt's commentary chart for Acts chapters 13, 14, 17 — synagogue.png.",
      "thumb": "/visuals/acts/precept_synagogue.png",
      "full": "/visuals/acts/precept_synagogue.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/synagogue.png"
      },
      "chapters": [
        13,
        14,
        17
      ]
    },
    {
      "id": "precept-ch-syracuse",
      "title": "Precept Austin — Acts Chapter 28",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 28 — syracuse.jpg.",
      "thumb": "/visuals/acts/precept_syracuse.jpg",
      "full": "/visuals/acts/precept_syracuse.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/syracuse.jpg"
      },
      "chapters": [
        28
      ]
    },
    {
      "id": "precept-ch-syrtis",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — syrtis.jpg.",
      "thumb": "/visuals/acts/precept_syrtis.jpg",
      "full": "/visuals/acts/precept_syrtis.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/syrtis.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-temple_6_small",
      "title": "Precept Austin — Acts Chapters 10, 21",
      "caption": "Bruce Hurt's commentary chart for Acts chapters 10, 21 — temple_6_small.png.",
      "thumb": "/visuals/acts/precept_temple_6_small.png",
      "full": "/visuals/acts/precept_temple_6_small.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/temple_6_small.png"
      },
      "chapters": [
        10,
        21
      ]
    },
    {
      "id": "precept-ch-templecomplex",
      "title": "Precept Austin — Acts Chapter 21",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 21 — templecomplex.jpg.",
      "thumb": "/visuals/acts/precept_templecomplex.jpg",
      "full": "/visuals/acts/precept_templecomplex.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/templecomplex.jpg"
      },
      "chapters": [
        21
      ]
    },
    {
      "id": "precept-ch-the_sacrifice_of_isaac_small",
      "title": "Precept Austin — Acts Chapter 8",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 8 — the_sacrifice_of_isaac_small.jpg.",
      "thumb": "/visuals/acts/precept_the_sacrifice_of_isaac_small.jpg",
      "full": "/visuals/acts/precept_the_sacrifice_of_isaac_small.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/The_Sacrifice_of_Isaac_small.jpg"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-thyatira",
      "title": "Precept Austin — Acts Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 16 — thyatira.jpg.",
      "thumb": "/visuals/acts/precept_thyatira.jpg",
      "full": "/visuals/acts/precept_thyatira.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/thyatira.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-timeflies",
      "title": "Precept Austin — Acts Chapter 17",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 17 — timeflies.jpg.",
      "thumb": "/visuals/acts/precept_timeflies.jpg",
      "full": "/visuals/acts/precept_timeflies.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/timeflies.jpg"
      },
      "chapters": [
        17
      ]
    },
    {
      "id": "precept-ch-timeline2tim",
      "title": "Precept Austin — Acts Chapter 28",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 28 — timeline2tim.jpg.",
      "thumb": "/visuals/acts/precept_timeline2tim.jpg",
      "full": "/visuals/acts/precept_timeline2tim.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/timeline2tim.jpg"
      },
      "chapters": [
        28
      ]
    },
    {
      "id": "precept-ch-timelineacts",
      "title": "Precept Austin — Acts Chapter 27",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 27 — timelineacts.jpg.",
      "thumb": "/visuals/acts/precept_timelineacts.jpg",
      "full": "/visuals/acts/precept_timelineacts.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/timelineacts.jpg"
      },
      "chapters": [
        27
      ]
    },
    {
      "id": "precept-ch-troastomiletus",
      "title": "Precept Austin — Acts Chapter 20",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 20 — troastomiletus.png.",
      "thumb": "/visuals/acts/precept_troastomiletus.png",
      "full": "/visuals/acts/precept_troastomiletus.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/troastomiletus.png"
      },
      "chapters": [
        20
      ]
    },
    {
      "id": "precept-ch-troastophillipi",
      "title": "Precept Austin — Acts Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 16 — troastophillipi.jpg.",
      "thumb": "/visuals/acts/precept_troastophillipi.jpg",
      "full": "/visuals/acts/precept_troastophillipi.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/troastophillipi.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-tyre-sidon",
      "title": "Precept Austin — Acts Chapter 11",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 11 — tyre-sidon.jpg.",
      "thumb": "/visuals/acts/precept_tyre-sidon.jpg",
      "full": "/visuals/acts/precept_tyre-sidon.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/tyre-sidon.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-unkgod_small",
      "title": "Precept Austin — Acts Chapter 17",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 17 — unkgod_small.jpg.",
      "thumb": "/visuals/acts/precept_unkgod_small.jpg",
      "full": "/visuals/acts/precept_unkgod_small.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/unkgod_small.jpg"
      },
      "chapters": [
        17
      ]
    },
    {
      "id": "precept-ch-viaegnatia",
      "title": "Precept Austin — Acts Chapters 16–17",
      "caption": "Bruce Hurt's commentary chart for Acts chapters 16–17 — viaegnatia.jpg.",
      "thumb": "/visuals/acts/precept_viaegnatia.jpg",
      "full": "/visuals/acts/precept_viaegnatia.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/viaegnatia.JPG"
      },
      "chapters": [
        16,
        17
      ]
    },
    {
      "id": "precept-ch-whitewash",
      "title": "Precept Austin — Acts Chapter 23",
      "caption": "Bruce Hurt's commentary chart for Acts chapter 23 — whitewash.jpg.",
      "thumb": "/visuals/acts/precept_whitewash.jpg",
      "full": "/visuals/acts/precept_whitewash.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/whitewash.jpg"
      },
      "chapters": [
        23
      ]
    }
  ]
},
  'romans': {
  "videos": [
    {
      "youtubeId": "6KrQ1ZwUlPU",
      "title": "Romans 1–4 — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/6KrQ1ZwUlPU?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/romans/",
      "chapterStart": 1,
      "chapterEnd": 4
    },
    {
      "youtubeId": "ZuEsGgIFdso",
      "title": "Romans 5–16 — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/ZuEsGgIFdso?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/romans/",
      "chapterStart": 5,
      "chapterEnd": 16
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Romans",
      "caption": "Hand-illustrated single-page overview of Romans, tracing the book's literary design and major themes.",
      "thumb": "/visuals/romans/bibleproject_poster.jpg",
      "full": "/visuals/romans/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-romans/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Romans Bible Chart",
      "caption": "Single-page structural chart of Romans, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/romans/swindoll_chart.png",
      "full": "/visuals/romans/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Romans-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Romans Chart",
      "caption": "Bruce Hurt's inductive-study chart for Romans, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/romans/precept_chart.png",
      "full": "/visuals/romans/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/romans.png"
      }
    },
    {
      "id": "precept-book-romansroad",
      "title": "Precept Austin — Romans (romansroad.gif)",
      "caption": "Bruce Hurt's chart embedded across multiple Romans chapters on Precept Austin's commentary.",
      "thumb": "/visuals/romans/precept_romansroad.gif",
      "full": "/visuals/romans/precept_romansroad.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/romansroad.gif"
      }
    },
    {
      "id": "precept-book-romeesv",
      "title": "Precept Austin — Romans (romeesv.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Romans chapters on Precept Austin's commentary.",
      "thumb": "/visuals/romans/precept_romeesv.jpg",
      "full": "/visuals/romans/precept_romeesv.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/romeesv.jpg"
      }
    },
    {
      "id": "precept-ch-dis10-3",
      "title": "Precept Austin — Romans Chapter 9",
      "caption": "Bruce Hurt's commentary chart for Romans chapter 9 — dis10-3.gif.",
      "thumb": "/visuals/romans/precept_dis10-3.gif",
      "full": "/visuals/romans/precept_dis10-3.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/dis10-3.gif"
      },
      "chapters": [
        9
      ]
    }
  ]
},
  '1-corinthians': {
  "videos": [
    {
      "youtubeId": "veU6dB3996o",
      "title": "1 Corinthians — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/veU6dB3996o?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/1-corinthians/",
      "chapterStart": 1,
      "chapterEnd": 16
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: 1 Corinthians",
      "caption": "Hand-illustrated single-page overview of 1 Corinthians, tracing the book's literary design and major themes.",
      "thumb": "/visuals/1-corinthians/bibleproject_poster.jpg",
      "full": "/visuals/1-corinthians/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-1-corinthians/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — 1 Corinthians Bible Chart",
      "caption": "Single-page structural chart of 1 Corinthians, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/1-corinthians/swindoll_chart.png",
      "full": "/visuals/1-corinthians/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/1-Corinthians-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-book-1cor_problems",
      "title": "Precept Austin — 1 Corinthians (1cor_problems.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Corinthians chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-corinthians/precept_1cor_problems.png",
      "full": "/visuals/1-corinthians/precept_1cor_problems.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1cor_problems.png"
      }
    },
    {
      "id": "precept-book-corinth",
      "title": "Precept Austin — 1 Corinthians (corinth.gif)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Corinthians chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-corinthians/precept_corinth.gif",
      "full": "/visuals/1-corinthians/precept_corinth.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/corinth.gif"
      }
    },
    {
      "id": "precept-book-corinthesv",
      "title": "Precept Austin — 1 Corinthians (corinthesv.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Corinthians chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-corinthians/precept_corinthesv.jpg",
      "full": "/visuals/1-corinthians/precept_corinthesv.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/corinthesv.jpg"
      }
    },
    {
      "id": "precept-ch-3missionaryjourney",
      "title": "Precept Austin — 1 Corinthians Chapter 16",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 16 — 3missionaryjourney.gif.",
      "thumb": "/visuals/1-corinthians/precept_3missionaryjourney.gif",
      "full": "/visuals/1-corinthians/precept_3missionaryjourney.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/3missionaryjourney.gif"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-acrocorinth",
      "title": "Precept Austin — 1 Corinthians Chapter 6",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 6 — acrocorinth.jpg.",
      "thumb": "/visuals/1-corinthians/precept_acrocorinth.jpg",
      "full": "/visuals/1-corinthians/precept_acrocorinth.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/acrocorinth.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-aphrodite",
      "title": "Precept Austin — 1 Corinthians Chapter 3",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 3 — aphrodite.jpg.",
      "thumb": "/visuals/1-corinthians/precept_aphrodite.jpg",
      "full": "/visuals/1-corinthians/precept_aphrodite.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/aphrodite.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-appear",
      "title": "Precept Austin — 1 Corinthians Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 15 — appear.jpg.",
      "thumb": "/visuals/1-corinthians/precept_appear.jpg",
      "full": "/visuals/1-corinthians/precept_appear.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/appear.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-bc_runner1",
      "title": "Precept Austin — 1 Corinthians Chapter 9",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 9 — bc_runner1.gif.",
      "thumb": "/visuals/1-corinthians/precept_bc_runner1.gif",
      "full": "/visuals/1-corinthians/precept_bc_runner1.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bc_runner1.gif"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-bema",
      "title": "Precept Austin — 1 Corinthians Chapter 9",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 9 — bema.jpg.",
      "thumb": "/visuals/1-corinthians/precept_bema.jpg",
      "full": "/visuals/1-corinthians/precept_bema.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bema.jpg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-bema1",
      "title": "Precept Austin — 1 Corinthians Chapter 6",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 6 — bema1.jpg.",
      "thumb": "/visuals/1-corinthians/precept_bema1.jpg",
      "full": "/visuals/1-corinthians/precept_bema1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bema1.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-bema2",
      "title": "Precept Austin — 1 Corinthians Chapter 6",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 6 — bema2.jpg.",
      "thumb": "/visuals/1-corinthians/precept_bema2.jpg",
      "full": "/visuals/1-corinthians/precept_bema2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bema2.jpg"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-benhur",
      "title": "Precept Austin — 1 Corinthians Chapter 4",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 4 — benhur.jpg.",
      "thumb": "/visuals/1-corinthians/precept_benhur.jpg",
      "full": "/visuals/1-corinthians/precept_benhur.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/benhur.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-box",
      "title": "Precept Austin — 1 Corinthians Chapter 9",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 9 — box.jpg.",
      "thumb": "/visuals/1-corinthians/precept_box.jpg",
      "full": "/visuals/1-corinthians/precept_box.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/box.jpg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-bronze",
      "title": "Precept Austin — 1 Corinthians Chapter 10",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 10 — bronze.jpg.",
      "thumb": "/visuals/1-corinthians/precept_bronze.jpg",
      "full": "/visuals/1-corinthians/precept_bronze.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bronze.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-calen",
      "title": "Precept Austin — 1 Corinthians Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 15 — calen.jpg.",
      "thumb": "/visuals/1-corinthians/precept_calen.jpg",
      "full": "/visuals/1-corinthians/precept_calen.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/calen.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-calf",
      "title": "Precept Austin — 1 Corinthians Chapter 10",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 10 — calf.jpg.",
      "thumb": "/visuals/1-corinthians/precept_calf.jpg",
      "full": "/visuals/1-corinthians/precept_calf.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/calf.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-carnal",
      "title": "Precept Austin — 1 Corinthians Chapter 3",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 3 — carnal.jpg.",
      "thumb": "/visuals/1-corinthians/precept_carnal.jpg",
      "full": "/visuals/1-corinthians/precept_carnal.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/carnal.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-censer1",
      "title": "Precept Austin — 1 Corinthians Chapter 10",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 10 — censer1.jpg.",
      "thumb": "/visuals/1-corinthians/precept_censer1.jpg",
      "full": "/visuals/1-corinthians/precept_censer1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/censer1.jpg"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-charity",
      "title": "Precept Austin — 1 Corinthians Chapter 16",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 16 — charity.jpg.",
      "thumb": "/visuals/1-corinthians/precept_charity.jpg",
      "full": "/visuals/1-corinthians/precept_charity.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/charity.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-corinth_city",
      "title": "Precept Austin — 1 Corinthians Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 1 — corinth_city.jpg.",
      "thumb": "/visuals/1-corinthians/precept_corinth_city.jpg",
      "full": "/visuals/1-corinthians/precept_corinth_city.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/corinth_city.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-corinthpix",
      "title": "Precept Austin — 1 Corinthians Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 1 — corinthpix.png.",
      "thumb": "/visuals/1-corinthians/precept_corinthpix.png",
      "full": "/visuals/1-corinthians/precept_corinthpix.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/corinthpix.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-dine",
      "title": "Precept Austin — 1 Corinthians Chapters 8, 10",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapters 8, 10 — dine.jpg.",
      "thumb": "/visuals/1-corinthians/precept_dine.jpg",
      "full": "/visuals/1-corinthians/precept_dine.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/dine.jpg"
      },
      "chapters": [
        8,
        10
      ]
    },
    {
      "id": "precept-ch-family",
      "title": "Precept Austin — 1 Corinthians Chapter 6",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 6 — family.png.",
      "thumb": "/visuals/1-corinthians/precept_family.png",
      "full": "/visuals/1-corinthians/precept_family.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/family.png"
      },
      "chapters": [
        6
      ]
    },
    {
      "id": "precept-ch-firstfruits1",
      "title": "Precept Austin — 1 Corinthians Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 15 — firstfruits1.jpg.",
      "thumb": "/visuals/1-corinthians/precept_firstfruits1.jpg",
      "full": "/visuals/1-corinthians/precept_firstfruits1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/firstfruits1.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-galley",
      "title": "Precept Austin — 1 Corinthians Chapter 4",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 4 — galley.jpg.",
      "thumb": "/visuals/1-corinthians/precept_galley.jpg",
      "full": "/visuals/1-corinthians/precept_galley.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/galley.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-gifts",
      "title": "Precept Austin — 1 Corinthians Chapter 12",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 12 — gifts.jpg.",
      "thumb": "/visuals/1-corinthians/precept_gifts.jpg",
      "full": "/visuals/1-corinthians/precept_gifts.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gifts.jpg"
      },
      "chapters": [
        12
      ]
    },
    {
      "id": "precept-ch-giftvariety",
      "title": "Precept Austin — 1 Corinthians Chapter 12",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 12 — giftvariety.jpg.",
      "thumb": "/visuals/1-corinthians/precept_giftvariety.jpg",
      "full": "/visuals/1-corinthians/precept_giftvariety.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/giftvariety.jpg"
      },
      "chapters": [
        12
      ]
    },
    {
      "id": "precept-ch-imitate",
      "title": "Precept Austin — 1 Corinthians Chapter 11",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 11 — imitate.jpg.",
      "thumb": "/visuals/1-corinthians/precept_imitate.jpg",
      "full": "/visuals/1-corinthians/precept_imitate.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/imitate.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-imitate1",
      "title": "Precept Austin — 1 Corinthians Chapter 11",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 11 — imitate1.jpg.",
      "thumb": "/visuals/1-corinthians/precept_imitate1.jpg",
      "full": "/visuals/1-corinthians/precept_imitate1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/imitate1.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-immortal",
      "title": "Precept Austin — 1 Corinthians Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 15 — immortal.jpg.",
      "thumb": "/visuals/1-corinthians/precept_immortal.jpg",
      "full": "/visuals/1-corinthians/precept_immortal.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/immortal.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-isthmian",
      "title": "Precept Austin — 1 Corinthians Chapter 9",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 9 — isthmian.jpg.",
      "thumb": "/visuals/1-corinthians/precept_isthmian.jpg",
      "full": "/visuals/1-corinthians/precept_isthmian.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/isthmian.jpg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-jealousy",
      "title": "Precept Austin — 1 Corinthians Chapter 13",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 13 — jealousy.jpg.",
      "thumb": "/visuals/1-corinthians/precept_jealousy.jpg",
      "full": "/visuals/1-corinthians/precept_jealousy.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jealousy.jpg"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-kog",
      "title": "Precept Austin — 1 Corinthians Chapters 6, 15",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapters 6, 15 — kog.jpg.",
      "thumb": "/visuals/1-corinthians/precept_kog.jpg",
      "full": "/visuals/1-corinthians/precept_kog.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/kog.jpg"
      },
      "chapters": [
        6,
        15
      ]
    },
    {
      "id": "precept-ch-mirror1",
      "title": "Precept Austin — 1 Corinthians Chapter 13",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 13 — mirror1.jpg.",
      "thumb": "/visuals/1-corinthians/precept_mirror1.jpg",
      "full": "/visuals/1-corinthians/precept_mirror1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mirror1.jpg"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-neck",
      "title": "Precept Austin — 1 Corinthians Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 15 — neck.jpg.",
      "thumb": "/visuals/1-corinthians/precept_neck.jpg",
      "full": "/visuals/1-corinthians/precept_neck.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/neck.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-pedagogue",
      "title": "Precept Austin — 1 Corinthians Chapter 4",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 4 — pedagogue.jpg.",
      "thumb": "/visuals/1-corinthians/precept_pedagogue.jpg",
      "full": "/visuals/1-corinthians/precept_pedagogue.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/pedagogue.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-porn",
      "title": "Precept Austin — 1 Corinthians Chapter 5",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 5 — porn.jpg.",
      "thumb": "/visuals/1-corinthians/precept_porn.jpg",
      "full": "/visuals/1-corinthians/precept_porn.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/porn.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-seed",
      "title": "Precept Austin — 1 Corinthians Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 15 — seed.jpg.",
      "thumb": "/visuals/1-corinthians/precept_seed.jpg",
      "full": "/visuals/1-corinthians/precept_seed.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/seed.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-soilshallow",
      "title": "Precept Austin — 1 Corinthians Chapter 15",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 15 — soilshallow.jpg.",
      "thumb": "/visuals/1-corinthians/precept_soilshallow.jpg",
      "full": "/visuals/1-corinthians/precept_soilshallow.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/soilshallow.jpg"
      },
      "chapters": [
        15
      ]
    },
    {
      "id": "precept-ch-spirit1",
      "title": "Precept Austin — 1 Corinthians Chapter 12",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 12 — spirit1.gif.",
      "thumb": "/visuals/1-corinthians/precept_spirit1.gif",
      "full": "/visuals/1-corinthians/precept_spirit1.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/spirit1.gif"
      },
      "chapters": [
        12
      ]
    },
    {
      "id": "precept-ch-spurgeonpodium",
      "title": "Precept Austin — 1 Corinthians Chapter 2",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 2 — spurgeonpodium.jpg.",
      "thumb": "/visuals/1-corinthians/precept_spurgeonpodium.jpg",
      "full": "/visuals/1-corinthians/precept_spurgeonpodium.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/spurgeonpodium.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-taylor",
      "title": "Precept Austin — 1 Corinthians Chapter 9",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 9 — taylor.jpg.",
      "thumb": "/visuals/1-corinthians/precept_taylor.jpg",
      "full": "/visuals/1-corinthians/precept_taylor.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/taylor.jpg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-thresh",
      "title": "Precept Austin — 1 Corinthians Chapter 9",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 9 — thresh.jpg.",
      "thumb": "/visuals/1-corinthians/precept_thresh.jpg",
      "full": "/visuals/1-corinthians/precept_thresh.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/thresh.jpg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-timelineface",
      "title": "Precept Austin — 1 Corinthians Chapter 13",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 13 — timelineface.jpg.",
      "thumb": "/visuals/1-corinthians/precept_timelineface.jpg",
      "full": "/visuals/1-corinthians/precept_timelineface.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/timelineface.jpg"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-wisdom1",
      "title": "Precept Austin — 1 Corinthians Chapters 1–2",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapters 1–2 — wisdom1.jpg.",
      "thumb": "/visuals/1-corinthians/precept_wisdom1.jpg",
      "full": "/visuals/1-corinthians/precept_wisdom1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/wisdom1.jpg"
      },
      "chapters": [
        1,
        2
      ]
    },
    {
      "id": "precept-ch-wreath",
      "title": "Precept Austin — 1 Corinthians Chapter 9",
      "caption": "Bruce Hurt's commentary chart for 1 Corinthians chapter 9 — wreath.jpg.",
      "thumb": "/visuals/1-corinthians/precept_wreath.jpg",
      "full": "/visuals/1-corinthians/precept_wreath.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/wreath.jpg"
      },
      "chapters": [
        9
      ]
    }
  ]
},
  '2-corinthians': {
  "videos": [
    {
      "youtubeId": "3lfPK2vfC54",
      "title": "2 Corinthians — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/3lfPK2vfC54?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/2-corinthians/",
      "chapterStart": 1,
      "chapterEnd": 13
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: 2 Corinthians",
      "caption": "Hand-illustrated single-page overview of 2 Corinthians, tracing the book's literary design and major themes.",
      "thumb": "/visuals/2-corinthians/bibleproject_poster.jpg",
      "full": "/visuals/2-corinthians/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-2-corinthians/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — 2 Corinthians Bible Chart",
      "caption": "Single-page structural chart of 2 Corinthians, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/2-corinthians/swindoll_chart.png",
      "full": "/visuals/2-corinthians/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/2-Corinthians-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-book-2cor",
      "title": "Precept Austin — 2 Corinthians (2cor.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Corinthians chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-corinthians/precept_2cor.png",
      "full": "/visuals/2-corinthians/precept_2cor.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/2cor.png"
      }
    },
    {
      "id": "precept-book-3missionaryjourney",
      "title": "Precept Austin — 2 Corinthians (3missionaryjourney.gif)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Corinthians chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-corinthians/precept_3missionaryjourney.gif",
      "full": "/visuals/2-corinthians/precept_3missionaryjourney.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/3missionaryjourney.gif"
      }
    },
    {
      "id": "precept-book-acrocorinth",
      "title": "Precept Austin — 2 Corinthians (acrocorinth.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Corinthians chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-corinthians/precept_acrocorinth.jpg",
      "full": "/visuals/2-corinthians/precept_acrocorinth.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/acrocorinth.jpg"
      }
    },
    {
      "id": "precept-book-corinth",
      "title": "Precept Austin — 2 Corinthians (corinth.gif)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Corinthians chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-corinthians/precept_corinth.gif",
      "full": "/visuals/2-corinthians/precept_corinth.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/corinth.gif"
      }
    },
    {
      "id": "precept-book-corinth",
      "title": "Precept Austin — 2 Corinthians (corinth.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Corinthians chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-corinthians/precept_corinth.jpg",
      "full": "/visuals/2-corinthians/precept_corinth.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/corinth.jpg"
      }
    },
    {
      "id": "precept-book-corinth_city",
      "title": "Precept Austin — 2 Corinthians (corinth_city.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Corinthians chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-corinthians/precept_corinth_city.jpg",
      "full": "/visuals/2-corinthians/precept_corinth_city.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/corinth_city.jpg"
      }
    },
    {
      "id": "precept-book-letter",
      "title": "Precept Austin — 2 Corinthians (letter.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Corinthians chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-corinthians/precept_letter.jpg",
      "full": "/visuals/2-corinthians/precept_letter.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/letter.jpg"
      }
    },
    {
      "id": "precept-ch-3missionaryjourney",
      "title": "Precept Austin — 2 Corinthians Chapters 1–2",
      "caption": "Bruce Hurt's commentary chart for 2 Corinthians chapters 1–2 — 3missionaryjourney.gif.",
      "thumb": "/visuals/2-corinthians/precept_3missionaryjourney.gif",
      "full": "/visuals/2-corinthians/precept_3missionaryjourney.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/3missionaryjourney.gif"
      },
      "chapters": [
        1,
        2
      ]
    },
    {
      "id": "precept-ch-acrocorinth",
      "title": "Precept Austin — 2 Corinthians Chapters 1, 8, 9",
      "caption": "Bruce Hurt's commentary chart for 2 Corinthians chapters 1, 8, 9 — acrocorinth.jpg.",
      "thumb": "/visuals/2-corinthians/precept_acrocorinth.jpg",
      "full": "/visuals/2-corinthians/precept_acrocorinth.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/acrocorinth.jpg"
      },
      "chapters": [
        1,
        8,
        9
      ]
    },
    {
      "id": "precept-ch-bema2",
      "title": "Precept Austin — 2 Corinthians Chapter 5",
      "caption": "Bruce Hurt's commentary chart for 2 Corinthians chapter 5 — bema2.jpg.",
      "thumb": "/visuals/2-corinthians/precept_bema2.jpg",
      "full": "/visuals/2-corinthians/precept_bema2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bema2.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-bemajesus",
      "title": "Precept Austin — 2 Corinthians Chapter 5",
      "caption": "Bruce Hurt's commentary chart for 2 Corinthians chapter 5 — bemajesus.jpg.",
      "thumb": "/visuals/2-corinthians/precept_bemajesus.jpg",
      "full": "/visuals/2-corinthians/precept_bemajesus.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bemajesus.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-corinth",
      "title": "Precept Austin — 2 Corinthians Chapters 1, 8, 9",
      "caption": "Bruce Hurt's commentary chart for 2 Corinthians chapters 1, 8, 9 — corinth.jpg.",
      "thumb": "/visuals/2-corinthians/precept_corinth.jpg",
      "full": "/visuals/2-corinthians/precept_corinth.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/corinth.jpg"
      },
      "chapters": [
        1,
        8,
        9
      ]
    },
    {
      "id": "precept-ch-equil",
      "title": "Precept Austin — 2 Corinthians Chapter 8",
      "caption": "Bruce Hurt's commentary chart for 2 Corinthians chapter 8 — equil.png.",
      "thumb": "/visuals/2-corinthians/precept_equil.png",
      "full": "/visuals/2-corinthians/precept_equil.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/equil.png"
      },
      "chapters": [
        8
      ]
    },
    {
      "id": "precept-ch-fust",
      "title": "Precept Austin — 2 Corinthians Chapter 11",
      "caption": "Bruce Hurt's commentary chart for 2 Corinthians chapter 11 — fust.jpg.",
      "thumb": "/visuals/2-corinthians/precept_fust.jpg",
      "full": "/visuals/2-corinthians/precept_fust.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/fust.jpg"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-giving",
      "title": "Precept Austin — 2 Corinthians Chapters 8–9",
      "caption": "Bruce Hurt's commentary chart for 2 Corinthians chapters 8–9 — giving.jpg.",
      "thumb": "/visuals/2-corinthians/precept_giving.jpg",
      "full": "/visuals/2-corinthians/precept_giving.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/giving.jpg"
      },
      "chapters": [
        8,
        9
      ]
    },
    {
      "id": "precept-ch-letter",
      "title": "Precept Austin — 2 Corinthians Chapters 1, 9",
      "caption": "Bruce Hurt's commentary chart for 2 Corinthians chapters 1, 9 — letter.jpg.",
      "thumb": "/visuals/2-corinthians/precept_letter.jpg",
      "full": "/visuals/2-corinthians/precept_letter.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/letter.jpg"
      },
      "chapters": [
        1,
        9
      ]
    },
    {
      "id": "precept-ch-triumphal",
      "title": "Precept Austin — 2 Corinthians Chapter 2",
      "caption": "Bruce Hurt's commentary chart for 2 Corinthians chapter 2 — triumphal.jpg.",
      "thumb": "/visuals/2-corinthians/precept_triumphal.jpg",
      "full": "/visuals/2-corinthians/precept_triumphal.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/triumphal.jpg"
      },
      "chapters": [
        2
      ]
    }
  ]
},
  'galatians': {
  "videos": [
    {
      "youtubeId": "vmx4UjRFp0M",
      "title": "Galatians — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/vmx4UjRFp0M?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/galatians/",
      "chapterStart": 1,
      "chapterEnd": 6
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Galatians",
      "caption": "Hand-illustrated single-page overview of Galatians, tracing the book's literary design and major themes.",
      "thumb": "/visuals/galatians/bibleproject_poster.jpg",
      "full": "/visuals/galatians/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-galatians/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Galatians Bible Chart",
      "caption": "Single-page structural chart of Galatians, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/galatians/swindoll_chart.png",
      "full": "/visuals/galatians/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Galatians-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-book-galmap",
      "title": "Precept Austin — Galatians (galmap.gif)",
      "caption": "Bruce Hurt's chart embedded across multiple Galatians chapters on Precept Austin's commentary.",
      "thumb": "/visuals/galatians/precept_galmap.gif",
      "full": "/visuals/galatians/precept_galmap.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/galmap.gif"
      }
    },
    {
      "id": "precept-book-gal",
      "title": "Precept Austin — Galatians (gal.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Galatians chapters on Precept Austin's commentary.",
      "thumb": "/visuals/galatians/precept_gal.png",
      "full": "/visuals/galatians/precept_gal.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gal.png"
      }
    },
    {
      "id": "precept-book-galtiming",
      "title": "Precept Austin — Galatians (galtiming.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Galatians chapters on Precept Austin's commentary.",
      "thumb": "/visuals/galatians/precept_galtiming.png",
      "full": "/visuals/galatians/precept_galtiming.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/galtiming.png"
      }
    },
    {
      "id": "precept-ch-430",
      "title": "Precept Austin — Galatians Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Galatians chapter 3 — 430.jpg.",
      "thumb": "/visuals/galatians/precept_430.jpg",
      "full": "/visuals/galatians/precept_430.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/430.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-galchron",
      "title": "Precept Austin — Galatians Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Galatians chapter 1 — galchron.png.",
      "thumb": "/visuals/galatians/precept_galchron.png",
      "full": "/visuals/galatians/precept_galchron.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/galchron.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-liberty1",
      "title": "Precept Austin — Galatians Chapter 5",
      "caption": "Bruce Hurt's commentary chart for Galatians chapter 5 — liberty1.jpg.",
      "thumb": "/visuals/galatians/precept_liberty1.jpg",
      "full": "/visuals/galatians/precept_liberty1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/liberty1.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-mirror",
      "title": "Precept Austin — Galatians Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Galatians chapter 3 — mirror.jpg.",
      "thumb": "/visuals/galatians/precept_mirror.jpg",
      "full": "/visuals/galatians/precept_mirror.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mirror.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-paulpeter",
      "title": "Precept Austin — Galatians Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Galatians chapter 2 — paulpeter.jpg.",
      "thumb": "/visuals/galatians/precept_paulpeter.jpg",
      "full": "/visuals/galatians/precept_paulpeter.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/paulpeter.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-peda",
      "title": "Precept Austin — Galatians Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Galatians chapter 3 — peda.jpg.",
      "thumb": "/visuals/galatians/precept_peda.jpg",
      "full": "/visuals/galatians/precept_peda.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/peda.jpg"
      },
      "chapters": [
        3
      ]
    }
  ]
},
  'ephesians': {
  "videos": [
    {
      "youtubeId": "Y71r-T98E2Q",
      "title": "Ephesians — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/Y71r-T98E2Q?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/ephesians/",
      "chapterStart": 1,
      "chapterEnd": 6
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Ephesians",
      "caption": "Hand-illustrated single-page overview of Ephesians, tracing the book's literary design and major themes.",
      "thumb": "/visuals/ephesians/bibleproject_poster.jpg",
      "full": "/visuals/ephesians/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-ephesians/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Ephesians Bible Chart",
      "caption": "Single-page structural chart of Ephesians, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/ephesians/swindoll_chart.png",
      "full": "/visuals/ephesians/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Ephesians-Bible-chart.pdf"
      }
    }
  ]
},
  'philippians': {
  "videos": [
    {
      "youtubeId": "oE9qqW1-BkU",
      "title": "Philippians — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/oE9qqW1-BkU?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/philippians/",
      "chapterStart": 1,
      "chapterEnd": 4
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Philippians",
      "caption": "Hand-illustrated single-page overview of Philippians, tracing the book's literary design and major themes.",
      "thumb": "/visuals/philippians/bibleproject_poster.jpg",
      "full": "/visuals/philippians/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-philippians/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Philippians Bible Chart",
      "caption": "Single-page structural chart of Philippians, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/philippians/swindoll_chart.png",
      "full": "/visuals/philippians/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Philippians-Bible-chart.pdf"
      }
    }
  ]
},
  'colossians': {
  "videos": [
    {
      "youtubeId": "pXTXlDxQsvc",
      "title": "Colossians — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/pXTXlDxQsvc?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/colossians/",
      "chapterStart": 1,
      "chapterEnd": 4
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Colossians",
      "caption": "Hand-illustrated single-page overview of Colossians, tracing the book's literary design and major themes.",
      "thumb": "/visuals/colossians/bibleproject_poster.jpg",
      "full": "/visuals/colossians/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-colossians/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Colossians Bible Chart",
      "caption": "Single-page structural chart of Colossians, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/colossians/swindoll_chart.png",
      "full": "/visuals/colossians/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Colossians-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-book-col",
      "title": "Precept Austin — Colossians (col.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Colossians chapters on Precept Austin's commentary.",
      "thumb": "/visuals/colossians/precept_col.png",
      "full": "/visuals/colossians/precept_col.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/col.png"
      }
    },
    {
      "id": "precept-ch-artesian_well",
      "title": "Precept Austin — Colossians Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Colossians chapter 3 — artesian_well.png.",
      "thumb": "/visuals/colossians/precept_artesian_well.png",
      "full": "/visuals/colossians/precept_artesian_well.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/Artesian_Well.png"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-col",
      "title": "Precept Austin — Colossians Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Colossians chapter 3 — col.png.",
      "thumb": "/visuals/colossians/precept_col.png",
      "full": "/visuals/colossians/precept_col.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/col.png"
      },
      "chapters": [
        3
      ]
    }
  ]
},
  '1-thessalonians': {
  "videos": [
    {
      "youtubeId": "No7Nq6IX23c",
      "title": "1 Thessalonians — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/No7Nq6IX23c?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/1-thessalonians/",
      "chapterStart": 1,
      "chapterEnd": 5
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: 1 Thessalonians",
      "caption": "Hand-illustrated single-page overview of 1 Thessalonians, tracing the book's literary design and major themes.",
      "thumb": "/visuals/1-thessalonians/bibleproject_poster.jpg",
      "full": "/visuals/1-thessalonians/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-1-thessalonians/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — 1 Thessalonians Bible Chart",
      "caption": "Single-page structural chart of 1 Thessalonians, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/1-thessalonians/swindoll_chart.png",
      "full": "/visuals/1-thessalonians/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/1-Thessalonians-Bible-chart.pdf"
      }
    }
  ]
},
  '2-thessalonians': {
  "videos": [
    {
      "youtubeId": "kbPBDKOn1cc",
      "title": "2 Thessalonians — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/kbPBDKOn1cc?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/2-thessalonians/",
      "chapterStart": 1,
      "chapterEnd": 3
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: 2 Thessalonians",
      "caption": "Hand-illustrated single-page overview of 2 Thessalonians, tracing the book's literary design and major themes.",
      "thumb": "/visuals/2-thessalonians/bibleproject_poster.jpg",
      "full": "/visuals/2-thessalonians/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-2-thessalonians/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — 2 Thessalonians Bible Chart",
      "caption": "Single-page structural chart of 2 Thessalonians, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/2-thessalonians/swindoll_chart.png",
      "full": "/visuals/2-thessalonians/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/2-Thessalonians-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-book-2th",
      "title": "Precept Austin — 2 Thessalonians (2th.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 2 Thessalonians chapters on Precept Austin's commentary.",
      "thumb": "/visuals/2-thessalonians/precept_2th.png",
      "full": "/visuals/2-thessalonians/precept_2th.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/2th.png"
      }
    },
    {
      "id": "precept-ch-dayofwrath",
      "title": "Precept Austin — 2 Thessalonians Chapter 2",
      "caption": "Bruce Hurt's commentary chart for 2 Thessalonians chapter 2 — dayofwrath.jpg.",
      "thumb": "/visuals/2-thessalonians/precept_dayofwrath.jpg",
      "full": "/visuals/2-thessalonians/precept_dayofwrath.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/dayofwrath.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-suffering",
      "title": "Precept Austin — 2 Thessalonians Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 2 Thessalonians chapter 1 — suffering.jpg.",
      "thumb": "/visuals/2-thessalonians/precept_suffering.jpg",
      "full": "/visuals/2-thessalonians/precept_suffering.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/suffering.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-tribulationfalse",
      "title": "Precept Austin — 2 Thessalonians Chapter 2",
      "caption": "Bruce Hurt's commentary chart for 2 Thessalonians chapter 2 — tribulationfalse.jpg.",
      "thumb": "/visuals/2-thessalonians/precept_tribulationfalse.jpg",
      "full": "/visuals/2-thessalonians/precept_tribulationfalse.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/tribulationfalse.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-tribulationtrue",
      "title": "Precept Austin — 2 Thessalonians Chapter 2",
      "caption": "Bruce Hurt's commentary chart for 2 Thessalonians chapter 2 — tribulationtrue.jpg.",
      "thumb": "/visuals/2-thessalonians/precept_tribulationtrue.jpg",
      "full": "/visuals/2-thessalonians/precept_tribulationtrue.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/tribulationtrue.jpg"
      },
      "chapters": [
        2
      ]
    }
  ]
},
  '1-timothy': {
  "videos": [
    {
      "youtubeId": "7RoqnGcEjcs",
      "title": "1 Timothy — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/7RoqnGcEjcs?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/1-timothy/",
      "chapterStart": 1,
      "chapterEnd": 6
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: 1 Timothy",
      "caption": "Hand-illustrated single-page overview of 1 Timothy, tracing the book's literary design and major themes.",
      "thumb": "/visuals/1-timothy/bibleproject_poster.jpg",
      "full": "/visuals/1-timothy/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-1-timothy/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — 1 Timothy Bible Chart",
      "caption": "Single-page structural chart of 1 Timothy, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/1-timothy/swindoll_chart.png",
      "full": "/visuals/1-timothy/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/1-Timothy-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-book-1timothymap",
      "title": "Precept Austin — 1 Timothy (1timothymap.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Timothy chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-timothy/precept_1timothymap.jpg",
      "full": "/visuals/1-timothy/precept_1timothymap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1timothymap.jpg"
      }
    },
    {
      "id": "precept-book-1ti",
      "title": "Precept Austin — 1 Timothy (1ti.png)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Timothy chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-timothy/precept_1ti.png",
      "full": "/visuals/1-timothy/precept_1ti.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1ti.png"
      }
    },
    {
      "id": "precept-book-1timothytime",
      "title": "Precept Austin — 1 Timothy (1timothytime.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Timothy chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-timothy/precept_1timothytime.jpg",
      "full": "/visuals/1-timothy/precept_1timothytime.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1timothytime.jpg"
      }
    },
    {
      "id": "precept-ch-gospel_bridge_3",
      "title": "Precept Austin — 1 Timothy Chapter 2",
      "caption": "Bruce Hurt's commentary chart for 1 Timothy chapter 2 — gospel bridge 3.gif.",
      "thumb": "/visuals/1-timothy/precept_gospel_bridge_3.gif",
      "full": "/visuals/1-timothy/precept_gospel_bridge_3.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/gospel%20bridge%203.gif"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-mirror",
      "title": "Precept Austin — 1 Timothy Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Timothy chapter 1 — mirror.jpg.",
      "thumb": "/visuals/1-timothy/precept_mirror.jpg",
      "full": "/visuals/1-timothy/precept_mirror.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/mirror.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-peda",
      "title": "Precept Austin — 1 Timothy Chapter 1",
      "caption": "Bruce Hurt's commentary chart for 1 Timothy chapter 1 — peda.jpg.",
      "thumb": "/visuals/1-timothy/precept_peda.jpg",
      "full": "/visuals/1-timothy/precept_peda.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/peda.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-thresh",
      "title": "Precept Austin — 1 Timothy Chapter 5",
      "caption": "Bruce Hurt's commentary chart for 1 Timothy chapter 5 — thresh.jpg.",
      "thumb": "/visuals/1-timothy/precept_thresh.jpg",
      "full": "/visuals/1-timothy/precept_thresh.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/thresh.jpg"
      },
      "chapters": [
        5
      ]
    }
  ]
},
  '2-timothy': {
  "videos": [
    {
      "youtubeId": "urlvnxCaL00",
      "title": "2 Timothy — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/urlvnxCaL00?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/2-timothy/",
      "chapterStart": 1,
      "chapterEnd": 4
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: 2 Timothy",
      "caption": "Hand-illustrated single-page overview of 2 Timothy, tracing the book's literary design and major themes.",
      "thumb": "/visuals/2-timothy/bibleproject_poster.jpg",
      "full": "/visuals/2-timothy/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-2-timothy/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — 2 Timothy Bible Chart",
      "caption": "Single-page structural chart of 2 Timothy, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/2-timothy/swindoll_chart.png",
      "full": "/visuals/2-timothy/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/2-Timothy-Bible-chart.pdf"
      }
    }
  ]
},
  'titus': {
  "videos": [
    {
      "youtubeId": "qgAZH5ExwrM",
      "title": "Titus — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/qgAZH5ExwrM?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/titus/",
      "chapterStart": 1,
      "chapterEnd": 3
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Titus",
      "caption": "Hand-illustrated single-page overview of Titus, tracing the book's literary design and major themes.",
      "thumb": "/visuals/titus/bibleproject_poster.jpg",
      "full": "/visuals/titus/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-titus/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Titus Bible Chart",
      "caption": "Single-page structural chart of Titus, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/titus/swindoll_chart.png",
      "full": "/visuals/titus/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Titus-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Titus Chart",
      "caption": "Bruce Hurt's inductive-study chart for Titus, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/titus/precept_chart.png",
      "full": "/visuals/titus/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/titus.png"
      }
    }
  ]
},
  'philemon': {
  "videos": [
    {
      "youtubeId": "aW9Q3Jt6Yvk",
      "title": "Philemon — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/aW9Q3Jt6Yvk?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/philemon/",
      "chapterStart": 1,
      "chapterEnd": 1
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Philemon",
      "caption": "Hand-illustrated single-page overview of Philemon, tracing the book's literary design and major themes.",
      "thumb": "/visuals/philemon/bibleproject_poster.jpg",
      "full": "/visuals/philemon/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-philemon/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Philemon Bible Chart",
      "caption": "Single-page structural chart of Philemon, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/philemon/swindoll_chart.png",
      "full": "/visuals/philemon/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Philemon-Bible-chart.pdf"
      }
    }
  ]
},
  'hebrews': {
  "videos": [
    {
      "youtubeId": "z9wqN-nwSzE",
      "title": "Hebrews — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/z9wqN-nwSzE?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/hebrews/",
      "chapterStart": 1,
      "chapterEnd": 13
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Hebrews",
      "caption": "Hand-illustrated single-page overview of Hebrews, tracing the book's literary design and major themes.",
      "thumb": "/visuals/hebrews/bibleproject_poster.jpg",
      "full": "/visuals/hebrews/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-hebrews/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Hebrews Bible Chart",
      "caption": "Single-page structural chart of Hebrews, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/hebrews/swindoll_chart.png",
      "full": "/visuals/hebrews/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Hebrews-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Hebrews Chart",
      "caption": "Bruce Hurt's inductive-study chart for Hebrews, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/hebrews/precept_chart.png",
      "full": "/visuals/hebrews/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hebrews.png"
      }
    },
    {
      "id": "precept-ch-heb",
      "title": "Precept Austin — Hebrews Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Hebrews chapter 13 — heb.png.",
      "thumb": "/visuals/hebrews/precept_heb.png",
      "full": "/visuals/hebrews/precept_heb.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/heb.png"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-hebrewstime",
      "title": "Precept Austin — Hebrews Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Hebrews chapter 13 — hebrewstime.jpg.",
      "thumb": "/visuals/hebrews/precept_hebrewstime.jpg",
      "full": "/visuals/hebrews/precept_hebrewstime.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hebrewstime.jpg"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-hebrewstime",
      "title": "Precept Austin — Hebrews Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Hebrews chapter 13 — hebrewstime.png.",
      "thumb": "/visuals/hebrews/precept_hebrewstime.png",
      "full": "/visuals/hebrews/precept_hebrewstime.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/hebrewstime.png"
      },
      "chapters": [
        13
      ]
    },
    {
      "id": "precept-ch-timeline",
      "title": "Precept Austin — Hebrews Chapter 13",
      "caption": "Bruce Hurt's commentary chart for Hebrews chapter 13 — timeline.png.",
      "thumb": "/visuals/hebrews/precept_timeline.png",
      "full": "/visuals/hebrews/precept_timeline.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/timeline.png"
      },
      "chapters": [
        13
      ]
    }
  ]
},
  'james': {
  "videos": [
    {
      "youtubeId": "qn-hLHWwRYY",
      "title": "James — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/qn-hLHWwRYY?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/james/",
      "chapterStart": 1,
      "chapterEnd": 5
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: James",
      "caption": "Hand-illustrated single-page overview of James, tracing the book's literary design and major themes.",
      "thumb": "/visuals/james/bibleproject_poster.jpg",
      "full": "/visuals/james/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-james/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — James Bible Chart",
      "caption": "Single-page structural chart of James, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/james/swindoll_chart.png",
      "full": "/visuals/james/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/James-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — James Chart",
      "caption": "Bruce Hurt's inductive-study chart for James, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/james/precept_chart.png",
      "full": "/visuals/james/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/james_chart.png"
      }
    },
    {
      "id": "precept-book-james_jesus_brother",
      "title": "Precept Austin — James (james_jesus_brother.png)",
      "caption": "Bruce Hurt's chart embedded across multiple James chapters on Precept Austin's commentary.",
      "thumb": "/visuals/james/precept_james_jesus_brother.png",
      "full": "/visuals/james/precept_james_jesus_brother.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/james_jesus_brother.png"
      }
    },
    {
      "id": "precept-ch-bridle",
      "title": "Precept Austin — James Chapter 3",
      "caption": "Bruce Hurt's commentary chart for James chapter 3 — bridle.jpg.",
      "thumb": "/visuals/james/precept_bridle.jpg",
      "full": "/visuals/james/precept_bridle.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bridle.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-chicago",
      "title": "Precept Austin — James Chapter 3",
      "caption": "Bruce Hurt's commentary chart for James chapter 3 — chicago.jpg.",
      "thumb": "/visuals/james/precept_chicago.jpg",
      "full": "/visuals/james/precept_chicago.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/chicago.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-clockredeem",
      "title": "Precept Austin — James Chapter 4",
      "caption": "Bruce Hurt's commentary chart for James chapter 4 — clockredeem.jpeg.",
      "thumb": "/visuals/james/precept_clockredeem.jpg",
      "full": "/visuals/james/precept_clockredeem.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/clockredeem.jpeg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-imagegod",
      "title": "Precept Austin — James Chapter 3",
      "caption": "Bruce Hurt's commentary chart for James chapter 3 — imagegod.jpg.",
      "thumb": "/visuals/james/precept_imagegod.jpg",
      "full": "/visuals/james/precept_imagegod.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/imagegod.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-james413",
      "title": "Precept Austin — James Chapter 4",
      "caption": "Bruce Hurt's commentary chart for James chapter 4 — james413.png.",
      "thumb": "/visuals/james/precept_james413.png",
      "full": "/visuals/james/precept_james413.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/james413.png"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "vm-parallels",
      "title": "VerseMate Original — James & Proverbs",
      "caption": "Eight thematic parallels in NASB 1995 showing how James drew his teaching from Solomon's wisdom well.",
      "thumb": "/visuals/james/versemate_james_proverbs_parallels.png",
      "full": "/visuals/james/versemate_james_proverbs_parallels.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      },
      "download": {
        "label": "Print-ready PDF",
        "href": "/visuals/james/versemate_james_proverbs_parallels.pdf"
      }
    },
    {
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of James",
      "caption": "Dot-matrix heatmap of faith, works, tongue, and wisdom across all 108 verses. Chapter 2 = the faith/works debate; chapter 3 = the tongue treatise.",
      "thumb": "/visuals/james/versemate_james_keyword_heatmap.png",
      "full": "/visuals/james/versemate_james_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      },
      "download": {
        "label": "Print-ready PDF",
        "href": "/visuals/james/versemate_james_keyword_heatmap.pdf"
      }
    }
  ]
},
  '1-peter': {
  "videos": [
    {
      "youtubeId": "WhP7AZQlzCg",
      "title": "1 Peter — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/WhP7AZQlzCg?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/1-peter/",
      "chapterStart": 1,
      "chapterEnd": 5
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: 1 Peter",
      "caption": "Hand-illustrated single-page overview of 1 Peter, tracing the book's literary design and major themes.",
      "thumb": "/visuals/1-peter/bibleproject_poster.jpg",
      "full": "/visuals/1-peter/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-1-peter/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — 1 Peter Bible Chart",
      "caption": "Single-page structural chart of 1 Peter, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/1-peter/swindoll_chart.png",
      "full": "/visuals/1-peter/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/1-Peter-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — 1 Peter Chart",
      "caption": "Bruce Hurt's inductive-study chart for 1 Peter, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/1-peter/precept_chart.png",
      "full": "/visuals/1-peter/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1_peter.png"
      }
    }
  ]
},
  '2-peter': {
  "videos": [
    {
      "youtubeId": "wWLv_ITyKYc",
      "title": "2 Peter — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/wWLv_ITyKYc?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/2-peter/",
      "chapterStart": 1,
      "chapterEnd": 3
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: 2 Peter",
      "caption": "Hand-illustrated single-page overview of 2 Peter, tracing the book's literary design and major themes.",
      "thumb": "/visuals/2-peter/bibleproject_poster.jpg",
      "full": "/visuals/2-peter/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-2-peter/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — 2 Peter Bible Chart",
      "caption": "Single-page structural chart of 2 Peter, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/2-peter/swindoll_chart.png",
      "full": "/visuals/2-peter/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/2-Peter-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — 2 Peter Chart",
      "caption": "Bruce Hurt's inductive-study chart for 2 Peter, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/2-peter/precept_chart.png",
      "full": "/visuals/2-peter/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/2_peter.png"
      }
    }
  ]
},
  '1-john': {
  "videos": [
    {
      "youtubeId": "l3QkE6nKylM",
      "title": "1–3 John — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/l3QkE6nKylM?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/1-john/",
      "chapterStart": 1,
      "chapterEnd": 5
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: 1 John",
      "caption": "Hand-illustrated single-page overview of 1 John, tracing the book's literary design and major themes.",
      "thumb": "/visuals/1-john/bibleproject_poster.jpg",
      "full": "/visuals/1-john/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-1-john/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — 1 John Bible Chart",
      "caption": "Single-page structural chart of 1 John, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/1-john/swindoll_chart.png",
      "full": "/visuals/1-john/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/1-John-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — 1 John Chart",
      "caption": "Bruce Hurt's inductive-study chart for 1 John, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/1-john/precept_chart.png",
      "full": "/visuals/1-john/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1jo.png"
      }
    }
  ]
},
  '2-john': {
  "videos": [
    {
      "youtubeId": "l3QkE6nKylM",
      "title": "1–3 John — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/l3QkE6nKylM?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/2-john/",
      "chapterStart": 1,
      "chapterEnd": 1
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: 2 John",
      "caption": "Hand-illustrated single-page overview of 2 John, tracing the book's literary design and major themes.",
      "thumb": "/visuals/2-john/bibleproject_poster.jpg",
      "full": "/visuals/2-john/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-2-john/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — 2 John Bible Chart",
      "caption": "Single-page structural chart of 2 John, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/2-john/swindoll_chart.png",
      "full": "/visuals/2-john/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/2-John-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — 2 John Chart",
      "caption": "Bruce Hurt's inductive-study chart for 2 John, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/2-john/precept_chart.png",
      "full": "/visuals/2-john/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/2jo.png"
      }
    }
  ]
},
  '3-john': {
  "videos": [
    {
      "youtubeId": "l3QkE6nKylM",
      "title": "1–3 John — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/l3QkE6nKylM?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/3-john/",
      "chapterStart": 1,
      "chapterEnd": 1
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: 3 John",
      "caption": "Hand-illustrated single-page overview of 3 John, tracing the book's literary design and major themes.",
      "thumb": "/visuals/3-john/bibleproject_poster.jpg",
      "full": "/visuals/3-john/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-3-john/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — 3 John Bible Chart",
      "caption": "Single-page structural chart of 3 John, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/3-john/swindoll_chart.png",
      "full": "/visuals/3-john/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/3-John-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — 3 John Chart",
      "caption": "Bruce Hurt's inductive-study chart for 3 John, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/3-john/precept_chart.png",
      "full": "/visuals/3-john/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/3jo.png"
      }
    }
  ]
},
  'jude': {
  "videos": [
    {
      "youtubeId": "6UoCmakZmys",
      "title": "Jude — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/6UoCmakZmys?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/jude/",
      "chapterStart": 1,
      "chapterEnd": 1
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Jude",
      "caption": "Hand-illustrated single-page overview of Jude, tracing the book's literary design and major themes.",
      "thumb": "/visuals/jude/bibleproject_poster.jpg",
      "full": "/visuals/jude/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-jude/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Jude Bible Chart",
      "caption": "Single-page structural chart of Jude, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/jude/swindoll_chart.png",
      "full": "/visuals/jude/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Jude-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-chart",
      "title": "Precept Austin — Jude Chart",
      "caption": "Bruce Hurt's inductive-study chart for Jude, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/jude/precept_chart.png",
      "full": "/visuals/jude/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jude.png"
      }
    }
  ]
},
  'revelation': {
  "videos": [
    {
      "youtubeId": "5nvVVcYD-0w",
      "title": "Revelation 1–11 — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/5nvVVcYD-0w?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/revelation/",
      "chapterStart": 1,
      "chapterEnd": 11
    },
    {
      "youtubeId": "QpnIrbq2bKo",
      "title": "Revelation 12–22 — Overview",
      "embedUrl": "https://www.youtube-nocookie.com/embed/QpnIrbq2bKo?autoplay=1&rel=0&modestbranding=1",
      "page": "https://bibleproject.com/videos/revelation/",
      "chapterStart": 12,
      "chapterEnd": 22
    }
  ],
  "cards": [
    {
      "id": "bp-poster",
      "title": "BibleProject — Read Scripture: Revelation",
      "caption": "Hand-illustrated single-page overview of Revelation, tracing the book's literary design and major themes.",
      "thumb": "/visuals/revelation/bibleproject_poster.jpg",
      "full": "/visuals/revelation/bibleproject_poster.jpg",
      "attribution": {
        "label": "BibleProject · CC BY-SA 4.0",
        "href": "https://bibleproject.com/guides/book-of-revelation/"
      }
    },
    {
      "id": "swindoll-chart",
      "title": "Chuck Swindoll — Revelation Bible Chart",
      "caption": "Single-page structural chart of Revelation, organizing the book by major sections, themes, and key verses. Free resource from Insight for Living Ministries.",
      "thumb": "/visuals/revelation/swindoll_chart.png",
      "full": "/visuals/revelation/swindoll_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/Revelation-Bible-chart.pdf"
      }
    },
    {
      "id": "precept-book-rev_map",
      "title": "Precept Austin — Revelation (rev_map.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Revelation chapters on Precept Austin's commentary.",
      "thumb": "/visuals/revelation/precept_rev_map.png",
      "full": "/visuals/revelation/precept_rev_map.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/rev_map.png"
      }
    },
    {
      "id": "precept-book-rev_overview",
      "title": "Precept Austin — Revelation (rev_overview.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Revelation chapters on Precept Austin's commentary.",
      "thumb": "/visuals/revelation/precept_rev_overview.png",
      "full": "/visuals/revelation/precept_rev_overview.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/rev_overview.png"
      }
    },
    {
      "id": "precept-book-rev",
      "title": "Precept Austin — Revelation (rev.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Revelation chapters on Precept Austin's commentary.",
      "thumb": "/visuals/revelation/precept_rev.png",
      "full": "/visuals/revelation/precept_rev.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/rev.png"
      }
    },
    {
      "id": "precept-book-rev_historical_setting",
      "title": "Precept Austin — Revelation (rev_historical_setting.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Revelation chapters on Precept Austin's commentary.",
      "thumb": "/visuals/revelation/precept_rev_historical_setting.png",
      "full": "/visuals/revelation/precept_rev_historical_setting.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/rev_historical_setting.png"
      }
    },
    {
      "id": "precept-book-rev_interpretation",
      "title": "Precept Austin — Revelation (rev_interpretation.png)",
      "caption": "Bruce Hurt's chart embedded across multiple Revelation chapters on Precept Austin's commentary.",
      "thumb": "/visuals/revelation/precept_rev_interpretation.png",
      "full": "/visuals/revelation/precept_rev_interpretation.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/rev_interpretation.png"
      }
    },
    {
      "id": "precept-book-godsplan",
      "title": "Precept Austin — Revelation (godsplan.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Revelation chapters on Precept Austin's commentary.",
      "thumb": "/visuals/revelation/precept_godsplan.jpg",
      "full": "/visuals/revelation/precept_godsplan.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/godsplan.jpg"
      }
    },
    {
      "id": "precept-book-patmos2",
      "title": "Precept Austin — Revelation (patmos2.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple Revelation chapters on Precept Austin's commentary.",
      "thumb": "/visuals/revelation/precept_patmos2.jpg",
      "full": "/visuals/revelation/precept_patmos2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/patmos2.jpg"
      }
    },
    {
      "id": "precept-ch-24elders",
      "title": "Precept Austin — Revelation Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 4 — 24elders.jpg.",
      "thumb": "/visuals/revelation/precept_24elders.jpg",
      "full": "/visuals/revelation/precept_24elders.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/24elders.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-alpha",
      "title": "Precept Austin — Revelation Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 1 — alpha.png.",
      "thumb": "/visuals/revelation/precept_alpha.png",
      "full": "/visuals/revelation/precept_alpha.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/alpha.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-armageddon",
      "title": "Precept Austin — Revelation Chapter 16",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 16 — armageddon.jpg.",
      "thumb": "/visuals/revelation/precept_armageddon.jpg",
      "full": "/visuals/revelation/precept_armageddon.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/armageddon.jpg"
      },
      "chapters": [
        16
      ]
    },
    {
      "id": "precept-ch-bema",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — bema.jpg.",
      "thumb": "/visuals/revelation/precept_bema.jpg",
      "full": "/visuals/revelation/precept_bema.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/bema.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-blood",
      "title": "Precept Austin — Revelation Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 1 — blood.png.",
      "thumb": "/visuals/revelation/precept_blood.png",
      "full": "/visuals/revelation/precept_blood.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/blood.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-caduceus",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — caduceus.png.",
      "thumb": "/visuals/revelation/precept_caduceus.png",
      "full": "/visuals/revelation/precept_caduceus.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/caduceus.png"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-emperorclothes",
      "title": "Precept Austin — Revelation Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 3 — emperorclothes.jpg.",
      "thumb": "/visuals/revelation/precept_emperorclothes.jpg",
      "full": "/visuals/revelation/precept_emperorclothes.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/emperorclothes.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-ephesus-arch",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — ephesus-arch.jpg.",
      "thumb": "/visuals/revelation/precept_ephesus-arch.jpg",
      "full": "/visuals/revelation/precept_ephesus-arch.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ephesus-arch.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-ephesus-artemis",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — ephesus-artemis.jpg.",
      "thumb": "/visuals/revelation/precept_ephesus-artemis.jpg",
      "full": "/visuals/revelation/precept_ephesus-artemis.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ephesus-artemis.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-ephesus-firstlove",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — ephesus-firstlove.jpg.",
      "thumb": "/visuals/revelation/precept_ephesus-firstlove.jpg",
      "full": "/visuals/revelation/precept_ephesus-firstlove.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ephesus-firstlove.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-ephesus-temple",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — ephesus-temple.jpg.",
      "thumb": "/visuals/revelation/precept_ephesus-temple.jpg",
      "full": "/visuals/revelation/precept_ephesus-temple.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ephesus-temple.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-ephesusmap",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — ephesusmap.png.",
      "thumb": "/visuals/revelation/precept_ephesusmap.png",
      "full": "/visuals/revelation/precept_ephesusmap.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ephesusmap.png"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-ephesussediment",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — ephesussediment.jpeg.",
      "thumb": "/visuals/revelation/precept_ephesussediment.jpg",
      "full": "/visuals/revelation/precept_ephesussediment.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ephesussediment.jpeg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-ephsed",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — ephsed.jpg.",
      "thumb": "/visuals/revelation/precept_ephsed.jpg",
      "full": "/visuals/revelation/precept_ephsed.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ephsed.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-fourlc",
      "title": "Precept Austin — Revelation Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 4 — fourlc.jpg.",
      "thumb": "/visuals/revelation/precept_fourlc.jpg",
      "full": "/visuals/revelation/precept_fourlc.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/fourlc.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-jesusknocking1",
      "title": "Precept Austin — Revelation Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 3 — jesusknocking1.jpg.",
      "thumb": "/visuals/revelation/precept_jesusknocking1.jpg",
      "full": "/visuals/revelation/precept_jesusknocking1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jesusknocking1.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-johnpatmos",
      "title": "Precept Austin — Revelation Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 1 — johnpatmos.png.",
      "thumb": "/visuals/revelation/precept_johnpatmos.png",
      "full": "/visuals/revelation/precept_johnpatmos.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/johnpatmos.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-johnpatmos1",
      "title": "Precept Austin — Revelation Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 1 — johnpatmos1.jpg.",
      "thumb": "/visuals/revelation/precept_johnpatmos1.jpg",
      "full": "/visuals/revelation/precept_johnpatmos1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/johnpatmos1.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-kairoslysippus",
      "title": "Precept Austin — Revelation Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 1 — kairoslysippus.jpg.",
      "thumb": "/visuals/revelation/precept_kairoslysippus.jpg",
      "full": "/visuals/revelation/precept_kairoslysippus.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/kairoslysippus.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-keyofdavid",
      "title": "Precept Austin — Revelation Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 3 — keyofdavid.jpg.",
      "thumb": "/visuals/revelation/precept_keyofdavid.jpg",
      "full": "/visuals/revelation/precept_keyofdavid.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/keyofdavid.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-laodicealycus",
      "title": "Precept Austin — Revelation Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 3 — laodicealycus.jpg.",
      "thumb": "/visuals/revelation/precept_laodicealycus.jpg",
      "full": "/visuals/revelation/precept_laodicealycus.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/laodicealycus.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-laodicealycusriver",
      "title": "Precept Austin — Revelation Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 3 — laodicealycusriver.jpg.",
      "thumb": "/visuals/revelation/precept_laodicealycusriver.jpg",
      "full": "/visuals/revelation/precept_laodicealycusriver.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/laodicealycusriver.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-loudvoice",
      "title": "Precept Austin — Revelation Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 1 — loudvoice.png.",
      "thumb": "/visuals/revelation/precept_loudvoice.png",
      "full": "/visuals/revelation/precept_loudvoice.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/loudvoice.png"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-maranatha",
      "title": "Precept Austin — Revelation Chapters 3, 5",
      "caption": "Bruce Hurt's commentary chart for Revelation chapters 3, 5 — maranatha.jpg.",
      "thumb": "/visuals/revelation/precept_maranatha.jpg",
      "full": "/visuals/revelation/precept_maranatha.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/maranatha.jpg"
      },
      "chapters": [
        3,
        5
      ]
    },
    {
      "id": "precept-ch-martyr",
      "title": "Precept Austin — Revelation Chapters 1–2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapters 1–2 — martyr.jpg.",
      "thumb": "/visuals/revelation/precept_martyr.jpg",
      "full": "/visuals/revelation/precept_martyr.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/martyr.jpg"
      },
      "chapters": [
        1,
        2
      ]
    },
    {
      "id": "precept-ch-myrrhresin",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — myrrhresin.jpg.",
      "thumb": "/visuals/revelation/precept_myrrhresin.jpg",
      "full": "/visuals/revelation/precept_myrrhresin.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/myrrhresin.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-myrrhtree",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — myrrhtree.jpg.",
      "thumb": "/visuals/revelation/precept_myrrhtree.jpg",
      "full": "/visuals/revelation/precept_myrrhtree.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/myrrhtree.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-patmos2",
      "title": "Precept Austin — Revelation Chapters 1–5",
      "caption": "Bruce Hurt's commentary chart for Revelation chapters 1–5 — patmos2.jpg.",
      "thumb": "/visuals/revelation/precept_patmos2.jpg",
      "full": "/visuals/revelation/precept_patmos2.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/patmos2.jpg"
      },
      "chapters": [
        1,
        2,
        3,
        4,
        5
      ]
    },
    {
      "id": "precept-ch-pergamum-balaam",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — pergamum-balaam.jpg.",
      "thumb": "/visuals/revelation/precept_pergamum-balaam.jpg",
      "full": "/visuals/revelation/precept_pergamum-balaam.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/pergamum-balaam.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-pergamum-city",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — pergamum-city.jpg.",
      "thumb": "/visuals/revelation/precept_pergamum-city.jpg",
      "full": "/visuals/revelation/precept_pergamum-city.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/pergamum-city.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-pergamum",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — pergamum.jpg.",
      "thumb": "/visuals/revelation/precept_pergamum.jpg",
      "full": "/visuals/revelation/precept_pergamum.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/pergamum.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-pergamum1",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — pergamum1.jpg.",
      "thumb": "/visuals/revelation/precept_pergamum1.jpg",
      "full": "/visuals/revelation/precept_pergamum1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/pergamum1.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-pergamumasc",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — pergamumasc.jpg.",
      "thumb": "/visuals/revelation/precept_pergamumasc.jpg",
      "full": "/visuals/revelation/precept_pergamumasc.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/pergamumasc.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-pergamumathena",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — pergamumathena.jpg.",
      "thumb": "/visuals/revelation/precept_pergamumathena.jpg",
      "full": "/visuals/revelation/precept_pergamumathena.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/pergamumathena.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-pergamumcoin",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — pergamumcoin.jpg.",
      "thumb": "/visuals/revelation/precept_pergamumcoin.jpg",
      "full": "/visuals/revelation/precept_pergamumcoin.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/pergamumcoin.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-pergamumlayout",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — pergamumlayout.jpg.",
      "thumb": "/visuals/revelation/precept_pergamumlayout.jpg",
      "full": "/visuals/revelation/precept_pergamumlayout.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/pergamumlayout.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-pergamumneo1",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — pergamumneo1.jpg.",
      "thumb": "/visuals/revelation/precept_pergamumneo1.jpg",
      "full": "/visuals/revelation/precept_pergamumneo1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/pergamumneo1.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-pergamumtheater",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — pergamumtheater.jpg.",
      "thumb": "/visuals/revelation/precept_pergamumtheater.jpg",
      "full": "/visuals/revelation/precept_pergamumtheater.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/pergamumtheater.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-pergamumzeus",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — pergamumzeus.jpg.",
      "thumb": "/visuals/revelation/precept_pergamumzeus.jpg",
      "full": "/visuals/revelation/precept_pergamumzeus.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/pergamumzeus.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-pergamumzeus1",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — pergamumzeus1.jpg.",
      "thumb": "/visuals/revelation/precept_pergamumzeus1.jpg",
      "full": "/visuals/revelation/precept_pergamumzeus1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/pergamumzeus1.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-r911",
      "title": "Precept Austin — Revelation Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 10 — r911.png.",
      "thumb": "/visuals/revelation/precept_r911.png",
      "full": "/visuals/revelation/precept_r911.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/r911.png"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-r915",
      "title": "Precept Austin — Revelation Chapters 7, 14",
      "caption": "Bruce Hurt's commentary chart for Revelation chapters 7, 14 — r915.png.",
      "thumb": "/visuals/revelation/precept_r915.png",
      "full": "/visuals/revelation/precept_r915.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/r915.png"
      },
      "chapters": [
        7,
        14
      ]
    },
    {
      "id": "precept-ch-r93",
      "title": "Precept Austin — Revelation Chapter 11",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 11 — r93.png.",
      "thumb": "/visuals/revelation/precept_r93.png",
      "full": "/visuals/revelation/precept_r93.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/r93.png"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-r94",
      "title": "Precept Austin — Revelation Chapter 11",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 11 — r94.png.",
      "thumb": "/visuals/revelation/precept_r94.png",
      "full": "/visuals/revelation/precept_r94.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/r94.png"
      },
      "chapters": [
        11
      ]
    },
    {
      "id": "precept-ch-r96",
      "title": "Precept Austin — Revelation Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 10 — r96.png.",
      "thumb": "/visuals/revelation/precept_r96.png",
      "full": "/visuals/revelation/precept_r96.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/r96.png"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-r97",
      "title": "Precept Austin — Revelation Chapter 10",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 10 — r97.png.",
      "thumb": "/visuals/revelation/precept_r97.png",
      "full": "/visuals/revelation/precept_r97.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/r97.png"
      },
      "chapters": [
        10
      ]
    },
    {
      "id": "precept-ch-rev",
      "title": "Precept Austin — Revelation Chapters 1–5",
      "caption": "Bruce Hurt's commentary chart for Revelation chapters 1–5 — rev.png.",
      "thumb": "/visuals/revelation/precept_rev.png",
      "full": "/visuals/revelation/precept_rev.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/rev.png"
      },
      "chapters": [
        1,
        2,
        3,
        4,
        5
      ]
    },
    {
      "id": "precept-ch-rev9",
      "title": "Precept Austin — Revelation Chapter 9",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 9 — rev9.jpeg.",
      "thumb": "/visuals/revelation/precept_rev9.jpg",
      "full": "/visuals/revelation/precept_rev9.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/rev9.jpeg"
      },
      "chapters": [
        9
      ]
    },
    {
      "id": "precept-ch-rev_historical_setting",
      "title": "Precept Austin — Revelation Chapters 1–4",
      "caption": "Bruce Hurt's commentary chart for Revelation chapters 1–4 — rev_historical_setting.png.",
      "thumb": "/visuals/revelation/precept_rev_historical_setting.png",
      "full": "/visuals/revelation/precept_rev_historical_setting.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/rev_historical_setting.png"
      },
      "chapters": [
        1,
        2,
        3,
        4
      ]
    },
    {
      "id": "precept-ch-rev_map",
      "title": "Precept Austin — Revelation Chapters 1, 3, 4",
      "caption": "Bruce Hurt's commentary chart for Revelation chapters 1, 3, 4 — rev_map.png.",
      "thumb": "/visuals/revelation/precept_rev_map.png",
      "full": "/visuals/revelation/precept_rev_map.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/rev_map.png"
      },
      "chapters": [
        1,
        3,
        4
      ]
    },
    {
      "id": "precept-ch-rev_overview",
      "title": "Precept Austin — Revelation Chapters 1–5",
      "caption": "Bruce Hurt's commentary chart for Revelation chapters 1–5 — rev_overview.png.",
      "thumb": "/visuals/revelation/precept_rev_overview.png",
      "full": "/visuals/revelation/precept_rev_overview.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/rev_overview.png"
      },
      "chapters": [
        1,
        2,
        3,
        4,
        5
      ]
    },
    {
      "id": "precept-ch-revelation310",
      "title": "Precept Austin — Revelation Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 3 — revelation310.jpg.",
      "thumb": "/visuals/revelation/precept_revelation310.jpg",
      "full": "/visuals/revelation/precept_revelation310.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/revelation310.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-revelationpatmos",
      "title": "Precept Austin — Revelation Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 1 — revelationpatmos.jpg.",
      "thumb": "/visuals/revelation/precept_revelationpatmos.jpg",
      "full": "/visuals/revelation/precept_revelationpatmos.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/revelationpatmos.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-sardiswall",
      "title": "Precept Austin — Revelation Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 3 — sardiswall.jpg.",
      "thumb": "/visuals/revelation/precept_sardiswall.jpg",
      "full": "/visuals/revelation/precept_sardiswall.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sardiswall.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-scroll",
      "title": "Precept Austin — Revelation Chapter 5",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 5 — scroll.jpg.",
      "thumb": "/visuals/revelation/precept_scroll.jpg",
      "full": "/visuals/revelation/precept_scroll.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/scroll.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-scroll1",
      "title": "Precept Austin — Revelation Chapter 5",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 5 — scroll1.jpg.",
      "thumb": "/visuals/revelation/precept_scroll1.jpg",
      "full": "/visuals/revelation/precept_scroll1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/scroll1.jpg"
      },
      "chapters": [
        5
      ]
    },
    {
      "id": "precept-ch-secondcoming",
      "title": "Precept Austin — Revelation Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 1 — secondcoming.jpg.",
      "thumb": "/visuals/revelation/precept_secondcoming.jpg",
      "full": "/visuals/revelation/precept_secondcoming.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/secondcoming.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-smyrnapagos",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — smyrnapagos.jpg.",
      "thumb": "/visuals/revelation/precept_smyrnapagos.jpg",
      "full": "/visuals/revelation/precept_smyrnapagos.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/smyrnapagos.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-smyrnaruin",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — smyrnaruin.jpg.",
      "thumb": "/visuals/revelation/precept_smyrnaruin.jpg",
      "full": "/visuals/revelation/precept_smyrnaruin.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/smyrnaruin.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-spit",
      "title": "Precept Austin — Revelation Chapter 3",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 3 — spit.jpg.",
      "thumb": "/visuals/revelation/precept_spit.jpg",
      "full": "/visuals/revelation/precept_spit.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/spit.jpg"
      },
      "chapters": [
        3
      ]
    },
    {
      "id": "precept-ch-sun",
      "title": "Precept Austin — Revelation Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 1 — sun.jpg.",
      "thumb": "/visuals/revelation/precept_sun.jpg",
      "full": "/visuals/revelation/precept_sun.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/sun.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-tachometer",
      "title": "Precept Austin — Revelation Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 1 — tachometer.jpg.",
      "thumb": "/visuals/revelation/precept_tachometer.jpg",
      "full": "/visuals/revelation/precept_tachometer.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/tachometer.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-templediana",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — templediana.jpg.",
      "thumb": "/visuals/revelation/precept_templediana.jpg",
      "full": "/visuals/revelation/precept_templediana.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/templediana.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-throneheaven",
      "title": "Precept Austin — Revelation Chapter 4",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 4 — throneheaven.jpg.",
      "thumb": "/visuals/revelation/precept_throneheaven.jpg",
      "full": "/visuals/revelation/precept_throneheaven.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/throneheaven.jpg"
      },
      "chapters": [
        4
      ]
    },
    {
      "id": "precept-ch-thyatiradiagram",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — thyatiradiagram.jpg.",
      "thumb": "/visuals/revelation/precept_thyatiradiagram.jpg",
      "full": "/visuals/revelation/precept_thyatiradiagram.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/thyatiradiagram.jpg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-thyatiraruins1",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — thyatiraruins1.jpeg.",
      "thumb": "/visuals/revelation/precept_thyatiraruins1.jpg",
      "full": "/visuals/revelation/precept_thyatiraruins1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/thyatiraruins1.jpeg"
      },
      "chapters": [
        2
      ]
    },
    {
      "id": "precept-ch-tribulation",
      "title": "Precept Austin — Revelation Chapters 1–2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapters 1–2 — tribulation.png.",
      "thumb": "/visuals/revelation/precept_tribulation.png",
      "full": "/visuals/revelation/precept_tribulation.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/tribulation.png"
      },
      "chapters": [
        1,
        2
      ]
    },
    {
      "id": "precept-ch-worship",
      "title": "Precept Austin — Revelation Chapter 5",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 5 — worship.jpg.",
      "thumb": "/visuals/revelation/precept_worship.jpg",
      "full": "/visuals/revelation/precept_worship.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/worship.jpg"
      },
      "chapters": [
        5
      ]
    }
  ]
},
};

// BOOKS_WITH_VISUALS is generated as a separate light-weight module
// (booksWithVisuals.ts) so the tab-visibility gate in DesktopLayout /
// CommentaryScreen can check membership without pulling the multi-MB
// registry into the initial JS bundle. Re-export here for any callers
// that still expect both from one module.
export { BOOKS_WITH_VISUALS } from './booksWithVisuals';

/** Lookup helper — slug is matched case-insensitively. */
export function getVisualsForBook(slug: string): VisualsManifest | null {
  return VISUALS_REGISTRY[slug.toLowerCase()] ?? null;
}

/** Pick the BibleProject overview that covers the given chapter, or null
 *  if the book has no videos / the chapter falls outside every range
 *  (shouldn't happen — chapter ranges in the manifest are exhaustive
 *  for every book that has any video). */
export function getVideoForChapter(
  manifest: VisualsManifest | null,
  chapter: number,
): VideoEntry | null {
  if (!manifest) return null;
  for (const v of manifest.videos) {
    if (chapter >= v.chapterStart && chapter <= v.chapterEnd) return v;
  }
  return manifest.videos[0] ?? null;
}

/** Filter a book's cards to ones relevant to the given chapter. Cards
 *  with no `chapters` field apply to every chapter (book-level). Cards
 *  with `chapters` only show when the current chapter is in the list. */
export function getCardsForChapter(
  manifest: VisualsManifest | null,
  chapter: number,
): VisualCard[] {
  if (!manifest) return [];
  return manifest.cards.filter(
    (c) => !c.chapters || c.chapters.includes(chapter),
  );
}
