import { ChapterAlignment } from './types';
import { LEXICON } from './lemmas';

// ─────────────────────────────────────────────────────────────────────────
// James 3 — the tongue, fire, the two wisdoms, harvest of righteousness.
// Surface forms authored against the ESV text.
// ─────────────────────────────────────────────────────────────────────────

const VERSES: ChapterAlignment['verses'] = {
  1: [
    { surface: 'brethren', lemma: 'adelphos' },
    { surface: 'brothers', lemma: 'adelphos' },
    { surface: 'judgment', lemma: 'krisis', contextual:
      'James warns the would-be teachers: their κρίσις will be stricter. Speech-based ministry magnifies both edification and accountability.' },
  ],
  2: [
    { surface: 'bridle', lemma: 'chalinagogeo', contextual:
      'χαλιναγωγέω — "bridle-lead." Both NT uses are James\'s (1:26; 3:2). The horse vocabulary that runs through the chapter (bit, rudder, tongue) starts here.' },
    { surface: 'body', lemma: 'soma' },
    { surface: 'perfect', lemma: 'teleios' },
  ],
  3: [
    { surface: 'body', lemma: 'soma' },
  ],
  5: [
    { surface: 'tongue', lemma: 'glossa', contextual:
      'γλῶσσα — physical tongue, but in James a metonymy for speech as a whole. Small, unruly, disproportionate in power.' },
    { surface: 'fire', lemma: 'pyr' },
  ],
  6: [
    { surface: 'tongue', lemma: 'glossa' },
    { surface: 'fire', lemma: 'pyr', contextual:
      'James 3:6 piles up fire-words: a small flame, a forest ablaze, a tongue ignited by hell. The image is not poetic excess — it is the social mathematics of gossip in a small assembly.' },
    { surface: 'body', lemma: 'soma' },
  ],
  8: [
    { surface: 'tongue', lemma: 'glossa' },
    { surface: 'death', lemma: 'thanatos' },
  ],
  9: [
    { surface: 'bless', lemma: 'eulogeo' },
    { surface: 'Lord', lemma: 'kyrios' },
    { surface: 'curse', lemma: 'katara' },
  ],
  10: [
    { surface: 'blessing', lemma: 'eulogeo', contextual:
      'James names the absurdity: with the same mouth we εὐλογέω the Father and καταρώμεθα those made in his image. Same organ, opposite directions — the contradiction is the indictment.' },
    { surface: 'cursing', lemma: 'katara' },
    { surface: 'brethren', lemma: 'adelphos' },
    { surface: 'brothers', lemma: 'adelphos' },
  ],
  12: [
    { surface: 'brethren', lemma: 'adelphos' },
    { surface: 'brothers', lemma: 'adelphos' },
  ],
  13: [
    { surface: 'wise', lemma: 'sophia' },
    { surface: 'wisdom', lemma: 'sophia' },
    { surface: 'meekness', lemma: 'prautes', contextual:
      'πραΰτητι σοφίας — "in the meekness of wisdom." Wisdom that is loud and self-promoting is not wisdom; it carries no πραΰτης, no power held in restraint.' },
  ],
  14: [
    { surface: 'jealousy', lemma: 'zelos', contextual:
      'Greek ζῆλος is morally ambiguous — the prophet\'s fire or the rival\'s acid. The qualifier "bitter" closes the ambiguity: this is the curdled kind.' },
    { surface: 'selfish ambition', lemma: 'eritheia', contextual:
      'ἐριθεία comes from ἔριθος ("hired worker") — Aristotle uses it of mercenary self-interest. James 3:14, 16 pairs it with ζῆλος as the engine of the false wisdom.' },
  ],
  15: [
    { surface: 'wisdom', lemma: 'sophia' },
    { surface: 'above', lemma: 'anothen', contextual:
      'ἄνωθεν — "from above." James 1:17, 3:15, 3:17 form a thread: ἄνωθεν is James\'s adverb for what comes from God\'s side of reality.' },
    { surface: 'earthly', lemma: 'epigeios', contextual:
      'ἐπίγειος locates this wisdom by altitude — it does not see beyond ground level. The first of three damning adjectives.' },
    { surface: 'unspiritual', lemma: 'psychikos', contextual:
      'ψυχικός is hard to translate: "soulish" is accurate but unfamiliar. Wisdom run on natural life-breath, not on Spirit. Second of the three.' },
    { surface: 'demonic', lemma: 'daimoniodes', contextual:
      'δαιμονιώδης — hapax in NT. The third descriptor of false wisdom: in the same family as demons.' },
  ],
  16: [
    { surface: 'jealousy', lemma: 'zelos' },
    { surface: 'selfish ambition', lemma: 'eritheia' },
    { surface: 'disorder', lemma: 'akatastasia', contextual:
      'ἀκαταστασία is cosmic disarray vocabulary — rivalry inside the assembly is not just bad manners, it is anti-creation.' },
  ],
  17: [
    { surface: 'wisdom', lemma: 'sophia' },
    { surface: 'above', lemma: 'anothen' },
    { surface: 'pure', lemma: 'hagnos', contextual:
      'ἁγνός has cultic edge: this wisdom is fit to come into God\'s presence, not merely well-mannered. First quality in James\'s seven-fold list.' },
    { surface: 'peaceable', lemma: 'eirenikos', contextual:
      'εἰρηνικός carries Hebrew שָׁלוֹם — not just absence of conflict but ordered wholeness. The second mark of wisdom from above.' },
  ],
  18: [
    { surface: 'fruit', lemma: 'karpos', contextual:
      'James names peace as the soil where righteousness is sown and harvested. The agricultural metaphor is precise: peace is not the fruit but the field.' },
    { surface: 'righteousness', lemma: 'dikaiosyne' },
  ],
};

// James 3's spine: the tongue (γλῶσσα — the chapter's central organ) and
// the diagnostic of which σοφία the heart belongs to (the two-wisdoms
// argument that follows the tongue-section).
const THEME_LEMMAS = ['glossa', 'sophia'];

export const JAMES_3_ALIGNMENT: ChapterAlignment = {
  bookId: 59,
  book: 'James',
  chapter: 3,
  version: 'ESV',
  verses: VERSES,
  lexicon: LEXICON,
  themeLemmas: THEME_LEMMAS,
};
