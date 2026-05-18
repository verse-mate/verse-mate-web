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
