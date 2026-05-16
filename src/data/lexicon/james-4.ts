import { ChapterAlignment } from './types';
import { LEXICON } from './lemmas';

// ─────────────────────────────────────────────────────────────────────────
// James 4 — friendship with the world is enmity with God, grace to the
// humble, slander, "if the Lord wills." Surface forms against ESV.
// ─────────────────────────────────────────────────────────────────────────

const VERSES: ChapterAlignment['verses'] = {
  1: [
    { surface: 'wars', lemma: 'polemos', contextual:
      'James names the assembly\'s πόλεμοι and μάχαι — wars and fights. The military vocabulary is deliberate: low-grade interpersonal grievances are theaters of the same war between flesh and Spirit.' },
    { surface: 'fights', lemma: 'polemos' },
    { surface: 'quarrels', lemma: 'polemos' },
    { surface: 'passions', lemma: 'hedone', contextual:
      'ἡδοναί — pleasures, the warring soldiers inside the soul. The hēdonē-driven heart asks God to fund its own indulgence — and is shocked when God declines.' },
    { surface: 'pleasures', lemma: 'hedone', contextual:
      'ἡδοναί — pleasures, the warring soldiers inside the soul. The hēdonē-driven heart asks God to fund its own indulgence — and is shocked when God declines.' },
    { surface: 'lusts', lemma: 'hedone', contextual:
      'ἡδοναί — pleasures, the warring soldiers inside the soul. The hēdonē-driven heart asks God to fund its own indulgence — and is shocked when God declines.' },
  ],
  2: [
    { surface: 'ask', lemma: 'aiteo', contextual:
      'αἰτέω picks up the wisdom-asking theme of 1:5–8 and exposes its abuse: people don\'t have because they don\'t ask, or they ask with wrong motives.' },
  ],
  3: [
    { surface: 'ask', lemma: 'aiteo' },
    { surface: 'passions', lemma: 'hedone' },
    { surface: 'pleasures', lemma: 'hedone' },
    { surface: 'lusts', lemma: 'hedone' },
  ],
  4: [
    { surface: 'adulteresses', lemma: 'moichalis', contextual:
      'μοιχαλίδες — James uses the prophets\' shock-vocabulary (Hosea, Jer 3, Ezek 16): friendship with the world is covenantal adultery against the divine Husband.' },
    { surface: 'adulterous', lemma: 'moichalis' },
    { surface: 'friendship', lemma: 'philia', contextual:
      'φιλία in Hellenistic political vocabulary was treaty-language between states — a binding alliance, not mere affection. James 4:4 makes it an either/or treaty choice.' },
    { surface: 'world', lemma: 'kosmos', contextual:
      'κόσμος here is the fallen world-system in opposition to God — not creation, which God called good. The same word, different referent than Jn 3:16.' },
    { surface: 'enemy', lemma: 'echthra' },
    { surface: 'enmity', lemma: 'echthra' },
    { surface: 'hostility', lemma: 'echthra' },
  ],
  5: [
    { surface: 'spirit', lemma: 'pneuma', contextual:
      'James 4:5 is notoriously hard to translate: does the πνεῦμα God made dwell in us yearn jealously (the Spirit zealous for us) or enviously (the human spirit prone to envy)? Either reading expects divine πνεῦμα as the contested boundary.' },
    { surface: 'jealously', lemma: 'zelos' },
  ],
  6: [
    { surface: 'grace', lemma: 'charis', contextual:
      'χάρις is not abstract attitude — it is concrete divine giving in answer to a posture of need. The verse quotes Prov 3:34 (LXX): God gives greater grace.' },
    { surface: 'proud', lemma: 'huperephanos', contextual:
      'ὑπερήφανος literally means "showing oneself over." God\'s opposition is structural — the architecture of how grace flows. It flows downhill, away from the elevated self.' },
    { surface: 'opposes', lemma: 'antitasso', contextual:
      'Military metaphor: God ranges himself in battle array against the proud. God\'s opposition is not affective but structural.' },
    { surface: 'humble', lemma: 'tapeinos' },
  ],
  7: [
    { surface: 'Submit', lemma: 'hypotasso', contextual:
      'ὑποτάγητε — military vocabulary: place yourself in formation under your commander. The verse pairs this with ἀντίστητε to the devil: the two postures are faces of one allegiance.' },
    { surface: 'submit', lemma: 'hypotasso' },
    { surface: 'devil', lemma: 'diabolos', contextual:
      'διάβολος is Greek for "slanderer" — one who throws accusations between parties. James commands ἀντίστητε ("stand against"); the slanderer flees from the one who stands.' },
  ],
  8: [
    { surface: 'Draw near', lemma: 'engizo', contextual:
      'ἐγγίζω — covenantal approach. The pattern is OT cultic: the priest who drew near to the altar was the priest God drew near to.' },
    { surface: 'draw near', lemma: 'engizo' },
    { surface: 'sinners', lemma: 'hamartia' },
    { surface: 'double-minded', lemma: 'dipsychos', contextual:
      'δίψυχος returns from 1:8. James\'s coinage frames the entire problem: two-souled allegiance is the disease that the whole letter prescribes against.' },
  ],
  10: [
    { surface: 'Humble', lemma: 'tapeinos' },
    { surface: 'Lord', lemma: 'kyrios' },
  ],
  11: [
    { surface: 'speak evil', lemma: 'katalaleo', contextual:
      'James names καταλαλεῖν as judging the law itself. The slanderer sets himself above the law, taking the seat of the one Lawgiver who can save and destroy.' },
    { surface: 'speak against', lemma: 'katalaleo', contextual:
      'James names καταλαλεῖν as judging the law itself. The slanderer sets himself above the law, taking the seat of the one Lawgiver who can save and destroy.' },
    { surface: 'brethren', lemma: 'adelphos' },
    { surface: 'brothers', lemma: 'adelphos' },
    { surface: 'brother', lemma: 'adelphos' },
    { surface: 'law', lemma: 'nomos' },
  ],
  12: [
    { surface: 'lawgiver', lemma: 'nomos' },
    { surface: 'judge', lemma: 'krisis' },
  ],
  15: [
    { surface: 'Lord', lemma: 'kyrios', contextual:
      'The boasting of 4:13 assumes a tomorrow only the κύριος grants. James\'s "if the Lord wills" is not pious garnish — it is the actual ontology of every plan.' },
  ],
  17: [
    { surface: 'sin', lemma: 'hamartia' },
  ],
};

// James 4's spine: friendship with the κόσμος as covenant infidelity, the
// gospel center of "he gives more χάρις" to the humble, and the διψυχος
// disease returning from chapter 1 — diagnosis carried across the letter.
const THEME_LEMMAS = ['kosmos', 'charis', 'dipsychos'];

export const JAMES_4_ALIGNMENT: ChapterAlignment = {
  bookId: 59,
  book: 'James',
  chapter: 4,
  version: 'ESV',
  verses: VERSES,
  lexicon: LEXICON,
  themeLemmas: THEME_LEMMAS,
};
