/* eslint-disable */
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

export type VisualCard = {
  id: string;
  title: string;
  caption: string;
  thumb: string;
  full: string;
  attribution: { label: string; href: string };
  download?: { label: string; href: string };
};

export type VisualsManifest = {
  video: {
    youtubeId: string;
    title: string;
    duration?: string;
    embedUrl: string;
    page: string;
  } | null;
  cards: VisualCard[];
};

export const VISUALS_REGISTRY: Record<string, VisualsManifest> = {
  'genesis': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Genesis",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Genesis. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/genesis/versemate_keyword_heatmap.png",
      "full": "/visuals/genesis/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'exodus': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Exodus",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Exodus. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/exodus/versemate_keyword_heatmap.png",
      "full": "/visuals/exodus/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'leviticus': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Leviticus",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Leviticus. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/leviticus/versemate_keyword_heatmap.png",
      "full": "/visuals/leviticus/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'numbers': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Numbers",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Numbers. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/numbers/versemate_keyword_heatmap.png",
      "full": "/visuals/numbers/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'deuteronomy': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Deuteronomy",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Deuteronomy. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/deuteronomy/versemate_keyword_heatmap.png",
      "full": "/visuals/deuteronomy/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'joshua': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Joshua",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Joshua. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/joshua/versemate_keyword_heatmap.png",
      "full": "/visuals/joshua/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'judges': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Judges",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Judges. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/judges/versemate_keyword_heatmap.png",
      "full": "/visuals/judges/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'ruth': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Ruth",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Ruth. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/ruth/versemate_keyword_heatmap.png",
      "full": "/visuals/ruth/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  '1-samuel': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of 1 Samuel",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across 1 Samuel. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/1-samuel/versemate_keyword_heatmap.png",
      "full": "/visuals/1-samuel/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  '2-samuel': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of 2 Samuel",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across 2 Samuel. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/2-samuel/versemate_keyword_heatmap.png",
      "full": "/visuals/2-samuel/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  '1-kings': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of 1 Kings",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across 1 Kings. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/1-kings/versemate_keyword_heatmap.png",
      "full": "/visuals/1-kings/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  '2-kings': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of 2 Kings",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across 2 Kings. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/2-kings/versemate_keyword_heatmap.png",
      "full": "/visuals/2-kings/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  '1-chronicles': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of 1 Chronicles",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across 1 Chronicles. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/1-chronicles/versemate_keyword_heatmap.png",
      "full": "/visuals/1-chronicles/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  '2-chronicles': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of 2 Chronicles",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across 2 Chronicles. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/2-chronicles/versemate_keyword_heatmap.png",
      "full": "/visuals/2-chronicles/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'ezra': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Ezra",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Ezra. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/ezra/versemate_keyword_heatmap.png",
      "full": "/visuals/ezra/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'nehemiah': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Nehemiah",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Nehemiah. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/nehemiah/versemate_keyword_heatmap.png",
      "full": "/visuals/nehemiah/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'esther': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Esther",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Esther. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/esther/versemate_keyword_heatmap.png",
      "full": "/visuals/esther/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'job': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Job",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Job. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/job/versemate_keyword_heatmap.png",
      "full": "/visuals/job/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'psalms': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Psalms",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Psalms. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/psalms/versemate_keyword_heatmap.png",
      "full": "/visuals/psalms/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'proverbs': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Proverbs",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Proverbs. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/proverbs/versemate_keyword_heatmap.png",
      "full": "/visuals/proverbs/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'ecclesiastes': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Ecclesiastes",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Ecclesiastes. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/ecclesiastes/versemate_keyword_heatmap.png",
      "full": "/visuals/ecclesiastes/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'song-of-solomon': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Song of Songs",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Song of Songs. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/song-of-solomon/versemate_keyword_heatmap.png",
      "full": "/visuals/song-of-solomon/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'isaiah': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Isaiah",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Isaiah. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/isaiah/versemate_keyword_heatmap.png",
      "full": "/visuals/isaiah/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'jeremiah': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Jeremiah",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Jeremiah. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/jeremiah/versemate_keyword_heatmap.png",
      "full": "/visuals/jeremiah/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'lamentations': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Lamentations",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Lamentations. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/lamentations/versemate_keyword_heatmap.png",
      "full": "/visuals/lamentations/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'ezekiel': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Ezekiel",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Ezekiel. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/ezekiel/versemate_keyword_heatmap.png",
      "full": "/visuals/ezekiel/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'daniel': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Daniel",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Daniel. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/daniel/versemate_keyword_heatmap.png",
      "full": "/visuals/daniel/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'hosea': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Hosea",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Hosea. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/hosea/versemate_keyword_heatmap.png",
      "full": "/visuals/hosea/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'joel': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Joel",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Joel. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/joel/versemate_keyword_heatmap.png",
      "full": "/visuals/joel/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'amos': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Amos",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Amos. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/amos/versemate_keyword_heatmap.png",
      "full": "/visuals/amos/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'obadiah': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Obadiah",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Obadiah. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/obadiah/versemate_keyword_heatmap.png",
      "full": "/visuals/obadiah/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'jonah': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Jonah",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Jonah. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/jonah/versemate_keyword_heatmap.png",
      "full": "/visuals/jonah/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'micah': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Micah",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Micah. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/micah/versemate_keyword_heatmap.png",
      "full": "/visuals/micah/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'nahum': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Nahum",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Nahum. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/nahum/versemate_keyword_heatmap.png",
      "full": "/visuals/nahum/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'habakkuk': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Habakkuk",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Habakkuk. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/habakkuk/versemate_keyword_heatmap.png",
      "full": "/visuals/habakkuk/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'zephaniah': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Zephaniah",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Zephaniah. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/zephaniah/versemate_keyword_heatmap.png",
      "full": "/visuals/zephaniah/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'haggai': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Haggai",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Haggai. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/haggai/versemate_keyword_heatmap.png",
      "full": "/visuals/haggai/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'zechariah': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Zechariah",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Zechariah. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/zechariah/versemate_keyword_heatmap.png",
      "full": "/visuals/zechariah/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'malachi': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Malachi",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Malachi. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/malachi/versemate_keyword_heatmap.png",
      "full": "/visuals/malachi/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'matthew': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Matthew",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Matthew. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/matthew/versemate_keyword_heatmap.png",
      "full": "/visuals/matthew/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'mark': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Mark",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Mark. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/mark/versemate_keyword_heatmap.png",
      "full": "/visuals/mark/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'luke': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Luke",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Luke. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/luke/versemate_keyword_heatmap.png",
      "full": "/visuals/luke/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'john': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of John",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across John. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/john/versemate_keyword_heatmap.png",
      "full": "/visuals/john/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'acts': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Acts",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Acts. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/acts/versemate_keyword_heatmap.png",
      "full": "/visuals/acts/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'romans': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Romans",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Romans. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/romans/versemate_keyword_heatmap.png",
      "full": "/visuals/romans/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  '1-corinthians': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of 1 Corinthians",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across 1 Corinthians. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/1-corinthians/versemate_keyword_heatmap.png",
      "full": "/visuals/1-corinthians/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  '2-corinthians': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of 2 Corinthians",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across 2 Corinthians. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/2-corinthians/versemate_keyword_heatmap.png",
      "full": "/visuals/2-corinthians/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'galatians': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Galatians",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Galatians. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/galatians/versemate_keyword_heatmap.png",
      "full": "/visuals/galatians/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'ephesians': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Ephesians",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Ephesians. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/ephesians/versemate_keyword_heatmap.png",
      "full": "/visuals/ephesians/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'philippians': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Philippians",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Philippians. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/philippians/versemate_keyword_heatmap.png",
      "full": "/visuals/philippians/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'colossians': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Colossians",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Colossians. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/colossians/versemate_keyword_heatmap.png",
      "full": "/visuals/colossians/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  '1-thessalonians': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of 1 Thessalonians",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across 1 Thessalonians. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/1-thessalonians/versemate_keyword_heatmap.png",
      "full": "/visuals/1-thessalonians/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  '2-thessalonians': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of 2 Thessalonians",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across 2 Thessalonians. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/2-thessalonians/versemate_keyword_heatmap.png",
      "full": "/visuals/2-thessalonians/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  '1-timothy': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of 1 Timothy",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across 1 Timothy. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/1-timothy/versemate_keyword_heatmap.png",
      "full": "/visuals/1-timothy/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  '2-timothy': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of 2 Timothy",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across 2 Timothy. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/2-timothy/versemate_keyword_heatmap.png",
      "full": "/visuals/2-timothy/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'titus': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Titus",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Titus. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/titus/versemate_keyword_heatmap.png",
      "full": "/visuals/titus/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'philemon': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Philemon",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Philemon. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/philemon/versemate_keyword_heatmap.png",
      "full": "/visuals/philemon/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'hebrews': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Hebrews",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Hebrews. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/hebrews/versemate_keyword_heatmap.png",
      "full": "/visuals/hebrews/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'james': {
  "video": {
    "youtubeId": "qn-hLHWwRYY",
    "title": "Book of James — Overview",
    "duration": "",
    "embedUrl": "https://www.youtube-nocookie.com/embed/qn-hLHWwRYY?autoplay=1&rel=0&modestbranding=1",
    "page": "https://bibleproject.com/videos/james/"
  },
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
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across James. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/james/versemate_james_keyword_heatmap.png",
      "full": "/visuals/james/versemate_james_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  '1-peter': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of 1 Peter",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across 1 Peter. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/1-peter/versemate_keyword_heatmap.png",
      "full": "/visuals/1-peter/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  '2-peter': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of 2 Peter",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across 2 Peter. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/2-peter/versemate_keyword_heatmap.png",
      "full": "/visuals/2-peter/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  '1-john': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of 1 John",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across 1 John. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/1-john/versemate_keyword_heatmap.png",
      "full": "/visuals/1-john/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  '2-john': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of 2 John",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across 2 John. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/2-john/versemate_keyword_heatmap.png",
      "full": "/visuals/2-john/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  '3-john': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of 3 John",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across 3 John. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/3-john/versemate_keyword_heatmap.png",
      "full": "/visuals/3-john/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'jude': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Jude",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Jude. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/jude/versemate_keyword_heatmap.png",
      "full": "/visuals/jude/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
      }
    }
  ]
},
  'revelation': {
  "video": null,
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
      "id": "vm-heatmap",
      "title": "VerseMate Original — Architecture of Revelation",
      "caption": "Dot-matrix heatmap showing where the four most frequent key words cluster across Revelation. Auto-generated from the Greek/Hebrew lexicon.",
      "thumb": "/visuals/revelation/versemate_keyword_heatmap.png",
      "full": "/visuals/revelation/versemate_keyword_heatmap.png",
      "attribution": {
        "label": "VerseMate Original",
        "href": "#"
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
