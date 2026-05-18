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
      "id": "precept-ch-genesistimeline",
      "title": "Precept Austin — Exodus Chapters 1–2",
      "caption": "Bruce Hurt's commentary chart for Exodus chapters 1–2 — genesistimeline.png.",
      "thumb": "/visuals/exodus/precept_genesistimeline.png",
      "full": "/visuals/exodus/precept_genesistimeline.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/genesistimeline.png"
      },
      "chapters": [
        1,
        2
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
      "id": "precept-chart",
      "title": "Precept Austin — Leviticus Chart",
      "caption": "Bruce Hurt's inductive-study chart for Leviticus, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/leviticus/precept_chart.png",
      "full": "/visuals/leviticus/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/leviticus.png"
      }
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
      "id": "precept-book-1samuelmapesv",
      "title": "Precept Austin — 1 Samuel (1samuelmapesv.jpg)",
      "caption": "Bruce Hurt's chart embedded across multiple 1 Samuel chapters on Precept Austin's commentary.",
      "thumb": "/visuals/1-samuel/precept_1samuelmapesv.jpg",
      "full": "/visuals/1-samuel/precept_1samuelmapesv.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/1samuelmapesv.jpg"
      }
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
      "id": "precept-ch-map_of_michmash_battle",
      "title": "Precept Austin — 1 Samuel Chapters 13–14",
      "caption": "Bruce Hurt's commentary chart for 1 Samuel chapters 13–14 — map of michmash battle.gif.",
      "thumb": "/visuals/1-samuel/precept_map_of_michmash_battle.gif",
      "full": "/visuals/1-samuel/precept_map_of_michmash_battle.gif",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/map%20of%20michmash%20battle.gif"
      },
      "chapters": [
        13,
        14
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
      "id": "precept-ch-samsonmap1",
      "title": "Precept Austin — 2 Kings Chapter 14",
      "caption": "Bruce Hurt's commentary chart for 2 Kings chapter 14 — samsonmap1.jpg.",
      "thumb": "/visuals/2-kings/precept_samsonmap1.jpg",
      "full": "/visuals/2-kings/precept_samsonmap1.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/samsonmap1.jpg"
      },
      "chapters": [
        14
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
      "id": "precept-ch-seirmap",
      "title": "Precept Austin — 2 Chronicles Chapter 25",
      "caption": "Bruce Hurt's commentary chart for 2 Chronicles chapter 25 — seirmap.jpg.",
      "thumb": "/visuals/2-chronicles/precept_seirmap.jpg",
      "full": "/visuals/2-chronicles/precept_seirmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/seirmap.jpg"
      },
      "chapters": [
        25
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
      "id": "precept-chart",
      "title": "Precept Austin — Ecclesiastes Chart",
      "caption": "Bruce Hurt's inductive-study chart for Ecclesiastes, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/ecclesiastes/precept_chart.png",
      "full": "/visuals/ecclesiastes/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/eccl.png"
      }
    },
    {
      "id": "precept-ch-eccl-chart",
      "title": "Precept Austin — Ecclesiastes Chapter 7",
      "caption": "Bruce Hurt's commentary chart for Ecclesiastes chapter 7 — eccl-chart.png.",
      "thumb": "/visuals/ecclesiastes/precept_eccl-chart.png",
      "full": "/visuals/ecclesiastes/precept_eccl-chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/eccl-chart.png"
      },
      "chapters": [
        7
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
      "id": "precept-chart",
      "title": "Precept Austin — Jeremiah Chart",
      "caption": "Bruce Hurt's inductive-study chart for Jeremiah, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/jeremiah/precept_chart.png",
      "full": "/visuals/jeremiah/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/jeremiahchart.png"
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
      "id": "precept-chart",
      "title": "Precept Austin — Zechariah Chart",
      "caption": "Bruce Hurt's inductive-study chart for Zechariah, mapping the book's flow, key themes, and turning points. Drawn from Precept Austin's free verse-by-verse commentary.",
      "thumb": "/visuals/zechariah/precept_chart.png",
      "full": "/visuals/zechariah/precept_chart.png",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/zechariah.png"
      }
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
      "id": "precept-ch-lukemap",
      "title": "Precept Austin — Luke Chapters 1, 10",
      "caption": "Bruce Hurt's commentary chart for Luke chapters 1, 10 — lukemap.jpg.",
      "thumb": "/visuals/luke/precept_lukemap.jpg",
      "full": "/visuals/luke/precept_lukemap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/lukemap.jpg"
      },
      "chapters": [
        1,
        10
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
      "id": "precept-ch-lukemap",
      "title": "Precept Austin — John Chapter 10",
      "caption": "Bruce Hurt's commentary chart for John chapter 10 — lukemap.jpg.",
      "thumb": "/visuals/john/precept_lukemap.jpg",
      "full": "/visuals/john/precept_lukemap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/lukemap.jpg"
      },
      "chapters": [
        10
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
      "id": "precept-ch-ephesus-maplarge",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — ephesus-maplarge.jpg.",
      "thumb": "/visuals/revelation/precept_ephesus-maplarge.jpg",
      "full": "/visuals/revelation/precept_ephesus-maplarge.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/ephesus-maplarge.jpg"
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
      "id": "precept-ch-rev_map",
      "title": "Precept Austin — Revelation Chapters 1–4",
      "caption": "Bruce Hurt's commentary chart for Revelation chapters 1–4 — rev_map.png.",
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
        2,
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
      "id": "precept-ch-revelationmap",
      "title": "Precept Austin — Revelation Chapter 1",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 1 — revelationmap.jpg.",
      "thumb": "/visuals/revelation/precept_revelationmap.jpg",
      "full": "/visuals/revelation/precept_revelationmap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/revelationmap.jpg"
      },
      "chapters": [
        1
      ]
    },
    {
      "id": "precept-ch-smyrnamap",
      "title": "Precept Austin — Revelation Chapter 2",
      "caption": "Bruce Hurt's commentary chart for Revelation chapter 2 — smyrnamap.jpg.",
      "thumb": "/visuals/revelation/precept_smyrnamap.jpg",
      "full": "/visuals/revelation/precept_smyrnamap.jpg",
      "attribution": {
        "label": "Precept Austin · Bruce Hurt",
        "href": "https://www.preceptaustin.org/"
      },
      "download": {
        "label": "Source image",
        "href": "https://www.preceptaustin.org/files/images/smyrnamap.jpg"
      },
      "chapters": [
        2
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
    }
  ]
},
};

export const BOOKS_WITH_VISUALS: Set<string> = new Set(
  Object.keys(VISUALS_REGISTRY),
);

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
