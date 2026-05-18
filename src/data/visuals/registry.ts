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
      "title": "Chuck Swindoll — Structural Chart",
      "caption": "Divides James into major sections, anchoring each with theme and key verse. From Insight for Living's free Bible charts.",
      "thumb": "/visuals/james/swindoll_james_chart.png",
      "full": "/visuals/james/swindoll_james_chart.png",
      "attribution": {
        "label": "Insight for Living Ministries",
        "href": "https://insight.org/resources/bible/the-general-epistles/james"
      },
      "download": {
        "label": "Original PDF",
        "href": "https://cdn.iflmedia.com/pdf/bible-charts/James-Bible-chart.pdf"
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
